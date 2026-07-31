---
tags: [term, networks, routing]
category: Internet Layer & Routing
subcategory: Internet Protocol
---

# IP Addressing and Subnetting

**Definition:** The logical addressing system (IPv4/IPv6) and network partitioning technique (CIDR) used to uniquely identify and route traffic to hosts on a network.

## How It Works
- IPv4: 32-bit address (e.g., `192.168.1.1`); IPv6: 128-bit hexadecimal address (e.g., `2001:db8::1`)
- Subnet Mask & CIDR Notation: splits address into Network ID and Host ID (e.g., `/24` prefix means first 24 bits represent the network)
- Routers use Subnet Masks to determine if target IP is local or requires upstream routing

## Why It Matters
- Enables global internet routing, network isolation, and efficient IP allocation

## Common Pitfalls
- Over-allocating subnet ranges leading to IP address exhaustion
- Misconfiguring subnet masks causing hosts to be unreachable

## Related Terms
- [[OSI Model]]
- [[BGP and Autonomous Systems]]
- [[NAT]]

## Example
A CIDR block of `10.0.0.0/16` allows up to 65,534 usable host IP addresses on a private VPC network.
