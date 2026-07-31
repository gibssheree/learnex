---
tags: [term, ml]
category: Evaluation
---

# Precision, Recall, and F1 Score

**Definition:** Classification metrics derived from the confusion matrix. Precision measures how many predicted positives were actually correct; recall measures how many actual positives were correctly found; F1 is their harmonic mean, balancing both.

## How It Works
- Precision = True Positives / (True Positives + False Positives) — "when the model says yes, how often is it right?"
- Recall = True Positives / (True Positives + False Negatives) — "of all actual positives, how many did the model catch?"
- F1 = 2 × (Precision × Recall) / (Precision + Recall) — useful when you need a single balanced number

## Why It Matters
- Plain accuracy is misleading on imbalanced datasets (e.g., 99% accuracy on 1%-fraud data by always predicting "not fraud")
- The right metric to optimize for depends entirely on the cost of false positives vs false negatives in your specific problem

## Common Pitfalls
- Optimizing accuracy alone on an imbalanced dataset, producing a model that's technically accurate but practically useless
- Chasing high recall without considering precision cost (e.g., a cancer screening tool that flags everyone as positive has perfect recall but is useless)

## Related Terms
- [[Confusion Matrix]]
- [[Supervised Learning]]

## Example
A fraud detector with high recall but low precision catches almost all fraud but also falsely flags many legitimate transactions — a tradeoff that must match the business's tolerance for each type of error.
