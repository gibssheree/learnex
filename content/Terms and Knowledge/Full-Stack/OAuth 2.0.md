---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# OAuth 2.0

**Definition:** A protocol that lets a user grant one app limited access to their data on another app, without sharing their password.

## How It Works
- User is redirected to the provider (e.g. Google)
- User approves the requested access
- Provider gives your app a token, not the user's password
- The four core roles: **resource owner** (the user), **client** (your app), **authorization server** (issues tokens, e.g. Google's OAuth endpoint), **resource server** (holds the data, e.g. Google Calendar's API)
- The client never sees the user's provider credentials — it only ever receives a token scoped to specific permissions

## Why It Matters
- The standard way to build "Login with Google/GitHub" and third-party API integrations
- Lets a user revoke one app's access without changing their password everywhere else
- Scopes mean an app that just wants your email doesn't get full account control by default

## Grant Types (Flows)
OAuth 2.0 isn't one flow — it's a family of flows for different client types. Picking the wrong one is a common source of vulnerabilities.

- **Authorization Code** — the standard flow for server-side web apps. Client redirects the user to the auth server, gets a short-lived code back via redirect, then exchanges that code for a token server-to-server (this exchange step keeps the token out of the browser's URL bar and history)
- **Authorization Code + PKCE** — same as above but adds a `code_verifier`/`code_challenge` pair, mandatory for SPAs and mobile apps that can't safely store a client secret. Now recommended for *all* clients, even confidential ones
- **Client Credentials** — machine-to-machine, no user involved. A backend service authenticates with its own client ID/secret to get a token (e.g. a cron job calling a partner API)
- **Refresh Token** — exchanges a long-lived refresh token for a new short-lived access token, without forcing the user to log in again
- **Implicit Flow** — deprecated. Returned the access token directly in the redirect URL fragment, exposing it in browser history and referrer headers. PKCE replaced it
- **Resource Owner Password Credentials** — client collects the user's username/password directly and trades them for a token. Deprecated; defeats the entire point of OAuth (never handling the user's password) and should only exist for legacy first-party migrations

## Access Tokens vs Refresh Tokens
- **Access token**: short-lived (minutes to ~1 hour), sent with every API request, usually a [[JWT (JSON Web Token)]] or opaque string validated against the auth server
- **Refresh token**: long-lived (days to months), stored securely, used only to mint new access tokens — never sent to resource servers
- Short access token lifetimes limit the blast radius if one leaks; the refresh token is the more sensitive of the two because it can mint indefinite new access

## Why It Matters (Scopes)
- Scopes are the mechanism for least-privilege access: `repo` vs `repo:status` on GitHub, or `calendar.readonly` vs `calendar` on Google
- A well-designed API defines granular scopes so a "read your public profile" app can't accidentally also request "delete your repos"
- Users see the requested scopes on the consent screen — vague or over-broad scope requests are a red flag during a security review and hurt conversion on the consent screen itself

## Under the Hood: Token Validation
When your resource server receives a bearer token, it has two ways to check it's legitimate:
- **Self-contained (JWT) tokens**: verify the signature locally using the auth server's public key (fetched once from a `/.well-known/jwks.json` endpoint and cached). Fast, no network call per request, but you can't instantly revoke one token — it's valid until it expires
- **Opaque tokens**: call the auth server's `/introspect` endpoint on every request to ask "is this still valid?" Slower and adds a dependency, but revocation is immediate since the check happens live

Most high-traffic APIs pick JWTs for the read-heavy path and keep access token lifetimes short (5-15 minutes) specifically to bound how long a revoked-but-still-valid token stays dangerous.

## OAuth vs API Keys
A plain API key is a single static secret with no built-in expiry, scoping, or per-user identity — fine for server-to-server calls where you control both ends, but wrong for "let user X grant app Y limited access to their own data." OAuth adds:
- Per-user, per-app tokens (revoke one app without touching others)
- Expiry and refresh, so a leaked token has a shelf life
- Scopes, so access can be narrower than "everything this API key can do"

That's also why OAuth's client credentials grant — not a raw API key — is the correct choice even for pure machine-to-machine auth when you want expiry and scoping.

## Common Pitfalls
- Confusing OAuth (authorization: "can this app access X") with authentication (who the user actually is) — OpenID Connect layers identity on top of OAuth
- Skipping the `state` parameter, which exists specifically to prevent CSRF attacks against the redirect callback
- Using the Implicit flow for a new app in 2024+ — use Authorization Code + PKCE instead, even for public clients
- Storing the client secret in frontend JS bundles — anything shipped to the browser is public, secrets belong server-side only
- Not validating the `redirect_uri` strictly on the authorization server, allowing open-redirect style token theft
- Treating an access token like a session cookie and never expiring it

## Related Terms
- [[SSO (Single Sign-On)]] — often built on top of OAuth/OIDC across multiple internal apps sharing one identity provider
- [[JWT (JSON Web Token)]] — the common format for access and ID tokens, though OAuth doesn't require it
- [[Session]] — the stateful alternative OAuth's bearer-token model replaces for API auth
- [[Cookies]] — sometimes used to carry tokens for first-party web apps, with the XSS/CSRF tradeoffs that implies
- [[CSRF (Cross-Site Request Forgery)]] — the exact attack the `state` parameter defends the redirect callback against

