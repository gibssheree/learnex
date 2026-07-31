---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# JWT (JSON Web Token)

**Definition:** A compact, signed token used to prove identity between client and server without a database lookup on every request.

## How It Works
- 3 parts: header, payload, signature (`header.payload.signature`), base64-encoded
- Signed with a secret (or private key), server verifies the signature instead of checking a session store
- Payload is readable by anyone, just not editable without breaking the signature

## Why It Matters
- Enables stateless auth, easy to scale across many servers
- Standard for APIs and mobile clients that can't rely on cookies as easily

## Common Pitfalls
- Storing it in `localStorage` exposes it to theft via [[XSS (Cross-Site Scripting)]]
- Can't revoke a single JWT early without extra infrastructure (blocklists)
- Putting sensitive data in the payload — it's signed, not encrypted, so it's readable

## Related Terms
- [[Session]]
- [[OAuth 2.0]]
- [[Cookies]]

## Example
A React app logs in, the backend returns a JWT, and the frontend sends it in the `Authorization` header on every API call.
