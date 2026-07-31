---
tags: [term, data-engineering, storage]
category: Storage
---

# Snowflake

**Definition:** A cloud-native data warehouse platform that separates storage and compute, letting each scale independently, one of the most widely adopted modern analytics warehouses.

## How It Works
- Storage and compute ("virtual warehouses") scale and bill separately, so you're not paying for idle compute just to keep data stored
- Runs on top of major cloud providers (AWS, Azure, GCP) without requiring you to manage the underlying infrastructure
- Supports both structured SQL analytics and semi-structured data (JSON) natively

## Why It Matters
- Removed a lot of the manual capacity planning that older on-premises data warehouses required, you scale compute up or down on demand

## Common Pitfalls
- Leaving virtual warehouses running (and billing) when nobody is actually querying them
- Writing inefficient queries that scan far more data than needed, directly inflating compute costs since Snowflake bills by compute time

## Related Terms
- [[Data Lake vs Data Warehouse]]
- [[OLTP vs OLAP]]
- [[ETL vs ELT]]

## Example
An analytics team runs ELT with dbt, loading raw data into Snowflake and transforming it with SQL that runs directly on Snowflake's compute.
