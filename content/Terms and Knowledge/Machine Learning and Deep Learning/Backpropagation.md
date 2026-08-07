---
tags: [term, deep-learning]
category: Training Mechanics
---

# Backpropagation

**Definition:** The algorithm that efficiently computes the gradient of a neural network's loss with respect to every weight, by propagating error backward from the output layer to the input layer using the chain rule.

## How It Works
1. Forward pass: input flows through the network to produce a prediction
2. Compute loss by comparing prediction to the true label
3. Backward pass: apply the chain rule layer by layer, from output back to input, to get each weight's gradient
4. Gradient descent then uses these gradients to update the weights
5. Each layer caches the intermediate values computed during the forward pass (pre-activations, activations)
6. The backward pass needs those cached values to compute local derivatives
7. This caching is why training consumes far more memory than inference — inference can discard intermediate activations immediately, training can't
8. The process repeats for every batch, every epoch, incrementally nudging weights toward lower loss
9. Frameworks build a computation graph during the forward pass specifically so the backward pass knows which operations to differentiate and in what order

## Under the Hood
Backprop is a disciplined, efficient application of the chain rule across a computation graph. For a simple 2-layer network with loss `L`, weights `W1`, `W2`, pre-activations `z1`, `z2`, and activations `a1 = f(z1)`, `a2 = f(z2)`:

```
dL/dW2 = dL/da2 * da2/dz2 * dz2/dW2
dL/dW1 = dL/da2 * da2/dz2 * dz2/da1 * da1/dz1 * dz1/dW1
```

Notice `dL/da2 * da2/dz2` is shared between both gradient computations. Backprop computes this term once — call it `delta2`, the "error signal" at layer 2 — and reuses it rather than recomputing shared subexpressions from scratch. This reuse is what makes backprop O(n) in the number of edges in the network, instead of the exponential blowup of computing each weight's gradient independently.

Generalizing, the error signal at layer `l` is:

```
delta_l = (W_(l+1)^T . delta_(l+1)) elementwise* f'(z_l)
```

This recursive definition is the entire algorithm: each layer's error depends only on the next layer's error and local derivatives. Once you have `delta_l` for every layer, the gradient with respect to that layer's weights is `delta_l . a_(l-1)^T`.

### Worked numeric example
A tiny network: one input `x = 1.0`, one weight `w = 0.5`, no bias, activation `f(z) = z^2` (illustrative, not a real activation), target `y = 4.0`, loss `L = (f(z) - y)^2`.

```
Forward:  z = w*x = 0.5        a = f(z) = z^2 = 0.25       L = (0.25 - 4)^2 = 14.0625
Backward: dL/da = 2*(a - y) = 2*(0.25 - 4) = -7.5
          da/dz = 2*z = 1.0
          dz/dw = x = 1.0
          dL/dw = dL/da * da/dz * dz/dw = -7.5 * 1.0 * 1.0 = -7.5
Update:   w_new = w - lr * dL/dw = 0.5 - 0.01 * (-7.5) = 0.575
```
Every layer of a real network repeats this same three-step pattern (local derivative, multiply into the incoming signal, pass the product further back) — depth just means more links in the chain.

## History
Backpropagation as applied to multi-layer neural networks was popularized by Rumelhart, Hinton, and Williams in their 1986 paper "Learning representations by back-propagating errors." The core mathematical technique (reverse-mode automatic differentiation) dates back further in control theory and was independently derived by several researchers, including Paul Werbos in his 1974 PhD thesis. It took until the 2000s-2010s — with GPUs, larger datasets, and tricks like ReLU and [[Batch Normalization]] to combat vanishing gradients — for backprop-trained deep networks to become practically dominant.

## Why It Matters
- The algorithm that made training deep (many-layer) neural networks computationally feasible
- Without it, gradient descent would require impractically expensive numerical estimation per weight
- Naive numerical differentiation (perturb each weight slightly, measure the change in loss) requires one forward pass per weight
- For a network with millions of parameters, that's millions of forward passes per single update
- Backprop gets the exact gradient for all weights in a single backward pass, roughly the same cost as one forward pass
- Modern frameworks (PyTorch, TensorFlow) automate this via "autograd" — you never hand-derive these formulas in practice
- Understanding the mechanics is still essential for debugging vanishing/exploding gradients, custom loss functions, and custom layers

## Code Example
```python
import torch

# Autograd performs backprop automatically once you call .backward()
x = torch.tensor([1.0, 2.0], requires_grad=False)
W1 = torch.randn(2, 3, requires_grad=True)
W2 = torch.randn(3, 1, requires_grad=True)

z1 = x @ W1
a1 = torch.relu(z1)
z2 = a1 @ W2
loss = (z2 - torch.tensor([1.0]))**2

loss.backward()          # this IS backpropagation
print(W1.grad)           # dL/dW1, computed via chain rule
print(W2.grad)           # dL/dW2

# Manual gradient descent step (what an optimizer does under the hood)
with torch.no_grad():
    W1 -= 0.01 * W1.grad
    W2 -= 0.01 * W2.grad
    W1.grad.zero_()       # must clear, or next backward() accumulates onto this
    W2.grad.zero_()
```

## Real-World Example
Training an image classifier on ImageNet with a ResNet-50: a single forward pass pushes a batch of images through roughly 50 layers to produce class predictions, and the loss (cross-entropy against the true labels) is a single number. Backprop then walks that number backward through all 50 layers in one pass, computing gradients for around 25 million parameters simultaneously.

Without backprop's reuse of shared intermediate terms, computing those 25 million gradients via naive numerical differentiation would require roughly 25 million separate forward passes per training step — turning a training run that takes hours into one that would take years on the same hardware.

