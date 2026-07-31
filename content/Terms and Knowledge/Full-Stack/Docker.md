---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Docker (Containerization)

**Definition:** Packaging an app with everything it needs, dependencies, runtime, OS libraries, into a portable, isolated unit.

## How It Works
- A `Dockerfile` defines the environment
- Building it produces an image, running the image produces a container that behaves the same anywhere

## Why It Matters
- Solves "works on my machine" — the same container runs identically in dev, staging, and production

## Common Pitfalls
- Bloated images from not cleaning up build layers
- Accidentally baking secrets into an image layer, still recoverable from image history even after "removing" them in a later layer

## Related Terms
- [[CI-CD|CI/CD]]
- [[Microservices vs Monolith]]

## Example
A Node app plus its exact Node version and dependencies, packaged so it runs the same on your laptop and on a cloud server.
