---
tags: [term, databases, concurrency]
category: Transactions & Concurrency
---

# MVCC

**Definition:** Multi-Version Concurrency Control (MVCC) is a database concurrency control method where reads do not block writes, and writes do not block reads.

## How It Works
- Instead of updating data rows in-place, writes create a new version of the tuple tagged with transaction IDs (`xmin`/`xmax`)
- Concurrent readers read snapshot versions corresponding to their transaction start point
- Vacuuming: background processes periodically purge old invisible row versions no longer needed by active transactions

## Why It Matters
- Provides high-performance non-blocking concurrent reads in production databases

## Common Pitfalls
- Bloat: un-vacuumed dead tuple versions waste disk space and slow down table scans in PostgreSQL

## Related Terms
- [[Transaction Isolation Levels]]
- [[Write-Ahead Logging (WAL)]]

## Example
PostgreSQL and MySQL InnoDB use MVCC to allow long-running analytical SELECT queries without locking write transactions.
