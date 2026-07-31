---
tags: [term, cloud, api]
category: Microservices & Architecture
---

# API Gateway

**Definition:** A server that acts as a single entry point into a system, sitting between clients and a collection of backend microservices.

## How It Works
- Accepts all inbound API calls from clients, routes them to the appropriate internal microservices based on path/host/header rules, and returns the aggregated results.
- Handles cross-cutting concerns globally: SSL/TLS termination, authentication (JWT validation, API key checks), rate limiting and throttling per client, and CORS headers, so individual services don't each reimplement them.
- Can transform requests/responses — translating public REST API calls into internal gRPC calls, or aggregating several backend calls into one response for the client (the "Backend for Frontend" variant of this pattern).
- Managed offerings (AWS API Gateway, Azure API Management, Google Apigee) bill per request and integrate directly with serverless compute (e.g., routing straight to Lambda); self-hosted gateways (Kong, Envoy Gateway, Traefik) run as their own deployable service, often as an Ingress controller in front of a [[Kubernetes (K8s)]] cluster.
- Supports canary/blue-green routing by directing a percentage of traffic to a new backend version before a full cutover.

## Why It Matters
- Prevents clients from having to know the exact IP addresses and network topology of dozens of internal microservices, while centralizing security and traffic control at one auditable choke point instead of duplicating it per service.
- Gives operators a single place to apply global rate limits, WAF rules, and observability instrumentation without touching application code.

## Common Pitfalls
- Putting heavy business logic or data transformation directly into the API Gateway layer, turning it into a tightly coupled monolithic bottleneck (the "Enterprise Service Bus" anti-pattern) that every team must coordinate through to ship.
- Making the gateway a single point of failure by under-provisioning it or skipping horizontal scaling/[[Auto-Scaling]], since every request in the system now passes through it.
- Setting global timeout/retry policies that don't account for slow downstream services, causing cascading request pile-ups instead of fast, isolated failures.

## Related Terms
- [[Service Mesh]]
- [[Rate Limiting Algorithms]]
- [[Load Balancer]]
- [[Microservices Architecture]]

## Example
AWS API Gateway or Kong sits in front of backend APIs, verifying user JWT tokens and enforcing a `1000 req/min` per-client rate limit before allowing traffic to reach the internal Node.js or Python microservices — so a misbehaving client gets throttled at the edge instead of overwhelming the Billing service directly.
