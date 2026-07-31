---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# Cookies

**Definition:** Small pieces of data a server tells the browser to store and automatically send back on every future request to that domain.

## How It Works
- Server sends a `Set-Cookie` header, browser stores it and attaches it to matching requests
- Flags control behavior: `HttpOnly` (JS can't read it), `Secure` (HTTPS only), `SameSite` (cross-site sending rules)

## Why It Matters
- The backbone of session-based auth and site tracking
- Understanding cookie flags is core web security knowledge

## Common Pitfalls
- Forgetting `HttpOnly` lets JavaScript, including injected [[XSS (Cross-Site Scripting)]] scripts, read auth cookies
- Missing `SameSite` opens the door to [[CSRF (Cross-Site Request Forgery)]]

## Related Terms
- [[Session]]
- [[CSRF (Cross-Site Request Forgery)]]
- [[Local Storage vs Session Storage]]

## Example
A "remember me" login that keeps you signed in even after closing the browser.
