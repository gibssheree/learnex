---
tags: [term, ai, agents]
category: Agents & Systems
---

# Function Calling (Tool Use)

**Definition:** The ability of an LLM to invoke external functions/APIs (search, calculator, database, code execution) as part of generating a response, extending it beyond pure text generation.

## How It Works
- The model is given a schema of available tools (name, description, parameters)
- Given a prompt, it decides whether to call a tool, emits a structured call, the host app executes it, and returns the result to the model to continue reasoning

## Why It Matters
- Turns LLMs from text predictors into agents that can act — search the web, run code, update a database
- The foundation of "AI agent" products, including this very assistant

## Common Pitfalls
- Giving a model too many overlapping tools, causing indecision or wrong tool selection
- Not validating/sandboxing tool calls — a model can call a destructive action without safeguards

## Related Terms
- [[Intelligent Agent]]
- [[Multi-Agent System]]
- [[Large Language Model (LLM)]]

## Example
Asking an LLM "what's the weather in Jakarta?" and it calls a `get_weather(city)` function rather than guessing from memory.
