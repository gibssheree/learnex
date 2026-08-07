---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Learning Rate

**Definition:** A hyperparameter that controls how large a step gradient descent takes when updating model weights on each iteration.

## How It Works
- Too high: updates overshoot the minimum, loss oscillates or diverges
- Too low: training converges extremely slowly, or gets stuck in a shallow local minimum
- Modern training often uses a schedule — starting higher and decaying over time, or adaptive optimizers like Adam that adjust it automatically
- Sits directly inside the [[Gradient Descent]] update rule as the multiplier on the gradient: `w := w - lr * grad`
- Its effective scale interacts with batch size, model depth, and the chosen optimizer, so a learning rate tuned for one setup rarely transfers unchanged to another
- Distinct from other step-size-like hyperparameters (e.g., momentum's decay coefficient) even though they interact — the learning rate scales the gradient itself, momentum scales how much of the previous update direction persists

## Under the Hood
- In the basic update rule `w := w - lr * dL/dw`, the learning rate `lr` is a scalar (or, in adaptive optimizers, effectively a per-parameter scalar) multiplying the gradient before it's subtracted
- Because gradients can vary by orders of magnitude across layers (especially in deep networks), a single global learning rate is a compromise — this is part of why adaptive optimizers like Adam, which rescale the effective learning rate per parameter based on gradient history, tend to be easier to use than plain SGD
- The "right" learning rate scales roughly with batch size: doubling the batch size roughly halves gradient noise, which allows (and often benefits from) a proportionally larger learning rate — this is the basis for the "linear scaling rule" used when training with very large batches
- Learning rate interacts with loss curvature: in directions where the loss surface is steep, a large learning rate causes oscillation; in flat directions, the same learning rate makes almost no progress. This curvature mismatch is exactly what momentum and adaptive methods try to compensate for

## Variants (Schedules)
- **Constant** — a single fixed value for the whole run. Simple but rarely optimal; fine for short runs or well-behaved convex problems
- **Step decay** — multiply the learning rate by a fixed factor (e.g., 0.1) every N epochs. Easy to reason about, common in older CNN training recipes
- **Exponential decay** — continuously multiply the learning rate by a decay factor each step or epoch, giving a smooth downward curve rather than sudden drops
- **Cosine annealing** — decay the learning rate following a cosine curve from an initial value down to (near) zero over training. Popular in modern deep learning because it decays smoothly and predictably
- **Warmup** — start the learning rate near zero and linearly ramp it up over the first few hundred/thousand steps before switching to the main schedule. Critical for large transformer models, where large early updates on randomly initialized weights can destabilize training
- **Cyclical learning rates** — oscillate the learning rate between a lower and upper bound over the course of training, which can help the model escape sharp local minima and sometimes reduces the need for extensive tuning
- **Adaptive (per-parameter)** — optimizers like Adam, RMSprop, and Adagrad adjust the effective learning rate for each parameter individually based on that parameter's gradient history, rather than following an externally imposed schedule at all
- **One-cycle policy** — ramps the learning rate up from a low value to a high peak over roughly the first half of training, then back down (often below the starting value) for the second half, frequently paired with an inverse momentum schedule. Popularized as "superconvergence," letting some models reach a given accuracy in far fewer epochs than a standard schedule
- **Reduce-on-plateau** — monitors validation loss and cuts the learning rate by a fixed factor whenever it stops improving for a set number of epochs, adapting the schedule to actual training progress rather than a predetermined step count

## Why It Matters
- Frequently the single most impactful hyperparameter to tune — a well-chosen learning rate can be the difference between a model that trains and one that never converges
- Explains why the same architecture can produce wildly different results across training runs
- A learning rate that's even slightly too high can look like a modeling or data problem (loss plateaus or spikes) when the actual fix is a smaller step size or a warmup phase
- Choosing the learning rate well often matters more than choosing between similar optimizers — a poorly tuned Adam run can underperform a well-tuned SGD run, and vice versa

## Common Pitfalls
- Using one fixed learning rate for an entire long training run instead of a decay schedule
- Not doing a learning-rate sweep/warmup, especially for large models, which are highly sensitive early in training
- Copying a learning rate from a different codebase/paper without accounting for differences in batch size, optimizer, or model scale
- Mistaking a too-high learning rate's symptoms (loss spikes, NaN losses) for a data bug or architecture bug
- Decaying the learning rate too aggressively too early, effectively freezing the model before it has learned useful representations
- Using the same learning rate for fine-tuning a pretrained model as was used for training it from scratch — fine-tuning usually needs a much smaller value to avoid destroying pretrained weights
- Using the same learning rate across all layers when fine-tuning, instead of smaller rates for early (more general-purpose) layers and larger rates for later, task-specific layers — a technique called discriminative or layer-wise learning rates
- Restarting a scheduler's step count from zero after resuming a checkpoint, which silently replays the warmup phase or resets a decay curve partway through what should be a continuous schedule

## Best Practices
- Run a learning rate range test (gradually increase the learning rate over a short warm-up run and watch where loss starts to blow up) to find a reasonable upper bound before committing to a schedule
- Pair a warmup phase with a decay schedule (e.g., linear warmup + cosine decay) for training large models from scratch
- Use a smaller learning rate (often 10-100x smaller) when fine-tuning a pretrained model compared to training from scratch
- Log the learning rate alongside the loss curve — a sudden loss spike that lines up with a scheduled learning rate change is diagnostic, not coincidental
- Prefer adaptive optimizers (Adam/AdamW) as a starting point if you don't have time to tune a schedule by hand; switch to a hand-tuned SGD + schedule setup only when squeezing out extra performance matters
- Save the learning rate schedule state alongside model and optimizer checkpoints so a resumed run continues the schedule rather than restarting it
- When fine-tuning, consider freezing early layers entirely or applying discriminative learning rates rather than a single global rate for the whole network

## Code Example
```python
import math
import torch

model = torch.nn.Linear(10, 1)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)

# Linear warmup for 500 steps, then cosine decay to near zero
warmup_steps = 500
total_steps = 10_000

def lr_lambda(step):
    if step < warmup_steps:
        return step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return 0.5 * (1 + math.cos(math.pi * progress))

scheduler = torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)

for step, (x, y) in enumerate(dataloader):
    optimizer.zero_grad()
    loss = loss_fn(model(x), y)
    loss.backward()
    optimizer.step()
    scheduler.step()
```

A minimal from-scratch illustration of step decay, without any framework scheduler:

```python
base_lr = 0.1
decay_factor = 0.5
decay_every = 10  # epochs

for epoch in range(50):
    current_lr = base_lr * (decay_factor ** (epoch // decay_every))
    for x_batch, y_batch in dataloader:
        # ... forward pass, compute loss ...
        for param in model_params:
            param -= current_lr * param.grad  # manual update using the decayed rate
    print(f"epoch {epoch}: lr={current_lr:.5f}")
```

## Comparison
| Schedule | Behavior | Best for | Tuning effort |
|---|---|---|---|
| Constant | Fixed value throughout | Short runs, quick prototyping | Low |
| Step decay | Sudden drops at fixed intervals | Classic CNN training recipes | Medium (choose drop points) |
| Exponential decay | Smooth continuous decrease | General-purpose | Low |
| Cosine annealing | Smooth curve to near-zero | Modern deep learning, long runs | Low |
| Warmup + decay | Ramp up, then decay | Large transformers | Medium |
| Cyclical | Oscillates between bounds | Escaping sharp minima | Medium |
| Adaptive (Adam, etc.) | Per-parameter, self-adjusting | Default choice, minimal tuning | Very low |

## History
Early neural network training used a single fixed learning rate, tuned by hand and often left unchanged for an entire run. Robbins and Monro's 1951 stochastic approximation theory gave the first formal conditions under which a *decaying* learning rate guarantees convergence for stochastic optimization. Adagrad (Duchi, Hazan, Singer, 2011) introduced per-parameter adaptive rates based on accumulated squared gradients, aimed at sparse features like word embeddings. Adam (Kingma and Ba, 2014) combined that idea with momentum and became the dominant default. Leslie Smith's 2015-2017 work on cyclical learning rates and the one-cycle policy showed that deliberately oscillating or overshooting the learning rate could train some models to a target accuracy several times faster than a conventional decaying schedule — a result still referenced whenever "superconvergence" comes up.

## Real-World Example
Training recipes for large transformer models commonly specify something like: linear warmup from 0 to a peak learning rate of 6e-4 over the first 2,000 steps, followed by cosine decay down to 10% of the peak value over the remaining steps of training. The peak value itself is chosen based on model size and batch size — larger batches (more gradient averaging, less noise) tolerate proportionally higher peak learning rates. Skipping the warmup on such a model is a well-documented failure mode: the randomly initialized attention layers receive large gradient-scaled updates before they've settled into a reasonable configuration, often producing NaN losses or a model that never recovers within the training budget.

## FAQ
**What's a good starting learning rate?**
There's no universal number — it depends on the optimizer, batch size, and model. As rough starting points: 1e-3 is common for Adam on small-to-medium networks, 1e-4 to 5e-5 for fine-tuning transformers, and 0.01-0.1 for SGD with momentum. Always verify with a small range test rather than trusting a default blindly.

**Why does the learning rate need to change during training?**
Early in training, large steps help the model quickly move away from a poor random initialization. Later, as it approaches a good region of the loss landscape, large steps cause it to bounce around instead of settling — a smaller step size lets it fine-tune into a good minimum.

**Do adaptive optimizers eliminate the need to tune the learning rate?**
No — they reduce sensitivity but don't eliminate it. Adam still needs a reasonable base learning rate; set it too high and it will still diverge, just less catastrophically than plain SGD would.

**Should the learning rate scale with batch size?**
Generally yes. The "linear scaling rule" suggests multiplying the learning rate by the same factor you multiply the batch size by, since a larger batch produces a less noisy, more reliable gradient estimate that can support a proportionally larger step — though this breaks down at very large batch sizes and usually needs an accompanying warmup to stay stable.

**How is learning rate different from momentum?**
Learning rate controls the step size taken in the direction of the current gradient signal; momentum controls how much of the *previous* update direction carries over into the current one. They're complementary — momentum smooths out the path, learning rate sets how fast you move along it — and both interact with the same underlying update, so tuning one without considering the other is easy to get wrong.

## Common Interview Questions
- Why do we warm up the learning rate instead of starting at the peak value? (Randomly initialized weights, especially in attention layers, produce unreliable early gradients; a small initial learning rate avoids destabilizing updates before the model has settled.)
- What symptoms indicate the learning rate is too high versus too low? (Too high: loss spikes, oscillates, or produces NaNs. Too low: loss decreases but extremely slowly, or plateaus early at a mediocre value.)
- Why does fine-tuning use a smaller learning rate than training from scratch? (Pretrained weights already encode useful structure; a large learning rate risks overwriting it before the model adapts to the new task.)
- If two training runs use the same architecture and data but different learning rates, why might their final accuracy differ significantly? (Different step sizes trace different paths through a non-convex loss surface, landing in different local minima with different generalization properties — the learning rate doesn't just affect speed, it affects which solution is found.)

## Related Terms
- [[Gradient Descent]]
- [[Hyperparameter Tuning]]
- [[Vanishing-Exploding Gradient]]
- [[Transfer Learning]]
- [[Overfitting vs Underfitting]]

## Example
Dropping the learning rate from 0.01 to 0.001 partway through training often stabilizes a model that was previously oscillating around its best accuracy. Concretely: a model trained with a constant learning rate of 0.01 might reach 85% validation accuracy but keep bouncing between 82-85% every epoch as it overshoots the minimum each step. Switching to 0.001 — either via a manual step-decay schedule or a scheduler like `ReduceLROnPlateau` triggered when validation loss stops improving — lets the same model settle into the minimum and often gain another 2-3 points of accuracy in the following epochs, purely from taking smaller, more precise steps once it's already in the right neighborhood.
