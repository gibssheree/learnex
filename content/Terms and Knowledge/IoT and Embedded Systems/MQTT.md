---
tags: [term, iot, networking, messaging]
category: Software
---

# MQTT

**Definition:** A lightweight publish-subscribe messaging protocol designed for constrained IoT devices and unreliable networks, using far less overhead than typical HTTP requests.

## How It Works
- Devices publish messages to named "topics" rather than sending directly to a specific recipient, similar in spirit to [[Message Queue|message queue]] patterns
- Other devices or services subscribe to topics they care about, and receive messages automatically as they're published
- Designed to be extremely lightweight, minimal message overhead, works over unreliable, high-latency, or low-bandwidth connections

## Why It Matters
- HTTP's overhead is often too heavy for battery-powered sensors sending tiny amounts of data over spotty connections, MQTT is built specifically for that constraint

## Common Pitfalls
- Using MQTT for scenarios that actually need a request/response pattern, it's built for publish/subscribe, not for "ask a device a question and wait for its answer"
- Not securing the broker properly, an exposed MQTT broker can let anyone read or publish to topics they shouldn't have access to

## Related Terms
- [[Message Queue]]
- [[Event-Driven Architecture]]
- [[Sensors and Actuators]]

## Example
A fleet of temperature sensors publishes readings to an MQTT topic every 30 seconds; a dashboard service subscribes to that topic to display live data.
