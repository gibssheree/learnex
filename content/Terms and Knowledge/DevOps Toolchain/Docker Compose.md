---
tags: [platform, devops, containers]
category: Container Tooling
---

# Docker Compose

**Definition:** A tool for defining and running multi-container Docker applications using a single YAML file, instead of manually running multiple `docker run` commands.

## Core Services & Concepts
- **`docker-compose.yml`** — [[Docker]], declares every service (app, database, cache) and how they connect
- **Networking** — automatically creates a shared network so containers can reach each other by service name
- **Volumes** — persists data (like a database's files) outside the container lifecycle

## Pros
- Spins up an entire multi-service local environment with one command
- Keeps a project's full stack (app + database + cache) defined and version-controlled together
- Much simpler than Kubernetes for local development or small deployments

## Cons
- Not designed for production-scale orchestration, no auto-scaling or self-healing like Kubernetes
- Single-host by design, doesn't span multiple machines

## Best For
- Local development environments needing a database, cache, and app running together consistently across a team

## Real Examples
- The standard way most full-stack projects define "run the whole app locally" in a single command

## Use Cases
- Local development environments
- Small, single-server production deployments
- Reproducible multi-service demos and testing setups
