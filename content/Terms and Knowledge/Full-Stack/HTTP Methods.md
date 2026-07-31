---
tags: [term, fullstack, api]
category: API & Networking
---

# HTTP Methods

**Definition:** The verbs that describe what action an HTTP request wants to perform on a resource.

## How It Works
- `GET` reads, `POST` creates, `PUT` replaces, `PATCH` partially updates, `DELETE` removes
- Each has expected behavior that clients, servers, and browsers all rely on

## Why It Matters
- Misusing them breaks REST conventions, caching, and browser behavior

## Common Pitfalls
- Using `GET` for actions that change data — breaks caching and can be triggered accidentally by crawlers or link prefetching

## Related Terms
- [[REST API]]
- [[Idempotency]]

## Example
`POST /login` creates a new session; `GET /profile` just reads data with no side effects.
