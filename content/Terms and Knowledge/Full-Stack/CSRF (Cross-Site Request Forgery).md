---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# CSRF (Cross-Site Request Forgery)

**Definition:** An attack that tricks a logged-in user's browser into sending an unwanted request to a site they're authenticated on.

## How It Works
- Attacker hosts a page that auto-submits a form or request to your bank's site
- Your browser auto-attaches the session cookie, so the request looks legitimate to the server
- The victim doesn't need to click anything malicious-looking; a hidden auto-submitting `<form>`, a crafted `<img>` tag for a `GET`-based state change, or a script firing `fetch` on page load is enough
- The server, from its perspective, sees a perfectly normal, correctly authenticated request. It has no built-in way to tell "the user clicked a button on my site" apart from "the browser was told to send this request by some other site"

## Why It Matters
- Anything using cookie-based auth needs to defend against this
- It's a "confused deputy" attack: the browser is tricked into misusing the authority (the cookie) it legitimately holds, on behalf of an attacker who never had that authority themselves
- Historically responsible for real-world exploits ranging from unauthorized password changes to unauthorized money transfers and router reconfiguration (CSRF against home router admin panels was a common early 2010s attack)

## Common Pitfalls
- Assuming cookies alone are safe
- Defenses: CSRF tokens, `SameSite=Strict` or `Lax` cookies
- Protecting `POST`/`PUT`/`DELETE` routes with a CSRF token but leaving a `GET` route that triggers a state change (like `GET /delete-account?id=5`) completely unprotected, `GET` requests are exactly what a plain `<img src="...">` tag can trigger with zero JavaScript
- Storing the CSRF token itself in a cookie without pairing it with a second check (the "double submit" pattern below), a cookie-only token can be read and resubmitted by the same cross-site request it's meant to stop
- Relying solely on checking the `Referer`/`Origin` header, some legitimate clients strip or omit it (privacy-focused browsers, certain proxies), and it shouldn't be your only line of defense even though it's a reasonable supplementary check
- Using a single, static, application-wide CSRF token that never rotates, if it ever leaks once (a logged request, a browser extension, a misconfigured analytics tool), it's compromised indefinitely; per-session or per-request tokens limit the blast radius
- Assuming CORS protects against CSRF. It doesn't: CORS governs whether JavaScript can *read* a cross-origin response, but a form submission or simple cross-origin request is still *sent* and still executes server-side regardless of CORS headers

## Under the Hood: Why the Browser Cooperates

The root cause is that cookies are attached to requests based on the target domain, not based on which page initiated the request. If `example.com` set a session cookie, any request to `example.com`, whether initiated by `example.com` itself or by `evil.com` embedding a form that targets `example.com`, gets that cookie attached automatically by the browser. This is fundamentally different from, say, `localStorage`, which is only readable by JavaScript running on the same origin, which is precisely why token-based auth stored in `localStorage` is immune to CSRF (though it opens up XSS-related risks instead, see the comparison below).

```html
<!-- Hosted on evil.com; victim just has to visit this page while logged into bank.com -->
<form id="csrf" action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker-account" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.getElementById('csrf').submit();</script>
```

If `bank.com` only checks "is there a valid session cookie," this form submission from `evil.com` looks completely legitimate.

## Defenses, In Depth

**Synchronizer Token Pattern (classic CSRF token)**: the server embeds a random, unpredictable token in each rendered form (or provides one via an API endpoint), and requires that exact token to be resubmitted as a request parameter or header. An attacker on a different origin can't read the victim's page to steal that token (Same-Origin Policy blocks it), so they can't forge a valid request.

**Double Submit Cookie**: the server sets the token in a cookie *and* requires the client-side JavaScript to also send it as a header. Since an attacker's cross-site form can't read the cookie's value (again, Same-Origin Policy), they can't replicate it in the header the server checks for.

**`SameSite` Cookies**: the modern, lower-effort defense. Setting `SameSite=Lax` (now the browser default when unspecified) prevents cookies from being sent on cross-site `POST` requests, sub-resource requests, and most background requests, while still allowing them on top-level navigation (clicking a link). `SameSite=Strict` blocks cookies on cross-site requests entirely, including top-level navigation, which can break legitimate flows like clicking an email link that should land you logged in.

