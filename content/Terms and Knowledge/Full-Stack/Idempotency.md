---
tags: [term, fullstack, api]
category: API & Networking
---

# Idempotency

**Definition:** A property where making the same request multiple times has the same effect as making it once.

## How It Works
- `GET`, `PUT`, `DELETE` are supposed to be idempotent by convention
- `POST` usually isn't — calling it twice can create two records

## Why It Matters
- Critical for retry logic: if a request times out, you need to know whether it's safe to resend it

## Common Pitfalls
- Assuming a payment or order-creation `POST` is safe to retry — without an idempotency key it can double-charge a customer

## Related Terms
- [[HTTP Methods]]
- [[Webhook]]

## Example
Stripe requires an "idempotency key" on payment requests so a retried request doesn't charge the customer twice.
