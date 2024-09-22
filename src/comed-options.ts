/* Copyright(C) 2017-2024, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-options.ts: Feature option and type definitions for ComEd Hourly Pricing.
 */

import { FeatureOptionEntry } from "homebridge-plugin-utils";

// Plugin configuration options.
export interface ComEdHourlyOptions {

  debug: boolean,
  mqttTopic: string,
  mqttUrl: string,
  options: string[],
}

// Feature option categories.
export const featureOptionCategories = [

  { description: "Logging feature options.", name: "Log" }
];

// Individual feature options, broken out by category.
export const featureOptions: { [index: string]: FeatureOptionEntry[] } = {

  // Logging options.
  "Log": [

    { default: false, description: "Log API requests.", name: "API" }
  ]
};
