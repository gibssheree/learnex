---
tags: [term, quantum]
category: Core Concepts
---

# Superposition

**Definition:** The quantum mechanical principle that a system can exist in a combination of multiple states simultaneously, until it's measured, at which point it collapses into one definite state.

## How It Works
- A [[Qubit]] in superposition isn't "secretly" already 0 or 1 waiting to be revealed, it genuinely exists as a probabilistic combination of both until measurement forces a definite outcome
- The probabilities of collapsing to each state are described mathematically by the qubit's quantum state, not something that can be observed directly without collapsing it
- Quantum algorithms are designed to manipulate superposition so that wrong answers cancel out and correct answers reinforce, before a final measurement is taken

## Why It Matters
- The foundational property that gives quantum computing its theoretical power, without it, a "quantum" computer would just be a slower classical computer

## Common Pitfalls
- Assuming superposition means a quantum computer tries every possible answer in parallel and you can simply "read off" the best one, extracting a useful answer requires carefully designed algorithms, not just superposition alone
- Confusing superposition with [[Entanglement]], they're related but distinct concepts

## Related Terms
- [[Qubit]]
- [[Entanglement]]
- [[Quantum Decoherence]]

## Example
Schrödinger's cat is the classic (if imperfect) thought experiment illustrating superposition: a system in an indeterminate combination of states until observed.
