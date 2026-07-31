---
tags: [term, quantum, algorithms]
category: Algorithms & Circuits
---

# Grover's Algorithm

**Definition:** A quantum algorithm that searches an unsorted list quadratically faster than any classical algorithm can, turning an O(n) classical search into roughly O(√n) on a quantum computer.

## How It Works
- Uses [[Superposition]] to effectively evaluate multiple entries at once, then repeatedly applies quantum operations that amplify the probability of the correct answer while suppressing incorrect ones
- After enough iterations, measuring the system returns the correct answer with high probability
- A quadratic speedup is meaningfully faster, but far less dramatic than [[Shor's Algorithm]]'s exponential speedup for factoring

## Why It Matters
- Demonstrates that quantum computing's advantage isn't limited to one narrow problem (factoring), it applies to a broader, more general class of search problems too

## Common Pitfalls
- Confusing its quadratic speedup with the more dramatic exponential speedup of algorithms like Shor's, they solve fundamentally different problems with very different practical impact
- Assuming it provides an advantage for problems that already have efficient classical search methods (like sorted or structured data), its advantage is specifically for unsorted search

## Related Terms
- [[Shor's Algorithm]]
- [[Quantum Gate]]
- [[Big-O Notation]]

## Example
Searching an unsorted database of a million entries classically takes up to a million checks in the worst case; Grover's Algorithm could do it in roughly a thousand steps on a quantum computer.
