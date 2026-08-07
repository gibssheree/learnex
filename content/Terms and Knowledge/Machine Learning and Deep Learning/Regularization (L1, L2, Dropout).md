---
tags: [term, ml, deep-learning]
category: Training Mechanics
---

# Regularization (L1, L2, Dropout)

**Definition:** Techniques that discourage a model from overfitting by constraining its complexity during training.

## How It Works
- L2 (weight decay): adds a penalty proportional to the square of the weights, pushing them toward small values
- L1 (Lasso): adds a penalty proportional to the absolute value of weights, encouraging some weights to become exactly zero (feature selection)
- Dropout (neural nets): randomly disables a fraction of neurons on each training step, forcing the network to not over-rely on any single path
- All regularization methods work by the same underlying principle — trading a small amount of training-set fit for a large gain in generalization, by discouraging the model from using its full capacity to memorize noise
- Regularization strength is itself a hyperparameter (commonly called `lambda`, `alpha`, or the dropout rate `p`) that needs tuning via [[Cross-Validation]] or a validation set, not guessed once and left alone
- Regularization and model capacity are two sides of the same coin — a heavily regularized large model and a lightly regularized small model can end up with similar effective complexity, but the former is usually easier to tune smoothly

## Under the Hood
- L2 modifies the loss function: `Loss = OriginalLoss + lambda * sum(w_i^2)` — during gradient descent this adds a term proportional to `-lambda * w` to every weight update, continuously shrinking weights toward zero at a rate proportional to their current magnitude (hence "weight decay")
- L1 modifies the loss function: `Loss = OriginalLoss + lambda * sum(|w_i|)` — its gradient contribution is a constant `lambda * sign(w)` regardless of the weight's magnitude, which is why it can push small weights all the way to exactly zero rather than just shrinking them
- This geometric difference is why L1 produces sparse solutions and L2 doesn't: visualize the penalty as a constraint region around the origin — L1's region is a diamond (corners on the axes), L2's is a circle. The loss function's contours are far more likely to first touch the diamond's corners (where a coordinate is exactly zero) than the circle's smooth boundary
- Dropout: during training, each neuron is independently zeroed out with probability `p` (commonly 0.2-0.5); the remaining active neurons' outputs are scaled by `1/(1-p)` ("inverted dropout") so the expected output magnitude matches what inference time will see, since dropout is turned off entirely at inference
- Dropout can be interpreted as training an exponential ensemble of thinner sub-networks that share weights, then approximately averaging their predictions at test time by using the full network with no dropout
- From a Bayesian perspective, L2 regularization corresponds to placing a Gaussian prior on the weights (large weights are a priori less likely), while L1 corresponds to a Laplace prior (which concentrates probability mass more sharply at exactly zero) — regularization strength `lambda` maps directly to how tight that prior is

## Variants
- **L1 (Lasso)** — sparsity-inducing, effectively performs feature selection by zeroing out irrelevant weights
- **L2 (Ridge / weight decay)** — shrinks all weights smoothly toward zero without eliminating any; the default choice in most deep learning optimizers
- **Elastic Net** — combines both: `Loss = OriginalLoss + lambda1 * sum(|w_i|) + lambda2 * sum(w_i^2)`, useful when features are correlated (L1 alone tends to arbitrarily pick one of a correlated group and zero the rest)
- **Dropout** — the standard stochastic regularizer for neural networks; variants include spatial dropout (zeroes entire feature-map channels in CNNs) and DropConnect (zeroes individual weights instead of whole neurons)
- **Early stopping** — halts training once validation loss stops improving, rather than penalizing the loss function directly; often described as an implicit regularizer since it limits how long the model has to fit training-set noise
- **Data augmentation** — not a loss penalty, but functions as regularization by artificially expanding the effective training set (crops, flips, noise, mixup) so the model can't simply memorize a fixed set of examples
- **Label smoothing** — softens hard 0/1 classification targets (e.g., to 0.9/0.1), discouraging the model from becoming overconfident and improving calibration
- **[[Batch Normalization]]** — primarily a training-stabilization technique, but its per-batch noise (statistics vary slightly batch to batch) has a mild regularizing side effect that's often noted as a bonus

