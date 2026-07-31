---
tags: [term, dsa, graphs, data-structures]
category: Graphs & Algorithms
subcategory: Trees & Graphs
---

# Graph Representation

**Definition:** Data structures used to represent graphs consisting of vertices (nodes) and edges (connections), primarily Adjacency Matrix and Adjacency List.

## How It Works
- Adjacency Matrix: 2D boolean/weight array of size V x V where `matrix[i][j]` stores whether (and how heavily) i connects to j; gives O(1) edge lookup but O(V^2) space overhead — ideal for dense graphs where E is close to V^2
- Adjacency List: array/map of lists where index u stores the neighbors of vertex u; gives O(V + E) space overhead and O(degree(u)) edge lookup — ideal for sparse graphs where E is much smaller than V^2
- Edge List: a flat list of `(u, v, weight)` tuples; minimal O(E) space and simplest to sort, making it the natural representation for edge-order-dependent algorithms like Kruskal's MST
- Directed vs undirected graphs affect representation symmetry: an undirected edge `u-v` appears twice in an adjacency list (once under u, once under v) or as a symmetric pair in the matrix
- Weighted graphs replace the boolean matrix entry / list membership with a numeric weight (or `infinity`/`0` to denote "no edge" in the matrix case)

## Why It Matters
- Choosing the right graph representation directly determines the time and memory efficiency of every graph algorithm run on top of it — the same [[Dijkstra Algorithm]] runs in O(V^2) on a matrix versus O((V+E) log V) on an adjacency list with a heap
- Adjacency lists are the default choice in most real-world graphs (social networks, road networks, dependency graphs) because those graphs are naturally sparse — average node degree is small relative to total node count
- Matrix representation enables fast algebraic graph algorithms (e.g., counting paths of length k via matrix exponentiation, or all-pairs reachability via Boolean matrix multiplication) that adjacency lists can't do as directly

## Common Pitfalls
- Using an Adjacency Matrix on massive sparse graphs wastes enormous memory on 0-entries — a 1-million-node social graph would need a 10^12-cell matrix, which is infeasible
- Forgetting to add both directions for an undirected edge in an adjacency list causes traversal algorithms to silently miss valid paths
- Choosing an Adjacency Matrix when the algorithm's dominant cost is "iterate over all neighbors of a node" (as in BFS/DFS) turns an O(degree) operation into an unnecessary O(V) scan per node
- Not accounting for self-loops or multi-edges (parallel edges between the same two nodes) when the chosen representation and algorithm assume a simple graph

## Related Terms
- [[Breadth-First Search (BFS)]]
- [[Depth-First Search (DFS)]]
- [[Dijkstra Algorithm]]
- [[Disjoint Set Union (DSU)]]

## Example
Social networks with millions of users use adjacency lists because each user connects to a tiny fraction of the total user base.
```
Adjacency List for A-B, A-C, B-C:
A: [B, C]
B: [A, C]
C: [A, B]

Adjacency Matrix for the same graph:
    A  B  C
A [ 0  1  1 ]
B [ 1  0  1 ]
C [ 1  1  0 ]
```
The list uses 6 total entries; the matrix uses 9 cells (with 3 wasted on the diagonal) — the gap widens dramatically as graphs scale to millions of sparsely-connected nodes.
