---
tags: [term, architecture, hardware]
category: System & CPU Fundamentals
subcategory: Computer System Design
---

# Von Neumann Architecture

**Definition:** A theoretical and practical computer architecture design where data and program instructions share the same memory space and bus system.

## How It Works
- CPU consists of Control Unit (CU), Arithmetic Logic Unit (ALU), and Registers
- Shared Memory stores both executable instructions and operational data
- Von Neumann Bottleneck: CPU throughput is limited because instruction fetches and data read/writes must take turns over the shared data bus

## Why It Matters
- Serves as the foundation for almost all modern general-purpose computing hardware

## Common Pitfalls
- Von Neumann Bottleneck limits high-speed CPU performance (mitigated by multi-level CPU caching and separate instruction/data caches)

## Related Terms
- [[CPU Core and Registers]]
- [[Memory Hierarchy]]
- [[Instruction Set Architecture]]

## Example
Every modern x86 or ARM personal computer follows the Von Neumann model conceptually.
