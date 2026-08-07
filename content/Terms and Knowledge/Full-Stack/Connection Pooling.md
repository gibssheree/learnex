---
tags: [term, fullstack, database, performance]
category: Database & Data
---

# Connection Pooling

**Definition:** Reusing a fixed set of open database connections instead of opening a new one for every request.

## How It Works
- A pool manager keeps N connections open and hands them out to requests as needed
- Connections are returned to the pool when a request finishes, not closed
- On startup (or lazily, on first use) the pool opens a minimum number of connections and keeps them warm; it grows toward a configured maximum as demand rises
- Each connection cycles through states: idle (parked in the pool) -> checked out (in use) -> released (back to idle) -> eventually recycled or destroyed after hitting a max age or max-use count
- A checkout request that arrives when the pool is already at max size and every connection is busy either queues until one frees up or fails fast once a wait timeout expires
- Pools usually validate a connection before handing it out — a cheap `SELECT 1` or a socket liveness check — because databases, firewalls, and load balancers silently drop idle TCP connections
- External poolers like PgBouncer or RDS Proxy sit as a separate process between app and database, multiplexing hundreds of client connections onto a much smaller number of real backend connections
- Health checks are often lazy — many pools only validate a connection's liveness if it's been idle past a threshold, not on every checkout, trading a small chance of handing out a dead connection for lower overhead
- Prepared statement caches frequently live at the connection level, so a pool that recycles connections very aggressively (short max lifetime, transaction-mode PgBouncer) can defeat statement-cache benefits that assume long-lived connections

## Why It Matters
- Opening a new DB connection is slow; without pooling, high traffic can exhaust the database's connection limit
- TCP handshake + TLS negotiation + database auth handshake can add tens of milliseconds per connection — trivial once, brutal when repeated on every request
- Databases cap concurrent connections (Postgres defaults `max_connections` to 100), and each one reserves real server memory (roughly 5-10MB per Postgres backend process) — so "just open more connections" doesn't scale linearly and can starve the server before CPU or disk becomes the bottleneck
- Pooling converts a per-request cost into a one-time startup cost, which matters most for high-throughput services and is often the difference between a serverless app working and falling over under load
- In enterprise settings with per-core or per-connection database licensing, pooling is a licensing cost lever as much as a performance one — fewer, well-utilized connections can directly reduce license spend

## Common Pitfalls
- Forgetting to release a connection back to the pool, causing "pool exhausted" or "timeout acquiring connection" errors under load
- Sizing the pool too large: more connections than the database can comfortably serve just moves the bottleneck from your app to the database, and every idle connection still costs it memory and context-switching overhead
- Sizing it too small for the workload, so requests queue on checkout and latency spikes even though the database itself has spare capacity
- Serverless/edge functions creating a new pool (and thus new DB connections) on every cold start — a burst of traffic can spin up hundreds of concurrent function instances, each opening its own pool, and blow through the database's connection limit in seconds
- Holding a connection open across a slow, unrelated operation (an external API call, disk I/O, waiting on a lock) instead of returning it to the pool first, starving other requests
- Not setting `statement_timeout` or `idle_in_transaction_session_timeout` — a stuck query or a forgotten `COMMIT` can hold a pooled connection hostage indefinitely
- Mixing pool sizing across multiple app instances without doing the math: 10 app replicas x a pool of 20 each = 200 connections aimed at a database capped at 100
- Treating the connection pool and the thread/worker pool as independent knobs — if the worker pool is larger than the connection pool, workers pile up waiting on checkout, and the connection pool quietly becomes the real concurrency ceiling

## Related Terms
- [[SQL vs NoSQL]]
- [[Serverless]]
- [[Database Indexing]]
- [[Load Balancer]]
- [[Caching]]

## Under the Hood
A pool is, at its core, a queue of connection objects guarded by a semaphore:
1. `acquire()` — if an idle connection exists, pop and return it; otherwise, if under max size, open a new one; otherwise, block on the wait queue
2. The caller runs its query or transaction against the checked-out connection
3. `release()` — the connection goes back to the idle queue, or gets destroyed if it errored, exceeded its max lifetime, or exceeded its max use count

A background reaper typically runs on an interval, closing connections that have sat idle longer than `idleTimeoutMillis` so the pool shrinks back toward its minimum during quiet periods instead of holding peak capacity forever. Pools also usually detect and evict "dead" connections — sockets the OS or a middlebox silently closed — by catching the error on the next checkout and transparently opening a replacement rather than surfacing the failure to the caller.

