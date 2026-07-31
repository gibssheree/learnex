---
tags: [term, fullstack, architecture, devops]
category: Architecture & Backend
---

# Serverless

**Definition:** A deployment model where you write functions and the cloud provider handles servers, scaling, and infrastructure entirely.

## How It Works
- Your code runs only when triggered, an HTTP request or a queue message
- You're billed per execution, not for idle server time

## Why It Matters
- Removes a lot of ops burden and scales automatically, popular for APIs, cron jobs, and event-driven tasks

## Common Pitfalls
- "Cold starts," the first request after idle is slow
- Long-running tasks and persistent connections, like WebSockets or DB connection pools, don't fit the model well

## Related Terms
- [[Connection Pooling]]
- [[CI-CD|CI/CD]]

## Example
AWS Lambda, Vercel Functions, or Cloudflare Workers running an API route only when it's called.
