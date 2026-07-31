---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# Session

**Definition:** Server-side stored user state, referenced by a session ID the client holds, usually in a cookie.

## How It Works
- Server creates a session record (memory, Redis, or DB) on login
- Client gets a session ID cookie
- Every request, the server looks up that ID to know who's logged in

## Why It Matters
- Easy to revoke instantly, just delete it server-side
- Simple mental model, good default for traditional server-rendered web apps

## Common Pitfalls
- Doesn't scale across multiple servers without a shared store like Redis
- Ties you to server-side state, awkward for pure APIs and mobile clients

## Related Terms
- [[Cookies]]
- [[JWT (JSON Web Token)]]

## Example
Logging into a Django or Rails app — the session cookie keeps you logged in across page loads.
