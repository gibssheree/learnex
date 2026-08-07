---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# Database Indexing

**Definition:** A data structure that speeds up lookups on a database table, at the cost of extra storage and slightly slower writes.

## How It Works
- An index, usually a B-tree, lets the database jump straight to matching rows instead of scanning the whole table
- The index stores the indexed column's values in sorted order alongside a pointer (a row identifier or, in some engines, the primary key) back to the actual row
- A lookup walks the tree from root to leaf in `O(log n)` comparisons instead of checking every row in `O(n)`, then follows the pointer to fetch the full row
- Every `INSERT`, `UPDATE`, or `DELETE` on an indexed column has to also update the index's structure, which is the source of the write-side cost
- The query planner decides per-query whether using an index is actually faster than a full table scan — for a tiny table, or a query matching most of the rows, a sequential scan can win despite having an index available
- An index lives alongside the table, not inside it — the database maintains it as a separate on-disk structure that must stay consistent with the table on every write, which is exactly why writes get slower as more indexes exist
- Index statistics (cardinality estimates, value histograms) are sampled, not exact, and refreshed by maintenance commands (`ANALYZE`) rather than continuously, so the planner's cost estimate is always somewhat approximate

## Why It Matters
- The single biggest lever for fixing slow queries on large tables
- The difference between an indexed and unindexed lookup on a large table isn't marginal — it's the difference between milliseconds and seconds (or minutes) as the table grows, because unindexed lookups get linearly worse with row count while indexed ones grow logarithmically
- Indexes are also what make `JOIN`s, `ORDER BY`, uniqueness constraints, and foreign key checks fast — not just simple `WHERE` lookups
- Good indexing strategy is frequently the difference between needing to shard or upgrade hardware and simply fixing a query plan — it's the cheapest form of scaling available before reaching for more expensive infrastructure changes

## Common Pitfalls
- Indexing every column "just in case" slows down inserts and updates
- Not indexing foreign keys or columns used often in `WHERE`/`JOIN` clauses
- Indexing a low-cardinality column (like a boolean `is_active` flag) alone — with only two possible values, the planner often can't narrow the scan enough for the index to beat a sequential scan
- Building a composite index in the wrong column order — an index on `(status, created_at)` doesn't help a query that filters only on `created_at`, because a B-tree composite index is only useful as a prefix match
- Wrapping an indexed column in a function in the `WHERE` clause (`WHERE LOWER(email) = 'x'`) without a matching functional/expression index — this silently defeats the index and forces a full scan
- Forgetting that indexes need maintenance too — bloated or fragmented indexes (common in Postgres after heavy update/delete churn) can degrade over time until a `REINDEX`/`VACUUM` cleans them up
- Assuming `EXPLAIN` output that mentions the index means it's being used efficiently — always check for `Index Scan` vs `Seq Scan` vs the costlier `Bitmap Heap Scan`, and look at actual vs estimated row counts
- Adding a redundant index that's already a prefix of an existing composite index — e.g. indexing `(status)` separately when `(status, created_at)` already exists — doubles write cost for zero read benefit
- Ignoring index bloat on high-churn tables — Postgres in particular doesn't reclaim dead index entries in place, so long-running `UPDATE`/`DELETE`-heavy tables need periodic `VACUUM`/`REINDEX` or bloat silently erodes the performance the index was added for

## Related Terms
- [[SQL vs NoSQL]]
- [[Caching]]
- [[Connection Pooling]]
- [[Database Migration]]

## Types
- **B-tree** — the default in nearly every relational database; good for equality and range queries (`=`, `<`, `>`, `BETWEEN`, sorting)
- **Hash index** — optimized for pure equality lookups only, can't support range queries or sorting; rarely the default choice, but faster than B-tree for exact-match-only workloads in some engines
- **Composite (multi-column) index** — indexes multiple columns together in a defined order; usable as a prefix (an index on `(a, b, c)` serves queries on `a`, `(a, b)`, and `(a, b, c)`, but not `b` alone)
- **Unique index** — enforces uniqueness while also serving as a normal lookup index; what backs most `PRIMARY KEY` and `UNIQUE` constraints
- **Partial index** — indexes only rows matching a condition (`CREATE INDEX ... WHERE deleted_at IS NULL`), smaller and faster when queries consistently filter that way
- **Covering index** — includes all columns a query needs, so the database can answer entirely from the index without touching the table (an "index-only scan")
- **GIN/GiST (Postgres)** — specialized structures for full-text search, array containment, JSONB queries, and geospatial data, where a plain B-tree doesn't apply
- **Full-text index** — purpose-built for searching within text content, supporting relevance ranking and word-stemming rather than exact match

