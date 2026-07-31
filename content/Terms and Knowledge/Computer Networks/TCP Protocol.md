---
tags: [term, networks, transport]
category: Transport Layer
---

# TCP Protocol

**Definition:** Transmission Control Protocol (TCP) is a connection-oriented, reliable transport protocol that guarantees ordered, error-checked delivery of byte streams.

## How It Works
- Connection Establishment: 3-Way Handshake (SYN -> SYN-ACK -> ACK)
- Reliable Delivery: Sequence numbers, Acknowledgments (ACKs), Retransmission Timers
- Flow Control: Sliding Window mechanism prevents sender from overwhelming receiver buffer
- Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit (prevents network collapse)
- Teardown: 4-Way Handshake (FIN -> ACK -> FIN -> ACK)

## Why It Matters
- Powers web browsing (HTTP), email (SMTP), file transfers (FTP), and database connections where zero data loss is strictly required

## Common Pitfalls
- Head-of-Line (HoL) Blocking: a single dropped TCP segment blocks all subsequent bytes until retransmitted
- Connection setup latency (1.5 RTT for TCP handshake + TLS negotiation)

## Related Terms
- [[UDP Protocol]]
- [[Sockets and Socket Programming]]
- [[TLS-SSL Handshake]]

## Example
HTTPS web traffic uses TCP to ensure no HTML or JS files arrive corrupted or out of order.
