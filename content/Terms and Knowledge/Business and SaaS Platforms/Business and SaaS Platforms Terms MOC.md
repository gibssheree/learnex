---
tags: [moc, platform, saas, business]
---

# Business and SaaS Platforms MOC

21 platforms across 7 categories. Same comparison template as [[Cloud Platforms Terms MOC|Cloud Platforms]] (Definition, Pros, Cons, Best For, Real Examples, Use Cases) plus a "Core Services & Concepts" section linking each platform's real features to the technical concepts already in this vault, mostly [[Full-Stack Terms MOC|Full-Stack]] (REST API, Webhook, OAuth 2.0, Idempotency, WebSocket), since these are the tools you're most likely to integrate with via API rather than just use as an end user.

## CRM & Sales
- [[Salesforce]]
- [[HubSpot]]
- [[Zoho CRM]]
- [[Pipedrive]]

## Project Management & Collaboration
- [[Jira]]
- [[Linear]]
- [[Asana]]
- [[Notion]]

## Payments & Billing
- [[Stripe]]
- [[PayPal]]
- [[Square]]

## Marketing & Email
- [[Mailchimp]]
- [[SendGrid]]
- [[Klaviyo]]

## Customer Support
- [[Zendesk]]
- [[Intercom]]

## Communication
- [[Slack]]
- [[Microsoft Teams]]

## Automation & Analytics
- [[Zapier]]
- [[Google Analytics]]
- [[Mixpanel]]

---

## How to use this
Use this the same way as Cloud Platforms: pick a tool for a real need, not just to learn a concept. Notice how many of these lean on the exact same handful of Full-Stack concepts (REST API, Webhook, OAuth 2.0) — once you understand those deeply, integrating with any of these platforms is mostly reading their specific API docs, not learning something new.

## Suggested order if starting from zero
1. **Stripe** — the cleanest API of any platform here, genuinely worth reading their docs even if you never process a payment, it's a masterclass in API design
2. **Slack** — incoming webhooks are the simplest possible introduction to the webhook pattern used everywhere else in this list
3. **HubSpot or Pipedrive** — lightweight CRMs, easier starting point than Salesforce
4. **Jira or Linear** — depending on whether your future team leans enterprise (Jira) or startup (Linear)
5. **Zapier** — once you know a few of these individually, Zapier shows you how they all connect together
6. Everything else, as the actual project you're building calls for it
