---
tags: [term, theory, languages]
category: Automata & Formal Languages
---

# Chomsky Hierarchy

**Definition:** A 4-level classification hierarchy of formal grammars and languages ranked by expressive power and computing machine requirements.

## How It Works
- Type 3 (Regular Languages): recognized by Finite Automata (DFA/NFA); standard regex
- Type 2 (Context-Free Languages): recognized by Pushdown Automata (PDA); programming language syntax
- Type 1 (Context-Sensitive Languages): recognized by Linear-Bounded Automata (LBA)
- Type 0 (Recursively Enumerable Languages): recognized by Turing Machines; all computable functions

## Why It Matters
- Establishes formal theoretical taxonomies for computer language design, lexers, and parsers

## Common Pitfalls
- Choosing over-powerful grammars (e.g., Type 0) when simpler grammars (Type 2) suffice, needlessly inflating parsing computational cost

## Related Terms
- [[Finite Automata (DFA and NFA)]]
- [[Context-Free Grammars and Pushdown Automata]]
- [[Turing Machine]]

## Example
Lexers process Type 3 Regular Grammars; Parsers process Type 2 Context-Free Grammars.
