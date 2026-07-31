---
tags: [platform, devops, observability]
category: Monitoring & Observability
---

# Datadog

**Definition:** A commercial, all-in-one observability platform combining metrics, logs, traces, and alerting into a single hosted product, an alternative to self-hosting Prometheus and Grafana.

## Core Services & Concepts
- **APM (Application Performance Monitoring)** — distributed tracing across services, tied to [[Observability and Monitoring]]
- **Log Management** — centralized log collection and search
- **Unified dashboards** — combines metrics, logs, and traces in one interface without stitching together separate tools

## Pros
- Everything in one hosted product, no self-hosting or maintenance burden
- Strong out-of-the-box integrations with cloud providers and common frameworks
- Distributed tracing makes debugging microservices much easier

## Cons
- Expensive at scale, cost is one of the most common complaints about Datadog
- Vendor lock-in, migrating away from Datadog's ecosystem is a real undertaking

## Best For
- Teams wanting a fully managed observability stack without running Prometheus/Grafana themselves

## Real Examples
- Widely used across mid-size to large SaaS companies for full-stack observability

## Use Cases
- Full-stack application performance monitoring
- Centralized logging across microservices
- Incident response and root-cause analysis
