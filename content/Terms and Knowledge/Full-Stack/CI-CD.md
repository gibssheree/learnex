---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# CI/CD

**Definition:** Continuous Integration (auto-testing every code change) and Continuous Deployment/Delivery (auto-shipping code that passes).

## How It Works
- A pipeline runs on every push: install dependencies, run tests/lint, build, and, for CD, deploy automatically if everything passes

## Why It Matters
- Catches bugs before they reach production and removes manual, error-prone deploy steps

## Common Pitfalls
- A slow or flaky pipeline that developers start ignoring or working around, defeating its purpose

## Related Terms
- [[Environment Variables]]
- [[Docker|Docker / Containerization]]

## Example
GitHub Actions running your test suite on every pull request, then auto-deploying to production when merged to main.
