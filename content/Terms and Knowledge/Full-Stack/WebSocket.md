---
tags: [term, fullstack, api, realtime]
category: API & Networking
---

# WebSocket

**Definition:** A protocol that keeps a persistent, two-way connection open between client and server for real-time communication.

## How It Works
- Starts as a normal HTTP request, then "upgrades" to a long-lived connection
- Both sides can push messages through it at any time, no need to ask first
- The client sends an HTTP `GET` with an `Upgrade: websocket` header and a random `Sec-WebSocket-Key`; the server responds `101 Switching Protocols` with a hashed acknowledgment key, and from that point the TCP socket stops speaking HTTP and starts speaking the WebSocket framing protocol
- After the handshake, data flows as discrete "frames" — small binary or text messages — with no per-message HTTP overhead (no headers, no new connection, no TLS renegotiation)
- Either side can send a `ping` frame; the other side must reply with `pong`, which is how libraries detect a dead connection before the OS-level TCP timeout would

## Why It Matters
- Needed for real-time features: chat, live notifications, multiplayer games
- Removes the latency and overhead of polling, no repeated HTTP handshakes, no wasted requests when nothing has changed, and updates arrive the instant the server has them instead of on the next poll interval
- A single connection can carry many logical "channels" of messages (e.g. a chat app multiplexing several chat rooms, a stock app multiplexing many tickers) over one socket instead of needing one connection per stream

