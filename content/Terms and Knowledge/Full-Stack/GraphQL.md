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
- Requests are usually `POST` to a single URL (commonly `/graphql`) with a JSON body containing the query string and any variables — unlike [[REST API]], the HTTP verb and URL carry almost no meaning
- A **schema**, written in GraphQL's Schema Definition Language (SDL), defines every type, field, and operation the API supports; the schema is strongly typed and serves as both documentation and a runtime contract
- Every field in the schema is backed by a **resolver** function on the server; when a query comes in, the GraphQL engine walks the query tree and calls the resolver for each requested field, recursively, to assemble the response
- Three root operation types: `Query` (read), `Mutation` (write, executed serially rather than in parallel), and `Subscription` (a persistent connection, usually over WebSocket, that pushes updates as they occur)

## Why It Matters
- Solves REST's "over-fetching / under-fetching" problem, popular for apps with complex nested data
- One round trip replaces the "waterfall" of REST calls a client often needs to assemble a single screen (user -> posts -> comments -> authors), which matters enormously on high-latency mobile networks
- The schema acts as a single source of truth and a contract between frontend and backend teams — client code can be generated from it, and breaking changes are visible at the type level before they ship
- Strongly typed introspection lets tools like GraphiQL, Apollo Studio, and GraphQL Code Generator auto-generate documentation, typed client hooks, and IDE autocomplete directly from the live schema
- Field-level resolvers let a backend team compose an API from multiple underlying services or databases without the client needing to know or care where each field actually comes from

## Common Pitfalls
- Harder to cache than REST since there's no simple URL-per-resource — HTTP-level caching (CDNs, browser cache) that relies on distinct URLs per resource doesn't work out of the box, requiring client-side normalized caches (Apollo Client, Relay) or persisted queries instead
- Can allow expensive nested queries if not rate-limited or depth-limited — a client can request a deeply nested, self-referential field (`user { friends { friends { friends { ... } } } }`) that's cheap to write but catastrophic to execute
- The N+1 query problem hits GraphQL especially hard: a naive resolver for `posts { author { name } }` fires one query per post to fetch its author, instead of one batched query — solved with a batching/caching layer like DataLoader
- A single query can quietly aggregate many expensive operations into one HTTP request, making rate limiting by "requests per second" meaningless — cost-based or complexity-based limiting is needed instead
- Error handling is unfamiliar to REST-trained clients: GraphQL almost always returns HTTP 200 even when part of the query failed, with errors reported in a separate `errors` array alongside any partial `data` that did resolve
- Overly generic schemas that just mirror the database shape 1:1, pushing complexity the API should own into every client instead

## Under the Hood
- Query execution is a tree walk: the engine parses the query into an AST, validates it against the schema, then executes resolvers breadth-first per level, awaiting all resolvers at a given depth before moving to the next
- Resolvers receive four arguments — `(parent, args, context, info)` — where `parent` is the already-resolved value from the enclosing field, `context` carries request-scoped data (auth, DB connections), and `info` exposes the AST/query metadata
- **DataLoader** batches and caches resolver calls within a single request tick: instead of N individual `getAuthor(id)` calls, it collects all requested IDs during the current event loop tick and issues one batched `getAuthorsByIds([...])` call
- Introspection is itself a GraphQL query (`__schema`, `__type`) that any client can run against the API to retrieve its full type graph — this is what powers autocomplete in GraphiQL and code generation tooling, and why introspection is often disabled in production for security-sensitive APIs
- Subscriptions typically ride over WebSocket using the `graphql-ws` or legacy `subscriptions-transport-ws` protocol, with the server pushing an event-shaped payload to the client each time a subscribed event fires

## Variants
- **Query** — read-only, safe to retry, resolvers execute in parallel across sibling fields
- **Mutation** — writes/side effects; the spec requires top-level mutation fields to execute serially, in the order listed, so a client can safely chain dependent writes in one request
- **Subscription** — a long-lived connection for real-time updates, conceptually similar to a [[WebSocket]] subscription scoped to specific events
- **Federation / schema stitching** — splits one large schema across multiple services, each owning a subgraph, composed into a single unified graph at a gateway layer (Apollo Federation is the dominant implementation)
- **Persisted queries** — the client sends a hash instead of the full query text, with the server maintaining a registry of allow-listed query strings; this reclaims some of REST's cacheability and closes off arbitrary query abuse

## Comparison

| Aspect | GraphQL | REST |
|---|---|---|
| Endpoints | One | Many (per resource) |
| Over/under-fetching | Avoided — client shapes response | Common — fixed response shape per endpoint |
| HTTP caching | Hard (needs client-side cache) | Easy (URL-based, CDN-friendly) |
| Type safety / contract | Strong (schema-first) | Depends on OpenAPI/Swagger adoption |
| Learning curve | Steeper (schema, resolvers, N+1) | Lower, maps to familiar HTTP verbs |
| File uploads / streaming | Awkward, needs extensions | Native (multipart, chunked) |

