---
tags: [term, fullstack, frontend, security]
category: Frontend & State
---

# Local Storage vs Session Storage

**Definition:** Two browser APIs for storing key-value data client-side, differing in how long the data persists.

## How It Works
- `localStorage` persists until explicitly cleared, even after closing the browser
- `sessionStorage` clears the moment the tab closes
- Both are part of the [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), exposed as `window.localStorage` and `window.sessionStorage`
- Both store only strings — objects must be serialized with `JSON.stringify()` before writing and parsed with `JSON.parse()` after reading
- Both are scoped per-origin (scheme + host + port), so `https://app.example.com` and `http://app.example.com` see completely separate stores
- `sessionStorage` is additionally scoped per-tab: opening the same URL in a second tab gets a fresh, empty store, even though `localStorage` would be shared
- Duplicating a tab (or restoring a crashed session in some browsers) copies `sessionStorage` into the new tab; opening a link in a new tab does not
- Reads and writes are synchronous and block the main thread, unlike `IndexedDB` which is asynchronous

## Under the Hood
- Both APIs implement the same `Storage` interface: `setItem(key, value)`, `getItem(key)`, `removeItem(key)`, `clear()`, `key(index)`, and a `.length` property
- Data is stored on disk (`localStorage`) or in memory (`sessionStorage`, in most implementations) per-origin, not sent automatically with every HTTP request the way cookies are
- Typical storage limit is around 5-10MB per origin (varies by browser), versus roughly 4KB per cookie
- Setting a value fires a `storage` event on *other* tabs/windows sharing the same origin (not the tab that made the change) — useful for cross-tab sync like "logged out in one tab, log out everywhere"
- Writing past the quota throws a `DOMException` (`QuotaExceededError`), so production code should wrap writes in try/catch
- In "private" or "incognito" browsing modes, storage is typically still writable but wiped when the session ends

## Why It Matters
- A common, but risky, place developers store auth tokens or user preferences
- Both are readable by any JavaScript running on the page, including third-party scripts and injected malicious code — there's no built-in access restriction like `HttpOnly` on cookies
- Neither is sent to the server automatically, so server-rendered auth checks (like checking a session cookie on the first HTML request) can't rely on them
- `sessionStorage`'s per-tab isolation makes it a natural fit for wizard/multi-step form state that shouldn't leak between tabs
- `localStorage`'s persistence makes it the default choice for things like theme preference, feature flag caches, or "don't show this dialog again" flags

## Common Pitfalls
- Storing sensitive tokens like JWTs in `localStorage` — any XSS-injected script can read it, unlike an `HttpOnly` cookie
- Assuming `sessionStorage` survives a browser crash/restore reliably across all browsers — behavior is inconsistent
- Forgetting that storage is per-origin: a switch from `http://` to `https://`, or a subdomain change, silently loses access to previously stored data
- Not handling `QuotaExceededError` when storage is full or disabled (e.g., some privacy-focused browser settings block Web Storage entirely)
- Treating `localStorage` as a database — it has no querying, no indexes, no transactions, and blocks the main thread on every read/write
- Forgetting values are always strings: `localStorage.getItem('count') + 1` produces string concatenation (`"51"` instead of `6`), not addition
- Not accounting for the `storage` event firing only in *other* tabs, then being surprised same-tab logic doesn't react to its own writes

## Comparison

| | `localStorage` | `sessionStorage` | Cookie |
|---|---|---|---|
| Persistence | Until cleared | Until tab closes | Configurable expiry |
| Scope | Per-origin | Per-origin + per-tab | Per-domain (configurable path) |
| Sent to server | Never | Never | Every matching request |
| Capacity | ~5-10MB | ~5-10MB | ~4KB |
| Accessible to JS | Always | Always | Only if not `HttpOnly` |
| Sync/Async | Synchronous | Synchronous | N/A (header-based) |

## Variants
- **[[IndexedDB]]** — an asynchronous, transactional, indexed object database for larger structured data (offline caches, large datasets); the right tool when Web Storage's size or synchronous-blocking limits become a problem
- **Cache API** (via [[Service Worker|Service Workers]]) — stores request/response pairs for offline-first apps, distinct from key-value storage
- **[[Cookies]]** — the only client-side storage mechanism that's automatically transmitted to the server, and the only one that supports `HttpOnly` (JS-inaccessible) and `Secure`/`SameSite` flags

