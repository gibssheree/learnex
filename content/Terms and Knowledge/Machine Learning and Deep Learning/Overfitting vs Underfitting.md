---
tags: [term, ml]
category: Core ML Concepts
---

# Overfitting vs Underfitting

**Definition:** Overfitting is when a model memorizes training data noise instead of general patterns, performing well on training data but poorly on new data. Underfitting is when a model is too simple to capture the underlying pattern at all.

## How It Works
- Overfitting: training accuracy high, validation/test accuracy low — the model learned the training set's quirks, noise, and outliers rather than the signal that generalizes
- Underfitting: both training and validation accuracy are low — the model lacks capacity, features, or training time to represent the underlying relationship
- A well-fit model sits between the two: training and validation performance are both reasonably high and reasonably close to each other
- The gap between training and validation error is the diagnostic signal — a large gap points to overfitting, a small gap with poor absolute performance points to underfitting
- As model complexity increases (more parameters, more depth, more training epochs), training error monotonically decreases, but validation error follows a U-shape — dropping, then rising again once the model starts fitting noise
- Overfitting can happen gradually within a single training run — early epochs generally improve both train and validation performance together, then at some point validation performance plateaus or degrades while training performance keeps climbing
- Underfitting is sometimes called "high bias" in older statistics literature, and overfitting "high variance" — the two terms are used interchangeably across ML and classical statistics, so expect both vocabularies in papers and interviews

## Under the Hood
- This is a direct manifestation of the [[Bias-Variance Tradeoff]]: underfitting = high bias (systematic error from an overly simple model), overfitting = high variance (predictions swing wildly depending on which training set you happened to sample)
- Expected test error decomposes as `Error = Bias^2 + Variance + Irreducible Noise` — you cannot drive both bias and variance to zero simultaneously with a fixed amount of data; reducing one usually raises the other
- Learning curves make this diagnosable: plot training and validation loss against training set size or epoch count — overfitting curves diverge (train keeps dropping, val flattens or rises), underfitting curves converge to a shared high error
- Effective model capacity isn't just "parameter count" — a network can have millions of parameters yet still underfit if the learning rate is too low or training stops too early, and a tiny model can overfit a tiny dataset
- Double descent is a more recent, counterintuitive finding: for some very high-capacity models (especially deep networks), test error can rise then fall again as capacity keeps increasing past the point of perfectly fitting the training data — this complicates the classic single-U-shaped-curve intuition but doesn't invalidate the underlying bias-variance logic for typical model sizes

## Why It Matters
- The central tension in ML model design — balancing complexity against generalization is basically the whole job
- Directly informs decisions about regularization, model size, and how much training data you need
- A model that overfits looks impressive on the metric you're watching (training accuracy) while being silently useless in production — this is one of the most common ways ML projects fail after deployment
- Understanding which failure mode you're in changes your next move entirely: overfitting calls for more data or [[Regularization (L1, L2, Dropout)]]; underfitting calls for more capacity, better features, or more training
- Every model selection decision — how many trees in a random forest, how many layers in a network, how long to train — is implicitly a decision about where to sit on this spectrum

## Diagnosing Overfitting vs Underfitting
| Symptom | Training performance | Validation performance | Diagnosis |
|---|---|---|---|
| Both low | Low | Low | Underfitting |
| Gap is large | High | Low | Overfitting |
| Both high and close | High | High | Good fit |
| Both improving together | Rising | Rising | Still training — not yet converged |
| Validation worse than a naive baseline | Any | Below baseline | Likely a bug (data leakage, label error), not just under/overfitting |

## Fixes By Failure Mode
- **If overfitting:**
  - Get more training data, or augment existing data (crops/flips/noise for images, synonym swaps for text)
  - Add [[Regularization (L1, L2, Dropout)]] — L1/L2 weight penalties, dropout, or early stopping
  - Reduce model capacity — fewer layers, fewer parameters, simpler features
  - Use [[Cross-Validation]] to get a more reliable estimate of generalization performance
  - Simplify the feature set — remove noisy or redundant features that give the model more surface area to memorize on
