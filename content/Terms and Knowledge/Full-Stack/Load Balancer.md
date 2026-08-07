---
tags: [term, fullstack, architecture, infrastructure]
category: Architecture & Backend
---

# Load Balancer

**Definition:** A component that distributes incoming traffic across multiple servers so no single one gets overwhelmed.

## How It Works
- Sits in front of your servers, routes each request based on a strategy like round robin or least connections
- Continuously health-checks backend servers (via periodic HTTP pings or TCP connection attempts) and stops routing to any that fail, automatically pulling them back in once they recover
- Common routing algorithms: **round robin** (cycle through servers in order), **weighted round robin** (bigger servers get proportionally more requests), **least connections** (send to whichever server currently has the fewest active connections), **least response time** (factor in latency, not just connection count), **IP hash** (same client IP always routes to the same server, a crude form of session affinity)
- Can operate at different layers of the network stack — see Under the Hood below for the L4 vs L7 distinction, which determines *how much* the load balancer understands about the traffic it's routing
- Often terminates SSL/TLS on behalf of the backend fleet, offloading the CPU cost of encryption/decryption from application servers onto the load balancer itself — see [[SSL-TLS]]
- Can also perform request-level transformations before forwarding: adding/stripping headers, rewriting paths, compressing responses, or injecting a client IP header (`X-Forwarded-For`) since the backend server otherwise only sees the load balancer's own IP as the connection source

## Why It Matters
- Needed for any app running on more than one server instance, and for zero-downtime deploys — you can take one instance out of rotation, deploy to it, health-check it, then put it back, all without users noticing
- Enables horizontal scaling: instead of buying a bigger single server (vertical scaling, which has a ceiling), you add more identical smaller instances and let the load balancer spread traffic across them
- Provides failover — if one instance crashes, the load balancer detects the failed health check and stops sending it traffic within seconds, so a single instance dying doesn't take the whole app down
- Underpins blue-green and rolling deployment strategies: the load balancer is the mechanism that actually shifts traffic from the old version to the new one, gradually or all at once

