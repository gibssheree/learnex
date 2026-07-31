---
tags: [term, theory, complexity]
category: Complexity Theory
---

# P vs NP Complexity Classes

**Definition:** Central open problem in theoretical computer science asking whether every problem whose solution can be verified quickly (NP) can also be solved quickly (P).

## How It Works
- Class P: decision problems solvable by a deterministic Turing machine in Polynomial time O(n^k)
- Class NP: decision problems whose solution can be VERIFIED in polynomial time by a deterministic machine
- NP-Complete: the hardest problems in NP; if ANY single NP-Complete problem is solved in polynomial time, then P = NP
- NP-Hard: problems at least as hard as NP-Complete (may not be in NP)

## Why It Matters
- Governs modern cryptography (RSA encryption relies on factorization being in NP but not in P)

## Common Pitfalls
- Confusing NP with 'Non-Polynomial' (NP stands for Nondeterministic Polynomial time)

## Related Terms
- [[Turing Machine]]
- [[Reduction and Completeness]]

## Example
Traveling Salesperson Problem (TSP) and Boolean Satisfiability (SAT) are classic NP-Complete problems.