## Common Pitfalls
- Vanishing/exploding gradients in very deep networks, where signal shrinks or blows up as it propagates backward
- Treating backprop and gradient descent as the same thing — backprop computes gradients, gradient descent uses them to update weights
- Forgetting to zero out accumulated gradients between batches (`optimizer.zero_grad()` in PyTorch) — gradients accumulate by default, silently corrupting training
- Detaching a tensor from the computation graph (e.g., converting to NumPy and back) partway through a custom forward pass, which silently breaks gradient flow upstream
- Assuming backprop gives a globally optimal gradient direction — it gives the exact local gradient, not a guarantee about the overall loss surface
- Loss landscapes in deep networks are non-convex, so gradient descent can still land in a poor local minimum or saddle point even with perfectly correct gradients
- Running backward() twice on the same graph without `retain_graph=True`, which raises an error because intermediate buffers are freed after the first backward pass by default

## Best Practices
- Use gradient clipping (capping the norm of the gradient vector) when training RNNs or very deep networks prone to exploding gradients
- Check for NaN or Inf in gradients early in a training run — it's almost always a numerical stability issue (bad initialization, too-high learning rate, or a log(0) in the loss), and it's easier to catch immediately than after hours of training
- Use `torch.autograd.gradcheck` or manual finite-difference checks when implementing a custom layer's backward pass, to confirm your hand-derived gradient matches numerical differentiation
- Profile memory usage on deep networks — if you don't need gradients for a subgraph (e.g., a frozen pretrained backbone), wrap it in `torch.no_grad()` to skip caching activations you'll never backpropagate through

## Comparison: Backprop vs. Forward-Mode Autodiff

| | Reverse-mode (backprop) | Forward-mode autodiff |
|---|---|---|
| Efficient when | Few outputs, many inputs (typical neural net: 1 loss, millions of weights) | Many outputs, few inputs |
| Cost per pass | One backward pass computes gradients for all weights | One forward pass computes derivatives for one input direction only |
| Memory | Must cache intermediate activations for the backward pass | No need to cache the full forward computation |
| Typical use | Deep learning training | Sensitivity analysis, some scientific computing |

## Common Interview Questions
- What's the computational complexity of backprop relative to the forward pass? Roughly the same order — both are O(number of edges in the computation graph).
- Why do we need to cache activations from the forward pass? Because the local derivatives used in the chain rule (like `f'(z)`) depend on the actual values computed during the forward pass, not just the network's structure.
- What's the difference between backprop and backpropagation through time (BPTT)? BPTT is backprop applied to a recurrent network unrolled across time steps — same chain rule, applied along the temporal dimension in addition to the depth dimension.
- Why is backprop (reverse-mode autodiff) preferred over forward-mode for training neural networks? Because a network has one scalar loss but millions of weights — reverse mode computes gradients for all of them in a single backward pass, while forward mode would need a separate pass per weight.
- What causes exploding gradients, mechanically? Repeated multiplication by weight matrices (or derivatives) with magnitude greater than 1 across many layers compounds multiplicatively, the mirror image of the vanishing gradient problem caused by factors less than 1.

## Debugging Backprop in Practice
A short checklist engineers actually use when a network isn't training:
- Print gradient norms per layer after the first backward pass — near-zero norms in early layers point to vanishing gradients, huge norms point to exploding gradients
- Verify the loss actually decreases on a tiny toy dataset (even 10 examples) before trusting results on the full dataset — if a model can't overfit 10 examples, something in the forward/backward pipeline is broken
- Check that `requires_grad=True` is set on all trainable parameters and that no unintended `.detach()` or `.data` access breaks the graph
- Confirm the loss function's input/output shapes match what it expects (e.g., raw logits vs. probabilities) — a mismatched shape often trains "successfully" while learning nothing meaningful
- Watch for a loss that goes to NaN a few steps in — almost always a learning rate too high or a numerical instability like `log(0)` inside the loss
- Compare gradients computed by autograd against a manual finite-difference estimate on a small subset of parameters, as a last-resort sanity check when a custom operation is suspected

## Backprop Through Different Architectures
- **Feedforward networks**: the case described above — chain rule applied once per layer, straightforwardly back through the stack
- **Convolutional networks**: the same chain rule applies, but the local derivative at a conv layer involves a correlation operation with the flipped kernel, which is why frameworks implement a dedicated "conv2d backward" operation rather than reusing the dense-layer backward pass
- **Recurrent networks**: backprop through time (BPTT) unrolls the recurrent layer across time steps and applies the chain rule across both depth and time simultaneously, which is why RNNs are especially prone to vanishing/exploding gradients over long sequences
- **Transformers**: backprop flows through attention weights as well as the usual linear layers — the softmax inside attention has its own local derivative that must be chained through just like any other activation

## Related Terms
- [[Gradient Descent]]
- [[Vanishing-Exploding Gradient]]
- [[Neural Network]]
- [[Activation Function]]
- [[Learning Rate]]

## Example
In a 5-layer network, an error at the output layer is mathematically traced back through layers 4, 3, 2, and 1 to determine how much each layer's weights contributed to the mistake. Concretely: if layer 5's output was too high, backprop computes exactly how much of that error is attributable to layer 4's output via the chain rule, then how much of layer 4's error is attributable to layer 3, and so on.

Each layer only needs the error signal handed to it from the layer after it, plus its own local derivative — never the full end-to-end formula spelled out across all five layers at once. That locality is precisely what keeps the algorithm computationally tractable at depth.
