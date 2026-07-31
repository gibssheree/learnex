---
tags: [term, ai, ethics]
category: Ethics & Safety
---

# Explainable AI (XAI)

**Definition:** Techniques and tools that make an AI model's decisions interpretable to humans, instead of treating it as an unexplainable black box.

## How It Works
- Model-agnostic methods: SHAP, LIME — estimate which input features most influenced a specific prediction
- Intrinsically interpretable models: decision trees, linear regression — transparent by design, at the cost of raw predictive power

## Why It Matters
- Required in regulated domains (finance, healthcare, hiring) where decisions must be justifiable
- Helps developers debug why a model fails in specific cases, not just that it does

## Common Pitfalls
- Treating an explanation method's output as ground truth — SHAP/LIME approximate reasoning, they don't reveal it exactly
- Sacrificing too much accuracy for interpretability when it isn't actually required by the use case

## Related Terms
- [[AI Bias and Fairness]]
- [[Expert Systems]]

## Example
A loan-denial system that shows "denied primarily due to high debt-to-income ratio" instead of just outputting "no" with no reasoning.