## Why It Matters
- One of the most reliable, cheap ways to fight overfitting across both classical ML and deep learning
- L1 is also a practical feature-selection tool since it zeroes out unimportant weights, which is valuable when interpretability or a smaller deployed model matters
- Regularization is a direct lever on the [[Bias-Variance Tradeoff]] — increasing it trades variance reduction for a bit of added bias
- Without any regularization, sufficiently large models (especially deep networks with millions of parameters) will often memorize the training set almost perfectly, making regularization close to mandatory rather than optional at scale
- Different regularizers fail differently when misapplied, which is diagnostic information in itself — a model that underfits badly under heavy L2 but fine under moderate dropout tells you something about which weights were actually doing useful work

## Code Example
```python
import torch.nn as nn
import torch.optim as optim
from sklearn.linear_model import Lasso, Ridge, ElasticNet

# Classical ML: L1, L2, Elastic Net via scikit-learn
lasso = Lasso(alpha=0.1)          # L1
ridge = Ridge(alpha=0.1)          # L2
elastic = ElasticNet(alpha=0.1, l1_ratio=0.5)  # mix of both

# Deep learning: L2 via optimizer weight_decay, dropout via a layer
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 256)
        self.dropout = nn.Dropout(p=0.3)
        self.fc2 = nn.Linear(256, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)   # only active during model.train(), disabled in model.eval()
        return self.fc2(x)

model = Net()
optimizer = optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)  # L2 penalty

# early stopping sketch:
# best_val_loss = float("inf"); patience = 5; bad_epochs = 0
# if val_loss < best_val_loss: best_val_loss, bad_epochs = val_loss, 0
# else: bad_epochs += 1
# if bad_epochs >= patience: stop_training()
```

## Comparison
| Method | Effect on weights | Produces sparsity? | Typical use |
|---|---|---|---|
| L1 (Lasso) | Shrinks, many exactly to zero | Yes | Feature selection, interpretable linear models |
| L2 (Ridge) | Shrinks smoothly, rarely to zero | No | Default choice, correlated features, deep nets |
| Elastic Net | Combination of both | Partial | Correlated features + need for some sparsity |
| Dropout | N/A (structural, not a weight penalty) | No | Neural networks, especially fully-connected layers |
| Early stopping | N/A (limits training time, not weights) | No | Any model, essentially free to add |

## Real-World Example
- A genomics model with 20,000 candidate gene-expression features and only a few hundred patient samples uses L1 regularization to automatically select the handful of genes that actually predict the outcome, both improving generalization and producing an interpretable result for researchers
- Large computer vision models (ResNet, EfficientNet, etc.) routinely combine L2 weight decay, dropout in the fully-connected head, and heavy data augmentation simultaneously — no single regularizer is sufficient on its own at that scale
- A credit-scoring model at a bank might favor Elastic Net over pure L1 specifically because financial features (income, debt, credit history length) are highly correlated, and pure L1 would arbitrarily discard some of them in a way that's hard to justify to regulators

## Common Pitfalls
- Over-regularizing, which pushes a good-fitting model into underfitting — always verify with a validation curve, not intuition
- Using dropout at inference/test time by mistake — it should only be active during training; forgetting `model.eval()` in PyTorch (or an equivalent flag) silently degrades predictions with random noise
- Applying the same L2 weight decay value across wildly different-scale layers (e.g., embeddings vs. output heads) without considering that some parameters may need different treatment
- Regularizing bias terms the same as weights — biases don't contribute to overfitting the way weights do, and most frameworks exclude them from weight decay by default, but custom implementations sometimes forget this
- Combining multiple aggressive regularizers (heavy dropout + heavy weight decay + small model) and being confused when the model underfits
- Applying L1 to features that are on very different scales without standardizing first — the penalty's effect on each weight becomes scale-dependent

## Best Practices
- Start with a small amount of L2 regularization (weight decay) as a default in deep learning, then tune from there
- Use dropout rates between 0.2-0.5 for fully-connected layers; lower rates (or none) for convolutional layers, which already have relatively few parameters and benefit less
- Combine early stopping with a validation set as a nearly-free additional regularizer alongside whatever else you're using
- Standardize/scale features before applying L1 or L2 penalties in classical ML — unscaled features distort how the penalty affects each coefficient
- Tune regularization strength on a log scale (e.g., 1e-5, 1e-4, 1e-3, 1e-2) via [[Cross-Validation]] rather than linear steps
- Re-tune regularization strength whenever you meaningfully change model size or dataset size — the right amount of regularization is a moving target, not a fixed constant

## FAQ
**Q: Should I use L1 or L2?**
Use L2 by default. Use L1 (or Elastic Net) specifically when you want automatic feature selection or a sparser, more interpretable model.

