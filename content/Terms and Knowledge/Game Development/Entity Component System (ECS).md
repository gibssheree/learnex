---
tags: [term, game-dev, architecture]
category: Core Concepts
---

# Entity Component System (ECS)

**Definition:** A game architecture pattern that composes game objects out of small, reusable data components instead of deep inheritance hierarchies, favoring composition over inheritance.

## How It Works
- **Entities** are just IDs, with no behavior or data of their own
- **Components** are plain data attached to an entity (Position, Health, Sprite)
- **Systems** contain the actual logic, operating on every entity that has a matching set of components (a "MovementSystem" processes every entity with both a Position and Velocity component)

## Why It Matters
- Avoids the classic inheritance problem where "does a flying enemy that can also swim inherit from FlyingEnemy or SwimmingEnemy" has no clean answer, composition sidesteps it entirely
- Its data-oriented layout (grouping same-type data together in memory) also tends to perform better than deep object hierarchies at scale

## Common Pitfalls
- Adopting ECS for a small, simple game where a straightforward object-oriented approach would be faster to build and easier to reason about
- Designing components that are too coarse (bundling unrelated data together), losing the flexibility ECS is meant to provide

## Related Terms
- [[Game Loop]]
- [[Game State Management]]

## Example
A "Player" entity might have Position, Sprite, Health, and PlayerInput components, while an "Enemy" entity shares Position, Sprite, and Health but has an AI component instead.
