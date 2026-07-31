---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Autoencoder

**Definition:** A neural network trained to reconstruct its own input, forced through a narrow "bottleneck" layer that compels it to learn a compressed, meaningful representation of the data.

## How It Works
- Encoder: compresses input into a smaller latent representation
- Decoder: reconstructs the original input from that compressed representation
- Trained to minimize reconstruction error, with no labels required (unsupervised)

## Why It Matters
- Used for dimensionality reduction, denoising, and anomaly detection (things that reconstruct poorly are flagged as unusual)
- The conceptual ancestor of more advanced generative models like variational autoencoders (VAEs)

## Common Pitfalls
- Making the bottleneck too large, so the network just learns to copy input to output without learning useful structure
- Expecting an autoencoder to generate novel, realistic new samples — plain autoencoders reconstruct, they don't generate well (VAEs and GANs are better suited for that)

## Related Terms
- [[Unsupervised Learning]]
- [[GAN (Generative Adversarial Network)]]

## Example
An autoencoder trained on normal network traffic reconstructs unusual traffic poorly, flagging high reconstruction error as a potential security anomaly.
