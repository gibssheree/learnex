---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Lazy Loading

**Definition:** Delaying the loading of code, images, or data until they're actually needed.

## How It Works
- Split your JS bundle into chunks, only load a chunk when that route or component is used — bundlers (Webpack, Vite, Rollup) turn each `import()` call site into a separate file fetched at runtime
- Only load images as they scroll into view, typically via the native `loading="lazy"` attribute or an `IntersectionObserver`-based library
- Route-based splitting (each page/route is its own chunk) is the coarsest and easiest form; component-based splitting (a heavy modal, chart, or editor loads only when rendered) is finer-grained and requires more deliberate boundaries
- Data can be lazy-loaded too — pagination, infinite scroll, and "load more" buttons all defer fetching rows/records the user hasn't reached yet
- The browser's default is actually the opposite: `<img>` and `<script>` load eagerly the moment they're parsed unless you explicitly opt into lazy behavior
- Third-party embeds (YouTube players, chat widgets, ad iframes) are prime lazy-loading candidates since their JS payloads are often larger than the rest of the page combined, and most users never interact with them
- Fonts can be lazy-loaded too, though carefully — deferring a non-critical icon font is safe, but deferring the font used for body text causes a flash of invisible/unstyled text (FOIT/FOUT)

## Why It Matters
- Cuts initial page load time significantly, especially on large apps — shipping only the JS needed for the current view instead of the entire application
- Directly improves Core Web Vitals: smaller initial bundles reduce Total Blocking Time (TBT) and improve Largest Contentful Paint (LCP) by freeing up bandwidth and the main thread for what's actually visible
- Matters disproportionately on mobile/3G connections where every extra KB has outsized latency cost compared to broadband desktop connections
- Reduces bandwidth costs at scale — a page that ships 30% less JS to millions of visitors is a real infrastructure and carbon-footprint saving, not just a UX nicety

## Common Pitfalls
- Lazy-loading content that's immediately visible (above the fold), which actually delays what the user sees first — this is the single most common lazy-loading mistake, especially applying `loading="lazy"` to a hero image or LCP element, which directly hurts your LCP score
- Causing layout shift (CLS): if lazy-loaded content doesn't have its space reserved (via `width`/`height` attributes or `aspect-ratio` CSS) before it loads, the page jumps around as content pops in
- Creating network waterfalls: a lazily-loaded component's JS downloads, *then* it discovers it needs to fetch its own data, adding a second sequential round-trip instead of both happening in parallel
- Relying on `IntersectionObserver`-based lazy loading for content that needs to be crawlable — most modern search engine crawlers execute JS and scroll reasonably well, but some crawlers, social media link-preview bots, and RSS readers don't, and will index a page missing its lazy content
- Over-splitting: creating so many tiny chunks that the overhead of extra HTTP requests (even over HTTP/2 multiplexing) outweighs the savings from smaller individual payloads
- Forgetting a loading/fallback state — `React.lazy` without a `<Suspense>` boundary, or an image with no placeholder, produces a jarring blank gap instead of a smooth transition

