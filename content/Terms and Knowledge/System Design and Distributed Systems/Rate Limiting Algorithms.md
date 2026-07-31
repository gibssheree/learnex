---
tags: [term, system-design, api]
category: API Reliability & Control
subcategory: API & Reliability Patterns
---

# Rate Limiting Algorithms

**Definition:** Techniques used to control the rate of incoming or outgoing requests to protect API services from abuse and resource exhaustion.

## How It Works
- Token Bucket: bucket fills with tokens at constant rate; each request consumes a token; allows controlled burst capacity
- Leaky Bucket: requests enter a FIFO queue processed at a constant leak rate; smooths traffic spikes
- Sliding Window Log / Counter: tracks request timestamps within rolling window to enforce strict request caps

## Why It Matters
- Prevents DDoS attacks, brute-force attempts, and noisy-neighbor service starvation

## Common Pitfalls
- Enforcing rate limits in local server memory instead of a shared Redis cache causes inconsistent limits across load-balanced nodes

## Related Terms
- [[Consistent Hashing]]

## Example
GitHub API limiting unauthenticated requests to 60 calls per hour using Redis token buckets.
