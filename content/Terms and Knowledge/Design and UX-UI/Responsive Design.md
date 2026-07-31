---
tags: [term, design, frontend]
category: Implementation
---

# Responsive Design

**Definition:** Designing and building interfaces that automatically adapt their layout to different screen sizes, from phones to large desktop monitors, instead of building separate versions for each.

## How It Works
- Uses flexible layouts (CSS Grid, Flexbox) and relative units instead of fixed pixel dimensions
- Media queries or container queries apply different layout rules at different screen widths ("breakpoints")
- A "mobile-first" approach designs the smallest screen first, then progressively adds layout complexity for larger screens

## Why It Matters
- Mobile traffic is the majority of web usage for most products, a design that only works on desktop actively breaks the experience for most visitors

## Common Pitfalls
- Designing only for one or two specific screen sizes tested in Figma, then discovering it breaks at less common but real-world sizes
- Treating "responsive" as purely a CSS/breakpoint problem, ignoring that touch targets, font sizes, and interaction patterns also need to change on mobile

## Related Terms
- [[Design System]]
- [[Figma]]

## Example
A three-column desktop layout automatically collapses into a single stacked column on a phone screen, without needing a separate mobile-only design.
