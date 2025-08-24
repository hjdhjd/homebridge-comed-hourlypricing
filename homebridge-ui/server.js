/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * server.js: homebridge-comed-hourlypricing webUI server API.
 */
"use strict";

import { featureOptionCategories, featureOptions } from "../dist/comed-options.js";
import { HomebridgePluginUiServer } from "@homebridge/plugin-ui-utils";

/**
 * Get the ComEd Hourly Pricing current hour average price. This returns the price in cents per kWh as a Number, or null on error.
 *
 * @param {number} [timeoutMs=8000] - Network timeout in milliseconds.
 * @returns {Promise<number|null>}
 */
export async function getComEdCurrentHourAverage(timeoutMs = 8000) {

  // Define the API endpoint for the current hour average price.
  // The default response format is JSON and includes "price" as a string.
  const url = "https://hourlypricing.comed.com/api?type=currenthouraverage";

  // Create an AbortController to enforce a timeout for the network request.
  const controller = new AbortController();

  // Start a timer that will abort the fetch when the timeout elapses.
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {

    // Perform the HTTP GET request to retrieve the current hour average price.
    const response = await fetch(url, { method: "GET", signal: controller.signal });

    // Ensure we received a successful HTTP status code.
    if(!response.ok) {

      return null;
    }

    // Parse the response body as JSON.
    const data = await response.json();

    // Validate the expected shape and extract the price safely.
    if(!Array.isArray(data) || (data.length === 0) || (typeof data[0] !== "object") || (data[0] === null)) {

      return null;
    }

    // Convert the "price" field from a string to a number.
    const price = Number(data[0].price);

    // Return the numeric price if it is a finite value. Otherwise, return null.
    if(Number.isFinite(price)) {

      return price;
    }

    return null;

  // eslint-disable-next-line no-unused-vars
  } catch(error) {

    // Return null on any network, parsing, or abort error.
    return null;
  } finally {

    // Clear the timeout timer to avoid resource leaks.
    clearTimeout(timer);
  }
}

class PluginUiServer extends HomebridgePluginUiServer {

  constructor() {

    super();

    // Register getOptions() with the Homebridge server API.
    this.onRequest("/getOptions", () => ({ categories: featureOptionCategories, options: featureOptions }));

    // Register getOptions() with the Homebridge server API.
    this.onRequest("/getPrice", async () => (await getComEdCurrentHourAverage()));

    this.ready();
  }
}

(() => new PluginUiServer())();
