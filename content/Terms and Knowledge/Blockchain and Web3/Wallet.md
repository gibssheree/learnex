---
tags: [term, blockchain, web3, security]
category: Core Concepts
---

# Wallet

**Definition:** Software or hardware that holds the private keys controlling access to blockchain assets, the "account" a person uses to send and receive cryptocurrency or interact with smart contracts.

## How It Works
- A wallet generates a public/private key pair, similar in spirit to [[Symmetric and Asymmetric Encryption|asymmetric encryption]]
- The public key (or an address derived from it) is shareable, like a bank account number
- The private key must never be shared, whoever holds it has full control of the funds, with no password reset or customer support to recover it

## Why It Matters
- Unlike a bank account, there's no central authority to reverse a mistake or recover lost access, losing a private key means losing the assets permanently

## Common Pitfalls
- Storing a private key or seed phrase digitally in an unencrypted place (screenshot, plain text file), a common cause of theft
- Signing a malicious transaction without understanding what it actually authorizes, a common phishing vector in Web3

## Related Terms
- [[Blockchain]]
- [[Gas Fees]]
- [[Symmetric and Asymmetric Encryption]]

## Example
MetaMask is a widely used browser-extension wallet for interacting with Ethereum and other EVM-compatible blockchains.
