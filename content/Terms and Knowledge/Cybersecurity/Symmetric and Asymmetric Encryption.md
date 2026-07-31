---
tags: [term, security, cryptography]
category: Cryptography
---

# Symmetric and Asymmetric Encryption

**Definition:** Symmetric encryption uses a single shared secret key for encryption and decryption; Asymmetric encryption uses a public/private key pair.

## How It Works
- Symmetric (AES-256, ChaCha20): fast, highly efficient for large payloads. Both parties must securely exchange the secret key beforehand
- Asymmetric (RSA, ECC, Diffie-Hellman): slow computational cost. Public Key encrypts data; Private Key decrypts data (or signs data)
- Hybrid Cryptography: Asymmetric encryption securely exchanges a symmetric session key, which encrypts actual data traffic

## Why It Matters
- Forms the cryptographic backbone for HTTPS, SSH, disk encryption, and secure API communications

## Common Pitfalls
- Hardcoding secret symmetric keys in client-side code or Git repositories

## Related Terms
- [[Cryptographic Hash Functions]]
- [[Digital Signatures and PKI]]

## Example
HTTPS uses RSA/ECC to exchange a shared key during handshake, then switches to AES-GCM symmetric encryption for streaming web page content.
