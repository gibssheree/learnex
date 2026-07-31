---
tags: [term, dsa, algorithms, graphs]
category: Graphs & Algorithms
subcategory: Graph Algorithms
---

# Breadth-First Search (BFS)

**Definition:** A graph traversal algorithm that explores nodes level-by-level, visiting all immediate neighbors before moving to the next distance layer.

## How It Works
- Uses a Queue (FIFO) to track nodes to explore: dequeue a node, enqueue all its unvisited neighbors, repeat
- Maintains a visited set (marked at enqueue time, not dequeue time) to avoid revisiting nodes and looping forever in cyclic graphs
- Time complexity: O(V + E); Space complexity: O(V) for the queue and visited set in the worst case (a wide, shallow graph)
- Naturally computes shortest-path distance in *edges* from the source to every reachable node, since it exhausts each distance layer completely before advancing to the next
- Can reconstruct the actual shortest path (not just distance) by storing a `parent[]` pointer for each node when it's first discovered, then walking parents back from target to source

## Why It Matters
- Guarantees finding the shortest path in unweighted graphs between a start node and any target node — this guarantee fails for weighted graphs, where [[Dijkstra Algorithm]] is required instead
- Layer-by-layer exploration makes BFS the natural fit for problems phrased as "minimum number of steps/moves/hops"
- Bidirectional BFS (searching simultaneously from both source and target) can cut the effective search space from O(b^d) to O(b^(d/2)) for branching factor b and depth d — a huge win in large graphs like social networks

## Common Pitfalls
- Consumes significant memory when exploring graphs with large branching factors, since an entire frontier layer can be in the queue simultaneously
- Marking nodes visited at dequeue time instead of enqueue time allows the same node to be added to the queue multiple times, wasting work and in some implementations breaking correctness
- Using BFS on a weighted graph and assuming it still finds the shortest path — it only counts edge hops, ignoring edge weights entirely
- Forgetting the visited check entirely causes infinite loops on any graph containing a cycle

## Related Terms
- [[Depth-First Search (DFS)]]
- [[Stack and Queue]]
- [[Dijkstra Algorithm]]
- [[Graph Representation]]

## Example
Finding the fewest flight connections between two airports. On a graph `A-B, A-C, B-D, C-D, D-E`, BFS from `A` explores layer 0 `{A}`, layer 1 `{B, C}`, layer 2 `{D}`, layer 3 `{E}` — reaching `E` in 3 hops via either `A-B-D-E` or `A-C-D-E`, both discovered simultaneously since BFS explores all of layer 1 and 2 before touching layer 3.
