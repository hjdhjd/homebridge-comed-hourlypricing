/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-lightsensor.ts: ComEd Hourly Pricing light sensor.
 */
import type { API, HAP, PlatformAccessory } from "homebridge";
import { COMED_HOURLY_API_JITTER, COMED_HOURLY_API_POLLING_INTERVAL, COMED_HOURLY_API_RETRY_INTERVAL, COMED_HOURLY_HIGH_PRICE_THESHOLD } from "./settings.js";
import { type ComEdHourlyPricing, ComEdReservedNames } from "./comed-types.js";
import { type HomebridgePluginLogging, type Nullable, acquireService, retry, sleep, validService } from "homebridge-plugin-utils";
import type { ComEdHourlyOptions } from "./comed-options.js";
import type { ComEdHourlyPlatform } from "./comed-platform.js";
import util from "node:util";

const COMED_HOURLY_SERIAL = "Current Hour Average";

// Device-specific options and settings.
interface ComEdHourlyHints {

  automationSensor: boolean,
  automationThreshold: number,
  log: boolean
}

export class ComEdHourlyLightSensor {

  private readonly accessory: PlatformAccessory;
  private readonly api: API;
  private readonly config: ComEdHourlyOptions;
  private readonly hap: HAP;
  private readonly hints: ComEdHourlyHints;
  public readonly log: HomebridgePluginLogging;
  private readonly platform: ComEdHourlyPlatform;
  private status: ComEdHourlyPricing;

  // The constructor initializes key variables and calls configureDevice().
  constructor(platform: ComEdHourlyPlatform, accessory: PlatformAccessory) {

    this.accessory = accessory;
    this.api = platform.api;
    this.config = platform.config;
    this.hap = this.api.hap;
    this.hints = {} as ComEdHourlyHints;
    this.platform = platform;
    this.status = {} as ComEdHourlyPricing;

    this.log = {

      debug: (message: string, ...parameters: unknown[]): void => platform.debug(util.format(this.name + ": " + message, ...parameters)),
      error: (message: string, ...parameters: unknown[]): void => platform.log.error(util.format(this.name + ": " + message, ...parameters)),
      info: (message: string, ...parameters: unknown[]): void => platform.log.info(util.format(this.name + ": " + message, ...parameters)),
      warn: (message: string, ...parameters: unknown[]): void => platform.log.warn(util.format(this.name + ": " + message, ...parameters))
    };

    void this.configureDevice();
  }

  // Configure an ambient light sensor accessory for HomeKit.
  private async configureDevice(): Promise<void> {

    // Clean out the context object.
    this.accessory.context = {};

    // Initialize our price.
    await this.getPrice();

    // Configure ourselves.
    this.configureHints();
    this.configureInfo();
    this.configureLightSensor();
    this.configureAutomationSensor();
    this.configureMqtt();

    // Kickoff our state updates.
    void this.updateState();
  }

  // Configure controller-specific settings.
  private configureHints(): boolean {

    this.hints.automationSensor = this.hasFeature("Automation.Sensor.High");
    this.hints.automationThreshold = this.getFeatureFloat("Automation.Sensor.High.Threshold") ?? COMED_HOURLY_HIGH_PRICE_THESHOLD;
    this.hints.log = this.hasFeature("Log.API");

    return true;
  }

  // Configure the sensor information for HomeKit.
  private configureInfo(): boolean {

    // Update the manufacturer information for this controller.
    this.accessory.getService(this.hap.Service.AccessoryInformation)?.updateCharacteristic(this.hap.Characteristic.Manufacturer, "ComEd");

    // Update the model information for this controller.
    this.accessory.getService(this.hap.Service.AccessoryInformation)?.updateCharacteristic(this.hap.Characteristic.Model, "Hourly Pricing");

    // Update the serial number for this controller.
    this.accessory.getService(this.hap.Service.AccessoryInformation)?.updateCharacteristic(this.hap.Characteristic.SerialNumber, COMED_HOURLY_SERIAL);

    return true;
  }

  // Configure MQTT services.
  private configureMqtt(): boolean {

    // Return our irrigation controller state.
    this.platform.mqtt?.subscribeGet(COMED_HOURLY_SERIAL, "price", "Hourly price", () => {

      return this.statusJson;
    }, this.log);

    return true;
  }

  // Configure the light sensor service for HomeKit.
  private configureLightSensor(): boolean {

    // Acquire the service.
    const service = acquireService(this.accessory, this.hap.Service.LightSensor, this.name);

    if(!service) {

      this.log.error("Unable to add the light sensor.");

      return false;
    }

    // Initialize the service.
    service.updateCharacteristic(this.hap.Characteristic.Active, this.hap.Characteristic.Active.ACTIVE);

    return true;
  }

