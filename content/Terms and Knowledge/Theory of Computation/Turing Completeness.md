---
tags: [term, theory, computation]
category: Computability & Decidability
---

# Turing Completeness

**Definition:** A system of data-manipulation rules or a programming language is Turing Complete if it can simulate any single-taped Turing Machine, meaning it is capable of performing any computational task given enough time and memory.

## How It Works
- Requires the ability to read/write memory, perform conditional branching (e.g., `if` statements), and loop or recurse arbitrarily.
- Most general-purpose programming languages (Python, C, Java) are Turing Complete by design.
- If a language is Turing Complete, it is susceptible to the Halting Problem, meaning it is impossible to write a static analyzer that can definitively determine if all scripts in that language will eventually terminate.

## Why It Matters
- Determines whether a system is a simple configuration language or a fully-fledged programming language capable of arbitrary logic.

## Common Pitfalls
- Designing a configuration system or smart contract language that accidentally becomes Turing Complete, opening the door to infinite loop vulnerabilities and unpredictable execution times.

## Related Terms
- [[Turing Machine]]
- [[Halting Problem and Decidability]]
- [[Church-Turing Thesis]]

## Example
HTML and JSON are not Turing Complete because they only represent static data, whereas JavaScript and Conway's Game of Life are fully Turing Complete.
