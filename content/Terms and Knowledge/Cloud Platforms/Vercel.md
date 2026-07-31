---
tags: [platform, cloud, developer-platform]
category: Developer Platforms
---

# Vercel

**Definition:** A frontend-focused deployment platform built by the creators of Next.js, optimized for zero-config deploys of modern JavaScript frameworks.

## Core Services & Concepts
- **Edge Functions** — [[Serverless Computing and Cold Starts]]
- **Preview Deployments** — [[CI-CD|CI/CD]], every git push gets its own live preview URL automatically
- **Next.js hosting** — [[SPA vs SSR vs SSG]], built specifically to run SSR, SSG, and ISR rendering modes optimally
- **CDN** — [[Content Delivery Network (CDN) and Edge Computing]]

## Pros
- Genuinely zero-config for Next.js and React projects
- Excellent developer experience
- Automatic preview URLs per pull request

## Cons
- Can get expensive at scale
- Less suited for heavy backend or non-frontend workloads
- Some vendor lock-in around Next.js-specific features

## Best For
- Frontend teams shipping React or Next.js apps who want deploys to just work

## Real Examples
- Used by Notion's marketing site, and thousands of Next.js-based startups

## Use Cases
- Marketing sites
- JAMstack apps
- Next.js full-stack apps with light backend needs
