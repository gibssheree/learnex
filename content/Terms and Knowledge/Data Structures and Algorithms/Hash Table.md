---
tags: [term, dsa, data-structures, hashing]
category: Hash & Tree Structures
subcategory: Hash-Based Structures
---

# Hash Table

**Definition:** A data structure that maps key-value pairs using a hash function to compute index locations for O(1) average lookup, insertion, and deletion.

## How It Works
- A hash function transforms an arbitrary key into an integer, then `index = hash(key) % num_buckets` maps that integer onto a bucket in the underlying array
- Handles collisions (two keys mapping to the same bucket) via Separate Chaining (each bucket holds a linked list or, in Java 8+ `HashMap`, a red-black tree once a bucket exceeds 8 entries) or Open Addressing (Linear Probing, Quadratic Probing, Double Hashing — probing for the next free slot)
- Resizes and rehashes all elements when the load factor (`items / buckets`) exceeds a threshold, typically 0.75 — this is an O(n) operation but is amortized O(1) per insert across the table's lifetime, the same amortization argument as a dynamic array
- A good hash function must be deterministic, fast, and distribute keys uniformly across buckets to keep chains/probe sequences short; a poor hash function clusters keys and destroys the O(1) guarantee
- Open addressing avoids the pointer overhead of chaining and has better cache locality, but degrades faster as load factor approaches 1 and requires careful handling of deletions (tombstone markers) so probing sequences aren't broken

## Why It Matters
- Underpins dictionary, map, set, and database indexing primitives across almost all programming languages — arguably the single most-used non-trivial data structure in software engineering
- The O(1) average-case lookup is what makes memoization, caching layers, and symbol tables in compilers practical at scale
- Consistent hashing (a specialized hash table technique) is what lets distributed caches and databases add/remove nodes while only remapping a small fraction of keys, instead of rehashing everything

## Common Pitfalls
- Worst-case O(n) lookup time if hash collisions spike, or if malicious keys are crafted specifically to degrade hash performance (HashDoS attack — mitigated by seeding hash functions randomly per process, as Python and most modern runtimes now do by default)
- Keys must be immutable (or at least never mutated while in the table) to maintain consistent hash values — mutating a key after insertion makes it unfindable even though it's still physically present
- Iterating over a hash table and expecting a consistent or insertion order — plain hash tables historically made no ordering guarantee (Python dicts since 3.7 and Java's `LinkedHashMap` are notable exceptions that do guarantee order)
- Using a poor or default hash function (e.g., hashing only the first few characters of a string) causes clustering that silently degrades performance without throwing any error

## Related Terms
- [[Array and Dynamic Array]]
- [[Binary Search Tree (BST)]]
- [[Trie]]
- [[Consistent Hashing]]
- [[Cryptographic Hash Functions]]

## Example
Python `dict`, JavaScript `Object`/`Map`, and Java `HashMap` use hash tables.
```
hash("apple") % 8 buckets = 3   -> bucket[3] = [("apple", 1.20)]
hash("banana") % 8 buckets = 3  -> collision! bucket[3] = [("apple",1.20), ("banana",0.50)]
lookup("banana") -> hash to bucket 3 -> scan short chain -> found in O(1) average
```
With 8 buckets and a load factor threshold of 0.75, inserting the 7th key (7/8 = 0.875 > 0.75) triggers a resize to 16 buckets and rehashes all existing keys.
