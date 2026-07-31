---
tags: [term, fullstack, api]
category: API & Networking
---

# REST API

**Definition:** An architectural style for building APIs around resources (nouns) and HTTP methods (verbs).

## How It Works
- URLs represent resources: `/users/5`
- HTTP methods represent actions on them: GET, POST, PUT, DELETE

## Why It Matters
- The most common API style — nearly every backend job expects you to know it

## Common Pitfalls
- Overusing POST for everything instead of proper HTTP verbs
- Not versioning your API (`/v1/...`) from the start, making later breaking changes painful

## Related Terms
- [[HTTP Methods]]
- [[HTTP Status Codes]]
- [[GraphQL]]

## Example
`GET /api/users/5` returns user 5's data. `DELETE /api/users/5` deletes them.
