---
tags: [term, iot, embedded, os]
category: Software
---

# Embedded Real-Time Operating System (RTOS)

**Definition:** A lightweight operating system for embedded devices that guarantees tasks complete within a strict, predictable time limit, unlike a general-purpose OS which prioritizes overall throughput over timing guarantees.

## How It Works
- Uses a deterministic scheduler that guarantees a high-priority task runs within a known maximum delay, unlike [[CPU Scheduling|general-purpose OS scheduling]] which optimizes for fairness and throughput
- Runs on far less memory and processing power than a full OS like Linux, fitting on constrained microcontrollers
- "Hard real-time" systems must never miss a deadline (a pacemaker), "soft real-time" systems can tolerate occasional missed deadlines with degraded quality (video streaming)

## Why It Matters
- For many embedded applications (industrial control, medical devices, automotive), a task running "eventually" instead of "exactly on time" isn't just an inconvenience, it can be a safety failure

## Common Pitfalls
- Using a general-purpose OS or no OS at all for a task with genuine hard real-time requirements, then discovering timing failures only under real-world load
- Overusing an RTOS for simple projects that don't actually need real-time guarantees, adding unnecessary complexity

## Related Terms
- [[Microcontroller vs Microprocessor]]
- [[CPU Scheduling]]

## Example
FreeRTOS is a widely used open-source RTOS running on countless IoT devices, guaranteeing that a critical sensor-read task executes on a predictable schedule.
