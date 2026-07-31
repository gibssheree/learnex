---
tags: [term, data-engineering, pipeline]
category: Pipeline Fundamentals
---

# Change Data Capture (CDC)

**Definition:** A technique for detecting and capturing row-level changes (inserts, updates, deletes) in a source database as they happen, instead of re-scanning the whole table on a schedule.

## How It Works
- Reads a database's transaction log (e.g. Postgres's [[Write-Ahead Logging (WAL)]]) to see every change as it's committed
- Streams those changes downstream in near real-time, often through a message system like [[Apache Kafka]]
- Avoids the cost and staleness of periodically re-querying an entire large table

## Why It Matters
- Lets downstream systems (warehouses, search indexes, caches) stay in near-real-time sync with a source database without hammering it with repeated full queries

## Common Pitfalls
- Underestimating the operational complexity of running CDC infrastructure (tools like Debezium) reliably
- Not handling schema changes on the source table gracefully, breaking downstream consumers

## Related Terms
- [[Write-Ahead Logging (WAL)]]
- [[Apache Kafka]]
- [[Data Pipeline]]

## Example
Debezium reads a Postgres database's write-ahead log and streams every row change into Kafka, keeping a search index updated within seconds of a database write.
