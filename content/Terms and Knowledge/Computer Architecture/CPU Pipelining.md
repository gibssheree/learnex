---
tags: [term, architecture, cpu]
category: Execution & Pipelining
subcategory: Processor Execution
---

# CPU Pipelining

**Definition:** An instruction execution technique that overlaps multiple instruction stages concurrently (like an assembly line) to increase instruction throughput.

## How It Works
- Divides instruction processing into discrete stages (Fetch, Decode, Execute, Memory, Writeback)
- While Instruction 1 is in Execute stage, Instruction 2 is in Decode stage, and Instruction 3 is in Fetch stage
- Pipeline Hazards: 1) Structural (resource conflict), 2) Data (dependency on uncompleted result), 3) Control (branch jump misprediction)

## Why It Matters
- Significantly boosts CPU instructions-per-cycle (IPC) without increasing clock frequency

## Common Pitfalls
- Pipeline Flushes: branching mispredictions force CPU to discard pending pipelined instructions, wasting cycles

## Related Terms
- [[CPU Instruction Cycle]]
- [[Instruction Set Architecture]]

## Example
A 5-stage CPU pipeline can ideally complete 1 instruction per clock cycle once filled.
