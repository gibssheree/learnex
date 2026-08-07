---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Activation Function

**Definition:** A nonlinear function applied to a neuron's output that lets neural networks learn complex, non-linear patterns instead of collapsing into a single linear transformation.

## How It Works
- Common choices: ReLU (max(0, x), fast and widely used), Sigmoid (squashes to 0-1, used for binary outputs), Softmax (turns a vector into a probability distribution, used for multi-class outputs)
- Applied after each layer's weighted sum, before passing output to the next layer
- Each neuron computes `z = w·x + b` (a linear combination), then passes `z` through the activation function to produce `a = f(z)`
- The nonlinearity happens at the activation step, not the weighted-sum step — the weighted sum alone is still linear
- The choice is typically uniform across all hidden layers of a network
- A different, task-specific activation is reserved for the output layer: Sigmoid for binary classification, Softmax for multi-class, linear/none for regression
- Activation functions are applied element-wise — each neuron's output is transformed independently
- There is no interaction between neurons at the activation step; interaction only happens through the weighted sums

## Under the Hood
The core formulas, given pre-activation input `z`:

```
Sigmoid:   f(z) = 1 / (1 + e^-z)                range (0, 1)
Tanh:      f(z) = (e^z - e^-z) / (e^z + e^-z)   range (-1, 1)
ReLU:      f(z) = max(0, z)                     range [0, inf)
LeakyReLU: f(z) = z if z > 0 else a*z           range (-inf, inf), a ~ 0.01
Softmax:   f(z_i) = e^z_i / sum_j(e^z_j)        outputs sum to 1
```

Backpropagation needs the derivative `f'(z)` at every neuron:

```
Sigmoid derivative: f'(z) = f(z) * (1 - f(z))   maxes out at 0.25 (at z=0)
Tanh derivative:    f'(z) = 1 - f(z)^2          maxes out at 1.0 (at z=0)
ReLU derivative:    f'(z) = 1 if z > 0 else 0
```

A few consequences worth internalizing:
- Sigmoid's maximum derivative is 0.25 — every layer you backpropagate through multiplies the gradient by at most 0.25
- Stack 10 sigmoid layers and the gradient can shrink by roughly 0.25^10 ≈ 1e-6 before reaching the earliest layers
- This is the mechanical cause of the [[Vanishing-Exploding Gradient]] problem in sigmoid-heavy networks
- Tanh is better than sigmoid (max derivative 1.0 instead of 0.25) but still saturates at the extremes, where the derivative approaches 0
- ReLU's derivative is either exactly 0 or exactly 1 — no shrinkage for the "alive" path, but zero gradient at all for the "dead" path
- This all-or-nothing derivative is why ReLU networks train fast when healthy but can develop permanently dead neurons

## History
- 1950s-60s: the perceptron used a hard step function — output is 0 or 1, with a discontinuous, non-differentiable jump, incompatible with gradient-based training
- 1980s-2000s: sigmoid and tanh dominated once backpropagation (Rumelhart, Hinton, Williams, 1986) required differentiable activations
- 2010-2011: Nair and Hinton, and separately Glorot et al., showed ReLU trains deep networks dramatically faster than sigmoid/tanh by avoiding saturation on the positive side
- 2015: Leaky ReLU, PReLU (He et al.), and ELU addressed the dead-neuron problem introduced by hard ReLU
- 2016: GELU (Hendrycks and Gimpel) introduced a smooth, probabilistic alternative, later adopted as the default in BERT and GPT-style transformers
- 2017: Swish (Ramachandran et al. at Google) was discovered via automated search over activation function space, not hand-designed

## Variants
- **Sigmoid** — smooth, historically popular, but saturates (derivative approaches 0) for large |z|, causing vanishing gradients. Still standard for binary classification output layers.
- **Tanh** — zero-centered version of sigmoid, generally preferred over sigmoid in hidden layers when a bounded activation is needed, but still saturates at the extremes.
- **ReLU** — the modern default for hidden layers. Cheap (one comparison), no saturation for positive inputs, but neurons can "die" if a large update pushes their weights so `z` is always negative afterward.
- **Leaky ReLU / Parametric ReLU (PReLU)** — allows a small negative slope (`a*z` for z < 0) instead of a hard 0, preventing dead neurons. PReLU learns `a` as a trainable parameter.
- **ELU (Exponential Linear Unit)** — smooth negative-side curve that pushes mean activations closer to zero, which can speed convergence versus ReLU.
- **GELU (Gaussian Error Linear Unit)** — smooth, probabilistic gating (`z * Phi(z)`); the default in transformer architectures like BERT and GPT.
- **Swish / SiLU** — `z * sigmoid(z)`, discovered via automated architecture search; smooth and non-monotonic, used in EfficientNet.
- **Mish** — `z * tanh(softplus(z))`, another smooth self-gated activation used in some modern CNN/object-detection architectures (YOLOv4).
- **Softmax** — not applied per-neuron independently; normalizes an entire vector into a probability distribution. Reserved for multi-class output layers, not hidden layers.

## Why It Matters
- Without nonlinearity, stacking any number of layers is mathematically equivalent to one linear layer — depth would be pointless
- Choice of activation affects training speed and gradient stability
- ReLU largely solved the vanishing gradient problem that plagued Sigmoid-heavy networks
- Activation choice interacts with weight initialization: He initialization assumes ReLU-family activations, Xavier/Glorot assumes sigmoid/tanh
- Mismatching initialization and activation slows convergence or causes activations to explode/vanish from the very first forward pass
- The output-layer activation determines what loss function is mathematically appropriate
- Softmax pairs with cross-entropy loss, Sigmoid with binary cross-entropy, linear/none with MSE for regression
- Getting this pairing wrong produces gradients that don't correspond to the intended probabilistic interpretation of the output

