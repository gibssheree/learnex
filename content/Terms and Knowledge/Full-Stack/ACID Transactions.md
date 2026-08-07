---
tags: [term, fullstack, database]
category: Database & Data
---

# ACID Transactions

**Definition:** A set of guarantees, Atomicity, Consistency, Isolation, Durability, that make database operations safe and predictable.

## How It Works
- A transaction groups multiple operations so they all succeed together or all fail together
- No partial state is ever left behind if something fails mid-way
- The database engine tracks every change made within the transaction boundary (`BEGIN` to `COMMIT`/`ROLLBACK`) and can undo the whole set if anything goes wrong
- Under the hood, most engines use a write-ahead log (WAL): changes are journaled before they're applied to the actual data files, so a crash mid-transaction can be recovered from cleanly

## Why It Matters
- Critical for anything involving money, inventory, or any operation where a partial failure would corrupt data
- Lets application code reason about the database as if it were single-threaded, even when hundreds of clients are hitting it concurrently
- Removes an entire class of bugs, lost updates, dirty reads, half-applied writes, that would otherwise require manual bookkeeping in application code

## Common Pitfalls
- Forgetting to wrap multi-step operations, like "deduct from account A, add to account B," in a single transaction, risking inconsistent state if one step fails
- Holding a transaction open across a slow external call (an API request, a file upload) — locks stay held the whole time, starving other queries
- Assuming "ACID" alone means "no bugs possible." It guards data integrity, not application logic errors, and it doesn't protect against race conditions unless you pick the right isolation level
- Mixing autocommit and manual transaction modes in the same codebase, leading to statements silently committing when a developer assumed they were still inside a transaction
- Using the default isolation level everywhere without understanding what it actually permits (see below), then being surprised by phantom reads or lost updates in production

## The Four Guarantees, In Depth

**Atomicity** — the transaction is "all or nothing." If any statement fails, every prior statement in the transaction is rolled back, as if none of it happened. Implemented via the WAL/undo log: the engine can replay or reverse changes to reach a consistent point.

**Consistency** — a transaction can only move the database from one valid state to another, respecting constraints, foreign keys, triggers, and check constraints. This is the one letter that's largely enforced by *your* schema design, not just the engine; the engine enforces the constraints you declare.

**Isolation** — concurrent transactions shouldn't see each other's uncommitted changes. How strictly this is enforced is tunable (see Isolation Levels below), trading correctness guarantees for throughput.

**Durability** — once a transaction commits, it survives a crash, power loss, or restart. Typically achieved by `fsync`-ing the WAL to disk before acknowledging the commit to the client. This is also the guarantee most often silently weakened for performance (e.g., Postgres's `synchronous_commit = off`, MySQL's `innodb_flush_log_at_trx_commit = 2`).

## Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Typical Use |
|---|---|---|---|---|
| Read Uncommitted | Possible | Possible | Possible | Rarely used; analytics on non-critical data |
| Read Committed | Prevented | Possible | Possible | Postgres/Oracle default |
| Repeatable Read | Prevented | Prevented | Possible* | MySQL/InnoDB default |
| Serializable | Prevented | Prevented | Prevented | Financial ledgers, inventory counts |

*InnoDB's Repeatable Read actually prevents phantom reads too via gap locking/MVCC snapshots, stricter than the SQL standard requires.

Higher isolation means more locking (or more transaction retries under optimistic concurrency), which means lower throughput. Serializable is the safest and slowest; Read Committed is the most common real-world default because it's "safe enough" for most workloads.

## Under the Hood: MVCC vs Locking

Most modern relational databases (Postgres, MySQL/InnoDB, Oracle) use **Multi-Version Concurrency Control (MVCC)** rather than pure locking to implement isolation. Instead of blocking readers behind writers, the engine keeps multiple versions of a row: a writer creates a new version while readers keep seeing the version that existed when their transaction (or statement) started. This is why, in Postgres, a long-running `SELECT` doesn't block an `UPDATE` on the same rows, and vice versa.

The tradeoff: old row versions must eventually be cleaned up. Postgres calls this `VACUUM`; a table with high write churn and infrequent vacuuming can bloat significantly, degrading query performance until autovacuum (or a manual `VACUUM FULL`) catches up.

## Code Example

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';

-- Sanity check before committing
SELECT balance FROM accounts WHERE id = 'A';
-- If balance went negative and that's not allowed, roll back instead:
-- ROLLBACK;

