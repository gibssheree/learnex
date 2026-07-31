---
tags: [term, cloud, devops]
category: Infrastructure & Automation
subcategory: Infrastructure Automation
---

# Infrastructure as Code (IaC)

**Definition:** The management and provisioning of cloud infrastructure resources through machine-readable definition files rather than manual web console clicks.

## How It Works
- Declarative IaC (Terraform, CloudFormation): specify desired end-state; tool calculates resource diffs and provisions changes
- Imperative IaC (Ansible, bash scripts): specify explicit step-by-step commands to achieve state
- State Files: tracks real-world cloud resource mapping to configuration code

## Why It Matters
- Ensures repeatable, version-controlled, auditable cloud environments and eliminates manual configuration drift

## Common Pitfalls
- Committing unencrypted IaC state files containing plaintext database passwords to version control

## Related Terms
- [[Container Orchestration and Kubernetes]]
- [[Observability and Monitoring]]

## Example
Writing a `main.tf` file to spin up AWS VPC subnets and EC2 instances via `terraform apply`.
