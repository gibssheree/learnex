---
tags: [term, security, auth]
category: Security Architecture
subcategory: Identity & Access
---

# Identity and Access Management (IAM)

**Definition:** Framework of policies and technologies ensuring that the right entities have appropriate access to technology resources.

## How It Works
- Authentication (AuthN): verifying identity ('Who are you?') via passwords, MFA, SAML, OAuth2
- Authorization (AuthZ): verifying permissions ('What are you allowed to do?') via Role-Based Access Control (RBAC) or Attribute-Based Access Control (ABAC)
- Least Privilege Policy: users/roles granted minimum required granular permissions

## Why It Matters
- Central pillar of cloud platform security and corporate access management

## Common Pitfalls
- Granting broad wildcard permissions (e.g., `s3:*` or `admin`) to application service roles

## Related Terms
- [[Zero Trust Architecture]]

## Example
AWS IAM role permitting a lambda function to read strictly from `s3://my-bucket/data/*` and nowhere else.
