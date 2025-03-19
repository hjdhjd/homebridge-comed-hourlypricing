/* Copyright(C) 2017-2025, HJD (https://github.com/hjdhjd). All rights reserved.
 *
 * ui.mjs: Homebridge ComEd Hourly Pricing webUI.
 */

"use strict";

import { webUi } from "./lib/webUi.mjs";

// Parameters for our feature options webUI.
const featureOptionsParams = {

  getDevices: () => [],
  hasControllers: false
};

// Instantiate the webUI.
const ui = new webUi({ featureOptions: featureOptionsParams, name: "ComEd Hourly Pricing" });

// Display the webUI.
ui.show();
