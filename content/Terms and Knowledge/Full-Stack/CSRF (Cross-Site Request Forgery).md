---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# CSRF (Cross-Site Request Forgery)

**Definition:** An attack that tricks a logged-in user's browser into sending an unwanted request to a site they're authenticated on.

## How It Works
- Attacker hosts a page that auto-submits a form or request to your bank's site
- Your browser auto-attaches the session cookie, so the request looks legitimate to the server

## Why It Matters
- Anything using cookie-based auth needs to defend against this

## Common Pitfalls
- Assuming cookies alone are safe
- Defenses: CSRF tokens, `SameSite=Strict` or `Lax` cookies

## Related Terms
- [[Cookies]]
- [[XSS (Cross-Site Scripting)]]

## Example
A malicious email link that silently submits a "transfer money" form using your existing bank session.
