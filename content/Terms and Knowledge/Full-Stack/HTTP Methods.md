---
tags: [term, fullstack, api]
category: API & Networking
---

# HTTP Methods

**Definition:** The verbs that describe what action an HTTP request wants to perform on a resource.

## How It Works
- `GET` reads, `POST` creates, `PUT` replaces, `PATCH` partially updates, `DELETE` removes
- Each has expected behavior that clients, servers, and browsers all rely on
- The method sits in the request line (`GET /users/42 HTTP/1.1`) and is the first thing a server, proxy, or browser inspects to decide how to route, cache, and retry the request
- Two orthogonal properties define each method's contract: **safety** (does it change server state?) and **idempotency** (does repeating the same request N times produce the same end state as once?) — see [[Idempotency]]
- Browsers and intermediaries (proxies, CDNs) bake these contracts into their behavior: they'll silently retry a failed `GET` but never auto-retry a `POST`, and they'll prefetch/cache `GET` responses but never a `POST`

## Why It Matters
- Misusing them breaks REST conventions, caching, and browser behavior
- Correct verb usage is what makes HTTP caching work at all — CDNs and browsers cache `GET` responses keyed by URL by default, and never cache `POST`/`PUT`/`DELETE` responses
- Idempotent methods (`GET`, `PUT`, `DELETE`) are safe for clients, proxies, and load balancers to automatically retry on a network failure — a dropped `POST` cannot be blindly retried without risking a duplicate side effect (e.g., double-charging a card)
- Search engine crawlers and link-prefetchers only ever issue `GET` requests — any endpoint that mutates data behind a `GET` can be triggered accidentally just by a bot following a link
- Framework routing itself depends on the method: Express, Rails, Django, and virtually every web framework let you register separate handlers for `GET /users/:id` and `DELETE /users/:id` on the identical path, so the method is effectively part of the route's identity
- Correct method choice communicates intent to every layer of the stack: API gateways, WAFs, and logging/monitoring tools often make routing and alerting decisions based on method alone (e.g., alert on `DELETE` spikes)

## Common Pitfalls
- Using `GET` for actions that change data — breaks caching and can be triggered accidentally by crawlers or link prefetching
- Treating `PUT` and `PATCH` as interchangeable — `PUT` is a full replacement of the resource (fields omitted from the body are typically cleared), while `PATCH` applies a partial update; sending a partial body to a `PUT` endpoint can silently null out fields the client didn't mean to touch
- Assuming `POST` is always non-idempotent by definition and therefore never safe to retry — true by spec, but plenty of real APIs make specific `POST` endpoints idempotent via a client-supplied idempotency key, and it's worth checking docs rather than assuming
- Returning a `200 OK` for every response regardless of what actually happened, discarding the semantic value that [[HTTP Status Codes]] combined with the right method would otherwise convey
- Forgetting `OPTIONS` exists and is exactly what triggers a [[CORS (Cross-Origin Resource Sharing)|CORS]] preflight — a cross-origin `PUT`/`DELETE`/custom-header request silently fails until the server correctly answers the browser's automatic `OPTIONS` preflight
- Relying on `301`/`302` redirects after a `POST` and being surprised when the follow-up request arrives as a bodyless `GET` at the destination
- Assuming `DELETE` requests can carry a meaningful body — support is inconsistent across servers, proxies, and HTTP client libraries, so query params or a resource ID in the URL are the safer way to pass what to delete

## Under the Hood

| Method | Safe | Idempotent | Cacheable | Typical body |
|---|---|---|---|---|
| `GET` | Yes | Yes | Yes | No |
| `HEAD` | Yes | Yes | Yes | No |
| `OPTIONS` | Yes | Yes | No | No |
| `POST` | No | No | Rarely | Yes |
| `PUT` | No | Yes | No | Yes |
| `PATCH` | No | No (by spec, often is in practice) | No | Yes |
| `DELETE` | No | Yes | No | Rarely |