## Common Pitfalls
- Sessions stored in one server's memory break if the load balancer routes a user to a different server next request — needs sticky sessions or a shared session store (Redis, database-backed [[Session]]) so any server can serve any user
- Sticky sessions themselves are a pitfall in the other direction — they defeat even load distribution (one server can get a disproportionate share of long-lived sessions) and break the moment that server goes down, since the user's session data dies with it
- Treating the load balancer itself as infallible — a single load balancer instance is a single point of failure; production setups need the load balancer itself to be redundant (an HA pair, DNS failover, or a cloud provider's managed, already-redundant LB)
- Misconfigured or too-aggressive health checks causing "flapping" — a server that's just briefly slow gets marked unhealthy, traffic shifts to remaining servers, which then get overloaded and also start failing health checks, cascading into an outage the load balancer itself triggered
- Terminating SSL/TLS at the load balancer without also encrypting the internal hop to backend servers, leaving traffic unencrypted inside your own network (fine on a truly private network, a real problem in shared/multi-tenant infrastructure)
- Not implementing connection draining before removing an instance from rotation during deploys — in-flight requests get killed mid-response instead of being allowed to finish
- Forgetting to forward the real client IP (`X-Forwarded-For`) to backend servers, breaking rate limiting, geolocation, and audit logging that assume they're seeing the actual client instead of the load balancer's IP
- Load-testing against a single backend instance directly instead of through the load balancer, which hides connection-limit and routing-algorithm behavior that only shows up under real distributed load

## Under the Hood
- **Layer 4 (transport layer) load balancing** operates on IP address and TCP/UDP port only — it doesn't look inside the packet payload. This makes it fast and protocol-agnostic, but it can't route based on anything HTTP-specific (URL path, headers, cookies).
- **Layer 7 (application layer) load balancing** understands HTTP itself — it can route `/api/*` to one backend pool and `/static/*` to another, inspect headers or cookies to make routing decisions, and terminate TLS. This costs more CPU per request but enables far smarter routing.
- **Health checks** come in two flavors: *active* (the load balancer proactively pings a `/health` endpoint on a schedule) and *passive* (the load balancer observes real traffic and marks a server unhealthy after enough failed/slow responses, without a dedicated check). Most production setups use both.
- **Connection draining** (also called "deregistration delay" on AWS) gives an instance being removed from rotation a grace period to finish in-flight requests before it's terminated, instead of yanking it out instantly.
- Most L7 load balancers support **content-based routing** — rules that inspect the request path, host header, or even cookie values to send traffic to different backend pools, which is how a single load balancer can front an entire microservices architecture behind one public IP.
- **Session persistence** (sticky sessions) is typically implemented either by the load balancer setting its own cookie that pins a client to a specific backend, or by hashing the client's IP — both are workarounds for backend state that ideally shouldn't exist in the first place.

## Variants / Types
- **Hardware load balancers** — dedicated physical appliances (F5 BIG-IP, Citrix ADC); high performance, high cost, largely legacy in cloud-native setups
- **Software load balancers** — Nginx, HAProxy, Envoy; run on commodity servers, fully configurable, the default choice for self-managed infrastructure
- **Cloud-managed load balancers** — AWS Application Load Balancer (L7) / Network Load Balancer (L4) / Classic Load Balancer (legacy), Google Cloud Load Balancing, Azure Load Balancer, Cloudflare Load Balancing; fully managed, auto-scaling, pay-per-use
- **DNS-based load balancing** — Route53 weighted or latency-based routing, GeoDNS; distributes traffic by resolving the same hostname to different IPs for different clients, coarse-grained and slow to react to failures (bounded by DNS TTL) but useful for routing across geographic regions
- **Client-side load balancing** — used in service meshes and gRPC: the client (or a sidecar proxy like Envoy in Istio) holds the list of healthy backend instances itself and picks one directly, skipping a centralized load balancer hop entirely for internal service-to-service calls

## Comparison

| | Layer 4 | Layer 7 |
|---|---|---|
| Sees | IP + port only | Full HTTP request (path, headers, cookies, body) |
| Can route by URL path/header | No | Yes |
| Can terminate TLS | No (passes encrypted traffic through) | Yes |
| Performance overhead | Very low | Higher (parses HTTP) |
| Example | AWS NLB | AWS ALB, Nginx, HAProxy (HTTP mode) |

| AWS product | Layer | Typical use |
|---|---|---|
| ALB (Application LB) | L7 | HTTP(S) apps needing path/host-based routing |
| NLB (Network LB) | L4 | Extreme throughput, static IPs, non-HTTP protocols |
| CLB (Classic LB) | L4/L7 hybrid | Legacy, mostly superseded by ALB/NLB |

## Code Example
```nginx
# Nginx — weighted round robin across 3 upstreams with health checks
upstream backend {
    server 10.0.0.1:3000 weight=3;   # gets 3x traffic of the others
    server 10.0.0.2:3000 weight=1;
    server 10.0.0.3:3000 weight=1 backup;  # only used if the others are down

    least_conn;  # switch strategy to least-connections instead of pure round robin
}

server {
    listen 443 ssl;
    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_502;  # retry on a different server
    }
}
```

```
# HAProxy — active health checks
backend web_servers
    balance leastconn
    option httpchk GET /health
    server web1 10.0.0.1:3000 check inter 5s fall 3 rise 2
    server web2 10.0.0.2:3000 check inter 5s fall 3 rise 2
```

```
# AWS ALB — path-based L7 routing across two microservice target groups
Listener rules on port 443:
  IF path matches /api/orders/*   -> forward to target-group "orders-service"
  IF path matches /api/inventory/* -> forward to target-group "inventory-service"
  DEFAULT                          -> forward to target-group "web-frontend"

Each target group has its own health check path, port, and deregistration delay
(connection draining), configured independently per service.
```

```yaml
# Kubernetes — a Service of type LoadBalancer provisions a cloud LB automatically
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 3000
```

## Best Practices
- Always run the load balancer itself in a highly-available configuration (active-passive pair, or a cloud provider's already-redundant managed offering) — don't let it become the single point of failure it's meant to eliminate
- Prefer a shared session store (Redis, database) over sticky sessions so any server can handle any request and instance failure doesn't lose user sessions
- Tune health check thresholds deliberately (fail/rise counts, interval) to avoid flapping — a server should need a few consecutive failures before being pulled, not just one slow response
- Enable connection draining with a grace period long enough to cover your slowest realistic request before terminating an instance during deploys
- Terminate TLS at the load balancer for simplicity, but re-encrypt (or run on a private network) for the hop to backend servers if compliance or zero-trust requirements demand end-to-end encryption
- Monitor both the load balancer's own metrics (request rate, error rate, latency) and backend health check pass rates — a healthy-looking backend fleet with a misconfigured load balancer can still cause an outage
- Set health check intervals and thresholds based on your actual deploy and failure characteristics, not defaults copied from a tutorial — a 5-second interval with a 2-failure threshold behaves very differently under load than a 30-second interval with a 5-failure threshold
- Load test through the load balancer, not directly against a single backend instance, so you're validating the routing algorithm's real-world behavior under concurrency, not just one server's raw throughput

## Real-World Example
Kubernetes exposes a `Service` of type `LoadBalancer` that provisions a cloud load balancer (an ALB/NLB on AWS via the cloud controller) in front of a set of pods, with an `Ingress` controller handling L7 routing rules (path/host-based) on top of it. Netflix's original microservices stack used Eureka for service discovery paired with Ribbon/Zuul for client-side load balancing, an early large-scale example of the client-side pattern now common in service meshes.

Cloudflare's global network effectively load-balances at the DNS/anycast layer — the same IP address is announced from hundreds of data centers, and BGP routing naturally sends each user's traffic to the nearest one, distributing global load without any single traffic-director bottleneck. Large e-commerce sites during flash sales (Black Friday) commonly run load balancers with dynamic auto-scaling groups behind them, so the pool of backend instances grows automatically as the load balancer's health checks and request-rate metrics detect rising traffic.

## History
- Early load balancing (1990s) was often done crudely via DNS round robin — multiple A records for one hostname — before dedicated hardware appliances emerged
- F5 Networks (founded 1996) popularized dedicated hardware load balancers ("BIG-IP") as the standard enterprise approach through the 2000s
- The 2010s cloud shift moved most new infrastructure toward software (Nginx, HAProxy) and managed cloud load balancers (ELB launched 2009, later split into ALB/NLB in 2016) as horizontally-scaled, ephemeral cloud instances made hardware appliances impractical
- Service meshes (Istio, Linkerd, ~2017 onward) pushed load balancing logic down to per-service sidecar proxies, decentralizing what used to be a single chokepoint component
- Envoy Proxy (open-sourced by Lyft in 2016) became the de facto standard data plane for modern service meshes, with its L7-aware, highly observable proxying model influencing Istio, AWS App Mesh, and others
- HAProxy (2000) and Nginx (2004, adding load balancing features shortly after) remain the two most widely deployed software load balancers today, decades after their initial release, a testament to how stable the core problem they solve actually is

## FAQ
**Load balancer vs. reverse proxy — what's the difference?** Every load balancer is a kind of [[Reverse Proxy]] (it sits in front of backends and forwards requests on their behalf), but not every reverse proxy load-balances — a reverse proxy in front of a single backend is just proxying, not distributing.

**Can a load balancer become a bottleneck?** Yes — software load balancers are bound by the CPU/network capacity of the machine they run on, and L7 balancing in particular adds per-request parsing overhead. Cloud-managed load balancers largely solve this by auto-scaling, but self-hosted ones need capacity planning like any other server.

**What's DNS round robin and why is it a weak load balancing strategy?** Returning multiple IPs for one hostname and letting the client (or its resolver) pick one. It's crude because DNS has no concept of server health or load — a dead server keeps getting traffic until its DNS record's TTL expires and caches refresh, which can take minutes.

**Do I need a load balancer if I'm using [[Serverless]]?** No — the cloud provider's platform (API Gateway, Lambda's built-in scaling) handles distributing invocations across compute automatically; you don't manage a load balancer yourself in that model.

**What happens if all backend servers fail their health check at once?** Behavior depends on configuration — some load balancers fail open (route to servers anyway, better than a hard outage) while others fail closed (return `503` to all clients). This is a deliberate operational decision, not a default you should leave unexamined.

**Why do load balancers need their own redundancy?** Because putting a single load balancer in front of many redundant servers just moves the single point of failure one layer up — cloud providers solve this by making their managed load balancers inherently multi-zone/multi-instance under the hood, which is a big reason teams choose managed offerings over self-hosting.

## Common Interview Questions

| Question | Short answer |
|---|---|
| What's the difference between L4 and L7 load balancing? | L4 routes on IP/port only (fast, protocol-agnostic); L7 understands HTTP and can route by path/header/cookie |
| Round robin vs. least connections — when would you prefer each? | Round robin for roughly equal request costs; least connections when request duration varies a lot, to avoid overloading a server stuck with slow requests |
| How does a load balancer detect a failed server? | Health checks — active (periodic pings to an endpoint) and/or passive (observing real traffic failures) |
| What's connection draining for? | Giving an instance being removed from rotation time to finish in-flight requests before it's terminated, avoiding dropped connections during deploys |
| Why are sticky sessions considered an anti-pattern? | They defeat even load distribution and break when the pinned server goes down, taking that session's data with it |
| What's the fix for sessions breaking under load balancing? | A shared, external session store (Redis, database) that any backend server can read regardless of which one handled the previous request |
| Load balancer vs. reverse proxy? | Every load balancer is a reverse proxy, but not every reverse proxy distributes traffic across multiple backends |
| How do you avoid the load balancer itself being a single point of failure? | Run it in an HA pair, or use a cloud provider's already-redundant managed load balancer |

## Related Terms
- [[Microservices vs Monolith]]
- [[Session]]
- [[Reverse Proxy]]
- [[Caching]]
- [[HTTP Status Codes]]
- [[SSL-TLS]]
- [[Rate Limiting]]

## Example
Nginx or AWS's Application Load Balancer spreading traffic across 5 identical backend instances — if instance 3 fails its health check, the load balancer stops routing to it within seconds and redistributes its share of traffic across the remaining 4 until it recovers.

During a rolling deploy, a load balancer takes instance 1 out of rotation, waits for connection draining to finish (say, 30 seconds), lets the deployment pipeline update it to the new version, health-checks it back in, and only then repeats the same process for instance 2 — so the app stays fully available throughout, with users never routed to a server mid-restart.

A blue-green deploy instead keeps two complete environments ("blue" = current, "green" = new) running simultaneously, and cuts traffic over at the load balancer all at once once the green environment passes its health checks — trading the gradual rollout of a rolling deploy for an instant, easily-reversible switch.
