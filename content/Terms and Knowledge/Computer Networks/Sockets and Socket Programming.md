---
tags: [term, networks, programming]
category: Transport Layer
---

# Sockets and Socket Programming

**Definition:** A socket is a software abstraction representing an endpoint for communication over a network defined by an IP address and Port number tuple.

## How It Works
- Server flow: `socket()` -> `bind(IP:Port)` -> `listen()` -> `accept()`
- Client flow: `socket()` -> `connect(Server_IP:Port)`
- Data transfer: `send()` / `recv()` system calls transport bytes across kernel TCP/UDP buffers

## Why It Matters
- Forms the programmatic foundation for all network applications, HTTP servers, and peer-to-peer protocols

## Common Pitfalls
- Failing to close sockets causes socket leaks and file descriptor exhaustion (`EMFILE` error)

## Related Terms
- [[TCP Protocol]]
- [[UDP Protocol]]
- [[System Call]]

## Example
Creating a socket on `127.0.0.1:8080` allows a backend web server to accept incoming browser HTTP connections.
