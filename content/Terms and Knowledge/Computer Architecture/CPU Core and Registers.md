---
tags: [term, architecture, cpu]
category: System & CPU Fundamentals
subcategory: Processor Architecture
---

# CPU Core and Registers

**Definition:** A CPU core is an independent processing unit containing an ALU, Control Unit, and high-speed internal Registers capable of executing instructions.

## How It Works
- Registers: smallest, fastest storage elements directly inside CPU (e.g., Program Counter PC, Stack Pointer SP, Accumulator)
- ALU (Arithmetic Logic Unit): performs integer arithmetic and bitwise logic operations
- Control Unit (CU): fetches instructions, decodes opcodes, and directs signal data flow

## Why It Matters
- Registers provide near-instantaneous (sub-nanosecond) operand access for CPU instructions

## Common Pitfalls
- Limited number of hardware registers requires 'register spilling' (saving active values to RAM/Stack), reducing speed

## Related Terms
- [[Von Neumann Architecture]]
- [[CPU Instruction Cycle]]
- [[Instruction Set Architecture]]

## Example
A 64-bit x86 CPU core contains registers like `%rax`, `%rbx`, `%rsp`, `%rip`.
