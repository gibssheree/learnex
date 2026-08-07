---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# Session

**Definition:** Server-side stored user state, referenced by a session ID the client holds, usually in a cookie.

## How It Works
- Server creates a session record (memory, Redis, or DB) on login
- Client gets a session ID cookie
- Every request, the server looks up that ID to know who's logged in
- The session ID itself should be a long, cryptographically random, unpredictable string (typically 128+ bits of entropy) — if it were guessable or sequential, an attacker could forge valid session IDs without ever stealing one
- The cookie carrying the session ID is normally marked `HttpOnly` (inaccessible to JavaScript, blocking [[XSS (Cross-Site Scripting)]] theft), `Secure` (only sent over HTTPS), and `SameSite=Lax` or `Strict` (limits it being sent on cross-site requests, mitigating [[CSRF (Cross-Site Request Forgery)|CSRF]])
- The session store itself holds the actual data — user ID, roles, cart contents, whatever the app needs — while the cookie holds nothing but a reference (the session ID) to that record, keeping sensitive data off the client entirely
- Session middleware (Express's `express-session`, Django's session framework, Rails' `ActionDispatch::Session`) handles the plumbing automatically: reading the cookie, loading the session record, exposing it on the request object, and writing it back (often with a refreshed expiry) at the end of the request
- Some frameworks distinguish "sliding" expiration (the session's TTL resets on every active request, so an active user is never logged out) from "absolute" expiration (a hard cutoff regardless of activity) — production systems generally want both combined for a reasonable security/usability balance

## Why It Matters
- Easy to revoke instantly, just delete it server-side
- Simple mental model, good default for traditional server-rendered web apps
- Keeps sensitive data (permissions, cart state, partial form progress) entirely server-side rather than round-tripping it to the client on every request, which is both a security and a bandwidth win compared to stuffing everything into a client-held token
- Gives you a natural place to enforce "logged in from one device at a time" or "show all your active sessions" features, since every login corresponds to a discoverable, individually revocable server-side record
- Sidesteps an entire category of token-based auth problems ([[JWT (JSON Web Token)]] expiry tuning, refresh token rotation, signature key management) at the cost of needing shared, available session storage
- Makes compliance and security auditing simpler in some respects — "show me every active session for this user" and "kill this specific session right now" are both trivial store operations, whereas the equivalent with self-contained tokens requires a separate revocation mechanism bolted on top

## Common Pitfalls
- Doesn't scale across multiple servers without a shared store like Redis
- Ties you to server-side state, awkward for pure APIs and mobile clients
- Session fixation — failing to regenerate the session ID after login lets an attacker who planted a known session ID on a victim (e.g. via a crafted link) hijack the now-authenticated session
- Storing large or growing objects in the session (entire user profiles, big arrays) bloats every session store read/write and, with cookie-based session stores, can exceed the browser's ~4KB per-cookie limit outright
- Forgetting to set an absolute expiry in addition to a sliding/idle expiry — a session that only expires after inactivity can theoretically stay alive forever if the attacker (or a bot) keeps it active
- Using an in-memory session store (the default in many frameworks' getting-started guides) in production — it silently loses every session on a server restart or deploy, and doesn't work at all behind a load balancer with more than one server
- Not invalidating other sessions on a security-sensitive action (password change, detected compromise) — a stolen session should be killed the moment the user changes their password, not left alive until it naturally expires
- Leaking session IDs into logs, analytics tools, or error trackers by logging full request headers or cookies without redaction — a session ID in a log line is just as sensitive as a password in one
- Assuming the session cookie alone proves the request came from the legitimate user — session IDs can still be stolen via network interception on an unencrypted connection, which is part of why the `Secure` flag and HTTPS everywhere both matter

## Session Storage Backends
- **In-memory** — fastest, zero setup, but tied to a single server process; sessions vanish on restart and can't be shared across horizontally scaled instances — fine for local development, wrong for production
- **Redis** — the standard production choice; fast, supports built-in TTL-based expiry, and is naturally shared across multiple app servers, making it the default pairing for horizontally scaled server-rendered apps
- **Database-backed** (a `sessions` table in Postgres/MySQL) — durable and easy to query/audit, but adds a read/write on every request to a store that's usually already your bottleneck under load
- **Cookie-based sessions** (e.g. Rails' default, or a signed/encrypted cookie storing the session data itself) — no server-side store needed at all, but capped by cookie size limits and means the "session" is really closer to a stateless signed token than a true server-side session
- **Sticky sessions at the load balancer** — routing a client to the same backend server on every request so in-memory sessions "work" without a shared store; avoided in modern architectures because it breaks failover (that one server going down kills every session pinned to it) and complicates autoscaling
- **Memcached** — an older alternative to Redis for session storage, still seen in legacy PHP deployments; largely superseded by Redis because it lacks persistence and Redis's richer data structures and TTL semantics

## History
- Session tracking predates cookies — early web servers had no reliable way to correlate requests from the same browser at all, since HTTP was designed stateless from the start; sites resorted to hacks like embedding a session ID in every URL (`?sid=abc123`), which leaked into browser history, referrer headers, and shared links
- Netscape introduced cookies in 1994 specifically to solve this statelessness problem, giving servers a way to ask the browser to hold and resend a small piece of data automatically
- The `HttpOnly` cookie flag (introduced by Microsoft in IE6, ~2002) was a direct response to widespread session-cookie theft via XSS — before it existed, any script injected into a page could read `document.cookie` and exfiltrate a live session ID
- `SameSite` cookies (standardized around 2016-2019, eventually defaulted to `Lax` by Chrome in 2020) were introduced to blunt CSRF attacks at the browser level, reducing how often session cookies get sent along with cross-site requests without explicit developer effort
- The rise of single-page apps and mobile-first APIs in the 2010s pushed many teams toward token-based auth (JWT) instead of sessions for new API-first projects, though sessions never disappeared — they remain the default in mainstream frameworks like Rails, Django, and Laravel

## Comparison: Session vs JWT

| | Session | JWT |
|---|---|---|
| Where state lives | Server (store) | Client (self-contained token) |
| Revocation | Instant — delete the record | Hard — needs a blocklist or short expiry |
| Scaling | Needs a shared store (Redis) | Stateless, no shared store needed |
| Payload size on the wire | Small (just an ID) | Larger (encodes claims each request) |
| Natural fit | Server-rendered web apps | APIs, mobile clients, microservices |
| Data exposure | None client-side | Claims are readable (base64), not secret unless encrypted |

## Deeper Dive: Session Lifecycle
- **Creation** — happens either at first visit (an anonymous session tracking, say, an unauthenticated shopping cart) or at login (an authenticated session tied to a user ID); many frameworks create a session record for every visitor by default, authenticated or not
- **Reads** — on every request, the server looks up the session by ID from the incoming cookie; this is a network round trip to the session store (Redis, DB) unless the framework caches it within the request lifecycle
- **Writes** — any mutation to `req.session` (or equivalent) gets persisted back to the store at the end of the request, often alongside a refreshed expiry timestamp if the store uses sliding expiration
- **Expiry** — sessions typically die two ways: a TTL set on the store entry itself (Redis `EXPIRE`) causing automatic cleanup, and/or the cookie's own `Max-Age`/`Expires` attribute telling the browser to stop sending it — both need to agree, or you can end up with a cookie the browser still sends pointing at a session record that's already been garbage collected server-side
- **Destruction** — explicit logout should delete the session record entirely (not just clear the cookie client-side), since a client can always resend an old cookie value if the server-side record is still sitting there valid

## Deeper Dive: Session vs Cookie
These terms get used interchangeably in casual conversation but describe different things:
- A **cookie** is a browser storage mechanism — a small piece of data the browser stores and automatically resends to a matching domain on future requests. Cookies can hold anything: a session ID, a tracking identifier, a user preference, an entire encoded [[JWT (JSON Web Token)]].
- A **session** is a server-side concept — a record of state associated with a particular client, addressed by some identifier. That identifier is *usually* delivered via a cookie, but doesn't have to be (URL parameters and custom headers are less common but valid alternatives).
- So "session cookie" specifically means a cookie whose only job is carrying a session ID, as opposed to a cookie that carries meaningful data itself (like a signed JWT or a simple preference flag).

## Code Example
```js
// Express with express-session + a Redis store
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient();
await redisClient.connect();

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
  resave: false,
  saveUninitialized: false,
}));

app.post('/login', async (req, res) => {
  const user = await authenticate(req.body);
  req.session.regenerate(() => {   // prevents session fixation
    req.session.userId = user.id;
    res.sendStatus(200);
  });
});
```

```http
Set-Cookie: connect.sid=s%3AQz8f...signature; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

## Best Practices
- Regenerate the session ID on login and on any privilege escalation (e.g. becoming an admin mid-session) to prevent session fixation
- Set both an idle timeout (expires after N minutes of inactivity) and an absolute timeout (expires after N hours regardless of activity)
- Always set `HttpOnly`, `Secure`, and an appropriate `SameSite` value on the session cookie — there's essentially never a good reason to omit any of these three in production
- Store only an identifier and minimal claims in the session; keep the bulk of user data in the database, fetched by ID, rather than duplicating it into every session record
- Provide users a way to see and revoke their own active sessions ("log out of all devices"), which requires designing the session store to support "delete all sessions for user X," not just "delete this one session"
- Rotate the session secret/signing key periodically, and support graceful key rotation (accepting both old and new signatures for a transition window) rather than invalidating every session at once
- Monitor session store size and eviction behavior in production — an unbounded session store with no expiry policy will eventually exhaust memory in Redis or bloat a database table indefinitely
- Avoid trusting client-supplied data to select or influence which session is loaded (only the opaque cookie value should determine that) — any logic that lets a request parameter override session lookup is a direct path to session hijacking

## FAQ
- **Are sessions obsolete now that JWTs exist?** No — they solve different problems well. Sessions remain the simpler, more secure default for traditional server-rendered apps where the server can always be consulted; JWTs shine for stateless APIs and cross-service auth where a round trip to a central session store per request is undesirable.
- **Can you use sessions with a single-page app or mobile app?** Yes, via a session cookie sent on API requests (works for browser-based SPAs on the same or a CORS-configured domain) — it's less natural for native mobile, where cookie handling is more awkward than just attaching a bearer token.
- **What happens if the session store goes down?** Every logged-in user is effectively logged out (or requests error out) until it recovers — this is exactly why the session store needs the same reliability engineering (replication, failover) as any other critical piece of production infrastructure, not an afterthought.
- **Is a session ID a JWT?** No — a session ID is an opaque random reference with no embedded data; a JWT is a self-contained, signed (and optionally encrypted) payload the server can validate without a database lookup. They solve the "who is this" problem via fundamentally different mechanisms.
- **Do sessions work well with [[SSO (Single Sign-On)]]?** Yes, commonly — an app can maintain its own local session after validating an SSO assertion or token, so subsequent requests hit the fast local session store instead of re-verifying with the identity provider every time.

## Real-World Example
A widely cited real-world session bug pattern: e-commerce sites that don't regenerate the session ID after login are vulnerable to session fixation via a crafted link — an attacker sends a victim `https://shop.example.com/?sessionid=attacker-chosen-value`, the victim logs in without the app rotating that ID, and the attacker (who already knows the value) is now logged in as the victim. This is exactly why OWASP's session management guidance lists "regenerate session ID on authentication" as a baseline requirement, not an optional hardening step.

On the infrastructure side, a common production incident shape: a team deploys a new server behind a load balancer without configuring sticky sessions or a shared Redis store, and users start getting randomly logged out whenever their request lands on a different server than the one holding their in-memory session — a textbook symptom of session storage that was never actually built to scale horizontally.

## Common Interview Questions
- **How would you prevent session fixation?** Regenerate the session ID (issue a brand new one, migrate the associated data) at the moment of successful authentication, so any session ID an attacker might have set or guessed beforehand becomes worthless after login.
- **Why is `HttpOnly` important for session cookies?** It prevents JavaScript (including injected XSS payloads) from reading the cookie via `document.cookie`, so even a successful script injection can't directly exfiltrate the session ID — the browser still sends it on requests, but no page script can read its value.
- **How do you scale sessions across multiple servers?** Move session storage out of any single server's memory into a shared, network-accessible store like Redis, so every app server instance reads and writes the same session data regardless of which one handles a given request.
- **What's the tradeoff between session-based and token-based (JWT) authentication?** Sessions give you instant server-side revocation and keep data off the client at the cost of needing shared, always-available storage; JWTs are stateless and scale trivially but make revocation hard and require careful expiry/refresh design to limit the damage from a stolen token.

## Related Terms
- [[Cookies]]
- [[JWT (JSON Web Token)]]
- [[SSO (Single Sign-On)]]
- [[REST API]]

## Example
Logging into a Django or Rails app — the session cookie keeps you logged in across page loads. Concretely: Django's `SessionMiddleware` writes a `sessionid` cookie on login, stores the actual session data in the configured backend (database by default, Redis in most production deployments), and on every subsequent request looks up `request.session` from that cookie before your view code ever runs — your view just reads `request.session['user_id']` without knowing or caring whether the data underneath came from Redis, Postgres, or memcached.

That separation — application code talking to a simple dictionary-like interface while the framework handles storage, expiry, and cookie plumbing — is exactly why sessions remain such a low-friction default for server-rendered apps.
