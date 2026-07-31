---
tags: [term, game-dev]
category: Core Concepts
---

# Game Loop

**Definition:** The continuously repeating cycle at the heart of every game, processing input, updating game state, and rendering a new frame, over and over, many times per second.

## How It Works
- Each iteration: read player input, update positions/physics/AI based on elapsed time, then render the result to the screen
- Runs as fast as possible, or capped to a target frame rate, tied closely to [[Frame Rate and Delta Time]]
- Separating "update" logic from "render" logic lets some engines update game state at a fixed rate while rendering at a variable one

## Why It Matters
- Everything in a game, movement, collisions, animation, ultimately happens because the game loop calls the right code every single frame

## Common Pitfalls
- Tying game logic directly to frame rate instead of elapsed time, causing the game to run faster or slower depending on the hardware it's running on
- Doing expensive work inside the loop that doesn't need to happen every frame, silently tanking performance

## Related Terms
- [[Frame Rate and Delta Time]]
- [[Game State Management]]

## Example
A simple loop: `while (running) { processInput(); update(deltaTime); render(); }`, repeated dozens of times per second.
