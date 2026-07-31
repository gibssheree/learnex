---
tags: [term, security, architecture]
category: Security Architecture
subcategory: Security Models
---

# Threat Modeling (STRIDE)

**Definition:** A systematic approach for identifying, quantifying, and mitigating potential security threats during system design using the STRIDE framework.

## How It Works
- Spoofing Identity: impersonating another user/system -> mitigate via Auth
- Tampering with Data: unauthorized modification -> mitigate via Signatures/Hashes
- Repudiation: denying an action -> mitigate via Immutable Audit Logs
- Information Disclosure: leaking data -> mitigate via Encryption
- Denial of Service: crashing system -> mitigate via Rate Limiting/Redundancy
- Elevation of Privilege: gaining unauthorized permissions -> mitigate via Authorization/PoLP

## Why It Matters
- Fixing security flaws during architecture design costs 100x less than patching breaches post-deployment

## Common Pitfalls
- Performing threat modeling as a one-time compliance checkbox instead of an ongoing engineering practice

## Related Terms
- [[Zero Trust Architecture]]
- [[OWASP Top 10 Security Risks]]

## Example
Analyzing an online payment pipeline with STRIDE to ensure credit card numbers cannot be leaked or tampered with.
