---
tags: [term, ai]
category: Foundations
---

# Search Algorithms

**Definition:** Methods for finding a path or solution through a problem space, foundational to classical (pre-deep-learning) AI.

## How It Works
- Uninformed search: BFS, DFS, uniform-cost — explore without domain knowledge
- Informed search: A*, greedy best-first — use heuristics to prioritize promising paths
- Adversarial search: minimax, alpha-beta pruning — used in game-playing AI

## Why It Matters
- Powers pathfinding (maps, robotics), puzzle solvers, and classic game AI (chess engines)
- Still relevant even in the LLM era for planning and tool-use chains

## Common Pitfalls
- Using uninformed search when a good heuristic is available (wastes compute)
- Forgetting cycle/visited-state checks, causing infinite loops in graph search

## Related Terms
- [[Intelligent Agent]]
- [[Knowledge Representation]]

## Example
A* search with the straight-line-distance heuristic finds the shortest driving route on a map efficiently.
