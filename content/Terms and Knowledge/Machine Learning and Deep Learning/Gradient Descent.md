---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Gradient Descent

**Definition:** The core optimization algorithm used to train ML models — it iteratively adjusts model parameters in the direction that most reduces the loss function.

## How It Works
1. Compute the loss (how wrong the model currently is) via the [[Loss Function]] on a batch of data
2. Compute the gradient (direction of steepest increase in loss) with respect to each parameter, via [[Backpropagation]]
3. Update each parameter by stepping in the opposite direction, scaled by the [[Learning Rate]]
4. Repeat over many iterations until loss stops meaningfully decreasing

## Under the Hood
The update rule for a single parameter `w` is:

```
w := w - lr * dL/dw
```

- `dL/dw` is the partial derivative of the loss `L` with respect to `w` — how much the loss changes for a tiny change in that parameter
- `lr` (the learning rate) scales the step size; without it, every parameter would jump the full gradient magnitude every step
- The negative sign is what makes it *descent* — gradients point toward increasing loss, so moving opposite them reduces loss
- In vector form, for the full parameter vector `θ`: `θ := θ - lr * ∇L(θ)`, where `∇L(θ)` is the gradient (vector of partial derivatives) evaluated at the current parameters
- Each computed update from a batch is one training step; one pass through the entire dataset is one [[Epoch, Batch, and Iteration|epoch]]

## Variants
- **Batch Gradient Descent** — computes the gradient over the *entire* training set before each update. Accurate but slow and memory-heavy; impractical for large datasets
- **Stochastic Gradient Descent (SGD)** — updates parameters using the gradient from a single example at a time. Fast and noisy; the noise can actually help escape shallow local minima
- **Mini-batch Gradient Descent** — the practical default: computes the gradient over a small batch (e.g., 32-256 examples). Balances the stability of batch GD with the speed of SGD, and maps efficiently onto GPU parallelism
- **Momentum** — accumulates a moving average of past gradients and uses that to update, damping oscillations and accelerating movement along consistent directions: `v := β*v + (1-β)*grad; w := w - lr*v`
- **RMSprop** — divides the learning rate for each parameter by a running average of that parameter's recent gradient magnitudes, so parameters with large, volatile gradients get smaller effective steps
- **Adam** — combines momentum (first moment) and RMSprop-style adaptive scaling (second moment) with bias correction. The default optimizer for most deep learning today because it works reasonably well with minimal tuning
- **AdamW** — Adam with weight decay decoupled from the gradient update, fixing a subtle bug where Adam's adaptive scaling interacted badly with L2 regularization. Standard for training transformers
- **Adagrad** — accumulates the sum of squared past gradients per parameter and scales the learning rate inversely by its square root, giving infrequently-updated parameters (e.g., rare word embeddings) larger effective steps. The accumulator only ever grows, so the effective learning rate shrinks monotonically and can stall on long training runs
- **Nesterov Accelerated Gradient (NAG)** — a momentum variant that computes the gradient at the "look-ahead" position (current position plus the momentum step) rather than at the current position, giving a correction term that often converges faster and more stably than classic momentum

## Why It Matters
- The mechanism that trains essentially every modern ML model, from linear regression to giant LLMs — anywhere there's a differentiable loss, gradient descent (or a variant) is how the model learns
- Variants (SGD, Adam, RMSprop) trade off speed, stability, and memory differently, so the choice affects both training time and final model quality
- Gradient descent is *local* and *greedy* — it only knows the slope at the current point, not the shape of the whole loss landscape, which is why initialization, learning rate, and architecture all matter so much
- It scales: the same core loop that fits a 3-parameter linear regression also updates billions of parameters in an LLM, just with more compute and smarter variants
- Understanding it is a prerequisite for debugging almost any training failure — a diverging loss, a stalled loss, or an unstable loss all trace back to some aspect of how the gradient descent loop is (mis)configured
- It's the reason data quality and preprocessing matter so much: gradient descent optimizes exactly the loss it's given, on exactly the data it's given, with no notion of what the data "should" mean

