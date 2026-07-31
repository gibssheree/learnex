---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# Database Indexing

**Definition:** A data structure that speeds up lookups on a database table, at the cost of extra storage and slightly slower writes.

## How It Works
- An index, usually a B-tree, lets the database jump straight to matching rows instead of scanning the whole table

## Why It Matters
- The single biggest lever for fixing slow queries on large tables

## Common Pitfalls
- Indexing every column "just in case" slows down inserts and updates
- Not indexing foreign keys or columns used often in `WHERE`/`JOIN` clauses

## Related Terms
- [[SQL vs NoSQL]]
- [[Caching]]

## Example
Adding an index on `email` so `WHERE email = ?` on a million-row users table returns instantly instead of scanning everything.
