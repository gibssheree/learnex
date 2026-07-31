---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Middleware

**Definition:** Code that runs between receiving a request and sending a response, used for cross-cutting concerns.

## How It Works
- Requests pass through a chain of middleware functions, auth check, logging, parsing, before reaching the actual route handler

## Why It Matters
- Keeps common logic like auth and logging out of every individual route

## Common Pitfalls
- Forgetting to call `next()` in Express-style middleware, which hangs the request forever

## Related Terms
- [[REST API]]
- [[MVC]]

## Example
An auth middleware that checks for a valid JWT before letting the request reach the actual `/orders` route.
