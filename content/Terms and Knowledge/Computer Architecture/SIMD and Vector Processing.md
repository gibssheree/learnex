---
tags: [term, architecture, performance]
category: Execution & Pipelining
subcategory: Parallel Execution
---

# SIMD and Vector Processing

**Definition:** Single Instruction, Multiple Data (SIMD) is a parallel execution mode where a single CPU instruction performs the exact same operation simultaneously across multiple data elements stored in wide vector registers.

## How It Works
- Uses wide vector registers (128-bit SSE, 256-bit AVX2, 512-bit AVX-512, ARM NEON)
- A 256-bit register can process eight 32-bit floating-point numbers in a single clock cycle instruction
- Extremely effective for matrix operations, video processing, audio DSP, and machine learning tensor math

## Why It Matters
- Provides massive data-parallel throughput boosts on standard CPU hardware

## Common Pitfalls
- Unaligned memory addresses slow down vector register loads
- Conditional branch loops (`if-else`) inside SIMD loops break vector efficiency

## Related Terms
- [[CPU Pipelining]]
- [[Instruction Set Architecture]]

## Example
Adding two vectors of 8 floats requires 8 scalar CPU instructions, but only 1 SIMD `_mm256_add_ps` instruction.
