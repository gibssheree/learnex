---
tags: [term, quantum, algorithms]
category: Algorithms & Circuits
---

# Quantum Gate

**Definition:** A basic operation that manipulates one or more qubits' quantum state, the quantum equivalent of a classical logic gate (AND, OR, NOT), and the building block of every quantum algorithm.

## How It Works
- Applied to [[Qubit|qubits]] to change their superposition state or create [[Entanglement]] between them
- Unlike classical logic gates, quantum gates must be reversible, you can always mathematically undo a quantum gate's operation
- Quantum circuits chain many gates together, similar in spirit to how classical logic gates chain together to form a processor's circuits

## Why It Matters
- Quantum gates are literally how a quantum algorithm is expressed and executed, understanding them is prerequisite to understanding any specific quantum algorithm

## Common Pitfalls
- Assuming quantum gates work like classical logic gates conceptually, the reversibility requirement and probabilistic outcomes make them fundamentally different
- Underestimating how error-prone real quantum gates are on current hardware, gate errors compound quickly across a long circuit

## Related Terms
- [[Qubit]]
- [[Entanglement]]
- [[Shor's Algorithm]]

## Example
A Hadamard gate is one of the most common quantum gates, putting a qubit into an equal superposition of 0 and 1.
