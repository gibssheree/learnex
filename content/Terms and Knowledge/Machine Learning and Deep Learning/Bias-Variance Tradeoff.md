---
tags: [term, ml]
category: Core ML Concepts
---

# Bias-Variance Tradeoff

**Definition:** The tradeoff between a model's error from overly simplistic assumptions (bias) and its error from being overly sensitive to training data fluctuations (variance).

## How It Works
- High bias: model is too rigid, misses real patterns (underfitting)
- High variance: model is too flexible, fits noise as if it were signal (overfitting)
- Total error ≈ bias² + variance + irreducible noise — improving one often worsens the other

## Why It Matters
- The theoretical backbone explaining why overfitting/underfitting happen and how to fix them
- Guides model selection: simple models (high bias, low variance) vs complex models (low bias, high variance)

## Common Pitfalls
- Assuming "more complex model" always means "better" — it often just trades bias for variance
- Ignoring that more training data reduces variance but doesn't fix a fundamentally biased (too-simple) model

## Related Terms
- [[Overfitting vs Underfitting]]
- [[Regularization (L1, L2, Dropout)]]
- [[Ensemble Methods]]

## Example
A linear model fit to clearly curved data has high bias (underfits); a 20-degree polynomial fit to the same data has high variance (overfits, wiggling to match every point).
