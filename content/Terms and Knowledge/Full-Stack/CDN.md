---
tags: [term, fullstack, performance, infrastructure]
category: Frontend & State
---

# CDN (Content Delivery Network)

**Definition:** A network of geographically distributed servers that cache and serve static content close to the user.

## How It Works
- Static files, images, JS, CSS, get cached at edge locations worldwide
- Users download from the nearest one instead of your origin server
- DNS or anycast routing sends each user's request to the geographically or topologically nearest edge Point of Presence (PoP)
- On a cache miss, the edge node fetches the resource from your origin server, stores a copy, and serves it, subsequent requests for the same resource from nearby users hit the cached copy directly
- Cache behavior is controlled almost entirely through HTTP headers (`Cache-Control`, `ETag`, `Last-Modified`) that your origin server sets on each response

## Why It Matters
- Massively reduces load times globally and takes traffic load off your main server
- Absorbs traffic spikes and DDoS attempts before they ever reach your origin, since the edge network has far more aggregate capacity
- Reduces bandwidth costs at the origin, since most requests never traverse your actual server infrastructure
- Improves reliability: many CDNs can serve stale cached content even if your origin is temporarily down (`stale-while-revalidate`, `stale-if-error`)

## Common Pitfalls
- Not setting proper cache headers, so the CDN either caches too aggressively (stale content) or not at all (no benefit)
- Caching personalized or authenticated responses by mistake — a shared cache serving User A's account page to User B is a serious data leak, not just a bug
- Forgetting to invalidate/purge the CDN cache after a deploy, so users see an old version of a JS bundle referencing API routes that no longer exist
- Caching API responses with `Vary` headers misconfigured, so the CDN serves the wrong content-encoding or locale to different users
- Assuming the CDN is "instant" globally — purges and propagation can take seconds to minutes to reach every edge node, not milliseconds

## Under the Hood: Edge Architecture

A CDN operator runs PoPs, physical or virtual server clusters, in many cities worldwide. Two things route a user to the nearest one:

- **DNS-based routing**: the CDN's DNS servers resolve your domain to a different IP depending on the requester's approximate location (GeoDNS)
- **Anycast routing**: the same IP address is announced from every PoP via BGP, and internet routing naturally sends each packet to the topologically nearest announcing location, this is faster to react to outages since there's no DNS TTL to wait out

Within a PoP, a tiered cache hierarchy is common: a fast edge cache backed by a larger, slower regional cache, backed by the origin. A cache miss at the edge might still hit in the regional tier without ever reaching your server, this is sometimes called "origin shield."

## Types of CDN Delivery

**Pull CDN (most common)**: the CDN fetches content from your origin lazily, on the first request for a given URL, then caches it per your headers. Zero setup beyond pointing DNS at the CDN; the tradeoff is the first request per edge node is always a slower cache miss.

**Push CDN**: you proactively upload content to the CDN ahead of time (common for video/large media libraries). Guarantees availability from the first request but requires an explicit publish step in your deployment process.

**Multi-CDN**: larger sites run two or more CDN providers simultaneously and route between them based on real-time performance or failover, adding resilience against a single provider's outage at the cost of operational complexity.

## Cache Keys

Every cached object is stored under a cache key, by default usually the request URL, but CDNs let you customize what's included. Query strings, cookies, and headers can all be folded into (or explicitly excluded from) the key:

- Including `?utm_source=...` tracking params in the key by default fragments your cache into thousands of near-identical entries for the same page, tanking your hit ratio
- Excluding `Authorization` or session cookies from the key is what makes a response cacheable at all for a shared audience
- `Vary: Accept-Encoding` is common and correct (separate cached copies for gzip vs brotli vs uncompressed clients), but a careless `Vary: User-Agent` can also fragment the cache badly since user agent strings are nearly unique per browser/OS/version combination

Most CDN dashboards let you strip specific query parameters from the cache key explicitly, this is usually the fix for a surprisingly low hit ratio on otherwise-static pages.

## Comparison: CDN vs Origin Server

| | CDN Edge | Origin Server |
|---|---|---|
| Distance to user | Nearest PoP, often <50ms | Fixed location, can be 100s of ms away |
| Content | Static/cacheable, increasingly dynamic via edge compute | Everything, source of truth |
| Scaling under load | Scales with the provider's global network | Scales only as much as you provision |
| Cost model | Pay per bandwidth/requests to the CDN | Pay for your own compute/bandwidth |
| Cache control | You configure via headers | N/A, this is the source |

## Code Example

```http
# Aggressively cache a fingerprinted, immutable asset
Cache-Control: public, max-age=31536000, immutable

# Cache an HTML page briefly, but let the CDN serve stale
# content while revalidating in the background
Cache-Control: public, max-age=60, stale-while-revalidate=300

# Never cache a response containing user-specific data
Cache-Control: private, no-store
```

```bash
# Purge a specific path after deploy (example: Cloudflare API)
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://example.com/app.js"]}'
```

Fingerprinted filenames (`app.a1b2c3.js` instead of `app.js`) sidestep the whole invalidation problem for build assets: since the filename changes whenever content changes, you can cache it forever and never need to purge it, only the HTML that references the new filename needs a short TTL.

## Edge Compute

