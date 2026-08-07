---
tags: [term, fullstack, frontend, rendering]
category: Frontend & State
---

# SPA vs SSR vs SSG

**Definition:** Three ways to render a web app. SPA renders entirely in the browser, SSR renders HTML on the server per request, SSG renders HTML at build time.

## How It Works
- SPA (React/Vue client-side): ships a mostly blank HTML shell, JS builds the page
- SSR (Next.js, Nuxt): generates HTML per request on the server
- SSG: pre-builds every page as static HTML ahead of time
- All three can coexist within a single modern application, chosen on a per-route basis rather than as one global architectural decision
- SPA: the browser downloads a JS bundle, executes it, and the framework renders the DOM client-side; subsequent navigation re-renders in-place without a full page reload
- SSR: each request hits the server, the framework renders the component tree to an HTML string using current data, sends that HTML down, then [[Hydration]] attaches event listeners client-side to make it interactive
- SSG: at build time (CI/CD, `next build`, `astro build`), every route is rendered once to a static `.html` file and pushed to a [[CDN]] — no server rendering happens per-request at all

## Why It Matters
- Affects SEO, initial load speed, and server cost — a core architecture decision for any frontend project
- Time to First Byte (TTFB) and Time to Interactive (TTI) trade off differently across the three — SSG wins TTFB (served from CDN edge, no compute), SPA often loses both on a slow connection (blank shell until JS downloads and runs)
- Server cost scales very differently: SSG costs approach zero marginal cost per request (static file serving), SSR costs scale with traffic (compute per request), SPA shifts compute to the client entirely
- Development complexity differs too: SPA has the simplest mental model (one client app, one API), SSR requires reasoning about two rendering environments (server and browser) for the same components, and SSG requires a rebuild/deploy pipeline for every content change unless paired with ISR

