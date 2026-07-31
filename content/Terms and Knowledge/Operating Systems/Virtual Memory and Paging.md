---
tags: [term, os, memory]
category: Memory Management
---

# Virtual Memory and Paging

**Definition:** A memory management capability that provides processes with the illusion of vast contiguous memory while mapping virtual addresses to physical RAM pages via page tables.

## How It Works
- Divides virtual address space into fixed-size Pages (typically 4KB) and RAM into physical Page Frames
- MMU translates virtual address to physical address using Page Tables and TLB (Translation Lookaside Buffer) hardware cache
- Page Fault: triggered when accessed page is not loaded in RAM; OS fetches page from disk/swap

## Why It Matters
- Provides strict memory isolation between processes, prevents unauthorized access, and allows running programs larger than physical RAM

## Common Pitfalls
- Thrashing: excessive swapping between RAM and disk when working set exceeds available RAM, crashing performance

## Related Terms
- [[Process and Thread]]
- [[Memory Allocation]]

## Example
Attempting to access address `0x00000000` (null pointer) triggers a Segmentation Fault via MMU page protection fault.
