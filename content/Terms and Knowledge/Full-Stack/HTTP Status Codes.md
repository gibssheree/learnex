---
tags: [term, fullstack, api]
category: API & Networking
---

# HTTP Status Codes

**Definition:** 3-digit codes a server sends back to tell the client what happened with a request.

## How It Works
- The first digit defines the class of response; the other two digits don't have universal meaning beyond that class
- 1xx = informational, 2xx = success, 3xx = redirection, 4xx = client error, 5xx = server error
- Codes are sent in the HTTP status line of the response, e.g. `HTTP/1.1 404 Not Found` — the reason phrase (`Not Found`) is technically optional and ignorable, only the number matters to clients
- Codes are standardized by RFC 9110 (which obsoletes the older RFC 7231/2616 definitions) but any server can technically return whatever number it wants — clients just won't know what to do with non-standard ones
- Common ones: 200 OK, 201 Created, 204 No Content, 301 Moved Permanently, 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

## Why It Matters
- Correct codes make APIs predictable and debuggable — frontend error handling, retry logic, and monitoring dashboards all branch on the status class
- Load balancers, CDNs, and browsers behave differently per code: `5xx` can trigger automatic retries or failover, `3xx` triggers a follow-up request, `304` skips re-downloading a body entirely
- Observability tooling (Datadog, New Relic, uptime checks) buckets requests by status class to compute error rates — misusing codes silently corrupts those metrics
- Search engines treat `301` as "update your index" and `302`/`307` as "check back later," which directly affects SEO when redirecting URLs

## Common Pitfalls
- Returning `200 OK` with an error message in the body instead of the correct `4xx`/`5xx` code, which breaks client error handling, retries, and monitoring alike
- Confusing `401` (not authenticated) with `403` (authenticated but not authorized) — clients often need to react differently (redirect to login vs. show "access denied")
- Using `302` when you mean `301` (or vice versa) on a permanent URL change, causing search engines to keep indexing the old URL
- Returning `500` for validation errors that are actually the client's fault (should be `400`/`422`) — pollutes server error rate dashboards and triggers false alarms
- Treating `429 Too Many Requests` as a hard failure instead of respecting the `Retry-After` header and backing off
- Inventing custom codes outside the registered range, which intermediary proxies and HTTP client libraries may not know how to handle
- Returning `403` when `404` would leak less information — for genuinely sensitive resources, many teams deliberately return `404` for both "doesn't exist" and "exists but you can't see it" to avoid confirming existence to unauthorized users
- Not distinguishing `502` from `504` in monitoring — they point at different failure modes (upstream returned garbage vs. upstream never responded) and mixing them up wastes debugging time during an incident

## Under the Hood
- Status codes travel on the **status line**, the first line of an HTTP response: `HTTP-version SP status-code SP reason-phrase`. Everything else (headers, body) follows.
- The class (first digit) is a contract clients can rely on even for codes they don't specifically recognize — a client that's never heard of `499` still knows to treat it as a client error because it starts with `4`. This is why RFC 9110 requires clients to fall back to the *xx* general semantics for unrecognized specific codes.
- Some codes carry required companion headers: `301`/`302`/`307`/`308` require `Location`, `429` should include `Retry-After`, `401` must include `WWW-Authenticate`.
- `304 Not Modified` is a caching optimization: the client sends `If-None-Match`/`If-Modified-Since`, and if the resource is unchanged the server returns `304` with **no body** — the client reuses its cached copy. See [[Caching]].

## Variants / Types

### 1xx — Informational
- `100 Continue` — client should proceed with sending the request body (used with `Expect: 100-continue` for large uploads)
- `101 Switching Protocols` — used during a [[WebSocket]] handshake to upgrade from HTTP to `ws://`
- `103 Early Hints` — server sends preload/preconnect hints before the final response is ready

### 2xx — Success
- `200 OK` — generic success
- `201 Created` — a resource was created; should include a `Location` header pointing to it
- `202 Accepted` — request accepted for async processing, not yet complete (common for queued jobs)
- `204 No Content` — success, but nothing to return (common for `DELETE`)
- `206 Partial Content` — used for range requests (video/audio streaming, resumable downloads)

### 3xx — Redirection
- `301 Moved Permanently` — resource permanently lives elsewhere; clients/search engines should update references
- `302 Found` — temporary redirect; historically ambiguous about whether to preserve the HTTP method on the follow-up request
- `303 See Other` — explicitly tells the client to follow up with `GET`, regardless of the original method (common after a `POST`)
- `304 Not Modified` — cached version is still valid
- `307 Temporary Redirect` — like `302` but guarantees the method and body are preserved
- `308 Permanent Redirect` — like `301` but guarantees the method and body are preserved

### 4xx — Client Error
- `400 Bad Request` — malformed syntax
- `401 Unauthorized` — actually means "unauthenticated"
- `403 Forbidden` — authenticated, but not allowed
- `404 Not Found` — resource doesn't exist (or server is hiding that it does)
- `405 Method Not Allowed` — wrong HTTP verb for this endpoint
- `409 Conflict` — request conflicts with current state (e.g. version mismatch, duplicate unique key)
- `410 Gone` — resource used to exist and was intentionally removed (stronger signal than `404`)
- `422 Unprocessable Entity` — syntactically valid but semantically invalid (e.g. failed validation)
- `429 Too Many Requests` — [[Rate Limiting]] kicked in

### 5xx — Server Error
- `500 Internal Server Error` — generic catch-all, usually an unhandled exception
- `501 Not Implemented` — server doesn't support the functionality
- `502 Bad Gateway` — a [[Reverse Proxy]] or [[Load Balancer]] got an invalid response from an upstream server
- `503 Service Unavailable` — server is temporarily overloaded or down for maintenance
- `504 Gateway Timeout` — the upstream server didn't respond in time

