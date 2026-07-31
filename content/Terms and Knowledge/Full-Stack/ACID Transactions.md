---
tags: [term, fullstack, database]
category: Database & Data
---

# ACID Transactions

**Definition:** A set of guarantees, Atomicity, Consistency, Isolation, Durability, that make database operations safe and predictable.

## How It Works
- A transaction groups multiple operations so they all succeed together or all fail together
- No partial state is ever left behind if something fails mid-way

## Why It Matters
- Critical for anything involving money, inventory, or any operation where a partial failure would corrupt data

## Common Pitfalls
- Forgetting to wrap multi-step operations, like "deduct from account A, add to account B," in a single transaction, risking inconsistent state if one step fails

## Related Terms
- [[SQL vs NoSQL]]

## Example
A bank transfer: money leaves one account and enters another as a single atomic transaction, or neither happens.
