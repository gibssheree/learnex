---
tags: [term, databases, indexing]
category: Storage Engine Internals
---

# Database Indexing Internals

**Definition:** The underlying physical data structures (B+ Trees, LSM Trees) used by database storage engines to enable O(log N) data lookups.

## How It Works
- B+ Tree: balanced multi-way search tree kept on disk. Internal nodes store keys/pointers; leaf nodes store actual data pointers linked sequentially for range queries (used by PostgreSQL, MySQL InnoDB)
- LSM Tree (Log-Structured Merge-tree): appends writes to in-memory MemTable, flushes to immutable SSTables on disk, compacts periodically. Optimized for write-heavy workloads (used by Cassandra, RocksDB)
- Clustered Index: table rows stored physically in index order; Secondary Index: stores secondary keys pointing to primary key

## Why It Matters
- Determines write throughput vs read latency trade-offs of database storage engines

## Common Pitfalls
- Over-indexing tables slows down `INSERT`, `UPDATE`, and `DELETE` operations due to index update overhead

## Related Terms
- [[Query Optimization and Execution]]
- [[Write-Ahead Logging (WAL)]]

## Example
PostgreSQL default index is a B+ Tree, allowing fast range queries like `WHERE created_at BETWEEN x AND y`.
