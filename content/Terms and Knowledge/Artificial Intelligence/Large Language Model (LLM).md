---
tags: [term, ai, nlp]
category: Language & NLP
---

# Large Language Model (LLM)

**Definition:** A neural network, typically transformer-based, trained on massive text corpora to predict the next token — giving rise to broad language understanding and generation abilities.

## How It Works
- Pre-training: predict the next token over trillions of words to learn language patterns and world knowledge
- Fine-tuning/alignment: further trained (often with RLHF) to follow instructions and be helpful/safe
- Inference: given a prompt, generates text one token at a time

## Why It Matters
- Powers chatbots, coding assistants, summarizers, and most of today's applied AI products
- Scale (parameters + data + compute) has driven most of the recent leaps in capability

## Common Pitfalls
- Trusting outputs without verification — LLMs can hallucinate confidently
- Assuming the model "knows" things in real time — its knowledge is frozen at training cutoff unless given tools/retrieval

## Related Terms
- [[Transformer Architecture]]
- [[Hallucination]]
- [[Fine-Tuning]]
- [[RLHF (Reinforcement Learning from Human Feedback)]]

## Example
Claude and GPT-class models are LLMs: give them a prompt, they predict and stream back the most likely continuation, token by token.