## Under the Hood
A B-tree index is a balanced tree of pages: the root page has pointers to intermediate pages, which point to leaf pages, which hold the actual sorted key values and their row pointers. Because the tree is balanced, every lookup takes roughly the same number of page reads regardless of which value you're searching for — that's what keeps it at `O(log n)` instead of degrading for "unlucky" values.

A query planner estimates the cost of each available access path (sequential scan, index scan, bitmap index scan) using table statistics — row count, value distribution, index selectivity — gathered by commands like Postgres's `ANALYZE`. Stale statistics after a big data load are a common reason the planner picks a bad plan even though the right index exists; running `ANALYZE` after bulk changes fixes it.

## Code Example
```sql
-- Basic single-column index
CREATE INDEX idx_users_email ON users (email);

-- Composite index — column order matters
CREATE INDEX idx_orders_status_created ON orders (status, created_at);

-- Partial index — smaller, faster for a common filtered query
CREATE INDEX idx_active_users ON users (email) WHERE deleted_at IS NULL;

-- Expression index — needed if queries filter on a function of the column
CREATE INDEX idx_users_email_lower ON users (LOWER(email));

-- Check whether a query actually uses the index
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'a@example.com';
--                                                QUERY PLAN
-- Index Scan using idx_users_email on users  (cost=0.29..8.31 rows=1 width=64) (actual time=0.02..0.02 rows=1 loops=1)
--   Index Cond: (email = 'a@example.com'::text)
```

## Comparison
| | Without index | With index |
|---|---|---|
| Lookup on 1M rows | Full table scan, `O(n)` | B-tree walk, `O(log n)` |
| `WHERE`/`JOIN` on the column | Slow, gets worse as table grows | Fast, scales predictably |
| `INSERT`/`UPDATE` cost | Baseline | Slightly higher — index must be updated too |
| Storage | Baseline | Extra disk space for the index structure |
| Best for | Small tables, rarely-queried columns | Large tables, frequently filtered/joined/sorted columns |

## Best Practices
- Index columns that appear in `WHERE`, `JOIN ON`, and `ORDER BY` clauses of your hottest queries — start from actual slow-query logs, not guesswork
- Put the most selective column first in a composite index unless a specific query pattern demands otherwise
- Use `EXPLAIN ANALYZE` before and after adding an index to confirm it's actually chosen and actually helps
- Periodically audit for unused indexes (most databases expose usage stats) and drop them — every unused index is pure write-side cost with no read-side benefit
- Consider a covering index for hot, narrow read queries to enable index-only scans and skip the table lookup entirely

## FAQ
**Does adding an index ever make reads slower?** Not directly, but a table with too many indexes can suffer from planner overhead choosing between them, and heavy write load can cause index bloat that indirectly slows reads until maintenance runs.

**Do NoSQL databases use indexes too?** Yes — MongoDB uses B-trees under the hood for its indexes, and most document/key-value stores have some equivalent concept, though the tuning knobs differ from relational engines.

**Why doesn't the database just index everything automatically?** Because it can't know your write/read ratio or query patterns in advance, and indexing everything would tank write throughput and bloat storage — index selection is a deliberate tradeoff, not a free win.

**Why did my query stop using an index after the table grew?** The planner re-evaluates cost estimates using current statistics; a plan that was optimal at 10,000 rows can flip to a sequential scan (or vice versa) at 10 million rows because the relative cost of random index-page reads versus a linear scan shifts with table size and data distribution.

**What's the real cost of "just add an index" on a hot production table?** Building a regular index takes a lock that blocks writes for the duration (can be minutes on large tables); use the non-blocking variant (`CREATE INDEX CONCURRENTLY` in Postgres) in production, accepting that it's slower to build and can't run inside a transaction block.

## Real-World Example
A reporting query joining `orders` to `customers` and filtering by `created_at` starts timing out as the `orders` table crosses a few million rows. `EXPLAIN ANALYZE` shows a `Seq Scan` on `orders` costing several seconds despite a `WHERE created_at > ?` filter that should only match a small fraction of rows. The cause: no index exists on `created_at`, so the planner has no choice but to scan everything. Adding `CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders (created_at);` turns the same query into a sub-50ms `Index Scan`. The lesson embedded in this recurring incident: an index doesn't need to be added when a table is designed — it needs to be added when a real query pattern against real data volume proves it's needed, and monitoring slow-query logs is what surfaces that moment.

## History
The B-tree was introduced in 1970 by Rudolf Bayer and Edward McCreight at Boeing Research Labs, designed specifically for systems where data lived on slow, block-oriented storage (disk) rather than RAM — its shallow, wide structure minimizes the number of disk reads needed per lookup, which is still exactly why it's the default choice today even on SSDs. Relational databases adopted B-trees (and the B+tree variant, which stores all data in leaf nodes for efficient range scans) as their standard index structure through the 1970s-80s, and it has remained the default in Postgres, MySQL/InnoDB, SQLite, and SQL Server ever since, with newer structures (GIN, GiST, LSM-trees in some NoSQL engines) added alongside it for workloads a plain B-tree doesn't fit well.

