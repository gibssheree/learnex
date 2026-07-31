---
tags: [term, system-design, distributed]
category: Distributed Fundamentals
---

# PACELC Theorem

**Definition:** An extension of the CAP theorem stating that IF there is a Partition (P), trade off Availability (A) vs Consistency (C); Else (E), trade off Latency (L) vs Consistency (C).

## How It Works
- PC/EC (e.g., Spanner): chooses Consistency during partitions and low Latency is sacrificed for Consistency during normal operation
- PA/EL (e.g., DynamoDB default): chooses Availability during partitions and low Latency during normal operation

## Why It Matters
- Provides a complete trade-off model explaining database performance during normal healthy state, not just during rare network splits

## Common Pitfalls
- Expecting zero-latency reads while enforcing strict global linearizable consistency

## Related Terms
- [[CAP Theorem]]
- [[Database Replication]]

## Example
DynamoDB sacrifices strict consistency during normal ops to achieve single-digit millisecond latency (PA/EL).
