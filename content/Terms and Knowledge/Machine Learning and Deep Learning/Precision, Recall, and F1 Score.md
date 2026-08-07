---
tags: [term, ml]
category: Evaluation
---

# Precision, Recall, and F1 Score

**Definition:** Classification metrics derived from the confusion matrix. Precision measures how many predicted positives were actually correct; recall measures how many actual positives were correctly found; F1 is their harmonic mean, balancing both.

## How It Works
- Precision = True Positives / (True Positives + False Positives) — "when the model says yes, how often is it right?"
- Recall = True Positives / (True Positives + False Negatives) — "of all actual positives, how many did the model catch?"
- F1 = 2 × (Precision × Recall) / (Precision + Recall) — the harmonic mean, useful when you need a single balanced number
- All three metrics come directly from the four cells of a [[Confusion Matrix]]: True Positive (TP), False Positive (FP), True Negative (TN), False Negative (FN)
- Precision and recall are in tension — pushing a classifier's decision threshold to catch more positives (raising recall) almost always lets in more false positives (lowering precision), and vice versa
- Both metrics ignore true negatives entirely, which is exactly why they're preferred over accuracy on imbalanced problems where true negatives can be overwhelmingly numerous and uninformative
- Both are computed at a specific decision threshold — a probabilistic classifier (logistic regression, a neural net with a sigmoid/softmax output) produces a continuum of scores, and precision/recall change as that threshold slides, which is why a single reported number is only ever a snapshot at one operating point

## Under the Hood — Worked Example
Say a spam classifier is evaluated on 1,000 emails, 50 of which are actually spam. The model predicts:

| | Predicted Spam | Predicted Not Spam |
|---|---|---|
| **Actually Spam** | TP = 40 | FN = 10 |
| **Actually Not Spam** | FP = 30 | TN = 920 |

- Precision = 40 / (40 + 30) = 40/70 ≈ `0.571` — of the emails flagged as spam, 57.1% actually were
- Recall = 40 / (40 + 10) = 40/50 = `0.80` — the model caught 80% of all real spam
- F1 = 2 × (0.571 × 0.80) / (0.571 + 0.80) ≈ `0.667`
- Accuracy, for comparison, is (TP+TN)/(TP+TN+FP+FN) = 960/1000 = `0.96` — deceptively high because the negative class (920 non-spam) dominates the denominator; accuracy barely reflects how well spam itself is detected
- The harmonic mean (F1) punishes imbalance between precision and recall more harshly than a plain average would — if precision = 1.0 and recall = 0.01, the arithmetic mean is ~0.5 but F1 is ~0.02, correctly signaling the model is nearly useless despite one perfect-looking number
- Specificity, a related but distinct metric, uses the two cells precision/recall ignore: `Specificity = TN / (TN + FP)` = 920/950 ≈ `0.968` — "of all actual non-spam, how many were correctly left alone"
- Negative predictive value (NPV), the mirror image of precision, is `TN / (TN + FN)` = 920/930 ≈ `0.989` — "when the model says not-spam, how often is that correct" — rarely reported but occasionally important when a false negative is the costly error, such as in medical rule-out testing

## Variants
- **Fβ score** — a generalized F1 that weights recall β times as important as precision: `Fβ = (1+β²) × (precision × recall) / (β²×precision + recall)`. F2 favors recall (e.g., disease screening), F0.5 favors precision (e.g., spam filtering where false positives are costly)
- **Macro-averaging** — compute precision/recall/F1 per class independently, then take the unweighted mean across classes; treats every class as equally important regardless of size
- **Micro-averaging** — pool all TP/FP/FN counts across classes first, then compute one global precision/recall/F1; dominated by the performance on large classes
- **Weighted averaging** — like macro, but each class's score is weighted by its support (number of true instances), balancing between macro and micro
- **Precision-Recall curve** — plots precision vs recall across every possible decision threshold; the area under this curve (PR-AUC) summarizes performance across all thresholds at once, and is more informative than ROC-AUC on heavily imbalanced data
- **Matthews Correlation Coefficient (MCC)** — a single-number metric that uses all four confusion matrix cells symmetrically, often considered more robust than F1 on imbalanced binary classification since it accounts for true negatives too

