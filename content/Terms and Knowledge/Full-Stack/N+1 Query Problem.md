---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# N+1 Query Problem

**Definition:** A performance bug where fetching a list of N items triggers 1 query for the list plus N more queries, one per item.

## How It Works
- Common with ORMs: you fetch 50 blog posts, then loop through them fetching each post's author separately, 51 queries instead of 2

## Why It Matters
- A silent performance killer that works fine with 10 rows and falls over with 10,000

## Common Pitfalls
- Not noticing it in development with a tiny dataset, only discovering it in production under real load

## Related Terms
- [[ORM]]
- [[Database Indexing]]

## Example
Fixed by "eager loading" — fetching posts and their authors in one joined query instead of one query per post.
