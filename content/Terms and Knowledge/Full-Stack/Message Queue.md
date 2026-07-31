---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Message Queue

**Definition:** A system that lets services send messages to each other asynchronously, decoupled from needing an immediate response.

## How It Works
- A producer pushes a message onto the queue
- A consumer picks it up and processes it whenever it's ready

## Why It Matters
- Lets slow or unreliable tasks (sending emails, processing videos) happen in the background without blocking the user's request

## Common Pitfalls
- Not handling message failures and retries, leading to lost or duplicate work

## Related Terms
- [[Microservices vs Monolith]]
- [[Webhook]]

## Example
RabbitMQ, SQS, or Kafka queuing up "send welcome email" jobs instead of sending them during signup and slowing the response.
