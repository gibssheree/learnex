---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Gradient Descent

**Definition:** The core optimization algorithm used to train ML models — it iteratively adjusts model parameters in the direction that most reduces the loss function.

## How It Works
1. Compute the loss (how wrong the model currently is)
2. Compute the gradient (direction of steepest increase in loss) with respect to each parameter
3. Update each parameter by stepping in the opposite direction, scaled by the learning rate
4. Repeat over many iterations until loss stops meaningfully decreasing

## Why It Matters
- The mechanism that trains essentially every modern ML model, from linear regression to giant LLMs
- Variants (SGD, Adam, RMSprop) trade off speed, stability, and memory differently

## Common Pitfalls
- Learning rate too high — the model overshoots and diverges instead of converging
- Learning rate too low — training crawls or gets stuck in a shallow local minimum

## Related Terms
- [[Backpropagation]]
- [[Loss Function]]
- [[Learning Rate]]

## Example
Rolling a ball down a hilly loss landscape — gradient descent repeatedly nudges it toward the nearest valley (a low-loss point).
