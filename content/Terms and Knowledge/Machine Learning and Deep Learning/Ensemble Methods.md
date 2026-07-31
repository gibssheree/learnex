---
tags: [term, ml]
category: Evaluation
---

# Ensemble Methods

**Definition:** Techniques that combine predictions from multiple models to produce a result more accurate and robust than any single model alone.

## How It Works
- Bagging (e.g., Random Forest): train many models independently on random subsets of data, then average/vote their predictions — reduces variance
- Boosting (e.g., XGBoost, AdaBoost): train models sequentially, each one focusing on correcting the previous model's errors — reduces bias
- Stacking: train a "meta-model" that learns how to best combine the outputs of several different base models

## Why It Matters
- Consistently among the top-performing approaches for structured/tabular data competitions (Kaggle-style problems)
- Reduces the risk of any single model's blind spots or overfitting dominating the final prediction

## Common Pitfalls
- Assuming ensembling always helps — it adds complexity and inference cost, and gains can be marginal if base models are too similar/correlated
- Using boosting without controlling for overfitting (it can fit training data very tightly if unchecked)

## Related Terms
- [[Bias-Variance Tradeoff]]
- [[Supervised Learning]]

## Example
A Random Forest averages predictions from hundreds of individual decision trees, each trained on a different random subset of the data, to produce a more stable overall prediction.
