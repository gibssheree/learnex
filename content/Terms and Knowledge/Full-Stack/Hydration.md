---
tags: [term, fullstack, frontend, rendering]
category: Frontend & State
---

# Hydration

**Definition:** The process of a server-rendered HTML page "waking up" and becoming interactive by attaching JavaScript event handlers.

## How It Works
- Server sends fully-rendered HTML for a fast first paint
- The JS bundle loads afterward and attaches to the existing DOM instead of rebuilding it

## Why It Matters
- Explains why an SSR page can look loaded but not respond to clicks for a moment

## Common Pitfalls
- "Hydration mismatch" errors when the server-rendered HTML doesn't exactly match what the client would have rendered

## Related Terms
- [[SPA vs SSR vs SSG]]

## Example
A Next.js page appears instantly thanks to server HTML, but buttons don't work until React finishes hydrating a moment later.
