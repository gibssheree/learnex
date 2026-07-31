---
tags: [term, data-engineering, storage]
category: Storage
---

# Data Lake vs Data Warehouse

**Definition:** A data lake stores raw data of any format cheaply and without a predefined schema; a data warehouse stores structured, cleaned data optimized for fast analytical queries.

## How It Works
- Data lake: dump anything, structured or not (logs, images, JSON, CSVs), cheaply, schema is applied later when reading ("schema-on-read")
- Data warehouse: data is structured and validated before it's loaded, optimized for [[OLTP vs OLAP|OLAP-style]] analytical queries
- Modern "lakehouse" architectures try to blend both, cheap raw storage with warehouse-like query performance

## Why It Matters
- Picking the wrong one for the job means either paying warehouse prices to store raw logs nobody queries directly, or running slow analytical queries against unstructured lake data

## Common Pitfalls
- Letting a data lake become a "data swamp": raw files pile up with no organization, documentation, or quality checks, making them unusable
- Assuming a data warehouse can cheaply store everything a data lake can, warehouse storage and compute are usually more expensive per byte

## Related Terms
- [[ETL vs ELT]]
- [[Snowflake]]
- [[OLTP vs OLAP]]

## Example
Raw app logs land in a data lake (S3) as-is; a nightly job cleans and aggregates the useful parts into a data warehouse (Snowflake) that analysts actually query.
