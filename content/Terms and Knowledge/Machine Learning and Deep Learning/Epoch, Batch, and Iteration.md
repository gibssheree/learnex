---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Epoch, Batch, and Iteration

**Definition:** The units that describe how training data moves through a model — an epoch is one full pass over the entire dataset, a batch is a subset processed together, and an iteration is one weight update (one batch processed).

## How It Works
- Dataset of 10,000 samples with batch size 100 → 100 iterations per epoch
- Weights update after each batch (iteration), not after the whole dataset — this is what makes training on huge datasets feasible
- Multiple epochs let the model see the data repeatedly, refining its weights each pass

## Why It Matters
- Batch size affects training speed, memory usage, and gradient noise (small batches = noisier but sometimes better-generalizing updates)
- Misreading these terms is a common source of confusion when reading training logs or papers

## Common Pitfalls
- Confusing "epoch" with "iteration" when reading training curves or logs
- Choosing a batch size purely for speed without considering its effect on generalization and GPU memory limits

## Related Terms
- [[Gradient Descent]]
- [[Hyperparameter Tuning]]

## Example
Training on 50,000 images with a batch size of 500 means 100 iterations per epoch; training for 20 epochs means the model sees the full dataset 20 times, or 2,000 total iterations.
