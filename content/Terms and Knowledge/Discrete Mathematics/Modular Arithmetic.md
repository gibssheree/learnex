---
tags: [term, math, number-theory]
category: Set Theory & Algebra
subcategory: Number Theory
---

# Modular Arithmetic

**Definition:** A system of arithmetic for integers where numbers 'wrap around' upon reaching a fixed modulo value n.

## How It Works
- `a ≡ b (mod n)` means `a - b` is evenly divisible by n
- Modular Addition, Multiplication, and Exponentiation
- Fermat's Little Theorem and Euclidean Algorithm (GCD calculation) form the backbone of modern public-key cryptography

## Why It Matters
- Essential for RSA encryption, Diffie-Hellman key exchanges, hashing algorithms, and cyclic buffer calculations

## Common Pitfalls
- Performing division in modular arithmetic (requires multiplying by the Modular Multiplicative Inverse via Extended Euclidean Algorithm)

## Related Terms
- [[Relations and Functions]]
- [[Combinatorics]]

## Example
13 mod 12 = 1 (clock arithmetic: 13:00 is 1:00 PM).
