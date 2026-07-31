---
tags: [term, dsa, algorithms, graphs]
category: Graphs & Algorithms
subcategory: Graph Algorithms
---

# Depth-First Search (DFS)

**Definition:** A graph traversal algorithm that explores as deep as possible along each branch before backtracking to explore the next unvisited branch.

## How It Works
- Uses a Stack (LIFO) explicitly, or an implicit call stack via recursion — the two are equivalent in behavior
- Maintains a visited set to track discovered nodes and prevent infinite loops on cyclic graphs
- Time complexity: O(V + E); Space complexity: O(V) worst-case stack depth (a long chain graph)
- Produces three useful node classifications during traversal: discovery time, finish time, and edge types (tree edge, back edge, forward edge, cross edge) — back edges specifically indicate a cycle
- Iterative-deepening DFS (IDDFS) combines DFS's low memory footprint with BFS's shortest-path guarantee by re-running depth-limited DFS with increasing limits, useful when the graph is too large to hold a full BFS frontier

## Why It Matters
- Ideal for topological sorting (via post-order finish times), cycle detection (via back-edge detection), connected component labeling, and solving mazes/puzzles via backtracking
- Uses far less memory than [[Breadth-First Search (BFS)]] on graphs with a huge branching factor but modest depth, since it only ever holds one root-to-leaf path on the stack
- Underlies compiler dependency resolution (topological sort of a build graph) and tools like `git`'s reachability analysis for garbage-collecting unreachable commits

## Common Pitfalls
- Does NOT guarantee shortest path in unweighted graphs — it can return a much longer path than [[Breadth-First Search (BFS)]] would
- Can cause stack overflow on very deep graphs if implemented recursively (e.g., a linked-list-shaped graph with 100,000 nodes) — an explicit iterative stack avoids this limit
- Failing to distinguish "currently on the recursion stack" from "fully visited" breaks cycle detection in directed graphs — a node finished and popped is not the same as a node still being explored
- Traversing an undirected graph and treating the edge back to the immediate parent as a false cycle, unless that parent edge is explicitly excluded

## Related Terms
- [[Breadth-First Search (BFS)]]
- [[Recursion]]
- [[Stack and Queue]]
- [[Sorting Algorithms]]

## Example
Detecting cycles in dependency graphs during build system execution.
```
visit(A): mark A as "in progress"
  visit(B): mark B as "in progress"
    visit(A): A is already "in progress" -> CYCLE DETECTED
```
On graph `A -> B -> C -> A`, DFS descends A -> B -> C, then finds C's only edge points back to A, which is still on the active recursion stack — signaling a cycle rather than a completed path.
