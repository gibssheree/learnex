---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Epoch, Batch, and Iteration

**Definition:** The units that describe how training data moves through a model — an epoch is one full pass over the entire dataset, a batch is a subset processed together, and an iteration is one weight update (one batch processed).

## How It Works
- Dataset of 10,000 samples with batch size 100 → 100 iterations per epoch (10,000 / 100)
- Weights update after each batch (iteration), not after the whole dataset — this is what makes training on huge datasets feasible, since gradients are estimated from a manageable slice rather than requiring the entire dataset in memory at once
- Each batch is forward-propagated to produce predictions, the loss is computed against that batch's true labels, and backpropagation computes gradients for every parameter — all before the single weight update that defines the iteration
- Multiple epochs let the model see the data repeatedly, refining its weights each pass — one epoch is almost never enough for a randomly-initialized network to converge
- Data is typically reshuffled between epochs so the model doesn't learn spurious patterns tied to a fixed batch ordering
- "Steps" and "iterations" are used interchangeably in most frameworks, but some papers reserve "step" specifically for optimizer updates and "iteration" for any pass through the training loop body — check context when the distinction matters
- Distributed training across multiple GPUs typically splits each batch further (a "global batch" of 1,024 might be 128 per GPU across 8 GPUs), with gradients synchronized and averaged across devices before the single logical weight update — the iteration count is still defined by the global batch, not the per-device shard
- The last batch of an epoch is often smaller than the rest if the dataset size isn't evenly divisible by batch size (`drop_last` in PyTorch controls whether that partial batch is used or discarded)
- Validation is typically run once per epoch (not per iteration) — running the full validation set after every batch would be wasteful, so most training loops check training loss frequently (per iteration or every N iterations) but only check validation metrics at epoch boundaries
- Checkpoints (saved model weights) are commonly written either every epoch or every N iterations — iteration-based checkpointing matters more for very large datasets where a single epoch can take many hours and you don't want to lose progress mid-epoch
- Learning rate schedulers in most frameworks expose both an epoch-based interface (`scheduler.step()` once per epoch) and a step-based interface (`scheduler.step()` once per iteration) — mixing the two conventions accidentally is a common source of a schedule decaying far faster or slower than intended

## Worked Calculations
| Dataset size | Batch size | Iterations per epoch | Epochs | Total iterations |
|---|---|---|---|---|
| 10,000 | 100 | 100 | 10 | 1,000 |
| 50,000 | 500 | 100 | 20 | 2,000 |
| 1,200,000 (ImageNet) | 256 | 4,688 | 90 | ~421,875 |
| 1,200,000 (ImageNet) | 8,192 | 147 | 90 | ~13,230 |

