---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# N+1 Query Problem

**Definition:** A performance bug where fetching a list of N items triggers 1 query for the list plus N more queries, one per item.

## How It Works
- Common with ORMs: you fetch 50 blog posts, then loop through them fetching each post's author separately, 51 queries instead of 2
- The "1" query loads the parent collection (`SELECT * FROM posts`); the "N" queries each lazily resolve one row's association (`SELECT * FROM authors WHERE id = ?`, once per post)
- It happens because ORMs default to **lazy loading**: an association like `post.author` isn't fetched until you actually access it, and if that access happens inside a loop, the ORM fires one query per iteration without you writing an explicit loop over SQL
- It's invisible in the code — `post.author.name` looks like a simple property access, not a network round-trip to the database, which is exactly what makes it easy to miss in review
- Gets worse with nested associations: fetching `post.author.company.name` inside a loop can turn into 1 + N + N queries (one more level of N for each hop)

## Under the Hood
- Each query is a full network round-trip to the database — even a fast query (sub-millisecond execution) pays connection/latency overhead (often 0.5-2ms locally, much more over a network to a managed DB), so 100 extra queries can add 100+ ms even before considering DB load
- The database's query planner can't optimize across N separate queries the way it can optimize a single JOIN — no shared execution plan, no index intersection across the batch
- Connection pool exhaustion is a secondary risk: N+1 queries fired concurrently (e.g., from `Promise.all` over a loop) can saturate a limited connection pool, causing unrelated requests to queue or time out
- Some ORMs cache identical queries within a single request (Rails' query cache), which can mask N+1 in development if the same author is fetched repeatedly, but doesn't help when N distinct rows each trigger a distinct query
- The problem generalizes beyond SQL: the same lazy-resolution trap appears in GraphQL resolvers (a `posts` resolver whose `author` field resolver fires per-post) and REST clients chaining calls (fetch a list, then call a detail endpoint per item)

## Why It Matters
- A silent performance killer that works fine with 10 rows and falls over with 10,000
- Query count often scales with data growth even when the feature's logic never changed — a page that felt instant in a demo with 5 test rows can time out in production with 50,000 real rows
- Directly multiplies database load: an endpoint that should be a couple of cheap queries becomes hundreds, competing for the same connection pool and CPU as every other request
- One of the most common causes of "it's slow in production but fast locally," since local/dev datasets are usually too small to expose the multiplication

## Common Pitfalls
- Not noticing it in development with a tiny dataset, only discovering it in production under real load
- Fixing it in one place but reintroducing it elsewhere — N+1 tends to creep back in whenever a new field or association access gets added inside a loop or template
- Over-correcting by eager-loading everything by default "just in case," which wastes memory and bandwidth pulling associations that a given request never actually uses
- Eager loading the wrong association — fixing `post.author` but missing `post.comments.each { |c| c.author }`, a nested N+1 one level deeper
- Assuming an ORM's `.includes`/`.select_related` always produces a single JOIN — some strategies actually issue 2 queries (one for parents, one `WHERE id IN (...)` for children), which is still vastly better than N+1 but worth understanding so query counts in tooling make sense
- Triggering N+1 inside a serializer or view template rather than the controller/service — logic that "just reads a property" for display purposes is just as capable of firing a query per row as explicit loop code

## Detecting It
- **Query logging**: turn on SQL logging in development and read the log for a repeating query pattern with only the `WHERE id = ?` parameter changing
- **APM/tracing tools**: New Relic, Datadog, Scout, and similar tools flag "N+1 detected" directly by pattern-matching repeated near-identical queries within one request trace
- **ORM-specific detectors**: Rails' `bullet` gem, Django's `django-debug-toolbar` (shows duplicate query counts per request), and similar plugins for other ecosystems warn at the point the lazy load happens
- **Load-test with realistic data volume** — seed a dev/staging database with thousands of rows, not a handful, since the problem is invisible at small N

## Code Example
The naive version (N+1) versus the fixed version, shown in both raw SQL and a typical ORM:

```sql
-- 1 query for the list
SELECT id, title, author_id FROM posts LIMIT 50;

-- then N queries, one per row, fired in a loop by application code
SELECT * FROM authors WHERE id = 1;
SELECT * FROM authors WHERE id = 2;
-- ... 48 more ...
```

```sql
-- fixed: a single JOIN fetches everything in one round-trip
SELECT posts.id, posts.title, authors.name
FROM posts
JOIN authors ON authors.id = posts.author_id
LIMIT 50;
```

```ruby
# Rails: N+1
Post.limit(50).each { |post| puts post.author.name } # 1 + 50 queries

# Rails: fixed with eager loading
Post.includes(:author).limit(50).each { |post| puts post.author.name } # 2 queries
```

```js
// Node/Prisma: N+1
const posts = await prisma.post.findMany({ take: 50 });
for (const post of posts) {
  const author = await prisma.author.findUnique({ where: { id: post.authorId } }); // fires per row
}

// Fixed: fetch the relation in the same query
const posts = await prisma.post.findMany({ take: 50, include: { author: true } });
```

## Comparison

| Approach | Queries for 50 posts | Notes |
|---|---|---|
| Lazy loading (naive) | 51 | Simple code, hidden cost |
| Eager loading (`includes`/`with`) | 1-2 | Batches child fetch with `WHERE id IN (...)` |
| JOIN | 1 | Single round-trip, but can duplicate parent rows if the child relation is one-to-many |
| DataLoader (GraphQL) | 1-2 per field, batched across the whole request | Batches + caches per-request, solves resolver-level N+1 |

## Best Practices
- Default to eager loading for any association you know a list view will access, rather than discovering it's missing in production
- Use ORM-level N+1 detection tools (`bullet`, `django-debug-toolbar`, APM alerts) in development and CI, not just manual code review
- In GraphQL APIs, use a batching/caching layer like `DataLoader` so per-field resolvers naturally coalesce into one query per association per request instead of one per parent row
- Watch query counts in code review the same way you'd watch for an obvious performance bug — a PR that turns "2 queries" into "2 + N" should get flagged
- Seed development and staging databases with realistic volumes so N+1 patterns become visible before they reach production

## FAQ
**Does eager loading always mean a JOIN?** No — many ORMs implement eager loading as two queries (parents, then children via `IN`) rather than a single JOIN, because a JOIN on a one-to-many relationship duplicates parent columns per child row, which can be worse for large child sets.

**Is N+1 only a SQL problem?** No — the same pattern shows up any time a list result triggers a per-item fetch: GraphQL field resolvers, chained REST API calls, even loops calling an external microservice per item.

**Can caching fix N+1 instead of eager loading?** It can mask it (repeated identical queries hit a cache instead of the DB), but it doesn't fix the underlying issue and doesn't help when each query is for a distinct row — eager loading or batching is the real fix.

## N+1 in GraphQL
GraphQL is especially prone to this because resolvers are written per-field, independent of each other, with no visibility into the sibling rows being resolved alongside them:

```js
// Naive resolver: fires one query per post for its author
const resolvers = {
  Post: {
    author: (post) => db.query('SELECT * FROM authors WHERE id = ?', [post.authorId]),
  },
};
// A query for 50 posts + their authors triggers 50 separate author lookups
```

```js
// Fixed with DataLoader: batches all author IDs requested during one tick
// into a single query, and caches results for the lifetime of the request
const authorLoader = new DataLoader(async (ids) => {
  const authors = await db.query('SELECT * FROM authors WHERE id IN (?)', [ids]);
  return ids.map((id) => authors.find((a) => a.id === id)); // must return in input order
});

const resolvers = {
  Post: {
    author: (post) => authorLoader.load(post.authorId), // batched automatically
  },
};
```

`DataLoader` works by collecting every `.load()` call made within the same event-loop tick, then firing one batched query for all of them — turning what would be 50 sequential resolver calls into a single `WHERE id IN (...)` query, transparently, without resolvers needing to know about each other.

## Why It's Easy to Miss in Review
- The problematic line often looks completely innocent: `post.author.name` or `{{ post.author.name }}` in a template gives no visual signal that it triggers a database round-trip
- It frequently isn't introduced by the original code — a list view fetched with `Post.all` works fine until someone later adds `<span>{{ post.author.name }}</span>` to the template, silently turning a 1-query page into an N+1 one
- Code review catches type errors and logic bugs readily, but "this property access is secretly a network call" requires either knowing the ORM's lazy-loading behavior cold or having tooling flag it
- Feature flags and A/B tests compound the risk: a variant that adds one more association access to a hot list page can double or triple query count for only a subset of users, making it harder to spot in aggregate metrics

## Related Terms
- [[ORM]]
- [[Database Indexing]]
- [[SQL vs NoSQL]]
- [[GraphQL]]
- [[Caching]]

## Example
Fixed by "eager loading" — fetching posts and their authors in one joined query instead of one query per post. In Django, the equivalent fix is `Post.objects.select_related('author')` (for a foreign key, produces a JOIN) or `prefetch_related` (for reverse/many-to-many relations, produces a second batched query) instead of accessing `post.author` inside a loop over `Post.objects.all()`.
