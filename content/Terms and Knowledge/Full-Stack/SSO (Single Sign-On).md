---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# SSO (Single Sign-On)

**Definition:** Logging in once and getting access to multiple separate apps or services without logging in again.

## How It Works
- A central identity provider (Okta, Azure AD, Google Workspace) authenticates the user once
- It issues a token that other connected apps trust
- The actual mechanics run on one of two protocol families: **SAML** (XML-based assertions, older, common in enterprise) or **OpenID Connect / OAuth 2.0** (JSON/JWT-based, newer, common in consumer and modern web apps)
- In a typical SP-initiated flow, the user hits a "service provider" (the app they want to use), the app redirects them to the identity provider (IdP) if there's no valid session, the IdP authenticates them (password, [[Multi-Factor Authentication|MFA]], etc.), and redirects back with a signed assertion or token proving who they are
- In an IdP-initiated flow, the user starts at the identity provider's dashboard (e.g. an Okta or Google Workspace app tile) and clicks through to the app already authenticated
- The app never sees the user's actual password — it only receives a cryptographically signed statement from the IdP saying "this is user X, verified at time Y"
- Subsequent apps in the same SSO session skip the credential prompt entirely because the browser already holds a valid session cookie with the IdP, so the redirect dance completes silently
- The token or assertion typically carries more than just identity — it often includes group membership, role, or department attributes the app can use directly for authorization decisions, avoiding a separate lookup call back to the IdP

## Why It Matters
- Standard in companies so employees don't juggle a dozen separate passwords across internal tools
- Centralizes access control: disabling one account at the IdP instantly revokes access to every connected app, which matters enormously for offboarding — without SSO, IT has to manually deprovision the departing employee from every single tool
- Centralizes security policy too: MFA, password complexity rules, and session timeout are enforced once at the IdP instead of inconsistently (or not at all) per app
- Reduces password fatigue and the resulting bad habits (password reuse, weak passwords, sticky notes) that come from users managing a dozen separate credentials
- Gives security teams a single audit log of authentication events across the whole company instead of fragmented logs per application
- Improves the login experience measurably — fewer password reset support tickets, faster onboarding for new hires who get access to their whole toolchain from one provisioning step
- Enables conditional access policies at a single choke point — e.g. requiring a managed device or blocking logins from unexpected countries, applied once at the IdP instead of reimplemented per app
- It's often a hard procurement requirement — many enterprise buyers won't purchase B2B SaaS software that doesn't support SSO, and it's common for vendors to gate SSO behind an "enterprise" pricing tier specifically because buyers will pay for it

## Common Pitfalls
- If the identity provider goes down, every connected app becomes inaccessible — a single point of failure
- Confusing SSO with [[OAuth 2.0]] itself — OAuth 2.0 is an authorization framework (granting scoped access to resources), not an authentication protocol; SSO is typically built on top of OpenID Connect, which adds an authentication layer on top of OAuth 2.0
- Trusting a SAML assertion without validating its digital signature — a forged or replayed assertion can let an attacker impersonate any user if the service provider doesn't verify it came from the real IdP
- Not handling session expiry consistently between the IdP and the service provider — a user's IdP session might time out while the app-side session cookie is still valid, leading to a confusing half-logged-in state
- Skipping "SP-initiated" vs "IdP-initiated" flow handling — apps that only support one flow break for users who expect the other, especially IdP-initiated logins from an internal app portal
- Rolling your own SAML or OIDC implementation instead of using a maintained library — these protocols have subtle security requirements (signature validation, audience restriction, replay protection) that are easy to get wrong
- Misconfiguring clock skew tolerance — SAML assertions and JWTs carry timestamps, and if the app server's clock drifts too far from the IdP's, valid tokens get rejected as "not yet valid" or "expired" intermittently, a maddening class of bug to diagnose
- Assuming SSO alone means "secure" — SSO consolidates authentication, it doesn't inherently add authorization logic; an app still needs its own role/permission checks after confirming who the user is

