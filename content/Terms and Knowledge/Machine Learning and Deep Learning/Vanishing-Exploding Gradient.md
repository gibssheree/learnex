---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Vanishing/Exploding Gradient

**Definition:** A training problem in deep networks where gradients become extremely small (vanishing) or extremely large (exploding) as they propagate backward through many layers, stalling or destabilizing training.

## How It Works
- Backpropagation multiplies gradients layer by layer via the chain rule
- If each layer's gradient contribution is consistently < 1, the product shrinks toward zero across many layers (vanishing)
- If consistently > 1, the product grows explosively (exploding)

## Why It Matters
- Was the main obstacle to training very deep networks before solutions like ReLU, batch normalization, residual connections, and LSTMs/attention were developed
- Explains why plain RNNs struggle with long sequences and why "deep" learning wasn't practical until these fixes existed

## Common Pitfalls
- Diagnosing training that "just doesn't improve" as a data problem when it's actually a vanishing gradient issue
- Not using gradient clipping for exploding gradients, letting a few bad batches destroy an otherwise-good training run

## Related Terms
- [[Backpropagation]]
- [[Activation Function]]
- [[Recurrent Neural Network (RNN)]]

## Example
A 50-layer network using only Sigmoid activations trains painfully slowly because gradients shrink toward zero before reaching the earliest layers — solved by switching to ReLU and adding residual (skip) connections.