## Common Pitfalls
- Doesn't scale like stateless HTTP — you must manage many open connections, often needing shared pub/sub (e.g. Redis) across multiple servers
- Assuming a load balancer will route follow-up requests from the same client to the same backend server automatically — WebSocket connections need either sticky sessions or a shared message bus, since a message sent to a user connected to server A won't reach them if your backend tries to deliver it from server B
- Not handling reconnection: a dropped WiFi connection, a laptop waking from sleep, or a server restart silently kills the socket, and naive clients just stop receiving updates with no error shown to the user
- Forgetting the connection is stateful, unlike a REST API where auth is re-checked on every request, a WebSocket typically authenticates once at connection time; if a user's permissions change or their session expires, the server has to actively track and close the now-invalid connection
- Leaving idle connections open indefinitely without heartbeat/ping-pong, letting intermediary proxies, NAT gateways, or corporate firewalls silently drop the TCP connection without either side noticing until a message fails to arrive
- Not backpressure-handling a slow consumer, if the server pushes messages faster than a client can process (or than a client's network can carry), the buffer grows unbounded unless you explicitly throttle or drop

## Under the Hood
- The protocol is defined in RFC 6455. Frames have an opcode indicating type: `0x1` text, `0x2` binary, `0x8` close, `0x9` ping, `0xA` pong
- Client-to-server frames must be masked (XORed with a random key sent in the frame) specifically to prevent cache-poisoning attacks against misconfigured proxies that don't understand WebSocket framing; server-to-client frames are not masked
- A single logical message can be split across multiple frames (fragmentation), useful for streaming large payloads without buffering the whole thing in memory first
- Because the handshake starts as HTTP, WebSockets can reuse the same port (typically 443 for `wss://`) as regular HTTPS traffic and pass through most standard web infrastructure, unlike raw TCP sockets which often get blocked by firewalls

## Variants
- **Socket.IO** — a library (not the raw protocol) built on top of WebSocket that adds automatic reconnection, room/namespace abstractions, and a fallback to HTTP long-polling for environments where WebSocket is blocked. Not wire-compatible with plain WebSocket clients
- **Server-Sent Events (SSE)** — a simpler, one-directional alternative (server to client only) over plain HTTP, with automatic reconnection built into the browser's `EventSource` API. No client-to-server push, but far simpler infrastructure since it's just a long-lived HTTP response
- **WebTransport** — a newer, HTTP/3-based protocol supporting multiple independent streams and unreliable (UDP-like) delivery, aimed at use cases like game netcode where WebSocket's strict ordering and reliability are unnecessary overhead

## Comparison
| | WebSocket | Server-Sent Events | HTTP Long Polling | Plain Polling |
|---|---|---|---|---|
| Direction | Bidirectional | Server to client only | Bidirectional (via repeated requests) | Bidirectional (via repeated requests) |
| Connection | One persistent connection | One persistent HTTP connection | New request per message (held open) | New request on an interval |
| Latency | Lowest | Low | Low, but overhead per message | Bound by poll interval |
| Browser reconnect | Manual (library-assisted) | Automatic (`EventSource`) | Manual | N/A, stateless |
| Infra complexity | Higher (sticky sessions/pub-sub) | Moderate | Moderate | Low |

## Code Example
```js
// Client
const socket = new WebSocket('wss://chat.example.com/room/42');

socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'join', user: 'alice' }));
});

socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  console.log('Received:', msg);
});

socket.addEventListener('close', (event) => {
  console.log('Disconnected', event.code, event.reason);
  // real apps reconnect here with backoff
});
```

```js
// Server (Node.js, 'ws' library)
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Broadcast to every other connected client
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(data);
      }
    });
  });
});
```

## Code Example: Reconnection with Backoff
```js
function connect(url) {
  let attempt = 0;
  let socket;

  function open() {
    socket = new WebSocket(url);

    socket.addEventListener('open', () => {
      attempt = 0; // reset backoff once we're connected again
    });

    socket.addEventListener('close', () => {
      const delay = Math.min(1000 * 2 ** attempt, 30_000); // cap at 30s
      attempt++;
      setTimeout(open, delay);
    });

    socket.addEventListener('message', handleMessage);
  }

  open();
  return () => socket.close(); // caller can tear down the connection
}
```
Exponential backoff prevents a client from hammering a recovering server with immediate reconnect attempts, and capping the delay keeps reconnection from taking unreasonably long after an extended outage.

## Scaling Considerations
- **Sticky sessions** — configure the load balancer to route all traffic from a given client to the same backend instance for the life of the connection, since a WebSocket can't be transparently handed off between servers mid-connection
- **Shared pub/sub backbone** — when a message needs to reach a user connected to a *different* server instance than the one handling the event, servers publish to a shared bus (Redis pub/sub, NATS, a [[Message Queue]]) that every instance subscribes to, so any server can deliver to any connected client
- **Connection limits** — each open WebSocket holds a file descriptor and some memory on the server; a single Node.js process can typically hold tens of thousands of idle connections, but this is a capacity planning input most REST-only backends never have to think about

## Best Practices
- Implement reconnection with exponential backoff on the client, don't hammer the server with immediate retries after a drop
- Use ping/pong heartbeats to detect and clean up dead connections proactively, rather than waiting for a write to fail
- Authenticate at connection time (e.g. a short-lived token in the connection URL or first message) and re-validate or force-disconnect if that authorization changes mid-session
- Keep messages small and versioned (`{ type, version, payload }`) so client and server can evolve the protocol without breaking older clients
- Fall back gracefully (to SSE or polling) for environments where WebSocket is blocked by a restrictive proxy or firewall

## FAQ
**Is WebSocket built on TCP or UDP?** TCP. That gives ordered, reliable delivery, but also means head-of-line blocking is possible, one delayed/lost packet blocks everything queued behind it, which is part of why WebTransport (built on QUIC/UDP) exists for latency-sensitive use cases like gaming.

**Can I use WebSocket with a [[REST API]]?** Yes, they're usually complementary, not competing. A typical app uses REST for standard CRUD operations and a WebSocket connection just for the subset of features that need real-time push, like live notifications or presence.

**Does WebSocket work through HTTPS/firewalls?** `wss://` (WebSocket Secure) runs over TLS on port 443 by default, the same port as HTTPS, so it passes through most firewalls and proxies that already allow standard web traffic without extra configuration.

**How does authentication work over a persistent connection?** Most apps pass a token as a query parameter or in the first message right after `open` (browsers can't set custom headers on the initial WebSocket handshake request). The server validates it once, associates the connection with that user, and from then on treats every message on that socket as coming from an already-authenticated identity, unlike REST where each request typically re-sends and re-validates credentials.

**What happens to in-flight messages if the connection drops?** They're lost, WebSocket gives you no built-in message durability or "at least once" delivery guarantee. Applications that need that guarantee build their own acknowledgment layer on top (client sends a message ID, server ACKs it, client resends unacknowledged messages after reconnecting) or fall back to a message queue for anything that can't tolerate loss.

## Real-World Example
Multiplayer collaborative tools (a shared whiteboard, a collaborative document editor) rely on WebSocket to broadcast every cursor movement and edit to all connected participants with sub-100ms latency. Each client opens one WebSocket connection to a session server; when one user types, the change is sent as a small message, the server merges it (often using an operational-transform or CRDT algorithm to handle concurrent edits) and rebroadcasts the merged result to every other connected client's socket, all without any client ever polling for updates.

## Related Terms
- [[REST API]]
- [[Message Queue]]
- [[Load Balancer]]
- [[Idempotency]]
- [[State Management]]

On the client, incoming WebSocket messages typically get funneled straight into the app's state layer, see [[State Management]], so a UI component re-renders the instant a message arrives rather than needing to poll a store on a timer.

## Example
A live chat app where messages appear instantly without refreshing the page. Behind the scenes, the browser opens one `wss://` connection when the chat window loads; every message a user sends is pushed over that socket to the server, fanned out to every other participant's open socket (via a Redis pub/sub channel if they're connected to a different server), and appears in their chat window within milliseconds, no polling, no page reload.
