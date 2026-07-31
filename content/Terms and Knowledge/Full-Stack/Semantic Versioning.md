---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Semantic Versioning

**Definition:** A version numbering convention, `MAJOR.MINOR.PATCH` (e.g. `2.4.1`), where each part signals a specific kind of change.

## How It Works
- `MAJOR` = breaking change
- `MINOR` = new backward-compatible feature
- `PATCH` = backward-compatible bug fix

## Why It Matters
- Lets you and your dependencies, like npm packages, upgrade safely, knowing what kind of change to expect

## Common Pitfalls
- Bumping only a patch version for a change that actually breaks existing usage, silently breaking everyone who depends on you

## Related Terms
- [[CI-CD|CI/CD]]

## Example
Going from `1.2.3` to `2.0.0` signals "this release has breaking changes, read the changelog before upgrading."