## Protocols Under the Hood
- **SAML 2.0** — the IdP sends an XML "assertion" containing the user's identity and attributes, digitally signed with XML Signature; the assertion is posted to the service provider's Assertion Consumer Service (ACS) URL via an auto-submitting HTML form. Verbose but extremely mature and still dominant in large enterprises and legacy systems
- **OpenID Connect (OIDC)** — layers an identity token (a signed [[JWT (JSON Web Token)]] called an `id_token`) on top of OAuth 2.0's authorization flows. The `id_token` contains standardized claims (`sub`, `email`, `iss`, `aud`, `exp`) that any client can verify with the IdP's public key
- **SCIM (System for Cross-domain Identity Management)** — usually paired with SSO, this is the protocol that handles provisioning/deprovisioning — automatically creating, updating, and disabling user accounts in downstream apps when they're added or removed at the IdP, so SSO handles "can they log in" and SCIM handles "does their account exist at all"
- Both SAML and OIDC rely on the same trust anchor: the service provider is configured with the IdP's public signing key (or a metadata URL to fetch it), so it can cryptographically verify any assertion or token really came from that IdP and wasn't forged or tampered with in transit
- Metadata exchange (a SAML metadata XML document, or an OIDC `.well-known/openid-configuration` JSON document) is how the app and IdP agree on endpoints, certificates, and supported algorithms without hand-typing configuration — most SSO integration work in practice is exchanging and importing these two metadata documents correctly

