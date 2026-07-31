---
tags: [term, data-engineering, processing, messaging]
category: Processing Paradigms
---

# Apache Kafka

**Definition:** A distributed event streaming platform that lets many producers publish events and many consumers read them, durably and at very high throughput.

## How It Works
- Producers write events to named "topics"
- Kafka durably stores events on disk for a configurable retention period, not just in memory like a typical [[Message Queue]]
- Multiple consumers can independently read the same topic at their own pace, replaying from any point if needed

## Why It Matters
- Became the backbone of real-time data infrastructure at most large tech companies, decoupling data producers from consumers at massive scale

## Common Pitfalls
- Treating Kafka like a simple task queue when a lighter tool like [[Message Queue|a traditional message queue]] would be simpler and sufficient
- Underestimating the operational complexity of running and tuning Kafka clusters reliably

## Related Terms
- [[Change Data Capture (CDC)]]
- [[Batch vs Stream Processing]]
- [[Message Queue]]

## Example
LinkedIn (Kafka's creator) uses it to stream billions of events per day, from activity tracking to log aggregation across its entire infrastructure.
