---
tags: [platform, saas, payments]
category: Payments & Billing
---

# Stripe

**Definition:** The leading developer-first payments platform, known for its clean API and being the default choice for adding payments to a software product, with standard pricing around 2.9% + $0.30 per successful card charge in the US.

## Core Services & Concepts
- **Idempotency keys** — [[Idempotency]], Stripe is the textbook example used to explain this concept: pass the same `Idempotency-Key` header on a retried request and Stripe guarantees it won't double-charge the customer
- **Webhooks** — [[Webhook]], Stripe is also the textbook example used to explain webhooks; events like `payment_intent.succeeded` or `invoice.payment_failed` are signed with a secret so your endpoint can verify authenticity before trusting them
- **REST API** — [[REST API]], versioned by date (e.g. `2024-06-20`) rather than a simple v1/v2 scheme, so integrations keep working on their pinned version even as Stripe ships changes
- **PaymentIntents / SetupIntents** — a stateful object model that walks a payment through multiple steps (requires confirmation, 3D Secure authentication, capture) instead of a single fire-and-forget charge call
- **Stripe Connect** — the platform/marketplace product for routing payments to multiple sub-accounts (e.g. splitting a marketplace sale between the platform and a seller)

## Pros
- Best-in-class developer experience and documentation, widely considered the reference implementation for a payments API
- Handles complex billing (subscriptions, proration, invoicing, tax via Stripe Tax) out of the box instead of building it in-house
- Extremely reliable infrastructure with strong uptime and clear status reporting
- Built-in fraud tooling (Radar) and strong-customer-authentication (3D Secure) support for EU regulatory requirements

## Cons
- Transaction fees (roughly 2.9% + $0.30 per charge domestically, more for international cards and currency conversion) add up meaningfully at high volume compared to negotiated enterprise processor rates
- Payouts can be delayed or accounts frozen for risk review with little warning, a common complaint from marketplaces and high-risk-category businesses
- Connect's fee structure and account types (Standard, Express, Custom) add real complexity for platforms splitting payments across many sellers

## Best For
- Any software product needing to accept online payments, especially developer-led companies that want to move fast without building billing infrastructure

## Real Examples
- Used by Shopify, Amazon (for some flows), and a huge share of SaaS/e-commerce startups for checkout and subscription billing

## Use Cases
- Subscription billing
- One-time payments
- Marketplace payouts via Stripe Connect
