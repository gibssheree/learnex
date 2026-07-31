---
tags: [term, compilers, architecture]
category: Compiler Architecture & Parsing
subcategory: Compiler Architecture
---

# Compiler Pipeline Architecture

**Definition:** The decoupled multi-phase structural architecture of modern compilers, divided into a Frontend, a target-independent Middle-end, and a target-dependent Backend.

## How It Works
- **Frontend:** [[Lexical Analysis]], [[Syntax Analysis and AST]], and semantic analysis (type checking, name resolution). Transforms source code into an AST and then lowers it into an initial [[Intermediate Representation (IR)]]. Frontend errors are reported here with source-level positions
- **Middle-end:** runs a pipeline of target-independent [[Compiler Optimizations]] over the IR — constant folding, dead code elimination, inlining, loop transformations — repeated across multiple passes since one optimization often exposes opportunities for another
- **Backend:** performs **Instruction Selection** (mapping IR operations onto the target's actual machine instructions, often via tree/DAG pattern matching), **Instruction Scheduling** (reordering instructions to hide pipeline latency and avoid stalls), and **Register Allocation** (mapping an unbounded number of virtual IR values onto a small, fixed set of physical registers, classically via graph coloring or linear-scan algorithms), finally emitting assembly/machine code for x86, ARM, RISC-V, or WebAssembly
- This structure makes compilers **retargetable**: GCC and LLVM both support dozens of source languages and dozens of target architectures by keeping frontends and backends independent, communicating only through the shared IR (GCC uses GENERIC/GIMPLE/RTL; LLVM uses LLVM IR)

## Why It Matters
- Decoupling allows M source languages to target N hardware architectures by writing M frontends + N backends (all sharing one middle-end), instead of M × N full special-purpose compilers
- Centralizing optimization in the middle-end means every frontend language benefits from the same optimization passes without reimplementing them per language

## Common Pitfalls
- Coupling frontend syntax assumptions directly into backend code generation defeats the entire point of the layered design and makes retargeting to a new architecture or reusing the frontend for a new language much harder
- Lowering to target-specific constructs too early (in the frontend or middle-end) forecloses optimizations and portability that depend on staying target-independent as long as possible
- Treating the phases as strictly one-directional: real compilers often need feedback (e.g., register allocation can force the scheduler to reorder again, or inlining decisions in the middle-end depend on estimated backend cost)

## Related Terms
- [[Lexical Analysis]]
- [[Syntax Analysis and AST]]
- [[Intermediate Representation (IR)]]
- [[Compiler Optimizations]]

## Example
LLVM's pipeline: Clang (frontend) parses C/C++ into an AST and lowers it to LLVM IR -> the LLVM optimizer (middle-end) runs passes like `-O2`'s inliner, GVN, and loop-invariant code motion over that IR -> the LLVM backend (e.g., the X86 or AArch64 target) performs instruction selection, register allocation, and scheduling to emit native machine code.
