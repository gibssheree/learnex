---
tags: [term, ml]
category: Core ML Concepts
---

# Supervised Learning

**Definition:** A machine learning approach where a model learns from labeled examples — input paired with the correct output — to predict outputs for new, unseen inputs.

## How It Works
- Feed the model (input, correct label) pairs, e.g. (house features, price)
- The model adjusts internal parameters to minimize the gap between its prediction and the true label
- Two main types: regression (continuous output) and classification (categorical output)

## Why It Matters
- The most common and best-understood ML paradigm — powers spam filters, price prediction, image classifiers
- Requires labeled data, which is often the biggest cost/bottleneck in real projects

## Common Pitfalls
- Training on data that doesn't reflect real-world distribution, hurting generalization
- Mislabeled or noisy training data silently capping model quality

## Related Terms
- [[Unsupervised Learning]]
- [[Loss Function]]
- [[Overfitting vs Underfitting]]

## Example
Training a model on thousands of emails labeled "spam" or "not spam" so it can classify new incoming emails.