## Real-World Example
A project management SaaS integrates with Slack so it can post notifications into a channel. The integration flow: your backend redirects the admin to Slack's OAuth authorize URL requesting the `chat:write` and `channels:read` scopes. The admin picks a workspace and approves. Slack redirects back to your registered callback with a code. Your server exchanges it for a bot token scoped only to that workspace, stores it encrypted against the tenant's record, and uses it for all future `chat.postMessage` calls. If the admin later disconnects the integration from Slack's app directory, Slack revokes the token and your next API call fails with a 401 — no coordination required on your end, because the authorization server owns revocation.

## OAuth vs OpenID Connect (OIDC)

| | OAuth 2.0 | OpenID Connect |
|---|---|---|
| Answers | "What can this app do?" | "Who is this user?" |
| Returns | Access token | Access token + ID token (a JWT) |
| Payload | Opaque to the client | ID token contains user claims (name, email, sub) |
| Use case | Authorization to an API | Authentication / login |

OIDC is literally OAuth 2.0 plus a standardized `id_token` and a `/userinfo` endpoint. "Login with Google" is technically an OIDC flow riding on top of OAuth machinery.

## Code Example
Authorization Code flow, server-side exchange:

```http
GET /oauth/authorize?
  response_type=code&
  client_id=abc123&
  redirect_uri=https://myapp.com/callback&
  scope=read:user&
  state=xyz789 HTTP/1.1
Host: github.com
```

```http
POST /oauth/access_token HTTP/1.1
Host: github.com
Content-Type: application/x-www-form-urlencoded

client_id=abc123&
client_secret=SERVER_SIDE_ONLY&
code=THE_CODE_FROM_CALLBACK&
redirect_uri=https://myapp.com/callback
```

The second request happens server-to-server — the client secret never touches the browser.

## Common Interview Questions
- "Walk me through the Authorization Code flow" — expect the redirect, consent, code exchange, and why the exchange happens server-to-server
- "Why was the Implicit flow deprecated?" — token exposure in the URL fragment, no refresh token support, no way to bind the token to the requesting client (which PKCE fixes)
- "How would you revoke access early for a compromised token?" — either short expiry plus refresh token rotation, or opaque tokens validated via introspection on every call
- "What's the difference between OAuth and OIDC?" — OAuth answers authorization, OIDC layers a standardized identity token (`id_token`) on top for authentication

## Best Practices
- Always validate and compare the `state` parameter on callback
- Use PKCE even for confidential clients — it's cheap insurance
- Set the shortest access token lifetime your UX can tolerate
- Store refresh tokens encrypted at rest, rotate them on use (refresh token rotation detects replay)
- Scope requests to the minimum the app actually needs
- Register exact-match `redirect_uri` values with the provider rather than wildcard patterns
- Log token issuance and refresh events for audit trails — a sudden spike in refresh calls for one account is a compromise signal
- Never log full token values, even in debug output; log a token ID or hash instead
- Prefer HttpOnly, Secure cookies over `localStorage` when a first-party web app needs to hold a token, to reduce exposure to [[XSS (Cross-Site Scripting)]]
- Rotate client secrets periodically and immediately after any suspected leak (accidental commit, log exposure, departing contractor)

## History
- OAuth 1.0 (2007) required cryptographic request signing on every call — secure but painful to implement correctly
- OAuth 2.0 (RFC 6749, 2012) dropped signing in favor of bearer tokens over mandatory TLS, trading some cryptographic guarantees for dramatically simpler client implementation
- OAuth 2.0 is not backward compatible with 1.0 — they're different protocols that happen to share a name
- PKCE (RFC 7636, 2015) was originally designed for mobile apps, then became the recommended default for every client type once the Implicit flow's weaknesses became widely exploited

## FAQ
**Is an OAuth access token the same as a session?**
No. A session is server-side state tied to a cookie; an OAuth token is a portable credential that can be validated by any resource server that trusts the issuer, without a shared session store.

**Why does GitHub/Google show me a permissions screen every time I connect a new app?**
That's the consent step — the authorization server enforcing that the resource owner (you) explicitly approves the requested scopes before issuing a token. Skipping it would let any app silently gain access.

**Can I decode and read an access token?**
Only if it's a JWT — many providers issue opaque tokens instead, which only the authorization server can introspect. Never assume a token's format; check the provider's docs.

**Do I need my own OAuth server to add "Login with Google"?**
No — you're the *client* in that flow. You only need to run an authorization server yourself if you're the one issuing tokens to third-party apps (e.g. building a public API/platform like Slack or GitHub does).

## Example
The "Continue with GitHub" button on a SaaS signup page. Under the hood: redirect to GitHub, user approves `read:user` and `user:email` scopes, GitHub redirects back with a code, your server exchanges that code for an access token, then calls `api.github.com/user` with it to fetch the profile and create the account. The user never typed their GitHub password into your app, and revoking access later is a single click in GitHub's settings — no password reset required.
