---
tags: [term, ml]
category: Core ML Concepts
---

# Cross-Validation

**Definition:** A technique for evaluating model performance by splitting data into multiple train/test partitions and averaging results, to get a more reliable estimate than a single train/test split.

## How It Works
- k-fold CV: split data into k roughly equal parts ("folds"), train on k-1 parts and validate on the remaining part, rotate through all k folds so every sample is used for validation exactly once
- Average the k validation scores (and often report their standard deviation) to estimate how the model will perform on unseen data, and how stable that estimate is
- Each fold produces its own trained model — k-fold CV trains k separate models, not one model evaluated k times
- The final "production" model is usually retrained on the full dataset after CV has selected hyperparameters or confirmed the approach — CV itself is an evaluation procedure, not a training procedure
- The fold assignment is typically randomized once (with a fixed seed for reproducibility) at the start, not re-randomized on every run, so results are comparable across experiments
- CV can evaluate more than one metric per fold in the same pass — it's common to track accuracy, precision, recall, and AUC simultaneously across folds rather than rerunning CV once per metric
- Out-of-fold predictions (the prediction each sample gets when it happens to be in the validation fold) can be collected across all k folds to reconstruct a full set of "unbiased" predictions for the entire training set — useful for stacking (see [[Ensemble Methods]]) and for diagnosing exactly which samples the model struggles with

## Under the Hood
- Variance of the CV estimate comes from two sources: which samples land in which fold, and how much the model's performance genuinely varies across subpopulations of the data
- Higher k (more folds) means each training set is closer in size to the full dataset (lower bias) but validation sets are smaller and fold-to-fold correlation increases (can raise variance of the estimate) — k=5 or k=10 is the standard tradeoff
- Nested cross-validation wraps an inner CV loop (for hyperparameter selection) inside an outer CV loop (for unbiased performance estimation) — needed when you tune hyperparameters and want a clean final number, since tuning on the same folds you report on leaks information
- The CV score is an estimate of *expected* generalization performance under the assumption that future data resembles the training distribution — it says nothing about performance under distribution shift
- A commonly cited (though debated) approximation for the variance of a k-fold estimate treats fold scores as if they were independent samples, giving a standard error of `std(fold_scores) / sqrt(k)` — in reality fold scores are correlated (they share overlapping training data), so this understates true uncertainty somewhat
- The 0.632 bootstrap is a related but distinct resampling method: it draws bootstrap samples (with replacement) for training and evaluates on the ~36.8% of samples left out each time, then blends in-sample and out-of-sample error with fixed weights — useful for very small datasets where even k-fold wastes too much data per fold

## Choosing k: Tradeoffs
| k | Training set size | Validation set size | Bias | Variance | Compute cost |
|---|---|---|---|---|---|
| 3 | 67% of data | 33% of data | Higher | Lower | Low (3 fits) |
| 5 | 80% of data | 20% of data | Moderate | Moderate | Moderate (5 fits) |
| 10 | 90% of data | 10% of data | Low | Higher | Higher (10 fits) |
| n (LOOCV) | ~100% of data | 1 sample | Very low | Can be high | Very high (n fits) |

## Variants
- **k-fold**: the standard approach described above; k=5 or k=10 are common defaults
- **Stratified k-fold**: preserves the class distribution in every fold — essential for imbalanced classification (e.g., 2% positive class) so no fold ends up with too few or zero positive examples
- **Leave-one-out (LOOCV)**: k equals the number of samples — every fold trains on all but one sample and validates on that one. Nearly unbiased but extremely expensive (n model fits) and can have high variance
- **Leave-p-out**: generalizes LOOCV to leave p samples out per fold; combinatorially expensive beyond very small p
- **Group k-fold**: keeps all samples from the same group (patient, user, session) entirely within one fold, preventing leakage when multiple rows share a source
- **TimeSeriesSplit / walk-forward validation**: respects temporal order — training folds only ever precede validation folds in time, mimicking how the model will actually be deployed
- **Repeated k-fold**: runs k-fold CV multiple times with different random splits and averages, reducing the variance introduced by any one particular fold assignment
- **Stratified group k-fold**: combines stratification and grouping simultaneously — needed when a dataset has both class imbalance and grouped structure (e.g., imbalanced diagnoses across multiple scans per patient)
- **Monte Carlo CV (shuffle-split)**: repeatedly draws a random train/validation split of a fixed proportion (e.g., 80/20) for a set number of iterations, rather than partitioning the data into fixed folds — flexible on how many repeats to run, but samples can be left out of validation entirely or validated multiple times