  // Configure a contact sensor to automate high electricity price triggers.
  private configureAutomationSensor(): boolean {

    // Validate whether we should have this service enabled.
    if(!validService(this.accessory, this.hap.Service.ContactSensor, () => {

      // Have we disabled the automation contact sensor?
      if(!this.hints.automationSensor) {

        return false;
      }

      return true;
    }, ComEdReservedNames.CONTACT_SENSOR_PRICE_HIGH_AUTOMATION)) {

      return false;
    }

    // Acquire the service.
    const service = acquireService(this.accessory, this.hap.Service.ContactSensor, this.name + " High",
      ComEdReservedNames.CONTACT_SENSOR_PRICE_HIGH_AUTOMATION);

    if(!service) {

      this.log.error("Unable to add the high price automation contact sensor.");

      return false;
    }

    // Return the current state of the price. We're on if we are over our configured price threshold.
    service.getCharacteristic(this.hap.Characteristic.ContactSensorState).onGet(() => this.isPriceHigh);

    // Initialize the contact sensor.
    service.updateCharacteristic(this.hap.Characteristic.ContactSensorState, this.isPriceHigh);

    // Inform the user.
    this.log.info("Enabling the high price automation contact sensor with a threshold of %s¢.", this.hints.automationThreshold.toFixed(2));

    return true;
  }

  // Update the HomeKit light sensor state with the current price from the ComEd Hourly Pricing API.
  private async updateState(): Promise<void> {

    // We loop forever, updating our irrigation system state at regular intervals.
    for(;;) {

      // Update our status. If it's our first run through, we use our internal defaults.
      // eslint-disable-next-line no-await-in-loop
      await retry(async () => this.getPrice(), COMED_HOURLY_API_RETRY_INTERVAL * 1000);

      let value = parseFloat(this.status.price);

      // Test for NaN or negative values.
      if((value < 0.0001) || (value !== value)) {

        value = 0.0001;
      }

      // Update with the new price.
      this.accessory.getService(this.hap.Service.LightSensor)?.updateCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel, value);
      this.accessory.getServiceById(this.hap.Service.ContactSensor, ComEdReservedNames.CONTACT_SENSOR_PRICE_HIGH_AUTOMATION)
        ?.updateCharacteristic(this.hap.Characteristic.ContactSensorState, this.isPriceHigh);

      // Publish our status to MQTT if configured to do so.
      this.platform.mqtt?.publish(COMED_HOURLY_SERIAL, "price", this.statusJson);

      if(this.hints.log) {

        this.log.info("Current price: %s", this.status.price);
      }

      // Sleep until our next polling interval.
      // eslint-disable-next-line no-await-in-loop
      await sleep((COMED_HOURLY_API_POLLING_INTERVAL + COMED_HOURLY_API_JITTER) * 1000);
    }
  }

  // Retrieve the current price from the ComEd Hourly Pricing API.
  private async getPrice(isRetry = false): Promise<boolean> {

    // Get the current hourly price.
    const response = await this.platform.retrieve({ type: "currenthouraverage" });

    // Not found, we're done.
    if(!response) {

      return false;
    }

    try {

      this.status = (await response.body.json() as ComEdHourlyPricing[])[0];

      this.log.debug("Status updated.");
      this.log.debug(util.inspect(this.status, { colors: true, sorted: true }));
    } catch(error) {

      if(error instanceof SyntaxError) {

        this.log.error("Received invalid data from the ComEd Hourly Pricing API. Will retry shortly.");

        if(!isRetry) {

          return this.getPrice(true);
        }
      } else {

        this.log.error("Unable to retrieve the current ComEd hourly price: %s", util.inspect(error, { colors: true, depth: null, sorted: true }));
      }
    }

    return true;
  }

  // Utility function to return a floating point configuration parameter on a device.
  public getFeatureFloat(option: string): Nullable<number | undefined> {

    return this.platform.featureOptions.getFloat(option);
  }

  // Utility for checking feature options on a device.
  private hasFeature(option: string): boolean {

    return this.platform.featureOptions.test(option);
  }

  // Utility to return whether we're over our high price threshold.
  private get isPriceHigh(): boolean {

    // Convert the price from a string to a number.
    const value = parseFloat(this.status.price);

    // Address NaN - we assume the price is low.
    if(value !== value) {

      return false;
    }

    // Compare and return.
    return value > this.hints.automationThreshold;
  }

  // Utility to return our status as a JSON for MQTT.
  private get statusJson(): string {

    return JSON.stringify(this.status);
  }

  // Utility function to return the name of this accessory.
  private get name(): string {

    const name = this.accessory.getService(this.hap.Service.LightSensor)?.getCharacteristic(this.hap.Characteristic.Name).value as string | undefined;

    // If we don't have a name for the sensor, return a sane default.
    return name?.length ? name : "ComEd Electricity Price";
  }
}