**Custom header requirement**: requiring a custom header like `X-Requested-With` on state-changing requests works as a lightweight CSRF defense because HTML forms cannot set arbitrary custom headers, only JavaScript's `fetch`/`XHR` can, and cross-origin JavaScript is itself constrained by CORS.

**Origin/Referer verification**: comparing the `Origin` (or fallback `Referer`) header on incoming state-changing requests against an allowlist of expected origins. Cheap to implement and effective as a supplementary layer, but shouldn't be the sole defense since some proxies and privacy tools strip these headers on legitimate requests too.

## Variants Worth Knowing

**Login CSRF**: instead of forging a state change, the attacker forges a login request using *their own* credentials, logging the victim's browser into the attacker's account without the victim noticing. The victim then unknowingly saves data (a credit card, a search history) into the attacker's account, which the attacker later retrieves. This is why login forms deserve CSRF protection too, not just "sensitive" authenticated actions.

**Clickjacking-assisted CSRF**: the attacker overlays a transparent iframe of the real site over a decoy page, so what looks like an innocuous button click actually submits a real form on the legitimate site. `X-Frame-Options: DENY` or a CSP `frame-ancestors` directive prevents the page from being framed at all, closing off this variant regardless of CSRF token presence.

**JSON-based CSRF**: less common but possible when an endpoint accepts loosely-typed content and a server doesn't strictly enforce `Content-Type: application/json`, some browsers or misconfigured CORS setups have allowed attackers to submit JSON-like payloads via a form with `enctype="text/plain"`, exploiting lax parsing on the server side.

## Comparison: CSRF vs XSS

| | CSRF | [[XSS (Cross-Site Scripting)]] |
|---|---|---|
| What's exploited | The browser's automatic cookie attachment | The site's failure to sanitize user input/output |
| Attacker needs | Only to get the victim to load a page/request | To inject and execute their own script on the victim's page |
| Can read response data? | No, it's a blind, one-way forged request | Yes, injected script runs with full page access |
| Primary defense | CSRF tokens, `SameSite` cookies | Output encoding, Content-Security-Policy |
| Relationship | XSS can be used to *steal* a CSRF token, defeating CSRF protection entirely | Independent vulnerability class |

They're often paired in discussion because both abuse a victim's authenticated browser session, but the mechanisms and defenses are distinct, and notably, a successful XSS attack can bypass CSRF protections by just reading the token directly from the DOM.

## Code Example

```js
// Express + csurf-style middleware (conceptual)
app.use(csrfProtection);

app.get('/transfer-form', (req, res) => {
  res.render('transfer', { csrfToken: req.csrfToken() });
});

app.post('/transfer', (req, res) => {
  // Middleware already validated req.body._csrf against the session
  // before this handler runs; request is rejected upstream otherwise
  processTransfer(req.body);
  res.redirect('/success');
});
```

```http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
```

`SameSite=Lax` here means this cookie won't be sent on a cross-site `POST` (blocking the classic CSRF form-submit attack) but will still be sent when the user clicks a normal link into the site from elsewhere, a reasonable default for most session cookies.

## History

CSRF was documented as early as 2001 but stayed poorly understood and under-defended-against for years, it didn't get a catchy name or wide security-community attention until the mid-2000s, and it consistently made OWASP's Top 10 list of web application security risks throughout the 2010s. The `SameSite` cookie attribute, standardized around 2016 and defaulted to `Lax` by Chrome starting in 2020, was a major turning point: it moved CSRF mitigation from something every application developer had to remember to implement correctly into something the browser does by default, dramatically reducing the attack's prevalence without requiring any application code changes at all.

## Real-World Example
In 2008, a well-publicized CSRF vulnerability in home routers let an attacker embed an invisible image tag pointing at the router's admin panel, `<img src="http://192.168.1.1/admin/dns-set?server=attacker-dns">`, on any web page. If a victim's browser had ever authenticated to their router's admin panel (many routers shipped with default credentials the browser had cached, or no auth challenge at all for `GET` requests), simply visiting an unrelated malicious page could silently rewrite the router's DNS settings, redirecting all future traffic through an attacker-controlled DNS server. This is the canonical example of why state-changing actions should never be reachable via a plain `GET` request.

