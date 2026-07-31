---
tags: [term, theory, automata]
category: Automata & Formal Languages
---

# Context-Free Grammars and Pushdown Automata

**Definition:** Pushdown Automata (PDA) are finite state machines equipped with a Stack memory; Context-Free Grammars (CFG) describe the formal languages recognized by PDAs.

## How It Works
- CFG consists of non-terminal production rules (e.g., `S -> (S) | ε`)
- PDA uses its memory stack to track nested state depth (allowing it to recognize context-free languages with matching tokens)
- Supports recursive syntax parsing

## Why It Matters
- Used by programming language parsers to validate syntactic structure of JSON, XML, C++, Python, and Java

## Common Pitfalls
- Grammar Ambiguity: a context-free grammar that produces multiple distinct parse trees for the same input string breaks deterministic parser generator code

## Related Terms
- [[Finite Automata (DFA and NFA)]]
- [[Chomsky Hierarchy]]
- [[Turing Machine]]

## Example
Parsing nested HTML/XML tags `<div><span></span></div>` requires a stack-based PDA parser.
