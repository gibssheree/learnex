---
tags: [term, dsa, data-structures, trees, strings]
category: Hash & Tree Structures
subcategory: Advanced Structures
---

# Trie

**Definition:** A search tree (also called Prefix Tree) used for storing strings where nodes store characters and root-to-node paths represent key prefixes.

## How It Works
- Root represents the empty string; each edge represents one character, and children represent possible next characters extending the current prefix
- Search and insertion take O(k) time, where k is the string length, independent of the total number of stored keys — unlike a [[Hash Table]] or [[Binary Search Tree (BST)]], lookup cost doesn't grow with the dataset size
- Nodes mark a boolean flag `is_end_of_word` to distinguish a valid complete stored string from a node that only exists as an intermediate prefix of a longer word
- Each node typically holds a fixed-size array or hash map of child pointers (one slot per possible next character — 26 for lowercase English letters, 256 for extended ASCII, or a map for full Unicode)
- Prefix queries ("all words starting with 'pre'") are answered by walking to the prefix's node in O(k) time, then traversing the subtree beneath it to enumerate matches — far cheaper than filtering every stored string

## Why It Matters
- Extremely fast prefix lookups, autocomplete suggestions, and spell-checking engines, since a shared prefix across many words is stored only once instead of duplicated per string
- IP routing tables use a variant (a binary trie over address bits, or a compressed Patricia/radix trie) to perform longest-prefix-match lookups efficiently, which is exactly how routers decide where to forward a packet based on [[IP Addressing and Subnetting]] CIDR blocks
- T9 predictive text and search-engine query suggestion systems are built directly on trie prefix traversal

## Common Pitfalls
- High memory usage due to storing numerous empty/unused child pointers per node — a naive 26-pointer array per node for sparse alphabets wastes significant space, mitigated via a Radix Tree (compressing chains of single-child nodes into one edge) or switching to hash-map children
- Forgetting to check `is_end_of_word` and instead treating "the search reached a valid node" as "the search found a complete stored word" — this incorrectly returns matches for strings that are only prefixes of stored words, not stored words themselves
- Case-sensitivity bugs: inserting `"Apple"` and searching `"apple"` fail to match unless keys are normalized to a consistent case before insertion/lookup
- Deleting a word without checking whether its nodes are shared by other stored words — naive deletion can accidentally remove nodes still needed by a different word that shares the same prefix

## Related Terms
- [[Hash Table]]
- [[Binary Search Tree (BST)]]
- [[IP Addressing and Subnetting]]

## Example
Search engine search-bar autocomplete predicting queries as you type.
```
Insert "cat", "car", "cart":
root -> c -> a -> t (end)
             \-> r (end) -> t (end)
```
The shared prefix `"ca"` is stored once, not three times; searching for all words starting with `"ca"` walks 2 hops to reach the shared node, then explores its subtree to return `["cat", "car", "cart"]` in O(k + results) time instead of scanning every stored string.
