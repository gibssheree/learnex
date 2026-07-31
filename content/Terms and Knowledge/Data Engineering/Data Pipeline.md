---
tags: [term, data-engineering, pipeline]
category: Pipeline Fundamentals
---

# Data Pipeline

**Definition:** An automated sequence of steps that moves data from one or more sources to a destination, usually involving extraction, transformation, and loading along the way.

## How It Works
- Data is pulled from sources (databases, APIs, event streams)
- It passes through transformation steps (cleaning, joining, aggregating)
- The result lands in a destination like a data warehouse or another application

## Why It Matters
- Almost every analytics dashboard, ML model, or report depends on a pipeline running correctly and on schedule behind the scenes

## Common Pitfalls
- No monitoring or alerting on pipeline failures, so a broken pipeline silently produces stale or missing data for days
- Not handling schema changes at the source gracefully, breaking the pipeline whenever an upstream team adds or renames a field

## Related Terms
- [[ETL vs ELT]]
- [[Apache Airflow]]
- [[Data Quality and Validation]]

## Example
A nightly pipeline pulls yesterday's orders from a production database, joins them with customer data, and loads the result into a warehouse table analysts query each morning.