- **Safe** means the method must not change server-side state (read-only) — safety is what lets crawlers and prefetchers call it freely without consequence
- **Idempotent** means calling it once has the same end result as calling it N times — `DELETE /users/42` called five times still ends with user 42 gone, same as calling it once (even though the 2nd–5th calls may return `404`), so it counts as idempotent
- `PUT` is idempotent because "replace the resource with this exact representation" always converges to the same state no matter how many times you send it; `POST` is not, because "create a new resource" run twice typically creates two resources
- These properties are conventions defined by the HTTP spec (RFC 9110), not enforced by the protocol itself — nothing stops a server from making `GET` mutate data, it just violates the contract every client, cache, and intermediary assumes

## Variants
- **`HEAD`** — identical to `GET` but returns only headers, no body; used to check if a resource exists or get its size/`Last-Modified` without downloading it
- **`OPTIONS`** — asks the server which methods/headers are allowed on a resource; browsers issue this automatically as a CORS preflight before certain cross-origin requests
- **`TRACE`** — echoes back the received request for debugging; disabled on most production servers due to the Cross-Site Tracing (XST) vulnerability it enables
- **`CONNECT`** — establishes a tunnel to the server, primarily used to set up HTTPS connections through an HTTP proxy
- **Non-standard "verb tunneling"** — some clients/proxies that can't send `PUT`/`DELETE` directly fake it with `POST` plus an `X-HTTP-Method-Override` header, a workaround for older infrastructure rather than a real HTTP method
- **WebDAV extensions** — `PROPFIND`, `MKCOL`, `COPY`, `MOVE`, `LOCK` extend HTTP for remote file/document management, rarely seen outside of protocols like CalDAV/CardDAV that build on WebDAV

## Comparison

| Scenario | Correct Method | Why not the alternative |
|---|---|---|
| Fetch a user profile | `GET` | `POST` isn't cacheable and implies a side effect |
| Log a user in | `POST` | Creates a session; `GET` would be cached/prefetched and leak credentials into logs/URLs |
| Replace a user's entire profile | `PUT` | `PATCH` implies partial update semantics |
| Update just a user's email | `PATCH` | `PUT` risks clearing fields omitted from the body |
| Remove a resource | `DELETE` | `POST /users/42/delete` works but discards standard semantics, caching, and tooling support |
| Check if a large file exists before downloading | `HEAD` | `GET` would transfer the full body just to inspect headers |
| Discover which methods a cross-origin endpoint allows | `OPTIONS` | Browsers issue this automatically; manually is mostly for debugging CORS |

## Best Practices
- Match the method to the actual semantics, not convenience — reserve `POST` for genuine creation/non-idempotent actions
- Make `POST` endpoints idempotent where the operation matters (payments, order creation) using a client-generated idempotency key the server deduplicates on
- Never mutate state on `GET`, even for "harmless" actions like incrementing a view counter — use a `POST`/`PATCH` or accept that crawlers will inflate the count
- Return the right [[HTTP Status Codes]] alongside the method: `201 Created` for a successful `POST`, `204 No Content` for a successful `DELETE` with no body, `200 OK` for a successful `PUT`/`PATCH` that returns the updated resource
- Implement `OPTIONS` correctly (or let your framework do it) so CORS preflights succeed instead of mysteriously failing only in the browser
- Use `307`/`308` rather than `301`/`302` when redirecting a non-`GET` request, so the method and body are preserved instead of silently downgraded

## FAQ
**Is `POST` ever idempotent?**
Not by spec default, but APIs commonly make specific `POST` endpoints idempotent by requiring an `Idempotency-Key` header — the server stores the key and returns the original result if it sees the same key again, rather than performing the action twice.

