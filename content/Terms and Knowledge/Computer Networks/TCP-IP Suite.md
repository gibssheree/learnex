---
tags: [term, networks, architecture]
category: Network Architecture
subcategory: Network Models & Layers
---

# TCP-IP Suite

**Definition:** The practical 4-layer protocol stack that powers the modern global Internet.

## How It Works
- Application Layer: Combines OSI Layers 5-7 protocols (HTTP, SSH, DNS)
- Transport Layer: Manages host-to-host process communication (TCP, UDP)
- Internet Layer: Packages data into IP packets and routes them across networks (IPv4, IPv6, ICMP)
- Network Access Layer: Translates packets to physical network frames (Ethernet, Wi-Fi MAC)

## Why It Matters
- Defines the real-world operational architecture of internet data exchange

## Common Pitfalls
- Assuming lower network layers understand application context (Encapsulation hides higher-layer payloads)

## Related Terms
- [[OSI Model]]
- [[TCP Protocol]]
- [[UDP Protocol]]

## Example
Sending an HTTP GET request encapsulates data down through TCP -> IP -> Ethernet frames.
