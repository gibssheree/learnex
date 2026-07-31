---
tags: [term, theory, automata]
category: Automata & Formal Languages
---

# Finite Automata (DFA and NFA)

**Definition:** Abstract state machines with a finite set of states that process input symbols to accept or reject string sequences representing Regular Languages.

## How It Works
- DFA (Deterministic Finite Automaton): for every state and input symbol, there is exactly one deterministic next state transition
- NFA (Nondeterministic Finite Automaton): a state can transition to multiple states or perform epsilon (ε) transitions for a given input symbol
- Equivalence: every NFA can be converted to an equivalent DFA using Powerset Construction (though DFA state count may explode to 2^Q)

## Why It Matters
- Forms the theoretical foundation for regular expressions, lexical analyzers in compilers, and text pattern matching

## Common Pitfalls
- Attempting to process non-regular languages (e.g., matching arbitrarily nested balanced parentheses) using finite automata (requires Pushdown Automata)

## Related Terms
- [[Regular Expressions and Grammars]]
- [[Turing Machine]]
- [[Chomsky Hierarchy]]

## Example
A vending machine controller transition state machine accepting nickels and dimes to reach a $0.25 state.
