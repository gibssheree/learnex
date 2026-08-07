---
tags: [term, fullstack, api]
category: API & Networking
---

# REST API

**Definition:** An architectural style for building APIs around resources (nouns) and HTTP methods (verbs).

## How It Works
- URLs represent resources: `/users/5`
- HTTP methods represent actions on them: GET, POST, PUT, DELETE
- Requests and responses carry a representation of the resource, usually JSON
- Each request is stateless — the server holds no memory of previous requests from that client; every request carries everything needed to process it (auth token, params, body)
- Nested resources model relationships: `/users/5/orders` for user 5's orders
- Query params handle filtering, sorting, and pagination: `/users?role=admin&sort=-createdAt&page=2`

## Why It Matters
- The most common API style — nearly every backend job expects you to know it
- Statelessness makes REST APIs trivially horizontally scalable — any server behind a [[Load Balancer]] can handle any request, no session affinity required
- Maps cleanly onto CRUD (Create/Read/Update/Delete), which covers the majority of what typical web apps need
- HTTP's existing infrastructure (caching, status codes, headers) does a lot of work for free that a custom protocol would have to reinvent

## Roy Fielding's Six Constraints
REST isn't just "JSON over HTTP" — it's a formal architectural style from Fielding's 2000 dissertation, defined by six constraints:

1. **Client-server** — separation of concerns between UI and data storage
2. **Statelessness** — no client context stored on the server between requests
3. **Cacheability** — responses must define themselves as cacheable or not
4. **Uniform interface** — the defining REST trait: resources identified by URI, manipulated through representations, self-descriptive messages, and HATEOAS
5. **Layered system** — client can't tell if it's talking directly to the server or through an intermediary ([[Reverse Proxy]], gateway, [[CDN]])
6. **Code on demand** (optional) — server can extend client functionality by transferring executable code (rarely used in practice)

Almost no production "REST API" actually implements HATEOAS (Hypermedia as the Engine of Application State — responses containing links to related actions/resources), which is why the term **RESTful** is often used loosely for "resource-oriented HTTP API" rather than strict REST compliance.

## Richardson Maturity Model
A common way to grade how "REST" an API actually is:

| Level | Characteristic | Example |
|---|---|---|
| 0 | Single endpoint, HTTP as a tunnel | `POST /api` with an action field in the body |
| 1 | Multiple resource URIs | `/users`, `/orders` |
| 2 | Proper HTTP verbs and status codes | `GET /users/5` returns 200, `DELETE /users/5` returns 204 |
| 3 | HATEOAS — responses include links to related actions | Response includes `"links": {"self": "/orders/9", "cancel": "/orders/9/cancel"}` |

Most APIs called "REST" in industry sit at level 2 and stop there — level 3 exists more in theory and in a handful of hypermedia-heavy APIs than in typical practice.

## Common Pitfalls
- Overusing POST for everything instead of proper HTTP verbs
- Not versioning your API (`/v1/...`) from the start, making later breaking changes painful
- Returning `200 OK` for errors with the actual error buried in the response body — clients that check status codes (and caches, and proxies) get misled
- Modeling actions as verbs in the URL (`/createUser`) instead of resources (`POST /users`) — a sign the API is drifting toward RPC-over-HTTP
- Deep nesting like `/users/5/orders/9/items/2/reviews/1` — past two or three levels, prefer flatter URLs with query params or resource-specific top-level routes
- Leaking database structure directly into the API shape, coupling clients to internal schema changes
- Ignoring [[Idempotency]] — a `POST` that isn't idempotent but gets retried by a flaky client can create duplicate resources
- No pagination on list endpoints, so `/users` happily tries to return 2 million rows

## Under the Hood: Status Codes and Verbs
- `GET` — safe and idempotent, never mutates state, safe to cache and safe to retry
- `POST` — creates a resource or triggers a non-idempotent action; retrying a POST can create duplicates unless the API supports idempotency keys
- `PUT` — idempotent full replacement of a resource; sending the same PUT twice yields the same end state
- `PATCH` — partial update, not guaranteed idempotent depending on the patch format (JSON Patch vs merge-patch)
- `DELETE` — idempotent; deleting an already-deleted resource should still report success (or a 404, debatable, but not an error that implies something went wrong)
- Status code families matter: 2xx success, 3xx redirection, 4xx client error (the caller did something wrong), 5xx server error (the server did something wrong) — see [[HTTP Status Codes]] and [[HTTP Methods]]

