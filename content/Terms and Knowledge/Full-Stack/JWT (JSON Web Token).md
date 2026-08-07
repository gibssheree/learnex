---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# JWT (JSON Web Token)

**Definition:** A compact, signed token used to prove identity between client and server without a database lookup on every request.

## How It Works
- 3 parts: header, payload, signature (`header.payload.signature`), base64url-encoded and dot-separated
- The **header** declares the algorithm and token type: `{ "alg": "HS256", "typ": "JWT" }`
- The **payload** carries claims — registered ones like `iss` (issuer), `sub` (subject/user id), `aud` (audience), `exp` (expiration, Unix timestamp), `iat` (issued at), `nbf` (not valid before), `jti` (unique token ID) — plus whatever custom claims you add (`role`, `orgId`, etc.)
- The **signature** is computed over the header and payload using a secret (HMAC) or a private key (RSA/ECDSA): `HMACSHA256(base64url(header) + "." + base64url(payload), secret)`
- Signed with a secret (or private key), the server verifies the signature instead of checking a session store — it recomputes the signature from the received header+payload and compares it to the one attached
- Payload is readable by anyone, just not editable without breaking the signature — base64url is an *encoding*, not encryption, so anyone can decode and read the claims (try it at jwt.io)
- Because the signature covers the header and payload together, changing even a single character in either (including whitespace differences from re-serializing JSON) invalidates the signature — this is why JWT libraries always work with the exact encoded string, never a re-serialized copy
- Clock-based claims (`exp`, `nbf`, `iat`) rely on reasonably synchronized clocks between issuer and verifier — most libraries allow a small "clock skew" tolerance (a few seconds) to avoid rejecting valid tokens due to minor drift

## Why It Matters
- Enables stateless auth, easy to scale across many servers — any server holding the verification secret/public key can validate a token with zero calls to a central session store
- Standard for APIs and mobile clients that can't rely on cookies as easily, and for cross-domain SSO where a session cookie scoped to one domain doesn't help
- Because verification is local (just cryptographic math), JWTs scale horizontally for free — no shared session store is a bottleneck or single point of failure
- Forms the backbone of [[OAuth 2.0]] access tokens and most third-party auth providers (Auth0, Firebase Auth, AWS Cognito) issue JWTs by default

## Common Pitfalls
- Storing it in `localStorage` exposes it to theft via [[XSS (Cross-Site Scripting)]] — any injected script can read `localStorage` and exfiltrate the token; an httpOnly cookie is not readable by JS at all
- Can't revoke a single JWT early without extra infrastructure (blocklists) — since verification is stateless by design, "logging out" doesn't actually invalidate a still-valid, unexpired token unless you build a denylist to check against
- Putting sensitive data in the payload — it's signed, not encrypted, so it's readable by anyone who intercepts or decodes it (never put passwords, SSNs, or raw PII in claims)
- The **`alg: none` vulnerability** — some early JWT libraries would accept a token with `"alg": "none"` and skip signature verification entirely if the attacker simply declared no algorithm; modern libraries reject this by default, but only if you don't disable that protection
- The **algorithm confusion attack** — if a server is configured to accept both `RS256` and `HS256` and a service exposes its RSA *public* key, an attacker can forge a token by signing it with `HS256` using the public key as the HMAC secret; the server, expecting either algorithm, verifies it "successfully." Fix: pin the expected algorithm explicitly when verifying, never trust the `alg` field from the token itself
- Setting expiration too long, which extends the theft/replay window, or too short, which forces constant re-authentication without a refresh flow
- Forgetting to validate the `exp` claim server-side at all — some hand-rolled JWT implementations decode and trust the payload without actually checking expiration, silently accepting stale tokens forever
- Trusting a JWT's claims without verifying the signature first — decoding is not the same operation as verifying, and using a "decode" function where you meant "verify" is a common, dangerous mixup in JWT libraries that expose both

## Under the Hood
Decoded example of a JWT (`eyJhbGci...`):
```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user_123", "role": "admin", "iat": 1712000000, "exp": 1712003600 }
```
The signing process, step by step:
1. Serialize header to JSON, base64url-encode it
2. Serialize payload to JSON, base64url-encode it
3. Concatenate as `base64url(header) + "." + base64url(payload)`
4. Run that string through the signing algorithm with the secret/private key
5. Base64url-encode the resulting signature and append it as the third segment

Verification just reverses steps 1–4 using the same secret (HMAC) or the corresponding public key (RSA/ECDSA), then does a constant-time comparison against the signature that came with the token. If they don't match, or `exp` is in the past, or `nbf` is in the future, the token is rejected.

