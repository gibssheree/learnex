---
tags: [term, security, cryptography]
category: Cryptography
---

# Cryptographic Hash Functions

**Definition:** One-way mathematical functions mapping arbitrary data into a fixed-size hash output (digest) with collision resistance.

## How It Works
- Properties: Deterministic, Quick to compute, Pre-image resistant (cannot reverse hash to input), Collision resistant
- Algorithms: SHA-256, BLAKE3 (general integrity); bcrypt, Argon2 (slow password hashing with Salt and Work Factor)
- Salt & Pepper: unique random salt added per password to defeat Rainbow Table attacks

## Why It Matters
- Verifies file integrity, powers digital signatures, and safely stores user passwords

## Common Pitfalls
- Using fast hashes (MD5, SHA1, SHA256) for password storage instead of memory-hard slow algorithms like Argon2id

## Related Terms
- [[Symmetric and Asymmetric Encryption]]
- [[Digital Signatures and PKI]]

## Example
Git uses SHA-1/SHA-256 commit hashes to verify repository object integrity.
