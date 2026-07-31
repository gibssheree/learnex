---
tags: [term, networks, transport]
category: Transport Layer
---

# UDP Protocol

**Definition:** User Datagram Protocol (UDP) is a lightweight, connectionless transport protocol that sends datagrams without state tracking, connection setup, or delivery guarantees.

## How It Works
- No connection handshake: data sent immediately to target IP:Port
- No ACKs, retransmissions, ordering, or flow control (minimal 8-byte packet header overhead)
- Applications handle loss/reordering at application layer if needed

## Why It Matters
- Provides lowest possible latency for real-time applications (Voice/Video, Online Gaming, DNS, HTTP/3 QUIC)

## Common Pitfalls
- Vulnerable to UDP amplification reflection attacks in DDoS scenarios due to spoofable source IP addresses

## Related Terms
- [[TCP Protocol]]
- [[Sockets and Socket Programming]]

## Example
DNS queries and video calls use UDP because low latency is prioritized over retransmitting lost video frames.
