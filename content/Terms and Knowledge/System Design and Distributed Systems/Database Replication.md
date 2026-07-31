---
tags: [term, system-design, distributed, database]
category: Distributed Fundamentals
---

# Database Replication

**Definition:** The process of copying and maintaining the same data across multiple nodes to improve availability, fault tolerance, and read scalability.

## How It Works
- Leader-Follower (Primary-Replica): one node accepts writes, replicates changes out to read replicas
- Synchronous replication: waits for replica ACK before confirming the write, stronger consistency but higher write latency
- Asynchronous replication: confirms the write immediately, replicas catch up afterward, lower latency but risk of data loss if the leader fails before replicating
- Multi-leader / leaderless (e.g. Dynamo-style): multiple nodes accept writes, conflicts resolved via vector clocks or last-write-wins

## Why It Matters
- Read replicas offload read traffic from the primary, improving scalability for read-heavy workloads
- Provides fault tolerance: if the primary fails, a replica can be promoted to take over

## Common Pitfalls
- Replication lag: reading from a replica immediately after writing to the primary can return stale data, the classic "read-your-writes" problem
- Assuming synchronous replication is free — it directly adds round-trip network time to every write

## Related Terms
- [[CAP Theorem]]
- [[PACELC Theorem]]
- [[Distributed Consensus]]
- [[Data Sharding and Partitioning]]

## Example
A Postgres primary handles all writes; two read replicas serve SELECT-heavy dashboard queries, reducing load on the primary.
