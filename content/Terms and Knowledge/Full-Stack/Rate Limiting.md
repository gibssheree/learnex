---
tags: [term, fullstack, security, api]
category: DevOps & Delivery
---

# Rate Limiting

**Definition:** Restricting how many requests a client can make to your API in a given time window.

## How It Works
- Track requests per user, IP, or API key
- Once they exceed the limit, reject further requests, usually with a `429 Too Many Requests` status

## Why It Matters
- Protects your backend and database from abuse, bugs like infinite retry loops, and brute-force attacks

## Common Pitfalls
- Rate limiting by IP alone, which breaks down for users behind shared corporate NATs or unfairly blocks legitimate bursts of traffic

## Related Terms
- [[HTTP Status Codes]]
- [[CORS (Cross-Origin Resource Sharing)]]

## Example
Twitter's API returning `429` if you call it too many times within a 15-minute window.
