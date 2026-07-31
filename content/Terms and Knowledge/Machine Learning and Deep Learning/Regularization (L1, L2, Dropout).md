---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Regularization (L1, L2, Dropout)

**Definition:** Techniques that discourage a model from overfitting by constraining its complexity during training.

## How It Works
- L2 (weight decay): adds a penalty proportional to the square of the weights, pushing them toward small values
- L1 (Lasso): adds a penalty proportional to the absolute value of weights, encouraging some weights to become exactly zero (feature selection)
- Dropout (neural nets): randomly disables a fraction of neurons on each training step, forcing the network to not over-rely on any single path

## Why It Matters
- One of the most reliable, cheap ways to fight overfitting across both classical ML and deep learning
- L1 is also a practical feature-selection tool since it zeroes out unimportant weights

## Common Pitfalls
- Over-regularizing, which pushes a good-fitting model into underfitting
- Using dropout at inference/test time by mistake — it should only be active during training

## Related Terms
- [[Overfitting vs Underfitting]]
- [[Bias-Variance Tradeoff]]

## Example
Adding dropout of 0.3 to a neural network's hidden layer randomly zeroes 30% of its neurons each training step, preventing co-dependency.
