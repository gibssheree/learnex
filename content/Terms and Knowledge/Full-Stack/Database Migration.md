---
tags: [term, fullstack, database]
category: Database & Data
---

# Database Migration

**Definition:** A versioned, scripted change to a database schema, like adding a column or creating a table, that can be applied and rolled back predictably.

## How It Works
- Migration tools track which scripts have already run
- New ones apply in order, and most can generate the "down"/rollback version automatically

## Why It Matters
- Keeps every environment (dev, staging, prod) and every teammate's database in sync with the codebase

## Common Pitfalls
- Manually editing the production database schema without a migration, causing environments to drift out of sync with the code

## Related Terms
- [[SQL vs NoSQL]]

## Example
Prisma Migrate, Rails migrations, Django migrations, Flyway.
