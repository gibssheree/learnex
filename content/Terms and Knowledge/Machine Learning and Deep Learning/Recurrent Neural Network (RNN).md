---
tags: [term, deep-learning, nlp]
category: Neural Network Architectures
---

# Recurrent Neural Network (RNN)

**Definition:** A neural network architecture designed for sequential data, where the network maintains a "hidden state" that carries information from previous steps forward through the sequence.

## How It Works
- Processes input one step at a time (e.g., one word at a time), updating a hidden state that summarizes everything seen so far
- The same weights are reused at every time step, unlike a plain feedforward network — this weight sharing is what lets an RNN handle sequences of arbitrary length with a fixed number of parameters
- At each step, the hidden state is combined with the new input to produce the next hidden state, and optionally an output at that step
- Training uses backpropagation through time (BPTT) — the network is conceptually "unrolled" into one layer per time step, and gradients flow backward through the entire unrolled chain
- Can run in several modes depending on the task: one-to-many (image captioning), many-to-one (sentiment classification), or many-to-many (translation, tagging)
- Teacher forcing is a common training trick for sequence generation tasks — during training, the decoder is fed the true previous token rather than its own (possibly wrong) prediction, which speeds up convergence but creates a train/inference mismatch that has to be managed carefully (e.g., via scheduled sampling)
- The hidden state has a fixed size regardless of how long the sequence gets — this is both the architecture's core strength (constant memory footprint) and its core weakness (a long sequence has to be compressed into that same fixed-size vector)

## Under the Hood
- The core recurrence: `h_t = tanh(W_hh @ h_{t-1} + W_xh @ x_t + b_h)` — the new hidden state `h_t` is a function of the previous hidden state `h_{t-1}` and the current input `x_t`
- If there's a per-step output: `y_t = W_hy @ h_t + b_y`
- `W_hh`, `W_xh`, `W_hy` are the same three weight matrices reused at every single time step — this is the "recurrence"
- BPTT computes the gradient of the loss with respect to each weight by summing contributions across every time step, which means the same gradient term gets multiplied by `W_hh` repeatedly — over long sequences this product either shrinks toward zero (vanishing gradient) or grows unbounded (exploding gradient), see [[Vanishing-Exploding Gradient]]
- Exploding gradients are typically handled with gradient clipping (capping the gradient norm); vanishing gradients are the deeper structural problem that motivated LSTM and GRU designs with gating mechanisms
- Weight initialization matters more for RNNs than for feedforward networks specifically because the same weight matrix `W_hh` is applied repeatedly — even a mild deviation from well-scaled initialization compounds across time steps in a way it wouldn't across independently-initialized feedforward layers
- An LSTM cell replaces the single `tanh` update with a cell state `c_t` and three sigmoid gates: forget gate `f_t = sigma(W_f @ [h_{t-1}, x_t] + b_f)` decides what to discard, input gate `i_t` decides what to add, output gate `o_t` decides what to expose — the cell state update `c_t = f_t * c_t-1 + i_t * candidate` avoids the repeated multiplication through `tanh` derivatives that causes vanishing gradients in vanilla RNNs

