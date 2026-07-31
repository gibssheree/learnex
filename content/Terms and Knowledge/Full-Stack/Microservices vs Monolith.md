---
tags: [term, fullstack, architecture]
category: Architecture & Backend
---

# Microservices vs Monolith

**Definition:** A monolith is one single deployable app containing all functionality. Microservices split functionality into many small, independently deployable services.

## How It Works
- Monolith: one codebase, one deploy
- Microservices: separate services communicate over the network via REST, gRPC, or queues

## Why It Matters
- A foundational architecture decision that affects deployment, scaling, debugging, and team structure

## Common Pitfalls
- Adopting microservices too early, a "premature distributed system," adds huge operational complexity most small teams don't need yet

## Related Terms
- [[gRPC]]
- [[Message Queue]]
- [[Load Balancer]]

## Example
A startup MVP is usually a monolith; a company like Netflix runs hundreds of microservices at massive scale.
