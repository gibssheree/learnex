---
tags: [moc, term, data-engineering]
---

# Data Engineering Terms MOC

10 terms across 4 categories, the plumbing that moves data between the systems already covered in [[Advanced Databases Terms MOC|Advanced Databases]] (single-database internals) and [[Machine Learning and Deep Learning Terms MOC|ML/DL]] (what happens once data reaches a model).

## Pipeline Fundamentals
- [[ETL vs ELT]]
- [[Data Pipeline]]
- [[Change Data Capture (CDC)]]

## Processing Paradigms
- [[Batch vs Stream Processing]]
- [[Apache Spark]]
- [[Apache Kafka]]

## Storage
- [[Data Lake vs Data Warehouse]]
- [[Snowflake]]

## Orchestration & Quality
- [[Apache Airflow]]
- [[Data Quality and Validation]]

---

## How to use this
Read this as one connected story: data changes in a source system ([[Change Data Capture (CDC)]]), gets moved by a [[Data Pipeline]] ([[ETL vs ELT]]), processed in [[Batch vs Stream Processing|batch or streaming]] ([[Apache Spark]], [[Apache Kafka]]), lands in a [[Data Lake vs Data Warehouse|lake or warehouse]] ([[Snowflake]]), all orchestrated and checked by [[Apache Airflow]] and [[Data Quality and Validation]].

## Suggested order if starting from zero
1. **Data Pipeline → ETL vs ELT** — the shape of the whole field
2. **Data Lake vs Data Warehouse → Snowflake** — where data ends up
3. **Batch vs Stream Processing → Apache Spark → Apache Kafka** — how data actually moves and transforms at scale
4. **Apache Airflow → Data Quality and Validation** — how it's kept running and trustworthy
5. **Change Data Capture (CDC)** — the more advanced technique, once the fundamentals click
