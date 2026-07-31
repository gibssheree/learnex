---
tags: [term, architecture, memory]
category: Memory & Cache Systems
subcategory: Memory Subsystem
---

# Cache Line and Eviction

**Definition:** A Cache Line is the standard fixed-size block of memory (typically 64 bytes) transferred between main RAM and CPU cache; eviction policies select lines to discard when cache is full.

## How It Works
- When requesting a single byte, MMU loads the entire enclosing 64-byte Cache Line into cache
- Cache Mapping: Direct-Mapped, Set-Associative, or Fully Associative
- Eviction Policies: Least Recently Used (LRU), Pseudo-LRU, First-In First-Out (FIFO)
- Write Policies: Write-Through (updates RAM immediately) vs Write-Back (dirty flag updated in cache, flushed later)

## Why It Matters
- Writing cache-friendly code dramatically outperforms algorithmic optimizations in real-world software performance

## Common Pitfalls
- False Sharing: two independent threads on separate CPU cores writing to different variables located within the SAME cache line force constant cache invalidation bounces

## Related Terms
- [[Memory Hierarchy]]
- [[SIMD and Vector Processing]]

## Example
Iterating matrix columns vs rows: row-major array traversal matches cache line layout, running up to 10x faster than column-major traversal.
