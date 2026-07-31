---
tags: [term, ai, vision]
category: Vision & Perception
---

# Object Detection

**Definition:** A computer vision task that identifies both what objects are in an image and where they are, usually via bounding boxes.

## How It Works
- Combines classification (what is it) with localization (where is it)
- Common architectures: YOLO (single-pass, fast), Faster R-CNN (region-proposal based, more accurate)

## Why It Matters
- Distinct from plain image classification, which only labels the whole image
- Core to autonomous vehicles, security systems, and retail inventory scanning

## Common Pitfalls
- Confusing detection with segmentation — detection gives boxes, segmentation gives pixel-level masks
- Poor performance on small or overlapping objects if the model/anchors weren't tuned for the use case

## Related Terms
- [[Computer Vision]]
- [[Convolutional Neural Network (CNN)]]

## Example
A YOLO model drawing a box around every car and pedestrian in a street camera feed, in real time.
