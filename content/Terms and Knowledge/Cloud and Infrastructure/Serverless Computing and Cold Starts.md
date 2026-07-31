---
tags: [term, cloud, architecture]
category: Compute & Serverless
---

# Serverless Computing and Cold Starts

**Definition:** An execution model where the cloud provider dynamically manages the allocation of machine resources, charging only for the exact compute time used rather than pre-purchased capacity.

## How It Works
- Developers upload pure function code; the provider automatically provisions servers, executes the code in response to events (HTTP requests, database triggers), and tears down the environment.
- Scales automatically from zero to thousands of concurrent executions without manual intervention.
- Cold Starts: when a function is invoked after a period of inactivity, the provider must allocate a new container and initialize the runtime, causing a noticeable latency spike on that specific request.

## Why It Matters
- Eliminates the operational overhead of patching operating systems, managing idle server costs, and configuring auto-scaling rules.

## Common Pitfalls
- Storing local state (like files or session data) in memory between function executions, as serverless containers are ephemeral and can be destroyed at any time.
- Ignoring cold start latency in synchronous user-facing APIs, leading to intermittent slow responses for users.

## Related Terms
- [[Cloud Service Models]]
- [[Content Delivery Network (CDN) and Edge Computing]]

## Example
AWS Lambda and Google Cloud Functions allow developers to run backend code without managing servers, automatically scaling in response to traffic.
