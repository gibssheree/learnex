---
tags: [term, legal, compliance, healthcare]
category: Compliance Standards
---

# HIPAA

**Definition:** The Health Insurance Portability and Accountability Act, a US law setting strict requirements for how healthcare-related personal data (PHI, Protected Health Information) must be handled and protected.

## How It Works
- Covers "covered entities" (healthcare providers, insurers) and their "business associates" (any vendor that touches PHI on their behalf, including most software vendors)
- Requires specific technical safeguards: encryption, access controls, audit logs, and a documented breach notification process
- A vendor handling PHI typically must sign a Business Associate Agreement (BAA) with the healthcare company they serve

## Why It Matters
- Any software product touching health data in the US needs HIPAA-compliant infrastructure, this shapes architecture decisions (which cloud services are even usable) from day one

## Common Pitfalls
- Choosing a cloud service or third-party API without checking whether it will sign a BAA, discovering the incompatibility only after the product is already built
- Assuming "we encrypt data" alone satisfies HIPAA, the requirements cover access controls, audit logging, and breach response too, not just encryption

## Related Terms
- [[GDPR]]
- [[SOC 2]]

## Example
A telehealth startup must use HIPAA-eligible cloud services (like AWS services covered under a signed BAA) rather than arbitrary consumer-grade APIs for anything touching patient data.
