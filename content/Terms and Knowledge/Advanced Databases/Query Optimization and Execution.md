---
tags: [term, databases, performance]
category: Query Processing
---

# Query Optimization and Execution

**Definition:** The process by which a database relational engine parses SQL queries, evaluates index statistics, and generates the most efficient physical Execution Plan.

## How It Works
- Parser -> Cost-Based Optimizer (CBO) evaluates alternate Execution Plans using table statistics
- Scans: Sequential Table Scan vs Index Scan vs Index Only Scan
- Join Algorithms: Nested Loop Join (small sets), Hash Join (large unsorted sets), Merge Join (large pre-sorted sets)

## Why It Matters
- Allows developers to analyze slow queries using `EXPLAIN ANALYZE` and optimize database performance

## Common Pitfalls
- Outdated table statistics cause optimizer to pick sequential table scans over valid indexes

## Related Terms
- [[Database Indexing Internals]]
- [[Database Normalization and Denormalization]]

## Example
Running `EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'x'` shows if an Index Scan was utilized.
