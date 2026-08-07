---
tags: [term, fullstack, database]
category: Database & Data
---

# SQL vs NoSQL

**Definition:** SQL databases store structured data in tables with fixed schemas. NoSQL databases store flexible, often schema-less data (documents, key-value, graphs).

## How It Works
- SQL (Postgres, MySQL) enforces relationships and schema at write time, supports joins
- NoSQL (MongoDB, DynamoDB) stores loosely structured JSON-like documents, trades strict structure for flexibility
- SQL engines parse a query into an execution plan, lean on B-tree or hash indexes to avoid full table scans, and the query planner picks a join strategy (nested loop, hash join, merge join) based on table statistics it collects
- NoSQL engines usually optimize for one primary access pattern: DynamoDB partitions data by a hash of the partition key across nodes, MongoDB shards by a chosen shard key, and queries that don't match the key design fall back to slow, expensive scans
- Both categories expose a way to query: SQL is declarative (`SELECT ... WHERE ...`, the engine decides how), most NoSQL databases expose either a query DSL (MongoDB's query documents) or a narrower key-based API (DynamoDB's `GetItem` / `Query` / `Scan`)
- Writes differ in shape too — a SQL `UPDATE` can touch many rows across many tables inside one transaction; a NoSQL write usually targets a single document or item, and touching many at once means many round trips or a batch API with its own limits

