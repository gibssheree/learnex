---
tags: [platform, cloud, hyperscaler]
category: Hyperscalers
---

# AWS (Amazon Web Services)

**Definition:** The largest cloud platform, run by Amazon, offering hundreds of on-demand computing, storage, and infrastructure services.

## Core Services & Concepts
- **EC2** — [[Virtual Machines (VMs)]], resizable virtual servers, the original AWS product
- **S3** — [[Cloud Storage Systems]], object storage used across almost every AWS architecture
- **Lambda** — [[Serverless Computing and Cold Starts]], the service that popularized serverless functions
- **EKS** — [[Kubernetes (K8s)]], managed Kubernetes control plane
- **IAM** — [[Identity and Access Management (IAM)]], AWS's own permission system, famously granular and famously easy to misconfigure
- **VPC** — [[Virtual Private Cloud (VPC) and Subnets]], isolated network environment per account

## Pros
- Largest service catalog by far
- Most mature ecosystem and most job demand
- Best documentation and community support due to sheer market share

## Cons
- Pricing is notoriously complex and easy to get wrong
- Steep learning curve from the sheer number of overlapping services
- IAM misconfiguration is a leading cause of real-world cloud security breaches

## Best For
- Enterprises needing nearly every possible cloud service under one roof
- Teams with dedicated DevOps or cloud engineers to manage the complexity

## Real Examples
- Netflix, Airbnb, and a large share of the modern internet's backend infrastructure run partly on AWS

## Use Cases
- Large-scale enterprise backends
- Data lakes and analytics pipelines
- ML training infrastructure via SageMaker
- Hybrid cloud deployments