## Best Practices
- Never store raw JWTs, refresh tokens, or PII in either Web Storage API if XSS is a realistic threat — prefer `HttpOnly` cookies for auth state
- If you must store tokens client-side (e.g., SPA with no backend session), keep the access token short-lived and store the refresh token server-side or in an `HttpOnly` cookie
- Namespace keys (`app:theme`, `app:draft-post-123`) to avoid collisions with other scripts or future features sharing the same origin
- Wrap `setItem` calls in try/catch to handle quota errors and Safari's private-mode restrictions gracefully
- Use `sessionStorage` for anything that should NOT survive a copy-pasted URL opened in a new tab, like a multi-step checkout form's in-progress state

## FAQ
**Does clearing cookies also clear localStorage?** No — they're independent stores; "Clear browsing data" in browser settings usually offers separate checkboxes for each.

**Can a service worker read localStorage?** No, `localStorage` isn't available inside service workers (they run in a different global context); use IndexedDB there instead.

**Does incognito mode disable Web Storage?** No, storage still works within the incognito session; it's just wiped when the incognito window closes.

## Security Deep Dive
- Web Storage has no equivalent to a cookie's `HttpOnly` flag — there is no way to mark a `localStorage` value as inaccessible to JavaScript, full stop
- This means the *entire* threat model reduces to: "can an attacker get any JavaScript to run on this page?" If yes (via [[XSS (Cross-Site Scripting)]]), they can read every key in storage, no exceptions
- Cookies, by contrast, support defense in depth: `HttpOnly` blocks JS access even under XSS, `Secure` blocks transmission over plain HTTP, and `SameSite=Strict/Lax` blocks the cookie from being sent on cross-site requests, mitigating [[CSRF (Cross-Site Request Forgery)|CSRF]]
- The common counter-argument ("cookies are vulnerable to CSRF, storage isn't") is true but addresses a different attack — the right modern pattern for SPAs is often an `HttpOnly`, `SameSite=Strict` cookie for the refresh token plus CSRF tokens or `SameSite` protections, not shifting the token into `localStorage` to "avoid CSRF" while reopening it to XSS
- Content Security Policy (CSP) headers reduce XSS risk but don't eliminate it — a strict CSP is a mitigation, not a reason to treat `localStorage` as safe for secrets
- Browser extensions with broad permissions can also read page-accessible storage, an often-overlooked side channel distinct from XSS

## More FAQ
**Is sessionStorage safer than localStorage for tokens?** Marginally — it limits the exposure window (cleared when the tab closes) and isn't shared across tabs, but it's still fully JS-readable, so it doesn't solve the XSS exposure problem at all.

**Can a server read localStorage directly?** No — it's purely client-side; the only way server-side code sees that data is if client JS explicitly sends it in a request (e.g., as an `Authorization` header).

**Why do so many tutorials store JWTs in localStorage anyway?** Simplicity — it avoids dealing with CSRF tokens and cookie configuration, and many demo apps never face a real XSS attack. It's a reasonable tradeoff for a prototype, a risky default for anything handling real user data.

**Does `Storage.clear()` affect other origins or tabs?** No — `clear()` only wipes the calling origin's store; it has no effect on other domains, and for `localStorage` it does affect all tabs of that origin since they share the same underlying store.

## Debugging Storage in DevTools
- Chrome/Firefox/Edge DevTools all expose an "Application" (Chrome/Edge) or "Storage" (Firefox) panel listing every key-value pair in both `localStorage` and `sessionStorage` for the current origin, editable live
- The `storage` event only fires cross-tab, so testing sync logic requires two tabs open side by side — a single-tab test will never see the event fire, a common source of "it's not working" confusion during development
- `JSON.parse(localStorage.getItem('key'))` throwing on `null` is a frequent bug: a missing key returns `null`, not `undefined` or `{}`, and `JSON.parse(null)` actually succeeds and returns `null` (a quirk, not an error) — but `JSON.parse(undefined)` throws, which trips people up when they guard with the wrong falsy check
- Storage can be fully disabled by users/enterprise policy; feature-detect with a `try { localStorage.setItem(...) } catch {}` guard rather than assuming it's always available before relying on it for critical functionality

