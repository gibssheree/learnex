---
tags: [term, os, concurrency]
category: Concurrency & Synchronization
subcategory: Synchronization & Concurrency
---

# Mutex and Semaphore

**Definition:** Synchronization primitives used to control access to shared resources in concurrent systems.

## How It Works
- Mutex (Mutual Exclusion): binary lock owned by a single thread. Only the thread that locks it can unlock it
- Counting Semaphore: integer counter initialized to N; allows up to N threads access concurrently (Wait/Signal operations)
- Binary Semaphore: semaphore with value 0 or 1 (unlike mutex, can be signaled/released by any thread)

## Why It Matters
- Prevents race conditions and data corruption in shared-memory multi-threaded applications

## Common Pitfalls
- Deadlocks caused by acquiring locks in inconsistent order across threads
- Over-locking reduces concurrent throughput to serial execution speed

## Related Terms
- [[Concurrency and Race Condition]]
- [[Deadlock]]

## Example
Mutex protects access to a shared database connection pool; Semaphore caps maximum concurrent HTTP client connections.
