---
tags: [term, fullstack, security, infrastructure]
category: DevOps & Delivery
---

# SSL/TLS (HTTPS)

**Definition:** The encryption protocol that secures data traveling between browser and server, the "S" in HTTPS.

## How It Works
- A certificate proves the server's identity
- A handshake establishes an encrypted channel before any data is sent

## Why It Matters
- Protects passwords, tokens, and personal data from being read or tampered with in transit; also an SEO and trust requirement now

## Common Pitfalls
- Letting a certificate expire, which breaks the site with scary browser warnings until renewed

## Related Terms
- [[DNS]]
- [[Reverse Proxy]]

## Example
Let's Encrypt providing free, auto-renewing SSL certificates for a website.
