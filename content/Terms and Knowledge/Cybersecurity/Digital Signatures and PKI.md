---
tags: [term, security, cryptography]
category: Cryptography
---

# Digital Signatures and PKI

**Definition:** Digital Signatures provide message authenticity and non-repudiation; Public Key Infrastructure (PKI) manages trusted Digital Certificates issued by Certificate Authorities (CAs).

## How It Works
- Digital Signature: Sender hashes message payload and encrypts hash with Private Key; Receiver decrypts hash with Sender's Public Key and compares with computed payload hash
- PKI Certificate Chain: CA validates domain owner identity and signs certificate with CA private key; client trusts root CA public certificates preinstalled in OS/browser

## Why It Matters
- Prevents Man-In-The-Middle (MITM) attacks and software tampering

## Common Pitfalls
- Ignoring SSL/TLS certificate chain validation errors in custom API client code (`verify=False`)

## Related Terms
- [[Symmetric and Asymmetric Encryption]]
- [[Zero Trust Architecture]]

## Example
Code signing certificates ensure software updates from Apple/Microsoft are genuine and untampered.
