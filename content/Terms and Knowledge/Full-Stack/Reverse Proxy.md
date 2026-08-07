---
tags: [term, fullstack, devops, infrastructure]
category: DevOps & Delivery
---

# Reverse Proxy

**Definition:** A server that sits in front of your backend, forwarding client requests to it and returning the response back to the client.

## How It Works
- Client talks to the proxy (e.g. Nginx)
- The proxy forwards the request to the actual app server, hiding the app server's details from the outside
- The proxy terminates the incoming connection and opens its own connection to the backend — client and backend never talk directly
- It rewrites and forwards headers, most importantly setting `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Forwarded-Host` so the backend can reconstruct what the original client actually sent
- Can route to different backends based on path, hostname, or headers — one proxy in front of many services

## Why It Matters
- Used for load balancing, SSL termination, caching, and hiding internal architecture
- Centralizes cross-cutting concerns (TLS certs, compression, rate limiting, request logging) in one place instead of every backend service reimplementing them
- Lets you change backend infrastructure (swap servers, scale instances, migrate languages) without the client-facing address ever changing
- A single well-tuned proxy layer can absorb traffic spikes and slow/malicious clients before they ever reach application code

## Reverse Proxy vs Forward Proxy
These get confused constantly because both "proxy" traffic, but they sit on opposite sides of the conversation:

| | Forward Proxy | Reverse Proxy |
|---|---|---|
| Sits in front of | The client | The server |
| Hides identity of | The client (from the server) | The server (from the client) |
| Client is aware of it | Usually configured explicitly | Usually transparent |
| Typical use | Corporate internet filtering, VPNs, anonymizing | Load balancing, SSL termination, caching |
| Example | Corporate proxy blocking social media sites | Nginx/Cloudflare in front of a web app |

A forward proxy protects/controls the client's outbound traffic; a reverse proxy protects/controls the server's inbound traffic. Same mechanism, opposite side of the trust boundary.

## Core Responsibilities
- **SSL/TLS termination** — the proxy holds the certificate and decrypts HTTPS, then talks plain HTTP to the backend over a trusted internal network, so app servers don't each need cert management (see [[SSL-TLS|SSL/TLS (HTTPS)]])
- **Load balancing** — distributes requests across multiple backend instances using round-robin, least-connections, or IP-hash strategies (see [[Load Balancer]])
- **Caching** — stores responses for repeat requests, cutting backend load for static or slow-changing content
- **Compression** — gzip/brotli-compresses responses at the edge instead of every backend doing it
- **Request routing** — path-based (`/api/*` to one service, `/` to another) or host-based routing lets multiple services share one public IP/domain
- **Security filtering** — can strip malformed requests, enforce header size limits, block known-bad IP ranges, or act as the enforcement point for [[Rate Limiting]]
- **Buffering** — shields slow backend servers from slow clients by buffering the full request/response, freeing backend worker threads faster

## Common Pitfalls
- Misconfigured proxy headers, like forgetting `X-Forwarded-For`, breaking things like rate limiting or logging that rely on the real client IP
- Trusting `X-Forwarded-For` blindly without stripping/overwriting it at the edge — a client can forge that header, so it's only trustworthy once your own proxy sets it authoritatively
- Not setting `X-Forwarded-Proto`, so a backend behind SSL-terminating proxy thinks every request is plain HTTP, breaking secure-cookie logic or redirect loops
- Mismatched timeout settings between proxy and backend, causing the proxy to give up and return a `504 Gateway Timeout` while the backend is still legitimately processing
- Overly large proxy buffers or unbounded request bodies opening up denial-of-service vectors
- Caching responses that shouldn't be cached (e.g. per-user authenticated data) because cache-control headers weren't set correctly upstream
- Forgetting to update proxy config when adding a new backend route, leaving it unreachable or falling through to a default/404 handler

## Under the Hood
- A reverse proxy typically operates at Layer 7 (application/HTTP) so it can inspect paths, headers, and cookies to make routing decisions — contrast with a Layer 4 load balancer that only sees IP/port and TCP/UDP data
- Connection pooling between proxy and backend (keepalive connections) avoids the overhead of a new TCP handshake per request, a major performance lever under high request rates
- Health checks (periodic `GET /healthz` calls) let the proxy detect a dead backend instance and stop routing to it before users see errors
- Sticky sessions (routing a client to the same backend instance based on a cookie or IP hash) are sometimes needed for stateful apps, though they work against horizontal scalability and are usually avoided in favor of stateless backends plus a shared session store

## Comparison: Reverse Proxy vs API Gateway vs Load Balancer

| | Reverse Proxy | API Gateway | Load Balancer |
|---|---|---|---|
| Primary job | Hide/front a backend | Manage API traffic (auth, rate limits, transforms) | Distribute traffic across instances |
| Layer | Usually L7 | L7 | L4 or L7 |
| Typical extras | Caching, TLS termination | Auth, request/response transforms, versioning | Health checks, failover |
| Example tools | Nginx, HAProxy, Caddy | Kong, AWS API Gateway | AWS ELB, HAProxy, F5 |

In practice these overlap heavily — Nginx alone can do all three jobs at small-to-medium scale, and dedicated API gateways are really just reverse proxies with an opinionated feature set layered on top for API-specific concerns like key management and request transformation.

