---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# OAuth 2.0

**Definition:** A protocol that lets a user grant one app limited access to their data on another app, without sharing their password.

## How It Works
- User is redirected to the provider (e.g. Google)
- User approves the requested access
- Provider gives your app a token, not the user's password

## Why It Matters
- The standard way to build "Login with Google/GitHub" and third-party API integrations

## Common Pitfalls
- Confusing OAuth (authorization: "can this app access X") with authentication (who the user actually is) — OpenID Connect layers identity on top of OAuth

## Related Terms
- [[SSO (Single Sign-On)]]
- [[JWT (JSON Web Token)]]

## Example
The "Continue with GitHub" button on a SaaS signup page.
