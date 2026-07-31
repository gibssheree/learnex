---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Dependency Injection

**Definition:** A pattern where an object's dependencies are provided to it from outside, instead of it creating them itself.

## How It Works
- Instead of a class instantiating its own database connection, it receives one passed in via constructor, function parameter, or a framework container

## Why It Matters
- Makes code far easier to test, since you can swap in a fake dependency, and decouples components from concrete implementations

## Common Pitfalls
- Over-engineering small projects with heavy DI frameworks/containers when a simple function parameter would do

## Related Terms
- [[MVC]]

## Example
Passing a mock database into a service during unit tests instead of hitting a real database.
