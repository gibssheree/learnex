---
tags: [term, fullstack, frontend]
category: Frontend & State
---

# State Management

**Definition:** How an app tracks and updates data that changes over time, user input, fetched data, UI state, and keeps the UI in sync with it.

## How It Works
- Ranges from simple component-local state to global stores (Redux, Zustand, Context) shared across the whole app

## Why It Matters
- Badly managed state is the #1 source of confusing bugs in frontend apps, "why did this update when I didn't touch it"

## Common Pitfalls
- Putting everything in global state when local component state would do, causing unnecessary re-renders and complexity

## Related Terms
- [[Virtual DOM]]
- [[SPA vs SSR vs SSG]]

## Example
A shopping cart's item count needs to show in both the header and the cart page, so it lives in shared/global state.
