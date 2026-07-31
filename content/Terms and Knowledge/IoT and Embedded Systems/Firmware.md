---
tags: [term, iot, embedded, software]
category: Hardware Fundamentals
---

# Firmware

**Definition:** Low-level software permanently or semi-permanently programmed onto a hardware device's memory, controlling its most basic hardware-level functions.

## How It Works
- Sits between raw hardware and any higher-level software, directly controlling chips, sensors, and peripherals
- Stored in non-volatile memory (flash) so it persists without power, unlike RAM
- Can often be updated ("flashed") without replacing the physical hardware, which is how devices receive bug fixes and new features after manufacturing

## Why It Matters
- Firmware bugs are uniquely painful, they can be much harder to fix after a device has shipped to millions of users than a typical software bug

## Common Pitfalls
- Shipping firmware without a reliable update mechanism, leaving no way to fix critical bugs or security issues after devices are in the field
- Underestimating how memory- and power-constrained firmware development is compared to typical application development

## Related Terms
- [[Microcontroller vs Microprocessor]]
- [[Sensors and Actuators]]

## Example
A smart lock's firmware controls the actual motor that locks and unlocks the door, updated periodically over the air to patch security vulnerabilities.
