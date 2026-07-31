---
tags: [term, blockchain, web3, consensus]
category: Consensus
---

# Proof of Work vs Proof of Stake

**Definition:** Two competing methods blockchains use to agree on which transactions are valid and who gets to add the next block, without a central authority.

## How It Works
- Proof of Work (PoW): miners compete to solve a computationally expensive puzzle, whoever solves it first adds the next block and earns a reward, securing the network through raw computational cost
- Proof of Stake (PoS): validators lock up ("stake") their own cryptocurrency as collateral, and are selected to add blocks roughly in proportion to their stake, securing the network through economic cost instead
- Both connect back to the broader idea of [[Distributed Consensus]] covered in System Design

## Why It Matters
- PoW is extremely energy-intensive, which is why Ethereum's move from PoW to PoS in 2022 ("The Merge") reduced its energy consumption by over 99%

## Common Pitfalls
- Assuming PoS is strictly "better," it trades PoW's energy cost for different tradeoffs around wealth concentration and validator centralization
- Underestimating how differently the two models handle malicious actors, "51% attacks" mean different things and have different costs under each

## Related Terms
- [[Blockchain]]
- [[Distributed Consensus]]
- [[Gas Fees]]

## Example
Bitcoin still uses Proof of Work; Ethereum switched to Proof of Stake in 2022, dramatically cutting its energy footprint.
