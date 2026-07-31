---
tags: [term, system-design, architecture]
category: Scalability & Partitioning
subcategory: Scalability Patterns
---

# Consistent Hashing

**Definition:** A distributed hashing technique where remapping keys due to adding or removing nodes minimizes key reshuffling to only `k/n` keys.

## How It Works
- Keys and Nodes are mapped onto a conceptual 360-degree Hash Ring space (0 to 2^32-1)
- A key is assigned to the first node encountered moving clockwise around the ring
- Virtual Nodes: each physical node is assigned multiple points on the ring to distribute load uniformly

## Why It Matters
- Essential for scaling distributed caching layers (Memcached, Redis clusters) and distributed key-value stores without cache stampedes on scaling

## Common Pitfalls
- Without virtual nodes, non-uniform distribution leads to hot nodes on the hash ring

## Related Terms
- [[Data Sharding and Partitioning]]
- [[Rate Limiting Algorithms]]

## Example
DynamoDB and Discord cache routing use consistent hashing to dynamically add/remove cache nodes without dropping existing cached sessions.