## Why It Matters
- Plain accuracy is misleading on imbalanced datasets (e.g., 99% accuracy on 1%-fraud data by always predicting "not fraud")
- The right metric to optimize for depends entirely on the cost of false positives vs false negatives in your specific problem
- These metrics let you explicitly choose a tradeoff via the decision threshold, rather than being stuck with whatever a single fixed cutoff (typically 0.5) happens to produce
- Multi-class problems (10 classes, 1000 classes) still reduce to these same building blocks per-class, then get aggregated — understanding the aggregation method matters as much as the base metric
- These are the metrics stakeholders outside ML actually understand and can weigh in on — "we'd rather miss a few more fraud cases than annoy this many legitimate customers" is a business conversation that precision/recall makes possible, unlike a single opaque accuracy number

## Code Example
```python
from sklearn.metrics import precision_score, recall_score, f1_score, classification_report

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0]

print(precision_score(y_true, y_pred))   # 0.8
print(recall_score(y_true, y_pred))      # 0.8
print(f1_score(y_true, y_pred))          # 0.8

# Multi-class: choose an averaging strategy explicitly
print(f1_score(y_true_multiclass, y_pred_multiclass, average="macro"))
print(f1_score(y_true_multiclass, y_pred_multiclass, average="weighted"))

print(classification_report(y_true, y_pred))  # per-class precision/recall/F1 + support

# sweeping thresholds to find the best operating point for your use case
from sklearn.metrics import precision_recall_curve
precisions, recalls, thresholds = precision_recall_curve(y_true, model_probabilities)
```

## Comparison: Precision vs Recall by Use Case
| Use case | Prioritize | Why |
|---|---|---|
| Cancer screening | Recall | Missing a real case (FN) is far worse than a false alarm that gets ruled out later |
| Spam filtering | Precision | A false positive (real email in spam folder) is worse than letting one spam email through |
| Fraud detection | Recall (often, with human review) | Missing fraud is costly, but flagged cases get manually reviewed to catch FPs |
| Search/recommendation ranking | Precision (top-k) | Users only see the top few results; low-ranked false positives barely matter |
| Legal e-discovery | Recall | Missing a relevant document can be legally consequential |
| Manufacturing defect detection | Recall | A shipped defective part is typically costlier than a false alarm that triggers extra inspection |

## Real-World Example
- A hospital deploying a sepsis-prediction model deliberately tunes the threshold toward higher recall, accepting more false alarms, because a missed sepsis case can be fatal while a false alarm just triggers an extra check by a nurse
- An email provider tunes spam filtering toward higher precision, because users are far more upset by a legitimate email lost in spam than by an occasional spam email reaching the inbox
- A/B testing a new fraud model often reports precision and recall separately to different stakeholders — the fraud operations team cares about recall (catch more fraud), while customer support cares about precision (fewer angry calls about blocked legitimate transactions)
- Content moderation systems on social platforms typically report precision and recall by policy category separately (hate speech, spam, violence), since the acceptable tradeoff differs by category — a platform may tolerate lower precision (more false takedowns) for content with legal risk while requiring high precision for borderline creative content

## Common Pitfalls
- Optimizing accuracy alone on an imbalanced dataset, producing a model that's technically accurate but practically useless
- Chasing high recall without considering precision cost (e.g., a cancer screening tool that flags everyone as positive has perfect recall but is useless)
- Reporting a single F1 score on a multi-class problem without specifying macro/micro/weighted — these can differ substantially and aren't interchangeable
- Comparing F1 scores across datasets with different class balances as if they were on the same scale
- Picking the default 0.5 classification threshold without checking whether it actually matches the precision/recall tradeoff the business needs
- Evaluating on the same data used for threshold tuning, inflating the reported metric

## Best Practices
- Always report precision, recall, and a confusion matrix together — F1 alone hides which type of error dominates
- Choose the averaging strategy (macro/micro/weighted) based on whether classes matter equally or in proportion to their frequency, and state which one you used
- Tune the decision threshold explicitly using a validation set and a precision-recall curve, rather than accepting the default 0.5
- For heavily imbalanced problems, prefer PR-AUC over ROC-AUC as the summary metric — ROC-AUC can look good even when precision is poor
- Track these metrics per class in multi-class problems, not just the aggregate — a good weighted average can hide one class performing terribly
- Recompute and monitor precision/recall after deployment, not just at training time — real-world class balance and input distributions drift, and a threshold tuned on last quarter's data may no longer match this quarter's tradeoff

