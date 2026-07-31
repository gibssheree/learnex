---
tags: [term, fullstack, frontend, security]
category: Frontend & State
---

# Local Storage vs Session Storage

**Definition:** Two browser APIs for storing key-value data client-side, differing in how long the data persists.

## How It Works
- `localStorage` persists until explicitly cleared, even after closing the browser
- `sessionStorage` clears the moment the tab closes

## Why It Matters
- A common, but risky, place developers store auth tokens or user preferences

## Common Pitfalls
- Storing sensitive tokens like JWTs in `localStorage` — any XSS-injected script can read it, unlike an `HttpOnly` cookie

## Related Terms
- [[Cookies]]
- [[JWT (JSON Web Token)]]
- [[XSS (Cross-Site Scripting)]]

## Example
Saving a user's dark-mode preference in `localStorage` so it persists across visits.