## Types
- **Client-side (in-process) pooling** — the pool lives inside your application process (e.g. `pg.Pool` in Node, HikariCP in Java, SQLAlchemy's `QueuePool`). Fast, no extra network hop, but each app instance/replica needs its own pool, so total connections scale with instance count
- **Server-side/external pooling** — a standalone proxy (PgBouncer, RDS Proxy, ProxySQL) sits between all app instances and the database, multiplexing many client connections onto few real ones. Solves the "N replicas x pool size" explosion but adds a network hop and its own operational surface
- **PgBouncer pooling modes** — `session` (one client connection maps to one server connection for the client's whole session; safest, least dense), `transaction` (server connection is returned to the pool after each transaction commits; most common, breaks session-level features like `SET` or `LISTEN`), `statement` (returned after each statement; most aggressive, incompatible with multi-statement transactions)

## Comparison
| | Without pooling | With pooling |
|---|---|---|
| Cost per request | Full TCP + TLS + auth handshake | Reuses an already-authenticated socket |
| DB connection count | Grows with concurrent requests | Bounded by pool size |
| Failure mode under load | Database hits `max_connections`, starts rejecting | Requests queue at the pool instead of the DB |
| Serverless fit | Poor — cold starts multiply connections | Needs an external pooler (RDS Proxy, PgBouncer) to be viable |

## Code Example
```js
// Node.js: node-postgres pool
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.internal',
  max: 20,               // max simultaneous connections
  min: 2,                // keep this many warm
  idleTimeoutMillis: 30_000,   // close idle clients after 30s
  connectionTimeoutMillis: 5_000, // fail fast if pool is exhausted
});

async function getUser(id) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  } finally {
    client.release(); // always release, even on error
  }
}
```

```ini
; pgbouncer.ini — session multiplexing in front of Postgres
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
listen_port = 6432
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

## Best Practices
- Size the pool from the database's headroom, not from a guess: `max_connections` on the DB, minus overhead for admin/replication connections, divided by the number of app instances
- Always release/return connections in a `finally` block so an exception mid-query doesn't leak the connection
- Set a `connectionTimeoutMillis` (or equivalent) so a saturated pool fails fast with a clear error instead of hanging the request indefinitely
- Pair application-level pools with an external pooler (PgBouncer, RDS Proxy) in serverless or highly horizontally-scaled environments
- Monitor pool metrics (active, idle, waiting) in production — a consistently near-zero idle count under normal load is the earliest signal you're under-provisioned

## FAQ
**Does connection pooling help with ORMs too?** Yes — Prisma, TypeORM, and SQLAlchemy all wrap an underlying pool; the same sizing and leak concerns apply, they're just configured through the ORM's client options instead of a raw driver.

**Why not just open one connection and share it across every request?** A single connection can only run one query at a time (or one transaction), so concurrent requests would serialize behind it, killing throughput.

**Is pooling still needed with HTTP/2 or gRPC keep-alive?** Those keep the client-to-server network connection warm, but that's a different layer — the database connection (with its own auth session, transaction state, and server-side memory) still needs its own pool.

**Why does my pool size feel arbitrary — is there a real formula?** Not a universal one, but HikariCP's documentation popularized a starting heuristic derived from PostgreSQL's own performance testing: `connections = ((core_count * 2) + effective_spindle_count)`. It's a starting point for tuning, not a law — the right number depends on query latency, how much time each connection spends idle mid-transaction, and how many app instances share the database.

## Sizing a Pool
Pool sizing is a queuing problem, not a "bigger is better" one. A database serves queries with finite CPU cores and I/O bandwidth; past a certain number of concurrent connections, adding more doesn't add throughput — it adds context-switching overhead and lock contention, and total throughput can actually drop. This is counterintuitive to engineers used to scaling web servers horizontally.
- Start from the database's real capacity: available CPU cores, typical query duration, and `max_connections`
- Divide that budget across every app instance, cron job, admin tool, and replication connection that touches the database — not just your main API service
- Watch for connections that sit "idle in transaction" — a connection mid-transaction but not actively running a query still occupies a pool slot and a database backend, so a slow client-side step between statements wastes capacity as surely as an actual query would
- Load test with realistic concurrency before trusting a sizing formula — synthetic benchmarks with trivial queries systematically overstate how large a pool should be, since real queries hold connections longer

## Real-World Example
A common production incident: a team migrates from a monolith (3 instances, pool size 10, 30 total connections) to a microservices split (15 services, pool size 10 each, 150 total connections) without revisiting the database's `max_connections` of 100. The app behaves fine in staging (low traffic, few simultaneous connections actually checked out) and then falls over during a traffic spike in production with `FATAL: sorry, too many clients already` — not because any single service misbehaved, but because nobody added up the fleet-wide total. The fix in the moment is usually inserting PgBouncer in front of the database as a multiplexing layer; the longer-term fix is tracking total possible connections as a fleet-wide budget whenever a new service is added.

## History
Connection pooling predates the web-scale internet — it shows up in the 1990s in Java application servers (BEA WebLogic, IBM WebSphere) and in Microsoft's ODBC/OLE DB driver stack, both solving the same problem: JDBC/ODBC connection setup was too slow to do per-request under real load. HikariCP (2012) became the de facto standard JVM pool by focusing obsessively on avoiding unnecessary synchronization and bytecode overhead. PgBouncer (2007) and, later, cloud-managed equivalents like AWS RDS Proxy (2019) emerged specifically because application-level pooling doesn't solve the "N app instances each open their own pool" multiplication problem — that needed a shared, out-of-process layer.

## Common Interview Questions
- **What's the difference between a pool's min and max size?** `min` is how many connections stay warm even when idle; `max` is the ceiling the pool will never exceed, queuing or rejecting requests beyond it
- **Why keep min above zero instead of scaling connections from nothing?** It avoids the latency spike of opening fresh connections right as traffic arrives, at the cost of a small constant baseline of idle DB resources
- **What's a connection leak, concretely?** Code that checks out a connection and never calls release/close — usually a missing `finally` around an exception path — until the pool's max is exhausted and every new checkout blocks
- **Should a transaction ever span multiple HTTP requests?** No — a transaction should complete within one checkout/release cycle; holding it open across requests ties up a pooled connection indefinitely and is almost always a bug
- **Can one app pool connections to two different databases?** Yes, but it needs two separate pools, since a connection is bound to one database and credential set at a time
- **Why have a maximum at all — why not let the pool grow indefinitely?** Because the database has a hard connection ceiling and finite CPU/memory; an unbounded pool just moves the failure from "pool blocks" to "database rejects everyone," which is worse
- **What's the tradeoff of a very short idle timeout?** Connections get closed and reopened more often, trading steady-state latency for faster reclamation of resources during a traffic drop-off
- **Is pool warm-up important right after a deploy?** Yes for latency-sensitive services — a cold pool means the first wave of post-deploy requests pays full connection-setup cost; some frameworks support eager warm-up on startup to avoid this

## Monitoring & Debugging
- Track active, idle, and waiting counts over time — a waiting count that's consistently above zero under normal load is the clearest signal the pool is undersized
- Watch checkout wait time as its own metric, separate from query duration — a healthy database with a saturated pool still produces slow-feeling requests, and conflating the two metrics hides the real bottleneck
- Log or alert on "pool exhausted" / checkout timeout errors distinctly from generic database errors, since they point at a capacity problem rather than a query or connectivity problem
- Correlate pool metrics with deploy events — a sudden spike in checked-out connections right after a deploy often means a new code path is holding connections longer (or leaking them) rather than a traffic change
- Cross-reference application-side pool metrics with the database's own connection count (`pg_stat_activity` in Postgres) to catch cases where multiple app instances collectively overwhelm the database even though each individual pool looks healthy

## Framework Defaults Worth Knowing
- Node's `pg.Pool` defaults to a max of 10 connections and no minimum — fine for a low-traffic service, almost always too small for a production API without tuning
- Java's HikariCP defaults to a max pool size of 10 as well, deliberately conservative, with its documentation explicitly warning against blindly increasing it without load testing
- Django's default database connections are not pooled at all out of the box (`CONN_MAX_AGE = 0`, a new connection per request) unless explicitly configured or paired with an external pooler like PgBouncer
- Rails' ActiveRecord pool size defaults to 5, tied historically to the size of the app server's thread/worker pool, and needs to scale with it
- Most managed database services (RDS, Cloud SQL, Supabase) publish their own `max_connections` default based on instance size — checking that number before tuning application-level pool sizes avoids designing for a ceiling that doesn't exist

## Example
A serverless function opening a new DB connection on every cold start can quickly exhaust a database's max connections without a pooler like PgBouncer. With RDS Proxy or PgBouncer in front, hundreds of concurrent Lambda invocations share a small, stable set of real Postgres connections instead of each grabbing one of its own.
