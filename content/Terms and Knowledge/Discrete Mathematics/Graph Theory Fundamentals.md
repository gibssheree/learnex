---
tags: [term, math, graphs]
category: Graph Theory
---

# Graph Theory Fundamentals

**Definition:** The mathematical study of graphs—structures composed of vertices (nodes) connected by edges.

## How It Works
- Handshaking Lemma: sum of degrees of all vertices equals twice the number of edges: `∑ deg(v) = 2|E|`
- Eulerian Path: visits every edge exactly once
- Hamiltonian Path: visits every vertex exactly once
- Planar Graph: graph that can be drawn on a 2D plane without edges crossing (Euler's Formula: `V - E + F = 2`)

## Why It Matters
- Provides mathematical proofs underlying network topology, routing, social graphs, and circuit layout design

## Common Pitfalls
- Confusing Eulerian paths (polynomial O(E) solvable) with Hamiltonian paths (NP-Complete)

## Related Terms
- [[Set Theory]]
- [[Proof Techniques]]

## Example
Seven Bridges of Königsberg problem proved the non-existence of an Eulerian path.
