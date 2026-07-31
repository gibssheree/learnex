---
tags: [term, iot, embedded, platform]
category: Platforms
---

# Raspberry Pi

**Definition:** A full, low-cost single-board computer capable of running a complete Linux operating system, positioned between a simple microcontroller board like Arduino and a full desktop computer.

## How It Works
- Built around a real [[Microcontroller vs Microprocessor|microprocessor]], not a microcontroller, capable of running full Linux distributions
- Has general-purpose I/O (GPIO) pins for connecting [[Sensors and Actuators|sensors and actuators]], similar to Arduino, but with vastly more compute power
- Can run real applications, web servers, databases, even lightweight machine learning models, not just simple embedded control loops

## Why It Matters
- Bridges the gap between Arduino-style embedded control and full computing, letting hobbyists and professionals run genuinely complex software on cheap, small hardware

## Common Pitfalls
- Using it for a task that only needs simple, low-power sensor control, where a much cheaper and lower-power Arduino would be the better fit
- Underestimating that it runs a full OS with real boot times and update requirements, unlike a microcontroller's near-instant power-on

## Related Terms
- [[Arduino]]
- [[Microcontroller vs Microprocessor]]
- [[Docker]]

## Example
A home media server, a retro gaming console, or a local home automation hub are all common Raspberry Pi projects that need real compute power Arduino can't provide.
