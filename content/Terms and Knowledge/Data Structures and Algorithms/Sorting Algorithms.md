---
tags: [term, dsa, algorithms, sorting]
category: Algorithms & Paradigms
subcategory: Algorithms
---

# Sorting Algorithms

**Definition:** Fundamental algorithms for arranging elements of a list in a specified comparison order (e.g., ascending or descending), typically evaluated on time complexity, space complexity, and stability.

## How It Works
- QuickSort: divide-and-conquer using pivot partitioning — elements less than the pivot go left, greater go right, then recurse on each side. Average O(n log n), worst O(n^2) (triggered by a consistently bad pivot choice, e.g. always picking the first element on already-sorted input), in-place with O(log n) recursion stack
- MergeSort: divide-and-conquer that splits the list into halves, sorts each recursively, and merges the two sorted halves. Guaranteed O(n log n) in all cases, stable, but requires O(n) auxiliary space for the merge step
- HeapSort: builds a binary heap (see [[Priority Queue and Heap]]) in O(n), then repeatedly extracts the min/max in O(log n) each. O(n log n) worst case, in-place, but not stable and has worse real-world cache locality than QuickSort
- Insertion Sort: O(n^2) worst case but O(n) on nearly-sorted data and has very low constant overhead, which is why production sorts (Timsort in Python/Java, Introsort in C++) fall back to it for small partitions (typically n < 16-64)
- Topological Sort: orders vertices in a Directed Acyclic Graph (DAG) such that for every edge u -> v, u comes before v in the output. O(V + E), implemented via repeated removal of zero-in-degree nodes (Kahn's algorithm) or DFS post-order reversal
- Stability means elements with equal keys retain their original relative order after sorting — MergeSort and Insertion Sort are stable by construction; standard in-place QuickSort and HeapSort are not

## Why It Matters
- Enables fast [[Binary Search]] O(log n) lookups and underpins database query execution engines, where sorted intermediate results make merge-joins and range queries efficient
- The choice of algorithm has real production consequences: Python's `sorted()`/Java's `Collections.sort()` use Timsort (a hybrid of merge sort and insertion sort) specifically because real-world data often contains pre-sorted runs that Timsort exploits for near-linear performance
- Topological sort specifically underlies build systems (compiling files in dependency order), package manager install order resolution, and spreadsheet formula recalculation order

## Common Pitfalls
- Choosing an unstable sorting algorithm when the original relative order of equal keys must be preserved (e.g., sorting orders by status while keeping them submission-ordered within each status)
- Assuming QuickSort's average O(n log n) always holds — a naive first-or-last-element pivot on already-sorted or reverse-sorted input degrades to O(n^2); randomized or median-of-three pivot selection mitigates this
- Running Topological Sort on a graph containing a cycle — Kahn's algorithm will silently terminate with fewer than V nodes processed rather than throwing an obvious error, and that residual count must be checked explicitly
- Ignoring space complexity constraints — MergeSort's O(n) auxiliary space can be a real problem sorting massive datasets in memory-constrained environments where in-place HeapSort or QuickSort would be preferable

## Related Terms
- [[Big-O Notation]]
- [[Binary Search]]
- [[Priority Queue and Heap]]
- [[Disjoint Set Union (DSU)]]

## Example
Sorting customer records by last name, then by first name, requires a stable sort so that a prior sort pass by first name isn't destroyed by the second pass on last name.
```
MergeSort([38, 27, 43, 3]):
  split -> [38, 27], [43, 3]
  split -> [38],[27]   [43],[3]
  merge -> [27, 38]    [3, 43]
  merge -> [3, 27, 38, 43]
```
Each split is O(1), each merge of two sorted halves is O(n) — with log n split levels, total work is O(n log n) regardless of the input's original order.
