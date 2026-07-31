---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Neural Network

**Definition:** A model made of layers of interconnected nodes ("neurons") that transform input data through weighted connections and nonlinear activation functions to learn complex patterns.

## How It Works
- Input layer receives features, hidden layers transform them via weights + activation functions, output layer produces the prediction
- Each connection has a learnable weight; training (via backpropagation + gradient descent) adjusts these weights to reduce loss
- Stacking more layers ("deep" learning) lets the network learn increasingly abstract representations

## Why It Matters
- The foundational architecture behind virtually all modern AI breakthroughs — CNNs, RNNs, and transformers are all neural networks with specialized structure
- Universal approximation: a sufficiently large network can in theory approximate any function

## Common Pitfalls
- Assuming bigger networks are automatically better — they need proportionally more data and compute, or they overfit
- Skipping activation functions between layers, which collapses the whole network into a single linear transformation

## Related Terms
- [[Backpropagation]]
- [[Activation Function]]
- [[Convolutional Neural Network (CNN)]]

## Example
A simple network with one hidden layer can learn to classify handwritten digits (0-9) from pixel values, given enough labeled examples.
