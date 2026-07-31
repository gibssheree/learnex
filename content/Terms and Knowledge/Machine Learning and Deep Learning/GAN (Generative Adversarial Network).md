---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# GAN (Generative Adversarial Network)

**Definition:** A generative model made of two competing neural networks — a generator that creates fake data and a discriminator that tries to distinguish fake from real — trained together in an adversarial game.

## How It Works
1. The generator creates synthetic samples (e.g., images) from random noise
2. The discriminator tries to classify samples as real or generator-made
3. Both networks improve through competition: the generator learns to fool the discriminator, the discriminator learns to catch better fakes

## Why It Matters
- Was the leading approach for realistic image/video/audio generation before diffusion models became dominant
- Introduced the influential "adversarial training" concept used elsewhere in ML (e.g., adversarial robustness testing)

## Common Pitfalls
- Training instability — GANs are notoriously hard to train, prone to mode collapse (generator produces limited variety) or one network overpowering the other
- Assuming GANs are still state-of-the-art for image generation — diffusion models have largely surpassed them in recent years

## Related Terms
- [[Autoencoder]]
- [[Neural Network]]

## Example
A GAN trained on celebrity face photos learns to generate entirely new, realistic-looking faces of people who don't exist.
