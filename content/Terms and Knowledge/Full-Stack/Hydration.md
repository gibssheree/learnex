---
tags: [term, fullstack, frontend, rendering]
category: Frontend & State
---

# Hydration

**Definition:** The process of a server-rendered HTML page "waking up" and becoming interactive by attaching JavaScript event handlers.

## How It Works
- Server sends fully-rendered HTML for a fast first paint — the browser can display it before any JS runs
- The JS bundle loads afterward and attaches to the existing DOM instead of rebuilding it: the framework walks the tree it would have produced and matches it node-for-node against what's already there
- Instead of calling `createElement`/`appendChild` for every node (like a client-side render from scratch), the framework reuses the existing DOM nodes and just wires up event listeners, refs, and internal component state
- Only after this attachment step does the page respond to clicks, typing, or any other interaction — before that, it's "dead" HTML that merely looks alive
- The gap between "visually complete" and "actually interactive" is measurable and shows up in Core Web Vitals as Total Blocking Time (TBT) and Interaction to Next Paint (INP)
- Component-local state (e.g. a `useState` counter, an open/closed accordion) has to be reconstructed during hydration too — the framework re-runs the component function to rebuild its internal state tree, it doesn't just attach listeners to static markup
- Hydration is single-threaded work on the main thread by default, competing with any other JS the page is running (analytics, ads, third-party widgets) for the same execution slot

## Why It Matters
- Explains why an SSR page can look loaded but not respond to clicks for a moment — this is the defining tradeoff of server-rendered apps
- Lets you get the SEO and perceived-performance benefits of server rendering (crawlable HTML, fast [[Caching|First Contentful Paint]]) without giving up the interactivity of a client-side app
- Directly affects Core Web Vitals: a heavy hydration pass blocks the main thread, which tanks INP and can make a page feel janky even though it "loaded fast"
- Framework choice (Next.js, Nuxt, SvelteKit, Astro) is largely a bet on how each one manages this hydration cost — it's one of the most consequential architecture decisions in modern frontend work, tied closely to [[SPA vs SSR vs SSG]]
- Content-heavy sites (blogs, docs, marketing pages, this glossary included) often need almost no client-side interactivity at all, which is exactly why islands-style partial hydration exists — most of the page never needs a JS runtime attached to it in the first place
- Debugging hydration issues is a recurring, high-friction task on any SSR team — understanding the mechanism directly shortens the path from "why is this button dead on load" to a fix

## Common Pitfalls
- "Hydration mismatch" errors when the server-rendered HTML doesn't exactly match what the client would have rendered — the framework then has to guess, patch, or throw away and re-render the subtree
- Common mismatch causes: `Date.now()`/`Math.random()` used during render, browser-only APIs (`window`, `localStorage`) checked unsafely, locale/timezone differences between server and client, browser extensions injecting DOM before hydration runs
- Shipping the entire page's JS just to hydrate one small interactive widget (a "hydrate everything" architecture) — this is the single biggest performance tax in traditional SSR frameworks
- Double data fetching: fetching data on the server to render HTML, then fetching it again on the client during hydration because the two runtimes don't share state
- The "uncanny valley" of hydration — a page that looks fully loaded and clickable but silently ignores input for a second or more, which users perceive as broken, not slow
- Overusing `suppressHydrationWarning` to silence mismatch errors instead of fixing the underlying nondeterminism
- Third-party scripts (chat widgets, ads, browser extensions like ad blockers or password managers) mutating the DOM before hydration runs, which the framework then sees as an unexpected mismatch it didn't cause
- Assuming hydration is "free" on fast machines during development — a mid-range mobile device can take 5-10x longer to hydrate the same tree than a developer's laptop, so profile on throttled CPU, not just fast Wi-Fi

## Under the Hood
- React's `hydrateRoot()` (replacing the older `ReactDOM.hydrate`) performs a tree walk comparing the server-rendered DOM against what a fresh render would produce. If they match, it attaches; if they diverge, React logs a warning in development and, in production, patches the mismatched subtree by discarding the server markup and rendering it client-side instead — silently, which is why mismatches are easy to miss until users report flicker.
- Hydration is inherently synchronous-ish and tree-shaped in classic implementations: attaching listeners to a parent typically requires the child components to already be hydrated, which is why a single large or slow component can block hydration for everything below it.
- React 18's concurrent renderer introduced **selective hydration**: wrapping parts of the tree in `<Suspense>` lets React hydrate whichever boundary the user interacts with first, out of document order, instead of hydrating strictly top-to-bottom.
- Event replay is part of this mechanism too — if a user clicks a button before its subtree has hydrated, React 18 queues that interaction and replays it once hydration for that boundary completes, instead of silently dropping the click on the floor as older versions did.

