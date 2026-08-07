---
tags: [term, ml]
category: Core ML Concepts
---

# Feature Engineering

**Definition:** The process of selecting, transforming, or creating input variables (features) to improve a model's ability to learn patterns.

## How It Works
- Transform raw data into more informative representations: normalization/scaling, encoding categories, extracting date parts, combining columns, binning continuous values
- Domain knowledge often drives which features will actually help (e.g., "day of week" for retail sales, "debt-to-income ratio" for credit risk rather than raw debt and income separately)
- Feature creation ranges from simple arithmetic (ratios, differences, sums) to aggregations (rolling averages, group-by statistics like "average purchase per customer") to domain-specific transforms (Fourier features for periodicity, log transforms for skewed distributions)
- Feature selection narrows down which engineered and raw features actually make it into the model, using statistical tests, model-based importance scores, or iterative elimination
- The process is iterative, not one-shot: engineer a candidate feature, validate its contribution, keep or discard it, and repeat — rarely does the first pass of feature ideas produce the final feature set
- Different model families reward different kinds of feature engineering — linear models need explicit interactions and transforms spelled out, while tree-based models can approximate some nonlinearities and interactions on their own given enough splits

## Types of Feature Engineering
- **Numerical transforms**: scaling (standardization, min-max), log/Box-Cox transforms for skewed data, polynomial features, binning/discretization
- **Categorical encoding**: one-hot encoding (safe default for low-cardinality features), ordinal encoding (when categories have true order), target encoding (replace category with its mean target value — powerful but leakage-prone), frequency encoding (replace category with its occurrence count or rate), embedding layers (learned dense representations for high-cardinality categories in neural nets)
- **Temporal features**: extracting hour/day/week/month/is_holiday from timestamps, lag features (yesterday's value as a feature for today), rolling window statistics (7-day moving average)
- **Text features**: bag-of-words/TF-IDF counts, n-grams, sentence/word embeddings — largely superseded by learned representations in deep learning pipelines but still competitive for smaller tabular-adjacent text tasks
- **Interaction features**: multiplying or combining two features that are more informative together than apart (e.g., "price per square foot" from price and area)
- **Aggregation features**: group-level statistics joined back onto each row (e.g., "average order value for this customer" attached to every one of that customer's transactions)
- **Dimensionality reduction as feature engineering**: PCA components, autoencoder bottleneck activations (see [[Autoencoder]]), or clustering assignments can themselves become new, denser input features for a downstream model
- **Geospatial features**: distance to nearest point of interest, geohash bucketing, latitude/longitude interactions — common in logistics, real estate, and retail site-selection models
- **Domain-specific transforms**: RFM scores (recency, frequency, monetary value) in marketing analytics, technical indicators (moving averages, RSI) in financial time series, and n-gram/character-level features in specialized text tasks

## Feature Selection Methods
| Method type | Examples | How it decides | Tradeoff |
|---|---|---|---|
| Filter | Correlation, chi-squared, mutual information | Scores each feature independently of any model | Fast, but ignores feature interactions |
| Wrapper | Recursive Feature Elimination (RFE), forward/backward selection | Repeatedly trains a model with different feature subsets | Accounts for interactions, but computationally expensive |
| Embedded | L1 (Lasso) regularization, tree-based feature importance | Selection happens as part of model training itself | Efficient, tied to one specific model's biases |

## Under the Hood
- Why scaling matters: gradient-based models (linear/logistic regression, neural networks) converge faster and more reliably when features share a similar scale, since a poorly-scaled feature can dominate the loss surface and distort the effective learning rate per dimension — see [[Gradient Descent]]
- Tree-based models (Random Forest, XGBoost) are invariant to monotonic transforms of individual features (scaling, log transform) because splits only depend on relative ordering — but they still benefit from good interaction/ratio features, since a tree needs many splits to approximate a ratio that a single engineered feature captures directly
- Polynomial and interaction feature expansion grows combinatorially with the number of input features (degree-2 expansion of n features produces roughly n^2/2 new columns), so it's typically only applied to a small, curated subset of features rather than an entire wide dataset
- Target encoding must be computed out-of-fold (using cross-validation internally) — encoding a category with statistics that include its own label leaks the target directly into the feature
- High-cardinality categorical features (e.g., zip code, user ID) blow up one-hot encoding's dimensionality; target encoding, hashing, or learned embeddings handle this more gracefully
- Feature importance from tree ensembles (split count, gain, permutation importance) is a practical way to prune engineered features that don't earn their complexity — but importance scores are unreliable when features are highly correlated, since importance gets split between them
- Multicollinearity (two or more features carrying largely redundant information) inflates the variance of linear model coefficients and makes them unstable/hard to interpret, even though it often doesn't hurt pure predictive accuracy much — checked via correlation matrices or variance inflation factor (VIF)
- Missing values themselves can be informative — creating a binary "was_missing" indicator feature alongside an imputed value often outperforms imputation alone, since the fact that a value was missing (e.g., "income not reported") can correlate with the target

## Code Example
```python
import pandas as pd
import numpy as np

df["hour"] = df["timestamp"].dt.hour
df["day_of_week"] = df["timestamp"].dt.dayofweek
df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)

# Ratio feature — often more predictive than either raw column alone
df["price_per_sqft"] = df["price"] / df["sqft"].replace(0, np.nan)

# Rolling aggregation per user (careful: sort by time first to avoid leakage)
df = df.sort_values(["user_id", "timestamp"])
df["rolling_avg_7"] = (
    df.groupby("user_id")["purchase_amount"]
    .transform(lambda s: s.rolling(7, min_periods=1).mean())
)

# Log transform for a right-skewed numeric feature
df["log_income"] = np.log1p(df["income"])

# Missing-value indicator — sometimes more informative than the imputed value itself
df["income_was_missing"] = df["income"].isna().astype(int)
df["income"] = df["income"].fillna(df["income"].median())
```

## Real-World Applications
- Credit risk modeling — engineered ratios (debt-to-income, credit utilization) are often more predictive than the raw financial figures they're derived from, and are standard in industry scorecards
- E-commerce recommendation and search ranking — user/item interaction counts, recency-weighted purchase history, and session-level aggregates drive most of the signal in ranking models
- Fraud detection — velocity features ("number of transactions in the last 10 minutes," "distance between consecutive login locations") catch patterns no single raw field would expose
- Demand forecasting — lag features, rolling averages, and holiday/seasonality indicators are the backbone of most retail and supply-chain forecasting pipelines
- Healthcare risk scoring — combining lab results into clinically-meaningful ratios (e.g., BUN/creatinine ratio) mirrors how domain experts already reason about the data
- Marketing attribution — time-since-last-touch, channel-interaction counts, and campaign-overlap indicators engineered from raw event logs

## Why It Matters
- Historically the single biggest lever for classical ML model performance, before deep learning's automatic feature learning shifted that burden onto convolutional/attention layers for images and text
- Still critical for tabular data problems — deep learning hasn't fully displaced feature engineering there, and gradient-boosted trees with well-engineered features frequently beat neural networks on structured data (see [[Ensemble Methods]])
- Good features can let a simple model (linear regression) outperform a complex model (deep network) trained on raw, unprocessed inputs — model complexity is not a substitute for informative inputs
- Directly shapes what the model can possibly learn: a pattern that exists in the raw data but isn't exposed by any feature or feature combination is invisible to the model no matter how sophisticated the algorithm
- Well-engineered features often make models more interpretable, since a feature like "debt-to-income ratio" is directly meaningful to a domain expert in a way that raw, uninterpreted model weights over many correlated columns are not
- Reduces the amount of data required to reach a given accuracy level — a model given the right ratio or interaction directly needs far fewer examples to learn the relationship than one forced to approximate it from raw components

## Common Pitfalls
- Leaking target information into a feature (e.g., using a column only known after the outcome occurs, or computing target encoding without out-of-fold protection)
- Over-engineering hundreds of features without validating each one actually helps — more features without more data raises the risk of the model fitting noise (see [[Overfitting vs Underfitting]]), and slows training/inference
- Fitting scalers, imputers, or encoders on the full dataset (including validation/test data) before splitting — see the leakage pitfalls in [[Cross-Validation]]
- Creating rolling/lag features without sorting by time first, silently mixing future information into past rows
- Blindly one-hot encoding very high-cardinality categoricals, producing a huge sparse matrix that slows training and dilutes signal per column
- Assuming feature engineering effort is wasted once you switch to deep learning — even neural networks benefit from good feature framing (e.g., cyclical encoding of hour-of-day via sine/cosine instead of a raw 0-23 integer, which falsely implies hour 23 and hour 0 are far apart)
- Silently dropping rows with missing values instead of engineering an explicit missingness indicator, which can throw away a real signal and shrink the effective training set
- Computing aggregation features (like "average purchase per customer") using the entire dataset including future transactions relative to each row, leaking information from a customer's future behavior into a feature meant to predict that same behavior
- Applying the same scaler/encoder fit at training time to production data that has drifted (new categories appearing, feature distributions shifting), producing silently degraded features instead of an explicit error
- Treating engineered features as permanent — a ratio or aggregate that was predictive under one business process can lose meaning entirely after a process change (e.g., a pricing algorithm update), quietly degrading model performance

## Best Practices
- Always fit any preprocessing step (scaler, encoder, imputer) only on training data, then apply it unchanged to validation/test data
- Prefer domain-informed features over blind polynomial/interaction expansion — a targeted ratio feature usually beats 50 auto-generated interaction terms
- Validate each new feature's contribution with cross-validation, not just training-set fit
- Encode cyclical features (hour, day of week, month) with sine/cosine pairs so the model sees their circular structure instead of a false discontinuity
- Keep a feature's raw and engineered forms both available during experimentation, then prune with importance scores or ablation once you know what helps
- Document each engineered feature's derivation (what raw columns it uses, what point in time it's computed relative to) so leakage bugs are easier to audit later
- Build feature pipelines as reusable, versioned code (not one-off notebook cells) so training and serving compute features identically — a common source of production bugs is a feature computed one way at training time and a subtly different way at inference time ("training-serving skew")
- Use a feature store or equivalent shared computation layer in production systems so the same feature definition genuinely serves both offline training and online inference
- Monitor engineered feature distributions in production over time — a ratio feature whose denominator trends toward zero, or a category encoding facing unseen categories, are common silent failure modes

## FAQ
- **Is feature engineering still relevant with deep learning?** Yes for tabular/structured data — CNNs and transformers learn features automatically from images/text/audio, but dense tabular data with heterogeneous, low-dimensional columns doesn't have the same spatial/sequential structure for a network to exploit automatically.
- **What's the difference between feature engineering and feature selection?** Engineering creates new features from existing data; selection decides which features (raw and engineered) actually go into the final model.
- **When is target encoding safe to use?** Only when computed within a cross-validation loop (out-of-fold) or with heavy smoothing/regularization toward the global mean — naive target encoding on the full training set is one of the most common leakage bugs in practice.
- **Should I always create as many features as possible and let the model figure out what's useful?** No — more features without more data raises overfitting risk and slows training; feature selection and validated iteration usually beat brute-force feature explosion, especially for linear models.
- **What's "training-serving skew" and why does it matter for feature engineering?** It's when the feature computation logic differs between training (often batch, using historical data) and serving (often real-time, using live data) — even small discrepancies can silently degrade production accuracy without triggering any obvious error.
- **Should categorical features with a natural order (e.g., "low," "medium," "high") be one-hot or ordinal encoded?** Ordinal encoding is usually more appropriate and more efficient when there's a genuine order, since it preserves that ordering as a single numeric feature instead of discarding it across several independent binary columns.
- **How do you engineer features for a model that will run on-device with strict latency constraints?** Favor features that are cheap to compute at inference time (simple lookups, precomputed aggregates refreshed on a schedule) over ones requiring expensive real-time joins or large rolling-window computations.

## Related Terms
- [[Supervised Learning]]
- [[Cross-Validation]]
- [[Overfitting vs Underfitting]]
- [[Ensemble Methods]]
- [[Gradient Descent]]
- [[Autoencoder]]
- [[Regularization (L1, L2, Dropout)]]
- [[Unsupervised Learning]]
- [[Hyperparameter Tuning]]

## Example
Turning a raw timestamp column into "hour of day," "day of week," and "is_weekend" features to help a model detect usage patterns. A raw Unix timestamp like `1706227200` is nearly useless to a linear model — it can only learn a single global trend against it. Decomposed into `hour=14`, `day_of_week=2`, `is_weekend=0`, the same model can now learn that traffic spikes every weekday afternoon, a pattern it had no way to represent from the raw integer. Going further, encoding `hour` as `sin(2*pi*hour/24)` and `cos(2*pi*hour/24)` fixes the false discontinuity between hour 23 and hour 0 that a plain integer feature would otherwise impose on the model.

A second example from credit risk: a raw dataset might have `monthly_debt_payments` and `monthly_income` as two separate columns. Neither column alone is very predictive of default risk — someone with $5,000 in debt payments could be low-risk if they earn $50,000/month, or high-risk if they earn $6,000/month. Engineering a single `debt_to_income_ratio = monthly_debt_payments / monthly_income` feature collapses that two-dimensional relationship into one number that's far more directly predictive, and it's exactly the kind of feature a linear model can't discover on its own from the two raw columns without an explicit multiplicative or divisive interaction term supplied to it.

## Common Interview Questions
- Explain the difference between one-hot encoding and target encoding, and when each is appropriate.
- How would you detect and prevent target leakage in a feature you've engineered?
- Walk through how you'd build lag/rolling features for a time-series model without introducing leakage.
- Why might a tree-based model need fewer engineered interaction features than a linear model?
- How do you handle a categorical feature with 50,000 unique values (e.g., user ID)?
