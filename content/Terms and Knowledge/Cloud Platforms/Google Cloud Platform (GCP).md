---
tags: [platform, cloud, hyperscaler]
category: Hyperscalers
---

# Google Cloud Platform (GCP)

**Definition:** Google's cloud platform, built on the same infrastructure that runs Google Search and YouTube, known for strength in data analytics and Kubernetes.

## Core Services & Concepts
- **Compute Engine** — [[Virtual Machines (VMs)]], GCP's VM offering
- **GKE** — [[Kubernetes (K8s)]], Google invented Kubernetes internally before open-sourcing it, GKE remains the most refined managed Kubernetes offering
- **BigQuery** — [[OLTP vs OLAP]], serverless data warehouse built for OLAP-style analytics at massive scale
- **Cloud Run / Cloud Functions** — [[Serverless Computing and Cold Starts]]
- **Cloud Storage** — [[Cloud Storage Systems]]
- **Pub/Sub** — [[Event-Driven Architecture]], managed messaging between services

## Pros
- Best-in-class data analytics with BigQuery
- Cleanest Kubernetes experience of the three hyperscalers
- Strong AI/ML tooling via Vertex AI
- Often cheaper sustained-use pricing than competitors

## Cons
- Smaller service catalog than AWS or Azure
- Google has a reputation for discontinuing products, which makes long-term commitment a risk
- Smaller enterprise support ecosystem

## Best For
- Data-heavy workloads
- Teams already deep in Kubernetes
- Companies wanting Google's AI/ML tooling

## Real Examples
- Spotify, Snapchat, and most of Google's own products run on this infrastructure

## Use Cases
- Big data analytics pipelines
- Kubernetes-native applications
- ML/AI workloads
