---
tags: [term, fullstack, database]
category: Database & Data
---

# Database Migration

**Definition:** A versioned, scripted change to a database schema, like adding a column or creating a table, that can be applied and rolled back predictably.

## How It Works
- Migration tools track which scripts have already run
- New ones apply in order, and most can generate the "down"/rollback version automatically
- Each migration is a file (SQL or code that generates SQL) with a unique, ordered identifier — usually a timestamp or incrementing number — so tools know the exact sequence to apply them in
- The tool keeps a bookkeeping table in the database itself (commonly named `schema_migrations`, `_prisma_migrations`, or `django_migrations`) listing which migration IDs have already run
- On deploy, the tool diffs "migrations that exist in code" against "migrations recorded as applied," and runs only the missing ones, in order, usually inside a transaction per migration
- Each migration typically has two directions: `up` (apply the change) and `down` (revert it) — some frameworks auto-generate `down` from `up` for simple structural changes, but data transformations usually need a hand-written rollback
- Migrations run once and are treated as immutable after being applied anywhere shared (staging, prod) — fixing a mistake means writing a new migration, not editing the old file, because other environments may have already run the original
- Most tools compute a checksum of each migration file and store it alongside the applied record — if the file's contents change after it's been applied, the tool refuses to proceed rather than silently trusting a mutated migration
- Framework-based tools (Prisma, Django, Rails) can auto-generate migrations by diffing your models/schema definitions against the last known state, while SQL-first tools (Flyway, Liquibase) expect you to write the DDL by hand

## Why It Matters
- Keeps every environment (dev, staging, prod) and every teammate's database in sync with the codebase
- Schema changes become code-reviewable, versioned alongside the application code, and reproducible — spin up a fresh database and running all migrations in order gets you the exact current schema
- Enables CI/CD: a deploy pipeline can run pending migrations automatically as part of release, instead of a human SSHing in to hand-run SQL
- Rollback support means a bad schema change can be reverted with the same rigor as reverting a code deploy, instead of being a one-way door
- Migrations double as living documentation of how the schema got to its current shape — reading through a project's migration history often explains *why* a table looks the way it does better than the current schema alone would

## Common Pitfalls
- Manually editing the production database schema without a migration, causing environments to drift out of sync with the code
- Writing a migration that's only safe if the app is fully stopped — e.g. renaming a column in one step — which causes errors for any app instance still running the old code during a rolling deploy
- Adding a `NOT NULL` column without a default on a large, actively-written table — this can lock the table for the duration of the backfill and take the app down mid-deploy
- Forgetting that a migration and the code that depends on it deploy at different times in a rolling deployment — old code and new schema (or new code and old schema) coexist briefly, and an incompatible migration breaks that window
- Committing a migration that was run and later edited — once a migration has executed anywhere shared, editing its file instead of writing a new one desyncs environments that already applied the original version
- Skipping the "down" migration entirely, leaving no safe way to roll back a bad deploy in production without a database restore
- Running long-locking operations (large index builds, full-table rewrites) without using the database's non-blocking variant (e.g. Postgres's `CREATE INDEX CONCURRENTLY`), causing production writes to stall
- Letting migration files pile up unreviewed for months, so a fresh environment has to replay hundreds of small historical steps just to reach current state, slowing down onboarding and CI setup
- Bundling a schema change and a large data backfill into the same migration transaction — an unrelated failure partway through the backfill rolls back the schema change too, and a backfill touching millions of rows can hold locks far longer than a pure DDL change would

## Related Terms
- [[SQL vs NoSQL]]
- [[Database Indexing]]
- [[Connection Pooling]]

## Under the Hood
The bookkeeping table is what makes migrations idempotent across environments — a fresh database and a five-year-old production database both converge to the same schema because the tool always computes "pending = all migrations minus applied migrations" rather than assuming a starting state. A typical run:
1. Tool connects, reads the migrations table for already-applied IDs
2. Compares against migration files present in the codebase
3. For each pending migration, in ID order: begin transaction, run the `up` SQL, insert a row into the migrations table recording it as applied, commit
4. If a migration fails mid-way, the transaction rolls back and the tool stops, leaving the database in the last known-good state and the deploy pipeline able to fail loudly instead of silently

