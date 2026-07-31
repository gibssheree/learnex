---
tags: [platform, devops, ci-cd]
category: CI/CD Tools
---

# Jenkins

**Definition:** The original widely adopted open-source automation server for CI/CD, self-hosted and extended through a massive plugin ecosystem.

## Core Services & Concepts
- **Jenkinsfile** — [[CI-CD|CI/CD]], a pipeline defined as code, usually written in Groovy-based syntax
- **Plugins** — Jenkins's core functionality is minimal by design, almost everything comes from its enormous plugin library
- **Agents/Nodes** — distributed build machines that execute pipeline stages

## Pros
- Extremely flexible, a plugin exists for nearly any tool or workflow imaginable
- Fully self-hosted, complete control over infrastructure and data
- Long track record and huge existing knowledge base

## Cons
- Plugin sprawl and version conflicts are a common maintenance headache
- Requires real ongoing server maintenance, unlike hosted alternatives like GitHub Actions
- UI and configuration feel dated compared to newer tools

## Best For
- Organizations needing maximum flexibility and full control over their CI/CD infrastructure

## Real Examples
- Still widely used in large, established enterprises with complex legacy build requirements

## Use Cases
- Complex, highly customized build pipelines
- On-premises CI/CD in regulated or air-gapped environments
