---
tags: [term, os, memory]
category: Memory Management
---

# Memory Allocation

**Definition:** The mechanism by which operating systems and runtime environments assign memory regions to programs for stack variables and dynamic heap objects.

## How It Works
- Stack Allocation: contiguous memory push/pop controlled by CPU stack pointer; extremely fast, limited capacity, scope-bound
- Heap Allocation: dynamic runtime memory requested via `malloc`/`new`; persistent until freed
- Internal vs External Fragmentation managed by allocators (dlmalloc, jemalloc, tcmalloc) using free-lists or buddy allocators

## Why It Matters
- Efficient memory allocation prevents memory leaks, dangling pointers, and heap fragmentation

## Common Pitfalls
- Use-after-free, double-free, and buffer overflow vulnerabilities caused by manual memory mismanagement

## Related Terms
- [[Virtual Memory and Paging]]
- [[Process and Thread]]

## Example
C `malloc(1024)` requests dynamic heap memory, which must be manually released using `free(ptr)`.