**Q: Can I use dropout and L2 weight decay together?**
Yes, commonly done — they attack overfitting through different mechanisms (structural noise vs. weight-magnitude penalty) and often combine well, though the total regularization strength needs re-tuning as a pair, not independently.

**Q: Why does dropout hurt training accuracy?**
That's expected — dropout deliberately makes training harder by removing information the network could otherwise rely on, which is exactly what improves its validation/test performance.

## Common Interview Questions
**Q: Why does L1 regularization produce sparse solutions while L2 doesn't?**
Geometrically, L1's constraint region has corners on the coordinate axes where one or more weights are exactly zero, and the loss function's contours tend to intersect there first. L2's constraint region is smooth (a sphere/circle), so the intersection point is essentially never exactly on an axis, giving small but nonzero weights instead.

**Q: What happens if you set the dropout rate to 1.0?**
Every neuron in that layer gets zeroed out on every forward pass, meaning no information flows through it and the layer effectively outputs nothing — the model can't learn anything useful through that path.

**Q: Why is regularization strength usually tuned on a log scale rather than a linear one?**
Regularization effects tend to change multiplicatively rather than additively — the difference between lambda=0.001 and lambda=0.01 is often as significant as the difference between 0.01 and 0.1. A log-scale sweep samples this range far more efficiently than a linear one.

**Q: Why does Elastic Net sometimes outperform both pure L1 and pure L2?**
When features are correlated, pure L1 tends to arbitrarily keep one feature from a correlated group and zero out the rest, which can be unstable — a slightly different training sample might lead it to keep a different feature from that group. Elastic Net's L2 component encourages correlated features to be kept or shrunk together, giving more stable, reproducible feature selection while still retaining some sparsity from the L1 component.

**Q: Is early stopping a form of regularization even though it doesn't touch the loss function?**
Yes — it constrains how far the optimization process is allowed to travel through weight space, which limits effective model complexity just as directly as a penalty term does, even though the mechanism (limiting training time) is different from a penalty (limiting weight magnitude).

## History
- Ridge regression (L2) was introduced by Hoerl and Kennard in 1970 as a fix for numerically unstable linear regression coefficients when predictors are correlated — the "ridge" name refers to adding a small constant along the diagonal ridge of the design matrix
- Lasso (L1) was introduced by Robert Tibshirani in 1996, explicitly framed around the sparsity benefit — automatically selecting a subset of relevant predictors, which ridge regression could not do
- Elastic Net was introduced by Zou and Hastie in 2005 specifically to address Lasso's poor behavior with groups of highly correlated features
- Dropout was introduced by Srivastava, Hinton, and colleagues in 2014, motivated by an analogy to sexual reproduction in evolutionary biology — the idea that mixing in unpredictable, random contributions from each parent (in this case, each subset of neurons) prevents co-adapted, overly specialized combinations from becoming fragile single points of failure

## Deeper Dive: Why Weight Decay Isn't Quite the Same as L2 in Adaptive Optimizers
- In plain SGD, adding an L2 penalty to the loss and directly shrinking weights by a fixed decay factor each step ("weight decay") are mathematically equivalent
- In adaptive optimizers like Adam, they are not equivalent — Adam rescales gradients per-parameter based on their historical magnitude, which also rescales the L2 penalty's gradient contribution in an unintended, parameter-dependent way
- AdamW (a widely-used variant) fixes this by applying weight decay directly to the weights outside of the adaptive gradient rescaling step, decoupling it from the loss-gradient interaction — this is why modern deep learning code almost always uses AdamW's `weight_decay` rather than adding an L2 term manually to the loss when training with Adam-family optimizers

## Related Terms
- [[Overfitting vs Underfitting]]
- [[Bias-Variance Tradeoff]]
- [[Cross-Validation]]
- [[Hyperparameter Tuning]]
- [[Neural Network]]
- [[Loss Function]]
- [[Gradient Descent]]
- [[Feature Engineering]]

## Example
Adding dropout of 0.3 to a neural network's hidden layer randomly zeroes 30% of its neurons each training step, preventing co-dependency. Meanwhile, a linear regression predicting house prices from 50 correlated features (square footage, number of rooms, lot size, etc.) can use L1 regularization to automatically zero out 30 redundant or noisy features, leaving a simpler, more interpretable model built from the 20 that actually matter — something L2 alone would never do, since it shrinks all 50 toward zero without eliminating any. A production system might use both techniques in the same pipeline: L1 during an initial feature-selection pass on a linear baseline, then dropout inside the deep network that eventually replaces it.
