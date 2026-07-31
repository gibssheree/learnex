---
tags: [term, compilers, optimization]
category: Optimization & IR
subcategory: Compiler Optimization
---

# Compiler Optimizations

**Definition:** Transformations applied to Intermediate Representation to improve execution speed or minimize binary code size while strictly preserving observable program semantics (the "as-if" rule).

## How It Works
- **Constant Folding / Propagation:** evaluating constant expressions at compile time (`2 + 3` -> `5`) and propagating known-constant values through subsequent uses
- **Common Subexpression Elimination (CSE):** computing a repeated expression like `a*b` once and reusing the result instead of recomputing it
- **Dead Code Elimination (DCE):** removing unreachable blocks and stores to variables that are never subsequently read (dead stores)
- **Function Inlining:** replacing call sites directly with the callee's body to eliminate call/return overhead and expose further optimization opportunities across the former call boundary; governed by cost heuristics and thresholds (e.g. `-finline-limit` in GCC)
- **Loop-Invariant Code Motion (LICM):** hoisting computations that don't change across iterations out of the loop body
- **Loop Unrolling:** duplicating loop body iterations to reduce branch/counter-check overhead per unit of work
- **Strength Reduction:** replacing expensive operations with cheaper equivalents (e.g., `i * 8` becomes `i << 3`, array-index multiplication in a loop becomes an accumulated pointer increment)
- **Auto-Vectorization:** rewriting scalar loop bodies into SIMD instructions (SSE/AVX/NEON) that process multiple data elements per instruction
- **Tail Call Optimization:** reusing the current stack frame for a call in tail position instead of pushing a new one
- Optimization is staged by level: `-O0` (none, fastest compile, best debuggability), `-O1`/`-O2` (balanced), `-O3` (aggressive, includes vectorization/inlining), `-Os`/`-Oz` (optimize for binary size)
- **Link-Time Optimization (LTO)** defers some passes until link time so the optimizer can see across translation-unit/object-file boundaries; **Profile-Guided Optimization (PGO)** feeds real execution profiles back into the compiler to prioritize hot paths

## Why It Matters
- Allows developers to write clean, high-level code while the compiler automatically transforms it into efficient machine execution, without manually hand-tuning assembly
- Optimization flags trade compile time and debuggability for runtime performance, so build pipelines typically use `-O0` for local dev/debug builds and `-O2`/`-O3` plus LTO/PGO for release builds

## Common Pitfalls
- Over-inlining functions inflates binary executable size, causing L1 instruction cache misses that can make "optimized" code slower in practice (I-cache thrashing)
- Compilers exploit Undefined Behavior (UB) as a license to optimize aggressively — e.g., assuming signed integer overflow never happens lets the optimizer eliminate an overflow check the developer intended to keep, silently changing program behavior
- Floating-point reassociation (`-ffast-math`) breaks IEEE 754 semantics by allowing reordering that changes rounding results, which is unsafe for numerically sensitive code
- Debugging `-O2`/`-O3` builds is painful: variables get optimized into registers or eliminated entirely, and breakpoints can appear to "jump around" because of instruction reordering and inlining

## Related Terms
- [[Intermediate Representation (IR)]]
- [[JIT vs AOT Compilation]]
- [[Compiler Pipeline Architecture]]
- [[SIMD and Vector Processing]]

## Example
`gcc -O3` on a multiply-accumulate loop over an array both unrolls the loop and emits AVX SIMD instructions instead of one scalar multiply per element:

```c
// source
for (int i = 0; i < n; i++) sum += a[i] * 2;

// after -O3: strength reduction (i*2 -> shift), LICM, and auto-vectorization
// collapse this into a handful of SIMD multiply-add instructions processing
// 4-8 elements per loop iteration instead of one.
```
