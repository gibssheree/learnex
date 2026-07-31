---
tags: [term, networks, architecture]
category: Network Architecture
subcategory: Network Models & Layers
---

# OSI Model

**Definition:** The Open Systems Interconnection (OSI) model is a conceptual 7-layer framework that standardizes network communication functions regardless of underlying technology.

## How It Works
- Layer 7 (Application): End-user protocols (HTTP, FTP, SMTP, DNS)
- Layer 6 (Presentation): Formatting, encryption, compression (TLS/SSL, JSON)
- Layer 5 (Session): Manages sessions between applications (RPC, NetBIOS)
- Layer 4 (Transport): End-to-end delivery, segmentation, flow control (TCP, UDP)
- Layer 3 (Network): Logical routing and IP addressing across networks (IP, ICMP, BGP)
- Layer 2 (Data Link): Physical MAC addressing and framing on same local link (Ethernet, Wi-Fi)
- Layer 1 (Physical): Bitstream transmission over physical medium (Cables, Fiber, Radio signals)

## Why It Matters
- Provides a universally accepted diagnostic mental model for isolating network issues and protocol engineering

## Common Pitfalls
- Confusing OSI theoretical layers with TCP/IP practical implementation layers (OSI is a reference model, TCP/IP is the actual implemented internet protocol suite)

## Related Terms
- [[TCP-IP Suite]]
- [[TCP Protocol]]
- [[IP Addressing and Subnetting]]

## Example
A router operates primarily at Layer 3 (Network), a switch operates at Layer 2 (Data Link), and a web browser operates at Layer 7 (Application).
