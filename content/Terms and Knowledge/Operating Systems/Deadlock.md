---
tags: [term, os, concurrency]
category: Concurrency & Synchronization
subcategory: Synchronization & Concurrency
---

# Deadlock

**Definition:** A state where a set of concurrent processes are permanently blocked because each holds a resource needed by another, forming a cycle of unresolvable waiting.

## How It Works
- Requires all 4 Coffman Conditions simultaneously: 1) Mutual Exclusion (resources can't be shared), 2) Hold and Wait (a process holds one resource while waiting for another), 3) No Preemption (resources can't be forcibly taken away), 4) Circular Wait (a closed chain of processes each waiting on the next)
- Detection uses a Resource Allocation Graph (or wait-for graph): a cycle in this graph indicates a deadlock, detectable via cycle-detection algorithms similar to [[Depth-First Search (DFS)]]
- Deadlock Prevention breaks one of the 4 Coffman conditions by design (e.g., always requesting all needed resources at once eliminates Hold and Wait; imposing a global lock ordering eliminates Circular Wait)
- Deadlock Avoidance (Banker's Algorithm) simulates resource allocation before granting it, only proceeding if the system remains in a "safe state" where some ordering of process completions is still guaranteed possible
- Deadlock Detection & Recovery lets deadlocks occur, periodically checks for wait-for cycles, then recovers by preempting a resource, rolling back a process, or killing one process in the cycle to break it

## Why It Matters
- Unresolved deadlocks cause application freezes, thread pool starvation, database transaction hangs, and full system hangs requiring manual intervention or a restart
- Distributed databases must handle deadlock detection across network boundaries (distributed deadlock detection), which is significantly harder than single-machine detection since no single node has full visibility into the global wait-for graph
- Database engines commonly choose detection-and-recovery over prevention/avoidance: they let transactions block, periodically scan for a wait-for cycle, then abort (rollback) the "victim" transaction with the least work invested to break the cycle

## Common Pitfalls
- Acquiring multiple locks in different orders in different code paths (e.g., Thread A locks X then Y; Thread B locks Y then X) — the single most common real-world cause, fixed by enforcing a global consistent lock acquisition order
- Holding a lock while making a blocking call (network request, I/O wait, or calling into unknown/third-party code) dramatically widens the window during which a deadlock can form
- Confusing deadlock with livelock — in a livelock, threads actively change state in response to each other (e.g., both repeatedly backing off and retrying) but still make no real progress, which won't show up as a static cycle in a wait-for graph
- Relying solely on lock timeouts as a "fix" without addressing root cause — timeouts convert a deadlock into a livelock-like retry storm under high contention rather than eliminating the underlying ordering problem

## Related Terms
- [[Mutex and Semaphore]]
- [[Concurrency and Race Condition]]
- [[CPU Scheduling]]
- [[Depth-First Search (DFS)]]

## Example
Thread 1 holds Lock A waiting for Lock B; Thread 2 holds Lock B waiting for Lock A. Both freeze forever.
```
Thread 1: lock(A) -> [preempted] -> lock(B)   # blocks: B held by Thread 2
Thread 2: lock(B) -> [preempted] -> lock(A)   # blocks: A held by Thread 1
```
Enforcing a global rule "always acquire locks in alphabetical order" (A before B, for every thread) eliminates this specific deadlock by removing the possibility of Circular Wait entirely.
