---
tags: [platform, saas, payments]
category: Payments & Billing
---

# PayPal

**Definition:** One of the oldest and most widely recognized online payment platforms, trusted by consumers even when they don't trust a smaller merchant's own checkout, letting buyers pay from a stored PayPal balance, bank account, or card without re-entering details.

## Core Services & Concepts
- **OAuth 2.0** — [[OAuth 2.0]], used for PayPal Checkout integration and for the buyer's redirect-based login/consent flow
- **REST API** — [[REST API]], the modern Orders/Payments v2 API replaced the older, more fragmented NVP/SOAP "Classic API" that many legacy integrations still run on
- **Braintree** — PayPal's own acquired subsidiary, a separate, more developer-friendly API (closer in spirit to Stripe) for merchants wanting card processing plus optional PayPal/Venmo support in one integration
- **Buyer/Seller Protection** — PayPal's dispute-resolution programs, which shift chargeback risk in specific documented cases but also give PayPal broad discretion to freeze funds during a dispute

## Pros
- Extremely high consumer trust and recognition, often increases checkout conversion simply by being present as an option
- Works well for cross-border payments, handling currency conversion and buyer protection across many countries
- Doesn't require the buyer to enter card details on the merchant's site, reducing PCI compliance scope for the merchant

## Cons
- Higher fees than some competitors, standard rates commonly run around 3.49% + a fixed fee for online transactions, above Stripe/Square's default rates
- Account holds and freezes are a common complaint among sellers, PayPal can hold funds for weeks during a risk review with limited recourse
- Less developer-friendly REST API than Stripe; most serious PayPal integrations route through Braintree instead of PayPal's native API directly

## Best For
- Consumer-facing checkouts where buyer trust and brand recognition matter, or cross-border e-commerce needing built-in currency handling

## Real Examples
- Widely offered as a checkout option alongside cards on most e-commerce sites; also owns Venmo for US peer-to-peer payments

## Use Cases
- E-commerce checkout
- Peer-to-peer payments
- Cross-border transactions
