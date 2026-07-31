---
tags: [term, ml]
category: Core ML Concepts
---

# Reinforcement Learning

**Definition:** A learning paradigm where an agent learns to make decisions by taking actions in an environment and receiving rewards or penalties, aiming to maximize cumulative reward over time.

## How It Works
- Agent observes state → takes action → environment returns reward + new state
- Over many episodes, the agent learns a policy (strategy) that maximizes long-term reward, via methods like Q-learning or policy gradients

## Why It Matters
- Distinct from supervised learning — there's no fixed "correct answer" per step, only delayed feedback
- Powers game-playing AI (AlphaGo), robotics control, and RLHF used to align LLMs

## Common Pitfalls
- Reward hacking — the agent finds an unintended shortcut that maximizes reward without achieving the real goal
- Sample inefficiency — RL often needs vastly more trial-and-error than supervised learning to converge

## Related Terms
- [[RLHF (Reinforcement Learning from Human Feedback)]]
- [[Supervised Learning]]

## Example
A robot learning to walk by being rewarded for forward progress and penalized for falling, through millions of simulated trial steps.
