---
tags: [platform, cloud, edge, cdn]
category: Edge & CDN
---

# Cloudflare

**Definition:** Originally a CDN and DDoS protection company, now a broader edge computing platform running one of the largest networks on the internet.

## Core Services & Concepts
- **CDN** — [[Content Delivery Network (CDN) and Edge Computing]], Cloudflare's original and still core product
- **Workers** — [[Serverless Computing and Cold Starts]], serverless functions that run at edge locations instead of one region, startup time close to zero
- **R2** — [[Cloud Storage Systems]], object storage with no egress fees, a direct jab at S3's pricing
- **Access / Zero Trust** — [[Zero Trust Architecture]]
- **WAF** — [[OWASP Top 10 Security Risks]], web application firewall
- **1.1.1.1** — [[DNS]], one of the most widely used public DNS resolvers

## Pros
- Massive global edge network means very low latency almost everywhere
- Generous free tier
- No egress fees on R2 storage

## Cons
- Not a full IaaS replacement
- Fewer general-purpose compute options than AWS, GCP, or Azure
- Workers have execution limits unsuited for heavy compute

## Best For
- Frontend-heavy apps needing global low latency
- DDoS and bot protection
- Teams wanting to avoid AWS-style egress fees

## Real Examples
- Discord, Shopify, and a large share of the web use Cloudflare for CDN and security

## Use Cases
- Edge-rendered web apps
- DDoS mitigation
- Global API caching
