---
tags: [term, ml]
category: Core ML Concepts
---

# Feature Engineering

**Definition:** The process of selecting, transforming, or creating input variables (features) to improve a model's ability to learn patterns.

## How It Works
- Transform raw data into more informative representations: normalization, encoding categories, extracting date parts, combining columns
- Domain knowledge often drives which features will actually help (e.g., "day of week" for retail sales)

## Why It Matters
- Historically the single biggest lever for classical ML model performance, before deep learning's automatic feature learning
- Still critical for tabular data problems (deep learning hasn't fully displaced feature engineering there)

## Common Pitfalls
- Leaking target information into a feature (e.g., using a column only known after the outcome occurs)
- Over-engineering hundreds of features without validating each one actually helps

## Related Terms
- [[Supervised Learning]]
- [[Embeddings]]

## Example
Turning a raw timestamp column into "hour of day," "day of week," and "is_weekend" features to help a model detect usage patterns.
