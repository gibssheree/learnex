---
tags: [platform, devops, ci-cd]
category: CI/CD Tools
---

# GitLab CI/CD

**Definition:** GitLab's built-in CI/CD system, deeply integrated into its all-in-one DevOps platform covering source control, CI/CD, and project management together.

## Core Services & Concepts
- **`.gitlab-ci.yml`** — [[CI-CD|CI/CD]], the pipeline definition file at the root of a repo
- **Runners** — the agents that execute pipeline jobs, similar in concept to GitHub Actions runners
- **Auto DevOps** — an opinionated, largely automatic CI/CD pipeline GitLab can generate for common project types

## Pros
- All-in-one platform: source control, CI/CD, issue tracking, and container registry in one product
- Mature, deeply configurable pipeline syntax
- Strong self-hosted option for teams needing to keep everything on their own infrastructure

## Cons
- Can feel heavier than GitHub Actions for small projects
- Self-hosted GitLab instances require real maintenance effort

## Best For
- Teams wanting one platform for source control, CI/CD, and project tracking together, especially with self-hosting requirements

## Real Examples
- Used heavily by enterprises and teams with strict on-premises or compliance requirements

## Use Cases
- End-to-end DevOps pipelines within a single platform
- Self-hosted CI/CD for compliance-sensitive organizations