## Comparison
| | Single train/test split | k-fold CV | LOOCV |
|---|---|---|---|
| Compute cost | 1 model fit | k model fits | n model fits |
| Estimate variance | High (depends on the one split) | Moderate | Can be high despite near-zero bias |
| Estimate bias | Depends on split size | Low | Very low |
| Good for large datasets | Yes (cheap, plenty of data either way) | Yes | Rarely practical |
| Good for small datasets | No (too little validation signal) | Yes | Sometimes, if compute allows |
| Gives an uncertainty estimate | No (single number) | Yes (spread across folds) | Yes, but each fold differs by one sample only |
| Typical use case | Quick sanity check on huge datasets | Standard model selection/tuning | Very small datasets, expensive models excepted |

## Code Example
```python
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(n_estimators=200, random_state=42)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

scores = cross_val_score(model, X, y, cv=cv, scoring="f1")
print(f"F1: {scores.mean():.3f} +/- {scores.std():.3f}")
# Never fit scalers/encoders on X before this — do it inside a Pipeline
# so each fold's preprocessing only sees its own training data.
```

## Nested Cross-Validation Example
```python
from sklearn.model_selection import GridSearchCV, cross_val_score, KFold
from sklearn.svm import SVC

param_grid = {"C": [0.1, 1, 10], "gamma": [0.01, 0.1, 1]}

# Inner loop: picks the best hyperparameters for each outer training fold
inner_cv = KFold(n_splits=4, shuffle=True, random_state=0)
clf = GridSearchCV(SVC(), param_grid, cv=inner_cv, scoring="accuracy")

# Outer loop: gives an unbiased estimate of generalization performance
outer_cv = KFold(n_splits=5, shuffle=True, random_state=1)
nested_scores = cross_val_score(clf, X, y, cv=outer_cv)

print(f"Nested CV accuracy: {nested_scores.mean():.3f} +/- {nested_scores.std():.3f}")
# Without nesting, tuning and reporting on the same folds would
# optimistically bias this number.
```

## Real-World Applications
- Model selection — comparing logistic regression vs. gradient boosting vs. a neural network on the same CV folds to pick the best algorithm for a problem before committing to one
- Hyperparameter tuning — grid search and random search wrap CV internally to score each hyperparameter combination fairly (see [[Hyperparameter Tuning]])
- Feature selection validation — confirming a newly engineered feature actually improves CV score, not just training-set fit (see [[Feature Engineering]])
- Clinical and scientific studies — small medical datasets often rely on k-fold or leave-one-out CV since a held-out test set would waste too much already-scarce data
- A/B test proxy — before running an expensive live experiment, CV on historical data gives an early read on whether a new model is likely to outperform the current one
- Time-series forecasting — walk-forward validation confirms a demand-forecasting or financial model generalizes across different time windows before deployment
- Competition machine learning (Kaggle) — CV score is the standard way competitors validate models locally before submitting to a leaderboard with limited daily submissions
- Regulatory and audit contexts — some industries (finance, healthcare) require documented, reproducible validation methodology, and k-fold CV with a fixed seed provides an auditable, repeatable procedure
- Comparing preprocessing choices — deciding between two imputation strategies or scaling methods by comparing their CV scores under otherwise identical pipelines

## Why It Matters
- A single train/test split can be misleading due to lucky/unlucky splits — CV reduces that variance in evaluation and gives a confidence range, not just a point estimate
- Standard practice for hyperparameter tuning ([[Hyperparameter Tuning]]) and model comparison — picking a model based on one split risks picking the model that got lucky, not the model that's actually better
- Reveals instability: a model whose CV fold scores swing from 0.65 to 0.92 is telling you something (too little data, high variance model, or leakage) that a single split would hide
- On small datasets, CV is often the difference between a usable performance estimate and one dominated by noise
- Gives stakeholders a defensible, reproducible number ("87% +/- 2% across 5 folds") rather than a single figure that could shift meaningfully with a different random split
- Cheap relative to the cost of shipping a model that underperforms in production because its reported accuracy was an artifact of one lucky split