## History
- Early enterprise SSO in the 1990s/2000s often meant proprietary, vendor-locked solutions or Kerberos-based systems (Windows domain login, "Integrated Windows Authentication") that worked only within a single corporate network
- SAML 1.0 arrived in 2002 from OASIS, standardizing XML-based assertions for the first time across vendors; SAML 2.0 (2005) unified several competing efforts (including Liberty Alliance's ID-FF) into the version still used today
- OAuth 1.0 (2007) was designed purely for authorization (letting Twitter apps act on a user's behalf without their password) — it was never meant for authentication, but people misused it that way anyway, which caused enough confusion that OAuth 2.0 (2012) and later OpenID Connect (2014) explicitly separated and then re-combined the two concerns properly
- OpenID Connect's rapid adoption through the 2010s tracked the shift from server-rendered enterprise software to API-first, mobile-first, JSON-native applications — SAML's heavy XML and form-post redirects fit browsers well but were awkward for native mobile apps and JavaScript SPAs, which OIDC was designed to handle cleanly
- Identity-as-a-service providers (Okta founded 2009, Auth0 founded 2013) grew specifically to spare companies from running their own IdP infrastructure, turning SSO from a bespoke IT project into an off-the-shelf subscription
- Passkeys and FIDO2/WebAuthn (standardized 2018-2019) represent the most recent shift, pushing the *initial* IdP login itself away from passwords entirely, layered underneath the same SSO trust model described above
- Today's landscape has largely consolidated around OIDC for new integrations, with SAML remaining entrenched wherever it was already deeply wired into enterprise IT — replacing a working SAML integration is rarely worth the migration cost, so both protocols will likely coexist in production systems for years to come

## Variants
- **Enterprise SSO** — company-internal, IdP is Okta/Azure AD/OneLogin/Ping, apps are internal tools and SaaS subscriptions
- **Social login** — "Sign in with Google/Apple/GitHub," consumer-facing, built on OAuth 2.0/OIDC, technically single sign-on across sites that support the same provider even though it's rarely called "SSO" in that context
- **Federated SSO** — trust spans organizational boundaries (e.g. university consortiums using Shibboleth/SAML so a student's home-institution login works at partner institutions)
- **Cross-domain SSO** — single sign-on across multiple domains owned by the same company (e.g. `mail.company.com` and `docs.company.com`), often implemented with shared cookies on a common parent domain plus a lightweight token exchange
- **Just-in-Time (JIT) provisioning** — a variant where the user's account in the app is created automatically on their very first SSO login, based on attributes in the assertion/token, instead of requiring pre-provisioning
- **WS-Federation** — an older Microsoft-driven alternative to SAML, still found in some legacy .NET and SharePoint environments, largely superseded by SAML and OIDC in new deployments
- **Passwordless SSO** — the login step at the IdP itself uses a passkey, magic link, or hardware security key instead of a password, but everything downstream (token issuance, trust between app and IdP) works identically to password-based SSO
- **Delegated/broker SSO** — a middle-tier identity broker sits between many apps and many upstream IdPs (common when a platform needs to support customer-supplied IdPs, e.g. a B2B SaaS product letting each enterprise customer bring their own Okta/Azure AD tenant)

## Deeper Dive: Single Logout (SLO)
- Single Logout is the underappreciated counterpart to single sign-on — it's supposed to end the session everywhere at once when the user logs out anywhere, but it's notoriously harder to implement reliably than single sign-on itself
- The mechanism typically requires the IdP to send a logout request to every service provider the user is currently signed into, either via browser redirects (front-channel) or direct server-to-server calls (back-channel)
- Front-channel SLO breaks easily in practice — if one app in the chain is slow, offline, or the browser blocks a redirect, the chain stops and some apps never receive the logout signal, leaving "zombie" sessions active
- Because of this unreliability, many organizations rely on short session/token lifetimes plus IdP-side session revocation as a backstop rather than depending on SLO propagating perfectly to every app
- This is a common gap auditors look for: ask "if I disable a user at the IdP right now, how long until their existing app sessions actually die?" — the honest answer for many SSO deployments is "up to the token's remaining lifetime," not "instantly"
- Some apps mitigate this by checking token validity against the IdP on every request instead of trusting a locally cached session, trading a small latency cost for near-instant revocation

## Comparison: SAML vs OIDC

| | SAML 2.0 | OpenID Connect |
|---|---|---|
| Data format | XML | JSON / JWT |
| Built on | Its own standard | OAuth 2.0 |
| Typical use | Enterprise, legacy | Modern web, mobile, consumer |
| Token | Signed XML assertion | Signed JWT (`id_token`) |
| Mobile-friendliness | Poor (heavy, form-post based) | Good (native JSON, REST-friendly) |
| Where it shines | Large enterprise IT with existing SAML infra | Greenfield apps, API-first architectures |

## Code Example
```http
GET /app/dashboard HTTP/1.1
Host: app.example.com

HTTP/1.1 302 Found
Location: https://idp.example.com/sso/authorize
  ?response_type=code
  &client_id=app-example-com
  &redirect_uri=https://app.example.com/callback
  &scope=openid%20profile%20email
  &state=xk3ndj28
```

```json
// Decoded OIDC id_token payload received at the callback
{
  "iss": "https://idp.example.com",
  "sub": "user-48213",
  "aud": "app-example-com",
  "email": "user@example.com",
  "exp": 1893456000,
  "iat": 1893452400
}
```
The app verifies the token's signature against the IdP's published public key, checks `aud` matches its own client ID, checks `exp` hasn't passed, and only then creates a local session for the user. Skipping any one of these checks (a shockingly common bug in hand-rolled implementations) turns a supposedly secure login flow into one where a stale, mismatched, or outright forged token gets accepted.

## Best Practices
- Always validate signatures and expiry server-side — never trust a token or assertion just because it arrived on the expected redirect URL
- Use a maintained library (`python3-saml`, `passport-saml`, `openid-client`) rather than hand-parsing XML or JWTs
- Enforce `aud` (audience) and `iss` (issuer) checks to prevent a token issued for a different app from being replayed against yours
- Pair SSO with SCIM provisioning so account lifecycle (creation, role changes, deactivation) is automated, not manual
- Have a documented break-glass procedure for when the IdP is unreachable — at least one emergency local-auth path for critical admin access, tightly controlled and logged
- Rotate the IdP's signing keys periodically and make sure every connected service provider re-fetches the updated metadata automatically rather than caching a stale public key indefinitely
- Restrict which redirect URIs the IdP will send tokens to (`redirect_uri` allowlisting) — an open redirect here is a classic way to exfiltrate authorization codes or tokens to an attacker-controlled endpoint
- Review which attributes/claims are actually needed in the token and avoid over-sharing personal data (name, department, manager) to service providers that don't need it, in line with data minimization principles
- Log every authentication event (success, failure, IdP used) centrally for security monitoring and incident response
- Keep token/assertion lifetimes short and rely on silent re-authentication (via the existing IdP session cookie) rather than long-lived tokens, so a compromised token has a small blast radius
- Test the "IdP is down" scenario deliberately before it happens in production — most teams discover their break-glass path doesn't actually work during a real outage, which is the worst possible time to find out

## FAQ
- **Is SSO the same as OAuth?** No — OAuth 2.0 is about delegated authorization (letting an app access a resource on your behalf with limited scope); SSO is about authentication (proving who you are once, reused across apps), typically implemented via OpenID Connect, which is built on top of OAuth 2.0.
- **What happens to my session if I log out of one app?** Depends on whether Single Logout (SLO) is implemented — without it, logging out of one app doesn't end your IdP session or your session in other connected apps, which surprises a lot of users and is a common security gap.
- **Can SSO work without the internet reaching the identity provider?** No — SSO requires a live round trip to the IdP for the initial authentication (and often for token refresh), which is exactly why IdP downtime is such a severe single point of failure.
- **Why do enterprises pay extra for SSO?** Vendors know large buyers require it for compliance and operational reasons (fast offboarding, centralized MFA), so it's priced as a premium feature — informally nicknamed the "SSO tax" in the SaaS industry.
- **Does SSO replace MFA?** No, they solve different problems — SSO consolidates where you authenticate, MFA strengthens how you authenticate. Most serious deployments require MFA at the IdP precisely because a single compromised password now grants access to everything, not just one app.
- **What is an Identity Provider (IdP) vs a Service Provider (SP)?** The IdP (Okta, Azure AD) authenticates users and issues tokens/assertions; the SP (your app) consumes and trusts those tokens instead of managing its own username/password store.
- **What is the `state` parameter for in an OIDC/OAuth redirect?** It's an opaque, app-generated value round-tripped through the IdP and checked on return, defending against cross-site request forgery on the login flow itself — without it, an attacker could trick a victim into completing an authorization flow the attacker initiated.

## Real-World Example
A well-known SSO failure mode: in 2021 several large SaaS outages were caused not by the SaaS product itself failing but by its upstream identity provider (Okta, Auth0, or similar) having an incident — because every connected app checks in with the IdP for authentication, a 30-minute IdP outage can lock employees at hundreds of companies out of dozens of tools simultaneously. It's a textbook illustration of why "reduces the number of things that can fail" (fewer passwords, fewer credential stores) and "creates a single point of failure" are the same architectural decision viewed from two angles — SSO doesn't remove risk, it concentrates it in one place, which is easier to secure and monitor but also a much higher-value target and a much bigger blast radius if it goes down.

## Common Interview Questions
- **Walk through what happens when a user clicks "Sign in with Google."** The app redirects to Google's OAuth/OIDC authorization endpoint with a `client_id`, requested `scope`, and `redirect_uri`; the user authenticates (or Google recognizes an existing session) and consents; Google redirects back with an authorization code; the app's backend exchanges that code for tokens (including an `id_token`) via a server-to-server call; the app verifies the token and creates a local session.
- **Why can't the service provider just trust the `id_token` without checking the signature?** Because without signature verification, anyone could forge a token claiming to be any user — the signature is the only thing proving the token actually came from the IdP and wasn't fabricated or altered.
- **What's the difference between SP-initiated and IdP-initiated SSO, and why does IdP-initiated carry more risk?** SP-initiated starts at the app and redirects to the IdP with state the app can verify on return (like a `state` parameter to prevent CSRF); IdP-initiated starts at the IdP with no prior request from the app to correlate against, which historically made some IdP-initiated SAML flows more vulnerable to replay attacks unless carefully implemented.

## Related Terms
- [[OAuth 2.0]]
- [[JWT (JSON Web Token)]]
- [[Session]]
- [[Cookies]]

## Example
Logging into Slack once, and it also signs you into your company's other internal tools automatically. Concretely: an employee opens their Okta dashboard in the morning, authenticates with a password plus a push notification to their phone (MFA), and from then on clicking the Slack, Google Workspace, Jira, and Zoom tiles logs them straight in — no additional password prompts — because each app trusts the SAML assertion or OIDC token Okta issued during that first authentication.

When that same employee leaves the company, an admin disables their single Okta account, and every one of those app-level sessions and future login attempts is cut off without anyone needing to remember which dozen individual SaaS tools also had a standalone password for that person.