## Practical Migration Note
Teams that started with `localStorage` for auth tokens and want to move to `HttpOnly` cookies typically do it in stages: switch the backend to also set an `HttpOnly` session/refresh cookie, update the frontend to stop reading/attaching the token manually (the browser handles cookie attachment automatically), then remove the `localStorage` write once nothing reads it anymore. The tricky part is usually CORS: cookies require `credentials: 'include'` on `fetch`/`axios` calls and a matching `Access-Control-Allow-Credentials: true` plus a non-wildcard `Access-Control-Allow-Origin` on the server, which `localStorage`-based auth never had to worry about since the token traveled in a manually-set header instead of an automatic cookie.

## Common Interview Questions
**"Where would you store a JWT and why?"** A strong answer distinguishes threat models: `HttpOnly` cookie if XSS is the primary concern (can't be read by JS, but needs CSRF mitigation), `localStorage`/memory if the app has no cookie-based session and XSS risk is otherwise well-controlled (strict CSP, no untrusted third-party scripts) — and explicitly rejecting "just use localStorage, it's simpler" as the full answer.

**"What happens to sessionStorage when a user opens a link in a new tab vs. duplicating the tab?"** Opening a link in a new tab starts a fresh, empty `sessionStorage` for that tab; duplicating an existing tab (browser feature) copies the current `sessionStorage` into the new tab — a subtle distinction worth knowing when debugging "why did my wizard state appear in a new tab."

**"Why can't a server read localStorage on the first page load?"** Because Web Storage is purely client-side and never transmitted in HTTP requests — a server-rendered page that needs to know client state on first load has to rely on cookies (sent automatically) or wait for a client-side JS call after the page loads.

## Performance Considerations
- Reading and writing are synchronous, so storing a large blob (a big JSON cache) on every keystroke of a form autosave can visibly janks the UI thread — debounce writes rather than firing on every change
- Some browsers serialize the entire store to disk on write for `localStorage`, meaning many small frequent writes can be slower in aggregate than batching into fewer, larger writes
- Reading `localStorage` on initial page load (common for theme/auth-state hydration) happens before the first paint in many setups, which is exactly why it should stay small — a multi-megabyte read-and-parse can delay first render measurably

## Browser Support and Standards Notes
- Web Storage has been supported in every major browser since IE8 (2009) — it's one of the safest client-side APIs to rely on without feature detection for modern targets, though defensive try/catch around writes is still good practice for privacy-mode edge cases
- The spec is maintained by WHATWG as part of the HTML Living Standard, not a separate spec — it's considered a baseline web platform feature rather than an evolving one
- Some browser privacy modes (Safari ITP, Firefox Enhanced Tracking Protection in strict mode) partition or limit storage for third-party iframes specifically, which matters for embedded widgets but not for first-party app storage

## Framework Integration Notes
- React/Vue/Svelte apps commonly wrap `localStorage` access in a small hook or composable (`useLocalStorage`) that syncs a reactive state variable with the store and handles the JSON serialize/parse and error-guard boilerplate in one place, rather than scattering raw `getItem`/`setItem` calls through components
- State management libraries (Redux via `redux-persist`, Zustand via its `persist` middleware) can automatically snapshot store state into `localStorage` on every change and rehydrate on load, effectively using it as a lightweight persistence layer for client-side [[State Management]]
- Server-side rendering frameworks (Next.js, Nuxt) must guard storage access behind a client-only check (`typeof window !== 'undefined'`) since `localStorage` doesn't exist during server-side render and accessing it there throws

## Related Terms
- [[Cookies]]
- [[JWT (JSON Web Token)]]
- [[XSS (Cross-Site Scripting)]]
- [[Session]]
- [[State Management]]

## Example
Saving a user's dark-mode preference in `localStorage` so it persists across visits:

```js
// Write
localStorage.setItem('theme', 'dark');

// Read on next visit
const theme = localStorage.getItem('theme') ?? 'light';
document.documentElement.dataset.theme = theme;

// React to changes made in OTHER tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    document.documentElement.dataset.theme = e.newValue;
  }
});
```

Contrast with a checkout wizard using `sessionStorage` so an accidentally duplicated tab doesn't share half-filled payment state:

```js
sessionStorage.setItem('checkout-step', '2');
sessionStorage.setItem('checkout-draft', JSON.stringify({ address, cart }));
```