## Why It Matters
- Picking the wrong one for your data shape causes pain later — relational data fits SQL, unstructured or rapidly changing data often fits NoSQL better
- Schema change cost differs sharply: adding a column to a huge Postgres table is metadata-only in modern Postgres (fast), but can still mean a blocking table rewrite in MySQL or on certain column types; adding a field to a MongoDB document costs nothing at the database layer because the schema lives in your application code, not the engine
- Consistency guarantees differ by default: SQL databases are typically strongly consistent (ACID) out of the box; many NoSQL databases default to eventual consistency in exchange for higher availability and throughput, and you opt into stronger guarantees (e.g. DynamoDB's `ConsistentRead: true`) at a latency and cost premium
- Horizontal scaling is where NoSQL historically won: sharding a relational database across many nodes while keeping joins, foreign keys, and transactions intact is genuinely hard engineering; most NoSQL databases were designed around partitioning from day one, so scaling out is closer to "add a node"
- The choice shapes your team's daily workflow too — SQL migrations are a well-understood, tooled process (see [[Database Migration]]); NoSQL "migrations" are really data backfills you write and run yourself

## Common Pitfalls
- Using NoSQL "because it's modern" for clearly relational data like orders, users, and payments, then fighting the lack of joins with application-side stitching
- Denormalizing data into a document store and then needing to update the same fact across thousands of documents when it changes (e.g. a user's display name embedded in every comment they've ever made)
- Assuming NoSQL means "no schema, no planning" — in practice you still design a schema, you just enforce it in application code or a validation layer instead of the database, and getting the access patterns wrong is far more painful to fix after the fact than a SQL migration
- Treating eventual consistency as if it were strong consistency, then shipping a bug where a user doesn't see their own just-written data on the very next page load
- Running a fundamentally "SQL-shaped" workload (many ad-hoc joins and aggregations, financial-grade consistency needs) on a NoSQL store because it scaled well in a load test, then discovering multi-record transactions are slow, capped, or unavailable
- Over-indexing a SQL table to "make queries fast" without checking write cost — every index slows down every `INSERT`/`UPDATE` on that table

## Types / Variants
- **Document stores** (MongoDB, Couchbase) — JSON/BSON documents, good for nested, per-record-varying data
- **Key-value stores** (Redis, DynamoDB, Memcached) — simplest model, extremely fast lookups by key, minimal query flexibility beyond that key
- **Column-family stores** (Cassandra, HBase, Bigtable) — optimized for write-heavy workloads at huge scale, data is partitioned by row key and queries must fit that partitioning
- **Graph databases** (Neo4j, Amazon Neptune) — nodes and edges are first-class, ideal for relationship-heavy traversals ("friends of friends of friends") that would need many recursive joins in SQL
- **NewSQL** (CockroachDB, Google Spanner, PlanetScale/Vitess) — tries to have both: SQL semantics and ACID transactions with horizontal scalability, usually built on a distributed consensus protocol (Raft/Paxos) under the hood

## Under the Hood
- **CAP theorem** is the standard framing for the tradeoff: under a network partition, a system must choose consistency or availability. Most single-primary SQL databases favor consistency (reject or queue writes rather than serve stale data); many distributed NoSQL databases default to favoring availability
- SQL databases typically use a single-writer architecture (one primary, read replicas) or, for distributed SQL, a consensus protocol to agree on write order — this is what makes multi-row ACID transactions tractable in the first place
- Many NoSQL databases use eventual consistency with techniques like vector clocks, last-write-wins timestamps, or CRDTs (conflict-free replicated data types) to resolve concurrent conflicting writes across replicas without a central coordinator
- Indexing differs too: a relational database lets you add a secondary index on nearly any column after the fact; DynamoDB requires you to declare secondary indexes (GSIs/LSIs) up front, and they carry their own capacity, cost, and consistency tradeoffs
- Normalization is a SQL-native concept (1NF/2NF/3NF, reducing redundancy via foreign keys); NoSQL modeling generally goes the other direction — deliberate denormalization to make the common read a single lookup

## History
- The relational model comes from Edgar Codd's 1970 paper "A Relational Model of Data for Large Shared Data Banks" — it proposed representing data as tables with mathematical set operations, radical at the time versus the hierarchical and network databases that preceded it
- SQL itself (originally SEQUEL) was developed at IBM in the early 1970s to query relational data in something closer to English than raw set algebra; it became an ANSI standard in 1986 and has been incrementally extended ever since (window functions, CTEs, JSON columns)
- The term "NoSQL" was popularized around 2009 at a meetup originally organized to discuss non-relational, open-source, distributed databases — Cassandra (built at Facebook, inspired by Amazon's Dynamo paper and Google's Bigtable paper), MongoDB, and CouchDB all emerged in the same rough era
- The driving pressure was the web-scale problem: Google, Amazon, and Facebook needed to scale reads and writes across thousands of commodity servers, and classic single-primary relational databases of that era couldn't do it without heroic, expensive engineering
- Ironically, the pendulum has swung partway back — NewSQL and distributed SQL databases (Spanner, CockroachDB) exist specifically because teams missed transactions and joins enough to rebuild them on top of horizontally scalable storage

## Comparison

| | SQL | NoSQL |
|---|---|---|
| Schema | Fixed, enforced at write | Flexible, enforced by app (if at all) |
| Joins | Native, planner-optimized | Usually none — denormalize instead |
| Transactions | Multi-row ACID, standard | Often limited to a single document/partition |
| Scaling | Vertical first, sharding is hard | Horizontal by design |
| Consistency default | Strong | Often eventual |
| Query flexibility | High (ad-hoc `SELECT`) | Low — must fit predeclared access patterns |
| Best fit | Relational, transactional data | High-volume, flexible-shape, single-key-access data |

## Code Example
```sql
-- SQL: relational query with a join, trivial and fast if orders.user_id is indexed
SELECT users.name, orders.total
FROM users
JOIN orders ON orders.user_id = users.id
WHERE orders.created_at > '2026-01-01';
```

```js
// NoSQL (MongoDB): the equivalent needs either denormalized data or an
// aggregation pipeline $lookup — MongoDB's answer to joins, but far
// less optimized than a relational join on an indexed foreign key
db.orders.aggregate([
  { $match: { createdAt: { $gt: new Date('2026-01-01') } } },
  { $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user'
  }}
]);
```

## Deeper Dive: Normalization vs. Denormalization
- Normalization (splitting data into related tables to eliminate redundancy) is the default SQL discipline — a user's address lives in one `addresses` row, referenced by foreign key from every order, so updating it once updates it everywhere it's used
- Denormalization (duplicating data to avoid lookups) is the default NoSQL discipline — that same address might be copied directly into every order document, so reading an order needs no join, but updating the address means finding and rewriting every order that copied it
- The practical implication: SQL optimizes for write simplicity and read complexity (joins cost query time), NoSQL optimizes for read simplicity and write complexity (denormalized copies cost update time)
- Some teams denormalize inside SQL too — a reporting table or materialized view precomputed from normalized source tables, refreshed on a schedule, gets you fast reads without abandoning the relational model for the source of truth
- The rule of thumb: normalize until it hurts (read performance), then denormalize the specific hot path, whichever database you're using

## Code Example: Schema Definition
```sql
-- SQL: schema is declared and enforced up front
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

```yaml
# NoSQL (DynamoDB): "schema" is really just key structure —
# everything else is decided by application code at write time
TableName: Orders
KeySchema:
  - AttributeName: userId    # partition key
    KeyType: HASH
  - AttributeName: orderId   # sort key
    KeyType: RANGE
AttributeDefinitions:
  - AttributeName: userId
    AttributeType: S
  - AttributeName: orderId
    AttributeType: S
BillingMode: PAY_PER_REQUEST
```

## Best Practices
- Start by modeling your actual read/write access patterns, not your entity relationships — NoSQL schema design (especially DynamoDB single-table design) is query-first, not entity-first
- Default to SQL unless you have a specific, measured reason not to (extreme write throughput, genuinely schema-less data, need for horizontal scale beyond what a single well-tuned Postgres instance handles) — it remains the safer general-purpose choice
- It's normal, and common, to use both: Postgres for the transactional core (users, billing, orders) plus Redis or Elasticsearch for caching, [[Session]] storage, or search
- If you do pick NoSQL, write down your access patterns before writing your schema — changing a DynamoDB table's key structure later usually means a full data migration, not an `ALTER TABLE`
- Benchmark with production-shaped data and query patterns, not a toy dataset — NoSQL performance claims are almost always conditional on the access pattern matching the partition/shard key

## FAQ
- **Can NoSQL databases do transactions?** Some can, within limits — MongoDB supports multi-document ACID transactions since v4.0, DynamoDB supports transactional writes across up to 100 items, but both are more constrained and slower than a relational transaction.
- **Is NoSQL always faster?** No — it's faster for the specific access patterns it's optimized for (usually key lookups). A well-indexed SQL query is often faster than an unindexed NoSQL scan.
- **Do I have to choose one?** No. "Polyglot persistence" — different databases for different parts of the same system — is standard in real-world architectures.
- **Which one do interviewers expect me to default to?** Relational, unless the prompt clearly describes flexible, high-volume, or graph-shaped data — justify the tradeoff rather than naming a database.
- **What is BASE, and how does it relate to ACID?** BASE (Basically Available, Soft state, Eventually consistent) is the informal counterpart to ACID that many NoSQL systems are described by — it trades immediate consistency for availability and partition tolerance.
- **Can I add SQL-like joins to a NoSQL database later?** Not cheaply. Once data is denormalized across documents to avoid joins, "adding joins back" usually means a rewrite of the data model, not a query change.
- **Does using an [[ORM]] make the SQL vs NoSQL choice irrelevant?** No — an ORM smooths over syntax differences but doesn't change the underlying consistency, transaction, or scaling guarantees you're building on.

## Real-World Example
Instagram's early architecture ran on Postgres for the core social graph and post metadata, sharded manually across many Postgres instances as it grew — a reminder that "NoSQL for scale" isn't the only path; disciplined sharding of a relational database has taken companies to hundreds of millions of users. Contrast that with DynamoDB, purpose-built by Amazon after their 2004 Dynamo paper specifically because Oracle-based systems couldn't meet Amazon.com's holiday-season write throughput without prohibitively expensive scaling — a genuinely NoSQL-shaped problem (huge write volume, simple key-based access, availability more important than perfect consistency for a shopping cart).

## Related Terms
- [[ORM]]
- [[ACID Transactions]]
- [[Database Indexing]]
- [[Database Migration]]

## Example
A banking app uses SQL for strict consistency; a product catalog with wildly different fields per item might use NoSQL. A concrete real-world pattern: an e-commerce platform keeps orders, payments, and inventory in Postgres (needs transactions, needs joins for reporting) but stores the product search index in Elasticsearch and the shopping cart in Redis (needs speed, doesn't need joins, data is disposable if lost).
