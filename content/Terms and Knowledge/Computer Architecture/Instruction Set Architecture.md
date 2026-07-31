---
tags: [term, architecture, isa]
category: System & CPU Fundamentals
subcategory: Processor Architecture
---

# Instruction Set Architecture

**Definition:** The abstract interface between machine software and CPU hardware, defining available instructions, addressing modes, and register specifications (e.g., x86, ARM, RISC-V).

## How It Works
- RISC (Reduced Instruction Set Computer): simple, fixed-length instructions executed in 1 clock cycle (ARM, RISC-V)
- CISC (Complex Instruction Set Computer): variable-length instructions capable of complex multi-step operations (x86-64)
- Decodes assembly mnemonic instructions into binary opcodes executed by microcode/logic gates

## Why It Matters
- Determines binary program compatibility, hardware power efficiency, and compiler code-generation targets

## Common Pitfalls
- Assuming x86 assembly code can run natively on ARM hardware without binary translation/emulation

## Related Terms
- [[CPU Core and Registers]]
- [[CPU Instruction Cycle]]

## Example
Apple Silicon M-series processors implement the ARM64 RISC architecture; Intel Core chips implement x86-64 CISC.
