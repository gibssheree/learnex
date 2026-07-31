---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Debounce vs Throttle

**Definition:** Two techniques to limit how often a function runs in response to frequent events like typing, scrolling, or resizing.

## How It Works
- Debounce waits until the events stop for X ms, then runs once
- Throttle runs at most once every X ms while events keep firing

## Why It Matters
- Prevents wasted work, like firing an API search request on every single keystroke

## Common Pitfalls
- Using throttle when you wanted debounce, or vice versa — picking the wrong one gives a laggy or overly chatty UI

## Related Terms
- [[State Management]]

## Example
Debounce a search input so the API call only fires after the user stops typing for 300ms.
