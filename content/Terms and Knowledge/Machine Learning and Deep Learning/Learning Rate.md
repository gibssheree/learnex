---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Learning Rate

**Definition:** A hyperparameter that controls how large a step gradient descent takes when updating model weights on each iteration.

## How It Works
- Too high: updates overshoot the minimum, loss oscillates or diverges
- Too low: training converges extremely slowly, or gets stuck in a shallow local minimum
- Modern training often uses a schedule — starting higher and decaying over time, or adaptive optimizers like Adam that adjust it automatically

## Why It Matters
- Frequently the single most impactful hyperparameter to tune — a well-chosen learning rate can be the difference between a model that trains and one that never converges
- Explains why the same architecture can produce wildly different results across training runs

## Common Pitfalls
- Using one fixed learning rate for an entire long training run instead of a decay schedule
- Not doing a learning-rate sweep/warmup, especially for large models, which are highly sensitive early in training

## Related Terms
- [[Gradient Descent]]
- [[Hyperparameter Tuning]]

## Example
Dropping the learning rate from 0.01 to 0.001 partway through training often stabilizes a model that was previously oscillating around its best accuracy.
