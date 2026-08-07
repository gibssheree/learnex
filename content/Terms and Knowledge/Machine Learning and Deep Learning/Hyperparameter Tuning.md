---
tags: [term, ml]
category: Training Mechanics
---

# Hyperparameter Tuning

**Definition:** The process of searching for the best configuration values (learning rate, batch size, number of layers, regularization strength, etc.) that are set before training rather than learned from data.

## How It Works
- Grid search: exhaustively try every combination in a predefined range
- Random search: sample combinations randomly — often more efficient than grid search
- Bayesian optimization / automated tools (e.g., Optuna): model which hyperparameters are promising and search intelligently
- Each candidate configuration is trained (often for a reduced number of steps/epochs to save compute) and scored on a validation set, not the test set
- The search process itself needs a budget — number of trials, wall-clock time, or compute — since exhaustive search over even a handful of hyperparameters explodes combinatorially
- Cross-validation is typically used to score each candidate configuration, averaging performance across folds so a single lucky or unlucky split doesn't skew the ranking
- Some tuning setups are multi-objective — balancing accuracy against inference latency, memory footprint, or model size — rather than optimizing a single scalar score in isolation

## Under the Hood
- A hyperparameter search is really an outer optimization loop wrapped around the normal training loop: pick a configuration, train a model, evaluate, record the score, pick the next configuration
- Unlike model parameters (weights), hyperparameters generally aren't differentiable with respect to the validation loss, so you can't use [[Gradient Descent]] directly to tune most of them — hence the reliance on search strategies instead
- Search space definition matters as much as the search algorithm: a learning rate is almost always searched on a *log scale* (e.g., 1e-5 to 1e-1) rather than linear, because its effect is roughly multiplicative, not additive
- Early-stopping strategies (e.g., Hyperband, ASHA) kill off clearly underperforming trials partway through training, reallocating that compute to more promising configurations — this is what makes large-scale tuning tractable

## Variants
- **Grid Search** — defines a fixed set of values per hyperparameter and tries every combination. Guaranteed to cover the space evenly but scales exponentially with the number of hyperparameters (curse of dimensionality)
- **Random Search** — samples configurations randomly from defined distributions. Empirically often outperforms grid search for the same budget, because it explores more distinct values per hyperparameter rather than wasting trials on redundant combinations
- **Bayesian Optimization** — builds a probabilistic surrogate model (commonly a Gaussian Process or Tree-structured Parzen Estimator) of how hyperparameters map to validation score, and picks the next trial to balance exploring uncertain regions against exploiting known-good ones
- **Hyperband / ASHA (Asynchronous Successive Halving)** — allocate a small budget to many configurations, then progressively prune the worst performers and give the survivors more budget. Very compute-efficient for large search spaces
- **Population-Based Training (PBT)** — trains a population of models in parallel, periodically copying weights and hyperparameters from better performers to worse ones ("exploit") and randomly perturbing them ("explore"), letting hyperparameters like learning rate evolve *during* training
- **Manual / expert-guided search** — an experienced practitioner narrows the space using priors from similar past problems before running any automated search — often the fastest first step in practice
- **Neural Architecture Search (NAS)** — extends hyperparameter tuning to the architecture itself (number of layers, layer types, connectivity), typically using reinforcement learning, evolutionary search, or gradient-based relaxations (e.g., DARTS). Extremely compute-hungry; mostly used by organizations training foundation architectures rather than for routine model tuning

## Why It Matters
- Hyperparameters aren't learned by gradient descent — picking them badly can make an otherwise-good model perform poorly
- Often the difference between a mediocre and a state-of-the-art result on the same architecture
- Compute cost scales fast: doubling the number of hyperparameters being tuned can easily 10x the number of trials needed for adequate coverage, which is why efficient search strategies (Bayesian optimization, Hyperband) matter at scale
- Some hyperparameters interact — the best batch size depends on the learning rate and vice versa — so tuning one at a time in isolation can miss the actual optimum
- Reproducibility depends on it: reporting a model's accuracy without the hyperparameters used to reach it (and the search process that found them) makes the result nearly impossible for anyone else to replicate
- It's also where compute budget and model quality trade off most directly — an extra day of search compute often buys a smaller accuracy gain than an extra day of training on more data, which is a real prioritization decision in practice

