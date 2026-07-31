---
tags: [term, data-engineering, pipeline]
category: Pipeline Fundamentals
---

# ETL vs ELT

**Definition:** Two orders for moving data into a warehouse: ETL transforms data before loading it, ELT loads raw data first and transforms it afterward inside the warehouse.

## How It Works
- ETL (Extract, Transform, Load): data is cleaned and reshaped in a separate processing step, then the finished result is loaded into the warehouse
- ELT (Extract, Load, Transform): raw data is dumped into the warehouse first, then transformed using the warehouse's own compute power (SQL, dbt)
- ELT became more popular as cloud warehouses like [[Snowflake]] made in-warehouse compute cheap and elastic

## Why It Matters
- The choice affects where your transformation logic lives, and how easy it is to reprocess data if requirements change
- ELT keeps a full copy of raw data, letting you re-derive new transformations later without re-extracting from source systems

## Common Pitfalls
- Assuming ELT means "no transformation planning needed" — it just moves the transformation step, it doesn't remove the need for clean logic
- Loading raw, unvalidated data with ELT and letting bad data flow all the way into dashboards before anyone catches it

## Related Terms
- [[Data Pipeline]]
- [[Data Lake vs Data Warehouse]]
- [[Snowflake]]

## Example
A company loads raw clickstream events into Snowflake untouched (EL), then uses dbt to transform them into clean, aggregated tables (T) — that's ELT.
