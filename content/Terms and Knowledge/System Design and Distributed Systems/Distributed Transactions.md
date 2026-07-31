---
tags: [term, system-design, distributed]
category: Consensus & Coordination
subcategory: Distributed Architecture
---

# Distributed Transactions

**Definition:** Mechanisms designed to enforce ACID transactional consistency across operations spanning multiple distinct microservices or database nodes.

## How It Works
- Two-Phase Commit (2PC): Coordinator sends Prepare -> Participants vote YES/NO -> Coordinator sends Commit/Abort (blocking protocol)
- Saga Pattern: breaks transaction into a sequence of local microservice transactions; if a step fails, compensation transactions run backward to undo prior steps (event-driven, non-blocking)

## Why It Matters
- Maintains business state consistency across decoupled microservice architectures

## Common Pitfalls
- 2PC introduces severe latency and single-point-of-failure coordinator locks in high-throughput cloud systems

## Related Terms
- [[CAP Theorem]]
- [[Distributed Consensus]]

## Example
E-commerce checkout Saga: 1) Reserve inventory -> 2) Charge credit card -> 3) Create shipping order. If step 2 fails, run compensation to unreserve inventory.
