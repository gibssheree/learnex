---
tags: [term, dsa, data-structures, graphs]
category: Graphs & Algorithms
subcategory: Advanced Structures
---

# Disjoint Set Union (DSU)

**Definition:** A data structure (also called Union-Find) that tracks a partition of a set into disjoint subsets, supporting efficient Find and Union operations.

## How It Works
- `Find(x)`: identifies which subset x belongs to by walking parent pointers up to the subset's representative (root), applying Path Compression to flatten the tree on the way
- `Union(x, y)`: merges the subset containing x with the subset containing y by attaching one root under the other, applying Union by Rank/Size to always attach the smaller tree under the larger one
- Amortized time complexity per operation: near-constant O(α(n)), where α is the Inverse Ackermann function — for any practically conceivable n, α(n) <= 4, so operations are effectively O(1)
- Path Compression alone gives O(log n) amortized; combining it with Union by Rank/Size is what pushes the bound down to O(α(n))
- Supports an optional `Connected(x, y)` query implemented as `Find(x) == Find(y)`, and can track auxiliary per-component metadata (component size, sum, etc.) updated during Union

## Why It Matters
- Essential for Kruskal's minimum spanning tree algorithm, where edges are processed in weight order and DSU rejects any edge that would connect two nodes already in the same component (forming a cycle)
- Powers network connectivity checks and dynamic (online) graph cycle detection, where edges are added incrementally and connectivity must be answered after each addition
- Used in image processing (connected-component labeling of pixels) and compiler alias analysis, wherever "are these two things ultimately the same group" needs to be answered repeatedly and cheaply

## Common Pitfalls
- Forgetting Path Compression or Union by Rank/Size causes the tree to degenerate into a linear chain, degrading `Find` to O(n) per call
- Implementing Union by always attaching `x`'s root under `y`'s root regardless of subtree size defeats the purpose of Union by Size/Rank and reintroduces long chains
- Confusing "same component" with "adjacent" — DSU only answers reachability/grouping questions, not shortest-path distance between the two nodes
- Applying DSU to problems requiring the ability to *split* a set back apart — DSU is fundamentally an incremental-merge-only structure with no efficient `Split` operation

## Related Terms
- [[Graph Representation]]
- [[Sorting Algorithms]]
- [[Breadth-First Search (BFS)]]

## Example
Tracking connected components in a social network as new friend connections are formed.
```
parent = [0,1,2,3,4]         # 5 people, each their own component
union(0,1) -> parent[find(1)] = find(0)   # 0 and 1 now connected
union(2,3) -> parent[find(3)] = find(2)   # 2 and 3 now connected
find(1) == find(0)  -> True   # same friend group
find(1) == find(2)  -> False  # different friend group
union(1,2)          # merges the two friend groups into one
find(0) == find(3)  -> True   # now transitively connected
```
