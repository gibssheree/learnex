---
tags: [term, fullstack, architecture, devops]
category: Architecture & Backend
---

# Serverless

**Definition:** A deployment model where you write functions and the cloud provider handles servers, scaling, and infrastructure entirely.

## How It Works
- Your code runs only when triggered, an HTTP request or a queue message
- You're billed per execution, not for idle server time
- Each invocation runs in an isolated, ephemeral execution environment — the provider spins one up on demand, runs your function, and tears it down (or freezes it for reuse) shortly after, so there's no long-lived process holding state between requests
- The provider handles the entire scaling dimension: a spike from 10 requests/second to 10,000 requests/second is handled by spinning up more parallel execution environments, with no capacity planning, autoscaling group configuration, or server provisioning on your part
- Functions are stateless by design — anything you need to persist (session data, files, counters) has to go to an external store (a database, Redis, S3), because the next invocation might run in a completely different, freshly initialized environment with no memory of the last one
- Providers isolate execution using lightweight sandboxing technology — AWS Lambda uses Firecracker microVMs, Cloudflare Workers use V8 isolates (no full VM at all, much faster cold start, much tighter resource constraints)
- Triggers are the glue of the whole model — an HTTP request via an API gateway, a message landing on a queue, a file uploaded to object storage, a row changing in a database, or a scheduled cron expression can all invoke the same kind of function, decoupling "what happened" from "what runs" through configuration rather than code

## Why It Matters
- Removes a lot of ops burden and scales automatically, popular for APIs, cron jobs, and event-driven tasks
- Cost model aligns spend with actual usage — a low-traffic side project or an internal tool used a few times a day can cost fractions of a cent per month instead of paying for an always-on server that's idle 99% of the time
- Removes an entire category of operational work: no OS patching, no runtime version upgrades to schedule, no server capacity to monitor and right-size, because there's no server to manage in the first place
- Encourages (and sometimes forces) a decomposed, event-driven architecture — individual functions triggered by specific events (HTTP request, file upload, queue message, database change) rather than one big monolithic process handling everything
- Time-to-first-deploy is often dramatically lower for small services — pushing a single function live can take minutes with no infrastructure-as-code, load balancer, or cluster setup required first
- Fine-grained billing exposes cost per feature in a way traditional server billing never could — teams can see exactly which endpoint or function is driving spend, rather than one opaque monthly server bill covering everything at once

## Common Pitfalls
- "Cold starts," the first request after idle is slow
- Long-running tasks and persistent connections, like WebSockets or DB connection pools, don't fit the model well
- Opening a new database connection on every invocation (because there's no long-lived process to hold a pool) can exhaust a traditional database's max-connections limit under load — this is one of the most common serverless-meets-database production incidents
- Vendor lock-in creeps in fast — code written against AWS Lambda's event object shapes, IAM permission model, and specific trigger integrations (S3 events, DynamoDB streams) doesn't port cleanly to Azure Functions or Google Cloud Functions without real rewrite work
- Debugging and local testing are harder than a normal server process — you can't just attach a debugger to a running server; you're often simulating the cloud provider's runtime locally (with tools like SAM CLI or the Serverless Framework's offline plugin) which never perfectly matches production behavior
- Runaway cost from unbounded recursion or fan-out — a function that triggers another function that triggers itself (directly or via a queue) can spiral into thousands of invocations before anyone notices, and per-invocation billing means that mistake has a real dollar cost, unlike a traditional server just getting slow
- Treating "scales automatically" as "scales for free" — downstream dependencies (a rate-limited third-party API, a fixed-capacity relational database) often become the actual bottleneck once the serverless layer in front of them scales far faster than they can
- Execution time limits (Lambda caps at 15 minutes) mean serverless is fundamentally the wrong tool for genuinely long-running batch jobs, video encoding, or large data processing pipelines without careful chunking
- Not accounting for concurrency limits — most providers cap how many instances of a function can run simultaneously per account/region by default, and hitting that cap under a traffic spike causes throttled requests rather than the "infinite scale" marketing implies
- Deploying secrets as plain environment variables without a secrets manager — serverless functions are just as capable of leaking [[Environment Variables]] in logs or error traces as any other runtime, and the "someone else manages the infra" framing lulls teams into skipping practices they'd apply on a traditional server

## Under the Hood: The Cold Start
- A cold start happens when no warm execution environment exists for a function and the provider must provision one from scratch: download the code package, initialize the runtime (Node/Python/Java/etc.), run any module-level initialization code, then finally invoke the handler
- Cold start latency varies enormously by runtime — lightweight interpreted runtimes (Node.js, Python) typically cold-start in tens to low hundreds of milliseconds; JVM-based runtimes (Java, and to a lesser extent .NET) can take multiple seconds due to class loading and JIT warmup
- "Warm" invocations reuse an already-initialized environment for a subsequent request, skipping nearly all of that overhead — which is why the same function can respond in 5ms on one request and 800ms on the next, depending purely on whether it happened to reuse a warm container
- Providers offer paid mitigations: AWS Lambda "Provisioned Concurrency" keeps a set number of environments permanently warm for a fee, defeating some of serverless's pure pay-per-use appeal in exchange for predictable latency
- V8-isolate-based platforms (Cloudflare Workers, Deno Deploy) largely sidestep the cold start problem by design — isolates start in single-digit milliseconds because they're not full VMs or containers, just sandboxed JS execution contexts within an already-running process
- Language and package size matter too — a Lambda function bundling a large dependency tree (heavy npm packages, big native binaries) takes longer to download and initialize on a cold start than a lean, tree-shaken bundle, which is part of why bundlers like esbuild became standard in serverless deployment pipelines

