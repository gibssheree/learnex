---
tags: [term, fullstack, architecture]
category: Architecture & Backend
---

# Microservices vs Monolith

**Definition:** A monolith is one single deployable app containing all functionality. Microservices split functionality into many small, independently deployable services.

## How It Works
- Monolith: one codebase, one deploy
- Microservices: separate services communicate over the network via REST, gRPC, or queues
- In a monolith, modules call each other via in-process function calls — fast, type-checked at compile time (in typed languages), and transactional by default
- In microservices, "calling another module" becomes a network request — subject to latency, partial failure, serialization overhead, and versioning concerns that don't exist for a function call
- Each microservice typically owns its own database (or at least its own schema/tables), so there's no single shared schema all services can freely join against
- Deployment units are decoupled: shipping a fix to the `payments` service doesn't require redeploying `search` or `notifications`

## Deeper Dive
- The core tradeoff is **coupling vs. distribution cost**: a monolith is tightly coupled at the code level but pays zero network/distributed-systems tax; microservices decouple deployability and scaling but pay for it with network calls, eventual consistency, and operational overhead
- Splitting services along the wrong boundaries ("distributed monolith") gives you all the pain of microservices — network calls, deployment coordination — with none of the benefit of independent deployability, because services still have to ship in lockstep
- Good service boundaries usually follow domain boundaries (see Domain-Driven Design's "bounded context"), not technical layers — e.g., split by `orders` / `inventory` / `billing`, not by `frontend-service` / `backend-service`
- Data consistency across services typically moves from ACID transactions to eventual consistency via events — e.g., the Saga pattern coordinates a multi-step transaction (reserve inventory → charge payment → confirm order) using compensating actions instead of a single database transaction
- Observability becomes non-optional: a single slow request might touch six services, so distributed tracing (correlation IDs, tools like Jaeger/OpenTelemetry) replaces "just read the stack trace"

## Why It Matters
- A foundational architecture decision that affects deployment, scaling, debugging, and team structure
- Team topology follows architecture (Conway's Law): independent services let independent teams own, deploy, and scale their piece without waiting on each other's release cycles
- Scaling becomes selective — scale the `image-processing` service to 50 instances without also scaling `user-settings`, which a monolith can't do (it scales as one unit)
- Failure isolation: a memory leak or crash in one microservice doesn't necessarily take down the whole system, whereas an unhandled exception in a monolith can bring down every feature at once
- Technology flexibility: individual services can use different languages/runtimes suited to their problem (a Python service for ML inference next to a Go service for high-throughput APIs)

## Common Pitfalls
- Adopting microservices too early, a "premature distributed system," adds huge operational complexity most small teams don't need yet
- Splitting services by technical layer instead of business domain, producing chatty services that constantly call each other synchronously (the "distributed monolith")
- Underestimating operational cost: each service needs its own CI/CD pipeline, monitoring, logging, alerting, and on-call runbook
- No API versioning strategy between services, so a change in one breaks callers in another with no warning
- Assuming a network call behaves like a function call — not handling timeouts, retries, or partial failure, leading to cascading outages when one service gets slow (see [[Load Balancer]] health checks and circuit breakers)
- Sharing a single database across "microservices," which secretly recreates a monolith's tight coupling while adding all the network overhead
- Debugging becomes materially harder: reproducing a bug locally means standing up N services instead of one process, and a single user-facing error might require correlating logs across five systems

## Real-World Example
A startup MVP is usually a monolith; a company like Netflix runs hundreds of microservices at massive scale. Netflix's migration (starting ~2009) was driven by needing independent scaling for wildly different load patterns (streaming vs. billing vs. recommendations) and independent deploys across hundreds of engineering teams — not because microservices are inherently "better." Amazon's well-known internal mandate (all teams expose functionality via service APIs, no direct database or process linking) predates and heavily influenced the modern microservices pattern. Segment famously went the other direction in 2018, consolidating ~140 microservices back into a monolith after their small team spent more time managing service boundaries than building features — a widely cited cautionary tale about matching architecture to team size.

## Variants
- **Modular monolith** — one deployable, but internally organized into strictly separated modules with enforced boundaries (no reaching into another module's internals); gets most of microservices' organizational clarity without the network tax, and is a common middle ground and migration stepping stone
- **Service-Oriented Architecture (SOA)** — an older, coarser-grained predecessor to microservices, often built around a shared ESB (enterprise service bus) for routing/transformation, which microservices architectures generally avoid in favor of dumb pipes/smart endpoints
- **Serverless / FaaS** — takes decomposition further, down to individual functions deployed and scaled independently (AWS Lambda, Cloudflare Workers), trading even more operational control for near-zero infrastructure management

## Comparison

| | Monolith | Microservices |
|---|---|---|
| Deployment | Single unit | Independent per service |
| Inter-module calls | In-process function calls | Network calls (REST/gRPC/queue) |
| Data consistency | ACID transactions | Eventual consistency, sagas |
| Scaling | Whole app scales together | Per-service, selective |
| Failure blast radius | Whole app | Usually contained to one service |
| Operational overhead | Low | High (per-service CI/CD, monitoring) |
| Best fit | Small teams, early-stage products | Large orgs, independently-scaling domains |

## Best Practices
- Default to a (modular) monolith until you have a concrete, measured reason to split — team coordination pain or a specific scaling bottleneck, not speculation
- When splitting, draw boundaries around business domains, not technical layers
- Give each service its own datastore and communicate through APIs or events, never shared tables
- Build in timeouts, retries with backoff, and circuit breakers for every inter-service call from day one
- Invest in distributed tracing and centralized logging before the service count grows past a handful — retrofitting observability under pressure is much harder

## FAQ
**How many services is "too many" for a small team?** There's no fixed number, but a rough rule of thumb: if your team spends more time coordinating deploys and debugging cross-service issues than building features, you've split too early or too finely.

**Do microservices require Kubernetes?** No — they require *some* deployment and service-discovery mechanism, but that can be simple (a handful of managed containers behind a load balancer) before justifying an orchestrator.

**Can you migrate a monolith to microservices incrementally?** Yes — the common pattern is the "strangler fig": stand up new functionality as a service, route traffic to it via a proxy/gateway, and peel functionality out of the monolith piece by piece rather than a big-bang rewrite.

## Common Interview Questions
**"How would you decide whether to split a monolith into microservices?"** Look for: measured pain points (deploy contention, a specific scaling bottleneck, a team that can't ship independently), not "microservices are more modern" — good answers name concrete triggers, not vibes.

**"How do you handle a transaction that spans two microservices?"** The Saga pattern — break it into local transactions per service, each with a compensating action if a later step fails (e.g., release the inventory hold if payment fails), since a distributed two-phase commit across services is rarely practical at scale.

**"What's a distributed monolith and how do you avoid it?"** Services that are deployed separately but can't actually be deployed independently because they're too tightly coupled (shared database, synchronous call chains, lockstep versioning) — avoided by owning data per service and communicating through versioned APIs or async events instead of direct calls.

**"How do you debug a request that fails somewhere across six services?"** Distributed tracing with a propagated correlation/trace ID (OpenTelemetry, Jaeger, X-Ray) so every service's logs for that one request can be stitched back together; without it, you're grepping six separate log streams by timestamp and guessing.

## Migration Signals
Signs a monolith is genuinely ready to split (not just old):
- A specific module has wildly different scaling needs than the rest (e.g., image processing needs 50x the compute of the rest of the app under load)
- Deploys are blocked by unrelated teams' code being mid-review or broken, and it's a recurring, measured source of delay
- One module's bug or memory leak repeatedly takes down unrelated functionality
- Team size has grown to the point where more than a handful of teams are stepping on each other in the same codebase daily

Signs it's premature:
- Team is under ~10-15 engineers total
- No specific scaling bottleneck has actually been measured, only anticipated
- The org doesn't yet have solid CI/CD, monitoring, and on-call practices for one service, let alone many

## Operational Checklist for Microservices
Before splitting, a team should realistically have (or plan to build immediately):
- Automated CI/CD per service, since manual deploys don't scale past a couple of services
- Centralized, correlated logging (a request's logs need to be findable across every service it touched, not scattered across N separate log files)
- Distributed tracing with propagated trace IDs, so a slow or failing request can be diagnosed end-to-end
- Service discovery and health checks, so a [[Load Balancer]] or gateway knows which instances are actually alive
- A clear ownership model — every service should have a team that's unambiguously responsible for it, including on-call

## FAQ
**Does using Docker mean you have microservices?** No — [[Docker]] just packages an app for consistent deployment; a monolith can be (and very often is) containerized and deployed as a single Docker image, with no service decomposition involved at all.

**Is a "backend for frontend" (BFF) a microservice?** It's a specific microservices pattern — a thin service tailored to one client type's needs (mobile BFF vs web BFF), aggregating calls to other backend services so the client doesn't have to coordinate multiple round-trips itself.

**Do microservices always need REST?** No — REST/HTTP, gRPC (faster, typed, binary), and async messaging via a [[Message Queue]] are all common inter-service communication choices, and most real systems mix them depending on whether the interaction needs to be synchronous or not.

## Cost Dimensions Beyond Infrastructure
- **Cognitive load**: understanding "what does this request actually do" requires tracing across service boundaries instead of following one call stack, which slows onboarding and incident response alike
- **Testing complexity**: integration tests that used to be one in-process test now need either real running dependencies, contract tests, or careful mocking of network calls
- **Latency budget**: every hop between services adds network latency; a request that touches five services in sequence pays five round-trips of overhead that a monolith's in-process calls never would
- **Data duplication**: services that each own their data often end up caching or duplicating slices of data another service owns, trading a single source of truth for availability and independence — a deliberate tradeoff, not an oversight

## Team Structure and Conway's Law
Melvin Conway's 1968 observation — "organizations design systems that mirror their own communication structure" — is a first-class design input for this decision, not a footnote. A single team of six can't meaningfully own thirty microservices; the natural fit is roughly one to a few services per team, with clear ownership boundaries matching how the org actually communicates. Teams sometimes deliberately restructure around desired service boundaries first ("inverse Conway maneuver") — reorganizing people into the team shape they want the architecture to end up in, then letting the software boundaries follow.

## API Gateway Pattern
Most production microservices systems sit behind an API Gateway — a single entry point that handles routing to the correct backend service, TLS termination, authentication, and rate limiting once instead of duplicating that logic in every service. Without one, clients need to know the address of every individual service and each service must implement its own auth/rate-limiting; with one, clients see a single stable API surface while services are free to be added, removed, split, or merged behind it.

## Related Terms
- [[gRPC]]
- [[Message Queue]]
- [[Load Balancer]]
- [[REST API]]
- [[Docker]]

## Example
A startup MVP is usually a monolith — one Rails or Django app handling auth, billing, and the product itself, deployed as a single unit to one server or container.

```yaml
# monolith: one service, one deploy
services:
  app:
    build: .
    ports: ["3000:3000"]
```

```yaml
# microservices: independently deployable, independently scalable
services:
  orders-service:
    build: ./orders
    ports: ["4001:4001"]
  billing-service:
    build: ./billing
    ports: ["4002:4002"]
  notifications-service:
    build: ./notifications
    ports: ["4003:4003"]
```
