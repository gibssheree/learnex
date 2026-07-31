---
tags: [term, blockchain, web3]
category: Applications
---

# NFT (Non-Fungible Token)

**Definition:** A blockchain-recorded token representing ownership of a unique, non-interchangeable asset, unlike a cryptocurrency where every unit is identical and interchangeable.

## How It Works
- Each NFT has a unique identifier recorded on-chain, tied to metadata describing what it represents (often an image, but can be anything: a ticket, a deed, an in-game item)
- Ownership transfers are recorded via [[Smart Contract]] logic, most commonly following the ERC-721 or ERC-1155 standards on Ethereum
- The token itself typically just points to the asset (often stored off-chain), it doesn't necessarily contain the asset directly

## Why It Matters
- Introduced a standard way to represent verifiable, transferable ownership of unique digital (or digitally-referenced) items on a blockchain

## Common Pitfalls
- Assuming owning an NFT grants copyright or exclusive usage rights to the underlying artwork, in most cases it doesn't unless explicitly granted
- Confusing the permanence of the blockchain record with the permanence of the actual asset, if the linked image is hosted off-chain and that host disappears, the NFT can end up pointing at nothing

## Related Terms
- [[Smart Contract]]
- [[Blockchain]]
- [[Wallet]]

## Example
An NFT marketplace lets an artist mint a unique token representing a digital artwork, which collectors can then buy, sell, and verifiably own.
