---
tags: [term, iot, embedded, platform]
category: Platforms
---

# Arduino

**Definition:** An open-source hardware and software platform built around simple microcontroller boards, widely used for hobbyist electronics and rapid embedded prototyping.

## How It Works
- Boards are built around a [[Microcontroller vs Microprocessor|microcontroller]], with easily accessible pins for connecting [[Sensors and Actuators|sensors and actuators]]
- Programmed in a simplified C/C++ dialect through the Arduino IDE, designed to be approachable for beginners
- A massive library ecosystem means most common sensors and modules already have ready-to-use code available

## Why It Matters
- Dramatically lowered the barrier to entry for physical computing, turning "build a device that senses and reacts to the world" into a weekend project instead of requiring deep electrical engineering knowledge

## Common Pitfalls
- Trying to run genuinely compute-heavy or networked applications on it, Arduino's constrained hardware isn't meant for that, a [[Raspberry Pi]] fits that need better
- Underestimating power and current limits when wiring up motors or other demanding components directly to its pins

## Related Terms
- [[Microcontroller vs Microprocessor]]
- [[Sensors and Actuators]]
- [[Raspberry Pi]]

## Example
A hobbyist builds a plant-watering system: an Arduino reads a soil moisture sensor and actuates a small pump when the soil gets too dry.
