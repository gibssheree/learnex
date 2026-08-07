---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# GAN (Generative Adversarial Network)

**Definition:** A generative model made of two competing neural networks — a generator that creates fake data and a discriminator that tries to distinguish fake from real — trained together in an adversarial game.

## How It Works
1. The generator maps random noise `z` (sampled from a simple distribution, e.g., Gaussian) to synthetic samples in the data space (e.g., images) via `G(z)`
2. The discriminator `D` takes a sample (real or generated) and outputs the probability it's real
3. Both networks improve through competition: the generator learns to fool the discriminator by producing more realistic outputs, the discriminator learns to catch better fakes
4. Training alternates: update D to better separate real from fake, then update G to better fool the current D, repeating until (ideally) the generator's output distribution matches the real data distribution and D can't do better than random guessing

## Under the Hood
- The original minimax objective (Goodfellow et al., 2014): `min_G max_D E[log D(x)] + E[log(1 - D(G(z)))]` — D is trained to maximize this, G is trained to minimize it
- In practice, the generator's gradient from `log(1 - D(G(z)))` vanishes early in training when D easily rejects G's poor early outputs, so implementations typically use the "non-saturating" loss instead: maximize `log D(G(z))` for the generator, which provides stronger gradients when G is still weak
- At the theoretical optimum, D(x) = 0.5 everywhere — the discriminator can no longer tell real from fake, meaning the generator's distribution exactly matches the real data distribution
- Training is a two-player zero-sum game with no guaranteed convergence — unlike standard gradient descent minimizing a single loss, alternating minimax optimization can oscillate or diverge instead of settling into an equilibrium
- Mode collapse: the generator finds a small set of outputs that reliably fool the current discriminator and stops exploring, producing low-diversity samples (e.g., generating the same few faces repeatedly) — a direct consequence of G optimizing against a single, momentarily-fixed D rather than the true data distribution
- Common stabilization tricks: label smoothing (train D on soft targets like 0.9 instead of 1.0), feature matching (match statistics of intermediate discriminator layers instead of raw output), minibatch discrimination (let D compare samples within a batch to catch low-diversity generator output), spectral normalization (constrains D's Lipschitz constant for more stable gradients), and Wasserstein loss with gradient penalty (WGAN-GP, replaces the original JS-divergence-based loss with an Earth Mover's distance that provides smoother gradients even when real and fake distributions barely overlap)

## Variants
- **DCGAN (2015)**: established convolutional architecture conventions for stable GAN training (strided convolutions instead of pooling, batch norm in both networks, ReLU/LeakyReLU activations) — became the default starting architecture for image GANs
- **Conditional GAN (cGAN)**: feeds a class label or condition into both G and D, allowing controlled generation (e.g., "generate a digit 7" instead of a random digit)
- **CycleGAN**: learns image-to-image translation between two unpaired domains (e.g., horses to zebras, photos to paintings) using a cycle-consistency loss instead of requiring matched training pairs
- **Pix2Pix**: conditional GAN for paired image-to-image translation (e.g., sketches to photos), trained with matched input/output pairs
- **WGAN / WGAN-GP**: replaces the original loss with a Wasserstein distance estimate, addressing training instability and mode collapse with a more theoretically grounded loss and clearer correlation between loss value and sample quality
- **StyleGAN (2018) / StyleGAN2 / StyleGAN3**: introduced a style-based generator that injects noise and learned "style" vectors at multiple resolutions, giving fine-grained control over generated image attributes and producing the highly realistic synthetic faces behind sites like thispersondoesnotexist.com
- **BigGAN**: scaled GAN training to very large batch sizes and model capacity, substantially improving image generation fidelity and diversity on complex, multi-class datasets like ImageNet

## Comparison
| | GAN | Diffusion Model | Autoencoder (vanilla/VAE) |
|---|---|---|---|
| Training stability | Notoriously unstable (adversarial game) | Stable (simple denoising loss) | Stable (reconstruction loss) |
| Sample quality (images) | High, sharp | Highest currently, very sharp | Blurrier (VAE), N/A for vanilla AE |
| Sampling speed | Fast (single forward pass) | Slow (many denoising steps, though distillation narrows this) | Fast (single forward pass) |
| Explicit likelihood | No | Approximate | Yes (VAE, via ELBO) |
| Mode coverage | Prone to mode collapse | Generally good coverage | Good coverage, but blurry outputs (VAE) |

See [[Autoencoder]] for the encoder-decoder alternative to adversarial generation.

## Code Example
```python
import torch
import torch.nn as nn

# Minimal training step sketch — alternating D and G updates
def train_step(G, D, real_batch, opt_G, opt_D, z_dim, device):
    batch_size = real_batch.size(0)
    criterion = nn.BCEWithLogitsLoss()

    # --- Train Discriminator ---
    z = torch.randn(batch_size, z_dim, device=device)
    fake_batch = G(z).detach()  # detach: don't backprop into G here
    d_real = D(real_batch)
    d_fake = D(fake_batch)
    loss_D = criterion(d_real, torch.ones_like(d_real)) + \
             criterion(d_fake, torch.zeros_like(d_fake))
    opt_D.zero_grad(); loss_D.backward(); opt_D.step()

    # --- Train Generator (non-saturating loss) ---
    z = torch.randn(batch_size, z_dim, device=device)
    fake_batch = G(z)
    d_fake = D(fake_batch)
    loss_G = criterion(d_fake, torch.ones_like(d_fake))  # G wants D fooled
    opt_G.zero_grad(); loss_G.backward(); opt_G.step()

    return loss_D.item(), loss_G.item()
```

