---
tags: [moc, term, legal]
---

# Legal and Compliance for Tech MOC

9 terms across 4 categories. Nothing here appears anywhere else in the vault — this is the layer that decides what you're actually allowed to build, ship, and depend on.

## Software Licenses
- [[MIT License]]
- [[GPL License]]
- [[Apache License 2.0]]

## Data Privacy Law
- [[GDPR]]
- [[CCPA]]

## Compliance Standards
- [[SOC 2]]
- [[HIPAA]]

## Legal Basics
- [[Terms of Service and Privacy Policy]]
- [[Software Patents and Intellectual Property]]

---

## How to use this
Check the licenses section before adding any dependency to a commercial project. Check the privacy law and compliance sections before your product touches real user data, especially health or EU/California data — retrofitting compliance after launch is far more expensive than building it in from the start.

## Suggested order if starting from zero
1. **MIT License → GPL License → Apache License 2.0** — you already depend on dozens of licensed packages whether you've read this or not
2. **Terms of Service and Privacy Policy** — the first legal documents any real product needs
3. **GDPR → CCPA** — the two privacy laws with the broadest practical reach
4. **SOC 2 → HIPAA** — once you're selling to enterprises or touching health data
5. **Software Patents and Intellectual Property** — background knowledge, useful but rarely urgent
