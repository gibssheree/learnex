---
tags: [term, ai, nlp]
category: Language & NLP
---

# Fine-Tuning

**Definition:** Further training a pre-trained model on a smaller, task-specific dataset to specialize its behavior.

## How It Works
- Start from a general pre-trained model's weights
- Continue training on curated examples (e.g., instruction/response pairs, domain-specific text)
- Full fine-tuning updates all weights; parameter-efficient methods (LoRA) update a small added subset

## Why It Matters
- Bakes in behavior/knowledge more durably than prompting, useful for consistent tone, domain jargon, or structured tasks
- LoRA-style fine-tuning made customizing large models affordable without full retraining

## Common Pitfalls
- Fine-tuning when RAG or better prompting would solve the problem more cheaply
- Catastrophic forgetting — overfitting to the fine-tuning set can degrade general capabilities

## Related Terms
- [[Transfer Learning]]
- [[Prompt Engineering]]
- [[Large Language Model (LLM)]]

## Example
Fine-tuning a base model on thousands of customer support transcripts to make it consistently reply in your company's specific tone.