## History
- The term "serverless" predates AWS Lambda — early usages in the 2010s referred loosely to backend-as-a-service platforms (Firebase, Parse) that removed the need to run your own server for common app functionality
- AWS Lambda's launch in 2014 is generally considered the moment "serverless" crystallized into today's meaning: event-triggered, pay-per-invocation functions with no server management at all
- Google Cloud Functions and Azure Functions followed in 2016-2017, and the Serverless Framework (an open-source deployment tool, also launched 2015 as "JAWS") helped standardize how teams packaged and deployed functions across providers
- Cloudflare Workers (2017) introduced the V8-isolate model as an alternative to container/VM-based FaaS, prioritizing near-zero cold starts and global edge distribution over the fuller OS-level compatibility that Lambda offers
- The mid-2020s saw growth in "serverless everything" — serverless databases, serverless GPUs for inference workloads, and serverless container platforms (Fargate, Cloud Run) extending the pay-per-use philosophy well beyond the original narrow FaaS use case

## Variants
- **Function-as-a-Service (FaaS)** — the classic model: AWS Lambda, Azure Functions, Google Cloud Functions — a single function triggered by an event, billed per invocation and duration
- **Edge functions** — Cloudflare Workers, Vercel Edge Functions, Deno Deploy — run in points of presence geographically close to the user rather than a single region, trading some runtime restrictions (limited APIs, no arbitrary native modules) for lower latency
- **Serverless containers** — AWS Fargate, Google Cloud Run — you supply a container image instead of a plain function, giving more control over the runtime environment while keeping the "no server management, scale to zero" billing model
- **Backend-as-a-Service (BaaS)** — Firebase, Supabase — goes a layer further, offering managed database, auth, and storage alongside compute, so you write even less backend code than a bare FaaS setup
- **Serverless databases** — Neon, PlanetScale, Aurora Serverless — extend the same pay-per-use, scale-to-zero philosophy to the data layer itself, often specifically designed to pair well with serverless compute's connection-churn problem via HTTP-based or pooled connection proxies
- **Workflow orchestration** — AWS Step Functions, Temporal — coordinate multiple serverless functions into a reliable multi-step process with retries, timeouts, and state tracking, addressing the gap that individual functions can't hold state or run longer than their execution limit

## Comparison: Serverless vs Traditional Servers vs Containers

| | Serverless (FaaS) | Traditional server | Containers (e.g. ECS/K8s) |
|---|---|---|---|
| Scaling | Automatic, per-request | Manual or autoscaling groups | Automatic via orchestrator |
| Billing | Per invocation/duration | Per instance-hour, idle or not | Per instance-hour, idle or not |
| Cold starts | Yes (unless kept warm) | No | Minimal, if pre-warmed |
| Max execution time | Capped (e.g. 15 min on Lambda) | Unlimited | Unlimited |
| State | Stateless, external store required | Can hold state in memory | Can hold state in memory |
| Ops burden | Lowest | Highest | Medium |
| Best fit | Bursty, event-driven, unpredictable traffic | Steady, predictable, latency-sensitive long-lived processes | Complex multi-service systems needing more control than FaaS |

## Code Example
```js
// AWS Lambda handler (Node.js) — triggered by API Gateway
export const handler = async (event) => {
  const { httpMethod, body } = event;
  if (httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const data = JSON.parse(body);
  // No persistent connection pool here — use an HTTP-based
  // or serverless-aware database client to avoid exhausting
  // connections under concurrent cold-started invocations
  const result = await db.insert('orders', data);
  return {
    statusCode: 201,
    body: JSON.stringify({ id: result.id }),
  };
};
```

```yaml
# serverless.yml — Serverless Framework config for the function above
service: orders-api
provider:
  name: aws
  runtime: nodejs20.x
functions:
  createOrder:
    handler: handler.handler
    events:
      - httpApi:
          path: /orders
          method: post
    timeout: 10
    memorySize: 256
```

