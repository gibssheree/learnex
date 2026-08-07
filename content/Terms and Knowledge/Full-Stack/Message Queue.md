---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Message Queue

**Definition:** A system that lets services send messages to each other asynchronously, decoupled from needing an immediate response.

## How It Works
- A producer pushes a message onto the queue
- A consumer picks it up and processes it whenever it's ready
- The queue itself is a durable buffer — usually a separate broker process (RabbitMQ, Redis, a managed service like SQS) sitting between producer and consumer
- Producer and consumer never talk directly; neither needs to know the other's address, uptime, or processing speed
- Most brokers support **acknowledgement**: a consumer explicitly confirms ("ack") it finished processing before the broker deletes the message; if the consumer crashes first, the message goes back on the queue for someone else to retry
- Ordering guarantees vary by broker: some (like a single SQS standard queue) don't guarantee strict order, others (SQS FIFO, Kafka within a partition) do

## Under the Hood
- **At-least-once delivery** is the norm — the broker would rather redeliver a message than lose it, which means consumers must be written to handle duplicates (idempotency)
- **Visibility timeout / lock**: when a consumer pulls a message, the broker hides it from other consumers for a configurable window; if the consumer doesn't ack in time (crash, hang), the message becomes visible again and gets redelivered
- **Dead-letter queue (DLQ)**: after a message fails processing N times, it's routed to a separate queue instead of retried forever, so poison messages don't block the pipeline and can be inspected manually
- **Backpressure**: if consumers fall behind, the queue depth grows instead of overwhelming the consumer or crashing the producer — the queue absorbs the burst
- Some brokers (Kafka) are really a distributed, partitioned, replicated commit log rather than a traditional "queue" — consumers track their own offset and can replay old messages, unlike a queue where a consumed message is gone

## Why It Matters
- Lets slow or unreliable tasks (sending emails, processing videos) happen in the background without blocking the user's request
- Decouples services in time: the producer doesn't care if the consumer is down, slow, or being deployed right now — the message just waits
- Absorbs traffic spikes — a sudden burst of signups queues up "send welcome email" jobs instead of taking down the email service
- Enables horizontal scaling of consumers independently of producers: add more workers to drain the queue faster without touching the producer code
- A natural fit for [[Microservices vs Monolith|microservices]] communication where synchronous HTTP calls would create tight coupling and cascading failures

## Common Pitfalls
- Not handling message failures and retries, leading to lost or duplicate work
- Writing consumers that aren't idempotent — since at-least-once delivery means the same message can arrive twice, processing it twice (e.g., double-charging a card) causes real damage
- No dead-letter queue: a single malformed message gets retried forever, blocking the queue or burning through retry budgets
- Treating the queue as a database — using it for long-term storage or as a source of truth instead of a transient buffer
- Ignoring message ordering assumptions: code that assumes "event A always arrives before event B" breaks silently on brokers without strict ordering guarantees
- Unbounded queue growth going unmonitored — if consumers are broken and no one's alerting on queue depth, backlog can grow for hours before anyone notices
- Forgetting message size limits (SQS caps at 256KB, Kafka has configurable but real limits) and trying to cram large payloads through instead of passing a reference (e.g., an S3 key)

## Variants
- **Point-to-point (queue)** — each message is consumed by exactly one consumer; classic work-queue pattern (SQS, traditional RabbitMQ queue)
- **Publish/subscribe (topic)** — a message is broadcast to every subscriber; used for event notification, not task distribution (SNS, RabbitMQ exchanges, Kafka topics with multiple consumer groups)
- **Kafka** — log-based, high-throughput, replayable, partition-ordered; popular for event streaming and analytics pipelines, not just task queues
- **RabbitMQ** — traditional AMQP broker with flexible routing (direct, topic, fanout exchanges); strong choice for complex routing logic
- **SQS (AWS)** — fully managed, simple, cheap; standard queues are at-least-once/best-effort order, FIFO queues trade some throughput for strict ordering and exactly-once processing within a message group
- **Redis Streams / Lists** — lightweight queue built on infrastructure many teams already run, good for lower-durability or lower-scale needs

## Comparison

