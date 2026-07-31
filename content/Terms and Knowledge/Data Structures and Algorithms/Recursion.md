---
tags: [term, dsa, algorithms, recursion]
category: Foundations & Complexity
subcategory: Algorithm Paradigms
---

# Recursion

**Definition:** A programming method where a function calls itself directly or indirectly to break down a problem into smaller instances of the same problem.

## How It Works
- Requires at least one Base Case (a halting condition with no further recursive call) to prevent infinite recursion
- Requires a Recursive Step that transforms the problem into a smaller instance moving measurably closer to the base case
- Pushes a new stack frame (return address, local variables, parameters) onto the execution call stack for every call, popping it off only when that call returns — this is the mechanical reason unbounded recursion crashes
- Tail recursion (where the recursive call is the very last operation, with nothing left to do after it returns) can be optimized by some compilers/runtimes into a plain loop via Tail Call Optimization (TCO), avoiding stack growth entirely — but this is not guaranteed in most mainstream languages (notably absent in standard Python and most JavaScript engines, present in Scheme and some functional languages)
- Mutual recursion (function A calls function B which calls function A) is a generalization where the "self-call" happens indirectly through another function

## Why It Matters
- Natural fit for traversing hierarchical structures like trees, graphs, and nested file directories, where the problem's own structure is recursive
- Many divide-and-conquer algorithms ([[Sorting Algorithms|MergeSort]], [[Binary Search]], [[Depth-First Search (DFS)]]) are most naturally expressed recursively, mirroring their mathematical recurrence relations directly in code
- Every recursive algorithm has an equivalent iterative form using an explicit stack — understanding recursion is what makes that translation possible when stack depth or performance constraints rule out the recursive version

## Common Pitfalls
- Missing or incorrect base cases lead to infinite recursion and a stack overflow error/crash
- Redundant recursive calls (recomputing the same subproblem repeatedly, as in naive Fibonacci) cause exponential time complexity — solved by adding memoization, turning the algorithm into [[Dynamic Programming]]
- Assuming a language performs Tail Call Optimization when it doesn't — writing "tail recursive" code in Python still consumes one stack frame per call and will hit `RecursionError` around depth 1000 by default
- Mutating shared/global state across recursive calls without care produces bugs that only manifest for certain input shapes or depths, since each frame's local variables aren't isolated from shared mutable state

## Related Terms
- [[Stack and Queue]]
- [[Dynamic Programming]]
- [[Depth-First Search (DFS)]]
- [[Binary Search Tree (BST)]]

## Example
Traversing a file system directory tree to list all nested files.
```
def list_files(dir):
    for entry in dir.contents:
        if entry.is_directory:
            list_files(entry)      # recursive step
        else:
            print(entry.name)      # base case: a file, no further recursion
```
Each nested subdirectory adds one stack frame; a directory tree 500 folders deep would need 500 stack frames alive simultaneously before any of them return.
