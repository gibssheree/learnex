---
tags: [term, dsa, data-structures, stacks-queues]
category: Linear Data Structures
---

# Stack and Queue

**Definition:** Abstract data types representing ordered collections; Stack follows LIFO (Last-In, First-Out), while Queue follows FIFO (First-In, First-Out).

## How It Works
- Stack operations: Push (add to top), Pop (remove from top), Peek (view top without removing) — all O(1) when backed by a dynamic array or linked list with a head pointer
- Queue operations: Enqueue (add to back), Dequeue (remove from front) — O(1) when backed by a doubly linked list or a circular buffer array; naively removing from the front of a plain dynamic array is O(n) because every remaining element must shift
- A circular buffer (ring buffer) implements a fixed-capacity queue in a flat array by wrapping the front/back indices modulo the array size, avoiding both the O(n) shift problem and unbounded growth
- Deque (double-ended queue) generalizes both: O(1) push/pop from either end, which is why it's often used to implement both a stack and a queue interchangeably (e.g., Python's `collections.deque`)
- A Monotonic Stack/Queue (elements kept in strictly increasing or decreasing order by discarding dominated elements on insert) is a specialized pattern used to solve "next greater element" and sliding-window-maximum problems in O(n) instead of O(n^2)

## Why It Matters
- Stacks govern function execution call stacks (see [[Recursion]]), expression evaluation (operator precedence parsing, matching parentheses), undo/redo history, and backtracking algorithms like [[Depth-First Search (DFS)]]
- Queues manage asynchronous task buffering, request handling in web servers, print/job queues, and breadth-first traversal (see [[Breadth-First Search (BFS)]])
- Message queue systems (task queues, event buses) generalize the FIFO queue concept to distributed systems, decoupling producers from consumers at scale

## Common Pitfalls
- Stack overflow caused by uncapped or runaway recursion — each recursive call pushes a frame, and an unbounded recursive depth exhausts the call stack
- Using a naive array for a queue (shifting all elements left on every dequeue) instead of a circular buffer or linked list leads to hidden O(n) dequeue operations that only show up as a performance problem at scale
- Implementing a queue with two stacks (a common interview pattern) but forgetting to transfer elements lazily — eagerly moving elements between the two stacks on every operation destroys the intended amortized O(1) per operation
- Assuming `peek()` is safe on an empty stack/queue without checking emptiness first, causing an underflow error or undefined behavior

## Related Terms
- [[Breadth-First Search (BFS)]]
- [[Depth-First Search (DFS)]]
- [[Recursion]]
- [[Linked List]]

## Example
Browser history back-button uses a Stack; a printer queue uses a Queue.
```
Stack (undo history): push(edit1) push(edit2) push(edit3) -> pop() returns edit3 first
Queue (print jobs):    enqueue(doc1) enqueue(doc2) enqueue(doc3) -> dequeue() returns doc1 first
```
Balanced-parentheses validation is the textbook stack use case: push `(` on open, pop and compare on close — `"(a(b)c)"` pushes/pops cleanly to empty, while `"(a(b)c"` leaves a `(` on the stack, correctly flagging unbalanced input.
