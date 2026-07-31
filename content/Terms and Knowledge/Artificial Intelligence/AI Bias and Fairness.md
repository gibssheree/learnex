---
tags: [term, ai, ethics]
category: Ethics & Safety
---

# AI Bias and Fairness

**Definition:** Systematic skew in a model's outputs that unfairly favors or disadvantages particular groups, usually inherited from imbalanced or historically biased training data.

## How It Works
- Models learn statistical patterns in training data, including whatever social biases are embedded in it
- Bias can enter at multiple stages: data collection, labeling, model architecture, and even evaluation metrics

## Why It Matters
- Biased models can cause real harm at scale — in hiring, lending, policing, and healthcare tools
- Regulatory and reputational risk is growing as AI is deployed in more consequential decisions

## Common Pitfalls
- Assuming "removing a protected attribute" (like race) from data removes bias — proxies (like zip code) often reintroduce it
- Optimizing only for aggregate accuracy without checking performance across subgroups

## Related Terms
- [[AI Alignment]]
- [[Explainable AI (XAI)]]

## Example
A resume-screening model trained mostly on past hires at a male-dominated company learns to downrank resumes with female-coded terms.
