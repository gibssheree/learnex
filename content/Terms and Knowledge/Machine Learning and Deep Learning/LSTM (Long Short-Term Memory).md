---
tags: [term, deep-learning, nlp]
category: Neural Network Architectures
---

# LSTM (Long Short-Term Memory)

**Definition:** A type of RNN with a gating mechanism (input, forget, output gates) specifically designed to retain relevant information over long sequences and mitigate the vanishing gradient problem.

## How It Works
- Maintains a separate "cell state" that acts as a conveyor belt for long-term memory
- Gates learn what to keep, forget, and output at each step, controlling information flow more deliberately than a plain RNN
- At each timestep, the LSTM cell receives the current input, the previous hidden state, and the previous cell state, and produces a new hidden state and new cell state
- The gates are themselves small neural network layers (sigmoid-activated), trained jointly with the rest of the network via [[Backpropagation]] through time

## Under the Hood
Given input `x_t`, previous hidden state `h_{t-1}`, and previous cell state `c_{t-1}`, an LSTM cell computes:

```
f_t = sigmoid(W_f . [h_{t-1}, x_t] + b_f)   # forget gate: what to drop from cell state
i_t = sigmoid(W_i . [h_{t-1}, x_t] + b_i)   # input gate: what new info to add
c~_t = tanh(W_c . [h_{t-1}, x_t] + b_c)     # candidate values to add to cell state
c_t = f_t * c_{t-1} + i_t * c~_t            # updated cell state
o_t = sigmoid(W_o . [h_{t-1}, x_t] + b_o)   # output gate: what to expose as output
h_t = o_t * tanh(c_t)                       # updated hidden state
```

- `f_t` (forget gate) outputs values between 0 and 1 for each cell state dimension — near 0 erases that piece of memory, near 1 keeps it fully
- `i_t` (input gate) controls how much of the new candidate information `c~_t` gets written into the cell state
- The cell state update `c_t = f_t * c_{t-1} + i_t * c~_t` is additive, not purely multiplicative through a nonlinearity at every step — this is the key structural difference from a vanilla RNN, and it's what lets gradients flow backward through many timesteps without shrinking exponentially (mitigating, though not fully eliminating, the [[Vanishing-Exploding Gradient]] problem)
- `o_t` (output gate) decides how much of the (squashed) cell state becomes the visible hidden state `h_t`, which is what gets passed to the next layer or timestep

## History
Introduced by Sepp Hochreiter and Jurgen Schmidhuber in their 1997 paper "Long Short-Term Memory," which directly targeted the vanishing gradient problem that made vanilla RNNs unable to learn dependencies spanning more than roughly 10 timesteps. The forget gate — now considered essential — was actually added later, in a 2000 follow-up by Gers, Schmidhuber, and Cummins; the original 1997 architecture lacked it. LSTMs saw relatively little use until GPUs and larger datasets made training deep sequence models practical in the early-to-mid 2010s, at which point they became the dominant architecture for speech recognition, machine translation, and language modeling until transformers overtook them starting around 2017.

## Variants
- **Vanilla LSTM** — the standard three-gate (forget, input, output) architecture described above
- **Peephole LSTM** — lets the gates also look at the cell state directly (not just the hidden state), which can improve precise timing-dependent tasks
- **GRU (Gated Recurrent Unit)** — a simplified alternative with only two gates (reset and update) and no separate cell state; fewer parameters, often trains faster, and performs comparably to LSTM on many tasks
- **Bidirectional LSTM** — runs two LSTMs over the sequence, one forward and one backward, then concatenates their hidden states — useful when the full sequence is available at inference time (e.g., text classification) rather than being generated left-to-right
- **Stacked / Deep LSTM** — multiple LSTM layers stacked so the hidden state sequence of one layer feeds as the input sequence to the next, increasing representational capacity at the cost of more compute and a higher risk of vanishing/exploding gradients through depth as well as time
- **ConvLSTM** — replaces the fully-connected gate computations with convolutions, suited to spatiotemporal data like video frames
- **Attention-augmented LSTM** — adds an attention mechanism over the sequence of encoder hidden states so a decoder isn't limited to a single fixed-size summary vector — the architecture that bridged LSTMs and transformers before self-attention made recurrence unnecessary entirely

