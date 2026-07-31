---
tags: [term, dsa, data-structures, heaps]
category: Hash & Tree Structures
subcategory: Trees & Graphs
---

# Priority Queue and Heap

**Definition:** A Priority Queue is an abstract data type where elements have priorities and are served highest-priority-first; a Heap (Min-Heap or Max-Heap) is the complete binary tree, implemented in a flat array, that provides O(1) top access and O(log n) insertion/deletion used to implement it.

## How It Works
- Min-Heap maintains the invariant `parent <= child` for every node (so the minimum is always at the root); Max-Heap maintains `parent >= child`
- Array representation avoids pointers entirely: for index `i`, the left child is at `2i+1`, the right child at `2i+2`, and the parent at `floor((i-1)/2)` — this is what makes heaps compact and cache-friendly compared to pointer-based trees
- Insertion appends the new element at the end of the array then repeatedly swaps it with its parent while it violates the heap property ('sift-up' / 'heapify-up'), an O(log n) operation
- Removing the root swaps it with the last array element, shrinks the array by one, then repeatedly swaps the new root down with its smaller/larger child until the property holds again ('sift-down' / 'heapify-down'), also O(log n)
- Building a heap from n unsorted elements takes O(n), not O(n log n), because most nodes near the bottom need very few sift-down swaps — this tighter bound (`heapify`) is what makes HeapSort's construction phase linear

## Why It Matters
- Essential for [[Dijkstra Algorithm]]'s shortest path algorithm, A* search, task/job schedulers that must always run the highest-priority ready item next, and event-driven simulations ordered by timestamp
- HeapSort derives directly from the heap structure: build a max-heap in O(n), then repeatedly extract the max in O(log n) each, giving a guaranteed O(n log n) in-place sort with no worst-case degradation, unlike QuickSort
- Bounded priority queues (keep only the top-k elements) let you find the k largest/smallest items in a huge stream using only O(k) memory instead of sorting the entire dataset

## Common Pitfalls
- Searching for an arbitrary (non-root) element inside a heap takes linear O(n) time — a heap is optimized only for finding/removing the extreme element, not general lookup
- Assuming a heap is fully sorted — only the root is guaranteed to be the min/max; sibling and cousin nodes have no defined order relative to each other
- Decreasing a key's priority in-place (needed for algorithms like Dijkstra with decrease-key) isn't supported by a plain array-backed heap without also tracking each element's array index externally
- Confusing a Priority Queue's logical contract (highest priority served first) with its typical Binary Heap implementation — Fibonacci heaps and pairing heaps implement the same contract with different complexity tradeoffs, notably O(1) amortized decrease-key

## Related Terms
- [[Dijkstra Algorithm]]
- [[Sorting Algorithms]]
- [[CPU Scheduling]]

## Example
OS process schedulers use priority queues to always run the highest priority ready process next.
```
Min-heap array: [2, 5, 4, 8, 9, 7]
        2
      /   \
     5     4
    / \   /
   8   9 7
insert(1): append -> [2,5,4,8,9,7,1] -> sift-up swaps 1 with 4, then with 2 -> [1,5,2,8,9,7,4]
```
After `insert(1)`, the new minimum `1` rises to the root in 2 swaps (O(log n)) rather than requiring a full O(n) re-sort of the array.