## Variants / Types
- **Full hydration** — the traditional model (classic Next.js/Nuxt pages, plain React SSR): the entire page's component tree is hydrated on load, whether or not most of it is interactive. Simple to reason about, worst-case performance.
- **Client-only rendering with an SSR shell** — a hybrid seen in some frameworks where the server renders only a loading skeleton, not real content, then the client fully takes over; technically avoids hydration mismatches entirely by never claiming to match server output, but gives up most of SSR's benefit
- **Partial hydration / Islands architecture** — only specific "islands" of interactivity are hydrated; the rest of the page stays static HTML forever. Astro pioneered this as its core model: components opt in via directives like `client:load`, `client:idle`, or `client:visible`
- **Progressive hydration** — hydrate the tree in stages, prioritizing above-the-fold or user-interacted components first, deferring the rest
- **Resumability (no hydration)** — Qwik's approach: instead of re-running component logic to rebuild state on the client, the server serializes the app's execution state (including closures) directly into the HTML, and the client "resumes" exactly where the server left off without replaying any render logic at all
- **Server Islands** — a newer pattern (Astro 4.x+) where individual components are streamed in after the initial page load, deferring both the render *and* the hydration of expensive or personalized sections
- **Out-of-order streaming hydration** — React 18's `renderToPipeableStream` can flush HTML for fast parts of a page immediately while slow data-dependent parts stream in later, each wrapped in its own `<Suspense>` boundary that hydrates independently as its chunk arrives

## Comparison

| Approach | What ships to client | Hydration cost | Typical framework |
|---|---|---|---|
| CSR (client-only) | Full JS bundle, empty HTML shell | N/A — no server HTML to reconcile against | Create React App, plain SPA |
| SSR + full hydration | Full JS bundle + full HTML | High — whole tree walked and attached | Classic Next.js, Nuxt |
| SSG + full hydration | Full JS bundle + pre-built HTML | High — same cost as SSR, just built ahead of time | Gatsby, older Next.js `getStaticProps` pages |
| Islands (Astro) | JS only for interactive components | Low — proportional to interactive surface, not page size | Astro, Fresh (Deno) |
| Resumable (Qwik) | Tiny core + lazily-loaded handlers | Near-zero — no replay, just resume | Qwik |
| Streaming SSR + selective hydration | Full JS bundle, HTML arrives in chunks | Medium — spread over time via `<Suspense>` boundaries instead of one blocking pass | Next.js App Router, Remix |

## History
- Hydration as a term entered mainstream frontend vocabulary with React 0.14's `ReactDOM.render()` gaining the ability to detect and reuse server-rendered markup (~2015), formalized later as a distinct `ReactDOM.hydrate()` API in React 16 (2017)
- Early SSR frameworks (Rails with Turbolinks, PHP) didn't need hydration at all because they didn't attach a client-side component tree — hydration is specifically a byproduct of JS frameworks trying to have both server-rendered HTML *and* client-side component state
- Astro launched in 2021 with "islands architecture" as its headline feature, popularizing partial hydration as a named alternative to the "hydrate everything" default that Next.js/Nuxt/Gatsby had normalized
- Qwik (2022) pushed the idea further by asking "why hydrate at all?" and building resumability as a first-class alternative rather than an optimization on top of hydration
- React 18 (2022) shipped selective/streaming hydration via `renderToPipeableStream` and `<Suspense>`, bringing partial-hydration-like benefits to the mainstream React ecosystem without a full architectural rewrite

## Real-World Example
- **Astro** (used to build this site) ships zero JavaScript by default for any `.astro` component — a page of pure content and layout produces plain HTML with no hydration step at all. Only components explicitly marked with a `client:*` directive get a hydration script.
- **Next.js** App Router uses React Server Components to shrink what needs hydrating: server components render to HTML and never ship JS to the client, while only components marked `"use client"` get hydrated.
- **Shopify's Hydrogen** framework (built on Remix) leans on streaming SSR so a storefront's product data can arrive progressively, with cart/checkout widgets hydrating independently of the rest of the page.
- **Marketing/landing-page builders** (Webflow-exported sites, most static site generators) frequently ship zero hydration whatsoever — the entire value proposition of a landing page is fast paint and readable content, not client-side interactivity.

## Code Example
```jsx
// React 18 — hydrating an SSR-rendered page
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(document.getElementById('root'), <App />);
```

```astro
---
// Astro — partial hydration via client directives
import Counter from '../components/Counter.jsx';
---
<!-- Static HTML forever, never hydrated -->
<Header />

<!-- Hydrated immediately on page load -->
<Counter client:load />

<!-- Hydrated only once it scrolls into the viewport -->
<Counter client:visible />

<!-- Hydrated when the main thread is idle -->
<Counter client:idle />

<!-- Hydrated only above a certain screen width, e.g. skip on mobile -->
<Counter client:media="(min-width: 768px)" />
```

```vue
<!-- Vue 3 -->
<script>
import { createSSRApp } from 'vue';
import App from './App.vue';

// mount() on a server-rendered container performs hydration automatically
// if the DOM already contains server-rendered markup
const app = createSSRApp(App);
app.mount('#app');
</script>
```

