---
tags: [term, ai, nlp]
category: Language & NLP
---

# Tokenization

**Definition:** Splitting text into smaller units (tokens) — words, subwords, or characters — that a model can process as numbers.

## How It Works
- A tokenizer (e.g., BPE, WordPiece) breaks text into subword chunks based on frequency in training data
- Each token maps to an integer ID, which the model turns into an embedding vector

## Why It Matters
- Determines a model's context window usage and cost (APIs bill per token, not per word)
- Explains quirks like LLMs struggling to count letters in a word — they see tokens, not characters

## Common Pitfalls
- Assuming 1 token ≈ 1 word — it's closer to ¾ of a word in English, less for other languages
- Forgetting that unusual words/names may get split into many small, awkward tokens, hurting model performance

## Related Terms
- [[Embeddings]]
- [[Large Language Model (LLM)]]

## Example
"unbelievable" might tokenize as `["un", "believ", "able"]` — three tokens for one word.
