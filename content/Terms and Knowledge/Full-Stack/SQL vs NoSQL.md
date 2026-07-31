---
tags: [term, fullstack, database]
category: Database & Data
---

# SQL vs NoSQL

**Definition:** SQL databases store structured data in tables with fixed schemas. NoSQL databases store flexible, often schema-less data (documents, key-value, graphs).

## How It Works
- SQL (Postgres, MySQL) enforces relationships and schema at write time, supports joins
- NoSQL (MongoDB, DynamoDB) stores loosely structured JSON-like documents, trades strict structure for flexibility

## Why It Matters
- Picking the wrong one for your data shape causes pain later — relational data fits SQL, unstructured or rapidly changing data often fits NoSQL better

## Common Pitfalls
- Using NoSQL "because it's modern" for clearly relational data like orders, users, and payments, then fighting the lack of joins

## Related Terms
- [[ORM]]
- [[ACID Transactions]]

## Example
A banking app uses SQL for strict consistency; a product catalog with wildly different fields per item might use NoSQL.
