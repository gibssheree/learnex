---
tags: [term, fullstack, performance]
category: Database & Data
---

# Caching

**Definition:** Storing a copy of expensive-to-compute or frequently-requested data somewhere faster to access, so you don't redo the work every time.

## How It Works
- Layers exist at many levels: browser cache, CDN, in-memory store (Redis), database query cache

## Why It Matters
- One of the most effective ways to make an app feel fast and reduce database load

## Common Pitfalls
- Cache invalidation: serving stale data after the underlying data changes is a famously hard problem

## Related Terms
- [[CDN]]
- [[Database Indexing]]

## Example
Caching a product page's data in Redis for 60 seconds instead of hitting the database on every visitor.
