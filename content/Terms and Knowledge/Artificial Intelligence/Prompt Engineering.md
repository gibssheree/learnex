---
tags: [term, ai, nlp]
category: Language & NLP
---

# Prompt Engineering

**Definition:** The practice of designing inputs (prompts) to reliably steer an LLM toward a desired output, without changing the model's weights.

## How It Works
- Techniques: clear instructions, few-shot examples, chain-of-thought prompting, explicit output format/schema, system prompts for persona/rules
- Iterative: test, observe failure modes, refine wording or structure

## Why It Matters
- Often the fastest, cheapest lever to improve LLM output quality — no training required
- Critical skill for building reliable LLM-powered features/products

## Common Pitfalls
- Over-relying on prompting to fix problems that actually need fine-tuning, better retrieval, or a different model
- Vague instructions ("be good at this") instead of concrete, testable criteria

## Related Terms
- [[Large Language Model (LLM)]]
- [[Fine-Tuning]]
- [[Retrieval-Augmented Generation (RAG)]]

## Example
Adding "Respond only in valid JSON matching this schema: {...}" to a prompt reliably improves structured-output consistency.
