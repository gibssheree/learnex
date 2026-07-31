---
tags: [platform, devops, observability]
category: Monitoring & Observability
---

# Grafana

**Definition:** A visualization and dashboarding tool that turns metrics from sources like Prometheus into readable graphs and dashboards.

## Core Services & Concepts
- **Data sources** — [[Observability and Monitoring]], connects to Prometheus, databases, and dozens of other backends without owning the data itself
- **Dashboards** — customizable panels of graphs, tables, and alerts built from queries against connected data sources
- **Alerting** — can trigger notifications directly from dashboard panel thresholds

## Pros
- Works with almost any data source, not locked into one metrics backend
- Highly customizable, visually polished dashboards
- Strong free/open-source tier

## Cons
- Grafana itself doesn't store metrics, it's only as good as the data sources feeding it
- Complex dashboards can become difficult to maintain over time

## Best For
- Visualizing metrics from Prometheus, cloud provider metrics, or databases in one unified view

## Real Examples
- The standard visualization layer paired with Prometheus across most cloud-native monitoring stacks

## Use Cases
- Infrastructure and application dashboards
- Executive/team-facing status dashboards
- Cross-referencing metrics from multiple systems in one screen
