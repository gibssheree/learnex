---
tags: [term, cloud, microservices]
category: Microservices & Architecture
---

# Service Mesh

**Definition:** A dedicated infrastructure layer built into an application that handles service-to-service communication, observability, and security in complex microservice architectures.

## How It Works
- Deploys a lightweight "sidecar" proxy (like Envoy) alongside every microservice instance.
- The proxies intercept all inbound and outbound network traffic without the application code knowing they exist.
- The Control Plane configures these proxies to enforce mTLS (mutual TLS) encryption, circuit breaking, retries, and traffic splitting (e.g., sending 10% of traffic to a new version).

## Why It Matters
- Moves complex network logic (retries, timeouts, encryption) out of application code and into the infrastructure layer, making microservices easier to write and secure.

## Common Pitfalls
- Adopting a service mesh prematurely for a simple application, adding unnecessary operational complexity and compute overhead (memory/CPU for the proxies).

## Related Terms
- [[Container Orchestration and Kubernetes]]
- [[Observability and Monitoring]]
- [[API Gateway]]

## Example
Istio and Linkerd are popular service meshes that automatically encrypt traffic between Kubernetes pods using mTLS without requiring code changes in the applications.