## Code Example
Nginx reverse proxy in front of a Node app, with proper forwarded headers and SSL termination:

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate     /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;  # force HTTPS
}
```

The app server behind this only ever sees plain HTTP on `127.0.0.1:3000` and must trust the `X-Forwarded-*` headers Nginx sets — never headers a raw client could set directly, since Nginx overwrites them rather than appending blindly.

## Best Practices
- Always set and trust `X-Forwarded-For`/`X-Forwarded-Proto` only from your own proxy layer, never directly from client input
- Terminate TLS at the proxy and use HTTP/2 or keepalive connections to the backend to minimize latency overhead
- Set explicit, matching timeouts between proxy and backend to avoid confusing `504`s on legitimately slow requests
- Add health checks so the proxy routes only to instances that are actually up
- Keep the proxy layer stateless and horizontally scalable itself — a single reverse proxy instance is a new single point of failure if not load-balanced or run in a redundant pair
- Version and test proxy config changes like application code — a bad Nginx reload can take down every backend service behind it at once
- Log at the proxy layer (request path, status, latency, real client IP) — it's the one place that sees every request across all backend services
- Run at least two proxy instances behind a floating IP or DNS-based failover — a single reverse proxy is otherwise a textbook single point of failure for the entire system

## Related Terms
- [[Load Balancer]] — a feature a reverse proxy commonly provides, not a separate layer by necessity
- [[SSL-TLS|SSL/TLS (HTTPS)]] — the certificate handling the proxy typically centralizes
- [[CDN]] — a globally distributed reverse proxy specialized for caching and edge delivery
- [[Rate Limiting]] — frequently enforced at the reverse proxy/gateway layer
- [[DNS]] — resolves the public hostname to the proxy's IP, not the backend's

## Real-World Example
A typical production setup: Cloudflare (CDN + reverse proxy at the edge) sits in front of an Nginx reverse proxy, which sits in front of three Node.js app instances. Cloudflare terminates TLS from the public internet, caches static assets, and blocks obvious bot traffic. Nginx terminates a second internal TLS hop, load-balances across the three app instances with least-connections, and forwards the real client IP through `X-Forwarded-For` at each hop so the app's rate limiter and logs see the actual originating IP rather than Cloudflare's or Nginx's own address.

## FAQ
**Is a reverse proxy the same as a load balancer?**
Not exactly — load balancing is one job a reverse proxy commonly does, but a reverse proxy can run in front of a single backend purely for TLS termination, caching, or hiding infrastructure, with no load balancing involved at all.

**Why not terminate TLS directly on the app server?**
You can, but then every app instance needs certificate management, and you lose the single choke point for consistent security policy, and you can't easily add caching or routing in front without another hop anyway.

**Does a reverse proxy add latency?**
Yes, technically — one extra network hop — but a well-configured proxy with keepalive connections and local caching often makes the overall system *faster* than a client hitting the backend directly, since it can serve cached responses and use persistent connections.

## History
- Early reverse proxies (late 1990s/2000s) were mostly about caching (Squid) — offloading repeat requests for static content from slow web servers
- Nginx (2004) was built specifically to solve the C10K problem — handling ten thousand concurrent connections efficiently — and became the default reverse proxy for most of the web due to its event-driven, non-blocking architecture beating Apache's thread-per-connection model under load
- The rise of microservices in the 2010s pushed reverse proxies toward smarter routing (path/host-based) since one edge now had to front dozens of backend services instead of one monolith
- Service meshes (Envoy, Linkerd) extended the reverse proxy pattern *inside* the cluster — a sidecar proxy next to every service instance handling retries, mTLS, and observability, not just at the public edge

## Common Interview Questions
- "What's the difference between a forward proxy and a reverse proxy?" — forward proxy hides/represents the client, reverse proxy hides/represents the server
- "Why would you terminate TLS at the proxy instead of the app server?" — centralized cert management, offloads CPU-heavy encryption from app servers, lets internal traffic run on a trusted network without per-service cert rotation
- "What happens if `X-Forwarded-For` isn't handled correctly?" — either the backend sees the proxy's IP for every request (breaking per-client rate limiting and geolocation) or, worse, trusts a client-forged header and can be spoofed
- "How does a reverse proxy differ from a load balancer?" — load balancing is one feature a reverse proxy can provide; a reverse proxy's scope also covers TLS termination, caching, and routing even with a single backend

## Deeper Dive: Layer 4 vs Layer 7 Proxying
- **Layer 4 (transport)**: operates on raw TCP/UDP, forwards packets based on IP and port without understanding HTTP at all. Faster, lower overhead, but can't route based on URL path or inspect headers
- **Layer 7 (application)**: understands HTTP/HTTPS, can route by path, hostname, cookie, or header value, and can terminate/re-encrypt TLS, rewrite requests, or serve cached responses directly
- Most reverse proxies used for web traffic (Nginx, HAProxy in HTTP mode, Envoy) operate at Layer 7 because the routing decisions that matter for web apps — "this path goes to the auth service, that one goes to search" — require reading the HTTP request itself
- Layer 4 proxying still shows up for non-HTTP protocols (raw database connections, custom TCP protocols) where there's no application-level structure to route on

## Example
Nginx sitting in front of a Node.js app, handling HTTPS and forwarding plain HTTP to the app internally. At larger scale: Cloudflare or AWS ALB terminates the internet-facing connection, then routes to an internal Nginx or Envoy layer that load-balances across dozens of app containers.
