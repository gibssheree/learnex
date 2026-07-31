---
tags: [term, ai, nlp, deep-learning]
category: Language & NLP
---

# Transformer Architecture

**Definition:** The neural network architecture (2017, "Attention Is All You Need") built on self-attention, which replaced RNNs as the backbone of modern LLMs.

## How It Works
- Input tokens become embeddings, then pass through stacked layers of self-attention + feed-forward blocks
- Self-attention lets every token "look at" every other token in parallel, weighing relevance
- No recurrence, so training is highly parallelizable on GPUs/TPUs

## Why It Matters
- Enabled the scale-up (billions of parameters, trillions of training tokens) that produced modern LLMs
- Used far beyond text now: vision (ViT), audio, protein folding (AlphaFold)

## Common Pitfalls
- Assuming transformers have unlimited context — attention cost grows quadratically with sequence length
- Confusing "transformer" with "LLM" — transformers are the architecture, LLMs are one application of it

## Related Terms
- [[Attention Mechanism]]
- [[Large Language Model (LLM)]]
- [[Neural Network]]

## Example
GPT, Claude, BERT, and Vision Transformers (ViT) are all built on the transformer architecture.
