---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Lazy Loading

**Definition:** Delaying the loading of code, images, or data until they're actually needed.

## How It Works
- Split your JS bundle into chunks, only load a chunk when that route or component is used
- Only load images as they scroll into view

## Why It Matters
- Cuts initial page load time significantly, especially on large apps

## Common Pitfalls
- Lazy-loading content that's immediately visible (above the fold), which actually delays what the user sees first

## Related Terms
- [[CDN]]
- [[SPA vs SSR vs SSG]]

## Example
A settings page's code only downloads when the user clicks "Settings," not on initial app load.
