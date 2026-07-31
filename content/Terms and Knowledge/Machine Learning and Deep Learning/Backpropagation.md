---
tags: [term, deep-learning]
category: Training Mechanics
---

# Backpropagation

**Definition:** The algorithm that efficiently computes the gradient of a neural network's loss with respect to every weight, by propagating error backward from the output layer to the input layer using the chain rule.

## How It Works
1. Forward pass: input flows through the network to produce a prediction
2. Compute loss by comparing prediction to the true label
3. Backward pass: apply the chain rule layer by layer, from output back to input, to get each weight's gradient
4. Gradient descent then uses these gradients to update the weights

## Why It Matters
- The algorithm that made training deep (many-layer) neural networks computationally feasible
- Without it, gradient descent would require impractically expensive numerical estimation per weight

## Common Pitfalls
- Vanishing/exploding gradients in very deep networks, where signal shrinks or blows up as it propagates backward
- Treating backprop and gradient descent as the same thing — backprop computes gradients, gradient descent uses them to update weights

## Related Terms
- [[Gradient Descent]]
- [[Vanishing-Exploding Gradient]]
- [[Neural Network]]

## Example
In a 5-layer network, an error at the output layer is mathematically traced back through layers 4, 3, 2, and 1 to determine how much each layer's weights contributed to the mistake.
