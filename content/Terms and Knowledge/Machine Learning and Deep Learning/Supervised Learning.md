---
tags: [term, ml]
category: Core ML Concepts
---

# Supervised Learning

**Definition:** A machine learning approach where a model learns from labeled examples — input paired with the correct output — to predict outputs for new, unseen inputs.

## How It Works
- Feed the model (input, correct label) pairs, e.g. (house features, price)
- The model adjusts internal parameters to minimize the gap between its prediction and the true label
- Two main types: regression (continuous output) and classification (categorical output)
- Training proceeds in a loop: make a prediction, measure the error with a loss function, compute the gradient of that error with respect to the model's parameters, and nudge the parameters in the direction that reduces it
- The dataset is typically split into training, validation, and test sets so that model quality is measured on data the model never directly optimized against
- The whole process can be framed as function approximation: supervised learning searches a hypothesis space for the function that best maps inputs to outputs according to the observed examples
- Training halts when a stopping criterion is met — a fixed number of [[Epoch, Batch, and Iteration]], convergence of the loss, or early stopping triggered by validation performance no longer improving

## Under the Hood
- The model is a parameterized function f(x; theta) — theta could be a handful of coefficients (linear regression) or billions of weights (a deep network)
- The loss function quantifies "how wrong" a prediction is: mean squared error for regression, cross-entropy for classification
- [[Gradient Descent]] (or a variant like Adam) iteratively updates theta using the gradient of the loss, scaled by the [[Learning Rate]]
- Model capacity — how flexible the function class is — governs the tradeoff between fitting the training data well and generalizing to new data; this is the core of the [[Bias-Variance Tradeoff]]
- Generalization is estimated with held-out data via [[Cross-Validation]], since low training error alone says nothing about performance on unseen inputs
- Most algorithms don't minimize loss directly against the discrete/discontinuous ideal metric (e.g., accuracy); they minimize a smooth, differentiable proxy (e.g., cross-entropy) that gradient descent can actually optimize
- Optimization is typically done in mini-batches rather than on the full dataset at once — see [[Epoch, Batch, and Iteration]] — trading off gradient noise against compute efficiency
- Two error sources compose the total generalization error: bias (systematic error from an overly simple model) and variance (sensitivity to the particular training sample drawn) — reducing one often increases the other

## Training Workflow
- **Baseline first:** fit the simplest reasonable model (majority-class predictor, linear/logistic regression) before anything fancier, to establish a floor to beat
- **Feature preparation:** encode categoricals, scale numeric features, and handle missing values — see [[Feature Engineering]] — since most algorithms assume numeric, complete input
- **Model selection:** choose a model family appropriate to the data size, dimensionality, and interpretability needs — tree ensembles for tabular data, CNNs/transformers for images and text
- **Hyperparameter tuning:** search over settings like tree depth, regularization strength, or [[Learning Rate]] using the validation set — see [[Hyperparameter Tuning]] — never the test set
- **Final evaluation:** score the tuned model exactly once on the held-out test set to get an unbiased estimate of real-world performance
- **Deployment monitoring:** track live prediction distributions and, where feedback eventually arrives (e.g., actual outcomes), live accuracy — the offline test score is only a snapshot at training time, not a guarantee

## Variants
- **Regression:** predicts a continuous numeric value — linear regression, polynomial regression, regression trees, support vector regression
- **Classification:** predicts a discrete category — logistic regression, decision trees, random forests, support vector machines, k-nearest neighbors, and neural network classifiers
- **Binary vs. multiclass vs. multilabel classification:** binary picks between two classes, multiclass picks exactly one of several classes, multilabel allows multiple simultaneous labels per example (e.g., tagging an image with several objects)
- **Parametric vs. non-parametric models:** parametric models (linear/logistic regression) assume a fixed functional form with a fixed number of parameters; non-parametric models (k-NN, decision trees) let model complexity grow with the data
- **Structured prediction:** an extension where the output itself has structure (sequences, trees, graphs) rather than being a single scalar or class, as in named-entity tagging or machine translation
- **Ordinal regression:** a middle ground between regression and classification for outputs with a natural order but no meaningful numeric distance (e.g., star ratings 1-5), handled with specialized loss functions rather than plain regression or classification loss

## Why It Matters
- The most common and best-understood ML paradigm — powers spam filters, price prediction, image classifiers
- Requires labeled data, which is often the biggest cost/bottleneck in real projects
- Because the objective (minimize error against known answers) is unambiguous, supervised learning is the easiest paradigm to evaluate, debug, and productionize compared to unsupervised or reinforcement learning
- Nearly every high-profile deep learning success — ImageNet classifiers, machine translation, speech recognition — was originally driven by supervised training on large labeled datasets
- Provides the cleanest signal for automated hyperparameter search and model comparison, since "lower validation loss" or "higher F1" gives an unambiguous ranking that unsupervised metrics rarely do
- The labeled-data bottleneck has directly shaped the field's tooling — data labeling platforms, weak supervision frameworks, and active learning pipelines all exist to make supervised learning practical at scale

