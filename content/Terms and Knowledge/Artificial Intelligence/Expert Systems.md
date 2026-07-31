---
tags: [term, ai]
category: Foundations
---

# Expert Systems

**Definition:** Early AI programs that encode human expert knowledge as if-then rules to make decisions in a narrow domain.

## How It Works
- A knowledge base of rules ("IF fever AND cough THEN suspect flu")
- An inference engine that chains rules together to reach conclusions

## Why It Matters
- Dominant AI paradigm in the 1970s-80s (e.g., MYCIN for medical diagnosis)
- Explains why "rule-based" and "if-else logic" systems are sometimes still called AI, and shows why they got replaced by ML for messy, high-dimensional problems

## Common Pitfalls
- Rule explosion — thousands of hand-written rules become impossible to maintain
- Brittleness — fails silently outside the exact scenarios the rules anticipated

## Related Terms
- [[Knowledge Representation]]
- [[Explainable AI (XAI)]]

## Example
A tax-filing wizard that asks a fixed sequence of yes/no questions to determine which form you need is a simple expert system.
