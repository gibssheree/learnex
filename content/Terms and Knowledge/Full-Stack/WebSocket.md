---
tags: [term, fullstack, api, realtime]
category: API & Networking
---

# WebSocket

**Definition:** A protocol that keeps a persistent, two-way connection open between client and server for real-time communication.

## How It Works
- Starts as a normal HTTP request, then "upgrades" to a long-lived connection
- Both sides can push messages through it at any time, no need to ask first

## Why It Matters
- Needed for real-time features: chat, live notifications, multiplayer games

## Common Pitfalls
- Doesn't scale like stateless HTTP — you must manage many open connections, often needing shared pub/sub (e.g. Redis) across multiple servers

## Related Terms
- [[REST API]]

## Example
A live chat app where messages appear instantly without refreshing the page.
