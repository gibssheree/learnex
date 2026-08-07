---
tags: [term, ml]
category: Evaluation
---

# Confusion Matrix

**Definition:** A table that breaks down a classification model's predictions against actual labels, showing true positives, true negatives, false positives, and false negatives.

## How It Works
- Rows = actual class, columns = predicted class (or vice versa, depending on convention)
- Diagonal cells = correct predictions; off-diagonal cells = specific types of errors
- Basis for computing precision, recall, F1, and other classification metrics
- For binary classification, the four cells have standard names: True Positive (TP), False Positive (FP), False Negative (FN), True Negative (TN)
- False Positive is also called a "Type I error"; False Negative is a "Type II error" — terminology borrowed from statistical hypothesis testing
- Extends naturally to multi-class problems as an N×N grid
- The diagonal holds correct predictions per class
- Every off-diagonal cell `(i, j)` counts examples of true class `i` predicted as class `j`, letting you see exactly which classes get confused with which

## Under the Hood
The binary confusion matrix:

```
                    Predicted Positive   Predicted Negative
Actual Positive     TP                   FN
Actual Negative     FP                   TN
```

Every standard classification metric is a ratio of these four counts:

```
Accuracy    = (TP + TN) / (TP + TN + FP + FN)
Precision   = TP / (TP + FP)          of predicted positives, how many were right
Recall      = TP / (TP + FN)          of actual positives, how many were caught
Specificity = TN / (TN + FP)          of actual negatives, how many were correctly rejected
F1          = 2 * (Precision * Recall) / (Precision + Recall)
```

Precision and recall pull in opposite directions as you move the classification threshold:
- Lowering the threshold for predicting "positive" catches more true positives, so recall goes up
- The same lowered threshold also lets in more false positives, so precision goes down
- This tradeoff is visualized directly via the precision-recall curve
- The confusion matrix at any single threshold is just one point sampled from that curve

### Worked multi-class example
A 3-class matrix (rows = actual, columns = predicted) for classes A, B, C:

```
        Pred A   Pred B   Pred C
Act A     45        3        2
Act B      5       38        7
Act C      1        6       43
```
Class B's recall is 38/(5+38+7) = 76% — it's being confused with both A and C. Class A's precision is 45/(45+5+1) = 88.2% — most things predicted A really are A. A single "multi-class accuracy" number (126/150 = 84%) would hide that class B specifically is the weak point.

## Comparison: Precision vs. Recall Tradeoff

| Scenario | Prioritize | Why |
|---|---|---|
| Spam filter | Precision | A false positive (legit email marked spam) is costly — user misses real mail |
| Cancer screening | Recall | A false negative (missed cancer) is far more costly than a false positive (unnecessary follow-up test) |
| Fraud detection | Depends on cost | High recall catches more fraud but burdens investigators with false alarms; balance via F1 or a cost-weighted metric |
| Search engine results | Precision (top-k) | Users only look at the first few results — irrelevant results near the top hurt more than missed relevant ones further down |
| Airport security screening | Recall | Missing an actual threat is far worse than an extra manual bag check |

## Code Example
```python
from sklearn.metrics import confusion_matrix, classification_report

y_true = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0]
y_pred = [1, 0, 0, 1, 0, 1, 1, 0, 1, 0]

cm = confusion_matrix(y_true, y_pred)
print(cm)
# [[4 1]     TN=4, FP=1
#  [1 4]]    FN=1, TP=4

print(classification_report(y_true, y_pred))
# precision, recall, f1-score, support -- computed directly from the matrix above

# Extracting the four counts explicitly for binary classification
tn, fp, fn, tp = cm.ravel()
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print(f"precision={precision:.2f} recall={recall:.2f} f1={f1:.2f}")
```

## Common Interview Questions (Metric Derivations)
- Derive F1 from precision and recall: F1 is the harmonic mean of precision and recall, `2*P*R/(P+R)`, chosen over a simple arithmetic mean because the harmonic mean punishes a large imbalance between the two more heavily — a model with precision 1.0 and recall 0.0 gets an arithmetic mean of 0.5 but an F1 of 0.0.
- What is the F-beta score, and when would you use beta != 1? F-beta generalizes F1 by weighting recall beta times as important as precision: `(1+beta^2)*P*R / (beta^2*P + R)`. Beta > 1 (like F2) favors recall, appropriate for cancer screening; beta < 1 (like F0.5) favors precision, appropriate for spam filtering.
- Why is specificity rarely reported alongside precision and recall in ML contexts, even though it's common in medicine? Because specificity depends on TN, which in many ML settings (like information retrieval, with a huge pool of true negatives) is enormous and not very informative — precision is usually more actionable there.

## Why It Matters
- Reveals what kind of mistakes a model makes, which plain accuracy hides entirely
- Essential for imbalanced datasets, where a high-accuracy model can still be practically useless (see [[Precision, Recall, and F1 Score]])
- Different errors carry different real-world costs
- A confusion matrix lets you reason about that asymmetry explicitly instead of collapsing everything into one accuracy number
- Directly informs threshold selection: inspecting how the matrix changes as you slide the decision threshold shows the operating point that matches the actual cost of false positives vs. false negatives
- In multi-class settings, exposes systematic confusions between specific class pairs that a single aggregate score cannot