## FAQ
**Q: Why not just always maximize F1?**
F1 assumes precision and recall are equally important, which is a business decision, not a mathematical fact. Use Fβ or a custom cost function when the tradeoff is asymmetric.

**Q: Why "harmonic" mean instead of a regular average?**
The harmonic mean stays close to the smaller of the two numbers, so F1 only looks good when both precision and recall are reasonably high — a regular average would let one very high value mask one very low value.

**Q: Can precision and recall both be 1.0?**
Yes, if the classifier makes zero false positives and zero false negatives — a perfect classifier on that dataset.

## Common Interview Questions
**Q: A model has 95% accuracy on a dataset that's 95% negative class. Is it good?**
Not necessarily — a classifier that always predicts "negative" would also score 95% accuracy while being useless. You need to check precision and recall on the positive class specifically to know anything meaningful.

**Q: How do you choose a classification threshold in practice?**
Plot the precision-recall curve across thresholds, then pick the operating point that matches the actual cost ratio of false positives to false negatives for the business problem — not a default value like 0.5.

**Q: What's the difference between macro-F1 and micro-F1 on an imbalanced dataset, concretely?**
Macro-F1 treats a rare class's poor performance as equally important as a common class's performance, so it drops sharply if the model fails on rare classes. Micro-F1 is dominated by the common classes and can stay high even if rare-class performance is poor.

**Q: If precision and recall are both 0.6, is F1 higher, lower, or equal to 0.6?**
Equal — when precision and recall are identical, their harmonic mean equals that same value. The harmonic mean only pulls below the arithmetic mean when the two inputs differ from each other.

**Q: How would you explain precision and recall to a non-technical stakeholder?**
Precision answers "when the model raises a flag, how often is it actually right?" Recall answers "of all the real cases out there, how many did the model actually catch?" A model can score well on one while doing poorly on the other, so ask which mistake is more expensive for the business before picking which one to prioritize.

## History
- Precision and recall originate in information retrieval research from the 1950s-60s, where they measured how well a document search system retrieved relevant results from a large corpus — "precision" meant relevant-among-retrieved, "recall" meant retrieved-among-relevant, the same definitions used in ML today
- The F-measure was introduced by Cornelis Joost van Rijsbergen in the 1970s as a way to combine precision and recall into a single tunable score via the beta parameter, generalizing what's now commonly used as the unweighted F1
- These metrics migrated from information retrieval into general statistical classification and later machine learning as the field grew, replacing or supplementing pure accuracy once practitioners repeatedly ran into the class-imbalance problem accuracy can't handle

## Deeper Dive: The ROC Curve and AUC
- The ROC (Receiver Operating Characteristic) curve plots the true positive rate (recall) against the false positive rate (`FP / (FP + TN)`) across every threshold, and originated in WWII-era signal detection theory for radar operators distinguishing real targets from noise
- ROC-AUC (area under that curve) summarizes ranking quality independent of any single threshold, and is popular for balanced classification problems
- On heavily imbalanced data, ROC-AUC can look deceptively good because the false positive rate denominator (TN-heavy) stays small even when precision (which uses FP directly against a much smaller TP count) is poor — this is exactly why PR-AUC is generally preferred over ROC-AUC once the positive class becomes rare
- A model can have a high ROC-AUC (~0.95) while still having mediocre precision at any threshold a business could realistically operate at — always sanity-check ROC-AUC against the precision-recall curve on imbalanced problems before trusting it as the headline metric

## Related Terms
- [[Confusion Matrix]]
- [[Supervised Learning]]
- [[Overfitting vs Underfitting]]
- [[Cross-Validation]]
- [[Hyperparameter Tuning]]
- [[Bias-Variance Tradeoff]]
- [[Feature Engineering]]

## Example
A fraud detector with high recall but low precision catches almost all fraud but also falsely flags many legitimate transactions — a tradeoff that must match the business's tolerance for each type of error. If a bank sets the model's threshold low to maximize recall (catch every possible fraud case), it accepts more false positives and routes more legitimate transactions to manual review; raising the threshold trades some missed fraud for fewer customer complaints about blocked purchases. The right operating point isn't a modeling question at all — it's determined by comparing the dollar cost of a missed fraud case against the cost (in support tickets and lost trust) of a wrongly blocked transaction.
