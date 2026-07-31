---
tags: [term, iot, embedded, hardware]
category: Hardware Fundamentals
---

# Sensors and Actuators

**Definition:** Sensors read information from the physical world into a digital signal (temperature, motion, light); actuators do the reverse, taking a digital signal and producing physical motion or action (a motor, a valve, an LED).

## How It Works
- Sensors convert a physical quantity into an electrical signal a microcontroller can read, either digital (on/off) or analog (a continuous voltage)
- Actuators receive a digital or analog signal from the microcontroller and convert it into physical movement, heat, light, or sound
- Together they form the "input and output" of nearly every IoT and embedded device, the microcontroller is the brain connecting the two

## Why It Matters
- This sensor-to-actuator loop is the actual point of most embedded systems, reacting to the physical world and acting back on it

## Common Pitfalls
- Not accounting for sensor noise, raw sensor readings are rarely perfectly clean and often need filtering or averaging before use
- Underestimating an actuator's power draw, motors and other actuators often need far more current than a microcontroller's pins can safely supply directly

## Related Terms
- [[Microcontroller vs Microprocessor]]
- [[Firmware]]

## Example
A smart thermostat reads temperature with a sensor, then actuates a relay to turn the furnace on or off based on that reading.
