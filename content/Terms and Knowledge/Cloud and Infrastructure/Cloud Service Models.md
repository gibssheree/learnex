---
tags: [term, cloud, architecture]
category: Compute & Serverless
subcategory: Cloud Computing
---

# Cloud Service Models

**Definition:** Taxonomy of cloud computing service delivery models categorized by the degree of hardware and software management delegated to the cloud provider.

## How It Works
- **IaaS (Infrastructure as a Service):** provider manages physical servers, networking, and the hypervisor; user manages the OS, runtime, and application (AWS EC2, GCP Compute Engine, Azure VMs) — see [[Virtual Machines (VMs)]]. Maximum control, maximum operational responsibility.
- **PaaS (Platform as a Service):** provider manages the OS, patching, runtime, and often the database; user manages only application code and configuration ([[Render]], [[Railway]], Heroku). Trades some control for dramatically less operational overhead.
- **SaaS (Software as a Service):** provider manages the full application end-to-end; the user just consumes it (Google Workspace, Salesforce, Slack). No infrastructure management at all.
- **FaaS / Serverless:** event-driven code execution with zero server management and no idle compute cost — you pay per invocation/duration, not per provisioned hour (AWS Lambda, Cloudflare Workers) — see [[Serverless Computing and Cold Starts]].
- Each layer up the stack (IaaS -> PaaS -> SaaS) trades control and customization for reduced operational burden; this is often visualized as a "pizza as a service" stack where the cloud provider takes over progressively more of the layers you'd otherwise run yourself (networking, OS, runtime, data, application).
- The **Shared Responsibility Model** formalizes where the provider's obligations end and the customer's begin — in IaaS the customer is responsible for OS patching and application security; in SaaS the provider owns nearly everything except data and access configuration.

## Why It Matters
- Guides cost optimization, operational headcount needs, and shared security responsibility model decisions — choosing the wrong layer means either paying for control you don't need (running raw EC2 for a CRUD app) or hitting a wall on customization you do need (trying to force a SaaS tool to do something only custom infrastructure can).
- Directly determines the failure modes a team is responsible for debugging: an IaaS outage might be your misconfigured auto-scaling; a SaaS outage is entirely the vendor's problem to fix.

## Common Pitfalls
- Vendor lock-in when building heavily around proprietary cloud provider FaaS/PaaS features (e.g., deeply coupling to AWS Step Functions or Azure-specific bindings), making a future migration expensive.
- Choosing PaaS/SaaS for cost savings early on without modeling how pricing scales — many PaaS platforms are cheaper than IaaS at low traffic but cross over to being far more expensive at high, sustained scale.
- Underestimating the "undifferentiated heavy lifting" IaaS still leaves on your plate: OS patching, backup strategy, and scaling logic don't happen automatically just because you're "in the cloud."

## Related Terms
- [[Infrastructure as Code (IaC)]]
- [[Container Orchestration and Kubernetes]]
- [[Virtual Machines (VMs)]]
- [[Serverless Computing and Cold Starts]]

## Example
A startup uses AWS Lambda (FaaS) to resize user image uploads automatically on S3 bucket events, paying only per invocation, while running its main web app on Render (PaaS) so the team never touches an OS patch — reserving raw EC2 (IaaS) only for a specialized GPU workload that needs full hardware control.