Not every DDL statement is transactional in every database — MySQL famously auto-commits DDL, meaning a failed multi-statement migration can leave a half-applied schema even inside a nominal "transaction." Postgres, by contrast, supports transactional DDL, so a failed migration there truly rolls back cleanly.

## Types
- **Schema migrations** — structural changes: add/drop/rename columns, tables, indexes, constraints
- **Data migrations** — transform or backfill existing data (e.g. splitting a `name` column into `first_name`/`last_name` and populating them from existing rows)
- **Online (zero-downtime) migrations** — designed to run against a live database serving production traffic, using non-locking techniques
- **Offline migrations** — require a maintenance window because they lock the table or need the app stopped

## Best Practices — Expand/Contract Pattern
The standard technique for zero-downtime schema changes, breaking one "risky" change into several safe ones:
1. **Expand** — add the new column/table alongside the old one, nullable or with a safe default; deploy this first
2. **Dual-write** — deploy application code that writes to both old and new structures; backfill existing rows in batches
3. **Migrate reads** — deploy application code that reads from the new structure once backfill is confirmed complete
4. **Contract** — once nothing reads or writes the old structure, drop it in a final migration

This means a rename is never one migration — it's add-new-column, backfill, switch reads, stop writing old column, then drop old column, each as a separate deploy.

## Code Example
```sql
-- 20240115120000_add_email_verified_to_users.up.sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;

-- 20240115120000_add_email_verified_to_users.down.sql
ALTER TABLE users DROP COLUMN email_verified;
```

```sql
-- Non-blocking index creation in Postgres — avoids locking writes
CREATE INDEX CONCURRENTLY idx_orders_customer_id ON orders (customer_id);
```

```prisma
// Prisma schema change — migration file generated via `prisma migrate dev`
model User {
  id             Int      @id @default(autoincrement())
  email          String   @unique
  emailVerified  Boolean  @default(false)
}
```

```bash
# Common migration CLI commands across ecosystems
npx prisma migrate dev --name add_email_verified   # Prisma: create + apply
rails db:migrate                                    # Rails
python manage.py migrate                            # Django
flyway migrate                                       # Flyway
```

## Comparison
| Tool | Ecosystem | Rollback support | Notable trait |
|---|---|---|---|
| Prisma Migrate | Node/TS | Yes, via new migration | Generates SQL from schema diff |
| Rails Migrations | Ruby | Yes, `db:rollback` | `change` method infers `down` automatically |
| Django Migrations | Python | Yes, migrate to earlier name | Auto-detects model changes |
| Flyway | Polyglot/JVM | Manual (versioned + undo scripts) | Plain SQL files, framework-agnostic |
| Liquibase | Polyglot/JVM | Yes, changeset-based | XML/YAML/SQL changesets, diffing support |

## FAQ
**Can I just edit an old migration file to fix a mistake?** Only if it has never run anywhere outside your local machine. Once applied to a shared environment, write a new migration instead — editing history desyncs anyone who already ran the original.

**What happens if two developers write migrations at the same time?** Most tools use timestamp-based IDs to avoid collisions, but two migrations can still conflict logically (e.g. both adding a column with the same name) — this surfaces as a merge conflict or a failed migration run, caught in CI before it reaches production.

**Do NoSQL databases need migrations?** Schema-less doesn't mean change-less — MongoDB documents still need coordinated updates when the application's expected shape changes, so many teams write equivalent migration scripts even without an enforced schema.

**What happens if a migration fails halfway through in production?** Depends on the database's DDL transaction support — Postgres rolls the whole migration back cleanly since DDL is transactional there; MySQL can leave a half-applied schema because most DDL statements implicitly commit, which is why some teams keep migrations on MySQL deliberately small and single-purpose.

**Should seed data (test/demo rows) go through migrations?** Generally no — migrations are for schema (and occasionally necessary data backfills), while seed data belongs in a separate, explicitly-invoked script, since it's environment-specific (you want demo data in dev, never in production) rather than something that should run automatically on every deploy.