## Common Pitfalls
- Data leakage — fitting preprocessing (scaling, imputation, target encoding, feature selection) on the full dataset before splitting lets validation folds "see" information from training folds through shared statistics
- Using plain k-fold on time-series data, which breaks temporal order and leaks future information into training — use TimeSeriesSplit instead
- Not stratifying on imbalanced classification tasks, which can produce folds with wildly different class balance and unstable per-fold metrics
- Comparing CV scores across two experiments that used different fold splits (different seeds, different k) as if the numbers were directly comparable — they aren't, unless the folds are identical
- Ignoring grouped structure — if a dataset has multiple rows per patient/user and a random split puts some of one patient's rows in train and others in validation, the model can effectively memorize that patient and the score overstates real-world performance
- Applying SMOTE or other oversampling techniques before splitting into folds, which duplicates/synthesizes minority-class samples that then leak near-identical copies across train and validation
- Reporting the best fold's score instead of the mean — this is a subtle form of cherry-picking that overstates expected performance
- Reusing the same CV folds to both tune hyperparameters and report the final number, which optimistically biases the reported score — use nested CV or a held-out test set for the final report
- Running CV once and treating the result as gospel on a small dataset — rerun with repeated k-fold or different seeds to see how much the estimate itself moves around
- Silently changing the random seed between experiments and comparing scores as if the fold assignments were identical, when they weren't

## Best Practices
- Always wrap preprocessing steps in a `Pipeline` (scikit-learn) or equivalent so each fold fits its own transformers
- Use `StratifiedKFold` by default for classification; only fall back to plain `KFold` for regression
- Report mean and standard deviation together — a mean without a spread hides instability
- Hold out a final test set that never touches any CV fold, reserved purely for the last, single evaluation before deployment
- Fix a random seed for fold assignment so experiments are reproducible and comparable across different model/feature configurations
- For grouped or time-dependent data, choose `GroupKFold` or `TimeSeriesSplit` explicitly rather than defaulting to plain `KFold` out of habit
- Log per-fold scores, not just the mean, so unusual folds are visible in experiment tracking rather than averaged away

## FAQ
- **How is CV different from a validation set?** A validation set is one fixed split held out during training; CV rotates through multiple splits and averages, giving a less noisy estimate at the cost of more compute.
- **Does CV replace a test set?** No — CV is typically used during development (model selection, tuning); a separate untouched test set gives the final, unbiased performance number.
- **Why 5 or 10 folds specifically?** Empirically a good bias-variance tradeoff for typical dataset sizes; below ~5 the training sets shrink too much, above ~10 the extra compute buys diminishing returns.
- **Can CV be used for deep learning?** Yes, but it's less common due to compute cost — training a neural network k times is expensive, so deep learning practitioners more often rely on a single held-out validation set, reserving full CV for smaller models or final comparisons.
- **What does a high standard deviation across folds tell you?** The model's performance is sensitive to which data it sees — a sign of high variance, insufficient data, or a small subgroup the model handles very differently from the rest.
- **Is it ever acceptable to skip CV entirely?** On very large datasets (millions of rows), a single well-sized train/validation/test split can carry enough statistical power that CV's variance-reduction benefit becomes marginal relative to its extra compute cost — but this is the exception, not the default assumption.

## Related Terms
- [[Overfitting vs Underfitting]]
- [[Hyperparameter Tuning]]
- [[Bias-Variance Tradeoff]]
- [[Ensemble Methods]]
- [[Confusion Matrix]]
- [[Feature Engineering]]
- [[Supervised Learning]]
- [[Precision, Recall, and F1 Score]]

## Example
5-fold CV on 1,000 samples trains 5 separate models, each validated on a different 200-sample slice, then averages the 5 accuracy scores. Suppose the fold scores come back as [0.81, 0.79, 0.83, 0.60, 0.82] — the mean (0.77) alone hides the real story; the one low fold (0.60) is a signal worth investigating, since it might indicate a data quality issue, an unlucky split, or a subgroup of the data the model genuinely handles worse. A single 80/20 split might have landed on that same bad 20% and reported 0.60 as if it were representative, or landed on a good split and reported 0.83 as if the model were better than it is — CV surfaces both the estimate and its uncertainty.

A concrete debugging workflow: after seeing that outlier fold, pull the indices of the samples in that fold and inspect them directly. If they cluster around a particular time period, source, or category, that's a strong hint the model is missing a feature that would let it generalize to that subgroup — information CV surfaced that a single train/test split would have buried inside one aggregate number.
