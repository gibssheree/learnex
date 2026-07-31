---
tags: [term, design, frontend, accessibility]
category: Implementation
---

# Web Accessibility (a11y)

**Definition:** Designing and building products usable by people with disabilities, including visual, auditory, motor, and cognitive impairments, often guided by the WCAG (Web Content Accessibility Guidelines) standard.

## How It Works
- Semantic HTML gives assistive technology (like screen readers) the structure it needs to interpret a page correctly
- Sufficient color contrast, resizable text, and keyboard-only navigation cover a large share of common accessibility needs
- ARIA attributes fill gaps when semantic HTML alone can't describe complex interactive components

## Why It Matters
- A meaningful share of any user base has some disability, and in many countries inaccessible products carry real legal risk (lawsuits under laws like the ADA in the US)

## Common Pitfalls
- Relying only on color to convey meaning (like red/green for error/success), which fails for colorblind users entirely
- Bolting on accessibility at the end of a project instead of building it in from the start, semantic structure is far harder to retrofit than to build correctly the first time

## Related Terms
- [[Usability Heuristics]]
- [[Responsive Design]]
- [[Information Architecture]]

## Example
A screen reader announces a button's purpose correctly because it's a real `<button>` element with clear text, instead of a `<div>` with a click handler and no semantic meaning.
