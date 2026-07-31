---
tags: [term, fullstack, devops, infrastructure]
category: DevOps & Delivery
---

# DNS

**Definition:** The system that translates human-readable domain names, like google.com, into IP addresses computers use to find each other.

## How It Works
- Your browser asks a DNS resolver
- The resolver checks a hierarchy of servers until it finds the IP address tied to that domain name

## Why It Matters
- Every deployment involves pointing a domain at your server; misconfigured DNS is a classic "why isn't my site live yet" problem

## Common Pitfalls
- Not understanding DNS propagation delay — changes can take minutes to hours to take effect everywhere

## Related Terms
- [[Reverse Proxy]]
- [[SSL-TLS|SSL/TLS (HTTPS)]]

## Example
Pointing `yourapp.com`'s A record at your server's IP address, or a CNAME at your hosting provider.
