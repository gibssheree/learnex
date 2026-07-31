---
tags: [platform, devops, iac]
category: IaC & Config Management
---

# Ansible

**Definition:** A configuration management and automation tool that connects to servers over SSH and runs tasks defined in simple YAML files, no agent installation required.

## Core Services & Concepts
- **Playbooks** — YAML files describing a sequence of tasks to run on target machines
- **Agentless architecture** — connects over SSH, unlike tools that need a persistent agent installed on every managed machine
- **Idempotency** — [[Idempotency]], playbooks are designed to be safely re-run without causing duplicate effects

## Pros
- No agents to install or maintain on target machines
- Simple, readable YAML syntax, lower learning curve than some alternatives
- Good for both one-off tasks and ongoing configuration management

## Cons
- Can get slow at very large scale due to SSH-based execution
- Less suited to defining cloud infrastructure itself compared to Terraform, better at configuring servers after they exist

## Best For
- Configuring and maintaining servers after they've been provisioned, patching, installing software, managing users

## Real Examples
- Widely used alongside Terraform: Terraform provisions the servers, Ansible configures what runs on them

## Use Cases
- Server configuration management
- Application deployment automation
- Patch management across a fleet of servers
