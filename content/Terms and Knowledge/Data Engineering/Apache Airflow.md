---
tags: [term, data-engineering, orchestration]
category: Orchestration & Quality
---

# Apache Airflow

**Definition:** A workflow orchestration tool for defining, scheduling, and monitoring [[Data Pipeline|data pipelines]] as code, using Python to describe dependencies between tasks.

## How It Works
- Pipelines are defined as DAGs (Directed Acyclic Graphs), Python code describing which tasks run, in what order, and how they depend on each other
- The scheduler triggers DAGs on a schedule (or externally), and a web UI shows run history, failures, and retries
- Failed tasks can be automatically retried, and failures can trigger alerts

## Why It Matters
- Became the standard way data teams manage complex pipelines with many interdependent steps, instead of a tangle of cron jobs with no visibility

## Common Pitfalls
- Writing heavy computation directly inside Airflow tasks instead of having Airflow just orchestrate calls to something like [[Apache Spark]], overloading the scheduler
- DAGs that grow so complex they become hard to reason about, defeating the purpose of moving away from a tangle of cron jobs

## Related Terms
- [[Data Pipeline]]
- [[ETL vs ELT]]
- [[Apache Spark]]

## Example
An Airflow DAG extracts data from an API every morning, waits for that task to succeed, then triggers a transformation job, then loads the result into a warehouse.
