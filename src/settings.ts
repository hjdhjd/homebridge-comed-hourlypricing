/* Copyright(C) 2017-2024, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * settings.ts: Settings and constants for homebridge-comed-hourlypricing.
 */

// ComEd hourly pricing API polling interval, in seconds.
export const COMED_HOURLY_API_POLLING_INTERVAL = 300;

// How often, in seconds, should we retry API calls when they fail.
export const COMED_HOURLY_API_RETRY_INTERVAL = 60;

// How much, in seconds, jitter should we inject into the API polling interval. This helps ensure we stay clear of the API rate limits.
export const COMED_HOURLY_API_JITTER = 0.2;

// ComEd hourly pricing API response timeout, in seconds.
export const COMED_HOURLY_API_TIMEOUT = 7;

// How often, in seconds, should we try to reconnect with an MQTT broker, if we have one configured.
export const MQTT_RECONNECT_INTERVAL = 60;

// Default MQTT topic to use when publishing events. This is in the form of: comedhourly/Current Hour Average/event
export const COMED_HOURLY_MQTT_TOPIC = "comedhourly";

// The platform the plugin creates.
export const PLATFORM_NAME = "ComEd Hourly Pricing";

// The name of our plugin.
export const PLUGIN_NAME = "homebridge-comed-hourlypricing";
