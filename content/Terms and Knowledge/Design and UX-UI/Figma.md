---
tags: [term, design, tool]
category: Implementation
---

# Figma

**Definition:** The dominant collaborative interface design tool, running in the browser and letting multiple designers (and developers) work in the same file simultaneously.

## How It Works
- Vector-based design canvas, similar in spirit to Sketch or Adobe XD, but real-time collaborative by default
- Components and variants let a [[Design System]] be built directly inside the design file, reused across every screen
- Dev Mode exposes exact spacing, colors, and CSS-like properties so engineers can inspect a design without asking the designer

## Why It Matters
- Became the industry standard largely because of real-time multiplayer editing, the same reason Google Docs displaced offline word processors for collaborative work

## Common Pitfalls
- Letting design files grow disorganized with no consistent component or naming structure, making it hard for anyone but the original author to navigate
- Designing screens that ignore real content constraints (very long names, empty states, error states), producing designs that only work for the one example used

## Related Terms
- [[Design System]]
- [[Wireframing and Prototyping]]
- [[Design Tokens]]

## Example
A design team builds a component library in Figma, then developers use Dev Mode to pull exact spacing and color values while building the same components in code.