## Comparison

| Codes | Question they answer | Who's at fault |
|---|---|---|
| 401 vs 403 | "Do I know who you are?" vs "Do I allow this?" | Client (auth) either way |
| 301 vs 302/307 | Permanent move vs temporary move | N/A |
| 302 vs 307 | May the method/body change on redirect? | N/A |
| 502 vs 503 vs 504 | Upstream sent garbage vs server is overloaded vs upstream never replied | Server/infrastructure |
| 400 vs 422 | Malformed request vs well-formed but invalid data | Client |

## Code Example
```http
POST /api/orders HTTP/1.1
Host: api.example.com
Content-Type: application/json

{ "sku": "abc-123", "qty": 0 }
```
```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{ "error": "qty must be greater than 0", "field": "qty" }
```

```js
// Express.js — mapping domain errors to correct status codes
app.post('/api/orders', async (req, res) => {
  try {
    const order = await createOrder(req.body);
    res.status(201).location(`/api/orders/${order.id}`).json(order);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(422).json({ error: err.message });
    if (err instanceof NotFoundError)  return res.status(404).json({ error: err.message });
    if (err instanceof ConflictError)  return res.status(409).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});
```

```bash
# curl -i shows the status line and headers, useful for debugging status code issues
curl -i https://api.example.com/orders/999
# HTTP/1.1 404 Not Found
# Content-Type: application/json
# {"error":"order not found"}

curl -i -X POST https://api.example.com/orders -d '{"sku":"abc-123"}'
# HTTP/1.1 201 Created
# Location: /api/orders/456
```

## Best Practices
- Use the most specific applicable code — `422` over `400` for validation failures, `409` over `400` for conflicts
- Keep a consistent error body shape across the API (RFC 7807 "Problem Details for HTTP APIs" is a good default: `{ type, title, status, detail }`)
- Always set `Location` on `201 Created` and `Retry-After` on `429`/`503` where possible
- Log and alert on `5xx` rates; treat `4xx` as expected traffic noise (with the exception of `401`/`429` spikes, which can signal an attack)
- Document exact status codes per endpoint in your OpenAPI/Swagger spec so client teams don't have to guess

## FAQ
**Does a `404` mean the resource never existed?** Not necessarily — many APIs intentionally return `404` instead of `403` for resources a user isn't authorized to see, to avoid leaking existence.

**Why do some APIs return `200` with `{"success": false}` in the body?** Usually legacy design inertia or a framework default that predates the team thinking carefully about status codes — it's broadly considered an anti-pattern because it forces every client to parse the body just to know whether a call succeeded, defeating the point of having status codes at all.

**What should a health-check endpoint return?** `200` if healthy, and either `503` or a non-2xx code if not — load balancers and orchestrators (Kubernetes liveness/readiness probes) key off the status code, not the body, to decide whether to route traffic to that instance.

**Is `429` safe to retry?** Yes, if you honor `Retry-After` — that's the entire point of the code, tied closely to [[Idempotency]].

**Should `DELETE` return `200` or `204`?** `204 No Content` is more correct when there's no body; return `200` only if you're sending back something (like the deleted record).

**Why does `303` exist if `302` already redirects?** `302`'s method-preservation behavior was ambiguous across early browsers; `303` and `307` were added specifically to remove that ambiguity in either direction.

## History
- HTTP/1.0 (1996) defined only 16 status codes; HTTP/1.1 (RFC 2616, 1999) expanded the set and clarified redirect semantics, later consolidated into RFC 7231 (2014) and finally RFC 9110 (2022)
- `418 I'm a Teapot` originated as an April Fools' joke in RFC 2324 (Hyper Text Coffee Pot Control Protocol, 1998) and is still occasionally implemented for fun (Google's APIs used to honor it)
- `451 Unavailable For Legal Reasons` (RFC 7725, 2015) was added to signal content blocked for legal/censorship reasons, a reference to Ray Bradbury's *Fahrenheit 451*
- `226 IM Used` and `102 Processing` are examples of niche codes defined for specific extensions (delta encoding, WebDAV) that most engineers never encounter in typical REST API work

## Common Interview Questions

| Question | Short answer |
|---|---|
| What's the difference between 401 and 403? | 401 = not authenticated ("who are you?"), 403 = authenticated but not authorized ("I know you, but no") |
| When would you use 201 vs 200? | 201 after successfully creating a resource (with `Location` header), 200 for a generic successful response |
| What's the difference between 301 and 307? | 301 is permanent and historically ambiguous about method preservation; 307 is temporary and guarantees the method/body are preserved |
| Why use 422 instead of 400? | 400 = malformed request syntax; 422 = well-formed but semantically invalid (failed validation) |
| What does 429 tell the client to do? | Back off and retry later, ideally honoring the `Retry-After` header |
| Is 500 ever the "correct" code for a client error? | No — 500 signals an unhandled server-side failure; client-caused issues belong in the 4xx range |
| What status code should a health check return when unhealthy? | Typically 503, so orchestrators/load balancers stop routing traffic to that instance |
| How do proxies/CDNs use status codes? | To decide caching behavior (2xx/304 cacheable), retry behavior (5xx retryable), and failover (502/504 trigger backup routing) |

## Related Terms
- [[REST API]]
- [[HTTP Methods]]
- [[Idempotency]]
- [[Rate Limiting]]
- [[Caching]]
- [[Reverse Proxy]]
- [[Load Balancer]]
- [[GraphQL]]

## Example
`401` means "you're not logged in," `403` means "you're logged in but not allowed" — a common pair to mix up. A concrete case: hitting `/admin/users` while logged out returns `401`; hitting it while logged in as a non-admin returns `403`.
