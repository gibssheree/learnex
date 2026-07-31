---
tags: [term, game-dev, physics]
category: Graphics & Simulation
---

# Physics Engine and Collision Detection

**Definition:** A system that simulates realistic movement (gravity, momentum, forces) and detects when game objects overlap or collide, so games don't need to hand-code physical behavior from scratch.

## How It Works
- Applies forces (gravity, velocity, friction) to objects each frame, tied to [[Frame Rate and Delta Time]] so simulation speed stays consistent
- Detects collisions using simplified shapes ("colliders") like boxes and spheres wrapped around visual models, since checking exact visual geometry would be too slow
- Resolves collisions by adjusting position and velocity so objects don't visually overlap or pass through each other

## Why It Matters
- Hand-coding realistic physics for every interaction would be enormously time-consuming, physics engines make believable movement and interaction practical to build

## Common Pitfalls
- Using overly complex colliders when a simple box or sphere would be visually indistinguishable and far cheaper to compute
- Running physics calculations at a variable frame rate without fixing the physics update rate, causing inconsistent or unstable simulation behavior

## Related Terms
- [[Game Loop]]
- [[Frame Rate and Delta Time]]

## Example
Box2D and Unity's built-in physics engine both simulate gravity and collisions so a jumping character falls and lands on platforms convincingly without custom-coded math.
