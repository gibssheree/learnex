---
tags: [term, blockchain, web3]
category: Core Concepts
---

# Gas Fees

**Definition:** The fee paid to execute a transaction or smart contract operation on a blockchain, compensating the network for the computation and storage it requires.

## How It Works
- Every operation (a transfer, a smart contract call) costs a certain amount of "gas," a unit measuring computational effort
- Users set a gas price they're willing to pay; higher prices get transactions processed faster during network congestion
- Fees go to whoever validates the block, miners under [[Proof of Work vs Proof of Stake|Proof of Work]] or validators under Proof of Stake

## Why It Matters
- Directly shapes what's practical to build on-chain, expensive gas makes frequent small transactions impractical, which is why [[Layer 2 Scaling|Layer 2 networks]] exist

## Common Pitfalls
- Underestimating gas costs when designing a [[Smart Contract]], inefficient contract code can make routine operations prohibitively expensive for users
- Not accounting for gas price volatility, a transaction that was cheap yesterday can be expensive today during network congestion

## Related Terms
- [[Layer 2 Scaling]]
- [[Smart Contract]]
- [[Wallet]]

## Example
During periods of high Ethereum network demand, a simple token transfer's gas fee can spike from cents to tens of dollars.
