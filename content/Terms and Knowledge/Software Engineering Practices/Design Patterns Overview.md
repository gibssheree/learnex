---
tags: [term, swe, architecture]
category: Design Principles & Patterns
subcategory: Software Architecture
---

# Design Patterns Overview

**Definition:** Reusable solutions to commonly occurring software design problems organized into Creational, Structural, and Behavioral patterns.

## How It Works
- Creational Patterns: Factory Method, Builder, Singleton (object instantiation abstractions)
- Structural Patterns: Adapter, Decorator, Proxy, Facade (assembling classes and objects into larger structures)
- Behavioral Patterns: Observer, Strategy, State, Command (communication and algorithm assignment between objects)

## Why It Matters
- Provides standardized shared terminology and battle-tested architectural blueprints for software developers

## Common Pitfalls
- Forcing design patterns into problems where simple functions would be clearer (Patternitis)

## Related Terms
- [[SOLID Principles]]
- [[Code Refactoring and Technical Debt]]

## Example
Using Strategy Pattern to switch sorting algorithms at runtime without changing client code.
