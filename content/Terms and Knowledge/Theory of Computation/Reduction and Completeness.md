---
tags: [term, theory, complexity]
category: Complexity Theory
---

# Reduction and Completeness

**Definition:** Reduction is a technique of transforming one computational problem into another to demonstrate relative hardness; Completeness identifies the hardest problems within a complexity class.

## How It Works
- Polynomial-Time Reduction (A <=p B): converts instance of problem A to instance of problem B in polynomial time
- If A <=p B and B is solvable in polynomial time, then A is also solvable in polynomial time
- Cook-Levin Theorem: proved 3-SAT is NP-Complete, opening the door to proving hundreds of other NP-Complete problems via reduction

## Why It Matters
- Saves researchers from wasting time seeking non-existent polynomial algorithms for NP-Complete problems, steering them toward heuristics/approximation algorithms instead

## Common Pitfalls
- Reducing in the wrong direction (reducing an easy problem to a hard problem proves nothing about the hard problem's complexity)

## Related Terms
- [[P vs NP Complexity Classes]]
- [[Turing Machine]]

## Example
Reducing 3-SAT to Graph Coloring proves Graph 3-Colorability is NP-Complete.
