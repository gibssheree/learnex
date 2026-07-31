---
tags: [term, architecture, memory]
category: Memory & Cache Systems
subcategory: Memory Subsystem
---

# Memory Hierarchy

**Definition:** The architectural organization of computer storage levels arranged by speed, cost, and capacity (Registers -> L1/L2/L3 Caches -> RAM -> SSD/NVMe).

## How It Works
- Registers: < 1 ns latency, tiny bytes
- L1 Cache: ~1 ns latency, ~64 KB per core (split into L1i instruction and L1d data)
- L2 Cache: ~3-5 ns latency, ~1-2 MB per core
- L3 Cache: ~10-20 ns latency, shared tens of MB
- Main Memory (RAM): ~50-100 ns latency, tens of GB
- SSD / Storage: ~10-100 microseconds latency, TBs

## Why It Matters
- Exploits Temporal Locality (re-using recently accessed data) and Spatial Locality (accessing adjacent memory addresses) to keep CPUs fed with data

## Common Pitfalls
- Cache Misses: fetching uncached data from RAM forces CPU to sit idle for hundreds of clock cycles (Cache Stall)

## Related Terms
- [[Von Neumann Architecture]]
- [[Cache Line and Eviction]]

## Example
Sequential array iteration is fast because spatial locality loads adjacent array elements into L1 cache lines automatically.
