---
tags: [moc, term, iot, embedded]
---

# IoT and Embedded Systems MOC

7 terms across 3 categories. This is the physical-world counterpart to [[Operating Systems Terms MOC|Operating Systems]] and [[Computer Networks Terms MOC|Computer Networks]] — the same ideas (scheduling, messaging) applied to hardware with kilobytes of RAM instead of gigabytes.

## Hardware Fundamentals
- [[Microcontroller vs Microprocessor]]
- [[Sensors and Actuators]]
- [[Firmware]]

## Software
- [[Embedded Real-Time Operating System (RTOS)]]
- [[MQTT]]

## Platforms
- [[Arduino]]
- [[Raspberry Pi]]

---

## How to use this
Start with Hardware Fundamentals to understand the physical constraints, they shape every other decision in this field. Arduino and Raspberry Pi aren't competitors so much as different points on a spectrum: pick based on how much compute the actual project needs.

## Suggested order if starting from zero
1. **Microcontroller vs Microprocessor → Sensors and Actuators** — the physical building blocks
2. **Arduino** — the easiest hands-on entry point into physical computing
3. **Firmware → Embedded Real-Time Operating System (RTOS)** — how software actually runs on constrained hardware
4. **Raspberry Pi** — once a project needs real compute, not just sensor control
5. **MQTT** — how a fleet of these devices actually talks to each other and the internet
