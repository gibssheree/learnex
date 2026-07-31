---
tags: [term, fullstack, devops, infrastructure]
category: DevOps & Delivery
---

# Reverse Proxy

**Definition:** A server that sits in front of your backend, forwarding client requests to it and returning the response back to the client.

## How It Works
- Client talks to the proxy (e.g. Nginx)
- The proxy forwards the request to the actual app server, hiding the app server's details from the outside

## Why It Matters
- Used for load balancing, SSL termination, caching, and hiding internal architecture

## Common Pitfalls
- Misconfigured proxy headers, like forgetting `X-Forwarded-For`, breaking things like rate limiting or logging that rely on the real client IP

## Related Terms
- [[Load Balancer]]
- [[SSL-TLS|SSL/TLS (HTTPS)]]

## Example
Nginx sitting in front of a Node.js app, handling HTTPS and forwarding plain HTTP to the app internally.
