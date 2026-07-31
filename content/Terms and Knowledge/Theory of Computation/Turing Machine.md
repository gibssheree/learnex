---
tags: [term, theory, computation]
category: Computability & Decidability
---

# Turing Machine

**Definition:** A theoretical mathematical model of computation consisting of an infinitely long memory tape, a read/write head, and a state transition rulebook.

## How It Works
- Head reads symbol from current tape cell, writes new symbol, moves head left/right, and transitions state
- Universal Turing Machine (UTM): a Turing machine capable of simulating any other arbitrary Turing machine described as data on its tape
- Church-Turing Thesis: any physical computation or algorithm that can be performed can be computed by a Turing Machine

## Why It Matters
- Defines the ultimate theoretical boundary of what can and cannot be computed mathematically

## Common Pitfalls
- Assuming faster hardware can solve inherently undecidable problems

## Related Terms
- [[Halting Problem and Decidability]]
- [[P vs NP Complexity Classes]]

## Example
Modern computer CPUs are physical implementations of Universal Turing Machines with finite RAM bounds.
