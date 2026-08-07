---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# CORS (Cross-Origin Resource Sharing)

**Definition:** A browser security rule that blocks a webpage from calling an API on a different domain unless that API explicitly allows it.

## How It Works
- Browser sends an `Origin` header with the request
- Server responds with `Access-Control-Allow-Origin` to say who's allowed
- Browser blocks the response if the origin doesn't match
- For anything beyond a "simple" request (see below), the browser first sends an automatic `OPTIONS` preflight request asking permission before sending the real one
- CORS is enforced entirely by the browser, not the server. The server always receives and can process the request; CORS only controls whether the browser lets your JavaScript read the response

## Why It Matters
- Every full-stack dev hits a CORS error eventually when frontend and backend run on different ports or domains
- It's the mechanism that makes the Same-Origin Policy usable for the modern web, without it, every API would either have to live on the same origin as its frontend or be completely open
- Misunderstanding it leads to two opposite failure modes: locking legitimate clients out, or opening an authenticated API to the entire internet

## Common Pitfalls
- Setting `Access-Control-Allow-Origin: *` on an authenticated API — fine for public APIs, risky otherwise
- Believing CORS is a server-side security control that stops attackers from ever reaching your API, it isn't. cURL, Postman, and server-to-server requests completely ignore CORS since it's a browser-enforced rule, not a network-level firewall
- Trying to set `Access-Control-Allow-Origin: *` together with `Access-Control-Allow-Credentials: true` — the spec explicitly forbids this combination, browsers reject it, you must echo back a specific origin instead of a wildcard when credentials are involved
- Forgetting that custom request headers (like `Authorization` or a custom `X-Api-Key`) trigger a preflight `OPTIONS` request, and not handling `OPTIONS` on the server at all, which silently breaks every cross-origin call using that header
- Confusing a CORS error in the browser console with the request "not happening", the request often already succeeded server-side (check your server logs), the browser is just refusing to hand the response back to your JavaScript

## Under the Hood: Simple vs Preflighted Requests

Not every cross-origin request triggers a preflight. A request qualifies as "simple" (no preflight) only if **all** of these hold:

- Method is `GET`, `HEAD`, or `POST`
- Only "CORS-safelisted" headers are set (`Accept`, `Accept-Language`, `Content-Language`, `Content-Type` with a limited set of values)
- `Content-Type`, if present, is one of `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`

Anything else, a `PUT`/`DELETE`/`PATCH` request, JSON with `Content-Type: application/json`, a custom header, triggers a preflight: the browser sends an `OPTIONS` request first, asking "would you allow this?", and only sends the real request if the server responds with the right `Access-Control-Allow-*` headers.

```
Browser                                Server
   |--- OPTIONS /api/users ------------->|
   |    Origin: https://app.example.com  |
   |    Access-Control-Request-Method: DELETE
   |    Access-Control-Request-Headers: authorization
   |<-- 204 No Content ------------------|
   |    Access-Control-Allow-Origin: https://app.example.com
   |    Access-Control-Allow-Methods: GET, POST, DELETE
   |    Access-Control-Allow-Headers: authorization
   |    Access-Control-Max-Age: 86400
   |--- DELETE /api/users/42 ------------>|  (actual request, only sent if preflight allowed it)
```

`Access-Control-Max-Age` lets the browser cache the preflight result so it doesn't have to repeat the `OPTIONS` round trip on every single request, cutting real-world latency for chatty APIs.

## The Response Headers

| Header | Purpose |
|---|---|
| `Access-Control-Allow-Origin` | Which origin(s) may read the response, `*` or a specific origin |
| `Access-Control-Allow-Methods` | Which HTTP methods are allowed cross-origin |
| `Access-Control-Allow-Headers` | Which request headers the client is allowed to send |
| `Access-Control-Allow-Credentials` | Whether cookies/auth headers may be included (`true`); requires a specific origin, not `*` |
| `Access-Control-Expose-Headers` | Which response headers JS is allowed to read beyond the small default safelist |
| `Access-Control-Max-Age` | How long (seconds) the browser can cache a preflight result |

By default, JavaScript can only read a small safelist of response headers (`Content-Type`, `Content-Length`, a few others) even on an allowed cross-origin response, if your frontend needs to read a custom header like `X-Request-Id`, the server must explicitly list it in `Access-Control-Expose-Headers`.

## Code Example