COMMIT;
```

```sql
-- Explicitly requesting stricter isolation for a critical section
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT quantity FROM inventory WHERE sku = 'WIDGET-1' FOR UPDATE;
UPDATE inventory SET quantity = quantity - 1 WHERE sku = 'WIDGET-1';

COMMIT;
```

`FOR UPDATE` explicitly locks the selected row(s) so no other transaction can modify them until this one commits or rolls back, useful for read-then-write patterns like decrementing stock.

## Savepoints

A transaction doesn't have to be all-or-nothing at the statement level — savepoints let you roll back part of a transaction without abandoning the whole thing:

```sql
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE id = 'A';

SAVEPOINT before_credit;

UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
-- Suppose a business rule check fails here
ROLLBACK TO SAVEPOINT before_credit;

-- Retry the credit against a different account instead
UPDATE accounts SET balance = balance + 100 WHERE id = 'C';

COMMIT;
```

Useful for batch operations where one item in a loop might fail validation but you don't want to lose the work already done for the others.

## Comparison: ACID vs BASE

| | ACID | BASE |
|---|---|---|
| Stands for | Atomicity, Consistency, Isolation, Durability | Basically Available, Soft state, Eventual consistency |
| Consistency model | Strong, immediate | Eventual |
| Typical systems | PostgreSQL, MySQL, Oracle | DynamoDB, Cassandra, many NoSQL stores |
| Tradeoff | Correctness over raw scale | Availability/scale over immediate correctness |

Neither is strictly "better" — see [[SQL vs NoSQL]] for when each model fits. Some NoSQL databases (MongoDB since 4.0, for example) now offer multi-document ACID transactions too, so the line has blurred.

## Best Practices
- Keep transactions as short as possible — do the minimum work inside `BEGIN`/`COMMIT` and never wait on network I/O while one is open
- Pick the isolation level deliberately for the operation, not globally; a reporting query doesn't need Serializable, a balance transfer might
- Use `FOR UPDATE` (or your engine's equivalent) for explicit row locking on read-modify-write patterns instead of relying on optimistic hope
- Handle deadlock errors and serialization failures with a retry loop in application code — they're expected under contention, not exceptional bugs
- Add database-level constraints (foreign keys, `CHECK`, `UNIQUE`) rather than relying solely on application code to preserve Consistency

## Related Terms
- [[SQL vs NoSQL]]
- [[Idempotency]]
- [[N+1 Query Problem]]
- [[Connection Pooling]]

## Example
A bank transfer: money leaves one account and enters another as a single atomic transaction, or neither happens. If the process crashes after the debit but before the credit, the WAL lets the database roll the debit back on recovery, so the money never simply vanishes.

## FAQ

**Does every database engine support ACID?**
Not fully by default. SQLite, Postgres, and MySQL's InnoDB engine are ACID-compliant; MySQL's older MyISAM engine is not (no transaction support at all). Many NoSQL stores traded strict ACID for availability and partition tolerance, though several now offer it at the single-document or even multi-document level.

**What's a deadlock and why does it happen in ACID systems?**
Two transactions each hold a lock the other needs, so both wait forever. Databases detect this (usually via a wait-for graph) and kill one transaction with an error, which the application should catch and retry.

**Can a transaction span multiple databases?**
Only with distributed transaction protocols like two-phase commit (2PC), which are slow and operationally painful, which is why most systems avoid cross-database transactions and instead use patterns like the Saga pattern with compensating actions.

**What's the difference between `ROLLBACK` and a savepoint rollback?**
`ROLLBACK` undoes the entire transaction back to `BEGIN`. `ROLLBACK TO SAVEPOINT x` only undoes work done after that savepoint was declared, leaving earlier statements in the transaction intact and still pending commit.

**Why did my transaction fail with "could not serialize access due to concurrent update"?**
That's Postgres enforcing Serializable isolation: it detected that committing your transaction alongside another concurrent one would violate serializability, so it aborts one of them. The correct response in application code is to catch that error and retry the whole transaction, not treat it as a fatal bug.

## Real-World Example
Airline seat booking is a classic ACID + isolation case study. Two customers click "book" on the last seat within milliseconds of each other. Without proper isolation and locking, both requests could read "1 seat available," both decrement it, and the airline oversells by one seat (a lost update). With `SELECT ... FOR UPDATE` or Serializable isolation, the second transaction either blocks until the first commits and then sees zero seats left, or is forced to retry and re-check availability, guaranteeing only one booking succeeds.