## Common Pitfalls
- Tuning hyperparameters using the test set, which leaks information and inflates reported performance
- Manually guessing without a systematic search, wasting compute on unpromising regions
- Searching learning rate on a linear scale instead of log scale, which wastes most trials in an uninformative region
- Re-using the same validation split across an enormous number of trials, which lets the model configuration effectively "overfit" to the validation set through repeated selection — mitigated with nested [[Cross-Validation]] or a held-out final test set
- Tuning too many hyperparameters at once with too small a budget, so the search never adequately covers any of them
- Ignoring hyperparameter interactions and doing naive one-at-a-time tuning when a joint search would find a better combination
- Treating the best trial's validation score as an unbiased estimate of real-world performance — after selecting the best of many trials, that score is itself optimistically biased and should be confirmed on a separate held-out set
- Using a search budget so small that random noise in training (different weight initialization, data shuffling) outweighs genuine differences between configurations, making the "winner" essentially arbitrary

## Best Practices
- Reserve a true test set that is never touched during hyperparameter search — use only train/validation splits (or cross-validation folds) for the search itself
- Use log-uniform sampling for scale-sensitive hyperparameters like learning rate and weight decay
- Start broad (random search or a coarse grid) to identify promising regions, then narrow the search around the best-performing area
- Use early-stopping-aware search methods (Hyperband, ASHA) once the search space or model size makes full training of every trial too expensive
- Track experiments (tool-assisted, e.g., Weights & Biases, MLflow, or Optuna's built-in dashboard) so search results are reproducible and comparable
- Fix the random seed for anything not being searched over, so differences in score can be attributed to the hyperparameters rather than to run-to-run noise
- Re-run the top few configurations with multiple seeds before declaring a winner, especially when trial budgets are small enough that noise could plausibly explain the ranking
- Document the final search space bounds and the winning configuration alongside the model artifact — a model without its hyperparameters is difficult to reproduce or audit later
- Revisit the search space periodically as the codebase, data, or model architecture changes — bounds tuned for one version of a pipeline can silently become stale after later changes

## Code Example
```python
import optuna

def objective(trial):
    lr = trial.suggest_float("lr", 1e-5, 1e-1, log=True)
    batch_size = trial.suggest_categorical("batch_size", [16, 32, 64, 128])
    dropout = trial.suggest_float("dropout", 0.0, 0.5)

    model = build_model(dropout=dropout)
    val_score = train_and_evaluate(model, lr=lr, batch_size=batch_size)
    return val_score  # Optuna minimizes by default; negate if maximizing accuracy

study = optuna.create_study(direction="minimize")
study.optimize(objective, n_trials=100)
print(study.best_params)
```

For comparison, the difference in coverage between grid and random search with the same trial count, using plain Python:

```python
import itertools
import random

# Grid search: exhaustive, scales exponentially with dimensions
grid = list(itertools.product([1e-4, 1e-3, 1e-2], [16, 32, 64], [0.1, 0.3, 0.5]))
print(f"Grid search trials: {len(grid)}")  # 3 * 3 * 3 = 27, fixed by the grid

# Random search: fixed budget, samples continuously rather than from a fixed grid
n_trials = 20
random_trials = [
    (random.choice([1e-4, 1e-3, 1e-2]),
     random.choice([16, 32, 64]),
     random.uniform(0.0, 0.5))   # dropout sampled continuously, not from 3 fixed values
    for _ in range(n_trials)
]
```

## Comparison
| Strategy | Scales with dimensions | Sample efficiency | Parallelizable | Typical use |
|---|---|---|---|---|
| Grid Search | Poorly (exponential) | Low | Fully | Small spaces, 1-3 hyperparameters |
| Random Search | Well | Moderate | Fully | General-purpose default |
| Bayesian Optimization | Well | High | Limited (sequential by nature) | Expensive-to-train models |
| Hyperband / ASHA | Well | High (via early stopping) | Fully | Large-scale deep learning |
| Population-Based Training | Well | High | Fully | RL, long training runs |

## History
Grid and manual search were the norm through the 2000s. James Bergstra and Yoshua Bengio's 2012 paper "Random Search for Hyper-Parameter Optimization" provided the empirical and theoretical case for random search over grid search, showing that because only a few hyperparameters usually matter for a given problem, random sampling explores the important dimensions far more efficiently than an evenly spaced grid. Bayesian optimization approaches (building on decades-old Gaussian Process theory) gained traction in ML specifically through Snoek, Larochelle, and Adams' 2012 "Practical Bayesian Optimization of Machine Learning Algorithms." Hyperband (Li et al., 2016) and its asynchronous successor ASHA brought early-stopping-based search to the scale needed for deep learning, where training even one configuration to completion is expensive.

## Real-World Example
A team fine-tuning a pretrained transformer for a text classification task might run a 40-trial Bayesian optimization search over learning rate (log-uniform, 1e-5 to 1e-3), weight decay (log-uniform, 1e-4 to 1e-1), and warmup ratio (0.0 to 0.2), using Optuna with an ASHA pruner to kill clearly underperforming trials after just 2 of 10 planned epochs. Each trial reports intermediate validation accuracy after every epoch so the pruner can compare progress across trials fairly. The full search might complete in the wall-clock time of roughly 15-20 full training runs instead of 40, because pruning removes most bad configurations early — a substantial compute saving that becomes essential once each individual training run takes hours on expensive accelerators.

## FAQ
**Should I tune all my hyperparameters at once?**
Not usually — some (like learning rate) have outsized impact and are worth isolating first. Once the most sensitive ones are roughly right, expand the search to include the rest, or use a joint search with a bigger budget if you have the compute.

**How many trials is "enough"?**
It depends on the dimensionality of the search space. As a rough heuristic, random search needs at least ~10x the number of hyperparameters being tuned to get reasonable coverage, and more if there are interactions between them.

**Is hyperparameter tuning still relevant for large pretrained models?**
Yes, though the scope narrows — full architecture search is rare, but tuning learning rate, warmup steps, and regularization for fine-tuning is still standard practice.

**Why use nested cross-validation instead of a single validation split for tuning?**
A single validation split gets reused across every trial in the search, so the eventual "best" configuration is partly selected for good luck on that specific split. Nested cross-validation wraps an inner tuning loop (which picks hyperparameters) inside an outer evaluation loop (which scores the tuned model on data it never influenced), giving a less biased estimate of real-world performance at the cost of significantly more compute.

**What's the difference between hyperparameter tuning and regular model training?**
Model training optimizes parameters (weights) via gradient descent for a *fixed* set of hyperparameters. Hyperparameter tuning is a search over the hyperparameters themselves, where each candidate configuration requires running an entire training process (or a truncated version of one) just to produce a single score.

**Can hyperparameter tuning ever make a model worse?**
Yes, indirectly — if the search overfits to a small or unrepresentative validation set, the "best" configuration by that measure can generalize worse than a more conservative, less-tuned default. This is a large part of why held-out test sets and repeated evaluation exist as a check on the tuning process itself.

## Common Interview Questions
- Why does random search tend to outperform grid search at the same trial budget? (Because only a few hyperparameters usually matter for a given problem, and random sampling explores more distinct values along each dimension instead of wasting trials on redundant grid combinations.)
- What's the difference between a parameter and a hyperparameter? (Parameters are learned by gradient descent from data; hyperparameters are set before training and control how that learning happens.)
- How do you keep a large hyperparameter search from overfitting to the validation set? (Use nested cross-validation or a final held-out test set that's never used to pick a configuration.)
- What would you do if your search budget could only afford 10 trials? (Prioritize the highest-impact hyperparameters — typically learning rate first — and rely on expert priors rather than a broad, shallow search.)
- Why might two teams get different "best" hyperparameters for what looks like the same model and dataset? (Different search budgets, search space bounds, validation splits, or random seeds can all shift which configuration comes out on top, especially when several configurations perform similarly.)

## Related Terms
- [[Cross-Validation]]
- [[Learning Rate]]
- [[Gradient Descent]]
- [[Regularization (L1, L2, Dropout)]]
- [[Overfitting vs Underfitting]]
- [[Bias-Variance Tradeoff]]

## Example
Running a random search over learning rate, batch size, and dropout rate, evaluating each combination via 5-fold cross-validation to find the best-performing set. Concretely: sample 50 configurations, each with a learning rate drawn log-uniformly from 1e-4 to 1e-1, a batch size from {16, 32, 64, 128}, and a dropout rate from 0.0 to 0.5. Train each configuration for a fixed, reduced number of epochs, score it on held-out validation folds, and rank the results. The best few configurations are then trained to full convergence on the full training set to confirm which one to actually ship — a cheap early-stage sweep followed by an expensive final confirmation run.
