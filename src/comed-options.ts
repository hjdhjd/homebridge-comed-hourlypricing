/* Copyright(C) 2017-2024, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-options.ts: Feature option and type definitions for ComEd Hourly Pricing.
 */

import { COMED_HOURLY_HIGH_PRICE_THESHOLD } from "./settings.js";
import { FeatureOptionEntry } from "homebridge-plugin-utils";

// Plugin configuration options.
export type ComEdHourlyOptions = {

  debug: boolean,
  mqttTopic: string,
  mqttUrl: string,
  options: string[],
};

// Feature option categories.
export const featureOptionCategories = [

  { description: "Automation feature options.", name: "Automation" },
  { description: "Logging feature options.", name: "Log" }
];

// Individual feature options, broken out by category.
export const featureOptions: { [index: string]: FeatureOptionEntry[] } = {

  "Automation": [

    { default: false, description: "High price automation contact sensor.", name: "Sensor.High" },
    { default: true, defaultValue: COMED_HOURLY_HIGH_PRICE_THESHOLD, description: "High price threshold, in cents.", group: "Sensor.High", name: "Sensor.High.Threshold" }
  ],

  // Logging options.
  "Log": [

    { default: false, description: "Log API requests.", name: "API" }
  ]
};
