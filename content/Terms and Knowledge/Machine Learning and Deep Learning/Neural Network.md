---
tags: [term, deep-learning]
category: Neural Network Architectures
---

# Neural Network

**Definition:** A model made of layers of interconnected nodes ("neurons") that transform input data through weighted connections and nonlinear activation functions to learn complex patterns.

## How It Works
- Input layer receives features, hidden layers transform them via weights + activation functions, output layer produces the prediction
- Each connection has a learnable weight; training (via backpropagation + gradient descent) adjusts these weights to reduce loss
- Stacking more layers ("deep" learning) lets the network learn increasingly abstract representations — early layers detect edges/simple patterns, later layers combine them into higher-level concepts
- Every neuron computes a weighted sum of its inputs plus a bias term, then passes the result through a nonlinear activation function before forwarding it to the next layer
- Training alternates two passes: a forward pass that produces a prediction and a loss value, and a backward pass that computes gradients of that loss with respect to every weight and updates them
- A batch of examples (not just one) is typically passed through at once — this "mini-batch" approach smooths out noisy gradient estimates while still updating weights far more often than processing the entire dataset per step

## Under the Hood
- A single neuron computes `z = w1*x1 + w2*x2 + ... + wn*xn + b`, then applies an activation `a = f(z)` — common choices are ReLU, sigmoid, tanh, or GELU
- A full layer is just this computation vectorized: `Z = W @ X + b`, where `W` is a weight matrix and `X` is the batch of input vectors — this is why GPUs (built for matrix multiplication) accelerate neural nets so well
- The network as a whole is a composed function: `y_hat = f_L(W_L * f_{L-1}(... f_1(W_1*x + b_1) ...) + b_L)` — depth is literally function composition
- Parameter count grows fast: a single dense layer mapping 784 inputs to 256 outputs already has `784 * 256 + 256 = 200,960` learnable parameters
- [[Backpropagation]] computes gradients efficiently via the chain rule, propagating the error signal from the output layer back to the input layer in a single backward pass, reusing intermediate computations rather than recomputing derivatives layer by layer from scratch
- The loss surface of a deep network is highly non-convex, with many local minima and saddle points — in practice, stochastic optimizers like Adam or SGD with momentum still reliably find "good enough" minima that generalize well, which is one of deep learning's more empirically-surprising properties

## Types
- **Feedforward (MLP)** — information flows strictly forward, no loops; good for tabular data and as the "head" on top of other architectures
- **[[Convolutional Neural Network (CNN)]]** — shares weights across spatial locations via convolution kernels; the default for images and grids
- **[[Recurrent Neural Network (RNN)]] / [[LSTM (Long Short-Term Memory)]]** — shares weights across time steps and maintains a hidden state; built for sequences
- **Transformer** — replaces recurrence with self-attention, letting every position attend to every other position directly; now dominant for text, and increasingly vision and audio
- **[[Autoencoder]]** — trained to reconstruct its own input through a compressed bottleneck, useful for dimensionality reduction and anomaly detection
- **[[GAN (Generative Adversarial Network)]]** — two networks (generator, discriminator) trained adversarially against each other

## Why It Matters
- The foundational architecture behind virtually all modern AI breakthroughs — CNNs, RNNs, and transformers are all neural networks with specialized structure
- Universal approximation theorem: a network with even a single sufficiently wide hidden layer can in theory approximate any continuous function on a bounded domain — depth is what makes this practical rather than just theoretical, since deep narrow networks approximate complex functions with far fewer total parameters than shallow wide ones
- Differentiable end-to-end: because every operation in the network is differentiable, the whole pipeline — feature extraction included — can be learned jointly instead of hand-engineered
- Representation learning: rather than hand-crafting features (edges, corners, word frequencies), the network discovers its own internal representations directly from raw data, which is why deep learning displaced most classical feature-engineering pipelines in vision and NLP
- Transfer learning depends on this property directly — a network's early/middle layers learn broadly reusable representations that can be repurposed for a new task with far less data than training from scratch, see [[Transfer Learning]]