| | Queue (SQS, RabbitMQ) | Log (Kafka) |
|---|---|---|
| Consumption | Message removed once acked | Message stays, consumers track offset |
| Replay | Not possible once consumed | Possible — rewind the offset |
| Fan-out to many consumers | Needs pub/sub setup | Native, via consumer groups |
| Best for | Task distribution, job processing | Event streaming, audit logs, analytics |

## Best Practices
- Design every consumer to be idempotent — use a unique message/idempotency key and check "have I already processed this?" before acting
- Always configure a dead-letter queue with alerting, so failures surface instead of retrying silently forever
- Keep payloads small; pass IDs or object references and let the consumer fetch full data if needed
- Monitor queue depth and consumer lag as first-class metrics — a growing backlog is often the earliest signal something downstream is broken
- Set a sane visibility timeout: too short causes duplicate processing from premature redelivery, too long delays recovery when a consumer actually crashed

## FAQ
**Is a message queue the same as a Webhook?** No — a [[Webhook]] is a synchronous HTTP push from one system to another with no buffering or retry guarantees baked in by default; a queue is a durable, broker-managed buffer with delivery and retry semantics.

**Why not just use HTTP calls between services?** Direct HTTP calls are synchronous and tightly couple availability — if the downstream service is slow or down, the caller blocks or fails too. A queue lets the caller succeed immediately and the work happen later.

**Can a message queue guarantee exactly-once delivery?** Most guarantee at-least-once; true exactly-once requires either idempotent consumers (the practical answer) or specialized support like Kafka's transactional producers or SQS FIFO with deduplication IDs.

## Real-World Example
E-commerce checkout is the textbook case. When an order is placed, the request needs to: charge the card, decrement inventory, send a confirmation email, notify the warehouse, and update analytics. Doing all five synchronously means the customer waits on the slowest one (often the email provider) and any single failure (analytics service hiccup) can fail the entire checkout. The typical fix: charge the card synchronously (the customer needs to know now if payment failed), then publish an `order.placed` event to a queue/topic. Inventory, email, warehouse, and analytics each consume that event independently, on their own schedule, and a slow or temporarily-down analytics service no longer blocks checkout. Uber's dispatch system and Slack's message delivery pipeline both rely heavily on Kafka-style queues for exactly this reason: absorb bursty load and decouple the "fast path" a user is waiting on from everything that can happen a few seconds later.

## Message Queue vs Direct HTTP Call

| | Direct HTTP call | Message queue |
|---|---|---|
| Coupling | Caller needs callee up and responsive | Caller only needs the broker up |
| Failure mode | Caller blocks or errors immediately | Message waits, retried automatically |
| Latency to caller | Full processing time | Near-instant (just enqueue time) |
| Best for | Needs an immediate result (read a value, validate input) | Fire-and-forget or "eventually" work |
| Ordering/consistency | Strong (synchronous, in-request) | Eventual, requires explicit design |

## More Best Practices
- Version your message schemas (`{"type": "order.placed", "version": 2, ...}`) so producers and consumers can evolve independently without a coordinated deploy
- Prefer one broker technology per organization where possible — running Kafka, RabbitMQ, and SQS simultaneously multiplies operational burden without a proportional benefit
- Use consumer groups (Kafka) or fan-out topics (SNS→SQS) when multiple independent services need to react to the same event, rather than having one consumer forward it manually to the others
- Set explicit message TTLs for time-sensitive work (a "send OTP code" message is worthless after 5 minutes) so stale messages don't get processed late and confuse users

## FAQ
**What happens if the broker itself goes down?** Depends on the broker's durability guarantees — a properly configured, replicated broker (Kafka with replication factor 3, RabbitMQ mirrored/quorum queues, SQS which is fully managed) survives node failures without losing acknowledged messages; an unreplicated single-node broker is a single point of failure.

**How is a message queue different from a task queue like Celery or Sidekiq?** Celery/Sidekiq are job-processing frameworks built *on top of* a broker (Redis or RabbitMQ under the hood) — they add retry policies, scheduling, and worker management around the raw queue primitive.

**Do I need a message queue for a small app?** Not necessarily — if all your background work is a few seconds of email-sending, an in-process background job runner (or even a lightweight cron) may be enough; reach for a dedicated broker when you need durability, cross-service communication, or horizontal worker scaling.

