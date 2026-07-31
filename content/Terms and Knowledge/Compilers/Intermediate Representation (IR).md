---
tags: [term, compilers, ir]
category: Optimization & IR
subcategory: Compiler Optimization
---

# Intermediate Representation (IR)

**Definition:** A language-independent and machine-independent intermediate data structure used by compilers for program analysis and optimization, sitting between the source AST and target machine code.

## How It Works
- **Control Flow Graph (CFG):** IR instructions are grouped into Basic Blocks (straight-line code with a single entry and single exit) connected by edges representing branches, loops, and fallthrough
- **SSA Form (Static Single Assignment):** every variable is assigned exactly once; when control-flow paths merge, a synthetic **phi (Φ) function** selects the correct value based on which predecessor block executed (`%3 = phi i32 [%1, %bb1], [%2, %bb2]`), which makes def-use chains trivial to compute and dramatically simplifies data-flow analyses like constant propagation and dead-code elimination
- **Three-Address Code / Quadruples:** a common textual form where each instruction has at most one operator and two operands (`x = y op z`), as opposed to stack-based bytecode (JVM, CPython) where operations implicitly push/pop an operand stack, or graph-based "sea of nodes" IR (used in V8 TurboFan and HotSpot C2) where control and data dependencies are both explicit graph edges
- IR is typically typed (LLVM IR carries explicit types like `i32`, `float`, `ptr`) so optimization passes can reason about size, aliasing, and overflow safely
- Optimizers run a pipeline of passes over IR (constant folding, CSE, LICM, inlining — see [[Compiler Optimizations]]) before handing off to the backend's instruction selector and register allocator
- Building SSA requires computing **dominance frontiers** to know exactly where to insert phi nodes; leaving SSA form before code generation ("SSA deconstruction") reinserts explicit copy instructions where phi nodes were

## Why It Matters
- Enables reusable, machine-independent optimizations to be written once against the IR and reused across every source language and every target architecture, instead of duplicating optimization logic per frontend/backend pair
- A stable, well-typed IR is what makes tools like LLVM usable as a shared backend for Clang, Rust, Swift, and Julia simultaneously

## Common Pitfalls
- Losing high-level source type information (e.g., signedness, array bounds, source-level generics) during aggressive lowering passes, which can block optimizations that need that context or produce confusing debug info
- Naively computing dominance frontiers and phi placement is quadratic on large functions; production compilers use the Cytron et al. algorithm to keep SSA construction near-linear
- IR that's too low-level too early (e.g., lowering to near-machine-code before running high-level optimizations) forecloses transformations that need source-level structure, like vectorization or inlining decisions

## Related Terms
- [[Compiler Pipeline Architecture]]
- [[Compiler Optimizations]]
- [[Syntax Analysis and AST]]

## Example
LLVM IR represents code in SSA form. A branch that merges two paths assigning `x` needs a phi node:

```llvm
bb1:
  %1 = add i32 %a, %b
  br label %merge
bb2:
  %2 = mul i32 %a, %b
  br label %merge
merge:
  %3 = phi i32 [%1, %bb1], [%2, %bb2]  ; %3 = %1 if from bb1, %2 if from bb2
  ret i32 %3
```
