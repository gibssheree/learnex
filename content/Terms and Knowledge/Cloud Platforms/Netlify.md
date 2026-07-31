---
tags: [platform, cloud, developer-platform]
category: Developer Platforms
---

# Netlify

**Definition:** A frontend deployment platform similar in spirit to Vercel, one of the pioneers of the "JAMstack" hosting model.

## Core Services & Concepts
- **Edge Functions** — [[Serverless Computing and Cold Starts]]
- **Deploy Previews** — [[CI-CD|CI/CD]]
- **Netlify Forms/Identity** — [[Identity and Access Management (IAM)]], built-in form handling and auth without a separate backend
- **CDN** — [[Content Delivery Network (CDN) and Edge Computing]]

## Pros
- Framework-agnostic, not tied to one meta-framework the way Vercel leans toward Next.js
- Built-in form handling is genuinely useful for static sites
- Generous free tier

## Cons
- Edge function ecosystem is less mature than Vercel's Next.js integration
- Can get pricey with heavy build-minute usage

## Best For
- Static sites and JAMstack apps across any frontend framework, not just React

## Real Examples
- Used by Peloton's marketing pages and many documentation sites

## Use Cases
- Static marketing sites
- Documentation sites
- JAMstack apps with serverless form/auth needs
