---
tags: [term, game-dev, architecture]
category: Graphics & Simulation
---

# Game State Management

**Definition:** How a game tracks and transitions between its different modes, main menu, playing, paused, game over, and manages the data associated with each.

## How It Works
- Often implemented as a state machine: the game is always in exactly one state, and explicit rules define which transitions are allowed (Playing → Paused, but not Main Menu → Game Over directly)
- Each state typically owns its own update and render logic, so a paused game simply stops calling the "playing" state's update function
- Save/load systems serialize a snapshot of the current game state (player position, inventory, progress) to persist it between sessions

## Why It Matters
- Without clear state management, games accumulate bugs where, for example, player input still registers while a pause menu is open

## Common Pitfalls
- Using scattered boolean flags (`isPaused`, `isGameOver`) instead of an explicit state machine, which becomes unmanageable once more than a couple of states exist
- Not clearly defining valid state transitions, allowing the game to end up in an inconsistent or unreachable-by-design state

## Related Terms
- [[Game Loop]]
- [[Entity Component System (ECS)]]

## Example
A state machine ensures that when the player presses "Start" from the Main Menu, it's a valid transition to the Playing state, but pressing "Start" while already in Game Over requires first returning to the Main Menu.
