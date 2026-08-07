---
tags: [term, fullstack, api]
category: API & Networking
---

# Webhook

**Definition:** A way for one service to notify another by sending an HTTP POST request the moment an event happens.

## How It Works
- You register a URL with a third-party service
- When something happens on their end (payment received, PR merged), they POST data to your URL
- The payload is usually JSON describing the event: what happened, when, and the relevant object (a payment, a commit, an order)
- Your endpoint is expected to respond quickly with a `2xx` status to acknowledge receipt; anything else (timeout, `4xx`, `5xx`) tells the sender the delivery failed
- Most providers retry failed deliveries on a backoff schedule (Stripe retries for up to 3 days with increasing delays), which means your endpoint must be ready to receive the *same* event more than once
- Because it's inverted from a typical API call, the third party initiates the connection to *you* instead of you polling *them*, your endpoint needs to be public, reachable, and stable, which is why local development usually needs a tunnel (ngrok, ngrok alternatives, or the provider's CLI forwarding tool) to receive webhooks at all

## Why It Matters
- The standard way apps talk to each other asynchronously without constant polling
- Polling for changes (`GET /orders?since=...` every 30 seconds) wastes requests when nothing changed and still has up to a 30-second delay when something did; a webhook delivers the instant the event occurs, at a fraction of the request volume
- Decouples systems: the sender doesn't need to know anything about your architecture, retry logic, or database, it just needs your URL and knows an event happened

## Common Pitfalls
- Not verifying the webhook's signature, so anyone could fake a request to your endpoint
- Not handling duplicate or retried webhook deliveries
- Doing slow, synchronous work (sending emails, hitting other APIs, heavy DB writes) directly inside the webhook handler before responding, if it takes too long, the sender's timeout fires, they mark it failed, and retry, even though your system already processed it, this compounds the duplicate-delivery problem
- Assuming webhooks arrive in order, network retries and provider-side queuing mean a "subscription cancelled" event can arrive before the "subscription created" event it logically follows
- Not handling replay/out-of-order delivery with a timestamp or sequence number check, so an old, already-superseded event can overwrite newer state if processed last
- Trusting the payload's stated event type without re-fetching the authoritative object from the provider's API for anything security- or money-sensitive, a forged or stale payload can lie about the current state
- No dead-letter handling: if your endpoint is down during a provider's entire retry window, that event is gone forever unless you have a way to manually replay it (most providers offer a dashboard to resend, but only if you notice the gap)

## Under the Hood: Signature Verification
Since the sender is making an unauthenticated-looking POST to a public URL, anyone who discovers or guesses that URL could send fake events unless the payload is signed. The standard pattern (used by Stripe, GitHub, and most major providers):
1. The provider computes an HMAC (typically HMAC-SHA256) of the raw request body using a shared secret only you and the provider know
2. That signature is sent in a header (`Stripe-Signature`, `X-Hub-Signature-256`)
3. Your server recomputes the HMAC over the *raw* body it received using the same secret, and compares it to the header value using a constant-time comparison (to avoid timing attacks)
4. If they don't match, reject the request, it wasn't genuinely sent by the provider, or the body was tampered with in transit

Critically, this must be done on the **raw, unparsed** request body, most web frameworks parse JSON automatically before your handler sees it, and re-serializing a parsed object rarely produces byte-for-byte the same string the signature was computed over. This is one of the most common webhook bugs: signature verification passes in testing (against a hand-crafted payload) but fails in production against real provider payloads.

## Comparison: Webhooks vs Polling vs WebSocket
| | Webhook | Polling | WebSocket |
|---|---|---|---|
| Who initiates | Sender pushes to you | You repeatedly ask | Either side, over a persistent connection |
| Latency | Near-instant | Bound by poll interval | Near-instant |
| Connection | Stateless, one-off HTTP POST per event | Stateless, repeated HTTP requests | Stateful, one long-lived connection |
| Infra needs | A public, reachable endpoint | None beyond a schedule | Sticky sessions / connection management |
| Typical use | Cross-service, cross-company events (Stripe, GitHub) | Simple integrations, no public endpoint available | Real-time UI updates within your own app |

See [[WebSocket]] for the persistent-connection alternative, generally used for pushing updates to end-user browsers rather than server-to-server integration.

## Code Example
```js
// Express endpoint verifying a Stripe-style webhook signature
const express = require('express');
const crypto = require('crypto');
const app = express();

// IMPORTANT: use the raw body, not JSON-parsed, for signature verification
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body) // raw Buffer, not parsed JSON
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(400).send('Invalid signature');
  }

  const event = JSON.parse(req.body);

  // Dedupe: have we already processed this event ID?
  if (await alreadyProcessed(event.id)) {
    return res.status(200).send('OK'); // ack again, don't reprocess
  }

  // Respond fast, then hand off the actual work to a queue
  await enqueueForProcessing(event);
  res.status(200).send('OK');
});
```

## Variants and Related Patterns
- **Retry policies vary by provider** — GitHub retries failed webhook deliveries a limited number of times over a short window; Stripe retries with exponential backoff over up to 3 days; some internal systems don't retry at all. Always check the specific provider's documented policy rather than assuming
- **Webhook relay/queue services** — tools like Svix, Hookdeck, or a self-hosted queue sit between the sender and your endpoint, handling retries, signature verification, and delivery logs on your behalf, useful when you're the one *sending* webhooks to many customers and don't want to build that infrastructure yourself
- **Polling as a fallback** — many APIs offer both a webhook and a polling endpoint for the same data; robust integrations often poll periodically as a safety net in case a webhook was missed, silently reconciling any drift

