---
tags: [term, ml]
category: Evaluation
---

# Ensemble Methods

**Definition:** Techniques that combine predictions from multiple models to produce a result more accurate and robust than any single model alone.

## How It Works
- Bagging (e.g., Random Forest): train many models independently on random subsets of data (bootstrap sampling, sampling with replacement), then average/vote their predictions — reduces variance
- Boosting (e.g., XGBoost, AdaBoost, LightGBM): train models sequentially, each one focusing on correcting the previous model's errors — reduces bias
- Stacking: train a "meta-model" that learns how to best combine the outputs of several different base models, rather than using a fixed rule like averaging or voting
- Voting: the simplest ensemble — combine predictions from independently-trained, often different-algorithm models via majority vote (classification) or averaging (regression), with no meta-model involved
- Ensembles can mix strategies — a stacked meta-model's base layer might itself consist of bagged and boosted models, and the final prediction might further average that stack with a separately-trained neural network
- The number of base models is itself a hyperparameter — accuracy typically improves with more models up to a point of diminishing returns, after which added compute buys negligible gains

## Variants
- **Bagging (Bootstrap Aggregating)**: each base model trains on a bootstrap sample (same size as original data, sampled with replacement, so ~63% of unique rows appear per sample); predictions are averaged or majority-voted. Random Forest adds a second randomization layer — each split only considers a random subset of features, decorrelating the trees further
- **Boosting**:
  - AdaBoost — reweights misclassified samples upward after each round so the next weak learner focuses on the hard cases
  - Gradient Boosting — each new model fits the residual (negative gradient of the loss) of the ensemble so far, rather than reweighting samples
  - XGBoost / LightGBM / CatBoost — production-grade gradient boosting implementations adding regularization, histogram-based splitting, and native categorical handling for speed and generalization
- **Stacking**: base models' out-of-fold predictions become the input features for a meta-model (often a simple linear or logistic model) — done with CV internally to avoid the meta-model overfitting to base models' training-set predictions
- **Blending**: a simpler cousin of stacking that uses a fixed holdout set instead of CV to generate meta-features — faster but uses less data efficiently
- **Voting**: hard voting (majority class) vs soft voting (average predicted probabilities) — soft voting generally outperforms hard voting when base models produce well-calibrated probabilities
- **Weighted averaging**: a lightweight alternative to stacking — instead of learning a meta-model, base model predictions are combined with fixed or grid-searched weights (e.g., 0.6 * model_A + 0.4 * model_B), useful when a full meta-model would overfit on limited data
- **Snapshot ensembles**: for neural networks, cyclical learning rate schedules cause training to periodically converge to different local minima; saving weights at each convergence point creates an ensemble from a single training run at a fraction of the usual compute cost

## Popular Implementations
| Library | Strategy | Notable strength |
|---|---|---|
| scikit-learn RandomForestClassifier | Bagging | Simple, reliable, well-integrated baseline |
| XGBoost | Boosting | Regularized objective, strong competition track record |
| LightGBM | Boosting | Histogram-based splits, fast on large datasets |
| CatBoost | Boosting | Native categorical feature handling, less tuning needed |
| scikit-learn StackingClassifier / VotingClassifier | Stacking / Voting | Easy to combine heterogeneous scikit-learn-compatible models |

## Under the Hood
- Bagging reduces variance because averaging independent, identically-distributed noisy estimators shrinks variance by roughly 1/n (in the idealized independent case) while leaving bias unchanged — this is why bagging pairs well with high-variance, low-bias base learners like deep unpruned decision trees
- Boosting reduces bias because each successive model directly targets what the ensemble has gotten wrong so far — this is why boosting pairs well with high-bias, low-variance base learners like shallow decision stumps
- The bias-variance decomposition explains why bagging and boosting are near-opposite strategies: see [[Bias-Variance Tradeoff]]
- Ensemble diversity matters more than individual model strength beyond a point — two models that make the same mistakes gain nothing from averaging; the error reduction from ensembling scales with how uncorrelated the base models' errors are
- For regression, the ensemble's mean squared error can be decomposed to show averaging m models with average individual variance V and average pairwise correlation rho reduces variance to roughly `rho*V + (1-rho)*V/m` — as m grows this converges to `rho*V`, meaning correlated errors set a floor on how much ensembling can help no matter how many models are added
- Gradient boosting's "learning rate" (shrinkage) scales each new tree's contribution down, trading more rounds of training for better generalization — closely related in spirit to [[Learning Rate]] in neural network training
- Out-of-bag (OOB) error is a free-lunch validation trick specific to bagging: since each tree only trains on ~63% of samples (bootstrap sampling), the remaining ~37% "out-of-bag" samples can validate that tree, giving an internal error estimate without needing a separate held-out set
- Gradient boosting can be viewed as gradient descent in function space — instead of updating parameters to reduce loss, each boosting round adds a new function (tree) that approximates the negative gradient of the loss with respect to the current ensemble's predictions

