---
tags: [term, databases, concurrency]
category: Transactions & Concurrency
---

# Transaction Isolation Levels

**Definition:** ANSI SQL standards defining the degree to which concurrent transactions are isolated from seeing each other's uncommitted or parallel modifications.

## How It Works
- Read Uncommitted: lowest isolation; allows Dirty Reads
- Read Committed: prevents Dirty Reads; allows Non-Repeatable Reads
- Repeatable Read: prevents Dirty and Non-Repeatable Reads; allows Phantom Reads in some DBs
- Serializable: highest isolation; completely prevents all concurrency anomalies by enforcing strict serial execution equivalent

## Why It Matters
- Governs financial transaction accuracy vs database read concurrency throughput

## Common Pitfalls
- Defaulting to Read Committed without understanding Phantom Reads in critical inventory deduction transactions

## Related Terms
- [[MVCC]]
- [[Write-Ahead Logging (WAL)]]

## Example
Banking applications use Serializable isolation level to prevent double-spending race conditions.
