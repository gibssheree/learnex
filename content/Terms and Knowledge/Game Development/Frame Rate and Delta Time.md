---
tags: [term, game-dev, performance]
category: Core Concepts
---

# Frame Rate and Delta Time

**Definition:** Frame rate is how many frames per second a game renders; delta time is the actual elapsed time between two frames, used to keep game speed consistent regardless of frame rate.

## How It Works
- Frame rate varies by hardware, a powerful PC might hit 144 FPS while a phone hits 30
- Delta time measures the real elapsed time since the last frame, and every movement/physics calculation multiplies by it (`position += speed * deltaTime`)
- This makes an object move the same real-world distance per second whether the game runs at 30 FPS or 144 FPS

## Why It Matters
- Without delta time, a game would run at different speeds on different hardware, exactly the bug that made some infamously fast on high-end PCs and unplayably slow on weaker ones

## Common Pitfalls
- Hardcoding movement speed without multiplying by delta time, tying gameplay speed directly to whatever frame rate the current hardware happens to hit
- Not clamping delta time, a huge lag spike (like alt-tabbing out) can produce a massive delta time value that causes objects to teleport on the next frame

## Related Terms
- [[Game Loop]]

## Example
A character configured to move at 5 units per second moves exactly 5 units in one real second, whether the game is rendering at 30 FPS or 240 FPS.
