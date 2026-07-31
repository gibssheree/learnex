---
tags: [platform, devops, containers, kubernetes]
category: Container Tooling
---

# Helm

**Definition:** The package manager for Kubernetes, letting you define, install, and upgrade complex Kubernetes applications as reusable, versioned "charts."

## Core Services & Concepts
- **Charts** — [[Kubernetes (K8s)]], bundled, templated sets of Kubernetes YAML manifests for an application
- **Values files** — configuration overrides that customize a chart for a specific environment without editing the chart itself
- **Releases** — a specific deployed instance of a chart, trackable and upgradeable as a unit

## Pros
- Turns sprawling Kubernetes YAML into reusable, configurable packages
- Huge library of community-maintained charts for common software (databases, monitoring stacks, ingress controllers)
- Makes upgrades and rollbacks of complex applications far simpler

## Cons
- Adds another layer of abstraction and templating syntax to learn on top of Kubernetes itself
- Poorly written charts can hide what's actually being deployed, making debugging harder

## Best For
- Deploying and managing complex, multi-resource applications on Kubernetes without hand-writing every YAML file

## Real Examples
- Nearly every popular open-source tool that runs on Kubernetes (Prometheus, Grafana, databases) ships an official Helm chart

## Use Cases
- Installing third-party software onto a Kubernetes cluster
- Templating an application's Kubernetes config across dev, staging, and production
