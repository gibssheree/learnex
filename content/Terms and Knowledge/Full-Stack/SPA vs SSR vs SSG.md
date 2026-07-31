---
tags: [term, fullstack, frontend, rendering]
category: Frontend & State
---

# SPA vs SSR vs SSG

**Definition:** Three ways to render a web app. SPA renders entirely in the browser, SSR renders HTML on the server per request, SSG renders HTML at build time.

## How It Works
- SPA (React/Vue client-side): ships a mostly blank HTML shell, JS builds the page
- SSR (Next.js, Nuxt): generates HTML per request on the server
- SSG: pre-builds every page as static HTML ahead of time

## Why It Matters
- Affects SEO, initial load speed, and server cost — a core architecture decision for any frontend project

## Common Pitfalls
- Using a pure SPA for content that needs strong SEO, search engines have historically struggled with JS-rendered content

## Related Terms
- [[Hydration]]
- [[CDN]]

## Example
A blog is a great fit for SSG since content rarely changes. A dashboard behind login is fine as an SPA.
