---
tags: [term, ml]
category: Core ML Concepts
---

# Cross-Validation

**Definition:** A technique for evaluating model performance by splitting data into multiple train/test partitions and averaging results, to get a more reliable estimate than a single train/test split.

## How It Works
- k-fold CV: split data into k parts, train on k-1 parts and validate on the remaining part, rotate k times
- Average the k validation scores to estimate how the model will perform on unseen data

## Why It Matters
- A single train/test split can be misleading due to lucky/unlucky splits — CV reduces that variance in evaluation
- Standard practice for hyperparameter tuning and model comparison

## Common Pitfalls
- Data leakage — letting information from validation folds influence preprocessing (e.g., scaling) done before splitting
- Using plain k-fold on time-series data, which breaks temporal order and leaks future information into training

## Related Terms
- [[Overfitting vs Underfitting]]
- [[Hyperparameter Tuning]]

## Example
5-fold CV on 1,000 samples trains 5 separate models, each validated on a different 200-sample slice, then averages the 5 accuracy scores.
