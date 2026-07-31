---
tags: [term, networks, data-link]
category: Internet Layer & Routing
subcategory: Data Link Layer
---

# ARP and MAC Address

**Definition:** Media Access Control (MAC) address is a permanent 48-bit hardware identifier burned into network interfaces; Address Resolution Protocol (ARP) translates Layer 3 IP addresses into Layer 2 MAC addresses on a local network.

## How It Works
- Host sends broadcast ARP Request frame: 'Who has IP 192.168.1.5?'
- Target host responds with ARP Reply: '192.168.1.5 is at MAC AA:BB:CC:DD:EE:FF'
- Result cached in host ARP Table to avoid future broadcast overhead

## Why It Matters
- Bridges logical IP routing with physical Ethernet switch frame delivery

## Common Pitfalls
- ARP Spoofing: attacker broadcasts fake ARP replies to intercept local subnet traffic (Man-In-The-Middle)

## Related Terms
- [[OSI Model]]
- [[IP Addressing and Subnetting]]

## Example
Your laptop uses ARP to look up the MAC address of your home Wi-Fi router before sending internet packets.
