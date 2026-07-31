---
tags: [term, os, scheduling]
category: Process & Threading
subcategory: Process & Memory Management
---

# CPU Scheduling

**Definition:** The OS process scheduler component that decides which runnable process or thread gets CPU execution time and for how long.

## How It Works
- Preemptive Scheduling: the OS forcefully interrupts a running process when its time quantum expires or a higher-priority process arrives, saving its context for later resumption
- Non-preemptive Scheduling: a process retains the CPU voluntarily until it finishes, yields, or blocks on I/O — simpler but risks one process monopolizing the CPU
- Common algorithms: Round Robin (RR — fixed time quantum, fair but throughput depends heavily on quantum size), First-Come First-Served (FCFS — simple but causes the convoy effect when a long job blocks short ones), Shortest Job First (SJF — minimizes average wait time but requires knowing/estimating burst length), Multilevel Feedback Queue (MLFQ — multiple priority queues with different quanta, processes demoted to lower priority the longer they run, approximating SJF without needing to know burst times upfront)
- Scheduling metrics used to evaluate algorithms: turnaround time (completion - arrival), waiting time (turnaround - burst), response time (first CPU access - arrival), and CPU utilization/throughput
- Linux's Completely Fair Scheduler (CFS) tracks each task's `vruntime` (virtual runtime, weighted by nice value) in a red-black tree and always picks the leftmost (least-run) node next, approximating an ideal fair-share multitasking model rather than using fixed quanta

## Why It Matters
- Maximizes CPU utilization, throughput, and fairness while minimizing response latency across competing processes and threads
- The choice of scheduling policy directly shapes user-perceived responsiveness — interactive desktop systems favor low response time (short quanta, priority boosts for I/O-bound tasks), while batch/HPC systems favor throughput (longer quanta, less context-switch overhead)
- Real-time operating systems (RTOS) extend scheduling with hard deadline guarantees (Rate Monotonic, Earliest Deadline First scheduling), which general-purpose OS schedulers like CFS do not provide

## Common Pitfalls
- Starvation: low-priority tasks never run if higher-priority tasks constantly arrive, mitigated via Aging (gradually increasing the priority of tasks that have waited too long)
- Priority Inversion: a high-priority thread blocks waiting for a resource held by a low-priority thread, while medium-priority threads preempt the low-priority holder and indirectly starve the high-priority thread — famously caused a watchdog-triggered reset on the Mars Pathfinder mission, fixed via Priority Inheritance
- Choosing too small a Round Robin quantum increases context-switch overhead until it dominates actual work; choosing too large a quantum makes RR degrade toward FCFS's poor interactive responsiveness
- Assuming a scheduler decision is purely about CPU time and ignoring cache/TLB effects — a context switch to a different process invalidates a large fraction of a CPU core's cache and TLB entries, an overhead that a naive throughput calculation misses

## Related Terms
- [[Process and Thread]]
- [[System Call]]
- [[Deadlock]]
- [[Priority Queue and Heap]]

## Example
Linux's Completely Fair Scheduler (CFS) uses a red-black tree keyed by `vruntime` to allocate CPU runtime proportionally.
```
Ready queue (Round Robin, quantum=4ms): P1(burst=10) P2(burst=4) P3(burst=6)
t=0  : P1 runs 0-4ms  (6ms remaining)
t=4  : P2 runs 4-8ms  (0ms remaining, done)
t=8  : P3 runs 8-12ms (2ms remaining)
t=12 : P1 runs 12-16ms (2ms remaining)
t=16 : P3 runs 16-18ms (done)
t=18 : P1 runs 18-20ms (done)
```
P2 finishes fastest despite arriving after P1, because Round Robin bounds how long any one process can hold the CPU before yielding to the next.
