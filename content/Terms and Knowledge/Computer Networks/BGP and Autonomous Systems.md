---
tags: [term, networks, routing]
category: Internet Layer & Routing
subcategory: Internet Routing
---

# BGP and Autonomous Systems

**Definition:** Border Gateway Protocol (BGP) is the standardized Exterior Gateway Protocol that routes data between independent Autonomous Systems (AS) across the global Internet.

## How It Works
- Autonomous Systems (AS): large networks managed by ISPs, universities, or tech giants (identified by ASN numbers)
- BGP is a Path-Vector routing protocol where routers exchange reachability paths to network IP prefixes
- Uses policies (cost, latency, business peering agreements) rather than shortest hop distance alone

## Why It Matters
- BGP is literally 'the postal system of the internet' — without it, global internet routing collapses

## Common Pitfalls
- BGP Hijacking: malicious or accidental misconfiguration announcing ownership of foreign IP ranges, rerouting global traffic

## Related Terms
- [[IP Addressing and Subnetting]]
- [[OSI Model]]

## Example
When Cloudflare or AWS routes global user traffic to the nearest data center, BGP path announcements govern that routing.
