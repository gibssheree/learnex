---
tags: [term, os, kernel]
category: Process & Threading
subcategory: Kernel Architecture
---

# System Call

**Definition:** The programmatic interface by which a user-mode application requests privileged services from the operating system kernel.

## How It Works
- CPU operates in CPU privilege rings: User Mode (Ring 3) vs Kernel Mode (Ring 0)
- Application sets sys-call number/args in registers and issues CPU trap instruction (`syscall` or `int 0x80`)
- CPU switches to Kernel Mode, executes kernel handler function, and returns result to User Mode

## Why It Matters
- Protects hardware, disk, memory, and network resources from unverified user-level code access

## Common Pitfalls
- Frequent system call invocation introduces context switch overhead (mitigated via user-space buffering)

## Related Terms
- [[Process and Thread]]
- [[I-O Multiplexing]]

## Example
Calling `read()`, `write()`, `fork()`, or `open()` in C triggers system calls into the OS kernel.
