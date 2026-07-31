---
tags: [term, ai, deep-learning]
category: Language & NLP
---

# Attention Mechanism

**Definition:** A technique that lets a model weigh the relevance of different parts of the input when producing each part of the output, instead of treating all input equally.

## How It Works
- Each token produces a Query, Key, and Value vector
- Attention score = similarity between a token's Query and every other token's Key, turned into weights via softmax
- Output is a weighted sum of Value vectors — the token "attends" more to relevant context

## Why It Matters
- Solved the long-range dependency problem that plagued RNNs (forgetting early words in long sequences)
- Self-attention (attending within the same sequence) is the core mechanic inside every transformer

## Common Pitfalls
- Confusing attention weights with human-interpretable "explanations" — they correlate with importance but aren't a full explanation of model behavior
- Underestimating compute cost — attention scales O(n²) with sequence length

## Related Terms
- [[Transformer Architecture]]
- [[Large Language Model (LLM)]]

## Example
In "The animal didn't cross the street because it was too tired," attention lets the model link "it" back to "animal," not "street."
