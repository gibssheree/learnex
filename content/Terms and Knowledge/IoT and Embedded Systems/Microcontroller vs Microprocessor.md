---
tags: [term, iot, embedded, hardware]
category: Hardware Fundamentals
---

# Microcontroller vs Microprocessor

**Definition:** A microcontroller packs a CPU, memory, and I/O peripherals onto a single chip built for one dedicated task; a microprocessor is just the CPU, requiring separate memory and peripheral chips, built for general-purpose computing.

## How It Works
- Microcontroller (MCU): CPU + RAM + flash storage + I/O pins all on one chip, cheap, low-power, runs one specific program
- Microprocessor (MPU): just the CPU core, needs external RAM, storage, and peripherals wired around it, powers general-purpose computers and phones
- MCUs typically run bare-metal code or a lightweight [[Embedded Real-Time Operating System (RTOS)|RTOS]], not a full OS like Linux or Windows

## Why It Matters
- Picking the wrong one wastes money and power, a microprocessor is massive overkill for a device that just needs to read a temperature sensor and blink an LED

## Common Pitfalls
- Assuming an MCU can run the same kind of software as a full computer, its limited RAM and lack of a full OS mean most desktop software concepts don't directly translate
- Underestimating an MCU's real-time constraints, some tasks (like reading a sensor at a precise interval) need timing guarantees a general-purpose OS won't provide

## Related Terms
- [[Embedded Real-Time Operating System (RTOS)]]
- [[Arduino]]
- [[Firmware]]

## Example
An Arduino Uno's ATmega328P is a microcontroller; the chip inside a laptop is built around a microprocessor with separate RAM and storage.
