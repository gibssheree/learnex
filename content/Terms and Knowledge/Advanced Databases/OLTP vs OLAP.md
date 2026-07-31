---
tags: [term, databases, architecture]
category: Database Architectures
---

# OLTP vs OLAP

**Definition:** Two distinct processing paradigms where OLTP (Online Transaction Processing) focuses on fast, high-volume transactional data entry, while OLAP (Online Analytical Processing) focuses on complex queries over massive historical datasets.

## How It Works
- OLTP systems process real-time atomic transactions (INSERT, UPDATE, DELETE) for operational applications, typically using normalized row-oriented storage.
- OLAP systems execute complex aggregations and joins on read-heavy data warehouses, typically using denormalized column-oriented storage.
- ETL (Extract, Transform, Load) pipelines move data from operational OLTP databases into analytical OLAP databases.

## Why It Matters
- Running heavy analytical aggregations on a live OLTP database will lock tables and severely impact the performance of customer-facing operational applications.

## Common Pitfalls
- Attempting to build complex reporting dashboards directly against a live row-oriented OLTP database instead of replicating data to a column-oriented OLAP warehouse.

## Related Terms
- [[Database Normalization and Denormalization]]

## Example
Processing 10,000 Amazon shopping cart checkouts per minute uses OLTP (PostgreSQL), while calculating total regional sales trends across 5 years of checkout history uses OLAP (Snowflake).
