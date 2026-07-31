---
tags: [term, fullstack, api]
category: API & Networking
---

# GraphQL

**Definition:** A query language for APIs where the client asks for exactly the fields it needs, in a single request.

## How It Works
- One endpoint total
- Client sends a query describing the shape of data it wants
- Server returns exactly that shape, nothing more

## Why It Matters
- Solves REST's "over-fetching / under-fetching" problem, popular for apps with complex nested data

## Common Pitfalls
- Harder to cache than REST since there's no simple URL-per-resource
- Can allow expensive nested queries if not rate-limited or depth-limited

## Related Terms
- [[REST API]]

## Example
A mobile app fetches a user's name, 3 recent posts, and follower count in one GraphQL query instead of 3 separate REST calls.
