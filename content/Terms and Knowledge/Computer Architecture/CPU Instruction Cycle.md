---
tags: [term, architecture, cpu]
category: Execution & Pipelining
subcategory: Processor Execution
---

# CPU Instruction Cycle

**Definition:** The continuous operational sequence executed by a CPU core to process machine instructions: Fetch, Decode, Execute, Memory Access, Writeback.

## How It Works
- 1. Fetch: retrieves instruction byte from memory address pointed to by Program Counter (PC)
- 2. Decode: Control Unit parses opcode, source registers, and destination registers
- 3. Execute: ALU calculates mathematical result or evaluates conditional jump
- 4. Memory Access: reads/writes RAM data if instruction requires memory I/O
- 5. Writeback: saves final execution result into target CPU register; increments PC

## Why It Matters
- Represents the fundamental clock-driven loop governing all CPU execution

## Common Pitfalls
- Unoptimized memory access during Fetch/Memory stages causes CPU clock cycle stalls

## Related Terms
- [[CPU Core and Registers]]
- [[CPU Pipelining]]

## Example
Executing `ADD RAX, RBX` performs Fetch -> Decode -> ALU Addition -> Writeback to RAX.
