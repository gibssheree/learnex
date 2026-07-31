---
tags: [term, cloud, architecture]
category: Microservices & Architecture
---

# Event-Driven Architecture

**Definition:** A software design pattern in which decoupled systems asynchronously communicate by emitting and responding to events (state changes) rather than using direct, synchronous API calls.

## How It Works
- **Producers:** Services that generate and publish an event (e.g., "UserCreated") to an event broker.
- **Event Broker:** The intermediary system (like Apache Kafka, AWS EventBridge, or RabbitMQ) that stores and routes events.
- **Consumers:** Services that subscribe to specific topics and react to events asynchronously when they arrive.
- Follows a Pub/Sub (Publish-Subscribe) model where the producer does not know or care who is listening to the event.

## Why It Matters
- Massively improves system resiliency and performance by eliminating synchronous blocking chains (where Service A waits for Service B to wait for Service C).

## Common Pitfalls
- Failing to handle eventual consistency, as data changes might take seconds to propagate across all consuming services.

## Related Terms
- [[Microservices Architecture]]
- [[Serverless Computing and Cold Starts]]

## Example
When a user registers on a website, the Auth service publishes a "UserSignedUp" event; the Email service hears this and sends a welcome email, while the Analytics service logs the signup—all independently.
