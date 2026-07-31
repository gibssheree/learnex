---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Loss Function

**Definition:** A function that quantifies how wrong a model's prediction is compared to the true value — the number that training tries to minimize.

## How It Works
- Regression tasks: mean squared error (MSE), mean absolute error (MAE)
- Classification tasks: cross-entropy loss
- The chosen loss shapes what "good" means for the model and directly drives gradient descent's updates

## Why It Matters
- Picking the wrong loss function optimizes the model for the wrong thing, even if training "works" smoothly
- Different losses penalize errors differently (e.g., MSE punishes large errors much more than small ones)

## Common Pitfalls
- Using accuracy as if it were a loss function — it's not differentiable and can't directly drive gradient descent
- Using MSE for classification tasks instead of cross-entropy, leading to slow or unstable training

## Related Terms
- [[Gradient Descent]]
- [[Supervised Learning]]

## Example
Cross-entropy loss heavily penalizes a model that predicts "5% cat" when the true label is "cat," pushing it to be both correct and confident.
