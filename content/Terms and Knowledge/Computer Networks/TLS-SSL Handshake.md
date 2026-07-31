---
tags: [term, networks, security]
category: Network Security
---

# TLS-SSL Handshake

**Definition:** The cryptographic protocol handshake that negotiates authentication, encryption algorithms, and session keys prior to secure data transfer (HTTPS).

## How It Works
- Client Hello: transmits supported TLS version, cipher suites, and random number
- Server Hello & Certificate: sends chosen cipher suite, server random number, and digital certificate (verified via CA)
- Key Exchange: uses Diffie-Hellman / RSA to derive a shared symmetric Session Key without transmitting keys openly
- Encrypted Communication: subsequent application data encrypted using fast symmetric encryption (AES)

## Why It Matters
- Secures confidentiality, data integrity, and host authenticity across untrusted public networks

## Common Pitfalls
- Expired or self-signed certificates trigger browser security warnings and block API clients

## Related Terms
- [[TCP Protocol]]
- [[OSI Model]]

## Example
Browsing to `https://bank.com` runs a TLS handshake to establish an encrypted session indicator (lock icon).
