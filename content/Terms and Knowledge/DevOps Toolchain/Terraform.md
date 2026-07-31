---
tags: [platform, devops, iac]
category: IaC & Config Management
---

# Terraform

**Definition:** HashiCorp's tool for defining cloud infrastructure as declarative configuration files, then applying that config to create or update real infrastructure.

## Core Services & Concepts
- **HCL (HashiCorp Configuration Language)** — the declarative syntax used to describe resources
- **State file** — [[Infrastructure as Code (IaC)]], tracks what infrastructure Terraform believes exists, the source of most real-world Terraform pain
- **Providers** — plugins that let Terraform manage AWS, GCP, Azure, Cloudflare, and hundreds of other platforms with the same workflow

## Pros
- Cloud-agnostic, one tool and syntax across every major provider
- Plan-before-apply workflow shows exactly what will change before it happens
- Huge community module ecosystem for common infrastructure patterns

## Cons
- State file management is a common source of real incidents (drift, corruption, merge conflicts)
- HCL has a learning curve distinct from general-purpose programming languages
- Destructive changes can happen silently if state and reality drift apart

## Best For
- Teams managing infrastructure across multiple cloud providers with one consistent workflow

## Real Examples
- Widely used to provision infrastructure at companies of every size, from startups to Uber and Slack

## Use Cases
- Provisioning cloud infrastructure (VMs, networks, databases) as version-controlled code
- Reproducing identical environments across dev, staging, and production
