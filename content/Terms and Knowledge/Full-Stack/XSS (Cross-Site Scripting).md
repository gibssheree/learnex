---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# XSS (Cross-Site Scripting)

**Definition:** An attack where malicious JavaScript gets injected into a page and runs in another user's browser.

## How It Works
- Attacker submits input like `<script>steal(document.cookie)</script>`
- If the site doesn't sanitize it, the script executes for anyone who views that page

## Why It Matters
- One of the most common web vulnerabilities, directly threatens auth tokens and user data

## Common Pitfalls
- Rendering raw user input as HTML without escaping it
- Storing sensitive tokens in `localStorage`, readable by any injected script

## Related Terms
- [[CSRF (Cross-Site Request Forgery)]]
- [[Cookies]]

## Example
A forum comment box that doesn't escape HTML, letting an attacker post a script that steals other users' sessions.
