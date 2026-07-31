---
tags: [term, deep-learning, vision]
category: Neural Network Architectures
---

# Convolutional Neural Network (CNN)

**Definition:** A neural network architecture specialized for grid-like data (especially images) that uses small sliding filters (convolutions) to detect local patterns like edges, textures, and shapes.

## How It Works
- Convolutional layers slide learnable filters across the input, producing feature maps that highlight patterns
- Pooling layers downsample feature maps, reducing size while keeping important information
- Deeper layers combine simple features (edges) into complex ones (eyes, faces, objects)

## Why It Matters
- Dominated computer vision for a decade (ImageNet-winning architectures like ResNet) before Vision Transformers started competing
- Far more parameter-efficient than fully-connected networks for image data, because filters are shared across the whole image

## Common Pitfalls
- Using a CNN on data without spatial/local structure, where the architecture's core advantage doesn't apply
- Not using data augmentation (rotations, crops, flips), leading to overfitting on limited image datasets

## Related Terms
- [[Neural Network]]
- [[Computer Vision]]
- [[Object Detection]]

## Example
A CNN trained on labeled X-ray images learns to detect pneumonia by recognizing telltale patterns of opacity in lung regions.
