---
tags: [term, product-management, metrics, experimentation]
category: Measurement
---

# A/B Testing

**Definition:** An experiment that randomly shows two (or more) versions of a product to different user groups, then compares a target metric between them to decide which version actually performs better.

## How It Works
- Users are randomly split into groups, one sees the current version (control), another sees the change (variant)
- A specific metric is tracked for both groups (conversion rate, click-through rate) over a defined period
- Statistical significance testing determines whether an observed difference is real or just random noise, drawing on the same fundamentals covered in [[Discrete Mathematics Terms MOC|Discrete Mathematics]]'s probability concepts

## Why It Matters
- Replaces internal opinion and debate with actual evidence of what real users respond to, often catching results that contradict what the team expected

## Common Pitfalls
- Ending a test too early once it looks like it's "winning," before reaching statistical significance, a common cause of false positives
- Testing so many small variants that some appear to "win" by pure chance alone, without a large enough sample to trust the result

## Related Terms
- [[North Star Metric]]
- [[OKRs (Objectives and Key Results)]]
- [[Mixpanel]]

## Example
An e-commerce site tests a green versus blue "Buy Now" button on a random 50/50 split of traffic, and measures which version leads to more completed purchases.
