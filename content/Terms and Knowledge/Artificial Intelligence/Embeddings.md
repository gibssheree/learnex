---
tags: [term, ai, nlp]
category: Language & NLP
---

# Embeddings

**Definition:** Dense numerical vectors that represent the meaning of text, images, or other data such that similar things end up close together in vector space.

## How It Works
- A model maps input (a word, sentence, image) to a fixed-length vector, e.g. 768 or 1536 numbers
- Similarity is measured with cosine similarity or dot product between vectors

## Why It Matters
- The backbone of semantic search, recommendation systems, and RAG pipelines
- Lets you compare meaning ("king" vs "queen") rather than just matching exact text

## Common Pitfalls
- Comparing embeddings from two different models — vector spaces aren't compatible across models
- Treating embedding similarity as ground truth — it approximates semantic closeness, not factual correctness

## Related Terms
- [[Retrieval-Augmented Generation (RAG)]]
- [[Knowledge Representation]]
- [[Tokenization]]

## Example
`embedding("king") - embedding("man") + embedding("woman")` lands close to `embedding("queen")` — the famous word-vector analogy.