## Types
- **Vanilla/Simple RNN** — the basic recurrence above; rarely used today outside teaching, since it can't retain information past ~10-20 steps in practice
- **[[LSTM (Long Short-Term Memory)]]** — adds a separate cell state plus input/forget/output gates that let the network learn what to keep, discard, or expose, dramatically improving long-range memory
- **GRU (Gated Recurrent Unit)** — a simplified LSTM with two gates instead of three (update and reset), fewer parameters, often comparable performance and faster to train
- **Bidirectional RNN** — runs two RNNs over the sequence, one forward and one backward, then concatenates their hidden states; sees both past and future context at each position (only usable when the whole sequence is available upfront, not for real-time/streaming generation)
- **Deep/Stacked RNN** — multiple RNN layers stacked on top of each other, with the hidden state sequence of one layer feeding into the next as its input sequence
- **Attention-augmented RNN** — an RNN encoder-decoder combined with an attention mechanism so the decoder can look back at every encoder hidden state rather than relying solely on a single final context vector; the direct architectural bridge between pure RNNs and the transformer
- **Seq2Seq (encoder-decoder) RNN** — one RNN encodes an entire input sequence into a fixed context vector, a second RNN decodes that vector into an output sequence of possibly different length; the architecture that machine translation used before transformers, and the direct ancestor of attention mechanisms (which were invented specifically to fix this architecture's fixed-context-vector bottleneck)

## Why It Matters
- The standard architecture for sequence tasks (text, time series, speech) before transformers took over, and the conceptual foundation that later sequence models are usually explained in contrast to
- Historically important for understanding why attention/transformers were such a big leap — RNNs process sequentially and struggle with long-range dependencies
- Sequential-by-nature processing means RNNs can't be parallelized across time during training the way transformers can across positions — this is a major reason they lost ground even where their accuracy was competitive
- Still relevant for genuinely streaming/online scenarios (fixed small memory footprint, constant-time updates per new token) and for very long or continuous signals where a fixed context window is awkward
- Understanding the RNN's fixed-hidden-state bottleneck is what makes attention mechanisms click conceptually — attention exists specifically to let a decoder look back at all encoder states directly, instead of relying on a single compressed vector
- A common interview and design-review touchstone: knowing when NOT to reach for a transformer (extremely resource-constrained edge devices, genuinely unbounded streaming input, very small datasets where a transformer's larger parameter count would overfit) is itself a useful, testable piece of engineering judgment

## Code Example
```python
import torch
import torch.nn as nn

class RNNClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=64, hidden_dim=128, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):
        # x: (batch, seq_len) token ids
        embedded = self.embedding(x)                 # (batch, seq_len, embed_dim)
        _, (h_n, c_n) = self.rnn(embedded)            # h_n: (1, batch, hidden_dim)
        return self.fc(h_n.squeeze(0))                # use final hidden state for classification

model = RNNClassifier(vocab_size=10000)
loss_fn = nn.CrossEntropyLoss()
# gradient clipping is standard practice for RNNs:
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
```

## Comparison: RNN vs LSTM vs Transformer
| | Vanilla RNN | LSTM | Transformer |
|---|---|---|---|
| Long-range memory | Poor (~10-20 steps) | Good (hundreds of steps) | Excellent (attends directly to any position) |
| Parallelizable across sequence | No (strictly sequential) | No (strictly sequential) | Yes (all positions computed together) |
| Parameters per "cell" | Fewest | ~4x RNN (gates) | Depends on model, but scales with attention heads/layers |
| Compute cost vs sequence length | Linear | Linear | Quadratic (standard attention) |
| Typical use today | Teaching, tiny streaming models | Time series, low-resource sequence tasks | Text, vision, audio — the default for most new work |

## Real-World Example
- Pre-2017 machine translation systems (e.g., early Google Translate) used encoder-decoder LSTMs, translating a source sentence into a fixed context vector and then decoding it word by word
- Stock price and sensor time-series forecasting still commonly uses LSTM or GRU models, since these signals are continuous streams rather than fixed-length documents, and a constant-memory recurrent model fits that shape naturally
- Keyboard next-word prediction on phones historically ran small on-device LSTMs, valued for low latency and small memory footprint compared to a full transformer
- Speech recognition pipelines have used bidirectional LSTMs to process an entire audio utterance, using both past and future acoustic context to disambiguate a given sound
- Industrial predictive-maintenance systems that monitor a continuous stream of sensor readings from machinery often still favor RNN-family models over transformers, since the input truly is an unbounded stream rather than a fixed document, and constant per-step memory usage matters for long-running deployments

## Common Pitfalls
- Assuming RNNs handle long sequences well — vanishing gradients make them forget distant context, and this weakness compounds with sequence length even for LSTMs/GRUs, just less severely than for vanilla RNNs
- Using a plain RNN today for a new project instead of an LSTM, GRU, or transformer, which almost always outperform it
- Forgetting to clip gradients, leading to occasional loss spikes or NaNs mid-training from exploding gradients
- Padding sequences to a fixed length without masking — the RNN wastes capacity processing (and learning from) padding tokens, and per-step outputs on padded positions are meaningless
- Using a unidirectional RNN for a task where future context matters (e.g., named entity recognition) when a bidirectional RNN would perform notably better
- Not truncating BPTT on very long sequences, which makes training memory blow up and gradients less reliable
- Treating the final hidden state as a complete summary of an arbitrarily long sequence — beyond a few hundred steps this compression becomes lossy in practice regardless of gating, which is a fundamental capacity limit rather than a bug to be tuned away

## Best Practices
- Prefer LSTM or GRU over vanilla RNN by default; reach for a transformer if you have the data and compute budget
- Clip gradient norms (commonly to 1-5) as standard practice, not just when you observe instability
- Mask padded positions in both the loss computation and the recurrence where the framework supports it
- Use bidirectional RNNs whenever the full sequence is available at inference time and directionality isn't semantically required (e.g., not for autoregressive generation)
- Initialize forget-gate biases in LSTMs to a small positive value (e.g., 1) — this biases the network toward remembering by default early in training, which speeds up learning long-range dependencies
- Sort or bucket sequences by length before batching where feasible — this minimizes wasted padding computation and speeds up training noticeably on datasets with highly variable sequence lengths
- Evaluate whether the task genuinely needs sequential/streaming processing before defaulting to an RNN — if the full sequence is always available at inference and latency isn't a hard constraint, a transformer will very likely outperform it

## FAQ
**Q: Why did transformers replace RNNs for most NLP tasks?**
Two reasons: transformers parallelize across the whole sequence during training (much faster on GPUs), and self-attention connects any two positions directly regardless of distance, sidestepping the vanishing-gradient path length problem that limits RNN memory.

**Q: Are RNNs obsolete?**
Not entirely — they remain useful for streaming/online inference with constant memory, some time-series and control applications, and as lightweight components in resource-constrained settings.

**Q: What's the difference between the hidden state and the cell state in an LSTM?**
The hidden state is the per-step output exposed to the rest of the network; the cell state is an internal "conveyor belt" that gates can write to and read from with less interference, which is what gives LSTMs their improved long-range memory over vanilla RNNs.

## Common Interview Questions
**Q: Why do vanilla RNNs suffer from vanishing gradients but LSTMs mitigate it?**
Vanilla RNN gradients get repeatedly multiplied by the same weight matrix and squashed through `tanh` derivatives at every step, shrinking exponentially over long sequences. LSTMs route the cell state through mostly additive, gated updates, which allows gradients to flow backward with far less repeated multiplicative shrinkage.

**Q: What's the computational complexity of an RNN vs a Transformer with respect to sequence length?**
An RNN's cost per sequence is linear in sequence length, `O(n)`, but strictly sequential, so it can't be parallelized across time. A standard transformer's self-attention is `O(n^2)` in sequence length but fully parallelizable across positions, which in practice is often faster on modern hardware for moderate sequence lengths.

**Q: How would you handle variable-length sequences in a batch?**
Pad shorter sequences to match the longest one in the batch, then use a mask (or a packed-sequence utility, e.g. PyTorch's `pack_padded_sequence`) so the RNN doesn't compute meaningless updates on padding tokens and the loss ignores predictions made on padded positions.

**Q: What's the difference between a GRU and an LSTM, and when would you pick one over the other?**
A GRU merges the LSTM's forget and input gates into a single update gate and drops the separate cell state, giving it roughly 25% fewer parameters per unit. In practice their accuracy is often close, so GRUs are a reasonable default when training speed or memory footprint matters more than squeezing out the last bit of accuracy; LSTMs are more commonly the safer first choice for tasks with especially long dependencies.

**Q: Why does gradient clipping fix exploding gradients but not vanishing gradients?**
Clipping caps the gradient's norm from above, directly preventing the runaway multiplicative growth behind exploding gradients. It does nothing to counteract gradients shrinking toward zero, since there's no floor being enforced — that direction of the problem requires an architectural fix like gating, not a clipping threshold.

## History
- RNNs date back conceptually to the 1980s — Hopfield networks (1982) introduced recurrent connections for associative memory, and the Elman network (1990) established the simple recurrent architecture with a hidden-state feedback loop still used to teach the concept today
- The vanishing gradient problem in RNNs was formally analyzed by Hochreiter (1991, in his diploma thesis) and Bengio et al. (1994), explaining mathematically why training recurrent networks on long sequences was so difficult
- LSTM was introduced by Hochreiter and Schmidhuber in 1997, but didn't see widespread adoption until the 2010s once compute and datasets caught up to make its benefits over vanilla RNNs practically obvious
- GRUs were introduced in 2014 (Cho et al.) as part of an encoder-decoder architecture for machine translation, explicitly designed as a lighter-weight alternative to LSTM
- The 2014-2017 period was RNN/LSTM's peak in NLP — sequence-to-sequence models with attention (Bahdanau et al., 2014) were the state of the art for translation right up until the 2017 transformer paper replaced recurrence with attention entirely

## Deeper Dive: Why Sequential Processing Limits Scale
- Every time step in an RNN depends on the previous time step's output, which means a training step for a sequence of length `n` requires `n` sequential matrix operations that cannot be distributed across parallel compute the way independent operations can
- This sequential dependency is orthogonal to the vanishing gradient problem — even a perfectly-designed recurrent architecture with no gradient issues would still face this parallelization ceiling, which is the core practical reason large-scale pretraining (billions of tokens) gravitated toward transformers
- Techniques like truncated BPTT (only backpropagating through a fixed window of recent time steps rather than the entire sequence) trade some long-range gradient signal for tractable memory and compute usage on very long sequences

## Related Terms
- [[LSTM (Long Short-Term Memory)]]
- [[Vanishing-Exploding Gradient]]
- [[Neural Network]]
- [[Backpropagation]]
- [[Gradient Descent]]
- [[Batch Normalization]]
- [[Hyperparameter Tuning]]

## Example
An old-school RNN-based text generator predicts the next word one step at a time, using its hidden state as short-term memory of prior words. Given "The cat sat on the", the hidden state at that point encodes a compressed summary of everything before it, and the network combines that with its recurrent weights to assign the highest probability to a plausible next word like "mat" — but ask it to recall a detail from 200 words earlier (e.g., a character's name mentioned once at the start of a long paragraph) and a vanilla RNN will typically have already lost that signal through the vanishing gradient. Swap the vanilla RNN for an LSTM and that same 200-word-old detail has a meaningfully better chance of surviving in the cell state, since the gates can learn to protect it from being overwritten at every intervening step — though even LSTMs eventually degrade over sequences long enough that modern practice reaches for attention-based architectures instead.
