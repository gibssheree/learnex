---
tags: [platform, saas, crm]
category: CRM & Sales
---

# Salesforce

**Definition:** The dominant enterprise CRM platform, built on Salesforce's own multi-tenant Lightning platform, tracking leads, opportunities, accounts, cases, and custom objects in one system that can be extended with proprietary code.

## Core Services & Concepts
- **Apex** — [[Apex]], a proprietary Java-like language for triggers, batch jobs, and business logic; runs sandboxed under "governor limits" (max SOQL queries, DML statements, and CPU time per transaction) that force careful, bulk-safe coding patterns
- **SOQL/SOSL** — Salesforce's own query languages for the underlying multi-tenant object model, not raw SQL against a normal relational schema
- **REST/SOAP/Bulk APIs** — [[REST API]], the Bulk API handles asynchronous loads/exports of millions of records without hitting per-call API limits
- **Connected Apps (OAuth)** — [[OAuth 2.0]], third-party app authorization; supports SAML-based [[SSO (Single Sign-On)]] for enterprise identity providers
- **Flow (automation builder)** — [[Event-Driven Architecture]], no-code trigger-based automation that replaced the older Workflow Rules and Process Builder tools
- **AppExchange** — Salesforce's marketplace of thousands of third-party apps and prebuilt integrations

## Pros
- Extremely customizable: custom objects, fields, page layouts, and Apex triggers can model almost any business process
- Dominant CRM market share means a deep talent pool of certified admins/developers and a huge integration ecosystem
- Multi-tenant architecture handles enterprise scale, orgs with hundreds of thousands of users and millions of records
- Granular permission model (profiles, permission sets, role hierarchy, sharing rules) supports complex org structures

## Cons
- Notoriously expensive — Enterprise edition licensing runs well over $150/user/month, with Sales Cloud, Service Cloud, CPQ, and most useful add-ons priced and sold separately
- Steep learning curve; serious implementations effectively require certified admins (Salesforce Administrator) and developers (Platform Developer I/II)
- Customization sprawl: years of stacked Apex triggers, workflow rules, and Flows on the same objects make orgs fragile and expensive to refactor or migrate off of
- Governor limits can force awkward workarounds (bulkifying code, deferring logic to async jobs) in complex automations

## Best For
- Large sales teams and enterprises needing deep customization of their sales process, or multi-department implementations spanning sales, service, and marketing

## Real Examples
- Used by most Fortune 500 sales organizations; companies like Adidas, Toyota, and Spotify run sales and service operations on Salesforce Sales Cloud and Service Cloud

## Use Cases
- Enterprise sales pipeline management
- Customer support case tracking (Service Cloud)
- Marketing/sales alignment at scale via Marketing Cloud integration
- Custom internal applications built directly on the Force.com platform
