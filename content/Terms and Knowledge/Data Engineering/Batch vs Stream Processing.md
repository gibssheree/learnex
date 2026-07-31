---
tags: [term, data-engineering, processing]
category: Processing Paradigms
---

# Batch vs Stream Processing

**Definition:** Two ways to process data: batch processing handles large chunks of data on a schedule, stream processing handles individual events continuously as they arrive.

## How It Works
- Batch: data accumulates, then a job processes all of it at once (e.g. every hour or once a day)
- Stream: each event is processed individually, within seconds or milliseconds of arriving, often via [[Apache Kafka]] or similar systems
- Many modern architectures use both: streaming for real-time needs, batch for heavier historical reprocessing

## Why It Matters
- The choice directly determines how fresh your data can be, and how complex your infrastructure needs to be

## Common Pitfalls
- Building a full streaming architecture when a simple nightly batch job would have solved the actual business need, adding unnecessary complexity
- Underestimating how much harder stream processing is to debug and reprocess compared to batch (you can't simply "rerun yesterday" the same way)

## Related Terms
- [[Apache Spark]]
- [[Apache Kafka]]
- [[Data Pipeline]]

## Example
A batch job recalculates monthly sales totals every night; a streaming pipeline updates a live "orders in the last hour" dashboard as each order happens.