```js
// Express.js: a minimal, credential-aware CORS setup
const cors = require('cors');

const allowedOrigins = ['https://app.example.com', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // allows cookies/Authorization headers cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

```js
// Fetch call from the browser that will trigger a preflight
// (custom header + JSON content type)
fetch('https://api.example.com/orders', {
  method: 'POST',
  credentials: 'include', // send cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ item: 'widget' }),
});
```

Note `credentials: 'include'` on the client, without it the browser won't send cookies cross-origin even if the server allows credentials; the two sides have to agree.

## Comparison: CORS vs CSP

| | CORS | Content-Security-Policy (CSP) |
|---|---|---|
| Direction | Controls whether *other* origins can read *your* API's responses | Controls what *your own* page is allowed to load/execute |
| Enforced by | Browser, based on server response headers | Browser, based on a policy header your own page sends |
| Typical goal | Let a trusted frontend call your API cross-origin | Stop injected/malicious scripts from loading external resources |
| Related attack it mitigates | Unauthorized cross-origin reads | [[XSS (Cross-Site Scripting)]] |

They're often confused because both are browser-enforced, header-driven security policies, but they solve different problems and are configured independently.

## History

CORS was standardized by the W3C in 2014, but the problem it solves predates the spec. Before CORS, developers worked around the Same-Origin Policy with hacks like JSONP (abusing `<script>` tags, which aren't subject to Same-Origin restrictions, to smuggle data across origins as a function call) or server-side proxies that forwarded requests so the browser only ever saw same-origin calls. Both were awkward and limited, JSONP only worked for `GET` requests and had its own security issues since it required executing arbitrary script from the remote origin. CORS gave browsers a standardized, explicit opt-in mechanism instead, and JSONP is now essentially obsolete.

## Real-World Example
A company's marketing site at `www.example.com` and its app dashboard at `app.example.com` are technically different origins (different subdomain), so a fetch from the dashboard to a marketing-site API would be blocked by default. The fix is either configuring CORS to explicitly allow `https://app.example.com` as an origin, or, since both are still under the same parent domain, setting cookies with `Domain=.example.com` so they're shared, sidestepping the need for cross-origin fetches for session data entirely. Companies that split frontend and backend onto genuinely different domains (`app.example.com` calling `api.example.com`) don't have that option and must configure CORS properly.

## Best Practices
- Never use `Access-Control-Allow-Origin: *` on any endpoint that reads cookies or an `Authorization` header, echo back a specific, validated origin instead
- Maintain an explicit allowlist of origins server-side rather than reflecting whatever `Origin` header the client sends without validation
- Set `Access-Control-Max-Age` to a sensible value (hours, not seconds) to cut down on redundant preflight round trips for frequently-called endpoints
- Remember CORS is not an authentication mechanism, always enforce real auth/authorization server-side regardless of what CORS headers you send
- Test cross-origin behavior in an actual browser, not just via cURL/Postman, since those tools don't enforce CORS at all and will give you false confidence

## Related Terms
- [[REST API]]
- [[Cookies]]
- [[CSRF (Cross-Site Request Forgery)]]
- [[XSS (Cross-Site Scripting)]]
- [[Session]]

## Example
A React app on `localhost:3000` calling an API on `localhost:5000` gets blocked until the backend adds CORS headers. Opening the browser console reveals something like: `Access to fetch at 'http://localhost:5000/api/data' from origin 'http://localhost:3000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.` Adding `Access-Control-Allow-Origin: http://localhost:3000` (or a permissive CORS middleware in dev) on the backend response resolves it.

## FAQ

**Does CORS protect my API from being called by non-browser clients?**
No. Mobile apps, cURL, server-to-server calls, and tools like Postman don't enforce CORS at all, it's purely a browser-side restriction on what JavaScript running on a webpage is allowed to read. Your actual access control (API keys, auth tokens, IP allowlists) has to happen server-side.

**Why does my preflight `OPTIONS` request return a 404?**
Many backend frameworks don't automatically handle `OPTIONS` for routes you've only defined with `GET`/`POST`/etc. You either need CORS middleware that intercepts `OPTIONS` globally (most CORS libraries do this automatically) or an explicit route handler for it.

**Can I use CORS to restrict which sites can link to my page?**
No, that's a different concern entirely (controlled by `X-Frame-Options` or CSP's `frame-ancestors` for embedding, not CORS). CORS only governs cross-origin JavaScript fetches/XHR, not navigation, linking, or embedding.