## Common Pitfalls
- Learning rate too high — the model overshoots and diverges instead of converging
- Learning rate too low — training crawls or gets stuck in a shallow local minimum
- Forgetting to zero out gradients between steps (a classic PyTorch bug: skipping `optimizer.zero_grad()` before `loss.backward()`) — gradients accumulate silently and updates become garbage
- Assuming gradient descent finds the *global* minimum — for non-convex losses (essentially all neural nets) it only guarantees convergence to *a* local minimum or saddle point, though in high dimensions this is usually good enough in practice
- Not shuffling data between epochs when using mini-batch/SGD, which lets the model latch onto ordering artifacts instead of generalizable patterns
- Ignoring gradient clipping in RNNs/LSTMs, where exploding gradients can send a single bad batch's update far outside a reasonable range
- Comparing loss curves across runs with different batch sizes without adjusting the learning rate — the effective noise and step size both change with batch size, so an "apples to apples" comparison usually requires re-tuning
- Treating a plateauing loss as convergence when it's actually a saddle point or a too-low learning rate — the fix differs completely depending on which one it is, so this needs to be diagnosed, not assumed

## Best Practices
- Start with Adam or AdamW unless you have a specific reason not to — it's robust across a wide range of learning rates and architectures
- Use a learning rate warmup for the first few hundred/thousand steps when training large models — jumping straight to a high learning rate on randomly initialized weights is a common cause of early divergence
- Pair gradient descent with a learning rate schedule (decay, cosine annealing) rather than a single fixed value for the whole run
- Monitor the loss curve, not just the final number — a loss that's flat, spiking, or oscillating tells you something different about what to fix (learning rate, batch size, data, or architecture)
- Clip gradients (`torch.nn.utils.clip_grad_norm_`) when training recurrent architectures or very deep networks to prevent occasional exploding updates
- Checkpoint model and optimizer state regularly on long runs — optimizer state (Adam's running moment estimates) is part of what makes training resumable without a quality hit, not just the weights
- Sanity-check with a tiny subset of data first — a model that can't drive loss near zero on 10 examples has a bug in the training loop, not a hard optimization problem

## Code Example
```python
import torch

model = torch.nn.Linear(10, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9)
loss_fn = torch.nn.MSELoss()

for epoch in range(100):
    for x_batch, y_batch in dataloader:
        optimizer.zero_grad()              # clear old gradients
        preds = model(x_batch)              # forward pass
        loss = loss_fn(preds, y_batch)      # compute loss
        loss.backward()                     # backprop: fills .grad on each param
        optimizer.step()                    # w := w - lr * grad (plus momentum)
```

Same idea implemented from scratch with plain NumPy, no autodiff, for a single-variable linear regression:

```python
import numpy as np

# Fit y = w*x + b to data generated from the true relationship y = 2x + 1
X = np.array([1.0, 2.0, 3.0, 4.0])
y = np.array([3.0, 5.0, 7.0, 9.0])
w, b, lr = 0.0, 0.0, 0.01

for step in range(1000):
    y_pred = w * X + b
    error = y_pred - y
    grad_w = (2 / len(X)) * np.dot(error, X)   # dL/dw for MSE loss
    grad_b = (2 / len(X)) * np.sum(error)      # dL/db for MSE loss
    w -= lr * grad_w
    b -= lr * grad_b

print(f"Learned: w={w:.3f}, b={b:.3f}")  # converges toward w=2.0, b=1.0
```

## Comparison
| Variant | Update uses | Speed per step | Convergence stability | Common use |
|---|---|---|---|---|
| Batch GD | Full dataset gradient | Slow | Very stable | Small datasets, convex problems |
| SGD | Single-example gradient | Fast | Noisy | Online learning, huge datasets |
| Mini-batch SGD | Small batch gradient | Fast (GPU-parallel) | Moderate noise | Default for deep learning |
| Momentum | Mini-batch + gradient history | Fast | Smoother than plain SGD | Speeding up plain SGD |
| RMSprop | Mini-batch, per-param scaling | Fast | Good for non-stationary objectives | RNNs |
| Adam / AdamW | Momentum + adaptive scaling | Fast | Robust, minimal tuning | Default for most deep learning |

## Convergence Guarantees
- For convex loss functions (e.g., linear regression with MSE), gradient descent with an appropriately small, fixed learning rate is mathematically guaranteed to converge to the global minimum
- For non-convex losses — essentially every neural network — it's only guaranteed to converge to a stationary point (gradient magnitude near zero), which could be a local minimum, a saddle point, or, rarely, a local maximum
- Convergence rate for smooth convex losses is O(1/k) for plain gradient descent and O(1/k²) for accelerated variants like Nesterov's method, where `k` is the number of iterations — accelerated methods need provably fewer steps to reach a given error tolerance
- In practice, high-dimensional neural network loss surfaces have far more saddle points than bad local minima, and mini-batch noise plus momentum are usually enough to push parameters off a saddle rather than stalling there indefinitely

## History
The method traces back to Augustin-Louis Cauchy's 1847 paper on solving systems of equations by following the direction of steepest descent — it stayed a numerical-analysis curiosity for over a century. Herbert Robbins and Sutton Monro formalized *stochastic* approximation in 1951, laying the mathematical groundwork for SGD decades before it had a name. Rumelhart, Hinton, and Williams' 1986 paper on backpropagation made gradient descent practical for multi-layer neural networks by giving an efficient algorithm to compute the gradient with respect to every parameter. Diederik Kingma and Jimmy Ba's 2014 paper "Adam: A Method for Stochastic Optimization" introduced the adaptive-moment optimizer that remains the default starting point for most deep learning training runs today.

## Real-World Example
Training a large language model from scratch typically uses AdamW with a linear or cosine learning rate schedule and a multi-thousand-step warmup, applied via mini-batch gradient descent distributed across thousands of GPUs simultaneously — each GPU computes gradients on a different shard of the batch (data parallelism), and the results are averaged before every update so all replicas stay in sync. A single training step might process a batch of millions of tokens. The core update rule doesn't change at this scale — it's still `w := w - lr * grad` per parameter — but the engineering around it (gradient accumulation to simulate larger batches, mixed-precision arithmetic to save memory, gradient clipping to survive occasional bad batches, and distributed gradient synchronization) becomes as operationally important as the optimization algorithm itself.

## FAQ
**Does gradient descent guarantee finding the best possible model?**
No. It guarantees converging toward a point where the gradient is near zero — a local minimum or saddle point — not necessarily the global minimum. In practice, for over-parameterized neural networks, most local minima found this way perform similarly well.

**Why not just solve for the minimum analytically instead of iterating?**
For simple models like linear regression with MSE loss, you can (the normal equation). For anything with nonlinearities — i.e., virtually all neural networks — there's no closed-form solution, so iterative gradient-based optimization is the only practical approach.

**What's the difference between an epoch and an iteration?**
See [[Epoch, Batch, and Iteration]] — an iteration is one parameter update (one batch), an epoch is one full pass through the training set, which is many iterations.

**What's the difference between first-order and second-order optimization?**
Gradient descent is a first-order method — it only uses the gradient (first derivative). Second-order methods like Newton's method also use the Hessian (matrix of second derivatives) to account for the loss surface's curvature, which can converge in fewer steps but is far too expensive to compute and store for models with millions or billions of parameters. This is why virtually all deep learning uses first-order methods, sometimes with cheap curvature approximations — Adam's second-moment estimate is one — instead of the real thing.

**Why does gradient descent work at all for such high-dimensional, non-convex problems?**
Empirically, over-parameterized neural networks have loss surfaces where most critical points reachable by gradient descent are saddle points rather than genuinely bad local minima, and the sheer number of parameters means there are many roughly-equally-good solutions rather than one narrow global optimum to locate. This doesn't fully explain why deep learning generalizes as well as it does, but it does explain why gradient descent reliably finds *a* good solution rather than getting stuck early.

## Related Terms
- [[Backpropagation]]
- [[Loss Function]]
- [[Learning Rate]]
- [[Vanishing-Exploding Gradient]]
- [[Hyperparameter Tuning]]

## Example
Rolling a ball down a hilly loss landscape — gradient descent repeatedly nudges it toward the nearest valley (a low-loss point). If the ball has too much momentum (learning rate too high), it can roll straight past the valley and up the other side. If it moves too cautiously (learning rate too low), it might stop rolling on a small ledge (a shallow local minimum) well before reaching the true bottom. In a real training run, this "landscape" has millions of dimensions — one per parameter — but the same intuition holds: follow the slope downhill, one small step at a time, and let the step size and the estimate of "downhill" (batch size, momentum) determine how quickly and reliably you get there.
