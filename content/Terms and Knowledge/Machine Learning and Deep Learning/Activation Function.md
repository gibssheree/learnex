---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Activation Function

**Definition:** A nonlinear function applied to a neuron's output that lets neural networks learn complex, non-linear patterns instead of collapsing into a single linear transformation.

## How It Works
- Common choices: ReLU (max(0, x), fast and widely used), Sigmoid (squashes to 0-1, used for binary outputs), Softmax (turns a vector into a probability distribution, used for multi-class outputs)
- Applied after each layer's weighted sum, before passing output to the next layer

## Why It Matters
- Without nonlinearity, stacking any number of layers is mathematically equivalent to one linear layer — depth would be pointless
- Choice of activation affects training speed and gradient stability (e.g., ReLU largely solved the vanishing gradient problem that plagued Sigmoid-heavy networks)

## Common Pitfalls
- Using Sigmoid/Tanh in deep hidden layers, which can cause vanishing gradients in deep networks
- Using Softmax on a non-final layer or for a non-classification task where it doesn't make sense

## Related Terms
- [[Neural Network]]
- [[Vanishing-Exploding Gradient]]

## Example
ReLU outputs 0 for any negative input and passes positive inputs through unchanged — cheap to compute and effective in most modern hidden layers.