## Code Example
```python
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self, in_features=784, hidden=128, out_classes=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.ReLU(),
            nn.Linear(hidden, hidden),
            nn.ReLU(),
            nn.Linear(hidden, out_classes),
        )

    def forward(self, x):
        return self.net(x)  # raw logits; apply softmax/CrossEntropyLoss externally

model = SimpleNet()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

# one training step
logits = model(batch_x)
loss = loss_fn(logits, batch_y)
loss.backward()
optimizer.step()
optimizer.zero_grad()
```

## Comparison
| Architecture | Weight sharing | Best for | Struggles with |
|---|---|---|---|
| Feedforward (MLP) | None | Tabular data, small fixed-size inputs | Images, sequences, high-dim raw data |
| CNN | Spatial (kernel slides across input) | Images, grids, local patterns | Long-range/global dependencies |
| RNN/LSTM | Temporal (same weights per step) | Sequences, time series | Long sequences, parallelization |
| Transformer | None (attention is dynamic, not shared weights) | Text, long-range dependencies, large-scale pretraining | Compute/memory cost on very long sequences |

## Real-World Example
- **Image recognition** — a CNN like ResNet classifies photos into thousands of categories by learning hierarchical filters: edges in early layers, textures and shapes in middle layers, whole objects in later layers
- **Machine translation** — transformer-based encoder-decoder networks map a sentence in one language to another, attending over the entire source sentence at each output step
- **Recommendation systems** — embedding layers (a specialized neural network component) learn dense vector representations of users and items, so that similarity in that vector space predicts likely engagement
- **Speech recognition** — networks combining convolutional and recurrent (or transformer) layers convert raw audio waveforms into text transcriptions
- **Game-playing agents** — AlphaGo and its successors pair a neural network (evaluating board positions and candidate moves) with tree search, trained via [[Reinforcement Learning]] against itself

## Deeper Dive: Why Depth Helps
- Each layer can be thought of as re-representing the input in a new coordinate space — a shallow network has to carve up the input space with a limited number of decision boundaries in one shot, while a deep network builds up complex boundaries incrementally, layer by layer
- Empirically, doubling depth tends to be more parameter-efficient than doubling width for most vision and language tasks, though very deep networks need architectural help (residual/skip connections, normalization layers) to remain trainable
- Depth also enables hierarchical feature reuse — a CNN's later layers combine early-layer edge detectors in different arrangements to detect eyes, wheels, or text, without re-learning "what an edge is" from scratch at every layer

## Common Pitfalls
- Assuming bigger networks are automatically better — they need proportionally more data and compute, or they overfit
- Skipping activation functions between layers, which collapses the whole network into a single linear transformation no matter how many layers you stack
- Initializing all weights to zero (or the same value) — every neuron in a layer then computes identical gradients and the network never breaks symmetry
- Ignoring input scaling/normalization — features on wildly different scales slow convergence and can destabilize training
- Choosing a learning rate without a schedule or warmup for deep networks, causing early divergence
- Treating architecture choice as more important than data quality — a mediocre architecture with clean, plentiful data usually beats a state-of-the-art architecture trained on noisy or scarce data

## Best Practices
- Normalize or standardize inputs before feeding them into the network
- Use He initialization with ReLU-family activations, Xavier/Glorot with tanh/sigmoid — matching init to activation prevents vanishing/exploding activations at the start of training
- Add [[Batch Normalization]] or layer normalization in deeper networks to stabilize and speed up training
- Start with a known-good architecture and optimizer (Adam, lr around 1e-3) before customizing
- Monitor train vs validation loss every epoch to catch [[Overfitting vs Underfitting]] early
- Checkpoint model weights periodically during long training runs so a crash or a bad late-stage update doesn't destroy hours of progress
- Version both the code and the exact data/preprocessing used for a trained model — reproducing a specific network's behavior later requires both

