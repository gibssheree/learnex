---
tags: [term, fullstack, backend, devops]
category: Architecture & Backend
---

# Environment Variables

**Definition:** Configuration values, like API keys and database URLs, stored outside your code and injected at runtime based on where the app is running.

## How It Works
- Set in a `.env` file locally, or your hosting platform's dashboard in production
- Read by the app via `process.env` or the equivalent in your language

## Why It Matters
- Keeps secrets out of source control and lets the same code run differently in dev, staging, and production

## Common Pitfalls
- Committing a `.env` file with real secrets to git
- No sane fallback/default, causing crashes when a variable is missing

## Related Terms
- [[CI-CD|CI/CD]]
- [[Docker|Docker / Containerization]]

## Example
`DATABASE_URL` pointing to a local Postgres in dev, and a production Postgres instance when deployed.
