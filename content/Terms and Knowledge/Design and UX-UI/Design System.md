---
tags: [term, design, ux]
category: Design Fundamentals
---

# Design System

**Definition:** A shared library of reusable components, styles, and rules that keeps a product's design consistent across every screen and every team building it.

## How It Works
- Defines core building blocks: colors, typography, spacing, buttons, form fields, as reusable components rather than one-off designs
- Usually paired with [[Design Tokens]] so the same values are used consistently in both design tools and actual code
- Lives as both a design file (Figma library) and a coded component library developers actually import

## Why It Matters
- Prevents the visual and functional drift that happens naturally when many designers and engineers build features independently over time

## Common Pitfalls
- Building an exhaustive design system before the product has enough real screens to know what components are actually needed, over-investing too early
- Letting the design system and the coded component library drift out of sync, so Figma no longer matches what's actually shipped

## Related Terms
- [[Design Tokens]]
- [[Figma]]
- [[Responsive Design]]

## Example
Google's Material Design and Shopify's Polaris are both public design systems defining reusable components and rules other teams build on.
