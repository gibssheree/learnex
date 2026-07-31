---
tags: [term, fullstack, architecture, infrastructure]
category: Architecture & Backend
---

# Load Balancer

**Definition:** A component that distributes incoming traffic across multiple servers so no single one gets overwhelmed.

## How It Works
- Sits in front of your servers, routes each request based on a strategy like round robin or least connections

## Why It Matters
- Needed for any app running on more than one server instance, and for zero-downtime deploys

## Common Pitfalls
- Sessions stored in one server's memory break if the load balancer routes a user to a different server next request — needs sticky sessions or a shared session store

## Related Terms
- [[Microservices vs Monolith]]
- [[Session]]

## Example
Nginx or AWS's Application Load Balancer spreading traffic across 5 identical backend instances.
