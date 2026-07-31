---
tags: [term, os, ipc]
category: Kernel & I-O Subsystems
subcategory: Kernel Architecture
---

# Inter-Process Communication (IPC)

**Definition:** Mechanisms provided by the OS allowing independent processes, each with its own isolated address space, to exchange data and synchronize state.

## How It Works
- Pipes & Named Pipes (FIFOs): unidirectional byte streams between processes; anonymous pipes only work between related processes (e.g., parent/child from `fork()`), while named pipes exist as filesystem entries and let unrelated processes connect
- Shared Memory: a fast memory region mapped directly into the virtual address space of multiple processes (via `mmap`/`shmget`) so reads/writes avoid any kernel copy — the fastest IPC mechanism, but requires explicit synchronization (a [[Mutex and Semaphore]] or similar) since the kernel provides no built-in coordination
- Message Queues & Unix Domain Sockets: structured, discrete message passing managed by the kernel, preserving message boundaries (unlike a raw byte-stream pipe) and often supporting priority ordering
- Signals: an asynchronous, minimal-payload notification mechanism (e.g., `SIGKILL`, `SIGTERM`, `SIGCHLD`) that interrupts a target process to notify it of an event, without transferring structured data
- Sockets (including loopback TCP/UDP on `127.0.0.1`) extend IPC across machine boundaries, letting the same programming model scale from same-host processes to networked services — see [[Sockets and Socket Programming]]

## Why It Matters
- Enables modular microservice architectures, multi-process application designs (browsers isolating tabs into separate processes), and composable Unix command-line tool chains
- Choosing the right IPC mechanism is a real performance decision: shared memory can move gigabytes per second with near-zero copy overhead, while a message queue or socket incurs kernel copy and context-switch cost per message — the tradeoff is convenience/safety versus raw throughput
- Container and sandboxing technology relies heavily on controlling which IPC mechanisms a process can use (e.g., disabling shared memory or restricting Unix domain socket access) as part of the isolation boundary

## Common Pitfalls
- Shared memory without synchronization causes race conditions identical to multi-threaded shared-state bugs, except now across process boundaries where debugging tools have less visibility
- Unbuffered/small-buffer pipes cause writer blocking once the OS pipe buffer (commonly 64KB on Linux) fills up, if the reader isn't consuming fast enough — this can deadlock two processes that both write to full pipes while waiting to read from each other
- Leaking IPC resources (unlinked shared memory segments, orphaned named pipes, unreleased System V semaphores) that outlive the process, since the OS doesn't always automatically garbage-collect these the way it reclaims process memory
- Assuming message ordering is preserved across independent IPC channels — messages sent on separate pipes/queues can be received out of relative order at the consumer even if each individual channel preserves its own order

## Related Terms
- [[Process and Thread]]
- [[Mutex and Semaphore]]
- [[Sockets and Socket Programming]]
- [[System Call]]

## Example
Using `cat access.log | grep 404` passes stdout of `cat` to stdin of `grep` via an OS IPC pipe.
```
process cat:  writes bytes -> [kernel pipe buffer, 64KB] -> process grep: reads bytes
```
If `grep` processes slower than `cat` produces output, the pipe buffer fills and `cat`'s `write()` call blocks until `grep` drains it — the kernel handles this backpressure automatically without either process needing custom flow-control logic.
