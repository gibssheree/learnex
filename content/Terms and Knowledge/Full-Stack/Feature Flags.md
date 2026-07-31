---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Feature Flags

**Definition:** A toggle that lets you turn a feature on or off, or for specific users, without deploying new code.

## How It Works
- Code checks a flag's value, from a config service or database, at runtime to decide whether to show or run a feature

## Why It Matters
- Lets you ship code to production dark, test with a small percentage of users, and instantly roll back a bad feature without a redeploy

## Common Pitfalls
- Letting old flags pile up forever, turning the codebase into a maze of `if (flag) {...} else {...}` branches nobody dares delete

## Related Terms
- [[CI-CD|CI/CD]]

## Example
Rolling out a new checkout flow to 5% of users first, then ramping up to 100% if no issues appear.
