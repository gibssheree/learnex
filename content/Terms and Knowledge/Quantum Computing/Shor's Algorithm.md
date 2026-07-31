---
tags: [term, quantum, algorithms, cryptography]
category: Algorithms & Circuits
---

# Shor's Algorithm

**Definition:** A quantum algorithm that factors large numbers exponentially faster than the best known classical algorithms, famous for threatening the mathematical foundation of widely used public-key encryption.

## How It Works
- Exploits [[Superposition]] and quantum [[Quantum Gate|gates]] to find the period of a mathematical function far faster than classical methods, which is the key step that makes factoring large numbers tractable
- On a large enough, sufficiently reliable quantum computer, it could factor the huge numbers underlying RSA encryption in a practical amount of time, versus the effectively-impossible timeframes classical computers face
- Currently limited by hardware, no existing quantum computer has enough stable, low-error qubits to run it against real-world-sized encryption keys

## Why It Matters
- The single biggest reason governments and companies are investing heavily in "post-quantum cryptography," encryption designed to resist a future quantum computer capable of running Shor's Algorithm at scale

## Common Pitfalls
- Believing current encryption is already broken, today's quantum hardware is nowhere near capable of running Shor's Algorithm against real-world key sizes
- Confusing the theoretical threat (a sufficiently powerful future quantum computer) with an immediate, present-day risk

## Related Terms
- [[Symmetric and Asymmetric Encryption]]
- [[Quantum Gate]]
- [[Quantum Supremacy]]

## Example
RSA encryption, which secures much of today's internet traffic, relies on factoring large numbers being computationally infeasible, exactly the assumption Shor's Algorithm threatens.
