---
tags: [term, ai, alignment]
category: Agents & Systems
---

# RLHF (Reinforcement Learning from Human Feedback)

**Definition:** A training technique that fine-tunes a model using human preference judgments as the reward signal, aligning it to be more helpful, honest, and safe.

## How It Works
1. Collect human rankings of multiple model outputs for the same prompt
2. Train a reward model to predict which outputs humans prefer
3. Use reinforcement learning (e.g., PPO) to fine-tune the LLM to maximize predicted human preference

## Why It Matters
- The key step that turned raw next-token predictors into helpful, instruction-following chat assistants
- Central to how modern assistants like Claude and ChatGPT are aligned to be safe and useful

## Common Pitfalls
- Reward hacking — the model learns to exploit quirks of the reward model rather than genuinely improving
- Human feedback bias — the model inherits whatever biases or blind spots the human raters had

## Related Terms
- [[Reinforcement Learning]]
- [[AI Alignment]]
- [[Large Language Model (LLM)]]

## Example
A base LLM that rambles or refuses reasonable requests becomes concise and cooperative after RLHF tuning on human preference data.