## History
- Bootstrap aggregating (bagging) was introduced by Leo Breiman in 1996 as a general variance-reduction technique for unstable predictors like decision trees
- AdaBoost (Freund & Schapire, 1995/1997) was the first practical boosting algorithm and won the Gödel Prize for its theoretical contributions to learning theory
- Random Forest (Breiman, 2001) combined bagging with random feature selection at each split, becoming one of the most widely used out-of-the-box classifiers for tabular data
- Stacked generalization (Wolpert, 1992) predates Random Forest and formalized the idea of a meta-model learning to combine base model outputs, laying the groundwork for modern stacking implementations
- Gradient Boosting Machines (Friedman, 1999-2001) generalized boosting to arbitrary differentiable loss functions by framing it as gradient descent in function space
- XGBoost (Chen & Guestrin, 2016) popularized production-grade gradient boosting with regularization and system-level optimizations, becoming a dominant tool in ML competitions; LightGBM (2017) and CatBoost (2017) followed with further speed and categorical-handling improvements

## Comparison
| | Bagging | Boosting | Stacking |
|---|---|---|---|
| Base models trained | In parallel, independently | Sequentially, dependently | In parallel, then combined by a meta-model |
| Primarily reduces | Variance | Bias | Both, if meta-model is well-regularized |
| Overfitting risk | Low (more trees rarely hurts much) | Higher (needs early stopping/regularization) | Depends on meta-model complexity |
| Typical base learner | Deep, unpruned trees | Shallow trees (stumps to depth ~6-8) | Diverse algorithms (trees, linear, neural nets) |
| Parallelizable training | Yes | No (each model depends on the last) | Base models yes, meta-model needs their outputs first |

## Code Example
```python
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import StackingClassifier
from sklearn.model_selection import cross_val_score

base_models = [
    ("rf", RandomForestClassifier(n_estimators=300, max_depth=None)),
    ("gb", GradientBoostingClassifier(n_estimators=200, learning_rate=0.05)),
]

stack = StackingClassifier(
    estimators=base_models,
    final_estimator=LogisticRegression(),
    cv=5,  # generates out-of-fold predictions for the meta-model, avoiding leakage
)

scores = cross_val_score(stack, X, y, cv=5, scoring="roc_auc")
print(f"Stacked AUC: {scores.mean():.3f}")
```

## Why It Matters
- Consistently among the top-performing approaches for structured/tabular data competitions (Kaggle-style problems), where gradient boosting variants routinely beat deep learning
- Reduces the risk of any single model's blind spots or overfitting dominating the final prediction
- Random Forests and gradient boosting remain the default strong baseline for tabular data in production — often outperforming more complex deep learning approaches while being cheaper to train and easier to interpret (via feature importance)
- Ensembling is essentially free insurance against picking the "wrong" single model when several candidates perform similarly on validation data
- Provides a natural way to estimate prediction uncertainty — the spread of predictions across base models (or across a deep ensemble of neural networks) gives a usable confidence signal that a single model's point prediction doesn't
- Often the fastest way to squeeze additional accuracy out of an already-tuned pipeline, since a small stack of already-strong models tends to outperform further tuning of any one of them individually
- Feature importance aggregated across an ensemble (e.g., mean decrease in impurity across all Random Forest trees) is generally more stable and trustworthy than importance derived from a single tree, which can be sensitive to small data changes

## Real-World Applications
- Credit scoring and fraud detection — gradient-boosted trees are a banking-industry standard for their accuracy and (via feature importance/SHAP) interpretability requirements
- Search ranking and recommendation — gradient boosting (e.g., LambdaMART) has long powered learning-to-rank systems at major search and e-commerce companies
- Kaggle and other ML competitions — the majority of tabular-data competition winners use XGBoost, LightGBM, or CatBoost, frequently stacked or blended with each other
- Click-through-rate prediction in ad tech — ensembles combine multiple signal sources (user history, ad content, context) where no single simple model captures every interaction
- Medical risk scoring — Random Forests and boosted trees are common for predicting readmission risk or disease progression from structured patient records
- Weather and demand forecasting — ensembling several distinct forecasting models (statistical and ML-based) to hedge against any single model's systematic blind spots
- Computer vision and NLP leaderboards — even in deep learning, top competition entries commonly ensemble several trained checkpoints or architectures via averaging or weighted voting for a final accuracy boost

