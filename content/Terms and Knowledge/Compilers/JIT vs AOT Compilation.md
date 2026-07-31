---
tags: [term, compilers, runtime]
category: Runtime Execution
subcategory: Execution Runtimes
---

# JIT vs AOT Compilation

**Definition:** Ahead-Of-Time (AOT) compiles source code directly into native machine binaries prior to execution; Just-In-Time (JIT) compiles bytecode into native machine code dynamically at runtime, while the program is already running.

## How It Works
- **AOT** (C, C++, Rust, Go, Swift): the full program is compiled to a static or dynamically-linked native binary before it ever runs, giving fast, predictable startup with no runtime compilation overhead
- **JIT** (JVM/HotSpot, V8 JavaScript, PyPy, .NET CLR): the runtime first interprets or baseline-compiles bytecode, then profiles execution to find "hot" methods/loops and recompiles just those into optimized native code using **Profile-Guided Optimization (PGO)** driven by live runtime data rather than a static training run
- **Tiered Compilation:** HotSpot uses C1 (client compiler — fast to compile, lightly optimized) for warm code and escalates the hottest methods to C2 (server compiler — slow to compile, heavily optimized); V8 layers Ignition (bytecode interpreter) -> Sparkplug (fast non-optimizing baseline JIT) -> Maglev/TurboFan (optimizing JIT)
- **Speculative optimization + deoptimization:** JITs compile assuming observed types/shapes hold (e.g., V8 assumes an object's "hidden class" stays stable); if that assumption is later violated, the engine **deoptimizes**, discards the optimized code, and falls back to the interpreter or a slower tier
- **Hybrid approaches** blur the line: GraalVM's `native-image` AOT-compiles JVM bytecode into a standalone binary; Android ART compiles DEX bytecode to native code at install/first-run time rather than every launch; .NET's ReadyToRun pre-JITs common paths into the assembly while still allowing runtime re-JITing

## Why It Matters
- Governs runtime execution performance, startup latency, memory footprint, and (for serverless/CLI workloads) how quickly a process reaches full speed
- AOT wins where startup time and predictability matter most (CLI tools, serverless cold starts, embedded); JIT wins for long-running processes where the extra warm-up time is amortized and the compiler can specialize to the program's actual observed runtime behavior in ways a static compiler never could

## Common Pitfalls
- **JIT Warmup Latency:** initial execution suffers latency spikes and lower throughput while the engine still runs interpreted/baseline code and hasn't yet promoted hot paths — this directly hurts short-lived processes like serverless functions (see [[Serverless Computing and Cold Starts]])
- **Deoptimization storms:** polymorphic call sites that keep violating the JIT's type speculation (e.g., a JS function called with wildly different argument shapes) can repeatedly trigger deopt/reoptimize cycles, making code slower than if it had never been optimized
- Assuming AOT is always "faster": AOT lacks runtime profile information, so it can't perform speculative optimizations a JIT can (e.g., devirtualizing a call based on observed runtime types), and heavy AOT optimization can bloat binary size and build times

## Related Terms
- [[Compiler Pipeline Architecture]]
- [[Compiler Optimizations]]
- [[Serverless Computing and Cold Starts]]

## Example
The V8 engine compiles JavaScript through multiple tiers: Ignition interprets bytecode immediately for fast startup, Sparkplug compiles that bytecode near-verbatim into machine code once a function runs a few times, and TurboFan later recompiles genuinely hot functions with full optimization — deoptimizing back to Ignition if a type assumption (like an object's shape) turns out to be wrong.
