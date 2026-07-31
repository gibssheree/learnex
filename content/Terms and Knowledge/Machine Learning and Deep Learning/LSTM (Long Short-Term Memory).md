---
tags: [term, deep-learning, nlp]
category: Neural Network Architectures
---

# LSTM (Long Short-Term Memory)

**Definition:** A type of RNN with a gating mechanism (input, forget, output gates) specifically designed to retain relevant information over long sequences and mitigate the vanishing gradient problem.

## How It Works
- Maintains a separate "cell state" that acts as a conveyor belt for long-term memory
- Gates learn what to keep, forget, and output at each step, controlling information flow more deliberately than a plain RNN

## Why It Matters
- Was the dominant architecture for sequence modeling (translation, speech recognition) for years before transformers displaced it
- Still used in some latency-sensitive or streaming applications where transformers' full-context attention is overkill

## Common Pitfalls
- Assuming LSTMs handle arbitrarily long context as well as transformers do — they still degrade over very long sequences, just less than plain RNNs
- Using LSTMs for new large-scale NLP projects today when a transformer would train faster (parallelizable) and perform better

## Related Terms
- [[Recurrent Neural Network (RNN)]]
- [[Vanishing-Exploding Gradient]]

## Example
Older Google Translate versions used LSTM-based sequence-to-sequence models before switching to transformer-based architectures.
