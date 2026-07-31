---
tags: [term, networks, routing]
category: Internet Layer & Routing
subcategory: Internet Protocol
---

# NAT

**Definition:** Network Address Translation (NAT) maps private local IP addresses to a public IP address before forwarding packets to the public internet.

## How It Works
- NAPT (Port Address Translation): Router rewrites internal source `Private_IP:Private_Port` to `Public_IP:Router_Assigned_Port`
- Maintains NAT translation table to map incoming internet replies back to the correct internal host device

## Why It Matters
- Conserved IPv4 space by allowing thousands of local devices to share a single public IP, providing implicit inbound firewall security

## Common Pitfalls
- Complicates direct peer-to-peer (P2P) connections (requires STUN/TURN/ICE traversal servers)

## Related Terms
- [[IP Addressing and Subnetting]]
- [[Sockets and Socket Programming]]

## Example
All smartphones and laptops on your home Wi-Fi share one public IP address assigned by your ISP via your home NAT router.