- **If underfitting:**
  - Increase model capacity — more layers, more parameters, a more expressive architecture
  - Train longer or raise the [[Learning Rate|learning rate]] if training hasn't converged
  - Add better or more informative features ([[Feature Engineering]])
  - Reduce regularization strength if it's currently too aggressive
  - Check for implementation bugs — a genuinely powerful model that underfits badly sometimes indicates a broken loss function, frozen weights, or a data pipeline bug rather than a true capacity problem
  - Remove or reduce aggressive regularization that may have been added preemptively — a common mistake is copying a heavily-regularized config from a much larger model or dataset onto a smaller problem where it's simply too strong

## Code Example
```python
from sklearn.model_selection import learning_curve
import numpy as np

train_sizes, train_scores, val_scores = learning_curve(
    estimator=model, X=X, y=y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10), scoring="accuracy"
)

train_mean = train_scores.mean(axis=1)
val_mean = val_scores.mean(axis=1)

# Large, persistent gap between train_mean and val_mean -> overfitting
# Both curves converge at a low score -> underfitting

# In deep learning, the equivalent check is tracking loss per epoch:
# for epoch in range(num_epochs):
#     train_loss = run_epoch(model, train_loader, train=True)
#     val_loss = run_epoch(model, val_loader, train=False)
#     history.append((epoch, train_loss, val_loss))
# then plot history and watch for the divergence point
```

