---
tags: [term, fullstack, performance, infrastructure]
category: Frontend & State
---

# CDN (Content Delivery Network)

**Definition:** A network of geographically distributed servers that cache and serve static content close to the user.

## How It Works
- Static files, images, JS, CSS, get cached at edge locations worldwide
- Users download from the nearest one instead of your origin server

## Why It Matters
- Massively reduces load times globally and takes traffic load off your main server

## Common Pitfalls
- Not setting proper cache headers, so the CDN either caches too aggressively (stale content) or not at all (no benefit)

## Related Terms
- [[Caching]]
- [[Lazy Loading]]

## Example
Cloudflare or Vercel's edge network serving your site's images from a server near the visitor, not your origin server across the world.
