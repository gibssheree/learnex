---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Virtual DOM

**Definition:** An in-memory representation of the UI that frontend frameworks use to figure out the minimal real DOM changes needed.

## How It Works
- On state change, the framework builds a new virtual tree, diffs it against the previous one
- Only the real DOM nodes that actually changed get updated

## Why It Matters
- Real DOM updates are slow; this diffing approach is why React-style frameworks feel fast

## Common Pitfalls
- Assuming the Virtual DOM makes rendering "free" — unnecessary re-renders still cost CPU even if the final DOM diff is small

## Related Terms
- [[State Management]]

## Example
Typing in a search box only updates the results list in the real DOM, not the entire page.
