---
tags: [term, quantum]
category: Core Concepts
---

# Qubit

**Definition:** The basic unit of quantum information, analogous to a classical bit, but able to exist in a combination of 0 and 1 simultaneously through superposition rather than being strictly one or the other.

## How It Works
- A classical bit is definitely 0 or definitely 1; a qubit exists in a probabilistic combination of both until measured, described by [[Superposition]]
- Measuring a qubit collapses it to a definite classical value (0 or 1), destroying the superposition in the process
- Physically implemented in different ways depending on the hardware: superconducting circuits, trapped ions, and photons are among the leading approaches

## Why It Matters
- Qubits are the entire reason quantum computers can potentially solve certain problems dramatically faster than classical computers, they let quantum algorithms explore many possibilities at once

## Common Pitfalls
- Thinking of a qubit as simply "a bit that can be 0, 1, or both at the same time" in a literal, intuitive sense, the actual behavior is probabilistic and doesn't map cleanly onto classical intuition
- Assuming more qubits automatically means more useful computation, qubit quality (how long they stay coherent, how low their error rate is) matters as much as quantity

## Related Terms
- [[Superposition]]
- [[Entanglement]]
- [[Quantum Gate]]

## Example
A classical computer with 3 bits can represent one of 8 possible values at a time; 3 qubits in superposition can represent a combination of all 8 simultaneously until measured.
