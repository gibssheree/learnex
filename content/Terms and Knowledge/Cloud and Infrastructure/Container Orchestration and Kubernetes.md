---
tags: [term, cloud, containers]
category: Infrastructure & Automation
subcategory: Container Systems
---

# Container Orchestration and Kubernetes

**Definition:** Kubernetes (K8s) is an open-source container orchestration platform for automating application container deployment, scaling, networking, and management across a cluster of machines.

## How It Works
- **Control Plane:** API Server (the single entry point all components and clients use), `etcd` (a distributed, Raft-consensus key-value store holding all cluster state — losing `etcd` means losing the cluster's brain), Scheduler (binds unscheduled pods to nodes based on resource requests, affinity/anti-affinity, and taints/tolerations), Controller Manager (runs reconciliation loops for Deployments, ReplicaSets, Nodes, etc.).
- **Worker Nodes:** Kubelet daemon (talks to the API server, starts/stops containers via the CRI), Container Runtime (containerd or CRI-O), Kube-proxy (implements Service virtual IPs via iptables or IPVS rules on each node).
- **Core primitives:** Pod (smallest deployable unit, 1+ containers sharing network/storage), Deployment (manages a ReplicaSet, drives rolling updates and rollbacks), Service (stable virtual IP/DNS load-balancing across a dynamic pod set), Ingress (L7 HTTP(S) routing and TLS termination from outside the cluster), StatefulSet (for workloads needing stable network identity and persistent storage per replica, like databases), DaemonSet (runs exactly one pod per node, used for log collectors/node agents).
- **Networking model:** every pod gets its own routable IP (the Container Network Interface, or CNI, plugin — Calico, Cilium, Flannel — implements this), and any pod can reach any other pod without NAT, which is a foundational Kubernetes networking guarantee that CNI plugins must satisfy.
- Orchestration alternatives exist at smaller scale — Docker Swarm and Nomad offer simpler orchestration models — but Kubernetes has become the de-facto standard due to its extensibility (Custom Resource Definitions, Operators) and cloud-provider support.

## Why It Matters
- De-facto industry standard for managing containerized microservices at enterprise scale, providing self-healing (automatic pod replacement on failure), rolling deployments, and declarative infrastructure that's portable across cloud providers.
- The Operator pattern (custom controllers that encode operational knowledge, like how to safely upgrade a database) lets teams codify runbooks as software instead of manual procedures.

## Common Pitfalls
- Over-complicating deployment architecture by choosing Kubernetes for small single-server applications — the control plane, RBAC, networking, and upgrade overhead only pay off past a certain scale or team size.
- Under-provisioning `etcd` (it's latency-sensitive and disk-I/O sensitive); a slow or undersized `etcd` cluster degrades API server responsiveness for the entire cluster.
- Not isolating workloads with namespaces, network policies, and resource quotas, letting one team's misbehaving job starve another team's production workload on shared nodes.

## Related Terms
- [[Infrastructure as Code (IaC)]]
- [[Cloud Service Models]]
- [[Service Mesh]]
- [[Auto-Scaling]]

## Example
Deploying 5 replicated instances of a Node.js web app microservice across a 3-node K8s cluster: the Deployment's ReplicaSet controller spreads pods across nodes, a Service load-balances incoming traffic to healthy pods only (per readiness probes), and if a node fails entirely, the scheduler reschedules its pods onto the two remaining nodes automatically.
