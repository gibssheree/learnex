---
tags: [term, databases, transactions]
category: Transactions & Concurrency
---

# ACID (Atomicity, Consistency, Isolation, Durability)

**Definition:** A set of four fundamental properties that guarantee database transactions are processed reliably and survive system failures.

## How It Works
- Atomicity: guarantees a transaction is treated as a single unit, either completely succeeding or entirely rolling back.
- Consistency: ensures transactions only bring the database from one valid state to another, enforcing constraints and rules.
- Isolation: dictates how/when changes made by one transaction become visible to others, preventing concurrent read/write conflicts.
- Durability: ensures committed transactions are saved permanently and survive power loss or crashes, typically using write-ahead logging.

## Why It Matters
- Forms the absolute bedrock of relational database reliability, ensuring financial transactions and critical business state do not corrupt under heavy load or hardware failure.

## Common Pitfalls
- Assuming NoSQL databases provide full ACID guarantees natively, as many default to BASE (Basically Available, Soft state, Eventual consistency) for scalability.

## Related Terms
- [[Transaction Isolation Levels]]
- [[Write-Ahead Logging (WAL)]]

## Example
When transferring $50 from Account A to Account B, Atomicity ensures the database never deducts $50 from A without also adding it to B, even if the power cuts out mid-transfer.
