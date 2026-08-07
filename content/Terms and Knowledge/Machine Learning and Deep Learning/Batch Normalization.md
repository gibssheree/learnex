---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Batch Normalization

**Definition:** A technique that normalizes a layer's inputs (to zero mean, unit variance) within each mini-batch during training, stabilizing and speeding up deep network training.

## How It Works
- For each mini-batch, compute the mean and variance of activations, normalize them, then apply learnable scale/shift parameters
- Reduces "internal covariate shift" — the tendency for each layer's input distribution to keep shifting as earlier layers' weights update during training
- Typically inserted between the linear/convolutional layer and the activation function: `Linear -> BatchNorm -> ReLU`
- Maintains running (exponential moving average) estimates of mean and variance during training
- Those running estimates get frozen and reused at inference time instead of computing fresh batch statistics
- Operates per-channel in convolutional networks — each feature map gets its own mean, variance, scale (gamma), and shift (beta)
- Statistics are computed across the batch and spatial dimensions, but not across channels
- Adds two learnable parameters per channel/feature: gamma (scale) and beta (shift)

## Under the Hood
For a mini-batch of activations `{x_1, ..., x_m}`:

```
mu_B      = (1/m) * sum(x_i)                     batch mean
sigma_B^2 = (1/m) * sum((x_i - mu_B)^2)           batch variance
x_hat_i   = (x_i - mu_B) / sqrt(sigma_B^2 + eps)  normalize
y_i       = gamma * x_hat_i + beta                scale and shift
```

`eps` is a small constant (e.g., 1e-5) to prevent division by zero. `gamma` and `beta` are learned parameters, initialized to 1 and 0 respectively.

Critically, this means batch norm can learn to undo the normalization entirely (`gamma = sqrt(sigma_B^2)`, `beta = mu_B`) if that's what minimizes loss — so it never strictly reduces the network's representational capacity, it only changes the optimization dynamics.

At inference, batch statistics aren't available (you might be predicting on a single example), so batch norm uses running estimates accumulated during training via exponential moving average:

```
running_mean = momentum * running_mean + (1 - momentum) * batch_mean
running_var  = momentum * running_var  + (1 - momentum) * batch_var
```

This train/inference asymmetry is exactly why frameworks require explicitly calling `model.eval()` before inference:
- Forgetting it leaves the layer computing batch statistics on whatever batch size inference happens to use
- Including a batch size of 1, where variance is mathematically undefined (division by zero or a degenerate value)
- The bug is often silent — the model still produces output, just wrong or unstable output

## Why It Matters
- Allows higher learning rates and faster convergence
- Reduces sensitivity to weight initialization
- Became a near-default component in deep CNN architectures after its introduction
- Acts as a mild regularizer — batch statistics vary slightly batch to batch, so each training example is normalized against a slightly different mean/variance
- That batch-to-batch noise has a similar effect to [[Regularization (L1, L2, Dropout)|Dropout]]
- Later research (Santurkar et al., 2018) suggested batch norm's real benefit is smoothing the loss landscape
- That smoothing makes gradients more predictable and consistent, rather than primarily reducing internal covariate shift as originally claimed
- The mechanism is still debated in the literature, but the empirical training-speed benefit is not

## History
Introduced by Sergey Ioffe and Christian Szegedy in their 2015 paper "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift." It was one of the key enablers of training very deep CNNs (ResNets and beyond) reliably, and its success spurred a family of alternative normalization schemes — Layer Norm (2016), Instance Norm (2016), and Group Norm (2018) — each tailored to architectures where batch norm's batch-dependence is a liability.

## Comparison

| Method | Normalizes across | Batch-size dependent? | Typical use |
|---|---|---|---|
| Batch Norm | Batch + spatial dims, per channel | Yes — degrades at small batch sizes | CNNs with large batch sizes |
| Layer Norm | All features, per example | No | Transformers, RNNs, small/variable batch sizes |
| Instance Norm | Spatial dims only, per example per channel | No | Style transfer, GANs |
| Group Norm | Groups of channels, per example | No | Small-batch CNN training (detection, segmentation) |

Layer Norm in particular has become the default in transformer architectures precisely because sequence models often use variable or small batch sizes, and normalizing per-example rather than per-batch avoids batch norm's instability in that regime.

## Code Example
```python
import torch.nn as nn

class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, kernel_size=3, padding=1)
        self.bn = nn.BatchNorm2d(out_ch)   # one gamma/beta pair per channel
        self.act = nn.ReLU()

    def forward(self, x):
        return self.act(self.bn(self.conv(x)))

model = ConvBlock(3, 64)

model.train()   # uses live batch statistics
output_train = model(torch.randn(32, 3, 224, 224))

model.eval()    # switches to running_mean / running_var
with torch.no_grad():
    output_eval = model(torch.randn(1, 3, 224, 224))  # works fine even at batch size 1

# Inspect the learned parameters and running stats directly
print(model.bn.weight)          # gamma, shape [64]
print(model.bn.bias)            # beta, shape [64]
print(model.bn.running_mean)    # shape [64]
print(model.bn.running_var)     # shape [64]
```

## Real-World Example
Training Inception-v3 (the original network in the batch norm paper) on ImageNet: without batch norm, the authors needed a carefully tuned, low learning rate and roughly 14 times more training steps to reach the same accuracy achievable with batch norm at a much higher learning rate. This wasn't a minor speedup — it changed batch norm from a nice-to-have into a near-mandatory component of the standard deep CNN training recipe for years afterward.

