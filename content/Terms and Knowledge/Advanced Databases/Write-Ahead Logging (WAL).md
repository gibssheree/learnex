---
tags: [term, databases, durability]
category: Storage Engine Internals
---

# Write-Ahead Logging (WAL)

**Definition:** A durability technique where all data modifications are recorded in an append-only log on disk before being applied to main database storage files.

## How It Works
- 1. Client issues write operation
- 2. Database appends change record to persistent WAL log file on disk
- 3. Database updates memory buffers; ACK returned to client
- 4. Crash Recovery: upon crash reboot, engine replays committed WAL records to restore database state (ARIES recovery algorithm)

## Why It Matters
- Provides strict ACID Durability and Atomicity without requiring expensive immediate random disk writes per transaction

## Common Pitfalls
- Running out of disk space for WAL logs halts database write operations completely

## Related Terms
- [[Transaction Isolation Levels]]
- [[MVCC]]

## Example
PostgreSQL uses WAL logs to support Point-In-Time Recovery (PITR) and streaming database replication.
