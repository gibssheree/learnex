---
tags: [term, math, counting]
category: Proofs & Combinatorics
subcategory: Combinatorics & Counting
---

# Combinatorics

**Definition:** The field of discrete math concerned with counting, arrangement, and operational combinations of sets.

## How It Works
- Permutations P(n, r) = n! / (n - r)! : ordered arrangements where order matters
- Combinations C(n, r) = n! / (r!(n - r)!) : unordered selections where order does NOT matter
- Pigeonhole Principle: if n items are put into m containers where n > m, at least one container must hold more than 1 item

## Why It Matters
- Essential for algorithmic probability analysis, cryptography key space calculations, and brute-force search space estimation

## Common Pitfalls
- Double-counting items by failing to distinguish ordered vs unordered combinations

## Related Terms
- [[Set Theory]]
- [[Proof Techniques]]

## Example
Pigeonhole Principle: in any group of 367 people, at least two must share the exact same birthday.
