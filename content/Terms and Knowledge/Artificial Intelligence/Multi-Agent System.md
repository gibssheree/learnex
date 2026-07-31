---
tags: [term, ai, agents]
category: Agents & Systems
---

# Multi-Agent System

**Definition:** A system composed of multiple autonomous AI agents that interact — cooperating, negotiating, or competing — to solve tasks no single agent handles alone.

## How It Works
- Agents each have a role, tools, and goals (e.g., "researcher," "coder," "reviewer")
- They communicate via messages or a shared state/orchestrator, often looping until a task is complete

## Why It Matters
- Emerging pattern for complex LLM-powered workflows (e.g., a coding agent + a testing agent + a review agent)
- Can decompose large tasks better than one monolithic prompt

## Common Pitfalls
- Cascading errors — one agent's mistake propagates and compounds through the rest of the system
- Over-engineering a multi-agent pipeline when a single well-prompted agent would suffice

## Related Terms
- [[Intelligent Agent]]
- [[Function Calling (Tool Use)]]

## Example
An AI coding assistant where a "planner" agent breaks down a feature request and a separate "implementer" agent writes the code.
