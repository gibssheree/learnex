---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# CORS (Cross-Origin Resource Sharing)

**Definition:** A browser security rule that blocks a webpage from calling an API on a different domain unless that API explicitly allows it.

## How It Works
- Browser sends an `Origin` header with the request
- Server responds with `Access-Control-Allow-Origin` to say who's allowed
- Browser blocks the response if the origin doesn't match

## Why It Matters
- Every full-stack dev hits a CORS error eventually when frontend and backend run on different ports or domains

## Common Pitfalls
- Setting `Access-Control-Allow-Origin: *` on an authenticated API — fine for public APIs, risky otherwise

## Related Terms
- [[REST API]]
- [[Cookies]]

## Example
A React app on `localhost:3000` calling an API on `localhost:5000` gets blocked until the backend adds CORS headers.
