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

### MQTT Support
[MQTT](https://mqtt.org) is a popular Internet of Things (IoT) messaging protocol that can be used to weave together different smart devices and orchestrate or instrument them in an infinite number of ways. In short - it lets things that might not normally be able to talk to each other communicate across ecosystems, provided they can support MQTT.

`homebridge-comed-hourlypricing` will publish MQTT events if you've configured a broker in the plugin settings. Supported MQTT capabilities include:

  * Current hour average pricing.

### Configuration

This documentation assumes you know what MQTT is, what an MQTT broker does, and how to configure it. Setting up an MQTT broker will not be covered here. There are plenty of guides available on how to do so just a search away.

You can configure MQTT settings in the plugin webUI. The settings are:

| Configuration Setting | Description
|-----------------------|----------------------------------
| **mqttUrl**           | The URL of your MQTT broker. **This must be in URL form**, e.g.: `mqtt://user:password@1.2.3.4`.
| **mqttTopic**         | The base topic to publish to. The default is: `comedhourly`.

> [!IMPORTANT]
> **mqttUrl** must be a valid URL. Just entering a hostname will result in an error. The URL can use any of these protocols: `mqtt`, `mqtts`, `tcp`, `tls`, `ws`, `wss`.

When events are published, by default, the topics look like:

> ```sh
> comedhourly/Current Hour Average
> ```

### <A NAME="publish"></A>Topics Published
The topics and messages that `homebridge-comed-hourlypricing` publishes are:

| Topic                 | Message Published
|-----------------------|----------------------------------
| `price`               | JSON containing the current electricity price and the timestamp of that price.

Messages are published to MQTT when an action occurs on a device that triggers the respective event, or when an MQTT message is received for one of the topics `homebridge-comed-hourlypricing` subscribes to.

### <A NAME="subscribe"></A>Topics Subscribed
The topics that `homebridge-comed-hourlypricing` subscribes to are:

| Topic                   | Message Expected
|-------------------------|----------------------------------
| `price/get`        | `true` will trigger a publish event of the current electricity price JSON.

> [!NOTE]
>   * MQTT support is disabled by default. It's enabled when an MQTT broker is specified in the configuration.
>   * If connectivity to the broker is lost, it will perpetually retry to connect in one-minute intervals.
>   * If a bad URL is provided, MQTT support will not be enabled.