## Why It Matters
- Was the dominant architecture for sequence modeling (translation, speech recognition) for years before transformers displaced it
- Still used in some latency-sensitive or streaming applications where transformers' full-context attention is overkill
- Its gating mechanism directly inspired later architectures — GRUs simplified it, and even some components of transformer variants borrow the idea of learned, data-dependent information flow
- LSTMs process sequences step-by-step, which gives them natural support for streaming/online inference (you don't need the whole sequence upfront) and constant memory per step, unlike a transformer's attention over the full context window

## Common Pitfalls
- Assuming LSTMs handle arbitrarily long context as well as transformers do — they still degrade over very long sequences, just less than plain RNNs
- Using LSTMs for new large-scale NLP projects today when a transformer would train faster (parallelizable) and perform better
- Training LSTMs without gradient clipping — despite the gating mechanism reducing vanishing gradients, exploding gradients through time are still a real risk
- Forgetting to reset or properly detach hidden/cell state between unrelated sequences (e.g., between batches during training) when using stateful LSTM configurations, which leaks information across independent examples
- Not accounting for the sequential (non-parallelizable across time) nature of LSTMs when estimating training time — unlike transformers, an LSTM can't process all timesteps of a sequence simultaneously, so training and inference scale linearly with sequence length in wall-clock time
- Initializing the forget gate bias to zero — in practice, initializing it to a positive value (e.g., 1) is a well-known trick that helps the network default to "remember" early in training rather than forgetting everything
- Underestimating parameter count — an LSTM layer has roughly 4x the parameters of a vanilla RNN of the same hidden size (one weight matrix per gate, plus the candidate values), which affects both memory footprint and overfitting risk on small datasets
- Padding variable-length sequences without masking, which lets the LSTM process meaningless padding tokens as if they were real input and pollutes both the hidden state and the gradient

## Best Practices
- Prefer a transformer or a modern state-space model (e.g., Mamba) for new large-scale sequence modeling projects; reach for LSTM/GRU when you specifically need constant-memory streaming inference or are working with limited compute/data
- Initialize the forget gate bias to a small positive value (commonly 1.0) to bias the network toward retaining information early in training
- Apply gradient clipping (e.g., clip norm to 1.0-5.0) as standard practice when training any recurrent architecture
- Use a bidirectional LSTM when the full input sequence is available at inference (classification, tagging) rather than being generated autoregressively
- Consider a GRU first if compute or parameter count is constrained — it's often a nearly-free swap for LSTM with similar performance and fewer parameters
- Use padded-sequence utilities (e.g., `pack_padded_sequence` in PyTorch) so variable-length batches don't waste compute or corrupt gradients on padding tokens
- Normalize or scale input features before feeding them into the LSTM — like most gradient-based models, it trains more reliably on well-conditioned inputs than on raw, wildly-scaled features

## Code Example
```python
import torch
import torch.nn as nn

class SequenceClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=128, hidden_dim=256, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers=2,
                             batch_first=True, bidirectional=True)
        self.classifier = nn.Linear(hidden_dim * 2, num_classes)  # *2 for bidirectional

    def forward(self, x):
        embedded = self.embedding(x)                     # [batch, seq_len, embed_dim]
        outputs, (h_n, c_n) = self.lstm(embedded)         # h_n: final hidden states
        # Concatenate final forward and backward hidden states from the last layer
        final_hidden = torch.cat((h_n[-2], h_n[-1]), dim=1)
        return self.classifier(final_hidden)

model = SequenceClassifier(vocab_size=10000)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
```

The gate equations implemented directly, for a single timestep, to make the "Under the Hood" formulas concrete:

```python
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def lstm_cell_step(x_t, h_prev, c_prev, W_f, W_i, W_c, W_o, b_f, b_i, b_c, b_o):
    combined = np.concatenate([h_prev, x_t])
    f_t = sigmoid(W_f @ combined + b_f)        # forget gate
    i_t = sigmoid(W_i @ combined + b_i)         # input gate
    c_candidate = np.tanh(W_c @ combined + b_c) # candidate cell values
    c_t = f_t * c_prev + i_t * c_candidate      # updated cell state
    o_t = sigmoid(W_o @ combined + b_o)         # output gate
    h_t = o_t * np.tanh(c_t)                    # updated hidden state
    return h_t, c_t
```

## Comparison
| Architecture | Handles long-range dependencies | Parallelizable over sequence | Params per layer | Typical modern use |
|---|---|---|---|---|
| Vanilla RNN | Poorly (vanishing gradients) | No | Low | Rarely used today, teaching example |
| LSTM | Well (via gating + cell state) | No (sequential) | High (4x RNN's gate weights) | Streaming/low-latency sequence tasks |
| GRU | Well, slightly less capacity than LSTM | No (sequential) | Medium (3x RNN's gate weights) | Lighter-weight alternative to LSTM |
| Transformer | Very well (direct attention to any position) | Yes | Depends on width/depth | Default for most modern NLP/sequence tasks |

## Real-World Example
A keyboard app's next-word prediction or an on-device voice assistant's streaming speech recognizer is a realistic modern use case for an LSTM: the input arrives incrementally (one keystroke or audio frame at a time), a response is needed with very low latency, and the device has limited memory and no guarantee of network connectivity to run a large transformer server-side. An LSTM processes each new input in constant time and constant memory, updating its hidden and cell state incrementally, without needing to re-run attention over an ever-growing context window the way a transformer would. This is precisely the streaming, resource-constrained niche where LSTMs remain a reasonable engineering choice rather than a historical footnote.

## FAQ
**Why did transformers replace LSTMs for most NLP tasks?**
Two main reasons: transformers process all sequence positions in parallel during training (LSTMs are inherently sequential, since each timestep depends on the previous one), which makes transformers dramatically faster to train on modern hardware; and self-attention lets every position directly attend to every other position, avoiding the information bottleneck of squeezing an entire sequence's history through a fixed-size hidden state.

**Do LSTMs still have a place today?**
Yes, in specific niches: streaming/real-time applications with strict latency and memory constraints (constant memory per step vs. a transformer's context window), edge devices, time-series forecasting where sequences are short and data is limited, and as components inside larger hybrid architectures.

**What's the actual difference between LSTM and GRU?**
GRU merges the forget and input gates into a single "update gate" and eliminates the separate cell state, using only the hidden state. This gives GRU roughly 25% fewer parameters per layer than LSTM for the same hidden size, faster training, and comparable accuracy on many (though not all) tasks — LSTM's extra capacity can still win out on tasks needing more precise long-term memory control.

**How does the cell state actually solve vanishing gradients?**
In a vanilla RNN, the hidden state is repeatedly passed through a nonlinearity (tanh) and multiplied by a weight matrix at every timestep, so gradients flowing backward through many steps get repeatedly shrunk (or occasionally blown up) — an exponential effect over long sequences. The LSTM's cell state update is largely additive (`c_t = f_t * c_{t-1} + i_t * c~_t`), so a gradient can flow backward through the `f_t * c_{t-1}` term across many timesteps with much less multiplicative shrinkage, as long as the forget gate stays close to 1 for the relevant timesteps.

**Can LSTMs be used for anything other than text?**
Yes — any sequential or time-series data: sensor readings, stock prices, audio waveforms, DNA sequences, user click streams. The "long short-term memory" framing (retaining relevant signal while discarding noise over time) is domain-agnostic; NLP just happened to be where LSTMs saw the most visible adoption during their peak years.

## Common Interview Questions
- Why does the LSTM's cell state help with vanishing gradients when the hidden state alone doesn't? (The cell state update is largely additive rather than repeatedly passed through a squashing nonlinearity and weight matrix, so gradients shrink far less across many timesteps.)
- What's the computational complexity difference between an LSTM and a transformer for a sequence of length n? (An LSTM processes a sequence in O(n) sequential steps that can't be parallelized across time; a transformer's self-attention is O(n²) in compute but fully parallelizable across the sequence.)
- When would you still reach for an LSTM over a transformer today? (Streaming/low-latency inference with constant memory per step, small datasets where a lighter-weight model avoids overfitting, or resource-constrained edge deployment.)

## Related Terms
- [[Recurrent Neural Network (RNN)]]
- [[Vanishing-Exploding Gradient]]
- [[Backpropagation]]
- [[Neural Network]]
- [[Batch Normalization]]

## Example
Older Google Translate versions used LSTM-based sequence-to-sequence models before switching to transformer-based architectures. In that setup, an "encoder" LSTM would read an entire source-language sentence word by word, compressing its meaning into a final hidden and cell state; a separate "decoder" LSTM would then generate the target-language sentence one word at a time, conditioned on that compressed representation (later versions added an attention mechanism so the decoder could look back at all encoder hidden states, not just the final one — a precursor to the attention mechanism that transformers later made central rather than supplementary). The core limitation that pushed the field toward transformers was exactly this bottleneck: forcing an entire sentence's meaning through one fixed-size vector loses information, especially for long sentences, and processing everything sequentially made both training and inference slow to parallelize.
