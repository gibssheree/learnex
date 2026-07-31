---
tags: [term, system-design, databases]
category: Scalability & Partitioning
subcategory: Scalability Patterns
---

# Data Sharding and Partitioning

**Definition:** The practice of horizontally partitioning a large database across multiple independent database nodes (shards) to distribute traffic and storage.

## How It Works
- Shard Key: attribute used to determine which shard receives a record (e.g., `hash(user_id) % num_shards`)
- Horizontal Partitioning: splitting rows across servers; Vertical Partitioning: splitting columns across servers
- Cross-shard queries require scatter-gather operations, increasing query latency

## Why It Matters
- Allows databases to scale out beyond the hardware limits of a single physical server

## Common Pitfalls
- Choosing a poor Shard Key causes Hotspotting (a single shard receiving 90% of write traffic)

## Related Terms
- [[Consistent Hashing]]
- [[CAP Theorem]]

## Example
Sharding a multi-tenant SaaS database by `tenant_id` so each enterprise customer lives on an isolated shard.
