---
tags: [term, security, architecture]
category: Security Architecture
subcategory: Security Models
---

# Zero Trust Architecture

**Definition:** A enterprise cybersecurity strategic framework based on the principle 'Never Trust, Always Verify' across network boundaries.

## How It Works
- Eliminates implicit trust based on network location (being inside corporate internal network gives zero automatic permissions)
- Continuous Authentication & Authorization: validates user identity, device health, and context for every request
- Principle of Least Privilege (PoLP): grants minimum necessary permissions strictly required for the specific task

## Why It Matters
- Protects organizations against lateral movement when attackers compromise perimeter network firewalls

## Common Pitfalls
- Relying solely on legacy VPN perimeters for remote employee access

## Related Terms
- [[Identity and Access Management (IAM)]]
- [[Threat Modeling (STRIDE)]]

## Example
Google BeyondCorp implementation requiring device certificates and multi-factor auth for every internal microservice access.
