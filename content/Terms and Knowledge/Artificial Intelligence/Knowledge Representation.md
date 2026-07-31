---
tags: [term, ai]
category: Foundations
---

# Knowledge Representation

**Definition:** The study of how to encode facts and relationships about the world so a machine can reason over them.

## How It Works
- Symbolic forms: logic rules, semantic networks, ontologies, knowledge graphs
- Modern forms: vector embeddings that encode meaning as geometry rather than symbols

## Why It Matters
- Underpins expert systems, recommendation engines, and search (e.g., Google's Knowledge Graph)
- Embeddings are the representation layer that makes modern LLMs and semantic search work

## Common Pitfalls
- Over-engineering rigid symbolic ontologies that break the moment real-world data doesn't fit cleanly
- Assuming embeddings are interpretable — their dimensions rarely map to human-readable concepts

## Related Terms
- [[Embeddings]]
- [[Expert Systems]]

## Example
A knowledge graph storing `(Jakarta) —capitalOf→ (Indonesia)` lets a system answer "what's the capital of Indonesia?" via lookup instead of guessing.
