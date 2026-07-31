---
tags: [term, dsa, algorithms, searching]
category: Algorithms & Paradigms
subcategory: Algorithms
---

# Binary Search

**Definition:** An efficient search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.

## How It Works
- Compares target with the middle element; if matched, returns the index immediately
- If target is smaller, discards the right half and recurses/loops on the left half; if larger, discards the left half
- Time complexity: O(log n); Space complexity: O(1) iterative, O(log n) recursive (due to call stack frames)
- Can be generalized beyond exact-match search into "find the first/last position satisfying a predicate" — this variant (sometimes called binary search on the answer) powers `lower_bound`/`upper_bound` in C++ and `bisect_left`/`bisect_right` in Python's `bisect` module
- Requires random access (O(1) indexing) to be efficient — running binary search over a [[Linked List]] loses the log n benefit because reaching the middle element itself takes O(n)

## Why It Matters
- Reduces search operations dramatically — searching 1 million sorted items takes at most 20 comparisons instead of up to 1,000,000
- The "binary search on the answer" pattern extends far beyond arrays: it's used to find optimal thresholds in optimization problems (e.g., minimum capacity, maximum feasible value) whenever the search space is monotonic
- `git bisect` applies the same divide-and-conquer idea to find the exact commit that introduced a regression in O(log n) test runs instead of a linear commit-by-commit search

## Common Pitfalls
- Applying binary search on unsorted arrays yields incorrect, silently-wrong results rather than an obvious error
- Integer overflow bug in calculating the middle index `mid = (low + high) / 2` when low+high exceeds the integer range (use `mid = low + (high - low) / 2` instead) — this exact bug shipped in the JDK's `Arrays.binarySearch` for years
- Off-by-one errors in loop bounds (`low <= high` vs `low < high`) cause infinite loops or missed edge elements — always verify termination on a 1-element and 0-element array
- Forgetting that duplicate values require extra logic to consistently find the first or last occurrence rather than an arbitrary match

## Related Terms
- [[Big-O Notation]]
- [[Array and Dynamic Array]]
- [[Binary Search Tree (BST)]]
- [[Sorting Algorithms]]

## Example
Looking up a word in a dictionary, or `git bisect` binary-searching a commit history to isolate a regression. Searching for `23` in `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` (10 elements): check index 4 (`16`, too small, go right) -> check index 7 (`56`, too big, go left) -> check index 5 (`23`, found) — 3 comparisons instead of scanning up to 10.

```
low=0 high=9 mid=4 arr[4]=16 < 23 -> low=5
low=5 high=9 mid=7 arr[7]=56 > 23 -> high=6
low=5 high=6 mid=5 arr[5]=23 == 23 -> found at index 5
```
