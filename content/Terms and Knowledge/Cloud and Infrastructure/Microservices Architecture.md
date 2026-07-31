---
tags: [term, cloud, architecture]
category: Microservices & Architecture
---

# Microservices Architecture

**Definition:** A software development approach where a single application is composed of many small, loosely coupled, and independently deployable services that communicate over a network.

## How It Works
- Each microservice is built around a specific business capability (e.g., User Auth, Billing, Inventory) and owns its own database to ensure loose coupling.
- Services communicate via lightweight protocols like HTTP/REST, gRPC, or asynchronous message queues (Kafka, RabbitMQ).
- Individual services can be written in different programming languages (Polyglot) and scaled independently.

## Why It Matters
- Enables massive engineering teams to work on different parts of an application simultaneously without merge conflicts, while allowing isolated scaling of high-traffic features.

## Common Pitfalls
- Creating a "Distributed Monolith" by tightly coupling microservices so heavily that if one service goes down, the entire system still crashes.

## Related Terms
- [[API Gateway]]
- [[Service Mesh]]
- [[Event-Driven Architecture]]

## Example
Netflix transitioned from a monolithic architecture to hundreds of microservices, so the "Recommendation Engine" service can scale independently from the "Video Streaming" service.
