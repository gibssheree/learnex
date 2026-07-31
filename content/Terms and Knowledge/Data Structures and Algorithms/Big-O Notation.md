---
tags: [term, dsa, complexity, algorithm-analysis]
category: Foundations & Complexity
---

# Big-O Notation

**Definition:** A mathematical notation used to describe the upper bound of an algorithm's execution time or memory usage in terms of input size (n).

## How It Works
- Focuses on asymptotic behavior as input size n grows towards infinity — behavior on small inputs is explicitly ignored
- Ignores constant factors and lower-order terms (e.g., `O(3n^2 + 5n + 10)` simplifies to `O(n^2)`), because those terms are dominated as n grows
- Formal definition: `f(n) = O(g(n))` if there exist positive constants `c` and `n0` such that `f(n) <= c*g(n)` for all `n >= n0`
- Common complexity classes ranked from best to worst: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n^2) quadratic, O(2^n) exponential, O(n!) factorial
- Sibling notations complete the picture: Big-Omega (Ω) describes the *lower* bound (best case), Big-Theta (Θ) describes a *tight* bound (both upper and lower), and small-o describes a strict (non-tight) upper bound
- Applies equally to time complexity and space complexity — space complexity must also account for auxiliary memory used beyond the input itself (e.g., recursion call stack frames)

## Why It Matters
- Allows developers to compare algorithmic efficiency independent of hardware, compiler, and execution environment
- Crucial for selecting scalable solutions when dealing with large datasets — an O(n^2) algorithm that "works fine" on 1,000 rows can take hours on 10 million rows
- Underpins technical interviews and code review discussions as the shared vocabulary for reasoning about scalability before code ships

## Common Pitfalls
- Ignoring constant factors when n is small — an O(n^2) insertion sort with tiny constants can beat an O(n log n) merge sort for n < ~50, which is why hybrid sorts (Timsort, Introsort) fall back to insertion sort on small partitions
- Confusing worst-case Big-O with average-case (e.g., quicksort is O(n log n) average but O(n^2) worst-case on already-sorted input with a naive pivot choice)
- Treating amortized complexity (like dynamic array append) as if every single operation is guaranteed that cost, rather than the cost averaged over a sequence of operations
- Forgetting hidden costs inside library calls — e.g., `list.pop(0)` in Python is O(n), not O(1), because it shifts every remaining element

## Related Terms
- [[Array and Dynamic Array|Array]]
- [[Binary Search]]
- [[Sorting Algorithms|QuickSort]]
- [[Dynamic Programming]]
- [[Recursion]]

## Example
Searching an unsorted array of size n sequentially takes O(n) time in the worst case, whereas accessing an element by index takes O(1) time. Concretely, for n = 1,000,000: a linear scan needs up to 1,000,000 comparisons, binary search on sorted data needs at most ~20 (log₂ 1,000,000 ≈ 19.9), and a hash table lookup needs roughly 1 on average.