## History
- Ian Goodfellow and colleagues introduced GANs in a 2014 paper, reportedly conceived after a bar debate about whether generative models could be trained via a two-network competitive game rather than explicit density estimation
- DCGAN (2015) made GANs practically trainable for images at a time when results were often noisy and unstable
- 2016-2018 saw rapid architectural experimentation (conditional GANs, CycleGAN, Pix2Pix, WGAN) addressing training stability and enabling new applications like unpaired image translation
- StyleGAN (2018-2021) pushed photorealistic face generation to the point of being difficult for humans to distinguish from real photos, raising early public awareness of synthetic media/deepfake concerns
- From roughly 2021 onward, diffusion models (DALL-E 2, Stable Diffusion, Midjourney) overtook GANs as the dominant approach for high-fidelity image generation, offering more stable training and better mode coverage, though GANs remain relevant where fast single-pass sampling matters more than absolute fidelity

## Why It Matters
- Was the leading approach for realistic image/video/audio generation before diffusion models became dominant for top-end fidelity
- Introduced the influential "adversarial training" concept used elsewhere in ML (e.g., adversarial robustness testing, domain adaptation via adversarial feature alignment)
- Still practically relevant where fast sampling matters — a trained GAN generates a sample in a single forward pass, while diffusion models need many iterative denoising steps (though distilled/few-step diffusion variants are closing that gap)
- Popularized image-to-image translation tasks (style transfer, super-resolution, colorization, data augmentation for scarce classes) that remain useful production techniques independent of pure "creative" generation

## Common Pitfalls
- Training instability — GANs are notoriously hard to train, prone to mode collapse (generator produces limited variety) or one network overpowering the other (if D becomes too strong too fast, G's gradients vanish and it stops improving)
- Assuming GANs are still state-of-the-art for image generation — diffusion models have largely surpassed them on fidelity and diversity benchmarks in recent years
- Judging GAN training solely by the loss curves — unlike standard supervised training, G and D losses don't monotonically decrease toward some clean optimum, and a "good-looking" loss curve doesn't guarantee good samples; visual/metric-based inspection (FID score, Inception Score) is necessary
- Using an unbalanced learning rate or update frequency between G and D without monitoring, letting one network dominate early and stall the other's learning signal
- Forgetting `detach()` (or the equivalent) when generating fake samples for the discriminator update, which would otherwise needlessly backpropagate through the generator during the D-only update step

## Best Practices
- Use the non-saturating generator loss (`maximize log D(G(z))`) instead of the original minimax formulation to avoid vanishing gradients early in training
- Track Fréchet Inception Distance (FID) alongside loss curves — it's a far more reliable proxy for sample quality and diversity than either network's loss value
- Apply label smoothing and/or instance noise to the discriminator's real-sample labels to prevent it from becoming overconfident and stalling generator learning
- Start from an established, stability-tested architecture (DCGAN conventions, StyleGAN) rather than designing G/D architectures from scratch

## FAQ
- **Why is GAN training considered harder than standard supervised training?** Standard training minimizes a single, well-behaved loss; GAN training is a simultaneous two-player game where each network's "loss landscape" shifts as the other network updates, so there's no guarantee of converging to a stable equilibrium.
- **What is mode collapse, concretely?** The generator learns to produce a narrow subset of plausible outputs (e.g., always the same face, or a handful of digit styles) because that subset already fools the current discriminator — reducing diversity even as individual samples look realistic.
- **Are GANs and autoencoders solving the same problem?** Both are generative, but a GAN has no explicit reconstruction objective or encoder — it only ever sees random noise as generator input, whereas an [[Autoencoder]]/VAE explicitly encodes real data into a latent space and decodes it back, giving it a notion of "reconstruction error" a GAN doesn't have.

## Related Terms
- [[Autoencoder]]
- [[Neural Network]]
- [[Loss Function]]
- [[Convolutional Neural Network (CNN)]]

## Example
A GAN trained on celebrity face photos learns to generate entirely new, realistic-looking faces of people who don't exist. Early in training, the generator's output looks like colored noise, and the discriminator trivially tells it apart from real photos (D's accuracy near 100%). As training progresses, the generator starts producing blurry face-like blobs, then plausible facial structure, then fine details like consistent lighting and hair texture — each improvement driven by the discriminator continuing to find and exploit whatever gives away the fakes, forcing the generator to fix exactly that flaw next. A production use of this same mechanism is synthetic data augmentation: a GAN trained on a rare defect class in manufacturing images can generate additional realistic-looking defect examples to balance an otherwise heavily imbalanced training set for a downstream classifier.
