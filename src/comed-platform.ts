/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-platform.ts: homebridge-comed-hourly platform class.
 */
import { ALPNProtocol, AbortError, FetchError, Request, RequestOptions, Response, context, timeoutSignal } from "@adobe/fetch";
import { API, APIEvent, DynamicPlatformPlugin, HAP, Logging, PlatformAccessory, PlatformConfig } from "homebridge";
import { COMED_HOURLY_API_TIMEOUT, COMED_HOURLY_MQTT_TOPIC, PLATFORM_NAME, PLUGIN_NAME  } from "./settings.js";
import { ComEdHourlyOptions, featureOptionCategories, featureOptions } from "./comed-options.js";
import { FeatureOptions, Nullable } from "homebridge-plugin-utils";
import { ComEdHourlyLightSensor } from "./comed-lightsensor.js";
import { MqttClient } from "homebridge-plugin-utils";
import util from "node:util";

export class ComEdHourlyPlatform implements DynamicPlatformPlugin {

  private readonly accessories: PlatformAccessory[];
  public readonly api: API;
  public readonly featureOptions: FeatureOptions;
  public config!: ComEdHourlyOptions;
  public readonly configuredDevices: { [index: string]: ComEdHourlyLightSensor };
  private fetch: (url: string | Request, options?: RequestOptions) => Promise<Response>;
  public readonly hap: HAP;
  public readonly log: Logging;
  public readonly mqtt: Nullable<MqttClient>;

  constructor(log: Logging, config: PlatformConfig, api: API) {

    this.accessories = [];
    this.api = api;
    this.configuredDevices = {};
    this.featureOptions = new FeatureOptions(featureOptionCategories, featureOptions, config?.options ?? []);
    this.fetch = context({ alpnProtocols: [ALPNProtocol.ALPN_HTTP2], rejectUnauthorized: false, userAgent: "homebridge-comed-hourlypricing" }).fetch;
    this.hap = api.hap;
    this.log = log;
    this.log.debug = this.debug.bind(this);
    this.mqtt = null;

    // We can't start without being configured.
    if(!config) {

      return;
    }

    this.config = {

      debug: config.debug === true,
      mqttTopic: (config.mqttTopic as string) ?? COMED_HOURLY_MQTT_TOPIC,
      mqttUrl: config.mqttUrl as string,
      options: config.options as string[]
    };

    // Initialize MQTT, if needed.
    if(this.config.mqttUrl) {

      this.mqtt = new MqttClient(this.config.mqttUrl, this.config.mqttTopic, this.log);
    }

    // Inform the user.
    this.log.info("The current five-minute average price for ComEd's Hourly Pricing program will be shown as an ambient light sensor, with the light value containing" +
      " the current price.");

    this.log.debug("Debug logging on. Expect a lot of data.");

    // Fire up the ComEd Hourly Pricing API once Homebridge has loaded all the cached accessories it knows about and called configureAccessory() on each.
    api.on(APIEvent.DID_FINISH_LAUNCHING, () => this.configureComEdHourly());
  }

  // This gets called when homebridge restores cached accessories at startup. We intentionally avoid doing anything significant here.
  public configureAccessory(accessory: PlatformAccessory): void {

    // Add this to the accessory array so we can track it.
    this.accessories.push(accessory);
  }

  // Configure a discovered irrigation controller.
  private configureComEdHourly(): void {

    // Generate a unique identifier for the Hourly Pricing API.
    const uuid = this.hap.uuid.generate(PLATFORM_NAME + "." + "currenthouraverage");

    // See if we already know about this accessory or if it's truly new.
    let accessory = this.accessories.find(x => x.UUID === uuid);

    // If we've already configured this device before, we're done.
    if(this.configuredDevices[uuid]) {

      return;
    }

    // It's a new device - let's add it to HomeKit.
    if(!accessory) {

      accessory = new this.api.platformAccessory("ComEd Current Hour Average Price", uuid);

      // Register this accessory with Homebridge and add it to the accessory array so we can track it.
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      this.accessories.push(accessory);
    }

    // Add it to our list of configured devices.
    this.configuredDevices[uuid] = new ComEdHourlyLightSensor(this, accessory);

    // Refresh the accessory cache.
    this.api.updatePlatformAccessories([accessory]);

    return;
  }

  // Remove the accessory from HomeKit.
  private removeAccessory(accessory: PlatformAccessory): void {

    // Inform the user.
    this.log.info("%s: Removing device from HomeKit.", accessory.displayName);

    // Unregister the accessory and delete it's remnants from HomeKit.
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [ accessory ]);
    this.accessories.splice(this.accessories.indexOf(accessory), 1);
    this.api.updatePlatformAccessories(this.accessories);
  }

  // Communicate HTTP requests with the ComEd Hourly Pricing API.
  public async retrieve(params: Record<string, string>, isRetry = false): Promise<Nullable<Response>> {

    // Catch potential server-side issues:
    //
    // 400: Bad request.
    // 404: Not found.
    // 429: Too many requests.
    // 500: Internal server error.
    // 502: Bad gateway.
    // 503: Service temporarily unavailable.
    const isServerSideIssue = (code: number): boolean => [400, 404, 429, 500, 502, 503].includes(code);

    let response: Response;

    // Create a signal handler to deliver the abort operation.
    const signal = timeoutSignal(COMED_HOURLY_API_TIMEOUT * 1000);

    const queryParams = new URLSearchParams(params);

    // Construct our API call.
    const url = "https://hourlypricing.comed.com/api" + "?" + queryParams.toString();

    try {

      // Execute the API call.
      response = await this.fetch(url, { signal: signal });

      // Some other unknown error occurred.
      if(!response.ok) {

        this.log.error(isServerSideIssue(response.status) ? "ComEd Hourly Pricing API is temporarily unavailable." :
          response.status.toString() + ": " + await response.text());

        return null;
      }

      return response;
    } catch(error) {

      if(error instanceof AbortError) {

        this.log.error("The ComEd Hourly Pricing API is taking too long to respond to a request. This error can usually be safely ignored.");
        this.log.debug("Original request was: %s", url);

        return null;
      }

      if(error instanceof FetchError) {

        switch(error.code) {

          case "ECONNREFUSED":
          case "ERR_HTTP2_STREAM_CANCEL":

            this.log.error("Connection refused.");

            break;

          case "ECONNRESET":
          case "ERR_HTTP2_STREAM_ERROR":

            // Retry on connection reset, but no more than once.
            if(!isRetry) {

              return this.retrieve(params, true);
            }

            this.log.error("Network connection to the ComEd Hourly Pricing API has been reset.");

            break;

          default:

            this.log.error("Error: %s - %s.", error.code, error.message);

            break;
        }
      }

      return null;
    } finally {

      // Clear out our response timeout if needed.
      signal.clear();
    }
  }

  // Utility for debug logging.
  public debug(message: string, ...parameters: unknown[]): void {

    if(this.config.debug) {

      this.log.error(util.format(message, ...parameters));
    }
  }
}
