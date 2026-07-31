---
tags: [term, fullstack, api]
category: API & Networking
---

# Webhook

**Definition:** A way for one service to notify another by sending an HTTP POST request the moment an event happens.

## How It Works
- You register a URL with a third-party service
- When something happens on their end (payment received, PR merged), they POST data to your URL

## Why It Matters
- The standard way apps talk to each other asynchronously without constant polling

## Common Pitfalls
- Not verifying the webhook's signature, so anyone could fake a request to your endpoint
- Not handling duplicate or retried webhook deliveries

## Related Terms
- [[REST API]]
- [[Idempotency]]

## Example
Stripe sends a webhook to your server the moment a customer's payment succeeds.