## Best Practices
- Set `SameSite=Lax` (or `Strict` for highly sensitive actions) on all session cookies as a baseline defense, even before adding explicit tokens
- Use CSRF tokens on every state-changing request (`POST`/`PUT`/`PATCH`/`DELETE`), not just the ones that "feel" sensitive
- Never perform state changes on `GET` requests, `GET` should be safe and idempotent by convention, this closes off the `<img>`-tag attack vector entirely, see [[Idempotency]] and [[HTTP Methods]]
- Regenerate the CSRF token after login (session fixation defense) and tie it to the user's session server-side
- If using token-based auth (JWT in a header instead of a cookie) specifically to sidestep CSRF, be aware you've traded this risk for needing airtight XSS defenses instead, see [[JWT (JSON Web Token)]]
- Protect login endpoints with CSRF tokens too, not just post-authentication actions, to close off login CSRF
- Pair CSRF defenses with `X-Frame-Options` or CSP `frame-ancestors` so clickjacking can't be used to route around token checks by tricking a real user into clicking a hidden, legitimate submit button

## Related Terms
- [[Cookies]]
- [[HTTP Methods]]
- [[Idempotency]]
- [[XSS (Cross-Site Scripting)]]
- [[Session]]
- [[CORS (Cross-Origin Resource Sharing)]]
- [[JWT (JSON Web Token)]]

## Example
A malicious email link that silently submits a "transfer money" form using your existing bank session. The victim, already logged into their bank in another tab, clicks a link in a phishing email that lands on an attacker-controlled page. That page auto-submits a hidden form to `bank.com/transfer` the instant it loads. The browser dutifully attaches the victim's `bank.com` session cookie, and unless the bank has CSRF tokens or `SameSite` cookies in place, the transfer goes through with no visible warning to the victim.

## FAQ

**Does HTTPS protect against CSRF?**
No. HTTPS protects data in transit from being intercepted or tampered with, it has nothing to do with which site initiated a request. A CSRF attack from `evil.com` to `https://bank.com` works exactly the same over HTTPS as it would over HTTP.

**If I use JWTs stored in `localStorage` instead of cookies, am I immune to CSRF?**
Effectively yes, since the attacker's page can't read `localStorage` from a different origin to attach the token, and the browser doesn't auto-attach it the way it does cookies. But you've now made XSS strictly worse: if an attacker achieves XSS, they can read the token straight out of `localStorage` and exfiltrate it entirely, whereas an `HttpOnly` cookie can't be read by JavaScript at all, even via XSS.

**Is CSRF still relevant now that `SameSite=Lax` is the browser default?**
Less common than it used to be, but not solved. Older browsers, misconfigured `SameSite=None` cookies (sometimes required for legitimate third-party embed scenarios), and `GET`-based state changes are all still exploitable. Defense in depth, tokens plus `SameSite`, remains the recommended approach rather than relying on the default alone.

**Why does `SameSite=None` exist if it disables CSRF protection?**
Legitimate use cases need cookies sent cross-site, a third-party payment widget embedded in an iframe, or a single sign-on flow that redirects across domains. `SameSite=None` explicitly opts back into the old cross-site cookie behavior for those cases, but the spec requires it to be paired with `Secure` (HTTPS-only), and applications using it are expected to compensate with explicit CSRF tokens since the browser is no longer providing any protection for that cookie.

**Do single-page apps calling a JSON API need CSRF protection?**
Yes, if they authenticate via cookies. The fact that the API only accepts `application/json` bodies provides some incidental protection, since a plain HTML form can't set that content type without triggering a CORS preflight that a properly configured server would reject, but relying on that as your only defense is fragile. Explicit CSRF tokens or `SameSite` cookies are still the recommended baseline.

**Can a CAPTCHA prevent CSRF?**
It can as a side effect, since it breaks fully automated form auto-submission, but it's a poor primary defense: it also breaks the legitimate user experience, doesn't scale to every state-changing endpoint, and doesn't address the root cause the way tokens or `SameSite` cookies do. It's better thought of as a bot/abuse mitigation than a CSRF-specific control.

**Does re-entering a password before a sensitive action help against CSRF?**
Yes, this is a legitimate and common supplementary defense ("re-authentication" or "step-up auth"), since the attacker's forged request can't supply a password the victim never typed. It's typically reserved for the highest-risk actions (changing account email, deleting an account) rather than applied universally, since it adds real friction to the user experience.