## Real-World Example
- A résumé-screening model trained on 500 examples from one company can overfit to idiosyncratic details (a specific university's name, a particular phrasing) rather than learning genuinely predictive signal, then perform poorly when applied to résumés from a different hiring pool
- A linear model predicting housing prices from only square footage will underfit in a market where location, school district, and age of the property all matter — it captures a coarse trend but misses most of the real variance
- Early stopping in production ML pipelines (e.g., an ad click-through-rate model) is often the single most impactful regularizer, since these models are typically trained on truly enormous datasets where overfitting still creeps in after enough passes over the data

## Common Pitfalls
- Judging a model only by training accuracy, missing an overfitting problem entirely
- Adding regularization or simplifying a model that's actually underfitting, making it worse
- Tuning hyperparameters against the test set instead of a separate validation set — this leaks test-set information into your decisions and produces an overly optimistic final estimate (a subtle form of overfitting to the test set itself)
- Assuming more training epochs always help — past a certain point, extra epochs just memorize the training set harder
- Comparing models trained on different data splits or preprocessing pipelines and attributing the difference to architecture instead of the actual confound
- Mistaking data leakage (e.g., a feature that indirectly encodes the label) for a great fit — suspiciously perfect validation performance is often a leakage bug, not a well-fit model

## Best Practices
- Always hold out a validation set (or use [[Cross-Validation]]) distinct from both training and final test data
- Use early stopping: track validation loss during training and stop once it stops improving, even if training loss keeps falling
- Plot learning curves as a routine diagnostic, not just a final-report artifact
- Start simple, then add capacity only as needed — it's easier to detect and fix underfitting than to unwind overfitting after the fact
- Re-evaluate the fit/overfit balance whenever you change the data pipeline, not just when you change the model — new features or preprocessing can shift a model from underfit to overfit or vice versa

## History
- The bias-variance decomposition was formalized in a widely-cited 1992 paper by Geman, Bienenstock, and Doursat, giving statistical language to a tension practitioners had long observed informally
- Vladimir Vapnik and Alexey Chervonenkis developed VC (Vapnik-Chervonenkis) dimension theory in the 1970s, providing a formal measure of a model class's capacity and a mathematical basis for why unconstrained capacity leads to poor generalization — this theory underlies why techniques like regularization and cross-validation work, not just that they work
- The double descent phenomenon, where test error can fall, rise, then fall again as model capacity keeps increasing past the interpolation threshold, was popularized in deep learning contexts around 2018-2019 and forced a partial rethink of the classical single-U-shaped bias-variance story for very overparameterized models
- Occam's razor — "prefer the simplest explanation that fits the facts" — is the philosophical ancestor of regularization, dating back centuries before it was formalized mathematically as a penalty term in a loss function

## FAQ
**Q: Is a small train/validation gap always fine?**
Only if absolute performance is also acceptable. A small gap with poor performance on both sets is underfitting, not success.

**Q: Can a model overfit and underfit at the same time?**
Yes, in different regions of the input space — e.g., it can memorize dense regions of the training distribution while failing to capture the pattern in sparse regions.

**Q: Does more data always fix overfitting?**
Usually helps, but not always — if the new data comes from a different distribution, or the model architecture is fundamentally too flexible for the problem, more data alone won't close the gap.

**Q: Does overfitting only happen with too little data?**
No — a sufficiently flexible model (like a very deep, wide neural network) can overfit even large datasets if left training long enough without regularization or early stopping; "too little data" is one common cause, not the only one.

## Common Interview Questions
**Q: How would you tell, from a single number, whether a model is overfitting?**
You can't from one number — you need at least a training-set score and a validation-set score to compute the gap. A single accuracy figure alone is uninformative about generalization.

**Q: Why does cross-validation help detect overfitting better than a single train/validation split?**
A single split gives one noisy estimate of generalization error, which can look fine or bad by chance. Cross-validation averages over multiple splits, giving a more stable estimate and revealing high variance across folds if the model is overly sensitive to which data it sees.

**Q: What's the relationship between overfitting and the number of training epochs?**
Training loss almost always keeps dropping with more epochs. Validation loss drops too, up to a point, then typically rises again as the model starts fitting training-set-specific noise — this rising point is exactly what early stopping is designed to catch.

**Q: If you had to pick just one technique to reduce overfitting, what would you pick and why?**
Getting more (or better) training data is usually the highest-leverage fix, since it directly attacks the root cause — insufficient signal relative to model flexibility — rather than compensating for it after the fact the way regularization does. When more data isn't available, early stopping is the cheapest and least invasive second choice.

**Q: How does model ensembling relate to the overfitting/underfitting tradeoff?**
Averaging predictions from multiple models trained with different random seeds, data subsets, or architectures reduces variance (since individual models' errors partially cancel out) without necessarily increasing bias — see [[Ensemble Methods]]. This is why ensembles often outperform any single constituent model on held-out data even when no individual member is regularized particularly hard.

## Related Terms
- [[Bias-Variance Tradeoff]]
- [[Regularization (L1, L2, Dropout)]]
- [[Cross-Validation]]
- [[Hyperparameter Tuning]]
- [[Precision, Recall, and F1 Score]]
- [[Ensemble Methods]]
- [[Feature Engineering]]

## Deeper Dive: Reading a Loss Curve
- A textbook overfitting curve: training loss decreases smoothly and continuously, validation loss decreases alongside it initially, then bottoms out and starts climbing while training loss keeps falling — the widening gap after that bottom point is the overfitting region
- A textbook underfitting curve: both training and validation loss decrease together but plateau early at a high value, with little to no gap between them — more training time alone won't close that gap because the model has run out of capacity to represent the pattern, not out of time to learn it
- A healthy curve: both losses decrease together and plateau close to each other at a low value — this is the target state, and it's what early stopping tries to freeze the model at before the validation curve turns upward

## Example
A model that gets 99% accuracy on training data but only 60% on a test set is overfitting — it memorized rather than learned to generalize. Conversely, a linear regression trying to fit a clearly curved (quadratic) relationship in the data will underfit: no matter how much data you give it, a straight line simply cannot capture the curve, so both its training and test error stay stubbornly high. The fix in the first case is more data, regularization, or a smaller model; the fix in the second case is a model with more expressive power, such as adding polynomial features or switching to a nonlinear model.

A practical middle-ground case: a decision tree with no depth limit will keep splitting until every training leaf is pure, achieving near-perfect training accuracy by essentially memorizing individual examples — capping `max_depth` or setting a minimum samples-per-leaf constraint trades away some training accuracy for a tree that captures the general shape of the data instead of its exact contents, which is why tree-based models expose these knobs directly as regularization hyperparameters.
