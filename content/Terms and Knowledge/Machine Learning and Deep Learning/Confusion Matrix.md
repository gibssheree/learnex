---
tags: [term, ml]
category: Evaluation
---

# Confusion Matrix

**Definition:** A table that breaks down a classification model's predictions against actual labels, showing true positives, true negatives, false positives, and false negatives.

## How It Works
- Rows = actual class, columns = predicted class (or vice versa, depending on convention)
- Diagonal cells = correct predictions; off-diagonal cells = specific types of errors
- Basis for computing precision, recall, F1, and other classification metrics

## Why It Matters
- Reveals what kind of mistakes a model makes, which plain accuracy hides entirely
- Essential for imbalanced datasets, where a high-accuracy model can still be practically useless (see Precision/Recall)

## Common Pitfalls
- Only checking overall accuracy and never looking at the matrix, missing that a model might be failing badly on one specific class
- Not accounting for class imbalance when interpreting the matrix's raw counts

## Related Terms
- [[Precision, Recall, and F1 Score]]
- [[Supervised Learning]]

## Example
A spam classifier's confusion matrix might show it catches 95% of spam (true positives) but also wrongly flags 10% of legitimate emails as spam (false positives).