## Common Interview Questions
- **What's the difference between a parametric and non-parametric model?** Parametric models assume a fixed functional form with a fixed number of parameters regardless of data size (linear regression); non-parametric models let complexity grow with the amount of training data (k-NN, decision trees)
- **Why use cross-entropy loss instead of accuracy directly for classification?** Accuracy is flat and non-differentiable almost everywhere, so gradient descent has no useful signal to follow; cross-entropy is smooth and differentiable, and pushes predicted probabilities toward the true label
- **What causes high bias vs. high variance?** High bias comes from a model too simple to capture the true pattern (underfitting); high variance comes from a model that fits training noise as if it were signal (overfitting) — see [[Bias-Variance Tradeoff]]
- **How does regularization help generalization?** It penalizes model complexity (e.g., large weights) directly in the loss function, discouraging the model from fitting noise even when it technically could — see [[Regularization (L1, L2, Dropout)]]
- **What's the difference between validation and test sets?** The validation set is used repeatedly during development to tune hyperparameters and select models; the test set is touched once, at the very end, to report a final, unbiased performance estimate
- **What is early stopping, and why does it work as a regularizer?** Halting training once validation loss stops improving prevents the model from continuing to fit noise in the training set after it has already captured the generalizable signal, acting as an implicit constraint on model complexity

## Common Pitfalls
- Training on data that doesn't reflect real-world distribution, hurting generalization
- Mislabeled or noisy training data silently capping model quality
- Data leakage — information from the test/validation set (or from the future, in time-series problems) accidentally influencing training, producing metrics that look great but don't hold up in production
- Class imbalance — a model can score 99% accuracy on a dataset that's 99% one class while being useless at detecting the minority class; metrics like [[Precision, Recall, and F1 Score]] catch this where raw accuracy doesn't
- Confusing correlation picked up in the training distribution with a causal or generalizable signal (e.g., a model that "detects wolves" by learning to detect snow in the background)
- Overfitting to the training set — see [[Overfitting vs Underfitting]] — often invisible until evaluated on genuinely new data
- Tuning hyperparameters against the test set (even unintentionally, by checking it repeatedly), which quietly turns the "unbiased" final estimate into an optimistic, biased one
- Using a single train/test split on a small dataset, where the reported metric can swing significantly just from which examples happened to land in which split — [[Cross-Validation]] exists specifically to average this noise out
- Chasing a single aggregate metric (e.g., overall accuracy) instead of checking per-class or per-segment performance, which can hide the model failing badly on a minority group or edge case

## Algorithm Cheat Sheet
- **Linear/logistic regression:** fast, interpretable, strong baseline; assumes a roughly linear relationship between features and target
- **Decision trees:** interpretable, handles nonlinear interactions and mixed feature types, but prone to overfitting alone
- **Random forests / gradient boosting (XGBoost, LightGBM):** ensembles of trees — see [[Ensemble Methods]] — the default strong choice for structured/tabular data
- **k-nearest neighbors:** simple, no training phase, but slow at prediction time and sensitive to feature scaling and irrelevant features
- **Support vector machines:** effective in high-dimensional spaces with clear margins between classes, less common now that gradient-boosted trees and neural nets dominate most benchmarks
- **Neural networks:** most flexible, best choice when there's abundant data and the input is unstructured (images, text, audio) — see [[Neural Network]]
- **Naive Bayes:** a simple probabilistic classifier assuming feature independence given the class; surprisingly effective and fast for text classification despite the independence assumption rarely holding exactly

## Evaluation Metrics
- **Regression:** mean squared error (penalizes large errors heavily), mean absolute error (robust to outliers), R-squared (proportion of variance explained)
- **Classification:** accuracy (fine for balanced classes, misleading otherwise), [[Precision, Recall, and F1 Score]] (needed under class imbalance or asymmetric error costs), ROC-AUC (threshold-independent measure of separability)
- **Confusion matrix:** the full breakdown of true/false positives and negatives that every classification metric above is computed from — see [[Confusion Matrix]] — worth inspecting directly, not just its summary statistics
- Picking the wrong metric is a silent failure mode: optimizing for accuracy on a 95%-negative fraud dataset can produce a model that never predicts fraud and still scores 95%
- **Calibration:** a well-calibrated classifier's predicted probabilities match observed frequencies (a 0.7 prediction should be right about 70% of the time) — important whenever downstream decisions rely on the probability value itself, not just the predicted class