## Common Interview Questions
- **Why is a B-tree better than a hash table for database indexes in general?** A hash table only supports exact-match lookups; a B-tree keeps data sorted, so it also supports range queries (`>`, `<`, `BETWEEN`), prefix matches, and efficient `ORDER BY` — the flexibility outweighs the hash table's theoretical O(1) advantage for most real query patterns
- **What does "selectivity" mean and why does it matter for indexing?** Selectivity is the fraction of rows a condition matches — a highly selective condition (few matching rows, like a unique email) benefits enormously from an index; a low-selectivity one (like a boolean flag with a 50/50 split) often doesn't, because the database ends up fetching a large fraction of the table anyway
- **What's the difference between a clustered and non-clustered index?** A clustered index determines the physical order rows are stored on disk (a table can have at most one); a non-clustered index is a separate structure with pointers back to the table, and a table can have many
- **Why would `EXPLAIN` choose a sequential scan even with a usable index present?** When the query is expected to match a large fraction of the table, reading it sequentially (which disk hardware handles efficiently) can be cheaper overall than the random-access pattern of following many individual index pointers
- **What's a covering index and why does it avoid a table lookup?** It's an index that includes every column a query needs, so the database can produce the full answer from the index's leaf pages alone — no need to jump back to the table's heap storage for additional columns

## Real-World Example
A `WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 20` query starts slow on a table with only a single-column index on `user_id`. The database can use the index to find that user's rows, but then has to sort all of them in memory to apply `ORDER BY` and `LIMIT`, which grows expensive as any single user accumulates thousands of rows. Replacing it with a composite index on `(user_id, status, created_at DESC)` lets the database satisfy the filter, the status match, and the sort order all directly from the index's existing sorted structure — turning an index-scan-plus-sort into a single ordered index walk that stops as soon as it has 20 rows, regardless of how many total rows that user has.

## Indexing Across Different Databases
- **PostgreSQL** — B-tree by default; also offers GIN (full-text search, JSONB, arrays), GiST (geospatial, ranges), BRIN (very large, naturally-ordered tables like time-series, at a fraction of the storage cost of a B-tree)
- **MySQL (InnoDB)** — B+tree by default; the primary key *is* the clustered index, meaning secondary indexes store the primary key value as their pointer, so primary key choice affects every other index's size
- **SQLite** — B-tree, broadly similar semantics to Postgres/MySQL but with a lighter-weight query planner and fewer specialized index types
- **MongoDB** — B-tree-based indexes on document fields, including compound indexes and text indexes; the `explain()` method serves the same diagnostic role as SQL's `EXPLAIN`
- **Elasticsearch** — inverted indexes (mapping terms to the documents containing them) rather than B-trees, purpose-built for full-text search rather than exact-match/range lookups

## Signs You Need a New Index
- A specific query consistently appears at the top of the slow-query log, and `EXPLAIN` shows a `Seq Scan` on a large table for a selective filter
- Query latency degrades noticeably as a specific table grows, even though the query itself hasn't changed — a classic symptom of missing or wrong indexing rather than a code regression
- CPU or I/O on the database spikes disproportionately to traffic growth, suggesting the database is doing more scanning work per request than it should need to
- A `JOIN` between two tables is slow, and one side of the join column lacks an index — foreign key columns are commonly under-indexed by default in many ORMs unless explicitly configured

## Index Maintenance Commands
```sql
-- Postgres: find unused indexes (candidates for removal)
SELECT indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Postgres: rebuild a bloated index without blocking reads
REINDEX INDEX CONCURRENTLY idx_orders_customer_id;

-- MySQL: inspect index usage and cardinality
SHOW INDEX FROM orders;

-- Force the planner to refresh its statistics after a bulk load
ANALYZE orders;
```

## Common Interview Questions (continued)
- **What's the difference between `EXPLAIN` and `EXPLAIN ANALYZE`?** `EXPLAIN` shows the planner's estimated plan and costs without running the query; `EXPLAIN ANALYZE` actually executes it and reports real timing and row counts alongside the estimates, which is essential for spotting cases where the planner's estimate was wrong
- **Why would an index make an `UPDATE` slower even on a column the `UPDATE` doesn't touch?** If the update causes the row to move on disk (common in Postgres due to MVCC creating a new row version), every index on that table needs a new entry pointing at the new row location, not just indexes on the changed column

## Example
Adding an index on `email` so `WHERE email = ?` on a million-row users table returns instantly instead of scanning everything. Before the index: a sequential scan touching all million rows, tens to hundreds of milliseconds. After: a B-tree walk of a handful of pages, sub-millisecond — visible directly in `EXPLAIN ANALYZE` as `Index Scan` replacing `Seq Scan`.