## Sizing and Monitoring
- **Queue depth** (number of unprocessed messages) is the primary health signal — a flat, near-zero depth means consumers are keeping up; a steadily climbing depth means they're falling behind and either need scaling or have a bug
- **Consumer lag** (Kafka-specific: how far behind the latest offset a consumer group is) serves the same purpose for log-based brokers
- **Age of oldest message** matters more than raw count for time-sensitive workloads — 10,000 queued analytics events might be fine, 10,000 queued password-reset emails is a user-facing incident
- Autoscaling consumers based on queue depth (common on Kubernetes via KEDA, or native features in managed queue services) lets worker count track load without manual intervention
- Alert on DLQ growth specifically, separate from main-queue depth — messages landing in the DLQ mean something is failing repeatedly, not just running slow

## Common Interview Questions
**"How do you prevent duplicate processing when a broker guarantees only at-least-once delivery?"** Make the consumer idempotent — track a unique message ID or business key ("has order #123's confirmation email already been sent?") and no-op if it's already been handled, rather than relying on the broker to prevent redelivery.

**"A queue's depth is growing unbounded — what do you check first?"** Whether consumers are actually running and healthy (crashed workers, deploy in progress, an exception loop), then whether they're just under-provisioned for current throughput, then whether a poison message is stuck blocking processing without a DLQ to remove it from the head of the line.

**"When would you choose Kafka over SQS, or vice versa?"** Kafka for high-throughput event streaming where multiple independent consumers need to replay or process the same events differently (analytics + fraud detection + notifications all reading the same stream); SQS for simpler point-to-point task distribution where a managed, low-operational-overhead queue is enough and replay isn't needed.

## Queues vs Streams vs WebSockets
It's worth distinguishing message queues from two other async-sounding technologies they're often confused with:
- A [[WebSocket]] is a persistent, bidirectional connection for real-time client-server communication (chat, live dashboards) — it has no built-in durability or retry; if the client is offline, the message is simply lost unless the app layer adds its own buffering
- A message queue is server-to-server (or service-to-service) infrastructure with durability, retry, and delivery guarantees built in — not typically exposed directly to browser clients
- Real-time apps often use both together: a WebSocket pushes live updates to connected clients, backed by a message queue that durably fans out events to whichever backend services (including the WebSocket gateway) need to react to them

## Cost and Operational Tradeoffs
- Managed queues (SQS, Google Pub/Sub, Azure Service Bus) trade control for near-zero operational burden — no brokers to patch, scale, or babysit through a failover, at the cost of per-message/per-request pricing that can add up at very high volume
- Self-hosted brokers (RabbitMQ, Kafka) give more control over throughput, retention, and routing, but someone on the team now owns capacity planning, upgrades, and incident response for the broker itself
- Kafka in particular has a steeper operational learning curve than a simple queue — partitioning strategy, consumer group rebalancing, and retention policy all need deliberate design decisions that a managed SQS queue abstracts away entirely

## History
Message queuing predates the modern web by decades — IBM's MQSeries (now IBM MQ) shipped in 1993 for connecting mainframe and midrange systems reliably. The pattern found new life with the rise of service-oriented and later microservices architectures: RabbitMQ (2007) brought an open-source, protocol-standard (AMQP) broker to a wider audience, and Kafka (open-sourced by LinkedIn in 2011) reframed the problem as a distributed log rather than a traditional queue, purpose-built for the throughput demands of streaming event data at web scale. Cloud providers followed with fully managed offerings — SQS (2004, one of AWS's earliest services) removed the operational burden of running a broker at all.

## Related Terms
- [[Microservices vs Monolith]]
- [[Webhook]]
- [[Load Balancer]]
- [[WebSocket]]

## Example
RabbitMQ, SQS, or Kafka queuing up "send welcome email" jobs instead of sending them during signup and slowing the response:

```js
// Producer: signup handler enqueues instead of sending inline
await queue.send('email-jobs', {
  type: 'welcome-email',
  userId: user.id,
  idempotencyKey: `welcome-${user.id}`, // guards against duplicate delivery
});
res.status(201).json({ id: user.id }); // responds immediately, doesn't wait on email
```

```js
// Consumer: separate worker process drains the queue
worker.on('email-jobs', async (msg) => {
  if (await alreadyProcessed(msg.idempotencyKey)) return msg.ack();
  await sendWelcomeEmail(msg.userId);
  await markProcessed(msg.idempotencyKey);
  msg.ack(); // only remove from queue after success
});
```
