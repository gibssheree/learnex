---
tags: [term, quantum, hardware]
category: Core Concepts
---

# Quantum Decoherence

**Definition:** The process by which a qubit loses its delicate quantum properties (superposition, entanglement) due to unwanted interaction with its surrounding environment, collapsing it toward ordinary classical behavior.

## How It Works
- Qubits must be extremely well isolated from vibration, heat, and electromagnetic interference to preserve their quantum state
- Even tiny disturbances cause decoherence, destroying the superposition or entanglement a computation depends on before it finishes
- Measured in "coherence time," how long a qubit can reliably hold its quantum state, currently a major limiting factor in real quantum hardware

## Why It Matters
- Decoherence is the central engineering obstacle in building useful quantum computers, most current quantum hardware research is fundamentally about extending coherence time and reducing error rates

## Common Pitfalls
- Underestimating how extreme the isolation requirements are, many quantum computers operate at temperatures colder than deep space to minimize thermal noise
- Assuming decoherence is a solved problem, it remains one of the field's biggest open engineering challenges

## Related Terms
- [[Qubit]]
- [[Entanglement]]
- [[Quantum Supremacy]]

## Example
Superconducting qubits are cooled to near absolute zero specifically to minimize the thermal vibrations that would otherwise cause rapid decoherence.