## Under the Hood
- The `IntersectionObserver` API is what powers most custom lazy-loading implementations: you register a callback that fires when a target element crosses a viewport threshold, without the expensive scroll-event-plus-`getBoundingClientRect()` polling that older implementations used
- Native `loading="lazy"` on `<img>`/`<iframe>` doesn't wait until the element is exactly in the viewport — browsers apply a "distance from viewport" heuristic (a preload margin) so the image is already loaded by the time it scrolls into view, and this margin differs across browsers and is tuned based on connection speed
- When a bundler encounters a dynamic `import('./Component')` call, it statically analyzes the module graph reachable from that point, emits it as a separate chunk file with its own hash, and replaces the call site with runtime code that injects a `<script>` tag (or uses `import()`'s native browser support) and returns a promise that resolves once the chunk executes
- `fetchpriority="high"` and `<link rel="preload">` exist to counteract lazy loading where it's harmful — they tell the browser "fetch this immediately, don't deprioritize it," which is exactly what you want for an LCP image

## Variants / Types
- **Code splitting** — route-based (per-page chunks) or component-based (per-widget chunks); the mechanism is the same `import()` syntax either way, just applied at different granularities
- **Image/media lazy loading** — native `loading="lazy"` attribute vs. a JS library (`react-lazyload`, `lozad.js`) for finer control or older-browser support
- **Data lazy loading** — pagination (discrete pages), infinite scroll (continuous fetch-on-scroll), and "load more" (manual trigger) are all variations on deferring a data fetch
- **Lazy hydration** — a frontend-framework-specific variant where the HTML is already rendered by the server, but the JS that makes it interactive doesn't attach until later (see [[Hydration]]); Astro's `client:visible` directive is a direct example
- Distinct related concepts worth not confusing: **preloading** (fetch early because it will definitely be needed soon), **prefetching** (fetch during idle time because it will *probably* be needed next), and **lazy loading** (fetch only once actually needed) sit on a spectrum from "load early" to "load late"

## Comparison

| Technique | Trigger | Best for |
|---|---|---|
| `loading="lazy"` (native) | Browser's internal viewport-distance heuristic | Below-the-fold images/iframes, zero JS cost |
| `IntersectionObserver` (custom) | Precise, developer-controlled viewport threshold | Custom loading UX, non-`<img>` elements, older browsers |
| `React.lazy` + `Suspense` | Component render | Route/component-level JS code splitting |
| Library (`react-lazyload`, etc.) | Configurable, often scroll-based | Legacy codebases, fine-grained offset/throttle control |

## Code Example
```jsx
// React — component-level code splitting
import { lazy, Suspense } from 'react';

const SettingsPage = lazy(() => import('./SettingsPage'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <SettingsPage />
    </Suspense>
  );
}
```

```html
<!-- Native image lazy loading — never use on your LCP/hero image -->
<img src="chart.png" width="800" height="400" loading="lazy" alt="Q3 revenue chart" />

<!-- The LCP image should do the opposite: load eagerly and with priority -->
<img src="hero.jpg" width="1200" height="600" loading="eager" fetchpriority="high" alt="Hero" />
```

```astro
---
// Astro — deferring hydration until the component enters the viewport
import Comments from '../components/Comments.jsx';
---
<article>...</article>
<Comments client:visible />
```

```js
// Vanilla IntersectionObserver — custom lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: '200px' }); // start loading 200px before it's visible

document.querySelectorAll('img[data-src]').forEach((img) => observer.observe(img));
```

```js
// React Router — route-based code splitting
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./routes/Dashboard'));
const Reports   = lazy(() => import('./routes/Reports'));
const Billing   = lazy(() => import('./routes/Billing'));

function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </Suspense>
  );
}
```

```html
<!-- Prefetch a likely-next route's chunk on hover, so the "lazy" load feels instant -->
<a href="/reports" onmouseenter="import('./routes/Reports.js')">Reports</a>
```

## Best Practices
- Never lazy-load your LCP element — identify it (usually a hero image or headline block) and make sure it loads eagerly with `fetchpriority="high"`
- Always reserve space with explicit `width`/`height` or `aspect-ratio` so lazy content doesn't cause layout shift when it pops in
- Pair lazy-loaded components with a skeleton loader or spinner (`Suspense fallback`) rather than letting a blank gap flash
- Combine lazy loading with prefetching for likely next steps — e.g. prefetch a route's chunk on link hover so the "lazy" load feels instant when the user actually clicks
- Test lazy-loaded content with a crawler simulator or "fetch as Google" tool if SEO/crawlability matters for that content
- Set a sensible `rootMargin` on custom `IntersectionObserver` implementations (typically 100–300px) so content is ready just before it's visible, not the instant it's visible
- Bundle-size budget your builds (Webpack's `performance.maxAssetSize`, Vite's chunk size warnings) in CI so a new dependency doesn't silently bloat a chunk that was supposed to stay small

## FAQ
**What's the difference between lazy loading and code splitting?** Code splitting is the *build-time* mechanism (breaking a bundle into separate chunk files); lazy loading is the *runtime* decision of when to actually fetch one of those chunks. You can code-split without lazy loading (e.g. prefetch every chunk immediately), though that's unusual.

**Does lazy loading hurt SEO?** It can, if the lazy-loaded content never renders for crawlers that don't execute JS or scroll. Google's crawler generally handles native `loading="lazy"` and standard `IntersectionObserver` patterns fine, but always verify with rendering tools for content you need indexed.

**What does `loading="eager"` do?** It's the (default) opposite of `lazy` — load immediately regardless of viewport position. You rarely need to set it explicitly except to override a browser default or make intent explicit in code review.

**Is lazy loading only a frontend concept?** No — the same principle applies to backend data loading (e.g. an [[ORM]] lazy-loading a related record only when it's accessed, versus eager-loading it in the initial query), where it introduces the classic [[N+1 Query Problem]] if you're not careful.

**Does lazy loading affect Time to First Byte (TTFB)?** No — TTFB is about how fast the server responds with the first byte of HTML; lazy loading only affects what happens after that, during resource fetching and rendering.

**How do I know what to lazy-load first?** Run a Lighthouse or WebPageTest trace, identify what's below the fold or not immediately interactive, and start with the largest, least-critical assets — usually images and third-party embeds give the biggest win for the least risk.

## Real-World Example
- **YouTube** and most video platforms lazy-load thumbnail images and only initialize the actual video player embed once you scroll near it or click play, avoiding dozens of simultaneous video-player JS instances on a search results page
- **E-commerce category pages** (Amazon, Shopify storefronts) lazy-load product images below the fold while eagerly loading the top row so the page feels instantly populated
- **Astro** itself is a real-world embodiment of the idea at the framework level: by default nothing is hydrated or loaded client-side at all, and you opt in per-component, which is lazy loading taken to its logical extreme

## History
- The `loading="lazy"` attribute shipped in Chrome 76 (2019) and was standardized across major browsers by 2020, moving what used to require a JS library into a one-line HTML attribute
- Before native support, lazy loading relied on scroll event listeners with manual `getBoundingClientRect()` checks — expensive because scroll fires dozens of times per second — which `IntersectionObserver` (2017) replaced with a browser-optimized, async API
- Code splitting has roots in general software engineering ("don't load what you don't need") but became a first-class web concept once Webpack popularized `import()`-based dynamic imports around 2015-2016, later standardized as part of ECMAScript dynamic import in 2020
- React's `React.lazy()` API (2018) brought code splitting into the component model directly, tying chunk boundaries to component boundaries instead of requiring manual route configuration
- HTTP/2 and HTTP/3's multiplexing reduced (but didn't eliminate) the historical penalty of many small requests, which is part of why finer-grained lazy loading became more practical over the 2015-2020 window than it was in the HTTP/1.1 era of limited parallel connections

## Common Interview Questions

| Question | Short answer |
|---|---|
| What's the difference between lazy loading and code splitting? | Code splitting is the build-time mechanism (separate chunk files); lazy loading is the runtime decision of when to fetch one |
| Why shouldn't you lazy-load your LCP image? | It delays the fetch of the element Lighthouse measures for Largest Contentful Paint, directly hurting that score |
| How do you prevent layout shift from lazy-loaded images? | Reserve space up front with explicit `width`/`height` attributes or `aspect-ratio` CSS before the image loads |
| What API powers most custom lazy-loading implementations? | `IntersectionObserver` — it's async and avoids the performance cost of scroll-event polling |
| What's the native HTML way to lazy-load an image? | `<img loading="lazy">`, supported in all major browsers since ~2020 |
| What's a lazy-loading "waterfall" problem? | A lazy component's JS loads, then it discovers it needs to fetch its own data — two sequential round trips instead of one parallel one |
| Does lazy loading always improve performance? | Only for content not immediately needed — lazy-loading above-the-fold content makes perceived performance worse, not better |
| What's the relationship between prefetching and lazy loading? | Opposite ends of a spectrum — prefetching loads early in anticipation of need, lazy loading defers until need is confirmed |

## Related Terms
- [[CDN]]
- [[SPA vs SSR vs SSG]]
- [[Hydration]]
- [[Caching]]
- [[ORM]]
- [[N+1 Query Problem]]

## Example
A settings page's code only downloads when the user clicks "Settings," not on initial app load. A product listing page ships `loading="lazy"` on the 40 product thumbnails below the fold, while the single hero banner image at the top loads eagerly with `fetchpriority="high"` so it doesn't tank the page's LCP score.

A dashboard with five tabs (Overview, Analytics, Reports, Settings, Billing) code-splits each tab into its own chunk — only the Overview tab's JS downloads on initial load, and clicking "Analytics" triggers a network request for that chunk in the moment it's needed, not before.

A recipe blog embeds a YouTube video halfway down a long article — using a lightweight lazy-loaded thumbnail placeholder (like the `lite-youtube-embed` pattern) instead of the full YouTube iframe upfront can cut that single embed's initial JS/network cost by over 90% until the reader actually scrolls to it or clicks play.
