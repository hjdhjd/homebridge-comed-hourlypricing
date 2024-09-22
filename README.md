<SPAN ALIGN="CENTER" STYLE="text-align:center">
<DIV ALIGN="CENTER" STYLE="text-align:center">

[![homebridge-comed-hourlypricing: Native HomeKit support for ComEd Hourly Pricing customers](https://raw.githubusercontent.com/hjdhjd/homebridge-comed-hourlypricing/main/images/homebridge-comed-hourlypricing.svg)](https://github.com/hjdhjd/homebridge-comed-hourlypricing)

# Homebridge ComEd Hourly Pricing

[![Downloads](https://img.shields.io/npm/dt/homebridge-comed-hourlypricing?color=%23170D67&logo=icloud&logoColor=%23FFFFFF&style=for-the-badge)](https://www.npmjs.com/package/homebridge-comed-hourlypricing)
[![Version](https://img.shields.io/npm/v/homebridge-comed-hourlypricing?color=%23170D67&label=Homebridge%20ComEd%20Hourly$20Pricing&logoColor=%23FFFFFF&style=for-the-badge&logo=rainmeter)](https://www.npmjs.com/package/homebridge-comed-hourlypricing)
[![ComEd Hourly Pricing@Homebridge Discord](https://img.shields.io/discord/432663330281226270?color=%23170D67&label=Discord&logo=discord&logoColor=%23FFFFFF&style=for-the-badge)](https://discord.gg/QXqfHEW)
[![verified-by-homebridge](https://img.shields.io/badge/homebridge-verified-blueviolet?color=%2357277C&style=for-the-badge&logoColor=%23FFFFFF&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5OTIuMDkiIGhlaWdodD0iMTAwMCIgdmlld0JveD0iMCAwIDk5Mi4wOSAxMDAwIj48ZGVmcz48c3R5bGU+LmF7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iYSIgZD0iTTk1MC4xOSw1MDguMDZhNDEuOTEsNDEuOTEsMCwwLDEtNDItNDEuOWMwLS40OC4zLS45MS4zLTEuNDJMODI1Ljg2LDM4Mi4xYTc0LjI2LDc0LjI2LDAsMCwxLTIxLjUxLTUyVjEzOC4yMmExNi4xMywxNi4xMywwLDAsMC0xNi4wOS0xNkg3MzYuNGExNi4xLDE2LjEsMCwwLDAtMTYsMTZWMjc0Ljg4bC0yMjAuMDktMjEzYTE2LjA4LDE2LjA4LDAsMCwwLTIyLjY0LjE5TDYyLjM0LDQ3Ny4zNGExNiwxNiwwLDAsMCwwLDIyLjY1bDM5LjM5LDM5LjQ5YTE2LjE4LDE2LjE4LDAsMCwwLDIyLjY0LDBMNDQzLjUyLDIyNS4wOWE3My43Miw3My43MiwwLDAsMSwxMDMuNjIuNDVMODYwLDUzOC4zOGE3My42MSw3My42MSwwLDAsMSwwLDEwNGwtMzguNDYsMzguNDdhNzMuODcsNzMuODcsMCwwLDEtMTAzLjIyLjc1TDQ5OC43OSw0NjguMjhhMTYuMDUsMTYuMDUsMCwwLDAtMjIuNjUuMjJMMjY1LjMsNjgwLjI5YTE2LjEzLDE2LjEzLDAsMCwwLDAsMjIuNjZsMzguOTIsMzlhMTYuMDYsMTYuMDYsMCwwLDAsMjIuNjUsMGwxMTQtMTEyLjM5YTczLjc1LDczLjc1LDAsMCwxLDEwMy4yMiwwbDExMywxMTEsLjQyLjQyYTczLjU0LDczLjU0LDAsMCwxLDAsMTA0TDU0NS4wOCw5NTcuMzV2LjcxYTQxLjk1LDQxLjk1LDAsMSwxLTQyLTQxLjk0Yy41MywwLC45NS4zLDEuNDQuM0w2MTYuNDMsODA0LjIzYTE2LjA5LDE2LjA5LDAsMCwwLDQuNzEtMTEuMzMsMTUuODUsMTUuODUsMCwwLDAtNC43OS0xMS4zMmwtMTEzLTExMWExNi4xMywxNi4xMywwLDAsMC0yMi42NiwwTDM2Ny4xNiw3ODIuNzlhNzMuNjYsNzMuNjYsMCwwLDEtMTAzLjY3LS4yN2wtMzktMzlhNzMuNjYsNzMuNjYsMCwwLDEsMC0xMDMuODZMNDM1LjE3LDQyNy44OGE3My43OSw3My43OSwwLDAsMSwxMDMuMzctLjlMNzU4LjEsNjM5Ljc1YTE2LjEzLDE2LjEzLDAsMCwwLDIyLjY2LDBsMzguNDMtMzguNDNhMTYuMTMsMTYuMTMsMCwwLDAsMC0yMi42Nkw1MDYuNSwyNjUuOTNhMTYuMTEsMTYuMTEsMCwwLDAtMjIuNjYsMEwxNjQuNjksNTgwLjQ0QTczLjY5LDczLjY5LDAsMCwxLDYxLjEsNTgwTDIxLjU3LDU0MC42OWwtLjExLS4xMmE3My40Niw3My40NiwwLDAsMSwuMTEtMTAzLjg4TDQzNi44NSwyMS40MUE3My44OSw3My44OSwwLDAsMSw1NDAsMjAuNTZMNjYyLjYzLDEzOS4zMnYtMS4xYTczLjYxLDczLjYxLDAsMCwxLDczLjU0LTczLjVINzg4YTczLjYxLDczLjYxLDAsMCwxLDczLjUsNzMuNVYzMjkuODFhMTYsMTYsMCwwLDAsNC43MSwxMS4zMmw4My4wNyw4My4wNWguNzlhNDEuOTQsNDEuOTQsMCwwLDEsLjA4LDgzLjg4WiIvPjwvc3ZnPg==)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

## ComEd Hourly Pricing support for [Homebridge](https://homebridge.io).
</DIV>
</SPAN>

`homebridge-comed-hourlypricing` is a [Homebridge](https://homebridge.io) plugin that makes the current hourly average electricity price for [ComEd](https://comed.com) [Hourly Pricing](https://hourlypricing.comed.com) customers available to [Apple's](https://www.apple.com) [HomeKit](https://www.apple.com/ios/home) smart home platform.

## Why use this plugin for ComEd Hourly Pricing support in HomeKit?
In a nutshell, the aim of this plugin for things to *just work* with minimal required configuration by users. Unfortunately, HomeKit currently has no native support to programmatically display or act upon energy prices.

This plugin solves this by creating an ambient light sensor accessory that reflects [ComEd's current average price of electricity](https://hourlypricing.comed.com/live-prices/) which then allows you to use the sensor to create custom automations that consider the current price of electricity. For example, you might want to adjust the temperature range of your smart thermostat when electricity prices are high, or run certain accessories when prices are low.

**I rely on this plugin every day and actively maintain and support it.**

## <A NAME="plugin-configuration"></A>Installation
To get started with `homebridge-comed-hourlypricing`:

  * Install `homebridge-comed-hourlypricing` using the Homebridge webUI. Make sure you make `homebridge-comed-hourlypricing` a child bridge for the best experience.
  * That's it. Enjoy!

  <h5>Notes</h5>
    Things to keep in mind regarding the ComEd Hourly Pricing API:
    <ul dir="auto">
      <li>Electricity prices can turn negative, meaning the utility is paying you to consume electricity. The ambient light sensor in HomeKit doesn't permit values lower than <code>0.0001</code> and this plugin will reflect zero-or-below prices as <code>0.0001</code></li>
      <li>Creating automations in HomeKit using the ambient light sensor cannot be easily done in the Home app (as of iOS 18), but can be easily done using alternative HomeKit management apps like Eve Home, Home+, and Controller for HomeKit.</li>
    </ul>

<A NAME="notes"></A>
> [!IMPORTANT]
> Things to keep in mind regarding the ComEd Hourly Pricing API:
> * Electricity prices can turn negative, meaning the utility is paying you to consume electricity. The ambient light sensor in HomeKit doesn't permit values lower than `0.0001` and this plugin will reflect zero-or-below prices as `0.0001`.
> * Creating automations in HomeKit using the ambient light sensor cannot be easily done in the Home app (as of iOS 18), but can be easily done using alternative HomeKit management apps like Eve Home, Home+, and Controller for HomeKit.

## Plugin Development Dashboard
This is mostly of interest to the true developer nerds amongst us.

[![License](https://img.shields.io/npm/l/homebridge-comed-hourlypricing?color=%23170D67&logo=open%20source%20initiative&logoColor=%23FFFFFF&style=for-the-badge)](https://github.com/hjdhjd/homebridge-comed-hourlypricing/blob/main/LICENSE.md)
[![Build Status](https://img.shields.io/github/actions/workflow/status/hjdhjd/homebridge-comed-hourlypricing/ci.yml?branch=main&color=%23170D67&logo=github-actions&logoColor=%23FFFFFF&style=for-the-badge)](https://github.com/hjdhjd/homebridge-comed-hourlypricing/actions?query=workflow%3A%22Continuous+Integration%22)
[![Dependencies](https://img.shields.io/librariesio/release/npm/homebridge-comed-hourlypricing?color=%23170D67&logo=dependabot&style=for-the-badge)](https://libraries.io/npm/homebridge-comed-hourlypricing)
[![GitHub commits since latest release (by SemVer)](https://img.shields.io/github/commits-since/hjdhjd/homebridge-comed-hourlypricing/latest?color=%23170D67&logo=github&sort=semver&style=for-the-badge)](https://github.com/hjdhjd/homebridge-comed-hourlypricing/commits/main)