## Best Practices
- Use DataLoader (or equivalent batching) for every resolver that fetches by ID to avoid N+1 queries
- Set query complexity/depth limits so a single malicious or accidental query can't take down the database
- Version fields, not the whole API — deprecate individual fields with `@deprecated(reason: "...")` instead of standing up `/v2/graphql`
- Design the schema around client use cases, not a 1:1 mirror of database tables
- Disable introspection (or gate it behind auth) in production if the schema itself shouldn't be publicly discoverable
- Use persisted queries in production to both improve cacheability and prevent arbitrary, expensive ad-hoc queries from untrusted clients

## FAQ
**Does GraphQL replace REST?**
Not universally — REST remains simpler for straightforward CRUD APIs, is easier to cache, and has better native support for file uploads. GraphQL earns its complexity when clients have varied, nested data needs (mobile apps, dashboards aggregating multiple sources).

**Is GraphQL always faster than REST?**
Not necessarily — fewer round trips can mean lower perceived latency, but a single complex GraphQL query can also be slower server-side than several small, well-indexed REST calls if resolvers aren't batched properly.

**Can GraphQL use HTTP status codes like REST?**
Technically yes for transport-level failures (auth, malformed request), but application-level errors — a failed mutation, a not-found record — are conventionally returned as `200 OK` with details in the `errors` array, not via [[HTTP Status Codes]].

## History
- GraphQL was developed internally at Facebook starting in 2012 to solve real problems with their mobile News Feed: REST endpoints were either too chatty (many round trips) or returned bloated payloads mobile clients didn't need
- It was open-sourced in 2015, alongside the reference JavaScript implementation `graphql-js`, and handed off to the GraphQL Foundation (under the Linux Foundation) in 2018 to keep the spec vendor-neutral
- Apollo (originally Meteor Development Group) built the dominant client and server tooling ecosystem around GraphQL starting around 2016, which did as much to drive adoption outside Facebook as the spec itself
- Relay, Facebook's own GraphQL client, predates and heavily influenced conventions like cursor-based pagination (`edges`/`node`/`pageInfo`) that later became a de facto standard even for teams not using Relay

## FAQ (continued)
**Why does everyone recommend cursor-based pagination over offset-based in GraphQL?**
Offset pagination (`skip`/`limit`) breaks when items are inserted or removed between requests, causing skipped or duplicated results. Cursor-based pagination (the Relay connection spec: `edges { node cursor } pageInfo { hasNextPage } }`) anchors to a stable position instead of a numeric offset, so it stays correct under concurrent writes.

**How do you handle authorization in GraphQL if there's only one endpoint?**
Authorization moves from the URL/route level (as in REST) to the field/resolver level — each resolver checks whether the current `context.user` is allowed to read or mutate that specific field, which means auth logic is more granular but also more spread out across the schema.

## Related Terms
- [[REST API]]
- [[N+1 Query Problem]]
- [[WebSocket]]
- [[Rate Limiting]]

## Example
A mobile app fetches a user's name, 3 recent posts, and follower count in one GraphQL query instead of 3 separate REST calls.

## Code Example
```graphql
# Schema (SDL)
type User {
  id: ID!
  name: String!
  followerCount: Int!
  posts(limit: Int = 3): [Post!]!
}

type Post {
  id: ID!
  title: String!
  author: User!
}

type Query {
  user(id: ID!): User
}
```

```graphql
# Client query — exactly the shape needed, nothing more
query GetProfile($userId: ID!) {
  user(id: $userId) {
    name
    followerCount
    posts(limit: 3) {
      title
    }
  }
}
```

```json
// Response — matches the query shape 1:1
{
  "data": {
    "user": {
      "name": "Ada Lovelace",
      "followerCount": 1204,
      "posts": [
        { "title": "On the Analytical Engine" },
        { "title": "Notes on Computation" },
        { "title": "Algorithms Before Computers" }
      ]
    }
  }
}
```

```graphql
# Mutation — mutations execute serially, top-level fields in order listed
mutation CreatePost($title: String!, $authorId: ID!) {
  createPost(title: $title, authorId: $authorId) {
    id
    title
    author {
      name
    }
  }
}
```

```typescript
// Resolver using DataLoader to avoid the N+1 problem on Post.author
const authorLoader = new DataLoader(async (ids: readonly string[]) => {
  const users = await db.users.findByIds(ids); // one batched query for all requested IDs
  return ids.map((id) => users.find((u) => u.id === id));
});

const resolvers = {
  Post: {
    author: (post: Post) => authorLoader.load(post.authorId),
  },
};
```
