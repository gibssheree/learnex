---
tags: [term, dsa, trees]
category: Hash & Tree Structures
subcategory: Trees & Graphs
---

# Binary Search Tree (BST)

**Definition:** A node-based binary tree where the left subtree contains nodes with keys smaller than the node, and the right subtree contains nodes with keys greater, recursively, for every node in the tree.

## How It Works
- Enables O(log n) search, insertion, and deletion on average by discarding half the remaining candidates at each comparison step
- Search: start at root, go left if target < node.key, right if target > node.key, stop when found or a null child is reached
- Insertion follows the same search path and attaches the new node as a leaf at the first null child encountered
- Deletion has three cases: leaf node (remove directly), one child (splice child into parent), two children (replace with in-order successor — the leftmost node of the right subtree — then delete that successor)
- In-order traversal (left, node, right) yields keys in sorted ascending order in O(n) time; pre-order and post-order traversals are used for tree copying and safe deletion respectively
- Degenerates to a linked list with O(n) operations if items are inserted in already-sorted order without self-balancing, since every new node only ever has one child

## Why It Matters
- Forms the conceptual foundation for self-balancing search trees ([[AVL Tree and Red-Black Tree]]) and database indexes that need ordered range queries, not just point lookups
- Unlike a [[Hash Table]], a BST preserves sorted order, so operations like "find all keys between X and Y" or "find the next largest key" run in O(log n + k) instead of requiring a full O(n) scan
- Serves as the teaching baseline before more advanced structures (B-Trees, Red-Black Trees, Tries) because the recursive definition maps directly onto recursive algorithms

## Common Pitfalls
- Unbalanced trees degrade performance from logarithmic O(log n) to linear O(n) — inserting already-sorted data into a naive BST is a classic worst case
- Implementing deletion for the two-children case incorrectly (e.g., forgetting to also delete the successor node from its original position) creates duplicate keys or a corrupted tree
- Assuming a BST guarantees O(log n) without checking whether the implementation self-balances — a plain BST offers no such guarantee
- Comparing keys with `==` reference equality instead of a proper comparator when using custom objects, causing search to fail to find existing keys

## Related Terms
- [[AVL Tree and Red-Black Tree]]
- [[Binary Search]]
- [[Recursion]]
- [[Database Indexing]]

## Example
Using a BST to keep a dynamic dataset sorted while allowing fast lookups. Inserting `50, 30, 70, 20, 40` builds a tree rooted at 50 with `30` and `70` as children; searching for `40` compares against 50 (go left), then 30 (go right), then finds 40 in 3 hops instead of scanning all 5 elements — and an in-order traversal of this tree yields `20, 30, 40, 50, 70`.
