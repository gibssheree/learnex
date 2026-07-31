---
tags: [term, cloud, performance]
category: Cloud Networking
---

# Content Delivery Network (CDN) and Edge Computing

**Definition:** A globally distributed network of proxy servers that cache content close to users to minimize latency, combined with the ability to execute lightweight code at those edge locations.

## How It Works
- CDNs cache static assets (HTML, CSS, JS, images) at Points of Presence (PoPs) worldwide; when a user requests a file, it is served from the geographically closest server rather than the origin server.
- Edge Computing runs serverless functions directly on these CDN nodes, intercepting and modifying requests/responses before they hit the cache or origin.
- Revalidates or evicts cached content based on HTTP cache-control headers or explicit API purges.

## Why It Matters
- Drastically reduces load times for global users, decreases bandwidth costs on the origin server, and provides a massive buffer against DDoS attacks.

## Common Pitfalls
- Setting aggressive cache headers without a robust cache invalidation strategy, causing users to see stale data after a new deployment.

## Related Terms
- [[Serverless Computing and Cold Starts]]
- [[Caching]]

## Example
Cloudflare and Vercel use edge networks to serve frontend web assets instantly to users worldwide, while Cloudflare Workers allow executing JavaScript directly at the edge to modify HTTP headers.
