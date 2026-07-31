---
tags: [term, ml]
category: Core ML Concepts
---

# Unsupervised Learning

**Definition:** A machine learning approach where a model finds structure or patterns in data that has no labels — no "correct answer" is provided during training.

## How It Works
- Clustering: group similar data points together (e.g., k-means)
- Dimensionality reduction: compress data into fewer dimensions while preserving structure (e.g., PCA, autoencoders)
- Association: find items that frequently co-occur (e.g., market basket analysis)

## Why It Matters
- Useful when labeled data is scarce or expensive, which is most real-world data
- Powers customer segmentation, anomaly detection, and topic discovery

## Common Pitfalls
- No ground truth means evaluating quality is harder and more subjective than in supervised learning
- Choosing the wrong number of clusters/dimensions without validating against domain knowledge

## Related Terms
- [[Supervised Learning]]
- [[Autoencoder]]

## Example
Grouping e-commerce customers into segments (e.g., "bargain hunters," "loyal high-spenders") based on purchase behavior, with no predefined labels.
