---
tags: [term, os, concurrency]
category: Concurrency & Synchronization
subcategory: Synchronization & Concurrency
---

# Concurrency and Race Condition

**Definition:** Concurrency is the execution of multiple instruction sequences simultaneously (or interleaved); a race condition occurs when program output depends on non-deterministic execution timing of concurrent threads accessing shared state.

## How It Works
- Occurs when two or more threads access shared mutable data concurrently, and at least one of those accesses is a write — a "data race" in the strict sense requires both unsynchronized access and at least one writer
- Interleaved thread execution can cause lost updates (two writes overlap and one is silently discarded), stale reads (a thread reads data mid-update), or structural corruption (concurrent modification of a non-thread-safe collection while iterating)
- The classic lost-update pattern comes from `counter++` not being atomic — it compiles to three separate machine steps (load, increment, store), and two threads interleaving those steps can both read the same value before either writes back
- Prevented using synchronization primitives: [[Mutex and Semaphore]], atomic variables (CPU-level compare-and-swap instructions that make read-modify-write a single indivisible step), and higher-level constructs like monitors or channels
- Concurrency is distinct from parallelism: concurrency is about structuring a program to *handle* multiple tasks (which may interleave on a single core), while parallelism is about *literally executing* multiple tasks simultaneously on multiple cores — a program can be concurrent without being parallel

## Why It Matters
- Fundamental issue in multi-threaded application security and reliability — many high-severity CVEs (use-after-free, double-free, TOCTOU bugs) trace back to unsynchronized concurrent access
- Race conditions are notoriously hard to debug because they're timing-dependent: a bug that reproduces reliably under a debugger (which changes timing) may vanish, and code can pass thousands of test runs before failing in production under real load
- Understanding race conditions is prerequisite to understanding [[Deadlock]], livelock, and starvation — the broader family of concurrency correctness failures that appear once naive locking is introduced to fix races

## Common Pitfalls
- Assuming thread execution sequence or instruction atomicity without explicit synchronization guards — "it works on my machine" often just means the race window is small enough to rarely trigger under light load
- Check-then-act bugs (Time-Of-Check to Time-Of-Use / TOCTOU): checking a condition (`if file doesn't exist`) and acting on it (`create file`) as two separate unsynchronized steps, allowing another thread/process to act in between
- Using a lock to protect a write but forgetting to also guard the corresponding read path, leaving half the access pattern unsynchronized
- Reaching for coarse-grained global locks to "fix" a race, which serializes unrelated work and destroys the throughput benefit concurrency was meant to provide

## Related Terms
- [[Mutex and Semaphore]]
- [[Deadlock]]
- [[Process and Thread]]

## Example
Two threads concurrently performing `counter++` without locking might read the same value, causing one increment to be lost.
```
Initial counter = 0
Thread A: load counter (0) -> increment to 1 -> [context switch before store]
Thread B: load counter (0) -> increment to 1 -> store 1
Thread A: store 1
Final counter = 1   (expected 2 after two increments — one update was lost)
```
Wrapping the increment in a mutex, or using an atomic `fetch_add`, forces the load-increment-store sequence to complete as one indivisible unit per thread.