```svelte
<!-- SvelteKit — hydration is opt-out per page, not opt-in -->
<!-- src/routes/+page.js -->
<script context="module">
  export const csr = true;   // set false to disable hydration entirely for this page
  export const ssr = true;   // server-render the HTML
</script>
```

```js
// React 18 — streaming SSR with selective hydration boundaries
import { renderToPipeableStream } from 'react-dom/server';

renderToPipeableStream(<App />, {
  onShellReady() {
    // shell (critical, fast-to-render content) streams first
    response.statusCode = 200;
    pipe(response);
  },
  // slow, data-dependent <Suspense> boundaries stream and hydrate later,
  // independently of the shell and of each other
});
```

## Best Practices
- Ship JS only for what's actually interactive — audit your bundle for components that render static content but still get hydrated
- Prefer islands/partial hydration frameworks (Astro, Qwik) for content-heavy sites where most of the page is never touched by the user
- Avoid nondeterministic values (`Date.now()`, `Math.random()`, `navigator`/`window` reads) in the initial render path; compute them in a `useEffect`/`onMount` after hydration instead
- Use `client:visible`/lazy-hydration directives for below-the-fold widgets so hydration cost doesn't block Time to Interactive on page load
- Fix hydration mismatches at the source rather than suppressing the warning — a suppressed mismatch often means the client silently re-renders a subtree, wasting the SSR work entirely
- Profile hydration cost on throttled CPU (Chrome DevTools' 4x/6x slowdown) rather than a developer machine, since it's the metric most likely to be invisible locally and painful for real users
- Measure before optimizing: Lighthouse's TBT and the browser's Performance panel will show hydration as a long task on the main thread if it's actually a problem worth solving

## FAQ
**Why hydrate at all instead of just rendering everything client-side?** Because server-rendered HTML gives you a fast first paint and crawlable content without waiting on JS — hydration lets you keep both benefits and still get client-side interactivity.

**Does a fully static page (SSG) with zero interactivity need hydration?** No — if there's no client-side JS attaching to the page, there's nothing to hydrate. Astro pages with no `client:*` directives ship zero JS by default.

**What's the "uncanny valley" of hydration?** The period where a page looks fully rendered and clickable but isn't yet listening for events — worse for perceived quality than a visible loading state, because users don't know anything is still happening.

**Is hydration mismatch a hard error?** In React it's a recoverable warning in production (the mismatched subtree gets discarded and re-rendered client-side), but it silently defeats the purpose of SSR for that subtree and should be treated as a bug.

**Does hydration happen once per page load, or continuously?** Once, for a given page load — after the initial attach, the framework's normal client-side reconciliation (diffing on state/prop changes) takes over, which is a different, cheaper process than hydration itself.

**Can you measure hydration cost directly?** Yes — browser performance profilers show it as long tasks during `hydrateRoot`/`hydrate` calls, and Lighthouse's Total Blocking Time metric is heavily influenced by it on JS-heavy SSR pages.

## Common Interview Questions

| Question | Short answer |
|---|---|
| What is hydration? | Attaching event listeners/state to server-rendered HTML instead of re-rendering it from scratch |
| Why does SSR need hydration but SSG-only pages don't (if no interactivity)? | Hydration is only needed where client-side JS attaches to the DOM; a page with zero client interactivity has nothing to hydrate |
| What causes a hydration mismatch? | Server and client produce different markup for the same render — timestamps, random values, browser-only APIs, locale differences |
| What is islands architecture? | Only specific interactive components ("islands") are hydrated; the rest of the page stays static HTML |
| How does resumability differ from hydration? | Resumability (Qwik) serializes execution state into HTML and resumes it directly, skipping the replay/re-render step hydration requires |
| What's selective hydration in React 18? | Hydrating `<Suspense>` boundaries out of order, prioritizing whichever one the user interacts with first |
| Does hydration affect SEO? | Not directly — crawlers see the server-rendered HTML regardless of hydration; it affects interactivity metrics (INP), not content visibility |
| What's the fix for a hydration mismatch caused by `Date.now()`? | Compute the value after mount (`useEffect`) instead of during the initial render, so server and client agree on what to render first |

## Related Terms
- [[SPA vs SSR vs SSG]]
- [[Virtual DOM]]
- [[Lazy Loading]]
- [[State Management]]
- [[CDN]]
- [[Caching]]

## Example
A Next.js page appears instantly thanks to server HTML, but buttons don't work until React finishes hydrating a moment later. An Astro page with `client:visible` on a comment widget ships zero JS for the article text above it and only hydrates the widget once the reader scrolls that far down. A news site's homepage might server-render 40 article cards as pure HTML while hydrating only the "save for later" bookmark icon on each one — the reading experience needs zero JS, only the bookmarking interaction does.

This is also why Lighthouse audits sometimes flag "reduce JavaScript execution time" on pages that look otherwise fast — the flagged cost is frequently hydration, not the initial network fetch.

