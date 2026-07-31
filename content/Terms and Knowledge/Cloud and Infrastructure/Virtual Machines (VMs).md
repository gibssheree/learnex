---
tags: [term, cloud, architecture]
category: Compute & Serverless
---

# Virtual Machines (VMs)

**Definition:** A software-based emulation of a physical computer that runs an entire operating system (Guest OS) on top of physical hardware (Host OS) managed by a Hypervisor.

## How It Works
- **Hypervisor (Type 1, "bare-metal"):** runs directly on physical hardware with no host OS underneath — examples include VMware ESXi, Xen, and KVM (used internally by AWS, GCP, and most cloud providers); this is what production cloud infrastructure runs on.
- **Hypervisor (Type 2, "hosted"):** runs as an application on top of a conventional OS (VirtualBox, VMware Workstation, Parallels) — common for local development, less common in production.
- The hypervisor allocates physical CPU (via time-slicing or dedicated cores), memory, and storage to each VM and enforces isolation between them; each VM runs a completely independent Guest OS kernel, unaware it's sharing underlying physical hardware with other VMs.
- **Contrast with containers:** VMs virtualize the *hardware*, so each VM needs its own full OS kernel and typically takes tens of seconds to boot; containers virtualize the *OS* by sharing the host kernel via namespaces/cgroups, so they start in milliseconds and have a far smaller footprint — see [[Kubernetes (K8s)]] for how containers are orchestrated at scale.
- Lightweight "microVM" hypervisors like Firecracker (built by AWS, used for Lambda and Fargate) narrow this gap by booting a minimal VM in around 125ms, combining VM-level isolation with near-container startup speed.
- Cloud providers size VMs into instance families/types (e.g., AWS `t3.medium`, `m5.large`) that bundle a fixed vCPU/RAM/network ratio tuned for general-purpose, compute-optimized, or memory-optimized workloads.

## Why It Matters
- Enables infrastructure consolidation (running 10 VMs on 1 physical server instead of buying 10 physical servers) and forms the foundation of modern Infrastructure as a Service (IaaS) cloud computing — see [[Cloud Service Models]].
- Strong isolation (separate kernels, not just separate processes) makes VMs the default choice for multi-tenant environments where security boundaries matter more than density or startup latency.

## Common Pitfalls
- "VM Sprawl": creating numerous virtual machines without proper lifecycle management, leading to wasted cloud spend on idle instances and unpatched, forgotten security vulnerabilities.
- Over-provisioning instance size "just in case" instead of right-sizing based on actual CPU/memory utilization, which is one of the single largest sources of avoidable cloud bill waste.
- Treating VMs as pets instead of cattle: manually configuring long-lived instances by hand makes them fragile and non-reproducible; see [[Infrastructure as Code (IaC)]] for the alternative.

## Related Terms
- [[Cloud Service Models]]
- [[Kubernetes (K8s)]]
- [[Auto-Scaling]]
- [[Serverless Computing and Cold Starts]]

## Example
Amazon EC2 and Google Compute Engine provide on-demand Virtual Machines in the cloud, billed per second/hour based on instance type; under the hood, AWS Lambda's isolation between customer function invocations is itself implemented using lightweight Firecracker microVMs rather than plain OS containers.