Note how the last two rows show the same dataset and epoch count producing radically different total iteration counts purely from batch size — this is why large-batch training (as in Goyal et al.'s "Accurate, Large Minibatch SGD") needs a rescaled learning rate to compensate for far fewer weight updates.

## Under the Hood
- Batch gradient descent (batch size = entire dataset) computes the true gradient every step but is slow and memory-hungry, and gets stuck more easily in sharp local minima
- Stochastic gradient descent (batch size = 1) updates after every single sample — noisy but cheap per step, and the noise itself can help escape shallow local minima
- Mini-batch gradient descent (batch size somewhere between, typically 16-512) is the practical default — it estimates the gradient from a sample, trading some accuracy for massive speedups from vectorized/parallel hardware (GPU/TPU)
- Gradient noise scales roughly with `1/sqrt(batch_size)` — halving the batch size roughly doubles gradient variance per step, which is why very large batches produce smoother but sometimes worse-generalizing loss curves
- "Steps per epoch" = `ceil(dataset_size / batch_size)` — this number, not epoch count alone, is what learning rate schedules like cosine annealing or warmup are usually defined against
- Gradient accumulation simulates a larger batch size on limited GPU memory: run several forward/backward passes on small batches without updating weights, sum the gradients, then apply one optimizer step — effectively decoupling "batch size for the math" from "batch size that fits in memory"
- Batch normalization statistics (mean/variance) are computed per batch during training, which means batch size directly affects how those statistics are estimated — very small batch sizes (e.g., 2-4) make batch norm noisy and unstable, one reason techniques like Group Normalization exist for memory-constrained training (see [[Batch Normalization]])
- Learning rate warmup (starting with a small learning rate and ramping up over the first few hundred/thousand iterations) is standard practice for large-batch training, since large batches with a full-strength learning rate from iteration 1 can destabilize early training before the model has any useful gradient direction

## History
- Stochastic approximation and online (single-sample) gradient updates trace back to Robbins and Monro's 1951 work on stochastic optimization, long before it was applied to neural networks
- LeCun's 1998 "Efficient BackProp" paper documented many of the mini-batch and shuffling practices still used today
- The rise of GPU training in the early 2010s made mini-batch sizes of 128-256 the practical default, since that range balanced gradient quality against what fit in GPU memory and maximized throughput
- Goyal et al. (2017, "Accurate, Large Minibatch SGD") showed ResNet-50 could train on ImageNet in one hour using a batch size of 8,192 across many GPUs, popularizing the linear learning-rate-scaling rule and warmup schedules for large-batch training
- Modern large language model training uses batch sizes in the millions of tokens, made feasible only through gradient accumulation and distributed data-parallel training across thousands of accelerators
- "Epoch" itself is borrowed terminology — in general usage it means a distinct period of time, and its ML meaning (one full dataset pass) stuck because early neural network training was framed as repeated passes over a fixed, memorized-in-RAM dataset, an assumption that web-scale training has since outgrown

## Comparison
| | Batch GD | Mini-batch GD | Stochastic GD |
|---|---|---|---|
| Batch size | Entire dataset | Typically 16-512 | 1 |
| Gradient estimate | Exact | Noisy estimate | Very noisy estimate |
| Memory usage | Highest | Moderate, tunable | Lowest |
| Hardware utilization | Poor (rarely fits/parallelizes well) | Good (matches GPU parallelism) | Poor (can't vectorize across samples) |
| Convergence behavior | Smooth but slow, can stick in sharp minima | Standard default, balances speed and generalization | Noisy, can bounce around minimum indefinitely without LR decay |
| Updates per epoch | 1 | dataset_size / batch_size | dataset_size |
| Common use today | Rare in practice (mostly pedagogical) | Default for virtually all deep learning training | Rare in pure form; approximated by batch size 1-8 in some online learning setups |

## Code Example
```python
from torch.utils.data import DataLoader

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True, drop_last=True)

epochs = 20
for epoch in range(epochs):
    for iteration, (inputs, targets) in enumerate(train_loader):
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()          # <-- this line is one "iteration"
    print(f"epoch {epoch}: {iteration + 1} iterations completed")

# len(train_loader) == number of iterations per epoch
# epochs * len(train_loader) == total iterations over the whole run
```

```python
# Gradient accumulation: simulate batch size 256 using batch size 32
accumulation_steps = 8   # 32 * 8 = effective batch size 256
optimizer.zero_grad()
for iteration, (inputs, targets) in enumerate(train_loader):
    outputs = model(inputs)
    loss = criterion(outputs, targets) / accumulation_steps
    loss.backward()               # gradients accumulate in .grad
    if (iteration + 1) % accumulation_steps == 0:
        optimizer.step()          # one real weight update every 8 mini-iterations
        optimizer.zero_grad()
```

## Why It Matters
- Batch size affects training speed, memory usage, and gradient noise (small batches = noisier but sometimes better-generalizing updates; large batches = faster wall-clock time per epoch but can generalize worse without learning rate adjustment)
- Misreading these terms is a common source of confusion when reading training logs or papers — "trained for 300k steps" and "trained for 90 epochs" describe the same run differently depending on batch size and dataset size
- Learning rate schedules, warmup periods, and checkpoint frequency are all usually specified in terms of iterations/steps, not epochs, because iterations map directly to actual weight updates
- Total compute (and cost, on rented GPUs) scales with total iterations, not epochs — two runs with the same epoch count but different batch sizes can have wildly different total training cost and time

## Real-World Applications
- Large-scale image classification (ResNet, EfficientNet on ImageNet) typically trains 90-300 epochs with batch sizes from 256 up to tens of thousands using distributed data-parallel training
- Large language model pretraining reports progress in tokens processed and optimizer steps rather than epochs, since a single "epoch" over a web-scale corpus may never complete — some models see each document only once or a handful of times
- Fine-tuning pretrained models (see [[Transfer Learning]]) typically uses far fewer epochs (1-10) than training from scratch, since most of the useful weight structure is already in place
- Reinforcement learning training loops (see [[Reinforcement Learning]]) often replace the "epoch over a fixed dataset" concept with continuous iterations over freshly-generated experience, since there's no fixed dataset to complete a pass over
- Federated learning on mobile devices runs a small number of local iterations per device per round, aggregating updates across many devices instead of one large centralized batch
- Time-constrained production retraining pipelines often cap training by wall-clock time or total iterations rather than epoch count, since epoch duration varies as the underlying dataset grows
- Online learning systems (e.g., ad-click models updated continuously from a live stream) process data as an unbounded sequence of small batches with no defined epoch boundary at all — "iteration" is the only unit that still applies

## Common Pitfalls
- Confusing "epoch" with "iteration" when reading training curves or logs — a loss curve plotted per-iteration will look far noisier than the same training plotted per-epoch, and comparing the two is meaningless
- Choosing a batch size purely for speed without considering its effect on generalization and GPU memory limits — very large batches often need a correspondingly larger learning rate ("linear scaling rule") and warmup to match small-batch generalization
- Forgetting to scale the learning rate schedule when changing batch size, silently changing how many total weight updates a fixed epoch budget produces
- Assuming more epochs always helps — past the point of convergence, additional epochs just increase overfitting risk (see [[Overfitting vs Underfitting]]) unless paired with regularization or early stopping
- Not accounting for `drop_last` — dropping the final partial batch changes the effective dataset size seen per epoch, which matters when comparing runs precisely
- Using a batch size so small that batch normalization statistics become unreliable, destabilizing training in ways that look like a learning rate problem but aren't
- Reporting training time only in epochs when comparing hardware or frameworks — wall-clock time per iteration (not per epoch) is the fairer unit when dataset sizes or batch sizes differ between setups
- Assuming gradient accumulation and a genuinely larger batch produce numerically identical results — they're close but not always exact, since batch normalization statistics are computed on each physical mini-batch, not the simulated larger one, unless specifically synchronized

## Best Practices
- Log both epoch and iteration/step counts, and prefer step-based x-axes when comparing runs with different batch sizes
- Use gradient accumulation instead of shrinking the batch size when a large-batch setup doesn't fit in GPU memory but you want the smoother gradient estimate
- Tie learning rate warmup and decay schedules to iteration count, not epoch count, so they behave consistently across batch size changes
- Shuffle data every epoch (the default in most DataLoader implementations) to avoid the model learning batch-order artifacts
- Pick an initial batch size based on GPU memory headroom, then tune learning rate around it rather than treating both as independent free parameters
- When scaling batch size up for multi-GPU training, apply both the linear learning rate scaling rule and a warmup period rather than either alone
- Keep batch size a power of 2 (32, 64, 128, 256) where practical — it aligns well with GPU memory layout and parallel reduction operations, though the effect on modern hardware/frameworks is smaller than it used to be

## FAQ
- **If I double my batch size, should I double my learning rate?** Often yes, roughly — this is the "linear scaling rule" popularized by large-batch training research, though it typically needs a warmup period to avoid early instability.
- **Is one iteration the same as one "step" in optimizer terminology?** Yes — "step," "iteration," and "weight update" are used interchangeably in most frameworks and papers.
- **Why not just use the largest batch size my GPU can fit?** Very large batches can generalize worse (flatter gradient estimates settle into sharper, less robust minima) unless learning rate and schedule are retuned to compensate — bigger isn't automatically better.
- **Does "one epoch" mean the model has learned the data well?** No — it just means every sample has been seen once; a randomly initialized network typically needs many epochs before its weights reflect the data's structure well.
- **How is gradient accumulation different from just using a bigger batch size?** Mathematically the resulting gradient is nearly identical (accumulated gradients sum the same way a bigger batch's would); the difference is purely about memory — accumulation trades wall-clock time for lower peak memory usage.
- **Why do some training runs report "steps" instead of epochs at all?** When a dataset is streamed or effectively infinite (web-scraped text, continuously generated RL experience), there's no well-defined "full pass," so step/iteration count becomes the only meaningful progress unit.
- **Can batch size affect final model accuracy, not just training speed?** Yes — beyond a certain size, larger batches tend to converge to flatter, sometimes less-generalizing minima unless learning rate, warmup, and regularization are retuned to compensate, so batch size is a genuine hyperparameter, not just a performance knob.

## Related Terms
- [[Gradient Descent]]
- [[Hyperparameter Tuning]]
- [[Learning Rate]]
- [[Overfitting vs Underfitting]]
- [[Batch Normalization]]
- [[Transfer Learning]]
- [[Reinforcement Learning]]
- [[Neural Network]]

## Example
Training on 50,000 images with a batch size of 500 means 100 iterations per epoch; training for 20 epochs means the model sees the full dataset 20 times, or 2,000 total iterations (weight updates). If a teammate instead trains the same model with batch size 250, they'd get 200 iterations per epoch — so "20 epochs" for them means 4,000 total updates, twice as many as the first run, even though both ran for the same number of epochs on the same data. Comparing their loss curves on an epoch axis would be misleading; comparing on an iteration axis makes the actual amount of optimization each model received directly comparable.

A second, more subtle example: two teams both train a model "for 100k iterations" on datasets of different sizes — Team A on 1 million samples with batch size 256 (about 25.6 epochs), Team B on 10,000 samples with the same batch size (about 2,560 epochs). Team B's model has seen each individual sample roughly 100x more often than Team A's, which is a much bigger overfitting risk even though both models received the identical number of gradient updates. This is why comparing training runs purely by iteration count, without also considering dataset size (and therefore effective epoch count), can also be misleading — the two units answer different questions, and a full picture needs both.