## Best Practices
- Keep functions small and single-purpose — easier to reason about cold start cost, IAM permissions (least privilege per function), and independent scaling
- Initialize expensive resources (DB clients, SDK instances) outside the handler function, at module scope, so warm invocations reuse them instead of recreating them every call
- Use a connection-pooling proxy (RDS Proxy, PgBouncer, or an HTTP-based serverless database driver) instead of opening raw database connections per invocation
- Set realistic timeouts and memory limits — over-provisioned memory wastes money, under-provisioned memory causes throttled CPU and slower execution (on AWS Lambda, CPU scales with allocated memory)
- Instrument with distributed tracing (AWS X-Ray, OpenTelemetry) early — debugging a chain of five triggered functions after the fact without tracing is far harder than in a traditional monolith with one call stack
- Treat infrastructure as code from day one (Serverless Framework, AWS SAM, Terraform, CDK) rather than clicking through a console — serverless architectures accumulate many small resources (functions, triggers, permissions, queues) that become unmanageable to track by hand
- Set concurrency limits deliberately on functions that call rate-limited downstream services, to avoid a traffic spike overwhelming a third-party API or your own database
- Design for idempotency wherever a trigger might redeliver an event (queues and streams commonly guarantee "at-least-once" delivery, not "exactly-once") — a function that processes the same message twice should produce the same end state, not duplicate side effects
- Version and alias deployments (Lambda aliases, traffic-splitting on Cloud Run) so a bad deploy can be rolled back instantly by repointing traffic, rather than redeploying an older code package under time pressure

## FAQ
- **Is serverless cheaper than a traditional server?** For spiky or low, unpredictable traffic, usually yes. For steady, high, predictable traffic, a reserved traditional server or container often ends up cheaper — serverless's per-invocation pricing has a real premium once you're running constantly.
- **Can serverless functions maintain a WebSocket connection?** Not directly in the classic FaaS model, since functions are short-lived and stateless — real-time use cases typically route through a managed service (AWS API Gateway WebSocket APIs, Pusher, Ably) that handles the persistent connection and invokes your function only for discrete events.
- **What's the difference between serverless and "serverless containers" like Fargate?** Both scale automatically and bill for actual usage without you managing servers, but Fargate runs a full container you control (any runtime, any dependencies, longer execution times) while classic FaaS constrains you to specific runtimes and short execution windows.
- **Does "serverless" mean there are no servers?** No — there are absolutely still servers, you just don't provision, patch, or manage them; the term describes what's abstracted away from you, not the absence of physical or virtual machines underneath.
- **How do you avoid vendor lock-in with serverless?** Wrap provider-specific event shapes and SDK calls behind your own thin abstraction layer, use portable IaC tooling (Serverless Framework, Terraform) over provider-console configuration, and accept that some lock-in is often a reasonable tradeoff for the operational simplicity gained — full portability rarely comes free.

## Real-World Example
Coca-Cola's vending machine app rebuild is a frequently cited early serverless case study: the team moved a backend serving vending machine transactions from EC2 instances to AWS Lambda plus API Gateway and reportedly cut infrastructure costs significantly while removing the need to manage servers sized for occasional traffic spikes. A more everyday example: a marketing site's contact form handler is an ideal serverless candidate — traffic is bursty and unpredictable (a few submissions a day, maybe a spike after a campaign email), so paying for an always-on server to handle a handful of daily requests would be pure waste compared to a function that costs essentially nothing when idle.

A cautionary counter-example is just as instructive: teams that migrated a steady, high-throughput internal API to Lambda specifically for the "no ops" appeal sometimes found their monthly bill *higher* than an equivalent right-sized EC2 instance or container, because at consistently high request volume the per-invocation premium adds up faster than paying for reserved, fully-utilized compute.

## Common Interview Questions
- **What's a cold start and why does it happen?** It's the latency penalty when a function is invoked with no existing warm execution environment, requiring the provider to provision and initialize one from scratch — download code, start the runtime, run initialization code — before the actual handler logic runs.
- **How do you handle database connections in a serverless function?** Avoid opening a fresh raw connection per invocation, since concurrent cold starts can exhaust a traditional database's connection limit; use a pooling proxy (RDS Proxy, PgBouncer) or an HTTP-based/serverless-native database client designed for high-concurrency, short-lived connections instead.
- **When would you NOT choose serverless?** For steady high-throughput workloads where reserved capacity is cheaper, for long-running processes exceeding the platform's execution time limit, for workloads needing persistent in-memory state or WebSocket connections, or when you need full control over the runtime environment that a managed FaaS platform restricts.
- **How does serverless billing actually work?** Typically a combination of number of invocations plus GB-seconds (memory allocated multiplied by execution duration) — so a function that runs twice as long, or is allocated twice the memory, costs roughly twice as much per invocation, independent of whether it's ever called.

## Related Terms
- [[Connection Pooling]]
- [[CI-CD|CI/CD]]
- [[Load Balancer]]
- [[Environment Variables]]

## Example
AWS Lambda, Vercel Functions, or Cloudflare Workers running an API route only when it's called. A concrete pattern: a Next.js app deployed on Vercel where each API route (`/api/checkout`) becomes its own serverless function, scaling independently — a traffic spike hitting `/api/checkout` during a sale doesn't need to scale `/api/search` at all, and if the site gets zero traffic overnight, the bill for that period is effectively zero.

Another common pattern: an S3 bucket upload triggering a Lambda function that resizes an image into thumbnails, entirely event-driven with no server ever sitting idle waiting for uploads to happen. Both patterns share the same underlying shape — code that exists purely to react to an event, with the provider handling everything about how and where it runs.

That event-driven shape is the real defining trait of serverless, more than the billing model or the absence of visible servers.
