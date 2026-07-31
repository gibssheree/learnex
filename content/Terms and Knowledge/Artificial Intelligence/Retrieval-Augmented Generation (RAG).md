---
tags: [term, ai, nlp]
category: Language & NLP
---

# Retrieval-Augmented Generation (RAG)

**Definition:** A pattern where an LLM's prompt is augmented with relevant documents retrieved from an external knowledge source, so the model can answer using up-to-date or private data it wasn't trained on.

## How It Works
1. Embed a user's query into a vector
2. Search a vector database for the most similar stored document chunks
3. Inject those chunks into the LLM's prompt as context
4. The LLM generates an answer grounded in that retrieved context

## Why It Matters
- Cheaper and faster than fine-tuning for adding new/private knowledge
- Reduces hallucination by grounding answers in real, citable source text

## Common Pitfalls
- Poor chunking strategy (too large/small) hurts retrieval relevance
- Assuming RAG eliminates hallucination entirely — the model can still misread or ignore retrieved context

## Related Terms
- [[Embeddings]]
- [[Hallucination]]
- [[Large Language Model (LLM)]]

## Example
A support chatbot that searches your company's docs for relevant passages, then answers the user's question using only that retrieved text.