## Comparison

| Activation | Range | Saturates? | Compute Cost | Typical Use |
|---|---|---|---|---|
| Sigmoid | (0, 1) | Yes, both tails | Exponential | Binary output layer |
| Tanh | (-1, 1) | Yes, both tails | Exponential | RNN gates, older hidden layers |
| ReLU | [0, inf) | Only negative side | 1 comparison | Default hidden layer (CNNs, MLPs) |
| Leaky ReLU | (-inf, inf) | No | 1 comparison + multiply | Fixing dead ReLUs |
| GELU | ~(-0.17, inf) | Softly | Exponential/erf | Transformers |
| Softmax | (0, 1), sums to 1 | N/A (vector-level) | Exponential | Multi-class output layer |

## Code Example
```python
import torch
import torch.nn as nn

x = torch.tensor([-2.0, -0.5, 0.0, 0.5, 2.0])

print(torch.relu(x))          # tensor([0.0, 0.0, 0.0, 0.5, 2.0])
print(torch.sigmoid(x))       # tensor([0.119, 0.378, 0.5, 0.622, 0.881])
print(torch.tanh(x))          # tensor([-0.964, -0.462, 0.0, 0.462, 0.964])
print(nn.functional.gelu(x))  # tensor([-0.045, -0.154, 0.0, 0.346, 1.955])
print(nn.functional.silu(x))  # Swish/SiLU: tensor([-0.238, -0.187, 0.0, 0.312, 1.762])

# Typical hidden-layer usage in a small MLP
model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 64),
    nn.ReLU(),
    nn.Linear(64, 10)   # raw logits; softmax applied inside CrossEntropyLoss
)

# Detecting dead ReLUs during training
def dead_relu_fraction(activations: torch.Tensor) -> float:
    # fraction of neurons that output exactly 0 across a batch
    return (activations == 0).float().mean().item()
```

## Common Pitfalls
- Using Sigmoid/Tanh in deep hidden layers, which can cause vanishing gradients in deep networks
- Using Softmax on a non-final layer or for a non-classification task where it doesn't make sense
- Applying Softmax manually and then feeding the result into `nn.CrossEntropyLoss` in PyTorch, which already applies softmax internally — this double-applies it and silently degrades training
- Using plain ReLU with a high learning rate on a poorly initialized network, pushing neurons into the "dead ReLU" zone permanently
- Forgetting that the output layer usually needs a different activation (or none) than the hidden layers
- Copy-pasting ReLU onto a regression output layer, which clips all negative predictions to zero
- Assuming a "better" activation from a paper will automatically help your specific architecture — gains are often architecture- and scale-dependent

## Best Practices
- Default to ReLU for hidden layers unless you have a specific reason not to
- Reach for GELU or Swish in transformer or very deep architectures where the smoother gradient has been empirically shown to help
- Pair activation choice with the matching weight initialization scheme (He for ReLU-family, Xavier for sigmoid/tanh)
- Monitor for dead ReLUs during training by checking the fraction of zero activations per layer
- A layer that's more than half dead is a red flag worth investigating — consider Leaky ReLU or a lower learning rate
- Use Sigmoid/Tanh deliberately in gated architectures (LSTM gates) where their bounded output is the point, not a limitation

## FAQ
**Why not just use a linear activation everywhere?** Because composing linear functions produces another linear function — a 100-layer linear network has the same representational power as a single layer.

**Is ReLU differentiable at z=0?** Not technically (it has a kink), but frameworks define the derivative as 0 or 1 there by convention, and it never causes practical problems.

**Why do transformers prefer GELU over ReLU?** GELU's smoothness (no hard cutoff at zero) gives better gradient flow at the specific scale and depth transformers operate at — this is empirically observed rather than proven theoretically.

**Can an activation function have no derivative issues at all?** Not really — every bounded activation saturates somewhere, and every unbounded one risks exploding activations; the choice is always a tradeoff, not a free lunch.

## Common Interview Questions
- Why can't a deep network with only linear layers learn XOR? Because any composition of linear layers is itself linear, and XOR is not linearly separable — you need at least one nonlinear activation between layers to bend the decision boundary.
- What happens if you initialize all weights to zero in a ReLU network? Every neuron in a layer computes the same output and receives the same gradient, so they update identically forever — this is the "symmetry breaking" problem, solved by random initialization, not by activation choice.
- Why does Softmax subtract the max value before exponentiating in practice? Numerical stability — `e^z` overflows for large `z`, so implementations compute `e^(z - max(z))` first, which is mathematically identical but avoids floating-point overflow.

## Related Terms
- [[Neural Network]]
- [[Vanishing-Exploding Gradient]]
- [[Backpropagation]]
- [[Batch Normalization]]
- [[Gradient Descent]]

## Example
ReLU outputs 0 for any negative input and passes positive inputs through unchanged — cheap to compute and effective in most modern hidden layers. A concrete failure mode: if a neuron's weights get updated such that its weighted sum `z` is negative for every training example, ReLU's gradient is 0 everywhere it's evaluated, so that neuron never updates again — it's permanently "dead."

Leaky ReLU (`f(z) = 0.01z` for `z < 0`) fixes this by keeping a small but nonzero gradient on the negative side, giving a dead neuron a path back to life. In practice, teams debugging a stalled network will often swap ReLU for Leaky ReLU as a quick diagnostic — if accuracy suddenly improves, dead neurons were likely the culprit.
