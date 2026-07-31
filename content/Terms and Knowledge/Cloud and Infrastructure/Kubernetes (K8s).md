---
tags: [term, cloud, containers]
category: Infrastructure & Automation
---

# Kubernetes (K8s)

**Definition:** An open-source container orchestration platform that automates the deployment, scaling, and management of containerized applications across clusters of hosts.

## How It Works
- **Control Plane:** the master components that manage the cluster — the `kube-apiserver` (the single entry point every client and component talks to), the `scheduler` (decides which node a new pod runs on based on resource requests, affinity rules, and taints/tolerations), the `controller-manager` (runs reconciliation loops that continuously push actual state toward desired state), and `etcd` (the distributed key-value store holding all cluster state).
- **Worker Nodes:** run the actual workloads via the `kubelet` (the agent that talks to the API server and manages pod lifecycle on that node), a container runtime (`containerd` or CRI-O, implementing the Container Runtime Interface), and `kube-proxy` (programs iptables/IPVS rules to implement Service networking).
- **Pods:** the smallest deployable unit, one or more tightly coupled containers sharing a network namespace (same IP, `localhost` between them) and optionally storage volumes.
- **Core objects:** a `Deployment` manages a `ReplicaSet` to keep N pod copies running and handles rolling updates; a `Service` gives a stable virtual IP/DNS name that load-balances across a dynamic set of pods (ClusterIP, NodePort, or LoadBalancer types); an `Ingress` handles HTTP(S) routing and TLS termination from outside the cluster.
- **Declarative reconciliation:** you write YAML manifests defining desired state (e.g., "3 replicas of my web app, image `v2.1`"), and controllers continuously diff actual vs. desired state and act to close the gap — this is what makes a crashed pod get automatically replaced.
- **Health checks:** `livenessProbe` restarts a container that's stuck; `readinessProbe` removes a pod from a Service's endpoints until it's actually ready to accept traffic, preventing traffic from hitting a pod that's still starting up.

## Why It Matters
- It is the de-facto industry standard operating system for the cloud, letting companies run large microservice architectures reliably and self-heal from node/container failures without tying themselves to a single cloud provider's proprietary orchestration.
- The declarative model plus reconciliation loops means the same manifests describe the intended state on a laptop (minikube/kind), a self-managed cluster, or a managed offering like EKS/GKE/AKS.

## Common Pitfalls
- Utilizing Kubernetes for simple, monolithic applications where a basic Platform-as-a-Service (PaaS) like Heroku or [[Render]] would be significantly cheaper and easier to operate — K8s adds real operational overhead (control plane upgrades, RBAC, networking) that only pays off at a certain scale/complexity.
- Not setting resource `requests` and `limits` on containers: without requests, the scheduler can't pack nodes efficiently; without limits, a single leaking pod can starve every other pod on its node (or trigger an OOM-kill at the worst moment).
- Misconfigured liveness probes that restart a healthy-but-slow-to-respond container in a crash loop, making a temporary slowdown into a full outage.
- Ignoring Pod Disruption Budgets, so a routine node drain or cluster upgrade takes down more replicas simultaneously than the application can tolerate.

## Related Terms
- [[Container Orchestration and Kubernetes]]
- [[Service Mesh]]
- [[Auto-Scaling]]
- [[Infrastructure as Code (IaC)]]

## Example
When a pod crashes due to an out-of-memory error, the kubelet reports the failure to the API server, the ReplicaSet controller notices actual replica count (2) no longer matches desired (3), and schedules a replacement pod on whichever node has capacity — typically within seconds, with zero human intervention.
