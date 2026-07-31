---
tags: [platform, saas, marketing, email]
category: Marketing & Email
---

# Klaviyo

**Definition:** An email and SMS marketing platform built specifically for e-commerce, tightly integrated with platforms like Shopify to sync order and product data directly into segmentation and automation logic.

## Core Services & Concepts
- **REST API** — [[REST API]], plus a dedicated Track/Identify API for pushing custom behavioral events (product viewed, added to cart) from a storefront in near real time
- **Webhooks** — [[Webhook]], for syncing Klaviyo events and profile changes into other systems
- **Event-based segmentation** — [[Event-Driven Architecture]], triggers campaigns based on customer behavior events like cart abandonment, browse abandonment, or purchase, using predictive fields like "predicted next order date" and "customer lifetime value" computed from order history
- **Flows** — pre-built and custom automation sequences (welcome series, abandoned cart, post-purchase, win-back) that fire off behavioral triggers rather than a fixed send schedule
- **Revenue attribution** — every campaign and flow is tied back to actual store revenue generated, not just opens/clicks, because of the deep e-commerce platform integration

## Pros
- Deep e-commerce data integration (purchase history, browsing behavior, product catalog) most general email tools don't have access to
- Strong automation for cart abandonment and post-purchase flows, often cited as a major direct revenue driver for DTC brands
- Combines email and SMS in one platform with shared segmentation logic

## Cons
- Expensive at scale, pricing is based on profile count and grows quickly for brands with large contact lists, well above typical Mailchimp pricing at the same list size
- Overkill for non-e-commerce use cases; its core value proposition depends on integrated order/product data
- Deliverability and list hygiene still require active management, aggressive SMS/email cadence can hurt sender reputation

## Best For
- E-commerce brands wanting behavior-driven email and SMS marketing directly tied to purchase and browsing data

## Real Examples
- Widely used by Shopify-based e-commerce brands as their primary retention marketing platform

## Use Cases
- Cart abandonment emails
- Post-purchase flows
- E-commerce customer segmentation
