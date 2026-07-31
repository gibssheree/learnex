---
tags: [term, dsa, data-structures, arrays]
category: Linear Data Structures
---

# Array and Dynamic Array

**Definition:** A static array is a contiguous block of fixed-size memory storing elements of the same type; a dynamic array automatically resizes when capacity is exceeded.

## How It Works
- Provides O(1) random access via direct index calculation: `Address = Base_Address + Index * Element_Size`
- Insertion at the end of a dynamic array is amortized O(1) time — a single resize costing O(n) is spread across n cheap O(1) appends
- When full, dynamic arrays allocate a new block (typically 1.5x-2x capacity — Python lists grow ~1.125x, Java `ArrayList` grows 1.5x, C++ `std::vector` commonly grows 2x) and copy existing elements in O(n) time
- Growth factor is a tradeoff: doubling wastes up to 50% memory headroom but guarantees O(1) amortized append (geometric growth keeps total copy work bounded by a convergent series); growing by a fixed increment instead gives O(n) amortized append
- Shrinking (freeing unused capacity) is rarely automatic — most languages require explicit `shrink_to_fit()`/`trimToSize()` calls, otherwise capacity only ever grows

## Why It Matters
- Serves as the underlying building block for most complex data structures (heaps, hash tables, stacks) due to cache locality and pointer-free access speed
- Contiguous memory layout means sequential array access is dramatically faster in practice than pointer-chasing structures because it maximizes CPU cache-line reuse and enables hardware prefetching
- The amortized-O(1) append analysis (via the accounting/potential method) is a foundational example of amortized complexity analysis used to reason about many other structures

## Common Pitfalls
- Inserting or deleting elements at arbitrary (non-tail) positions requires O(n) element shifting — a common source of hidden quadratic behavior in loops that repeatedly `insert(0, x)`
- Unbounded resizing without a reserved capacity can cause sudden memory spikes and repeated large copies when the final size is known in advance (`reserve()`/`ensureCapacity()` avoids this)
- Confusing `length` (elements in use) with `capacity` (allocated slots) leads to bugs when code assumes they're always equal
- Iterating over a dynamic array while appending to it can invalidate iterators/pointers when a resize reallocates the backing buffer

## Related Terms
- [[Big-O Notation]]
- [[Linked List]]
- [[Hash Table]]
- [[Cache Line and Eviction]]

## Example
In Python `list.append()` or C++ `std::vector::push_back()`, capacity doubles once the array is full:
```
size=4, capacity=4  -> append(x) -> allocate capacity=8, copy 4 elements, size=5
```
Appending 1 million items this way triggers only ~20 reallocations (log₂ of 1,000,000), not 1 million — this is why amortized cost per append stays O(1) even though individual appends occasionally cost O(n).
