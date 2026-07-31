---
tags: [term, os, concurrency]
category: Process & Threading
subcategory: Process & Memory Management
---

# Process and Thread

**Definition:** A process is an isolated executing instance of a program with its own memory space; a thread is a lightweight execution path within a process sharing memory with sibling threads.

## How It Works
- Processes maintain distinct address spaces (Code, Data, Heap, Stack) guarded by MMU/OS
- Threads share process Heap, Code, and Open Files, but maintain individual registers and Stack
- Context Switching: OS saves current execution state (PCB/TCB) to CPU registers and restores next context

## Why It Matters
- Underpins multitasking OS design, multi-core CPU utilization, and software concurrency models

## Common Pitfalls
- Sharing mutable memory across threads without locks causes data races and undefined behavior
- Process context switching is significantly heavier than thread context switching due to TLB cache flushes

## Related Terms
- [[CPU Scheduling]]
- [[Virtual Memory and Paging]]
- [[Concurrency and Race Condition]]

## Example
A Chrome browser uses separate processes per tab for isolation, while a web server uses threads to handle concurrent requests.
