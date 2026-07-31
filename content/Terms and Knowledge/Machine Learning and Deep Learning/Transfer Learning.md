---
tags: [term, ml, deep-learning]
category: Neural Network Architectures
---

# Transfer Learning

**Definition:** Reusing a model pre-trained on a large, general dataset as the starting point for a new, related task — instead of training a model from scratch.

## How It Works
- Take a model pre-trained on a huge dataset (e.g., ImageNet for vision, a large text corpus for language)
- Either freeze most of its layers and retrain only the final layers on your specific task, or fine-tune the whole model with a lower learning rate

## Why It Matters
- Drastically reduces the data and compute needed to get strong results on a new task
- The reason small teams can build competitive models without training a foundation model themselves

## Common Pitfalls
- Fine-tuning with too high a learning rate, destroying the useful pre-trained weights ("catastrophic forgetting")
- Using a pre-trained model whose original training domain is too different from the target task, limiting transfer benefit

## Related Terms
- [[Fine-Tuning]]
- [[Convolutional Neural Network (CNN)]]

## Example
Taking a CNN pre-trained on millions of general images and fine-tuning only its last layers to classify specific types of manufacturing defects, using just a few hundred labeled examples.
