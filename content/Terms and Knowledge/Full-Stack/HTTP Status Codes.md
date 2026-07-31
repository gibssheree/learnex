---
tags: [term, fullstack, api]
category: API & Networking
---

# HTTP Status Codes

**Definition:** 3-digit codes a server sends back to tell the client what happened with a request.

## How It Works
- 2xx = success, 3xx = redirect, 4xx = client error, 5xx = server error
- Common ones: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

## Why It Matters
- Correct codes make APIs predictable and debuggable, frontend error handling depends on them

## Common Pitfalls
- Returning `200 OK` with an error message in the body instead of the correct `4xx`/`5xx` code, which breaks client error handling

## Related Terms
- [[REST API]]
- [[HTTP Methods]]

## Example
`401` means "you're not logged in," `403` means "you're logged in but not allowed" — a common pair to mix up.
