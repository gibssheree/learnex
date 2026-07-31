---
tags: [term, cloud, operations]
category: Reliability & Operations
---

# Auto-Scaling

**Definition:** A cloud computing feature that automatically adjusts the number or size of active compute resources (like VMs or containers) up or down based on real-time traffic and performance metrics.

## How It Works
- **Horizontal Scaling (Scale Out/In):** Adding or removing instances of a server. Managed via an Auto-Scaling Group (ASG) in AWS or a Managed Instance Group in GCP, linked to a Load Balancer that automatically registers/deregisters healthy instances as the group changes size.
- **Vertical Scaling (Scale Up/Down):** Increasing or decreasing the CPU/RAM of a single existing instance (usually requires a reboot, or a stop/resize/start cycle for cloud VMs).
- **Triggers:** Scaling policies are tied to CloudWatch/Prometheus metrics (e.g., "add 2 instances if average CPU utilization > 70% for 5 minutes"), custom application metrics (queue depth, requests-per-second), or scheduled policies for predictable load (e.g., scale up every weekday at 8 AM).
- In Kubernetes, the **Horizontal Pod Autoscaler (HPA)** scales pod replica counts off CPU/memory or custom metrics, while the **Cluster Autoscaler** separately adds/removes worker *nodes* when pods can't be scheduled due to insufficient capacity — the two operate at different layers and must be tuned together.
- **Cooldown periods** enforce a minimum wait between scaling actions so the system doesn't react to every transient spike; **target tracking** policies (e.g., "keep average CPU at 50%") continuously compute the delta and adjust capacity smoothly instead of firing discrete step changes.
- Predictive/scheduled scaling pre-warms capacity ahead of known traffic patterns, avoiding the lag inherent in reactive metric-based scaling.

## Why It Matters
- Ensures applications remain highly responsive during sudden traffic spikes without forcing companies to pay for peak server capacity 24/7 during quiet periods — directly trading operational cost against latency risk.
- Removes a huge class of manual capacity-planning toil, letting infrastructure track actual demand instead of worst-case estimates.

## Common Pitfalls
- Setting cooldown periods too short, causing the system to constantly spin instances up and down rapidly ("thrashing") as it chases noisy metric fluctuations rather than a stable trend.
- Scaling on CPU alone when the real bottleneck is elsewhere (database connections, downstream API latency, memory) — new instances spin up but the actual constraint remains saturated and throughput doesn't improve.
- Cold-start lag: newly launched instances/containers take real time to boot, join the load balancer's healthy pool, and warm up caches or JIT-compiled code — during a fast traffic spike, auto-scaling can lag behind demand by minutes.
- Not setting a sane maximum instance count, letting a runaway feedback loop (e.g., a bug causing high CPU under low real traffic) scale a fleet into a massive, unexpected bill.

## Related Terms
- [[High Availability (HA) and Disaster Recovery (DR)]]
- [[Kubernetes (K8s)]]
- [[Load Balancer]]
- [[Observability and Monitoring]]

## Example
An e-commerce website's ASG automatically scales from 3 web servers to 20 web servers as CPU utilization crosses 70% on Black Friday morning, with the load balancer routing traffic to each new instance as it passes its health check, then scales back down to 3 servers at midnight once the target-tracking policy sees utilization drop.
