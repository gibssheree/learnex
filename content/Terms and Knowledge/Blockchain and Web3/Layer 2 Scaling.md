---
tags: [term, blockchain, web3, scalability]
category: Consensus
---

# Layer 2 Scaling

**Definition:** Networks built on top of a base blockchain (Layer 1) that process transactions off the main chain and only periodically settle a summary back to it, trading some decentralization for much lower cost and higher speed.

## How It Works
- Transactions happen on the Layer 2 network, which is faster and cheaper than the base chain
- Periodically, a batch of Layer 2 activity is compressed and settled back onto Layer 1, inheriting its security
- Different approaches (rollups, sidechains) make different tradeoffs between speed, cost, and how much security they inherit from Layer 1

## Why It Matters
- Base blockchains like Ethereum can only process a limited number of transactions per second; Layer 2s exist specifically to solve the [[Gas Fees|gas fee]] and throughput problems that come with a congested base chain

## Common Pitfalls
- Assuming all Layer 2s offer identical security guarantees, some inherit Layer 1's security much more directly than others
- Underestimating the complexity of bridging assets between Layer 1 and Layer 2, a common source of exploits

## Related Terms
- [[Gas Fees]]
- [[Blockchain]]

## Example
Arbitrum and Optimism are Ethereum Layer 2 rollups that process transactions cheaply off-chain, then post compressed proofs back to Ethereum.
