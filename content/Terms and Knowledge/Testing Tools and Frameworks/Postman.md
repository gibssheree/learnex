---
tags: [platform, testing, api]
category: API & Load Testing
---

# Postman

**Definition:** The most widely used tool for manually testing, documenting, and automating tests against APIs, built around a graphical interface for sending HTTP requests.

## Core Services & Concepts
- **Collections** — [[REST API]], saved, organized groups of requests that can be shared with a team or run as automated test suites
- **Environments** — variable sets (like different API keys per environment) swapped in and out of the same collection
- **Newman** — Postman's CLI runner, letting collections run inside [[CI-CD|CI/CD]] pipelines instead of only manually

## Pros
- Extremely approachable for manually exploring and debugging an API
- Collections double as living API documentation
- Can be automated in CI via Newman, not purely a manual tool

## Cons
- Can encourage skipping proper automated test suites in favor of manual clicking
- Free tier has real limits on team collaboration features

## Best For
- Manually testing and documenting REST/GraphQL APIs during development

## Real Examples
- Used by nearly every backend developer at some point for manual API testing

## Use Cases
- Manual API exploration and debugging
- API documentation via shared collections
- Automated API test suites run through Newman in CI
