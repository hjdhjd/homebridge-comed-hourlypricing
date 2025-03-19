/* Copyright(C) 2020-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * comed-types.ts: Interface and type definitions for the ComEd Hourly Pricing API.
 */

// ComEd Hourly Pricing.
export interface ComEdHourlyPricing {

  millisUTC: string,
  price: string
}

// ComEd Hourly Pricing reserved names.
export enum ComEdReservedNames {

  // Manage our contact sensor types.
  CONTACT_SENSOR_PRICE_HIGH_AUTOMATION = "Contact.Sensor.Price.High.Automation"
}