## Variants / Types
- **JWS (JSON Web Signature)** — what people usually mean by "JWT": signed, not encrypted, contents are readable
- **JWE (JSON Web Encryption)** — a related but distinct spec where the payload is actually encrypted, not just signed; rarely used in practice compared to JWS
- **Access token vs. refresh token** — the standard pairing: a short-lived JWT access token (minutes) sent on every API call, plus a longer-lived refresh token (often opaque, not a JWT, and stored server-side) used only to mint new access tokens
- **Algorithms**: `HS256` (symmetric — same secret signs and verifies, simplest but means every verifying service must hold the shared secret), `RS256`/`PS256` (asymmetric RSA — only the issuer holds the private key, any service can verify with the public key), `ES256` (asymmetric ECDSA — smaller keys/signatures than RSA for equivalent security), `none` (no signature — should always be rejected)

## Comparison

| | JWT (stateless) | Session cookie (stateful) | Opaque token |
|---|---|---|---|
| Server storage needed | No | Yes (session store) | Yes (token → user mapping) |
| Revocation | Hard (needs blocklist) | Easy (delete session row) | Easy (delete token row) |
| Payload readable by client | Yes | No | No |
| Scales across services without shared store | Yes | No | No |
| Typical size | Larger (100s of bytes+) | Small (session ID only) | Small |

## Code Example
```js
// Node.js — issuing and verifying with the jsonwebtoken library
const jwt = require('jsonwebtoken');

// Issue on login
const token = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '15m', algorithm: 'HS256' }
);

// Verify on protected routes — pin the algorithm explicitly
function requireAuth(req, res, next) {
  try {
    const payload = jwt.verify(
      req.headers.authorization?.split(' ')[1],
      process.env.JWT_SECRET,
      { algorithms: ['HS256'] } // prevents algorithm confusion attacks
    );
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'invalid or expired token' });
  }
}
```

```
# Decoded structure of a real JWT (header.payload.signature)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiJ1c2VyXzEyMyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTcxMjAwMzYwMH0
.4f4A9x...signature-bytes...

# Header  -> { "alg": "HS256", "typ": "JWT" }
# Payload -> { "sub": "user_123", "role": "admin", "exp": 1712003600 }
# Signature -> HMACSHA256(base64url(header) + "." + base64url(payload), secret)
```

```js
// Refresh-token rotation flow — access token expired, client silently refreshes
async function apiCall(url, options = {}) {
  let res = await fetch(url, { ...options, headers: authHeaders() });

  if (res.status === 401) {
    // access token expired — use refresh token (httpOnly cookie) to get a new one
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!refreshRes.ok) {
      redirectToLogin(); // refresh token itself is invalid/expired/revoked
      return;
    }
    const { accessToken } = await refreshRes.json();
    storeAccessToken(accessToken);
    res = await fetch(url, { ...options, headers: authHeaders() }); // retry original call
  }
  return res;
}
```

```js
// RS256 verification against a JWKS endpoint (auth0/Cognito/Firebase pattern)
const jwksClient = require('jwks-rsa');
const client = jwksClient({ jwksUri: 'https://auth.example.com/.well-known/jwks.json' });

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => callback(null, key.getPublicKey()));
}

jwt.verify(token, getKey, { algorithms: ['RS256'], audience: 'my-api', issuer: 'https://auth.example.com/' }, (err, decoded) => {
  // decoded.sub, decoded.role, etc. — verified without ever calling the auth server
});
```

## Best Practices
- Keep access tokens short-lived (5–15 minutes) and pair them with a longer-lived refresh token to limit the damage window of a stolen access token
- Store tokens in an httpOnly, `Secure`, `SameSite=Strict`/`Lax` cookie rather than `localStorage` when the client is a browser — trades XSS exposure for [[CSRF (Cross-Site Request Forgery)|CSRF]] exposure, which is easier to mitigate with proper cookie flags and CSRF tokens
- Always validate `aud` and `iss` claims, not just the signature — a validly-signed token issued for a different service shouldn't be accepted by yours
- Prefer `RS256`/`ES256` over `HS256` in multi-service architectures, so only the auth server holds the private signing key and every other service just holds the public key for verification
- Rotate refresh tokens on use ("refresh token rotation") and detect reuse of an already-rotated token as a signal of theft
- If early revocation genuinely matters for your use case (e.g. banning a user immediately), add a `jti` claim and check it against a short-lived denylist — accept that this reintroduces the statefulness JWTs are meant to avoid

