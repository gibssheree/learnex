---
tags: [term, dsa, algorithms, optimization]
category: Algorithms & Paradigms
subcategory: Algorithm Paradigms
---

# Dynamic Programming

**Definition:** An algorithmic optimization technique that solves complex problems by breaking them into overlapping subproblems, solving each subproblem exactly once, and storing (caching) their solutions for reuse.

## How It Works
- Requires two key properties to apply: Overlapping Subproblems (the same subproblem recurs many times) and Optimal Substructure (an optimal solution can be built from optimal solutions to subproblems)
- Memoization (Top-Down): recursive approach that stores computed results in a hash map/array keyed by subproblem parameters, short-circuiting recursive calls that were already solved
- Tabulation (Bottom-Up): iterative approach that fills a table starting from base cases up to the target, typically using less memory overhead than recursion since it avoids call-stack frames
- State design is the core skill: identifying what parameters uniquely define a subproblem (the "state") determines both correctness and the size of the DP table
- Space optimization is common once correctness is established — many DP recurrences only depend on the previous row/state, letting an O(n*m) table collapse to O(m) rolling arrays

## Why It Matters
- Transforms exponential O(2^n) brute-force recursive solutions (like naive Fibonacci or naive subset-sum) into polynomial time O(n) or O(n^2)
- Standard technique behind real production systems: `diff`/version-control tools use DP (edit distance) to compute minimal changesets, and DNA sequence alignment tools use the same Longest Common Subsequence recurrence
- Forms one of the core algorithm-design paradigms taught alongside greedy algorithms and divide-and-conquer, and is a frequent focus in technical interviews because it tests recognizing hidden recursive structure

## Common Pitfalls
- Attempting DP on problems lacking optimal substructure (e.g., "longest simple path in a general graph" is NP-hard precisely because greedy/DP substructure doesn't hold with cycles)
- High space complexity if the table size is unoptimized — a naive 2D table for a problem solvable with a rolling 1D array wastes memory that can matter at scale (e.g., O(n) vs O(n*m) for edit distance on large strings)
- Defining the DP state incorrectly (missing a dimension the answer actually depends on) produces code that runs but silently returns wrong answers on certain inputs
- Off-by-one errors in base cases (e.g., `dp[0]` vs `dp[1]` indexing) are the most common source of bugs in tabulated DP implementations

## Related Terms
- [[Recursion]]
- [[Big-O Notation]]
- [[Sorting Algorithms]]

## Example
Calculating Fibonacci numbers, the 0/1 Knapsack problem, and Longest Common Subsequence are canonical DP problems. Naive recursive Fibonacci recomputes `fib(2)` many times:
```
fib(5) -> fib(4) + fib(3)
fib(4) -> fib(3) + fib(2)   # fib(3) computed again
fib(3) -> fib(2) + fib(1)   # fib(2) computed again
```
Memoizing with `cache = {}` cuts this from O(2^n) calls to O(n): each `fib(k)` is computed once and reused, turning ~15 redundant calls for `fib(5)` into exactly 6.
