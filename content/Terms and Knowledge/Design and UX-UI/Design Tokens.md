---
tags: [term, design, ux, frontend]
category: Design Fundamentals
---

# Design Tokens

**Definition:** Named, reusable values (a specific blue, a specific spacing unit) that represent a design decision once, then get reused consistently across design tools and code instead of being hardcoded repeatedly.

## How It Works
- A value like `#0055FF` gets a name like `color-primary-500` instead of being pasted directly wherever that blue is needed
- The same token name is used in both the design tool (Figma) and the actual codebase (CSS variables, a theme file), keeping them in sync
- Changing a token's value in one place updates every place that references it, instead of requiring a manual find-and-replace across the whole codebase

## Why It Matters
- Makes systemic design changes, like a full rebrand or a dark mode, a matter of updating token values instead of hunting down every hardcoded color in the codebase

## Common Pitfalls
- Defining tokens but still letting hardcoded values sneak into the codebase alongside them, undermining the whole point
- Creating too many overly specific tokens instead of a clean, small set of reusable values, recreating the same maintenance problem tokens were meant to solve

## Related Terms
- [[Design System]]
- [[Figma]]

## Example
A `spacing-md` token set to `16px` is referenced by every component's padding, so redefining it once updates spacing consistently across the entire product.
