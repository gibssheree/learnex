---
tags: [term, ai, nlp]
category: Language & NLP
---

# Hallucination

**Definition:** When an LLM generates confident, fluent output that is factually incorrect or unsupported by any real source.

## How It Works
- The model is optimized to predict plausible next tokens, not to verify truth
- When it lacks real knowledge, it fills gaps with statistically likely-sounding but false content

## Why It Matters
- The main reliability risk of LLM applications, especially for facts, citations, and code APIs
- Drives the need for RAG, citations, and human review in high-stakes use cases

## Common Pitfalls
- Trusting fabricated citations, library functions, or statistics without verification
- Assuming a more confident tone means more accurate — LLMs hallucinate with the same fluency as correct answers

## Related Terms
- [[Retrieval-Augmented Generation (RAG)]]
- [[Large Language Model (LLM)]]
- [[AI Alignment]]

## Example
An LLM citing a research paper that sounds real, with a plausible title and author, but doesn't actually exist.