## Common Pitfalls
- Assuming ensembling always helps — it adds complexity and inference cost, and gains can be marginal if base models are too similar/correlated
- Skipping hyperparameter tuning on individual base models because "the ensemble will average out the mistakes" — a genuinely weak base model still drags down the ensemble, especially in stacking where a bad model can mislead the meta-model
- Treating ensembling as a substitute for fixing a data quality problem — averaging several models trained on the same flawed or leaky data reproduces the same flaw in every member, and no amount of combining removes it
- Using boosting without controlling for overfitting (it can fit training data very tightly if unchecked) — use early stopping on a validation set, shallow trees, and shrinkage
- Stacking without out-of-fold predictions for the meta-model — training the meta-model on base models' in-sample predictions teaches it to trust overfit base models
- Treating ensemble size as free — 1,000 trees instead of 300 rarely improves accuracy much but multiplies inference latency and memory
- Forgetting that ensembles of the same algorithm with the same random seed and same data aren't actually diverse — diversity has to come from data sampling, feature sampling, algorithm choice, or hyperparameters
- Ignoring calibration — averaging probabilities from base models that aren't individually well-calibrated can produce an ensemble whose output probabilities don't mean what they appear to mean
- Deploying a large ensemble without a latency budget check — a five-model stack might be unacceptable in a real-time serving path that needs sub-10ms predictions
- Retraining only some base models on new data over time, letting the ensemble drift out of sync with itself and making its combined behavior harder to reason about

## Best Practices
- Match the base learner to the strategy: high-variance learners (deep trees) for bagging, high-bias learners (shallow trees) for boosting
- Use early stopping (monitor validation loss, stop when it stops improving) for boosting rather than a fixed number of rounds
- For stacking, always generate meta-features via cross-validation, never from in-sample predictions
- Check pairwise correlation of base model predictions before finalizing an ensemble — near-duplicate models add cost without adding accuracy
- Tune tree depth and learning rate together for boosting — a lower learning rate generally needs more trees, and the two interact more than either alone
- Benchmark ensemble latency against a single strong model before committing to production — the accuracy gain has to justify the added inference cost for the specific use case
- Use out-of-bag error as a quick, no-extra-cost sanity check on bagged models before running a full separate cross-validation pass
- Prefer a small, diverse ensemble (2-3 genuinely different model families) over a large ensemble of near-identical models when latency budget is tight

## FAQ
- **Is XGBoost bagging or boosting?** Boosting — it fits trees sequentially against the gradient of the loss, though it also borrows bagging-style row/column subsampling per tree to reduce overfitting.
- **When does ensembling not help?** When base models are highly correlated (near-identical errors), or when the added inference cost/latency isn't worth a marginal accuracy gain in production.
- **Can you ensemble neural networks?** Yes — "deep ensembles" (training several networks with different initializations and averaging) is a well-established way to improve accuracy and get better-calibrated uncertainty estimates, at the cost of n times the training and inference compute.
- **Why does Random Forest rarely overfit as you add more trees?** Because trees are averaged, not summed — more trees reduce variance and stabilize the estimate, they don't let the model fit training noise more tightly the way more boosting rounds can.
- **What's the practical difference between blending and stacking?** Blending trains the meta-model on a single held-out set (simpler, less data-efficient); stacking uses cross-validated out-of-fold predictions (more data-efficient, more code complexity).
- **Does bagging help with underfitting?** No — bagging only reduces variance, so it doesn't help an underfit (high-bias) model; boosting or a more expressive base learner is the right fix for underfitting.
- **How many base models are typically enough?** For Random Forest, accuracy usually plateaus somewhere between 100 and 500 trees; for gradient boosting, the right number of rounds is tied to the learning rate and is best chosen via early stopping rather than a fixed guess.

## Related Terms
- [[Bias-Variance Tradeoff]]
- [[Supervised Learning]]
- [[Cross-Validation]]
- [[Overfitting vs Underfitting]]
- [[Hyperparameter Tuning]]
- [[Feature Engineering]]
- [[Confusion Matrix]]
- [[Regularization (L1, L2, Dropout)]]
- [[Learning Rate]]

## Example
A Random Forest averages predictions from hundreds of individual decision trees, each trained on a different random subset of the data and a different random subset of features at each split, to produce a more stable overall prediction. In a loan-default model, one overfit tree might latch onto a spurious pattern in a small subset of applicants; averaged with hundreds of other trees that didn't see that same noisy subset, the ensemble's final probability estimate smooths out that individual tree's mistake without needing to identify which mistake it was. A gradient-boosted alternative on the same data would instead build trees sequentially, with each new tree specifically targeting the applicants the ensemble so far predicts worst on — typically squeezing out more accuracy than Random Forest on structured data, at the cost of being more sensitive to hyperparameters and more prone to overfitting if left untuned.

A concrete stacking example: a team building a churn model trains a Random Forest, an XGBoost model, and a logistic regression on the same customer data. Individually they score 0.81, 0.83, and 0.77 AUC respectively. Rather than picking the single best (XGBoost), the team generates out-of-fold predictions from all three via 5-fold CV, then trains a simple logistic regression meta-model on those three columns of predictions. The stacked model scores 0.85 AUC — better than any individual model, because the meta-model learned that the Random Forest and logistic regression each catch certain churn patterns XGBoost occasionally misses, particularly among customers with short tenure.