## Real-World Example
A team needs to rename `users.name` to `users.full_name`. Someone writes a single migration doing `ALTER TABLE users RENAME COLUMN name TO full_name;` and deploys it. During the rolling deploy, old application instances (still running code that `SELECT`s `name`) start throwing `column "name" does not exist` errors the instant the migration runs against the shared database, well before the new code has finished rolling out — a multi-minute outage from a one-line migration. The expand/contract fix: first migration adds `full_name` as a new nullable column; a backfill script copies data over; app code deploys reading from `full_name` with `name` as a fallback, then reading `full_name` only; a final migration drops the now-unused `name` column. Four small, safe steps instead of one fast, dangerous one.

## History
Early web frameworks (pre-2005) mostly had developers hand-write and hand-run SQL scripts, tracked by convention or not at all — schema drift between environments was routine and painful. Rails introduced ActiveRecord Migrations around 2004-2005 and popularized the now-standard pattern: timestamped, ordered files, a tracking table, and `up`/`down` methods, which Django, Laravel, and most subsequent frameworks converged on independently. The "expand/contract" pattern for zero-downtime migrations became widely documented practice through the 2010s as continuous deployment (shipping many times a day, with old and new code briefly coexisting) became the norm rather than scheduled maintenance-window releases.

## Common Interview Questions
- **Why version migrations instead of just keeping one `schema.sql` file?** A single schema snapshot tells you the current state but not the safe path to get any given environment there incrementally, nor does it support rollback of just the most recent change
- **What's the risk of auto-generated "down" migrations?** They're usually only safe for purely structural, reversible changes (add a column, add an index) — anything involving data transformation or destructive changes (dropping a column with data in it) needs a hand-written, deliberately considered rollback, since the data itself can't be un-lost automatically
- **Why avoid mixing DDL and large data changes in one migration?** Locking, transaction duration, and blast radius on failure are all worse when they're combined — separating them lets each be tuned and tested on its own terms
- **How do you migrate a database with zero downtime for a breaking change (like a column type change)?** Expand/contract: add the new column with the new type, dual-write and backfill, cut reads over, then drop the old column in a later migration — never do it as a single blocking `ALTER COLUMN`
- **What's the difference between a migration and a database backup/snapshot?** A migration is a forward-moving, incremental change to structure; a backup is a full point-in-time copy of data used for disaster recovery — they're complementary, not substitutes for each other

## Best Practices Checklist
- Keep each migration focused on one logical change — easier to review, easier to roll back, easier to reason about if it fails partway
- Test migrations against a production-sized (or realistically sampled) dataset before running them against real production, since lock duration and performance often don't show up on a small dev database
- Never assume a migration is safe just because it worked in a local or staging environment with far less data and no concurrent traffic
- Keep migrations backward-compatible with the currently-deployed code for at least one deploy cycle, so a rolling deploy never has old code hitting a schema it doesn't understand
- Review migration files in the same pull request as the code that depends on them, so reviewers see the schema change and its consumer together

## Migrations in CI/CD
- Most teams run pending migrations as an explicit pipeline step before deploying new application code, so the database is always ready for the code that's about to start running against it
- A common safety net is running migrations against an ephemeral copy of production-like data in CI, catching lock timeouts or long-running migrations before they ever reach a real environment
- Some pipelines split "run migrations" and "deploy new code" into separate, independently-triggered steps specifically so a bad migration can be caught and rolled back without also having shipped the code that depends on it
- Feature flags are often paired with expand/contract migrations — the new column/table exists and is populated well before the feature flag exposing it to users is flipped on, decoupling schema readiness from feature launch timing

## Comparison: Migration Tool Philosophies
| Approach | Example tools | Tradeoff |
|---|---|---|
| Code-first (infer migrations from model diffs) | Prisma, Django, Rails | Fast to author, but auto-generated SQL sometimes needs manual editing for complex or data-transforming changes |
| SQL-first (hand-written migration files) | Flyway, raw SQL scripts | Full control and transparency, more verbose, no auto-diffing |
| Declarative/diffing | Atlas, Liquibase diff mode | Describe desired end state, tool computes the migration — powerful but requires trusting the diff engine's judgment |

## Example
Prisma Migrate, Rails migrations, Django migrations, Flyway. A typical flow: a developer runs `prisma migrate dev` locally to generate and apply a new migration file, commits it alongside the code that depends on it, and the CI/CD pipeline runs `prisma migrate deploy` against staging and then production as part of the release.
