---
tags: [platform, saas, payments]
category: Payments & Billing
---

# Square

**Definition:** A payments platform that started with in-person card readers for small businesses and expanded into a full point-of-sale, inventory, payroll, and online payments ecosystem under parent company Block.

## Core Services & Concepts
- **REST API** — [[REST API]], covers Payments, Orders, Catalog (inventory/menu items), and Customers as a unified object model shared between the in-person POS and online store
- **Webhooks** — [[Webhook]], notify external systems of payment, refund, and inventory events in near real time
- **Unified commerce ledger** — in-person POS sales, online store orders, and invoicing all write into the same underlying transaction and inventory records, unlike stitching a separate POS and e-commerce platform together
- **Square hardware** — proprietary card readers and terminals (Square Terminal, Square Register) that only work with Square's own processing, a form of vendor lock-in in exchange for tight hardware/software integration

## Pros
- Excellent for businesses needing both in-person and online payments in one system with shared inventory and reporting
- Simple flat-rate pricing (commonly around 2.6% + $0.10 for in-person swipes/taps) that's easy to reason about without a sales rep
- Strong point-of-sale hardware and a broader small-business suite (payroll, invoicing, appointments) sold as add-ons

## Cons
- Less developer-focused than Stripe for pure online/API-first products; the API surface is more oriented around Square's own POS/checkout products
- Fees can be less competitive at scale compared to negotiated interchange-plus rates larger merchants can get elsewhere
- Hardware lock-in: Square terminals don't work with other processors, so switching payment providers later means replacing hardware too

## Best For
- Small businesses with a physical, in-person sales component like retail or restaurants that also want a matching online store

## Real Examples
- Widely used by small retail shops, food trucks, and restaurants for both counter sales and online ordering

## Use Cases
- In-person point-of-sale payments
- Small business invoicing
- Combined online/offline retail with shared inventory
