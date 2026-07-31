---
tags: [term, ai]
category: Foundations
---

# Intelligent Agent

**Definition:** Anything that perceives its environment through sensors and acts upon it through actuators to achieve goals — the core abstraction of classical AI.

## How It Works
- Perceive → reason/decide → act, often in a loop
- Ranges from simple reflex agents (if-then rules) to goal-based and utility-based agents that plan ahead

## Why It Matters
- Nearly every AI system (a search engine, a robot, an LLM with tools) can be framed as an agent
- The frame underlies modern "AI agents" that call tools and take multi-step actions

## Common Pitfalls
- Assuming an agent is intelligent just because it's autonomous — a thermostat is technically an agent
- Ignoring the environment's observability/complexity when designing an agent's decision logic

## Related Terms
- [[Multi-Agent System]]
- [[Function Calling (Tool Use)]]
- [[Search Algorithms]]

## Example
A self-driving car is an agent: cameras/lidar are sensors, steering/braking are actuators, and the goal is safe navigation.
