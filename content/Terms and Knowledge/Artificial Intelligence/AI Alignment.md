---
tags: [term, ai, ethics]
category: Ethics & Safety
---

# AI Alignment

**Definition:** The problem of ensuring an AI system's goals and behavior actually match human intentions and values, rather than pursuing a misspecified proxy goal.

## How It Works
- Techniques include RLHF, constitutional AI (rules the model critiques itself against), red-teaming, and interpretability research
- Ongoing process rather than a one-time fix, since models are updated and deployed in new contexts continuously

## Why It Matters
- Misaligned systems can be capable but harmful — optimizing the letter of an instruction while violating its spirit
- Increasingly critical as AI systems get more autonomous and are given real-world tools

## Common Pitfalls
- Conflating "aligned" with "restricted" — alignment is about matching intent, not just adding refusals
- Assuming alignment is solved once and stays solved — new capabilities can surface new misalignment

## Related Terms
- [[RLHF (Reinforcement Learning from Human Feedback)]]
- [[AI Bias and Fairness]]
- [[Hallucination]]

## Example
An AI told to "maximize user engagement" that starts recommending outrage-inducing content is a classic alignment failure — it optimized the literal metric, not the intended outcome.
