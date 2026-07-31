---
tags: [term, os, networking]
category: Kernel & I-O Subsystems
subcategory: I-O Systems
---

# I-O Multiplexing

**Definition:** A mechanism allowing a single thread to monitor multiple file descriptors (sockets) concurrently to determine which ones are ready for I/O without blocking on any single one.

## How It Works
- `select()`: earliest POSIX standard, O(N) linear scan over a monitored descriptor set on every call, and is limited to a small fixed maximum number of descriptors (`FD_SETSIZE`, often 1024)
- `poll()`: removes the fixed descriptor-count limit of `select()` but is still O(N) per call since the kernel must re-scan the entire passed-in list every time
- `epoll` (Linux) / `kqueue` (macOS, BSD): O(1) amortized event-driven notification — the kernel maintains interest registrations persistently and only returns descriptors that actually became ready, avoiding the repeated full-list rescan
- Two readiness-notification modes: level-triggered (keeps notifying as long as data remains unread — safer default, used by `select`/`poll`/default `epoll`) and edge-triggered (notifies only once when state transitions to ready — `EPOLLET` in epoll — requires draining the socket completely in a loop or risk missing later data)
- Enables the Event-Driven Non-Blocking I/O architecture: a single-threaded event loop repeatedly calls `epoll_wait()`, dispatches a callback/handler for each ready descriptor, and returns to waiting — no thread-per-connection needed

## Why It Matters
- Solves the C10K problem (handling 10,000+ concurrent network connections on a server) by replacing thread-per-connection models — which exhaust memory and context-switch overhead at scale — with a small number of threads multiplexing many sockets each
- Directly underpins the async I/O model in most modern high-throughput servers, letting a single OS thread service thousands of idle-most-of-the-time connections cheaply
- The shift from `select`/`poll` to `epoll`/`kqueue` was a major turning point in server scalability in the 2000s, since O(1) readiness notification is what made single-digit-thread servers handling tens of thousands of connections practical

## Common Pitfalls
- Blocking the event loop thread with CPU-heavy computation halts socket event processing for every connection multiplexed on that thread — one slow synchronous handler can freeze an entire server's I/O
- Using edge-triggered mode without draining a socket in a loop (reading until `EAGAIN`/`EWOULDBLOCK`) causes the event loop to silently stop receiving further notifications for that descriptor, even though more data is waiting
- Registering a file descriptor with a multiplexer and forgetting to unregister/close it on connection teardown leaks kernel-side tracking resources over the process's lifetime
- Assuming `epoll`/`kqueue` behavior is portable — code relying on Linux `epoll` semantics doesn't run unmodified on macOS/BSD (`kqueue`) or Windows (IOCP), requiring an abstraction layer (like libuv) for cross-platform I/O multiplexing

## Related Terms
- [[System Call]]
- [[Process and Thread]]
- [[Sockets and Socket Programming]]
- [[Concurrency and Race Condition]]

## Example
Node.js libuv, Nginx, and Redis rely on `epoll` / `kqueue` for high-throughput non-blocking I/O.
```
epfd = epoll_create1(0)
epoll_ctl(epfd, EPOLL_CTL_ADD, socket_fd, EPOLLIN)
while true:
    events = epoll_wait(epfd, max_events=64, timeout=-1)
    for fd in events:
        handle_ready_socket(fd)   # only sockets with actual data trigger work
```
A server multiplexing 50,000 mostly-idle WebSocket connections with `epoll` wakes up only for the handful that actually have data ready, instead of a `select()`-based server that would have to re-scan all 50,000 descriptors on every loop iteration.
