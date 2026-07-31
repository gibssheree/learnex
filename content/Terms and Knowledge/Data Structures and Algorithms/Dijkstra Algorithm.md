---
tags: [term, dsa, algorithms, graphs, shortest-path]
category: Graphs & Algorithms
subcategory: Graph Algorithms
---

# Dijkstra Algorithm

**Definition:** A greedy single-source shortest path algorithm that finds the minimum-cost path from a source node to every other node in a graph with non-negative edge weights.

## How It Works
- Maintains a priority queue (min-heap) of tentative node distances, initialized to `0` for the source and `infinity` for all others
- Repeatedly extracts the unvisited node with the smallest tentative distance, marks it finalized, and relaxes its outgoing edges: `if dist[u] + weight(u,v) < dist[v]: dist[v] = dist[u] + weight(u,v)`
- Time complexity: O((V + E) log V) with a binary heap priority queue; O(V^2) with a naive array-based implementation (faster on dense graphs); O(E + V log V) with a Fibonacci heap
- Correctness relies on the greedy choice property: once a node is popped with its finalized minimum distance, no future relaxation can improve it — this only holds because edge weights are non-negative
- Can be terminated early once the target node is popped from the priority queue, avoiding computing distances to the entire graph when only one destination is needed

## Why It Matters
- Core algorithm for network routing protocols (OSPF uses Dijkstra internally to compute shortest paths across link-state advertisements) and map navigation systems
- Serves as the direct ancestor of A* search, which adds a heuristic function to prioritize nodes likely to be near the goal, dramatically pruning the search space in practice
- Demonstrates the greedy-algorithm-with-priority-queue pattern reused across many other shortest-path and MST problems (e.g., Prim's algorithm shares nearly identical structure)

## Common Pitfalls
- Fails or produces incorrect results on graphs containing negative edge weights, since the greedy finalize-on-pop assumption breaks — Bellman-Ford (O(V*E)) must be used instead when negative weights are possible
- Re-inserting a node into the priority queue on every relaxation instead of decreasing its key can bloat the heap; most implementations simply allow stale duplicate entries and skip them via a `visited` check on pop
- Using Dijkstra when all edge weights are equal is wasted overhead — plain [[Breadth-First Search (BFS)]] solves that case in O(V + E) without a heap
- Forgetting that Dijkstra computes shortest paths *from a single source*, not all-pairs — for all-pairs shortest paths, Floyd-Warshall (O(V^3)) or running Dijkstra from every node is required instead

## Related Terms
- [[Priority Queue and Heap]]
- [[Breadth-First Search (BFS)]]
- [[Graph Representation]]
- [[BGP and Autonomous Systems]]

## Example
GPS navigation computing the fastest driving route considering road distance weights. On a graph with edges `A-B(4), A-C(1), C-B(2), B-D(5), C-D(8)`, Dijkstra from A pops C first (distance 1), relaxes B to `1+2=3` (better than the direct `A-B` edge of 4), then pops B (distance 3), then relaxes D to `3+5=8` — finding `A -> C -> B -> D` (cost 8) is at least as good as any other path, beating the naive `A -> C -> D` (cost 9).
