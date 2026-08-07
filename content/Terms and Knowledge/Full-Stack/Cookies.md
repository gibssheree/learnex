---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# Cookies

**Definition:** Small pieces of data a server tells the browser to store and automatically send back on every future request to that domain.

## How It Works
- Server sends a `Set-Cookie` header, browser stores it and attaches it to matching requests
- Flags control behavior: `HttpOnly` (JS can't read it), `Secure` (HTTPS only), `SameSite` (cross-site sending rules)
- Every cookie has a name/value pair plus attributes: `Domain`, `Path`, `Expires`/`Max-Age`, `Secure`, `HttpOnly`, `SameSite`
- `Domain` and `Path` scope which requests the cookie is attached to; omitting `Domain` scopes it to the exact host that set it (no subdomains)
- `Expires`/`Max-Age` determines lifetime: omit both and it's a session cookie (deleted when the browser closes); set either and it's a persistent cookie stored to disk until it expires
- The browser sends matching cookies back as a single `Cookie` header (`name1=value1; name2=value2`), automatically, on every request to a matching origin — no JavaScript required
- Cookie storage is capped per-domain (browsers typically allow ~50-180 cookies per domain, ~4KB per cookie) — this is why session identifiers, not full user objects, get stored in cookies
- The `__Host-` and `__Secure-` name prefixes are a browser-enforced convention: a cookie named `__Host-session` is rejected unless it also sets `Secure`, has `Path=/`, and omits `Domain` entirely, locking it to exactly one origin
- Cookies set via an HTTP response header and cookies set via `document.cookie` in JavaScript follow the same storage and matching rules — the API differs, the underlying cookie jar doesn't

## Why It Matters
- The backbone of session-based auth and site tracking
- Understanding cookie flags is core web security knowledge
- Cookies are the only browser storage mechanism the server can set directly (via response headers) and that gets sent automatically on subsequent requests — `localStorage` and `sessionStorage` require explicit JS on every request and never leave the browser on their own
- Because cookies travel automatically, they're also the attack surface for [[CSRF (Cross-Site Request Forgery)]] — any state-changing endpoint that trusts a cookie alone, without also checking origin or a CSRF token, can be triggered by a malicious third-party page
- Cookies underpin cross-domain single sign-on flows and analytics identity stitching, which is precisely why browser vendors have spent years restricting third-party cookie behavior

## Common Pitfalls
- Forgetting `HttpOnly` lets JavaScript, including injected [[XSS (Cross-Site Scripting)]] scripts, read auth cookies
- Missing `SameSite` opens the door to [[CSRF (Cross-Site Request Forgery)]]
- Setting `SameSite=None` without also setting `Secure` — modern browsers reject that combination outright, silently dropping the cookie
- Scoping `Domain` too broadly (e.g. `.example.com` instead of `app.example.com`) so the cookie leaks to every subdomain, including less-trusted ones
- Storing sensitive data directly in a cookie's value instead of an opaque session ID that maps to server-side state — cookies are visible to the client and easy to tamper with unless signed/encrypted
- Not setting an expiration on a sensitive cookie, leaving it alive indefinitely on a shared or public machine
- Exceeding the ~4KB per-cookie limit or piling on too many cookies, silently bloating every request's headers and, in extreme cases, tripping server header-size limits (`431 Request Header Fields Too Large`)
- Assuming `SameSite=Lax` (the modern browser default) blocks all cross-site requests — it still allows top-level navigations (like clicking a link), so it stops most CSRF but not all of it
- Forgetting that `Path` matching is a prefix match, not an exact match — a cookie scoped to `/api` also applies to `/api-internal`, which can leak it to routes the developer never intended
- Relying on a cookie's mere presence as proof of authentication without validating it server-side against session state — a stale or forged cookie value should never be trusted at face value

## Related Terms
- [[Session]]
- [[CSRF (Cross-Site Request Forgery)]]
- [[Local Storage vs Session Storage]]
- [[JWT (JSON Web Token)]]
- [[SSL-TLS|SSL/TLS (HTTPS)]]

## Types
- **Session cookies** — no `Expires`/`Max-Age`; deleted when the browser closes. Used for short-lived state
- **Persistent cookies** — have an explicit expiration; survive browser restarts. Used for "remember me" and long-lived preferences
- **First-party cookies** — set by the domain the user is currently visiting
- **Third-party cookies** — set by a different domain than the one in the address bar (e.g. an embedded ad or analytics script setting a cookie for its own domain). Increasingly blocked by default in Safari (ITP) and Chrome's ongoing phase-out, which is why cross-site tracking has been migrating to alternatives
- **Signed cookies** — value is accompanied by an HMAC signature so the server can detect tampering, though the value itself is still readable by the client unless also encrypted
- **Encrypted cookies** — value is opaque ciphertext; used when the cookie must carry data the client shouldn't be able to read
- **Host-only vs domain cookies** — a cookie set without a `Domain` attribute is host-only (exact origin match); one with `Domain` set applies to that domain and all its subdomains

## Comparison
| | Cookies | localStorage | sessionStorage |
|---|---|---|---|
| Sent to server automatically | Yes, on every matching request | No | No |
| Accessible from JS | Yes, unless `HttpOnly` | Yes | Yes |
| Size limit | ~4KB | ~5-10MB | ~5-10MB |
| Lifetime | Configurable (session or persistent) | Until explicitly cleared | Until tab closes |
| Set by server | Yes (`Set-Cookie` header) | No, JS only | No, JS only |
| CSRF exposure | Yes, if relied on alone | No | No |

## Code Example
```http
HTTP/1.1 200 OK
Set-Cookie: session_id=a1b2c3d4; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600
```

```js
// Express.js — setting a cookie server-side
res.cookie('session_id', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000, // 1 hour, in ms
});

// Reading a non-HttpOnly cookie client-side
document.cookie; // "theme=dark; lang=en" — HttpOnly cookies never appear here
```

## Best Practices
- Default every auth-related cookie to `HttpOnly`, `Secure`, and `SameSite=Lax` (or `Strict` if the app never needs cross-site navigation to arrive authenticated)
- Store an opaque session identifier, not user data, and keep the actual session state server-side (or in a signed/encrypted token if going stateless)
- Scope `Domain` and `Path` as narrowly as the use case allows
- Rotate/invalidate the session cookie on privilege changes (login, logout, password change) rather than trusting a stale one
- Pair cookie-based auth with CSRF tokens on state-changing requests — `SameSite=Lax` reduces but doesn't eliminate CSRF risk

## FAQ
**Are cookies obsolete now that JWTs and localStorage exist?** No — for server-rendered or same-origin apps, an `HttpOnly` cookie is still the safest place to hold a session token, because it's immune to XSS-based theft in a way `localStorage` isn't.

**Why do cookies get sent automatically but localStorage doesn't?** It's a deliberate design difference from the web's early days — cookies were built for server-driven state (auth, sessions) before JavaScript existed to manage anything client-side.

**What happens if a cookie exceeds the size limit?** The browser either refuses to store it or silently truncates/drops it, depending on the browser — never rely on cookies for anything beyond small identifiers.

**Can a server delete a cookie directly?** Not literally — it sends a new `Set-Cookie` with the same name/domain/path but an already-past `Expires` (or `Max-Age=0`), and the browser deletes its local copy in response. There's no server-side "reach into the browser" mechanism.

**Do cookies work the same across subdomains?** Only if `Domain` is set to the shared parent (e.g. `.example.com`), which then applies the cookie to every subdomain, including third parties operating under `*.example.com` on shared hosting — a real risk if you don't control every subdomain.

## Under the Hood: Header Mechanics
The `Set-Cookie` response header and `Cookie` request header look similar but are parsed differently. `Set-Cookie` allows one full cookie definition per header instance — a response setting multiple cookies sends multiple separate `Set-Cookie` headers, not a comma-separated list, because commas can appear inside `Expires` date values and would be ambiguous. The request-side `Cookie` header, by contrast, is a single header with all applicable cookies joined by `; `, name-value pairs only — none of the attributes (`Secure`, `HttpOnly`, etc.) are echoed back, since those are instructions to the browser, not data for the server.

Browsers resolve which cookies apply to a given request by matching `Domain` (exact host, or the request host being a subdomain of a `Domain`-scoped cookie) and `Path` (the request path must start with the cookie's `Path`), then send every match, sorted by specificity (longer path first) per RFC 6265.

## History
Cookies were invented in 1994 by Lou Montulli at Netscape to solve a concrete problem: an e-commerce partner needed a shopping cart to persist state across an inherently stateless protocol (HTTP). The mechanism was standardized years later — RFC 2109 (1997), then RFC 2965, then the modern baseline RFC 6265 (2011) which documented how browsers actually behaved rather than the original idealized spec. `SameSite` is much newer: proposed around 2016, shipped with a `Lax`-by-default behavior in Chrome starting 2020, specifically to blunt CSRF attacks that had been possible for the cookie's entire prior history.

## Common Interview Questions
- **What's the difference between `Expires` and `Max-Age`?** `Expires` is an absolute date/time; `Max-Age` is a relative number of seconds from now — when both are present, `Max-Age` wins in modern browsers, and `Expires` exists mainly for older-browser compatibility
- **Why can't JavaScript read an `HttpOnly` cookie?** By design — `HttpOnly` exists specifically to keep the value out of `document.cookie`, so even a successful XSS injection can't exfiltrate it directly
- **What's the practical difference between `SameSite=Strict` and `SameSite=Lax`?** `Strict` blocks the cookie on every cross-site request including top-level navigation from an external link; `Lax` allows it for top-level navigations (GET, like clicking a link) but blocks it for cross-site subrequests like form POSTs or fetches
- **Can a subdomain set a cookie that affects the parent domain?** No — a cookie's `Domain` can only be set to the current domain or a parent of it, never a sibling or child it doesn't control, which is enforced by the browser
- **Why do some sites show a cookie consent banner and others don't?** Regulatory requirement (GDPR in the EU, ePrivacy Directive, similar laws elsewhere) for non-essential cookies like tracking/analytics — strictly necessary cookies (session, security) are typically exempt
- **Is a cookie visible in DevTools proof it's insecure?** Not necessarily — visibility in the Application/Storage tab is expected for all cookies (that's a developer tool, not an attacker's vantage point); the real question is whether it's `HttpOnly` (blocking script access) and `Secure` (blocking plaintext transmission)

## Debugging Cookie Issues
- If a cookie isn't being set at all, check for a `Secure` flag being sent over plain HTTP, or a `SameSite=None` without `Secure` — both cause silent rejection
- If a cookie set in an API response isn't showing up on a subsequent request, check `Domain`/`Path` mismatches between the response's origin and the request's target
- Third-party embedded contexts (iframes) often can't set cookies at all under default browser tracking-prevention settings, regardless of `SameSite` — check the browser's storage-partitioning behavior, not just the cookie attributes
- Cross-origin `fetch`/XHR calls need `credentials: 'include'` client-side and a specific (non-wildcard) `Access-Control-Allow-Origin` plus `Access-Control-Allow-Credentials: true` server-side, or cookies won't be sent or accepted at all

## Regulatory & Privacy Context
- GDPR (EU) and similar laws generally require informed consent before setting non-essential cookies (analytics, advertising, cross-site tracking), while cookies strictly necessary for the service (session, load-balancing, security) are typically exempt from the consent requirement
- Consent Management Platforms (CMPs) — the cookie banners most sites show — exist specifically to record and enforce that consent choice, often blocking non-essential scripts from running (and thus from setting cookies) until the user opts in
- Browser vendors have been independently restricting third-party cookies regardless of regulation: Safari's Intelligent Tracking Prevention (ITP) and Firefox's Enhanced Tracking Protection block many third-party cookies by default; Chrome has been phasing out third-party cookie support in favor of privacy-preserving alternatives (the Privacy Sandbox proposals)
- This shift is why many analytics and ad-tech vendors have moved toward first-party cookie proxying (setting cookies through the site's own domain via a CNAME or server-side proxy) to preserve functionality as third-party cookies get blocked

## Framework Examples
- **Express (Node.js)**: `res.cookie(name, value, options)` / `req.cookies` (with `cookie-parser` middleware)
- **Django (Python)**: `response.set_cookie(key, value, httponly=True, secure=True, samesite='Lax')` / `request.COOKIES`
- **Rails (Ruby)**: `cookies[:session_id] = { value: id, httponly: true, secure: true }`
- **ASP.NET Core (C#)**: `Response.Cookies.Append(name, value, new CookieOptions { HttpOnly = true, Secure = true })`
- Every framework maps to the same underlying `Set-Cookie` header — the API surface differs, the wire protocol doesn't

## Cookies and Modern Auth Architectures
- In a same-origin, server-rendered app (traditional monolith, Next.js/Rails/Django with server sessions), an `HttpOnly` cookie holding a session ID is generally the simplest and safest auth mechanism available
- In a decoupled SPA + API architecture, teams often choose between two patterns: an `HttpOnly` cookie holding a session or refresh token (safer against XSS, needs CSRF protection and CORS credential handling), or a token in memory/`localStorage` sent via an `Authorization` header (simpler CORS story, but exposed to XSS)
- Many production setups land on a hybrid: a short-lived access token kept in memory (never persisted), backed by a long-lived refresh token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie scoped narrowly to the token-refresh endpoint's path
- Mobile apps don't have a browser cookie jar in the same sense — native HTTP clients manage cookies differently (or not at all), which is part of why mobile-first APIs often prefer header-based tokens over cookie-based sessions

## Common Interview Questions (continued)
- **Why is CSRF specifically a cookie problem and not a token-in-header problem?** Because cookies are attached automatically by the browser to any request to the matching domain, including ones triggered by a malicious third-party page; a header must be set explicitly by JavaScript, which a third-party page can't do across origins without the victim site's cooperation (CORS)
- **What's the security benefit of short cookie lifetimes for sensitive sessions?** It bounds the damage window if a cookie is ever stolen — a 15-minute session cookie is far less useful to an attacker than one valid for 30 days
- **Can two different ports on the same host share cookies?** Yes — cookie scoping is based on host (and scheme, for `Secure`), not port, so `localhost:3000` and `localhost:8080` share the same cookie jar, which occasionally surprises developers debugging local multi-service setups
- **Why does deleting a cookie sometimes not work from client-side JS?** If it was set with a specific `Domain` or `Path`, the deletion attempt must specify the exact same `Domain`/`Path`, or the browser treats it as a different cookie and leaves the original untouched

## Example
A "remember me" login that keeps you signed in even after closing the browser — the server sets a persistent, `HttpOnly`, `Secure` cookie holding a session ID with a 30-day `Max-Age`, and every request to the app until then arrives already authenticated.