## Code Example: Handling Out-of-Order and Duplicate Events
```js
async function handleSubscriptionEvent(event) {
  const existing = await db.subscriptions.findOne({ id: event.data.id });

  // Ignore events older than the state we already have — protects against
  // out-of-order delivery overwriting newer data with stale data
  if (existing && existing.lastEventTimestamp >= event.created) {
    return;
  }

  await db.subscriptions.update(event.data.id, {
    status: event.data.status,
    lastEventTimestamp: event.created,
  });
}
```
Comparing timestamps (or a monotonically increasing sequence number, if the provider supplies one) before applying an update is the standard defense against a delayed retry clobbering a more recent state change.

## Best Practices
- Always verify the signature against the *raw* request body before trusting the payload
- Respond `2xx` as fast as possible, offload real work (emails, downstream API calls, heavy writes) to a background job or [[Message Queue]] instead of doing it inline in the handler
- Store the event's unique ID and check it before processing, treat every webhook as potentially delivered more than once, see [[Idempotency]]
- Don't trust the payload blindly for sensitive state changes, re-fetch the object from the provider's API if the stakes are high enough to justify the extra call
- Log every received event (even ones you don't act on) somewhere durable, it's the only way to debug "why didn't this update happen" after the fact
- Return meaningful HTTP status codes: `2xx` only when you've durably accepted the event (queued or processed), not just received the HTTP connection
- Rate-limit and authenticate your own webhook-receiving endpoint like any other public endpoint, see [[Rate Limiting]], since it's an internet-facing URL regardless of who's supposed to be calling it

## FAQ
**What happens if my server is down when a webhook fires?** Depends entirely on the provider. Most retry with backoff for a bounded window (hours to days), after which the event is dropped unless the provider offers a dashboard to manually replay it, always check the specific provider's retry policy.

**Should I use a queue for webhook processing?** For anything beyond trivial logging, yes. Accept the webhook, validate its signature, push it onto a [[Message Queue]] or job queue, and return `200` immediately; a separate worker processes it. This decouples "did we receive the event" from "did we finish handling it," and lets you retry your own processing without the sender needing to resend.

**How is a webhook different from a callback URL in OAuth?** An [[OAuth 2.0]] redirect/callback is a one-time, user-browser-driven redirect as part of a login flow. A webhook is a server-to-server notification that can fire repeatedly, indefinitely, for any event, with no user browser involved at all.

**How do I test webhooks locally?** Since providers need a publicly reachable URL, local development typically uses a tunneling tool (ngrok, Cloudflare Tunnel, or the provider's own CLI, e.g. `stripe listen --forward-to localhost:3000/webhooks`) to expose your local server temporarily, or replays sample payloads captured from the provider's dashboard/CLI without needing a live tunnel at all.

**What status code should a webhook handler return on business-logic failure?** Still generally `2xx` if you've durably queued the event for processing (you don't want the sender to retry something you've already accepted responsibility for). Reserve non-`2xx` responses for cases where you genuinely didn't receive or accept the event, bad signature, malformed payload, endpoint overloaded, since a non-2xx is what triggers the sender's retry logic.

## Common Interview Questions
- "How would you make a webhook handler idempotent?" — Expect an answer covering storing processed event IDs, checking before applying an update, and using database-level unique constraints as a backstop against race conditions between concurrent retries
- "What's the security risk of an unauthenticated webhook endpoint, and how do you fix it?" — Expect HMAC signature verification against a shared secret, computed over the raw body, compared in constant time
- "Why shouldn't a webhook handler do all its work synchronously?" — Expect a discussion of sender timeouts, unnecessary retries, and offloading work to a queue so the acknowledgment is fast and decoupled from processing time

## Real-World Example
Stripe sends a webhook to your server the moment a customer's payment succeeds. Your endpoint verifies the `Stripe-Signature` header, checks whether you've already seen that event ID (Stripe explicitly documents that webhooks can be delivered more than once), and if not, marks the order as paid and enqueues a confirmation email, all before responding `200` within Stripe's few-second timeout window. If your server were down for an hour, Stripe would keep retrying with exponential backoff until it came back up or the retry window expired.

## Related Terms
- [[REST API]]
- [[Idempotency]]
- [[Message Queue]]
- [[WebSocket]]
- [[Rate Limiting]]
- [[HTTP Status Codes]]
- [[OAuth 2.0]]
- [[CORS (Cross-Origin Resource Sharing)]]

Note that CORS is irrelevant to webhooks themselves, deliveries are server-to-server, not browser-initiated, so no `Access-Control-Allow-Origin` header is needed on a webhook endpoint. It only matters if you separately expose a browser-facing API for managing webhook subscriptions.

## Example
Stripe sends a webhook to your server the moment a customer's payment succeeds, letting your backend update the order status in real time without ever having to ask Stripe "has this payment gone through yet?"

Contrast this with a naive polling integration: without webhooks, the same feature would mean running a scheduled job every minute that calls Stripe's API to check every recent payment's status, burning API quota, adding up to a minute of delay before your database reflects reality, and still needing all the same idempotency handling if the job overlaps itself on a slow run.
