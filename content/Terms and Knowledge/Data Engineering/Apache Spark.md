---
tags: [term, data-engineering, processing]
category: Processing Paradigms
---

# Apache Spark

**Definition:** A distributed data processing engine that splits large computations across many machines, able to handle both batch and streaming workloads at massive scale.

## How It Works
- Splits a large dataset into partitions distributed across a cluster of machines
- Processes partitions in parallel, keeping intermediate results in memory when possible for speed
- Supports SQL queries, Python/Scala/Java APIs, machine learning, and streaming through one unified engine

## Why It Matters
- One of the main tools that makes "big data," datasets too large for a single machine, actually processable in reasonable time

## Common Pitfalls
- Using Spark for datasets small enough to fit on a single machine, where the distributed-computing overhead makes it slower than just using Pandas or plain SQL
- Poorly partitioned data causing a few machines to do most of the work while others sit idle ("data skew")

## Related Terms
- [[Batch vs Stream Processing]]
- [[Apache Kafka]]
- [[OLTP vs OLAP]]

## Example
A company uses Spark to join and aggregate billions of rows of clickstream data nightly, work that would take hours or crash on a single machine.
