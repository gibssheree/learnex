---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Batch Normalization

**Definition:** A technique that normalizes a layer's inputs (to zero mean, unit variance) within each mini-batch during training, stabilizing and speeding up deep network training.

## How It Works
- For each mini-batch, compute the mean and variance of activations, normalize them, then apply learnable scale/shift parameters
- Reduces "internal covariate shift" — the tendency for each layer's input distribution to keep shifting as earlier layers' weights update during training

## Why It Matters
- Allows higher learning rates and faster convergence, and reduces sensitivity to weight initialization
- Became a near-default component in deep CNN architectures after its introduction

## Common Pitfalls
- Using it with very small batch sizes, where batch statistics become noisy and unreliable
- Forgetting that batch norm behaves differently at inference time (uses running averages, not batch statistics) — a common source of train/inference mismatch bugs

## Related Terms
- [[Neural Network]]
- [[Gradient Descent]]

## Example
Adding batch normalization layers to a deep CNN often lets you train with a 5-10x higher learning rate without diverging.