## Comparison

| Paradigm | Needs labels? | Typical output | Example task |
|---|---|---|---|
| Supervised Learning | Yes | Prediction matching a known target | Spam detection, price prediction |
| Unsupervised Learning | No | Discovered structure | Customer segmentation |
| Reinforcement Learning | No (uses reward instead) | Action policy | Game playing, robotics |
| Self-Supervised Learning | Auto-generated from data | Learned representation | Pretraining language models |

Note that these paradigms are increasingly combined rather than chosen exclusively — a typical modern LLM pipeline pretrains self-supervised on unlabeled text, then applies supervised fine-tuning, then RLHF on top.

## Code Example
A minimal supervised classification pipeline using scikit-learn:

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# X = features, y = labels
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = RandomForestClassifier(n_estimators=200, max_depth=10)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
```

## Real-World Example
- **Credit scoring:** banks train supervised models on historical loan outcomes (repaid vs. defaulted) to predict default risk on new applicants, typically favoring interpretable models like logistic regression or shallow trees for regulatory reasons
- **Medical diagnosis support:** CNNs trained on labeled X-rays or scans (confirmed diagnosis as the label) flag likely findings for a radiologist to review, functioning as a second reader rather than a replacement
- **Demand forecasting:** retailers train regression models on historical sales, price, and seasonality data to predict next week's demand per product per store, directly driving inventory decisions
- **Search ranking:** search engines train supervised ranking models on (query, document, relevance judgment) triples, where relevance is labeled by human raters or inferred from click data
- **Predictive maintenance:** manufacturers train models on labeled sensor readings (failure vs. no failure within N days) to flag equipment likely to fail soon, scheduling maintenance before an unplanned outage

## Best Practices
- Always hold out a test set that's touched exactly once, at the very end — repeatedly checking test performance while tuning turns it into a de facto validation set
- Stratify train/test splits on the label for classification tasks so class proportions stay consistent across splits
- Establish a trivial baseline first (majority-class predictor, simple linear model) — a fancy model that barely beats the baseline is a signal something's wrong, not a win
- Audit label quality before blaming the model architecture; a few percent of mislabeled examples can cap accuracy well below what a correct model could achieve
- Match the evaluation metric to the business problem — accuracy is often the wrong metric for imbalanced or asymmetric-cost problems
- Version datasets alongside model code so a reported metric can always be traced back to the exact data it was measured on
- Retrain and re-validate periodically once in production — the real-world input distribution drifts over time, and a model's original test-set performance stops being representative
- Keep a changelog of dataset versions, feature definitions, and model versions together, since debugging a production regression almost always requires reconstructing exactly what changed
- Prefer simpler, more interpretable models when performance is comparable — a random forest that's 1% less accurate than a neural network but far easier to debug and explain is often the better production choice

## FAQ
- **How much labeled data do I need?** It depends on task complexity and model capacity — a linear model might need hundreds of examples, a deep network from scratch typically needs tens of thousands to millions, though [[Transfer Learning]] can drastically cut that requirement
- **What if I only have a little labeled data?** Consider transfer learning, data augmentation, semi-supervised techniques (using a small labeled set plus a larger unlabeled set), or active learning to prioritize which examples to label next
- **Is supervised learning "solved"?** The optimization procedure is well understood, but getting clean, representative, sufficiently large labeled data for a specific real-world problem remains the hard, unsolved part in practice
- **Regression or classification — how do I choose?** Base it on the target variable's type: continuous numeric output (price, temperature) means regression; discrete category output (spam/not spam, species) means classification. Some problems can be framed either way (e.g., predicting a rating 1-5 as regression or as 5-class classification)
- **Why does my model do well on training data but poorly in production?** Almost always some combination of overfitting, training/production distribution mismatch, or data leakage during development that isn't present in the live pipeline
- **What's the fastest way to get a strong first result on a new tabular problem?** Clean the data, engineer a handful of obviously relevant features, and fit a gradient-boosted tree ensemble — it's the closest thing supervised learning has to a reliable default that performs well with minimal tuning

## Related Terms
- [[Unsupervised Learning]]
- [[Loss Function]]
- [[Overfitting vs Underfitting]]
- [[Gradient Descent]]
- [[Cross-Validation]]

## Example
Training a model on thousands of emails labeled "spam" or "not spam" so it can classify new incoming emails. During training, the model sees word patterns, sender metadata, and formatting cues associated with each label; once trained, it applies the same learned decision boundary to emails it has never seen, outputs a probability of "spam," and routes messages above a chosen threshold to the spam folder.
