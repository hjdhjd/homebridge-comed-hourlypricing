/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-platform.ts: homebridge-comed-hourly platform class.
 */
import type { API, DynamicPlatformPlugin, HAP, Logging, PlatformAccessory, PlatformConfig } from "homebridge";
import { COMED_HOURLY_API_TIMEOUT, COMED_HOURLY_MQTT_TOPIC, PLATFORM_NAME, PLUGIN_NAME  } from "./settings.js";
import { type ComEdHourlyOptions, featureOptionCategories, featureOptions } from "./comed-options.js";
import { type Dispatcher, Pool, errors, interceptors, request, setGlobalDispatcher } from "undici";
import { FeatureOptions, type Nullable } from "homebridge-plugin-utils";
import { APIEvent } from "homebridge";
import { ComEdHourlyLightSensor } from "./comed-lightsensor.js";
import { MqttClient } from "homebridge-plugin-utils";
import { STATUS_CODES } from "node:http";
import util from "node:util";

export class ComEdHourlyPlatform implements DynamicPlatformPlugin {

  private readonly accessories: PlatformAccessory[];
  public readonly api: API;
  public readonly featureOptions: FeatureOptions;
  public config!: ComEdHourlyOptions;
  public readonly configuredDevices: { [index: string]: ComEdHourlyLightSensor | undefined };
  public readonly hap: HAP;
  public readonly log: Logging;
  public readonly mqtt: Nullable<MqttClient>;

  constructor(log: Logging, config: PlatformConfig | undefined, api: API) {

    this.accessories = [];
    this.api = api;
    this.configuredDevices = {};
    this.featureOptions = new FeatureOptions(featureOptionCategories, featureOptions, config?.options ?? []);
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
      mqttTopic: config.mqttTopic ?? COMED_HOURLY_MQTT_TOPIC,
      mqttUrl: config.mqttUrl,
      options: config.options ?? []
    };

    // Create an interceptor that allows us to set the user agent to our liking.
    const ua: Dispatcher.DispatcherComposeInterceptor = (dispatch) => (opts: Dispatcher.DispatchOptions, handler: Dispatcher.DispatchHandler) => {

      opts.headers ??= {};
      (opts.headers as Record<string, string>)["user-agent"] = "homebridge-comed-hourlypricing";

      return dispatch(opts, handler);
    };

    // We want to enable the use of HTTP/2, accept unauthorized SSL certificates and retry a request up to three times.
    setGlobalDispatcher(new Pool("https://hourlypricing.comed.com", { allowH2: true, clientTtl: 60 * 1000, connect: { rejectUnauthorized: false }, connections: 1 })
      .compose(ua, interceptors.retry({ maxRetries: 3, maxTimeout: 5000, minTimeout: 1000, statusCodes: [ 400, 404, 429, 500, 502, 503, 504 ], timeoutFactor: 2 })));

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
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.accessories.splice(this.accessories.indexOf(accessory), 1);
    this.api.updatePlatformAccessories(this.accessories);
  }

  // Communicate HTTP requests with the ComEd Hourly Pricing API.
  public async retrieve(params: Record<string, string>): Promise<Nullable<Dispatcher.ResponseData<unknown>>> {

    // Catch potential server-side issues:
    //
    // 400: Bad request.
    // 404: Not found.
    // 429: Too many requests.
    // 500: Internal server error.
    // 502: Bad gateway.
    // 503: Service temporarily unavailable.
    const serverErrors = new Set([ 400, 404, 429, 500, 502, 503 ]);

    let response: Dispatcher.ResponseData<unknown>;

    // Create a signal handler to deliver the abort operation.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COMED_HOURLY_API_TIMEOUT * 1000);
    const signal = controller.signal;

    const queryParams = new URLSearchParams(params);

    // Construct our API call.
    const url = "https://hourlypricing.comed.com/api" + "?" + queryParams.toString();

    try {

      // Execute the API call.
      response = await request(url, { signal: signal });

      // Some other unknown error occurred.
      if(!(response.statusCode >= 200) && (response.statusCode < 300)) {

        this.log.error(serverErrors.has(response.statusCode) ? "ComEd Hourly Pricing API is temporarily unavailable." : response.statusCode.toString() + ": " +
          STATUS_CODES[response.statusCode]);

        return null;
      }

      return response;
    } catch(error) {

      // We aborted the connection.
      if((error instanceof DOMException) && (error.name === "AbortError")) {

        this.log.error("The ComEd Hourly Pricing API is taking too long to respond to a request. This error can usually be safely ignored.");
        this.log.debug("Original request was: %s", url);

        return null;
      }

      // Connection timed out.
      if(error instanceof errors.ConnectTimeoutError) {

        this.log.error("Connection timed out.");

        return null;
      }

      // We destroyed the pool due to a reset event and our inflight connections are failing.
      if(error instanceof errors.RequestRetryError) {

        this.log.error("Unable to connect to the ComEd Hourly Pricing API. This is usually temporary and will retry automatically.");

        return null;
      }

      if(error instanceof TypeError) {

        const cause = error.cause as NodeJS.ErrnoException;

        switch(cause.code) {

          case "ECONNREFUSED":
          case "EHOSTDOWN":

            this.log.error("Connection refused.");

            break;

          case "ECONNRESET":

            this.log.error("Connection has been reset.");

            break;

          case "ENOTFOUND":

            this.log.error("Hostname or IP address not found. Please ensure you're connected to the Internet.");

            break;

          default:

            // If we're logging when we have an error, do so.
            this.log.error("Error: %s | %s.", cause.code, cause.message);
            this.log.error(util.inspect(error, { colors: true, depth: null, sorted: true}));

            break;
        }

        return null;
      }

      this.log.error(util.inspect(error, { colors: true, depth: null, sorted: true}));

      return null;
    } finally {

      // Clear out our response timeout if needed.
      clearTimeout(timeout);
    }
  }

  // Utility for debug logging.
  public debug(message: string, ...parameters: unknown[]): void {

    if(this.config.debug) {

      this.log.error(util.format(message, ...parameters));
    }
  }
}