A more everyday example: a team fine-tuning a pretrained CNN for medical image segmentation, forced by GPU memory limits into a batch size of 2 due to large 3D volumes, often finds batch norm's running statistics become unstable and hurts validation performance — switching those layers to Group Norm, which doesn't depend on batch size at all, is a standard fix in that exact situation.

## Common Pitfalls
- Using it with very small batch sizes, where batch statistics become noisy and unreliable
- Forgetting that batch norm behaves differently at inference time (uses running averages, not batch statistics) — a common source of train/inference mismatch bugs
- Forgetting to call `model.eval()` before evaluation/inference in PyTorch, which leaves batch norm computing live batch statistics on the eval set
- That same mistake breaks entirely on a batch size of 1, since variance over a single example is degenerate
- Combining batch norm with a very small batch size forced by memory constraints (e.g., large images with batch size 2) — Group Norm is usually a better fit in that regime
- Placing dropout immediately before batch norm, an ordering shown to interact badly because dropout changes the variance of the activations batch norm is trying to normalize
- Applying batch norm to a recurrent network naively, where varying sequence lengths per batch make batch statistics inconsistent across time steps

## Best Practices
- Prefer Layer Norm or Group Norm when batch sizes are small or variable, especially for transformers, RNNs, and detection/segmentation models
- Always call `model.train()` / `model.eval()` explicitly around the corresponding phase — don't rely on defaults
- Don't combine batch norm with very aggressive dropout rates in the same block; if using both, order dropout after batch norm, not before
- When fine-tuning a pretrained model with a small batch size, consider freezing batch norm running statistics rather than letting them update on unrepresentative mini-batches

## FAQ
**Does batch norm eliminate the need for careful weight initialization?** It reduces sensitivity to it significantly, but doesn't eliminate it entirely — extremely poor initialization can still cause issues in the first few steps before batch norm's statistics stabilize.

**Can you use batch norm with batch size 1?** Technically no during training — variance over one example is degenerate. This is a common reason teams switch to Layer Norm or Group Norm for memory-constrained tasks like high-resolution segmentation.

**Why does batch norm have both a running mean/variance and a batch mean/variance?** The batch statistics are used during training because they're differentiable and available per step; the running statistics are accumulated as a stable estimate for use at inference, when a representative batch may not exist.

## Common Interview Questions
- Why does batch norm allow higher learning rates? Because normalizing layer inputs keeps activations in a consistent range regardless of how earlier weights have shifted, which prevents the large, erratic updates that would otherwise force a lower learning rate for stability.
- What are gamma and beta for, if the layer already normalizes to mean 0 and variance 1? They let the network learn to undo or adjust the normalization if that's beneficial — without them, every layer would be forced to have zero-mean, unit-variance inputs even in cases where that's not optimal.
- Why do batch norm and small batch sizes conflict? Because the mean and variance computed from a small batch are noisy, high-variance estimates of the true population statistics, which injects noisy, inconsistent normalization into training.

## Interaction With Other Architectural Choices
- **With residual connections (ResNets)**: batch norm is typically placed inside each residual block, before the addition of the skip connection in the original design, or before the convolution in the later "pre-activation" variant — the exact placement affects gradient flow through very deep stacks
- **With dropout**: the two were originally used together, but later work (Li et al., 2019, "Understanding the Disharmony between Dropout and Batch Normalization") showed they can conflict — dropout changes activation variance at train vs. test time in a way that batch norm's running statistics don't account for
- **With weight decay**: because batch norm makes the network's output invariant to the scale of the preceding layer's weights, weight decay interacts with it in a non-obvious way — some architectures skip weight decay specifically on batch norm's gamma and beta parameters
- **With mixed-precision training**: batch norm's variance computation is numerically sensitive, so frameworks typically keep batch norm layers in float32 even when the rest of the network runs in float16, to avoid precision-related instability
- **With distributed/multi-GPU training**: standard batch norm only sees the local shard of a batch on each GPU, which can bias statistics when per-GPU batch sizes are small; "SyncBatchNorm" variants synchronize statistics across all GPUs to approximate true global-batch normalization
- **With quantization**: batch norm layers are often "folded" (fused) into the preceding convolution's weights before deploying a quantized model, since running the normalization as a separate low-precision step introduces avoidable numerical error
- **With transfer learning**: when freezing a pretrained backbone's early layers, teams often freeze that backbone's batch norm running statistics too, since fine-tuning on a small, differently-distributed dataset can otherwise corrupt statistics learned from a much larger original dataset

## Related Terms
- [[Neural Network]]
- [[Gradient Descent]]
- [[Activation Function]]
- [[Regularization (L1, L2, Dropout)]]
- [[Vanishing-Exploding Gradient]]

## Example
Adding batch normalization layers to a deep CNN often lets you train with a 5-10x higher learning rate without diverging. Concretely, a ResNet-50 trained without batch norm might need a learning rate around 0.001 with careful warmup to avoid diverging.

With batch norm inserted after every convolution, the same architecture often trains stably at 0.01 or higher, converging in fewer epochs simply because the normalized activations keep gradients in a well-behaved range throughout training — earlier layers' weight updates no longer force every downstream layer to constantly readjust to a shifting input distribution.
