---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Debounce vs Throttle

**Definition:** Two techniques to limit how often a function runs in response to frequent events like typing, scrolling, or resizing.

## How It Works
- Debounce waits until the events stop for X ms, then runs once
- Throttle runs at most once every X ms while events keep firing
- Debounce resets its internal timer on every new event — if events keep arriving faster than the delay, the function never fires until there's a gap; this makes it "run once after the burst ends"
- Throttle doesn't reset anything — it just enforces a minimum spacing between executions, so it fires periodically throughout a sustained burst of events rather than waiting for it to end
- Both wrap the original function in a stateful closure that tracks timing (a timestamp, a timer ID, or both) between calls
- Neither technique drops the *last* event by default in every implementation — whether the final event in a burst gets a "trailing" call depends on the specific implementation (leading vs trailing edge, covered below)
- Both are pure timing wrappers around a function — they don't know or care what the wrapped function does, which is why the same `debounce()`/`throttle()` utility works equally well wrapping a network call, a DOM update, or a local state setter

## Why It Matters
- Prevents wasted work, like firing an API search request on every single keystroke
- Debounce is the right tool when only the *final* state matters — search-as-you-type, form validation, auto-save — because intermediate states during a burst are irrelevant
- Throttle is the right tool when you need *periodic* updates during continuous activity — scroll position tracking, drag handlers, mousemove-driven UI, resize-triggered layout recalculation — because waiting for the activity to fully stop would make the UI feel unresponsive
- Both reduce load on downstream systems (APIs, the DOM, expensive computations) without the crudeness of just disabling the interaction
- On mobile and lower-powered devices, unthrottled scroll/touch handlers are a common cause of visible jank — the browser's main thread gets flooded with handler invocations competing with layout and paint work

## Common Pitfalls
- Using throttle when you wanted debounce, or vice versa — picking the wrong one gives a laggy or overly chatty UI
- Applying debounce to a scroll handler expecting continuous feedback — the user sees nothing happen until they stop scrolling entirely, which feels broken
- Applying throttle to a search-as-you-type box — it fires repeatedly during typing instead of waiting for the user to finish, sending redundant partial-query requests
- Forgetting to cancel a pending debounced call when the component unmounts (in React, e.g.) — causes a state update on an unmounted component, or a stale callback firing after the user has navigated away
- Not accounting for `this` binding or stale closures when debouncing/throttling a function that reads component state — without care, the debounced function can capture an outdated value from an earlier render
- Assuming debounce/throttle helpers from different libraries behave identically — lodash's `_.throttle` defaults to firing on both the leading and trailing edge, while a naive hand-rolled version might only do one, producing subtly different UX
- Debouncing/throttling on the wrong layer — doing it in the UI event handler when the real cost is a downstream expensive render, versus needing it at the network-request layer to avoid redundant API calls

## Related Terms
- [[State Management]]
- [[Caching]]
- [[Rate Limiting]]

## Under the Hood
A minimal debounce implementation:
```js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
```
Every call clears the previous pending timer and starts a fresh one — so the wrapped `fn` only actually runs once no new call has arrived within `delay` ms.

A minimal throttle implementation:
```js
function throttle(fn, interval) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```
This version only fires on the leading edge of each interval and silently drops calls in between — a common enhancement is to also schedule a trailing call so the very last event in a burst isn't lost.

