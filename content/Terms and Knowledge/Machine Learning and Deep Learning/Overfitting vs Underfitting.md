---
tags: [term, ml]
category: Core ML Concepts
---

# Overfitting vs Underfitting

**Definition:** Overfitting is when a model memorizes training data noise instead of general patterns, performing well on training data but poorly on new data. Underfitting is when a model is too simple to capture the underlying pattern at all.

## How It Works
- Overfitting: training accuracy high, validation/test accuracy low — the model learned the training set's quirks
- Underfitting: both training and validation accuracy are low — the model lacks capacity or training time

## Why It Matters
- The central tension in ML model design — balancing complexity against generalization is basically the whole job
- Directly informs decisions about regularization, model size, and how much training data you need

## Common Pitfalls
- Judging a model only by training accuracy, missing an overfitting problem entirely
- Adding regularization or simplifying a model that's actually underfitting, making it worse

## Related Terms
- [[Bias-Variance Tradeoff]]
- [[Regularization (L1, L2, Dropout)]]
- [[Cross-Validation]]

## Example
A model that gets 99% accuracy on training data but only 60% on a test set is overfitting — it memorized rather than learned to generalize.
