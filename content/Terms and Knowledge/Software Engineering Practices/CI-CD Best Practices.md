---
tags: [term, swe, devops]
category: Maintainability & Delivery
subcategory: DevOps & Delivery
---

# CI-CD Best Practices

**Definition:** Continuous Integration (CI) automatically builds and tests code on every commit; Continuous Deployment (CD) automatically releases validated code into production.

## How It Works
- Triggers: Git push / Pull Request open
- CI Pipeline: Linting -> Static Analysis -> Compile -> Run Unit Tests -> Run Security Scans
- CD Pipeline: Build Container -> Staging Deployment -> Integration Test -> Production Blue/Green or Canary Release

## Why It Matters
- Reduces deployment risk, eliminates manual release human errors, and enables multiple daily releases

## Common Pitfalls
- Treating flaky tests as acceptable by allowing pipeline retries instead of fixing root causes

## Related Terms
- [[Test Pyramid and TDD]]
- [[Code Review and Static Analysis]]

## Example
GitHub Actions workflow running `pytest` and deploying Docker image to AWS ECS on merge to `main`.
