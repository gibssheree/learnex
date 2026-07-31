---
tags: [term, system-design, distributed, consistency-models]
category: Distributed Fundamentals
---

# CAP Theorem

**Definition:** The CAP Theorem (Brewer's conjecture, formally proven by Gilbert and Lynch in 2002) states that a distributed data store can simultaneously provide at most two of three guarantees once a network partition occurs: Consistency, Availability, and Partition Tolerance.

## How It Works
- Consistency (C): every read receives the most recent write or an error — this is linearizability, a stricter guarantee than the "C" in ACID
- Availability (A): every request to a non-failing node receives a non-error response within a bounded time, with no guarantee it reflects the latest write
- Partition Tolerance (P): the system keeps operating despite arbitrary message loss or delay between nodes caused by network failure
- Because real networks drop packets, P is not optional — the actual choice is CP vs AP once a partition is detected
- CP systems (e.g., etcd, ZooKeeper, HBase): during a partition, the minority side refuses reads/writes (errors or times out) to avoid serving stale or conflicting data
- AP systems (e.g., Cassandra, DynamoDB, Riak): during a partition, every reachable node keeps serving reads/writes, accepting that replicas may diverge and require reconciliation later
- Gilbert & Lynch's proof uses an asynchronous network model: no algorithm can guarantee both linearizable reads and non-blocking availability once messages between two nodes can be delayed indefinitely
- A "CA" system is only possible on a single node or within a network that never partitions — it disappears the moment data is distributed across a real network

## Why It Matters
- Fundamental design constraint when selecting database architectures for scalable cloud applications — it forces an explicit choice about what happens to user-facing requests during a partition, not just a footnote
- Shapes API-level guarantees clients can rely on: a CP store lets you assume read-after-write consistency, an AP store forces you to handle conflicting versions in application code
- Directly informs SLA design: AP systems can promise five-nines availability because they never block on quorum recovery; CP systems trade some availability for correctness guarantees

## Common Pitfalls
- Assuming CAP applies when there is NO network partition — during normal operation the real trade-off is latency vs consistency, which is what [[PACELC Theorem]] addresses
- Conflating CAP's "Consistency" (linearizability) with ACID's "Consistency" (data satisfies application invariants/constraints) — unrelated definitions that share a word
- Treating CAP as a static, permanent label for a database — many systems (MongoDB, Cassandra) are tunable per-query via quorum settings (`W + R > N` for strong consistency), so "is it CP or AP" can depend on the consistency level chosen at call time
- Believing "AP" means "no consistency at all" — most AP systems still offer eventual or tunable consistency, not arbitrary data loss
- Picking CP for a service where brief unavailability is worse than serving slightly stale data (e.g., a product catalog page) purely out of theoretical purity rather than actual business requirements

## Related Terms
- [[PACELC Theorem]]
- [[Distributed Consensus]]
- [[Data Sharding and Partitioning]]
- [[Database Replication]]

## Example
MongoDB with `readConcern: majority` and writes acknowledged by a majority of replica set members behaves as CP — it rejects operations on a minority partition. Cassandra with `ONE` read/write consistency behaves as AP — every reachable node answers, and conflicting writes are resolved later via last-write-wins timestamps or read-repair.
