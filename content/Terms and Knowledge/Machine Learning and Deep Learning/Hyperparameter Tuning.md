---
tags: [term, ml]
category: Training Mechanics
---

# Hyperparameter Tuning

**Definition:** The process of searching for the best configuration values (learning rate, batch size, number of layers, regularization strength, etc.) that are set before training rather than learned from data.

## How It Works
- Grid search: exhaustively try every combination in a predefined range
- Random search: sample combinations randomly — often more efficient than grid search
- Bayesian optimization / automated tools (e.g., Optuna): model which hyperparameters are promising and search intelligently

## Why It Matters
- Hyperparameters aren't learned by gradient descent — picking them badly can make an otherwise-good model perform poorly
- Often the difference between a mediocre and a state-of-the-art result on the same architecture

## Common Pitfalls
- Tuning hyperparameters using the test set, which leaks information and inflates reported performance
- Manually guessing without a systematic search, wasting compute on unpromising regions

## Related Terms
- [[Cross-Validation]]
- [[Learning Rate]]

## Example
Running a random search over learning rate, batch size, and dropout rate, evaluating each combination via 5-fold cross-validation to find the best-performing set.
