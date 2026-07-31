---
tags: [term, blockchain, web3]
category: Applications
---

# Smart Contract

**Definition:** Self-executing code deployed on a blockchain that automatically runs when its conditions are met, with no intermediary needed to enforce it.

## How It Works
- Written in a language like [[Solidity]] and compiled to bytecode deployed permanently on the blockchain
- Once deployed, its code can't be changed (immutable), and it executes exactly as written whenever called
- Execution costs [[Gas Fees]], since every operation consumes network computation

## Why It Matters
- Enables trustless agreements, two parties who don't trust each other can still transact safely because the contract's logic is enforced by the network, not a middleman

## Common Pitfalls
- Bugs in deployed smart contract code often can't be patched, since the code is immutable, security review before deployment is far more critical than in typical software
- Underestimating how public smart contract code is, any vulnerability can be found and exploited by anyone reading the deployed bytecode

## Related Terms
- [[Solidity]]
- [[Gas Fees]]
- [[Blockchain]]

## Example
A smart contract can hold funds in escrow and automatically release them to a seller only once a buyer confirms delivery, with no bank or escrow agent involved.
