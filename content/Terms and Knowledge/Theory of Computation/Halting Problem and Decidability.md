---
tags: [term, theory, decidability]
category: Computability & Decidability
---

# Halting Problem and Decidability

**Definition:** The Halting Problem is Alan Turing's landmark proof that no general algorithm can ever exist that determines whether an arbitrary program will finish running or run forever.

## How It Works
- Decidable Problem: a problem for which a Turing machine exists that always halts and returns Correct (Yes/No)
- Undecidable Problem: proved via proof-by-contradiction / diagonalization (if a program H exists that predicts halting, constructing a paradoxical program anti-H that does the opposite invalidates H)

## Why It Matters
- Proves fundamental mathematical limitations on static program analysis, automated bug detectors, and formal verification

## Common Pitfalls
- Attempting to build a perfect static compiler checker that guarantees arbitrary programs won't infinite-loop

## Related Terms
- [[Turing Machine]]
- [[Chomsky Hierarchy]]

## Example
Static code linters can flag simple loops, but can never prove if an arbitrary complex function halts for all inputs.
