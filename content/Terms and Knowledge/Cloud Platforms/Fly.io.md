---
tags: [platform, cloud, developer-platform]
category: Developer Platforms
---

# Fly.io

**Definition:** A platform that runs apps as lightweight VMs close to users worldwide, positioned as a modern alternative to both traditional cloud VMs and edge-function platforms.

## Core Services & Concepts
- **Fly Machines** — [[Virtual Machines (VMs)]], fast-booting micro-VMs (via Firecracker, the same technology AWS Lambda uses) deployed across dozens of regions
- **Anycast networking** — [[Load Balancer]], automatically routes users to their nearest running instance
- **Fly Postgres** — [[Database Replication]], regionally distributed Postgres clusters

## Pros
- Full VMs, not restricted like edge functions, but still deployed globally close to users
- Good fit for apps needing persistent connections like WebSockets at the edge

## Cons
- Smaller company and community than the major players
- Less mature tooling for very large-scale enterprise needs

## Best For
- Apps needing real global presence with full VM flexibility, like WebSocket servers or games

## Real Examples
- Used by several dev-tool startups for globally distributed backend services

## Use Cases
- Globally distributed APIs
- WebSocket and real-time servers
- Latency-sensitive applications
