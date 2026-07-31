---
tags: [term, cloud, networking]
category: Cloud Networking
---

# Virtual Private Cloud (VPC) and Subnets

**Definition:** A logically isolated section of a public cloud environment where you can launch resources in a virtual network that you define.

## How It Works
- You define an IP address range (CIDR block) for the VPC, then carve it into smaller Subnets.
- Public Subnets have direct routes to the Internet Gateway (IGW) for external access.
- Private Subnets have no direct internet route; instances inside must route outbound traffic through a NAT Gateway located in a public subnet.
- Security Groups and Network Access Control Lists (NACLs) act as virtual firewalls to control inbound and outbound traffic at the instance and subnet levels.

## Why It Matters
- Forms the foundational security boundary for cloud infrastructure, preventing internal databases and backend services from being exposed directly to the public internet.

## Common Pitfalls
- Placing database instances in public subnets with open security groups, exposing them to automated internet scanning and brute-force attacks.

## Related Terms
- [[IP Addressing and Subnetting]]
- [[NAT]]
- [[Zero Trust Architecture]]

## Example
AWS VPC allows you to place your EC2 web servers in a public subnet and your RDS databases in a private subnet, tightly controlling the traffic flow between them.