## History
- Perceptron (1958, Rosenblatt) — single-layer, could only learn linearly separable functions, which stalled research after Minsky and Papert's 1969 critique
- Backpropagation popularized for multi-layer networks in 1986 (Rumelhart, Hinton, Williams), enabling training of deeper models
- 1990s-2000s "AI winter" for neural nets specifically — support vector machines and other classical methods often outperformed neural nets given the data and compute available at the time
- Deep learning's modern resurgence began around 2012 with AlexNet's ImageNet win, driven by GPU compute, large labeled datasets, and ReLU activations replacing sigmoid/tanh
- "Attention Is All You Need" (2017) introduced the transformer, eventually displacing RNNs as the default architecture for sequence tasks and later much of vision and audio too

## FAQ
**Q: How many layers make a network "deep"?**
No strict cutoff — informally, more than one hidden layer counts as deep. Modern networks routinely use dozens to hundreds of layers.

**Q: Why not just use one giant hidden layer instead of many small ones?**
A single wide layer can approximate the same functions in theory but typically needs exponentially more neurons than a deep, narrow stack to represent the same function.

**Q: Do neural networks need labeled data?**
Not necessarily — [[Supervised Learning]] uses labels, but the same architectures train under [[Unsupervised Learning]] (autoencoders) and [[Reinforcement Learning]] (policy/value networks).

## Common Interview Questions
**Q: Why do we need non-linear activation functions?**
Without them, any stack of linear layers collapses algebraically into a single linear transformation, so the network could only ever learn linear decision boundaries regardless of depth.

**Q: What's the difference between a parameter and a hyperparameter?**
Parameters (weights, biases) are learned automatically from data during training. Hyperparameters (learning rate, layer count, batch size) are set by the practitioner before training starts and control how learning happens.

**Q: What happens if you remove all the biases from a network?**
Every neuron's output is forced to pass through the origin when inputs are zero, which restricts the family of functions the network can represent and typically hurts fit quality, especially in shallow networks.

**Q: What's the difference between a neuron's "weights" and its "activation"?**
Weights are the learned numbers that scale each input signal; activation is the output value produced after summing the weighted inputs and passing the result through a nonlinear function. Weights are fixed after training (until fine-tuned); activations change with every new input.

**Q: Why do deep networks sometimes train worse than shallower ones, despite having more capacity?**
Naively stacking many layers can cause vanishing or exploding gradients, making early layers train slowly or unstably. Techniques like residual connections (skip connections), batch normalization, and careful initialization specifically exist to make very deep networks trainable at all.

## Related Terms
- [[Backpropagation]]
- [[Activation Function]]
- [[Convolutional Neural Network (CNN)]]
- [[Recurrent Neural Network (RNN)]]
- [[Gradient Descent]]
- [[Vanishing-Exploding Gradient]]
- [[Loss Function]]
- [[Epoch, Batch, and Iteration]]
- [[Hyperparameter Tuning]]
- [[Regularization (L1, L2, Dropout)]]

## Example
A simple network with one hidden layer can learn to classify handwritten digits (0-9) from pixel values, given enough labeled examples. Feed it a 28x28 grayscale image (784 pixel values flattened into a vector), pass it through a hidden layer of, say, 128 neurons with ReLU activation, then an output layer of 10 neurons (one per digit) with softmax — the network outputs a probability distribution over the 10 possible digits, and training adjusts its ~100K+ weights until those probabilities line up with the correct labels across thousands of examples. Run the same trained network on a digit it has never seen before, written in an unfamiliar handwriting style, and it generalizes because it learned patterns like "loops and curves in this arrangement" rather than memorizing exact pixel layouts.

This same basic recipe — flatten or embed the input, pass it through learned linear transformations and nonlinearities, compare the output to a target, and adjust weights to reduce the error — scales up essentially unchanged from this 100K-parameter digit classifier to a large language model with hundreds of billions of parameters. What changes between them is architecture (dense layers vs. attention vs. convolution), scale, and training data — not the core mechanism.
