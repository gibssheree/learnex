---
tags: [term, fullstack, database]
category: Database & Data
---

# ORM (Object-Relational Mapping)

**Definition:** A library that lets you interact with a database using your programming language's objects instead of writing raw SQL.

## How It Works
- You define models (classes) that map to database tables
- The ORM generates SQL queries behind the scenes when you call methods on those models

## Why It Matters
- Speeds up development and reduces raw SQL boilerplate — but you still need to understand the SQL it generates

## Common Pitfalls
- Trusting the ORM blindly leads straight to the [[N+1 Query Problem]] and slow queries you won't notice until production

## Related Terms
- [[SQL vs NoSQL]]
- [[N+1 Query Problem]]

## Example
Prisma and Sequelize (Node), SQLAlchemy (Python), ActiveRecord (Rails).