## Variants
- **Leading-edge** — fires immediately on the first event, then ignores/waits for the rest of the window. Feels the most responsive but can fire on activity that turns out to be a false start
- **Trailing-edge** — fires after the window closes, using the most recent call's arguments. This is what most people mean by "debounce" by default
- **Leading + trailing** — fires immediately on the first event *and* once more after the burst settles, capturing both immediate feedback and the final state (lodash's default throttle behavior)
- **`requestAnimationFrame`-based throttling** — instead of a fixed millisecond interval, cap execution to once per animation frame (~16.6ms at 60fps); common for scroll/resize handlers that drive visual updates, since there's no benefit updating faster than the screen can repaint

## Comparison
| | Debounce | Throttle |
|---|---|---|
| Fires during a burst | No — waits for a pause | Yes — at a fixed minimum interval |
| Fires after the burst ends | Yes (trailing) | Depends on implementation |
| Best for | Search input, auto-save, form validation, resize-end layout | Scroll tracking, drag, mousemove, infinite-scroll triggers |
| Guarantees periodic feedback | No | Yes |
| Risk if misused | Feels unresponsive during continuous activity | Sends/executes more often than needed |

## Code Example
```js
// Debounce a search input — only fire the API call after typing stops
const debouncedSearch = debounce((query) => {
  fetch(`/api/search?q=${encodeURIComponent(query)}`);
}, 300);

searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

// Throttle a scroll handler — update at most every 100ms during continuous scrolling
const throttledOnScroll = throttle(() => {
  updateScrollProgressBar(window.scrollY);
}, 100);

window.addEventListener('scroll', throttledOnScroll);
```

```jsx
// React: debounce with cleanup on unmount, avoiding a stale-closure call
useEffect(() => {
  const handler = setTimeout(() => {
    runSearch(query);
  }, 300);
  return () => clearTimeout(handler); // cancel if `query` changes or component unmounts
}, [query]);
```

## Best Practices
- Default to library implementations (lodash `debounce`/`throttle`, or a well-tested hook) over hand-rolling, since edge cases like leading/trailing behavior and `this` binding are easy to get subtly wrong
- Always clean up pending timers on unmount in component-based frameworks to avoid callbacks firing against stale state
- Pick the delay/interval based on the interaction: ~200-300ms is typical for search-as-you-type; scroll/resize throttling is often tied to frame timing (~16ms) rather than an arbitrary constant
- Debounce at the layer where the expensive work actually happens (e.g. right before the network call), not necessarily at the raw DOM event, if there are multiple triggers feeding into the same expensive operation
- Combine with cancellation — an in-flight debounced API call that's now stale (user kept typing) should be aborted (`AbortController`) rather than left to resolve and overwrite newer results

## FAQ
**Can I combine debounce and throttle?** Yes — some UIs throttle during the burst for live feedback and debounce a final "settled" action, e.g. throttled live-preview updates plus a debounced auto-save.

**Does React's `useDeferredValue`/`startTransition` replace debounce?** Not exactly — those are about scheduling render priority within React, not about limiting how often a side effect (like a network call) fires; they solve a related but distinct problem and are often used together with debounce.

**Why 300ms as a common debounce delay?** It's roughly the threshold where a delay still feels responsive to a typing user but reliably captures a "pause," based on typical typing cadence — not a hard rule, just a well-worn default worth tuning per use case.

**Is throttling the same as rate limiting?** They're related but operate at different layers — throttle limits how often a *client-side* function runs in response to local events; [[Rate Limiting]] is typically a *server-side* control on how many requests a client is allowed to make in a window, often enforced regardless of what the client-side code does. A well-built client throttles proactively so it rarely hits the server's rate limit at all.

**Does CSS have a built-in equivalent?** Not directly, but `scroll-timeline` and CSS-driven animations can replace some throttled-scroll-handler use cases (parallax, progress indicators) entirely, avoiding JavaScript's per-frame overhead by letting the compositor handle it.

## Real-World Example
An autocomplete search box without debouncing fires one API request per keystroke — typing a 10-character query fires 10 requests, most of them for prefixes the user never cared about, and because network responses can arrive out of order, a slow response to an early keystroke can overwrite the UI with stale results after a later, faster response already rendered the correct ones. Adding a 300ms trailing debounce cuts typical request volume by roughly 80-90% for average typing speed and, combined with discarding any response that isn't for the current input value (or using `AbortController` to cancel stale requests outright), eliminates the out-of-order rendering bug as a side effect.

## History
Both terms are borrowed from outside software. "Debounce" comes from electrical engineering — a mechanical switch's contacts physically bounce for a few milliseconds when pressed, generating multiple spurious signal transitions instead of one clean one, and a debounce circuit (or later, software debounce logic) waits out the bounce before registering a single press. "Throttle" comes from mechanical/automotive engineering — a throttle valve limits the rate of fuel or airflow into an engine, capping output regardless of how hard the input is pushed. Both metaphors made a clean jump into UI programming once JavaScript event handlers (scroll, resize, keyup) started firing far faster than any meaningful UI update needed to happen, well before lodash and underscore.js popularized ready-made implementations in the early 2010s.

## Common Interview Questions
- **What happens if you call a debounced function's cancel method mid-wait?** The pending timer clears and the wrapped function never fires for that pending call — most library implementations (lodash) expose a `.cancel()` method exactly for this, useful on component unmount or when input becomes invalid
- **Can you make a debounced function fire immediately on the very first call?** Yes — that's "leading edge" debounce: fire on the first event, then ignore further events until the quiet period elapses, useful for things like preventing a double-click double-submit
- **Why might throttle feel "laggy" compared to debounce for the same interval?** Throttle intentionally delays some invocations to enforce spacing even when the user has stopped triggering events, whereas debounce's delay is only ever measured from the *last* event — for a single, isolated event, both behave the same, but throttle can feel like it's queuing extra work during sustained bursts
- **How would you test a debounced function in a unit test?** Use fake timers (`jest.useFakeTimers()`) to advance time programmatically rather than using real `setTimeout` delays, keeping the test fast and deterministic

## Performance Notes
- Both patterns reduce the *number* of calls, not the cost of each individual call — if the wrapped function itself is expensive, pairing debounce/throttle with memoization or moving the work off the main thread (a Web Worker) addresses a different half of the problem
- `requestAnimationFrame`-based throttling naturally caps work to the display's refresh rate, which is usually the right ceiling for anything visual — going faster than the screen can repaint wastes CPU with no visible benefit
- Passive event listeners (`{ passive: true }`) combined with throttling further reduce scroll-jank risk by telling the browser upfront that the handler won't call `preventDefault()`, letting it start scrolling before the handler even runs

## Where Each Shows Up in Practice
| Scenario | Technique | Why |
|---|---|---|
| Search-as-you-type | Debounce (trailing) | Only the final query string matters |
| Window resize -> recalculate layout | Debounce (trailing) | Layout math is expensive; only need it once resizing stops |
| Infinite scroll -> load more content | Throttle | Need periodic checks during continuous scrolling, not just at the end |
| Button click -> prevent double submit | Debounce (leading) | Fire once immediately, ignore rapid repeats |
| Mouse drag -> update element position | Throttle (often via `requestAnimationFrame`) | Needs continuous visual feedback during the whole drag |
| Auto-save a document | Debounce (trailing) | Save once the user pauses, not on every keystroke |
| Analytics "scroll depth" tracking | Throttle | Need periodic samples throughout the scroll, not just the end state |

## React/Vue Implementation Notes
- In React, a naive `debounce(fn, 300)` called directly inside a function component body creates a *new* debounced function on every render, defeating the debounce entirely — it needs to be memoized (`useMemo`/`useRef`) or defined outside the component
- Vue's Composition API has the same pitfall with functions defined inside `setup()` on frameworks that re-run setup logic; libraries like VueUse ship pre-built `useDebounceFn`/`useThrottleFn` composables that handle this correctly
- Cleanup matters more in component frameworks than in plain scripts — an uncancelled debounce timer firing after unmount is a common source of "can't perform a state update on an unmounted component" warnings

## Example
Debounce a search input so the API call only fires after the user stops typing for 300ms. Contrast with throttling a scroll listener so a "back to top" button's visibility check runs at most every 200ms while the user scrolls, instead of on every single scroll event the browser fires (which can be dozens per second).
