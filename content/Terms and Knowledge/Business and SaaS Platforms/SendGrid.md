---
tags: [platform, saas, marketing, email]
category: Marketing & Email
---

# SendGrid

**Definition:** A transactional and marketing email API platform (now part of Twilio), built for developers who need to send email programmatically at scale with predictable deliverability.

## Core Services & Concepts
- **REST API** — [[REST API]], plus SMTP relay support for apps that just want to point an existing mail client at SendGrid's servers instead of integrating the API directly
- **Event Webhook** — [[Webhook]], notifies your app of email opens, bounces, spam reports, and clicks, essential for tracking deliverability and pruning bad addresses over time
- **Dynamic Templates** — server-side templates with Handlebars-style variable substitution, so application code sends a template ID plus data rather than building raw HTML per email
- **Domain authentication (SPF/DKIM/DMARC)** — SendGrid requires verifying sending domains via these DNS records to maintain sender reputation and land in inboxes instead of spam folders
- **IP warm-up / dedicated IPs** — high-volume senders can get a dedicated IP, but it must be "warmed up" with gradually increasing volume or its reputation tanks and mail gets filtered

## Pros
- Built for developers, with SDKs and a clean API-first workflow that fits directly into application code
- Reliable deliverability infrastructure, backed by Twilio's broader messaging reputation systems
- Handles both transactional (password resets, receipts) and marketing email from the same platform

## Cons
- Less friendly UI for non-technical marketers compared to Mailchimp; the marketing-campaign side of the product feels secondary to the transactional API
- Pricing model can be confusing, tiered by monthly email volume with overage charges that differ from simple per-contact pricing
- Deliverability still depends heavily on the sender doing domain authentication and list hygiene correctly, SendGrid can't fully compensate for a poorly maintained list

## Best For
- Developers needing to send transactional emails programmatically, like signup confirmations or password resets

## Real Examples
- Used by countless SaaS products for password reset, receipt, and notification emails

## Use Cases
- Transactional email (receipts, password resets)
- Programmatic marketing email at scale
