---
tags: [term, fullstack, api, microservices]
category: API & Networking
---

# gRPC

**Definition:** A high-performance RPC (remote procedure call) framework using binary protocol buffers instead of JSON.

## How It Works
- You define service methods and message types in a `.proto` file
- gRPC generates client and server code in multiple languages from that one definition

## Why It Matters
- Much faster and smaller payloads than REST/JSON, common for internal microservice-to-microservice calls

## Common Pitfalls
- Not browser-friendly out of the box, needs gRPC-Web or a proxy
- Harder to debug than plain JSON since the wire format is binary

## Related Terms
- [[REST API]]
- [[Microservices vs Monolith]]

## Example
An order service and an inventory service talking over gRPC internally for speed.
