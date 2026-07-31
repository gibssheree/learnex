---
tags: [term, data-engineering, quality]
category: Orchestration & Quality
---

# Data Quality and Validation

**Definition:** Automated checks that verify data meets expected rules, like correct types, no unexpected nulls, and values within expected ranges, before or after it moves through a pipeline.

## How It Works
- Validation rules are defined (a column shouldn't be null, an ID should be unique, a value should fall within a known range)
- Checks run automatically as part of a [[Data Pipeline|pipeline]], often via [[Apache Airflow]]
- Failures can halt the pipeline, alert the team, or just get logged for later review, depending on severity

## Why It Matters
- Bad data that flows silently into dashboards or ML models erodes trust in data faster than almost anything else, "garbage in, garbage out" at organizational scale

## Common Pitfalls
- Only validating data at the very end of a pipeline, so by the time a problem is caught, it's already been expensive to trace back to its source
- Treating every validation failure as equally severe, causing alert fatigue that makes teams start ignoring real issues

## Related Terms
- [[Data Pipeline]]
- [[Apache Airflow]]
- [[ETL vs ELT]]

## Example
A pipeline checks that a `user_id` column is never null and that `order_total` is always non-negative, failing the pipeline run and alerting the team if either check fails.
