---
tags: [term, dsa, data-structures, linked-list]
category: Linear Data Structures
---

# Linked List

**Definition:** A linear data structure where elements (nodes) store a data payload and references (pointers) to adjacent nodes, without requiring contiguous memory allocation.

## How It Works
- Singly Linked List: each node points only to the next node; traversal is one-directional and deleting a node requires a reference to its predecessor
- Doubly Linked List: each node points to both the previous and next nodes, enabling O(1) removal given only a reference to the node itself, and bidirectional traversal
- Circular Linked List: the tail node points back to the head instead of `null`, useful for round-robin scheduling and buffer structures
- Allows O(1) insertion and deletion at a known node location without shifting any other elements, unlike an array
- Maintaining a `tail` pointer alongside `head` turns append-to-end from O(n) into O(1); without it, appending requires walking the entire list first

## Why It Matters
- Efficient for workloads with frequent insertion/deletion in the middle of a sequence, since no bulk shifting or reallocation is required
- Forms the building block for other structures: [[Stack and Queue]] implementations, adjacency lists in [[Graph Representation]], and the chaining collision strategy inside a [[Hash Table]]
- LRU cache implementations classically pair a doubly linked list (for O(1) reordering of recency) with a hash table (for O(1) key lookup) to get both properties at once

## Common Pitfalls
- Sequential access takes O(n) time — there is no random indexing, so algorithms assuming array-like O(1) access (like [[Binary Search]]) silently become O(n log n) or worse if ported naively to a linked list
- Extra memory overhead for storing pointer references per element — roughly 8-16 bytes of pointer overhead per node on a 64-bit system, which can dominate the payload size for small elements like integers
- Poor CPU cache performance due to non-contiguous memory allocation — nodes scattered across the heap cause cache misses on every hop, making linked-list traversal much slower in practice than an array traversal of the same logical size
- Losing the only reference to the rest of the list (e.g., overwriting `head` before saving it) leaks the remaining nodes with no way to reach or free them in unmanaged languages

## Related Terms
- [[Array and Dynamic Array]]
- [[Stack and Queue]]
- [[Hash Table]]

## Example
Implementing an undo history buffer where nodes can be quickly added or removed at pointer locations.
```
head -> [Edit1] <-> [Edit2] <-> [Edit3] <- tail
```
Undoing `Edit3` just moves a `current` pointer from `Edit3` to `Edit2` in O(1) — no data is copied or shifted, unlike removing the last element of a plain array-backed list, which is already O(1) too, but removing from the *middle* of that array would cost O(n) versus O(1) for the doubly linked list given a direct node reference.