Modern CDNs (Cloudflare Workers, Vercel Edge Functions, Fastly Compute@Edge) run actual application code at the edge, not just cached files. This blurs the line between "CDN" and "distributed compute platform": you can run auth checks, A/B test routing, or even full SSR at the edge node nearest the user instead of round-tripping to a single origin region. See [[Serverless]] for the broader execution model this builds on.

## History

CDNs emerged in the late 1990s to solve the "flash crowd" problem, a site linked from a major portal would get hammered with traffic its single server couldn't handle. Akamai (1998) pioneered the model, spinning out of MIT research on distributed systems and content routing. Early CDNs handled only static files; the 2010s brought CDN-hosted DNS, DDoS mitigation, and TLS termination as standard features; the late 2010s and 2020s added edge compute, turning CDNs into a general application deployment target rather than just a caching layer.

## Real-World Example
A product launch expects a traffic spike when a link goes out in a newsletter to a million subscribers. Without a CDN, every one of those users hits the origin server directly for the product page's HTML, CSS, JS, and images, likely saturating the server's bandwidth or connection limits within minutes. With a CDN in front, the HTML might have a short TTL (or be dynamically rendered at the edge), but the CSS, JS bundle, and product images are cached at hundreds of PoPs after the first few requests, so the origin only ever serves a tiny fraction of the total traffic, the rest is absorbed entirely by the CDN's edge capacity.

## Best Practices
- Fingerprint/hash static asset filenames so they can be cached forever, and give HTML a short TTL so users get new references quickly
- Never let a CDN cache `Set-Cookie` headers or personalized responses; scope caching explicitly to public, cacheable routes
- Use `stale-while-revalidate` for content that changes occasionally but where a few seconds of staleness is harmless, this keeps responses fast even during revalidation
- Set up cache purging as an automated deploy step, not a manual "remember to clear the CDN" checklist item
- Monitor cache hit ratio, a low hit ratio on content you expect to be cacheable usually means a header or `Vary` misconfiguration

## Related Terms
- [[Caching]]
- [[Lazy Loading]]
- [[Load Balancer]]
- [[SSL-TLS]]
- [[Reverse Proxy]]

## Example
Cloudflare or Vercel's edge network serving your site's images from a server near the visitor, not your origin server across the world. A visitor in Tokyo requesting an image hosted in a US datacenter gets it from a Tokyo PoP in single-digit milliseconds instead of crossing the Pacific twice (once for the request, once for the response).

## FAQ

**Is a CDN the same thing as a reverse proxy?**
Related but not identical. A [[Reverse Proxy]] sits in front of one origin and forwards requests to it, optionally caching. A CDN is a globally distributed network of reverse-proxy-like nodes, purpose-built for caching and edge delivery at scale. Every CDN node is functionally a reverse proxy, but not every reverse proxy is part of a CDN.

**Does a CDN help with dynamic, personalized content?**
Traditionally no, dynamic per-user responses aren't cacheable. Edge compute platforms narrow this gap by running logic at the edge, but the underlying data still usually needs a round trip to a central database unless that data is also replicated to the edge.

**Why did my site get slower right after adding a CDN?**
Usually a misconfiguration: caching disabled entirely (so every request now takes an extra hop through the CDN before reaching origin), or a very restrictive TTL that causes near-constant revalidation, adding latency without any of the caching benefit.

**How does a CDN decide when a cached item expires?**
Primarily the `max-age` (or `s-maxage`, which some CDNs prefer for shared caches specifically) directive in `Cache-Control`. Once that window passes, the next request triggers a revalidation, either a full re-fetch, or a conditional request using `If-None-Match`/`ETag` that lets the origin respond `304 Not Modified` if nothing changed, avoiding re-transferring the body.

**Can a CDN serve content over HTTPS, and who manages the certificate?**
Yes, and most CDN providers manage and auto-renew a TLS certificate for your domain as part of onboarding, terminating [[SSL-TLS]] at the edge. Some setups also re-encrypt the connection from the edge back to origin ("full strict" mode) rather than forwarding plaintext, closing off the CDN-to-origin hop as an attack surface.

## Popular Providers, At a Glance

| Provider | Notable For |
|---|---|
| Cloudflare | Free tier, integrated DDoS protection, Workers edge compute |
| Akamai | Largest legacy footprint, enterprise-heavy |
| Fastly | Fast purge propagation, popular with media/news sites |
| Amazon CloudFront | Deep AWS integration (S3, Lambda@Edge) |
| Vercel/Netlify Edge Network | Bundled with frontend hosting/deploy pipelines |

Choice usually comes down to integration with your existing stack (AWS shop -> CloudFront is the path of least resistance) rather than raw performance, most major providers perform comparably for typical workloads.

**Do CDNs help mobile users on slow networks more or less than desktop users?**
More, proportionally. Round-trip latency dominates page load time on high-latency mobile connections far more than on fast broadband, so shaving distance-to-server has an outsized effect. Combined with HTTP/2 or HTTP/3 multiplexing (which most CDNs support at the edge), the effect compounds further.

**Does using a CDN change what my server sees as the client IP?**
Yes, requests arrive from the CDN's edge IP, not the visitor's. The original client IP is passed along in an `X-Forwarded-For` header, your origin's logging, rate limiting, and geo-detection code all need to read that header instead of the raw connection IP, a very common bug after adopting a CDN.
