---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# Connection Pooling

**Definition:** Reusing a fixed set of open database connections instead of opening a new one for every request.

## How It Works
- A pool manager keeps N connections open and hands them out to requests as needed
- Connections are returned to the pool when a request finishes, not closed

## Why It Matters
- Opening a new DB connection is slow; without pooling, high traffic can exhaust the database's connection limit

## Common Pitfalls
- Forgetting to release a connection back to the pool, causing "pool exhausted" errors under load

## Related Terms
- [[SQL vs NoSQL]]
- [[Serverless]]

## Example
A serverless function opening a new DB connection on every cold start can quickly exhaust a database's max connections without a pooler like PgBouncer.
