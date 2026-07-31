---
tags: [term, blockchain, web3]
category: Core Concepts
---

# Blockchain

**Definition:** A distributed, append-only ledger where transactions are grouped into blocks, cryptographically linked to the previous block, and replicated across many independent nodes.

## How It Works
- Each block contains a batch of transactions and a cryptographic hash of the previous block, forming a tamper-evident chain
- No single party controls the ledger, all participating nodes hold a copy and agree on its contents via [[Proof of Work vs Proof of Stake|consensus]]
- Changing any past block would break every subsequent block's hash, making history extremely difficult to alter retroactively

## Why It Matters
- Enables trustless coordination between parties who don't know or trust each other, without a central authority

## Common Pitfalls
- Assuming "blockchain" automatically means "secure" or "better" for every use case, most problems don't actually need a decentralized, trustless ledger
- Confusing the blockchain (the ledger) with cryptocurrency (one application built on top of it)

## Related Terms
- [[Proof of Work vs Proof of Stake]]
- [[Wallet]]
- [[Distributed Consensus]]

## Example
Bitcoin's blockchain is a public ledger of every transaction ever made, replicated across thousands of independent nodes worldwide.
