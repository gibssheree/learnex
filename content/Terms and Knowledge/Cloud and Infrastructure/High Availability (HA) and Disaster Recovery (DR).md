---
tags: [term, cloud, reliability]
category: Reliability & Operations
---

# High Availability (HA) and Disaster Recovery (DR)

**Definition:** HA ensures a system remains operational without interruption despite localized hardware failures; DR is the set of processes and policies for recovering a system after a catastrophic outage.

## How It Works
- HA: achieves fault tolerance by deploying redundant resources (load balancers, auto-scaling groups) across multiple isolated Availability Zones (AZs) within a cloud region.
- DR: relies on backups and geographic replication to entirely different cloud regions (e.g., US-East to US-West).
- Recovery Time Objective (RTO): the maximum acceptable downtime before the system must be restored.
- Recovery Point Objective (RPO): the maximum acceptable data loss measured in time (e.g., losing the last 15 minutes of database writes).

## Why It Matters
- Prevents revenue loss and brand damage when cloud providers experience inevitable hardware failures, network cuts, or regional outages.

## Common Pitfalls
- Implementing complex multi-region active-active architectures when a simple active-passive setup would easily meet the business's RTO and RPO requirements at a fraction of the cost.

## Related Terms
- [[Load Balancer]]
- [[Database Replication]]

## Example
Deploying a Kubernetes cluster across three AWS Availability Zones provides High Availability; shipping database backups to a secondary AWS Region daily provides Disaster Recovery.
