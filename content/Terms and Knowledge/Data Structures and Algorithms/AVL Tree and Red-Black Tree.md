---
tags: [term, dsa, trees, balanced-trees]
category: Hash & Tree Structures
subcategory: Trees & Graphs
---

# AVL Tree and Red-Black Tree

**Definition:** Self-balancing binary search trees that automatically adjust node heights via tree rotations to guarantee O(log n) worst-case operation bounds.

## How It Works
- AVL Tree: strict height balancing enforced by a Balance Factor `BF = height(left) - height(right)` kept in {-1, 0, 1} at every node; a violation after insert/delete triggers a rotation (LL, RR, LR, or RL case)
- Red-Black Tree: relaxes balance using 5 coloring invariants (root is black, red nodes have only black children, every root-to-null path has the same black-height) so the longest path is never more than 2x the shortest
- AVL guarantees a tighter height bound (~1.44 log₂(n+2)) than Red-Black (~2 log₂(n+1)), so AVL lookups are faster but AVL insert/delete does more rotations on average
- Rotations are O(1) pointer operations; at most O(log n) rotations cascade up an AVL tree per insert, while Red-Black insert needs at most 2 rotations plus O(log n) recolorings
- Deletion is the hardest case in both: it can require rebalancing all the way to the root, unlike insertion which often stops after one fix-up

## Why It Matters
- Guarantees robust O(log n) worst-case performance under arbitrary insert/delete order, unlike a plain [[Binary Search Tree (BST)]] which degrades to O(n) on sorted input
- Red-Black trees favor write-heavy workloads (fewer rotations) which is why they back general-purpose ordered map/set libraries; AVL favors read-heavy workloads (tighter balance, faster lookups)
- Underpins Linux's Completely Fair Scheduler run-queue and virtual memory area (VMA) tracking, both implemented as Red-Black trees in the kernel

## Common Pitfalls
- Implementing rotation logic without correctly updating parent pointers corrupts the tree silently — bugs only surface on later traversals
- Forgetting to rebalance on the walk back up after deletion (not just insertion) leaves the tree unbalanced despite passing insert-only tests
- Choosing AVL for a write-heavy cache or index when a Red-Black tree (or a B-Tree for disk-backed structures) would need far fewer rotations
- Off-by-one errors in balance factor comparisons (`>1` vs `>=1`) silently permit an unbalanced tree to pass shallow unit tests

## Related Terms
- [[Binary Search Tree (BST)]]
- [[Priority Queue and Heap]]
- [[Recursion]]
- [[Database Indexing]]

## Example
C++ `std::map`/`std::set` and Java `TreeMap`/`TreeSet` are typically implemented using Red-Black Trees. Inserting `10, 20, 30` into an AVL tree in sorted order triggers an immediate RR rotation after the third insert (since `10->20->30` would otherwise form a linked-list chain), rebalancing to a tree rooted at `20` with `10` and `30` as children — height stays at 1 instead of growing to 2.