## Versioning Strategies

| Strategy | Example | Tradeoff |
|---|---|---|
| URI path | `/v1/users` | Most visible, easiest to route/cache separately, "pollutes" the URL |
| Query param | `/users?version=1` | Same resource, harder to cache distinctly |
| Header | `Accept: application/vnd.api+json;version=1` | Cleanest URLs, invisible to casual API consumers, harder to test in a browser |
| No versioning, additive-only changes | — | Works until you need a genuinely breaking change |

Path-based versioning wins in practice for its simplicity and debuggability, even though header-based versioning is technically "more RESTful."

## Comparison: REST vs GraphQL vs gRPC

| | REST | [[GraphQL]] | [[gRPC]] |
|---|---|---|---|
| Data shape | Fixed per endpoint | Client-specified query | Fixed per RPC method (protobuf) |
| Over-fetching | Common | Rare (client asks for exact fields) | Rare |
| Caching | Native HTTP caching | Harder (single endpoint, POST-based) | Custom |
| Browser-friendly | Yes | Yes | Needs gRPC-Web proxy |
| Typical use | Public APIs, CRUD backends | Complex/nested client data needs | Internal service-to-service |

## Code Example
```http
GET /api/v1/users/5/orders?status=pending&page=1&limit=20 HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOi...
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=60

{
  "data": [
    { "id": 9, "status": "pending", "total": 42.50 }
  ],
  "page": 1,
  "totalPages": 3
}
```

Creating a resource, with proper idempotency handling:

```http
POST /api/v1/orders HTTP/1.1
Content-Type: application/json
Idempotency-Key: 6c9a9c1e-3f2a-4b3e-9e2a-1a2b3c4d5e6f

{ "userId": 5, "items": [{ "productId": 12, "qty": 2 }] }
```

## Best Practices
- Version from day one, even if it's just `/v1/`
- Use plural nouns for collections (`/users`, not `/user`)
- Return consistent error shapes across all endpoints (`{ "error": { "code": "...", "message": "..." } }`)
- Support pagination, filtering, and sorting on every list endpoint before it becomes a scaling problem
- Use `Idempotency-Key` headers for POST endpoints that mutate money, orders, or anything expensive to duplicate
- Document with OpenAPI/Swagger so clients get generated types and interactive docs for free

## Related Terms
- [[HTTP Methods]]
- [[HTTP Status Codes]]
- [[GraphQL]]
- [[gRPC]]
- [[Idempotency]]
- [[CORS (Cross-Origin Resource Sharing)]]
- [[Rate Limiting]]

## FAQ
**Is REST the same as JSON over HTTP?**
No — REST is an architectural style with formal constraints; JSON is just the most common representation format used to satisfy it. You can have a REST API that returns XML, and you can have a non-RESTful API (RPC-style) that returns JSON.

**When would GraphQL be a better fit than REST?**
When clients need very different shapes of the same underlying data (a mobile app needing a thin payload vs a dashboard needing deeply nested data) and over/under-fetching from fixed REST endpoints becomes a real cost.

**Why does everyone say "RESTful" instead of "REST"?**
Because almost nobody actually implements HATEOAS (level 3 of the Richardson Maturity Model), so "RESTful" became the industry's honest admission that most APIs are resource-oriented HTTP APIs, not textbook REST.

## History
- Roy Fielding introduced REST in his 2000 PhD dissertation, describing it as the architectural style behind the web itself (HTTP, URIs, hypermedia) rather than a new invention
- Before REST's popularization, SOAP (heavy XML envelopes, WSDL contracts, strict typing) dominated enterprise web services — REST won out for public/web APIs due to its simplicity and native fit with HTTP and browsers
- The 2010s API boom (Twitter, Stripe, GitHub public APIs) cemented "REST + JSON" as the default choice for anything client-facing
- GraphQL (2015, Facebook) emerged specifically to address REST's over-fetching/under-fetching pain for complex client data needs, not to replace REST universally

## Example
`GET /api/users/5` returns user 5's data. `DELETE /api/users/5` deletes them. A more complete flow: a frontend calls `POST /api/v1/orders` with a cart payload, gets back `201 Created` with a `Location: /api/v1/orders/9182` header, then polls or subscribes for `GET /api/v1/orders/9182` to track fulfillment status.
