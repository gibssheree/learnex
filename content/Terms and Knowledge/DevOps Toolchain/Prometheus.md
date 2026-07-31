---
tags: [platform, devops, observability]
category: Monitoring & Observability
---

# Prometheus

**Definition:** An open-source monitoring system that pulls time-series metrics from configured targets at regular intervals and stores them for querying and alerting.

## Core Services & Concepts
- **Pull-based scraping** — [[Observability and Monitoring]], Prometheus reaches out to targets on a schedule rather than waiting for them to push data
- **PromQL** — its own query language for slicing and aggregating time-series metrics
- **Alertmanager** — a companion tool that turns Prometheus alert rules into notifications (Slack, email, PagerDuty)

## Pros
- De facto standard for metrics in the Kubernetes ecosystem
- Powerful query language for custom dashboards and alerts
- Free and open source with a huge community

## Cons
- Pull-based model doesn't fit every architecture well (short-lived jobs need a push gateway workaround)
- Long-term storage requires additional tooling (Prometheus itself isn't built for years of retention)

## Best For
- Kubernetes-native and cloud-native applications needing real-time metrics and alerting

## Real Examples
- The default metrics backend for most Kubernetes observability stacks

## Use Cases
- Infrastructure and application metrics collection
- Alerting on service health and performance thresholds
