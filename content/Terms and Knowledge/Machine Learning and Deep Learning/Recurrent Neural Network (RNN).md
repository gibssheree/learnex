---
tags: [term, deep-learning, nlp]
category: Neural Network Architectures
---

# Recurrent Neural Network (RNN)

**Definition:** A neural network architecture designed for sequential data, where the network maintains a "hidden state" that carries information from previous steps forward through the sequence.

## How It Works
- Processes input one step at a time (e.g., one word at a time), updating a hidden state that summarizes everything seen so far
- The same weights are reused at every time step, unlike a plain feedforward network

## Why It Matters
- The standard architecture for sequence tasks (text, time series, speech) before transformers took over
- Historically important for understanding why attention/transformers were such a big leap — RNNs process sequentially and struggle with long-range dependencies

## Common Pitfalls
- Assuming RNNs handle long sequences well — vanishing gradients make them forget distant context
- Using a plain RNN today for a new project instead of an LSTM or transformer, which almost always outperform it

## Related Terms
- [[LSTM (Long Short-Term Memory)]]
- [[Transformer Architecture|Transformer Architecture]]
- [[Vanishing-Exploding Gradient]]

## Example
An old-school RNN-based text generator predicting the next word one step at a time, using its hidden state as short-term memory of prior words.
