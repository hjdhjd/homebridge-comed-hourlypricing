/* Copyright(C) 2017-2024, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-lightsensor.ts: ComEd Hourly Pricing light sensor.
 */
import { API, HAP, PlatformAccessory } from "homebridge";
import { COMED_HOURLY_API_JITTER, COMED_HOURLY_API_POLLING_INTERVAL, COMED_HOURLY_API_RETRY_INTERVAL } from "./settings.js";
import { HomebridgePluginLogging, acquireService, retry, sleep } from "homebridge-plugin-utils";
import { ComEdHourlyOptions } from "./comed-options.js";
import { ComEdHourlyPlatform } from "./comed-platform.js";
import { ComEdHourlyPricing } from "./comed-types.js";
import util from "node:util";

const COMED_HOURLY_SERIAL = "Current Hour Average";

// Device-specific options and settings.
interface ComEdHourlyHints {

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

    this.configureDevice();
  }

  // Configure an ambient light sensor accessory for HomeKit.
  private configureDevice(): void {

    // Clean out the context object.
    this.accessory.context = {};

    // Configure ourselves.
    this.configureHints();
    this.configureInfo();
    this.configureLightSensor();
    this.configureMqtt();

    // Kickoff our state updates.
    void this.updateState();
  }

  // Configure controller-specific settings.
  private configureHints(): boolean {

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
    const service = acquireService(this.hap, this.accessory, this.hap.Service.LightSensor, this.name);

    if(!service) {

      this.log.error("Unable to add the light sensor.");

      return false;
    }

    // Initialize the service.
    service.updateCharacteristic(this.hap.Characteristic.Active, this.hap.Characteristic.Active.ACTIVE);

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

      // Update our sensor with the new price.
      this.accessory.getService(this.hap.Service.LightSensor)?.updateCharacteristic(this.hap.Characteristic.CurrentAmbientLightLevel, value);

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
  private async getPrice(): Promise<boolean> {

    // Get the current hourly price.
    const response = await this.platform.retrieve({ type: "currenthouraverage" });

    // Not found, let's retry again.
    if(!response) {

      return false;
    }

    try {

      this.status = (await response.json() as ComEdHourlyPricing[])[0];

      this.log.debug("Status updated.");
      this.log.debug(util.inspect(this.status, { colors: true, sorted: true }));
    } catch(error) {

      this.log.error("Unable to retrieve the current ComEd hourly price: %s", util.inspect(error, { colors: true, sorted: true }));
    }

    return true;
  }

  // Utility for checking feature options on a device.
  private hasFeature(option: string): boolean {

    return this.platform.featureOptions.test(option);
  }

  // Utility to return our status as a JSON for MQTT.
  private get statusJson(): string {

    return JSON.stringify(this.status);
  }

  // Utility function to return the name of this accessory.
  private get name(): string {

    const name = this.accessory.getService(this.hap.Service.LightSensor)?.getCharacteristic(this.hap.Characteristic.Name).value as string;

    // If we don't have a name for the sensor, return a sane default.
    return name?.length ? name : "ComEd Current Hour Average Price";
  }
}
