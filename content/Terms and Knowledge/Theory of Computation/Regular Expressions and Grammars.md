---
tags: [term, theory, languages]
category: Automata & Formal Languages
---

# Regular Expressions and Grammars

**Definition:** Formal algebraic representations used to define Regular Languages recognized by finite automata.

## How It Works
- Built using operations: Concatenation (`ab`), Alternation/Union (`a|b`), and Kleene Star (`a*`)
- Pumping Lemma for Regular Languages: mathematical proof tool used to prove a given language is NOT regular by showing string repetition bounds fail

## Why It Matters
- Underpins text search syntax (grep, regex engines) and compiler lexing stages

## Common Pitfalls
- Catastrophic Backtracking: unoptimized regex patterns matching ambiguous inputs trigger exponential O(2^n) execution times

## Related Terms
- [[Finite Automata (DFA and NFA)]]
- [[Chomsky Hierarchy]]

## Example
Regex `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` defines valid email token patterns.