## A Fourth Option: ISR / Hybrid Rendering
Modern frameworks blur these three into a per-route choice rather than a whole-app decision:
- **ISR (Incremental Static Regeneration)**, popularized by Next.js: pages are statically generated but can be regenerated in the background after a configurable interval, giving SSG's speed with data that's allowed to go slightly stale
- **Islands architecture** (Astro, this site's own framework): the page ships as static HTML by default, with only specific interactive components ("islands") hydrated as small isolated JS bundles — avoiding the "hydrate the entire page" cost of full SSR/SPA hybrids
- **Streaming SSR** (React Server Components, Next.js App Router): the server starts sending HTML before the entire page has finished rendering, letting the browser paint above-the-fold content while slower data-dependent parts stream in after
- Most production frameworks today (Next.js, Nuxt, SvelteKit, Astro) let you choose the rendering mode per-route, not globally — a marketing page can be SSG while a dashboard is SSR and a settings modal is a client-rendered SPA fragment

## Comparison

| | SPA | SSR | SSG |
|---|---|---|---|
| Where HTML is built | Browser | Server, per request | Build time, once |
| Initial load | Slow (blank shell + JS) | Fast (full HTML immediately) | Fastest (static, CDN-cached) |
| SEO | Poor by default, needs extra work | Good (real HTML for crawlers) | Excellent |
| Data freshness | Always current (client fetches live) | Always current (server fetches per request) | Stale until next build/ISR |
| Server cost per request | Low (just serves the JS bundle) | Higher (renders on every request) | Near zero (static file) |
| Navigation after load | Instant (client-side routing) | Full or partial reload unless hydrated as SPA | Instant if hydrated, else full reload |
| Best for | Dashboards, apps behind login | News sites, e-commerce, personalized content | Blogs, docs, marketing pages |

## Common Pitfalls
- Using a pure SPA for content that needs strong SEO, search engines have historically struggled with JS-rendered content
- Assuming "server-rendered" and "static" are interchangeable — SSR runs compute on every request while SSG runs it once at build time, a difference that matters enormously for both cost and latency at scale
- Choosing SSR by default "for SEO" when the content doesn't actually change per-request — that's paying per-request compute cost for content SSG could serve for free
- Forgetting that SSR still ships JS to the browser for hydration — SSR fixes the *initial HTML* problem, not the *bundle size* problem
- Hydration mismatches: server-rendered HTML doesn't match what the client would render (e.g. using `Date.now()` or `window` during render), causing React/Vue to throw warnings or silently re-render
- Treating SSG as "no server needed" and then still needing a way to handle forms, auth, or dynamic data — usually solved with client-side fetches to an API or serverless functions bolted onto the static site
- Rebuilding an entire SSG site for one content change on a site with thousands of pages, making publish latency unacceptably slow without ISR or partial rebuilds
- Not accounting for [[Hydration]] cost on large SPAs — a huge JS bundle can make Time to Interactive worse than SSR's HTML-first approach even though the "page" visually appeared already

## Under the Hood: Hydration
- SSR and SSG both send pre-rendered HTML, but that HTML is inert — no click handlers, no state — until the JS bundle downloads and [[Hydration]] runs, walking the DOM and attaching event listeners to match what the framework expects it rendered
- If the client-rendered output doesn't exactly match the server-rendered HTML, frameworks either throw a hydration error (React) or silently patch the DOM (some frameworks are more forgiving), both of which cost extra client-side work
- **Resumability** (Qwik's approach) is a newer alternative to hydration — instead of re-executing all component logic client-side to attach listeners, the framework serializes enough state into the HTML that it can "resume" execution lazily, only running the JS for the exact interaction the user triggers
- Partial hydration / islands (Astro) sidesteps the problem by only hydrating the specific components marked interactive, leaving the rest of the page as static, JS-free HTML permanently

## Real-World Example
An e-commerce site typically mixes all three: the homepage and category pages are SSG (rebuilt on a schedule or via ISR when inventory changes), individual product pages use SSR or ISR since price/stock needs to be closer to real-time, the shopping cart and checkout flow is SPA-like (client-rendered, behind auth, no SEO need), and the whole thing is served through a [[CDN]] that caches the SSG/ISR pages at the edge while proxying SSR and API requests back to origin servers. This mix is precisely why frameworks moved from "pick one rendering mode for the whole app" to "pick one per route" — forcing checkout into SSG or the homepage into SSR would each be the wrong tool for that specific page's requirements.

## Code Example
Astro's per-page rendering mode, chosen with a single export:

```astro
---
// src/pages/blog/[slug].astro — SSG (default in Astro)
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({ params: { slug: post.slug }, props: { post } }));
}
const { post } = Astro.props;
---
<article>{post.body}</article>
```

```astro
---
// src/pages/dashboard.astro — opt into SSR for this route
export const prerender = false;
const user = await getSessionUser(Astro.request);
---
<h1>Welcome back, {user.name}</h1>
```

## Best Practices
- Default to SSG for anything that doesn't need per-request personalization — it's the cheapest and fastest option by a wide margin
- Reserve SSR for pages that genuinely need fresh, request-specific data (personalized dashboards, live pricing) or strict SEO on frequently changing content
- Use islands/partial hydration frameworks (Astro, Qwik) when most of the page is static and only small widgets need interactivity
- Measure Time to Interactive, not just Time to First Byte — a fast-loading SSR page with a huge hydration bundle can still feel sluggish
- Avoid non-deterministic values (`Date.now()`, `Math.random()`, `window` checks) during SSR render logic to prevent hydration mismatches
- Reach for ISR when content changes occasionally but a full rebuild per edit is too slow for your publishing workflow
- Profile actual bundle size shipped to the client for SPA/SSR routes — a "fast" server response paired with a 2MB JS bundle still produces a slow-feeling page on mobile networks
- Test on throttled mobile network conditions, not just a fast office connection — the gap between SPA and SSG perceived performance widens dramatically on slow networks

## Related Terms
- [[Hydration]] — the mechanism that makes SSR/SSG HTML interactive client-side
- [[CDN]] — where SSG (and ISR/cached SSR) output actually gets served from
- [[Virtual DOM]] — the diffing mechanism most SPA/SSR frameworks use to update the real DOM efficiently
- [[Lazy Loading]] — often paired with SPA/SSR to defer non-critical JS and reduce initial bundle cost
- [[Caching]] — SSR responses are frequently cached at the edge to approximate SSG's cost profile

## Rendering Mode Decision Checklist
A quick heuristic for picking a mode per route, not per app:
- Does the content differ per user or per request? If no, prefer SSG (or ISR if it changes periodically)
- Is strong SEO/crawlability required? If yes, avoid pure client-rendered SPA for that route
- Does the page need to be interactive immediately with heavy client state (drag-and-drop, real-time collaboration)? SPA-style client rendering (or a hydrated island) is likely the right call there specifically
- Is the number of distinct pages effectively unbounded (user-generated content at scale)? SSR or on-demand ISR beats trying to pre-build every possible page
- Is this content behind authentication and irrelevant to search engines? SPA is often the simplest, cheapest option since SEO isn't a constraint
- Does the page have heavy above-the-fold data dependencies but also needs fast paint? Streaming SSR lets the shell paint immediately while slow data streams in afterward
- Is most of the page static with only a handful of interactive widgets? An islands architecture will ship far less JS than treating the whole page as one SPA or fully-hydrated SSR tree

## FAQ (continued)
**Does Astro (this site's framework) use SSR, SSG, or SPA?**
Astro defaults to SSG — every page is static HTML unless you explicitly opt a route into SSR with `export const prerender = false`. Interactive components use islands architecture, hydrating individually rather than the whole page acting as one SPA.

**Is SSR always better for SEO than SPA?**
Generally yes for guaranteed crawlability, though modern Googlebot does execute JS and can index many SPAs — but other crawlers (social media link previews, less sophisticated bots) often don't, so SSR/SSG remain the safer default for anything public-facing.

**Can a site use more than one of these at once?**
Yes — this is now the norm rather than the exception. Frameworks like Next.js, Astro, and SvelteKit let rendering mode be chosen per route or even per component.

**Does SSG mean the site can never have dynamic content?**
No — SSG pages can still fetch dynamic data client-side after load (e.g. a "live comments" widget), or use ISR to regenerate the static HTML periodically without a full site rebuild.

## History
- Early web (1990s-2000s): every page was server-rendered by default (PHP, JSP, CGI) — there was no other option, since JS engines and browsers weren't capable of client-side app rendering
- AJAX (mid-2000s) and later frameworks like Backbone and Angular (early 2010s) enabled the first real SPAs — full client-side apps that only talked to the server via API calls
- React (2013) and the Virtual DOM made complex client-rendered UIs practical at scale, and the SPA became the default architecture for a generation of web apps, sometimes applied even where it wasn't the right fit (marketing sites, blogs)
- The mid-to-late 2010s SEO and performance backlash against SPA-everything led to SSR frameworks (Next.js 2016, Nuxt) bringing server rendering back, now combined with client-side hydration for interactivity
- Static site generators (Jekyll, Hugo, then Gatsby, Next.js's `next export`, Astro) grew alongside the JAMstack movement (~2015-2020), betting that most content doesn't need per-request rendering at all
- The 2020s trend is convergence — Astro's islands, React Server Components, and Qwik's resumability all attack the same problem: ship less JS, hydrate less, keep SSG/SSR's speed without SPA's bundle cost

## Deeper Dive: Why SPAs Struggled with SEO
Search crawlers historically fetched raw HTML and did not execute JavaScript, so a pure SPA's near-empty HTML shell (`<div id="root"></div>`) gave crawlers nothing to index. Googlebot has since gained a JS rendering pipeline, but:
- It runs JS rendering as a second, delayed pass, so indexing can lag significantly behind the initial crawl
- Rendering budget is finite — a JS-heavy SPA can time out or be deprioritized within Google's rendering queue
- Other consumers of your HTML (Twitter/X card previews, Slack unfurls, other search engines, accessibility tools) often don't run JS at all, so they see nothing useful from a pure SPA regardless of Google's capabilities
- This is why SSR/SSG remain the default recommendation for anything public and discoverable, while SPA remains fine for authenticated, non-indexed app surfaces

## Common Interview Questions
- "When would you choose SSR over SSG?" — when data must be fresh per-request and can't tolerate staleness (personalized dashboards, live pricing, per-user content) or when the number of possible pages is too large/dynamic to pre-build
- "What problem does ISR solve that plain SSG doesn't?" — avoids forcing a full rebuild for content updates while still serving mostly-static, CDN-cacheable pages
- "Why might an SSR page still feel slow despite fast TTFB?" — hydration cost; the HTML painted fast but the page isn't interactive until the JS bundle loads and hydration completes
- "What's the difference between hydration and resumability?" — hydration re-runs component logic client-side to attach behavior; resumability serializes enough state to skip re-execution and only run code for the specific interaction triggered
- "How does islands architecture reduce JS shipped to the client?" — only components explicitly marked interactive ship JS and hydrate; the rest of the page stays static HTML with zero framework runtime

## Example
A blog is a great fit for SSG since content rarely changes. A dashboard behind login is fine as an SPA. A news homepage that needs both fast loads and up-to-the-minute headlines is a textbook case for SSR or ISR.