## Real-World Example
Auth0, Firebase Authentication, and AWS Cognito all issue JWTs as their access/ID tokens by default. A typical SPA flow: user logs in, the auth provider returns a JWT, the SPA attaches it as `Authorization: Bearer <token>` on every API call, and each backend service verifies it independently against the provider's published public key (via a JWKS endpoint) without ever calling the auth provider itself.

Kubernetes service accounts use JWTs internally too — every pod is automatically mounted a JWT identifying it to the API server, which verifies it against the cluster's signing key to authorize `kubectl`-style API calls without a separate credential store.

## History
- JWT was standardized as RFC 7519 in 2015, alongside the related JWS (RFC 7515) and JWA (RFC 7518, defining the algorithms) specs, as part of a broader effort to standardize compact, URL-safe tokens for identity
- It grew out of earlier, heavier XML-based standards like SAML — JWT's pitch was a JSON-based, much smaller token that fit in an HTTP header or URL parameter without the XML tooling overhead
- Auth0's adoption and advocacy in the mid-2010s was a major driver of JWT becoming the default choice for API authentication, well before it was formally required by any major framework
- The algorithm-confusion and `alg: none` attacks discovered around 2015 pushed most mainstream libraries to require an explicit allowlist of accepted algorithms at verification time, rather than trusting whatever the token itself claims to use

## FAQ
**Is a JWT encrypted?** No, by default a JWT is signed (JWS), not encrypted — anyone can decode and read the payload. Use JWE if you need the contents hidden from the bearer too.

**Can I "log out" a JWT?** Not by itself — a valid, unexpired JWT stays valid until it expires unless you maintain a blocklist. This is why short expirations plus refresh tokens (which *can* be revoked server-side) are the standard pattern.

**Why not just use sessions?** Sessions require a shared, queryable store that every server instance can reach, which adds infrastructure and a round-trip per request. JWTs trade that operational cost for the harder-revocation problem — the right choice depends on whether your architecture needs stateless scaling more than it needs instant revocation.

**Are JWTs safe to use for password reset links?** Yes, commonly — with a very short `exp`, a single-use `jti` checked against a used-tokens store, and a purpose-specific claim so a reset token can't be replayed as a login token.

**What happens if the signing secret leaks?** An attacker can forge arbitrary valid tokens for any user, including admin roles — this is the single most catastrophic JWT failure mode, which is why secrets belong in a secrets manager (not source control or plain environment files) and should be rotated on any suspected compromise.

**Do JWTs work well for browser-based session replacement in general?** It's genuinely debated — many security engineers now recommend traditional server-side sessions with httpOnly cookies for browser apps specifically because of the revocation and storage tradeoffs, reserving JWTs for service-to-service and mobile/API use cases where statelessness matters more.

## Common Interview Questions

| Question | Short answer |
|---|---|
| What are the 3 parts of a JWT? | Header (algorithm/type), payload (claims), signature (over header+payload) |
| Is a JWT encrypted? | No, by default it's signed (JWS) — the payload is readable by anyone who has the token |
| How do you revoke a JWT before it expires? | You can't natively — you need a denylist keyed on `jti`, or keep expirations short and rely on refresh token revocation instead |
| What's the algorithm confusion attack? | Tricking a server that accepts both `RS256` and `HS256` into verifying a forged token by signing it with `HS256` using the RSA public key as the HMAC secret |
| Where should you store a JWT in a browser app? | An httpOnly, `Secure`, `SameSite` cookie — not `localStorage`, which is readable by any injected script via XSS |
| What's the difference between access and refresh tokens? | Access tokens are short-lived and sent on every request; refresh tokens are longer-lived, often opaque, and used only to mint new access tokens |
| Why use RS256 over HS256 in a microservices setup? | RS256 lets every service verify with a public key while only the auth server holds the private signing key — HS256 requires sharing one secret everywhere |
| What claim identifies the token's intended recipient? | `aud` (audience) — always validate it, not just the signature |

## Related Terms
- [[Session]]
- [[OAuth 2.0]]
- [[Cookies]]
- [[XSS (Cross-Site Scripting)]]
- [[SSO (Single Sign-On)]]
- [[CSRF (Cross-Site Request Forgery)]]
- [[Idempotency]]

## Example
A React app logs in, the backend returns a JWT, and the frontend sends it in the `Authorization` header on every API call: `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...`. Fifteen minutes later the token expires, the app silently uses its refresh token to get a new one, and the user never notices.

A microservices backend takes this further: the auth service signs tokens with `RS256` using a private key only it holds, and the order service, inventory service, and billing service each independently verify incoming tokens using the auth service's public key fetched once from a `/.well-known/jwks.json` endpoint — none of them ever call the auth service directly to check a token, which is the whole point of choosing JWTs over server-side sessions in that architecture.
