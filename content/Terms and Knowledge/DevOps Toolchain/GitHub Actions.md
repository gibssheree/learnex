---
tags: [platform, devops, ci-cd]
category: CI/CD Tools
---

# GitHub Actions

**Definition:** GitHub's built-in CI/CD platform, running automated workflows directly inside a GitHub repository in response to events like pushes or pull requests.

## Core Services & Concepts
- **Workflows (YAML)** — [[CI-CD|CI/CD]], defined in `.github/workflows/`, triggered by repo events
- **Runners** — the machines (GitHub-hosted or self-hosted) that actually execute a workflow's steps
- **Marketplace Actions** — reusable, shareable workflow steps built by the community

## Pros
- Zero setup if your code already lives on GitHub, no separate CI system to configure
- Huge marketplace of pre-built actions for common tasks
- Generous free tier for public repositories

## Cons
- Tied to GitHub, migrating away means rewriting your CI configuration
- Self-hosted runners require your own infrastructure management for heavier workloads

## Best For
- Any project already hosted on GitHub wanting CI/CD without adopting a separate platform

## Real Examples
- Used by millions of open-source and private repositories on GitHub

## Use Cases
- Running test suites on every pull request
- Automated deployment on merge to main
- Scheduled jobs (nightly builds, dependency checks)