## Real-World Example
A medical model screening for a rare disease that affects 1% of patients can hit 99% accuracy by simply predicting "no disease" for everyone. The confusion matrix would immediately expose this as useless, showing TP=0 and FN=every actual case, meaning recall is 0%. Accuracy alone would never surface this failure; the confusion matrix breaks it apart into exactly the cell that matters — missed positive cases — rather than burying it in an aggregate number.

## Common Pitfalls
- Only checking overall accuracy and never looking at the matrix, missing that a model might be failing badly on one specific class
- Not accounting for class imbalance when interpreting the matrix's raw counts
- Comparing raw counts across differently-sized test sets instead of normalizing (as percentages or rates)
- A matrix with FP=50 means something very different on a test set of 100 vs. a test set of 10,000
- Optimizing a model purely for accuracy on an imbalanced dataset, silently accepting a model that has effectively collapsed to always predicting the majority class
- In multi-class problems, only checking the overall diagonal sum (multi-class accuracy) and missing that the model systematically confuses two specific similar classes with each other
- Picking a single decision threshold (usually the default 0.5) without checking whether it actually matches the cost tradeoff of the application

## Best Practices
- Always inspect the full matrix, not just accuracy or a single summary metric, before shipping a classifier
- Normalize the matrix by row (or column) when comparing performance across classes of very different sizes
- Report precision, recall, and F1 per class in multi-class problems, not just a single macro-averaged number
- Pick the decision threshold deliberately based on the relative cost of false positives vs. false negatives for the specific application, not by default

## FAQ
**What's the difference between a Type I and Type II error?** Type I is a false positive (rejecting a true null hypothesis, or predicting positive when the actual is negative). Type II is a false negative (failing to reject a false null hypothesis, or predicting negative when the actual is positive).

**Why not just use accuracy?** Accuracy weighs every correct and incorrect prediction equally and collapses four distinct outcomes (TP, TN, FP, FN) into one number, which hides exactly which kind of error a model makes.

**How does the confusion matrix relate to ROC curves?** An ROC curve plots the true positive rate (recall) against the false positive rate (`FP / (FP + TN)`) as the classification threshold varies — each point on the curve corresponds to a different confusion matrix computed at a different threshold.

**What does a confusion matrix look like for a perfect classifier?** All mass on the diagonal — every off-diagonal cell is zero, meaning no prediction was ever wrong.

## Common Interview Questions
- Why can a model with 99% accuracy still be useless? If the positive class makes up only 1% of the data, a model that always predicts "negative" hits 99% accuracy while catching zero true positives — the confusion matrix exposes this immediately, accuracy alone hides it.
- What's the difference between macro-averaged and micro-averaged F1 in multi-class problems? Macro-average computes the metric per class and averages unweighted, treating every class equally regardless of size; micro-average pools all TP/FP/FN counts across classes first, then computes the metric once, which weights larger classes more heavily.
- How would you choose a decision threshold using only a confusion matrix at 0.5? You wouldn't rely on a single matrix — you'd compute matrices across a range of thresholds (or use the precision-recall/ROC curve) and pick the threshold whose tradeoff matches the real-world cost of false positives versus false negatives.
- What does it mean if a confusion matrix is symmetric? Roughly equal numbers of false positives and false negatives — the model isn't systematically biased toward over- or under-predicting the positive class, though this alone doesn't mean the model is accurate, just that its errors aren't lopsided.

## Multi-Class Averaging Code Example
```python
from sklearn.metrics import precision_recall_fscore_support

y_true = ['A', 'A', 'B', 'B', 'C', 'C', 'A', 'B', 'C', 'A']
y_pred = ['A', 'B', 'B', 'B', 'C', 'A', 'A', 'B', 'C', 'A']

# macro: unweighted mean across classes -- small classes count as much as large ones
precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred, average='macro')
print(f"macro  -> precision={precision:.2f} recall={recall:.2f} f1={f1:.2f}")

# weighted: mean across classes, weighted by how many true instances each class has
precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred, average='weighted')
print(f"weighted -> precision={precision:.2f} recall={recall:.2f} f1={f1:.2f}")
```
Macro-averaging is the right choice when every class matters equally regardless of frequency (e.g., a rare disease subtype should count as much as a common one); weighted averaging is the right choice when overall performance across the actual class distribution is what matters.

## Related Terms
- [[Precision, Recall, and F1 Score]]
- [[Supervised Learning]]
- [[Overfitting vs Underfitting]]
- [[Cross-Validation]]

## Example
A spam classifier's confusion matrix might show it catches 95% of spam (true positives) but also wrongly flags 10% of legitimate emails as spam (false positives). Written as a matrix out of 1,000 legitimate and 1,000 spam emails: TP=950, FN=50, FP=100, TN=900.

Precision here is 950/(950+100), about 90.5% — meaning 1 in 10 emails the filter calls "spam" is actually legitimate — which might be an unacceptable false-positive rate for a user who can't afford to miss real mail, even though recall (catching 95% of actual spam) looks strong on its own.