**Why does my `DELETE` request fail with a CORS error but `GET` works fine?**
`DELETE` (like `PUT`, `PATCH`, and custom headers) counts as a "non-simple" request under CORS rules, which forces the browser to send an `OPTIONS` preflight first — if the server doesn't answer it with the right `Access-Control-Allow-Methods` header, the actual `DELETE` never fires.

**What's the real difference between `PUT` and `PATCH` in practice?**
`PUT` says "here is the complete new state of this resource"; `PATCH` says "apply this delta to the existing state." Many APIs are sloppy about this distinction, but well-designed ones enforce it — sending `{"email": "x@y.com"}` to a `PUT` endpoint may wipe every other field.

**Why do browsers sometimes switch a redirected `POST` into a `GET`?**
Legacy behavior around `301`/`302` redirects caused many clients to downgrade the follow-up request to `GET`, silently dropping the original body — `307`/`308` were added specifically to preserve the original method and body across a redirect, which matters for APIs that redirect non-`GET` requests.

**Does the spec allow a body on a `GET` request?**
Technically RFC 9110 doesn't forbid it, but it explicitly says the body has no defined semantics for `GET`, and in practice many HTTP clients, proxies, and servers strip or reject it — relying on a `GET` body is not portable across the ecosystem.

## History
- HTTP/0.9 (1991) supported only `GET`, and only for plain HTML — no headers, no status codes, no other verbs
- HTTP/1.0 (RFC 1945, 1996) added `POST` and `HEAD` along with headers and status codes, turning HTTP into something closer to what it is today
- HTTP/1.1 (RFC 2068, 1997; refined in RFC 2616, 1999) formalized `PUT`, `DELETE`, `OPTIONS`, `TRACE`, `CONNECT`, and — critically — the safety/idempotency semantics that REST and modern caching infrastructure still rely on
- `PATCH` was a later addition (RFC 5789, 2010), created specifically because `PUT`'s "full replacement" semantics were awkward for the common case of updating just one or two fields
- The current authoritative spec is RFC 9110 (2022), which consolidated and superseded the older RFC 2616/7230-series documents without changing the core method semantics

## Real-World Example
A typical REST resource lifecycle for a blog post touches nearly every common method in sequence:

```
POST   /posts              -> 201 Created       (new post, Location header points to it)
GET    /posts/123          -> 200 OK            (read it back)
PATCH  /posts/123          -> 200 OK            (edit just the title)
PUT    /posts/123          -> 200 OK            (replace the whole post representation)
DELETE /posts/123          -> 204 No Content     (remove it)
GET    /posts/123          -> 404 Not Found     (confirms it's gone)
```
A load balancer or API gateway sitting in front of this API can safely retry the `GET` and `DELETE` calls on a network blip without any risk of a duplicate side effect, but retrying the `POST` blindly could create a second post — which is exactly why idempotency keys exist for creation endpoints that need retry safety.

## Related Terms
- [[REST API]]
- [[Idempotency]]
- [[HTTP Status Codes]]
- [[CORS (Cross-Origin Resource Sharing)|CORS]]

## Example
`POST /login` creates a new session; `GET /profile` just reads data with no side effects.

## Code Example
```http
GET /users/42 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60

{"id": 42, "name": "Ada", "email": "ada@example.com"}
```

```bash
# Full replacement — every field must be present
curl -X PUT https://api.example.com/users/42 \
  -H "Content-Type: application/json" \
  -d '{"name": "Ada Lovelace", "email": "ada@example.com"}'

# Partial update — only the given field changes
curl -X PATCH https://api.example.com/users/42 \
  -H "Content-Type: application/json" \
  -d '{"email": "ada.lovelace@example.com"}'

# Idempotent create via a client-supplied key
curl -X POST https://api.example.com/orders \
  -H "Idempotency-Key: 7c1b3f2a-9e21-4b3a-8b8e-2f6a1d9c0e11" \
  -H "Content-Type: application/json" \
  -d '{"itemId": "sku_123", "quantity": 1}'
```
