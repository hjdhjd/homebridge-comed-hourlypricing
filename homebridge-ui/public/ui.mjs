/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * ui.mjs: Homebridge ComEd Hourly Pricing webUI.
 */

"use strict";

import { webUi } from "./lib/webUi.mjs";

let updateInterval;

const updatePrice = async () => {

  const headerInfo = document.getElementById("headerInfo");

  // If the header no longer exists, we presume the UI is no longer visible and stop our updates.
  if(!headerInfo) {

    if(updateInterval !== undefined) {

      clearInterval(updateInterval);
      updateInterval = undefined;
    }

    return;
  }

  const price = await homebridge.request("/getPrice");

  headerInfo.classList.add("stat-label");
  headerInfo.classList.add((price >= 14) ? "text-danger" : ((price >= 8) ? "text-warning" : "text-success"));
  headerInfo.textContent = "Current Hourly Electricity Price: " + price + "\u00A2";
};

// Show the hourly price infopanel.
const showInfoPanel = async () => {

  // We choose to override the header infopanel instead since we don't have device-level options for this plugin.
  const headerInfo = document.getElementById("headerInfo");

  // Placeholder while we retrieve the current price.
  headerInfo.textContent = "Retrieving current hourly price...";

  // Update the hourly price.
  await updatePrice();

  // Clear out any existing update interval.
  if(updateInterval !== undefined) {

    clearInterval(updateInterval);
    updateInterval = undefined;
  }

  // Set an interval that updates prices every five minutes, with a couple of seconds of jitter builtin.
  updateInterval = setInterval(() => updatePrice(), (5 * 60 * 1000) + (2 * 1000))
};

// Parameters for our feature options webUI.
const featureOptionsParams = {

  getDevices: () => [],
  infoPanel: showInfoPanel
};

// Instantiate the webUI.
const ui = new webUi({ featureOptions: featureOptionsParams, name: "ComEd Hourly Pricing" });

// Display the webUI.
ui.show();
