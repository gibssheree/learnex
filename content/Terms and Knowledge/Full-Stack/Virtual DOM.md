---
tags: [term, fullstack, frontend, performance]
category: Frontend & State
---

# Virtual DOM

**Definition:** An in-memory representation of the UI that frontend frameworks use to figure out the minimal real DOM changes needed.

## How It Works
- On state change, the framework builds a new virtual tree, diffs it against the previous one
- Only the real DOM nodes that actually changed get updated
- The virtual tree is just plain JavaScript objects (`{ type: 'div', props: {...}, children: [...] }`), which is why building and comparing it is cheap relative to touching the real DOM
- The diffing ("reconciliation") algorithm walks both trees level by level, comparing node types and props at each position, rather than doing a full generic tree diff
- Once the diff produces a list of changes, the framework applies them to the real DOM in a single batch, minimizing layout thrashing (repeated reflow/repaint cycles)

## Why It Matters
- Real DOM updates are slow; this diffing approach is why React-style frameworks feel fast
- The real DOM is a browser API surface with a huge amount of baggage (layout, style computation, accessibility tree, event listeners) — touching it is orders of magnitude more expensive than touching a plain JS object
- Lets developers write declarative code ("render the UI as a function of state") instead of manually writing imperative DOM mutation code (`element.appendChild`, `element.classList.add`), while still getting close-to-optimal DOM updates

## Common Pitfalls
- Assuming the Virtual DOM makes rendering "free" — unnecessary re-renders still cost CPU even if the final DOM diff is small, because building and diffing the virtual tree itself has a cost
- Using array index as a `key` in a list that can reorder, get items inserted, or get items removed — the diffing algorithm can misattribute state to the wrong item, causing subtle bugs (wrong input keeps focus, wrong row animates)
- Not memoizing expensive child components (`React.memo`, `shouldComponentUpdate`), so a parent re-render cascades into re-rendering (and re-diffing) a subtree that didn't actually change
- Creating new object/array/function literals inline as props on every render (`<Child style={{color: 'red'}} />`), which breaks reference-equality checks used by memoization and causes children to re-render even when nothing meaningful changed
- Reading from or manually mutating the real DOM outside the framework's lifecycle (direct `document.querySelector` mutations), which the virtual DOM doesn't know about — the next diff can silently overwrite or conflict with that change

## Under the Hood: The Diffing Algorithm
A naive tree-diff algorithm is O(n³) in the number of nodes, far too slow for UI updates. React's (and similar) reconciler instead uses heuristics that make it O(n):
- **Different element types produce different subtrees.** If a `<div>` becomes a `<span>` at the same position, the algorithm doesn't try to find a minimal edit — it tears down the whole old subtree and builds a new one from scratch
- **Keys identify identity across renders.** For a list of siblings, the `key` prop tells the algorithm "this virtual node is the same logical item as before," even if its position in the array changed — letting it move/reuse the corresponding real DOM node and its state (like input focus) instead of destroying and recreating it
- **Same type, same position = same instance.** If a component's type and key match at a given position, the algorithm reuses the underlying instance and just updates its props, preserving internal state like `useState` values

## React Fiber
Since React 16, the reconciler is called Fiber, a rewrite that made rendering interruptible. Older React (the "stack reconciler") processed a render as one uninterruptible synchronous pass; a large tree could block the main thread long enough to drop frames or make input feel laggy. Fiber breaks the work into units it can pause, resume, prioritize, or abandon, so high-priority updates (user typing, animation) can interrupt lower-priority ones (a large list re-render) — this is the mechanism underneath features like `startTransition` and Concurrent Mode.

## Comparison: Rendering Strategies
| Approach | How updates happen | Examples |
|---|---|---|
| Virtual DOM diffing | Build new virtual tree, diff against old, patch real DOM | React, Preact, Vue 2 |
| Fine-grained reactivity (no vdom) | Track exactly which DOM expressions read a signal; update only those directly | SolidJS, Svelte 5, Vue 3 (partially) |
| Compiler-based, no runtime diff | Compile templates to direct DOM update instructions ahead of time | Svelte (compile step), Qwik |
| Direct DOM manipulation | Developer manually mutates the DOM | Vanilla JS, jQuery |

The Virtual DOM isn't the fastest possible approach (fine-grained reactive systems can outperform it by skipping the diff step entirely) — its real win was making declarative UI code fast *enough* while staying simple to reason about, at a time (2013) when the alternative was mostly hand-written imperative jQuery.

## Code Example
```jsx
// What you write (JSX)
function Counter({ count }) {
  return <button onClick={handleClick}>Count: {count}</button>;
}

// Roughly what it compiles to — a virtual DOM node, just a plain object
function Counter({ count }) {
  return React.createElement(
    'button',
    { onClick: handleClick },
    `Count: ${count}`
  );
}
// => { type: 'button', props: { onClick, children: 'Count: 3' } }
```
When `count` changes from 3 to 4, React creates a new object (`children: 'Count: 4'`), diffs it against the previous one, sees only the text content differs, and issues a single targeted `textContent` update to the real `<button>` — it never touches or recreates the button element itself.

## Code Example: Keys and List Reconciliation
```jsx
// Bad: index as key — reordering the list misattributes state to the wrong row
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          <input type="checkbox" defaultChecked={todo.done} />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
// If a new todo is inserted at the top, every existing <li> shifts to a new
// index, so React reuses each DOM node for the "wrong" logical todo — a
// checked checkbox can end up next to the wrong text.

// Good: stable identity key — React tracks each row by its actual identity
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input type="checkbox" defaultChecked={todo.done} />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

## Best Practices
- Always use a stable, unique `key` (an ID, not an array index) for list items that can be reordered, inserted, or removed
- Memoize components that render expensive subtrees and receive the same props most of the time (`React.memo`, `useMemo` for derived values, `useCallback` for stable function references)
- Keep state as low in the tree as possible so a change only triggers a diff in the smallest necessary subtree, see [[State Management]]
- Avoid reaching into the real DOM directly; if you must (measuring an element, integrating a non-React library), do it inside a `ref` and an effect, not during render
- Split large components so a state change in one part doesn't force React to re-render and re-diff unrelated siblings that happen to live in the same component
- Profile before optimizing — use the React DevTools Profiler to confirm a component is actually re-rendering excessively before reaching for `memo`/`useMemo`, premature memoization adds its own overhead and complexity
- Pass primitive props where possible instead of freshly-constructed objects, primitives compare correctly with `===` by value, so memoization actually short-circuits as intended

## Comparison: Diffing Cost in Practice
| Scenario | What gets diffed | Real DOM writes |
|---|---|---|
| Text inside one `<span>` changes | Just that text node's virtual representation | One `textContent` update |
| A list item is appended | New child compared against nothing (no prior match) | One node inserted |
| A list is reordered without keys | Every position compared as if props changed | Potentially every node's attributes rewritten |
| A list is reordered with keys | Each key matched to its existing node | Nodes physically moved, not recreated |
| A parent component re-renders with unchanged children | Full subtree diffed even though nothing changed, unless memoized | None, if `memo`/`shouldComponentUpdate` short-circuits it; otherwise still walks the subtree even when the diff outputs zero DOM writes |

## FAQ
**Does every frontend framework use a Virtual DOM?** No. Vue and older React do; Svelte and Solid deliberately don't, compiling or tracking dependencies to skip the diff step entirely, often with better raw performance.

**Is the Virtual DOM slower than manual DOM manipulation?** For a single, hand-optimized update, manual DOM manipulation can always be faster in theory. The Virtual DOM's value is that it gets you *close* to optimal automatically, across an entire app, without every developer having to hand-optimize every update.

**Why do I still need `key` if the Virtual DOM handles diffing for me?** Diffing without keys falls back to comparing by position, not identity — reordering a list without keys makes the algorithm think items at each position simply changed props, not that they moved, which can misplace component state.

## History
The Virtual DOM was popularized by React when Facebook open-sourced it in 2013. Before this, the dominant pattern (jQuery, vanilla JS) was direct, imperative DOM manipulation, find a node, mutate it, and keeping that manually in sync with application state at scale was a well-known source of bugs. The Virtual DOM let developers "just describe what the UI should look like for this state" and offloaded the *how to get there efficiently* problem to the framework.

Timeline of the broader shift:
- **Pre-2010** — direct DOM manipulation via jQuery selectors and mutation calls, no formal separation between state and view
- **2010-2013** — early MV* frameworks (Backbone, Knockout, AngularJS 1.x) introduce data binding, but AngularJS's digest-cycle dirty checking (walking the whole watched-value tree to detect changes) becomes a known performance bottleneck at scale
- **2013** — React ships the Virtual DOM, decoupling "describe the UI" from "efficiently update the real DOM"
- **2016** — React Fiber rewrites the reconciler to make rendering interruptible and prioritizable
- **2019-present** — a counter-movement (Svelte, Solid, Vue 3's reactivity system) argues the Virtual DOM's diff step is itself unnecessary overhead if you can track dependencies precisely at compile time or via fine-grained signals instead

## FAQ (continued)
**Why did AngularJS (1.x) not use a Virtual DOM?** It predates the pattern's popularization and used a different mechanism, dirty checking, where every watched expression is re-evaluated and compared to its previous value on each digest cycle. This scaled poorly with large numbers of watchers, one of the reasons Angular was rewritten (as Angular 2+) and other frameworks reached for the Virtual DOM instead.

**Does adding more components make Virtual DOM diffing slower?** Yes, roughly linearly with the number of elements in the tree being diffed, which is exactly why memoization (`React.memo`) and keeping re-render scope narrow matter more as an app grows — the framework only diffs what actually needs re-rendering, not the whole app tree, but a poorly structured app can accidentally make "what needs re-rendering" much bigger than necessary.

## Related Terms
- [[State Management]]
- [[SPA vs SSR vs SSG]]
- [[Hydration]]

Reconciliation also interacts directly with [[Hydration]]: on the initial server-rendered load, the framework doesn't diff against an empty DOM, it diffs the virtual tree against the *existing* server-rendered markup and attaches event listeners in place, skipping the work of tearing down and rebuilding DOM nodes that already match.

## Example
Typing in a search box only updates the results list in the real DOM, not the entire page. React builds a new virtual tree for the whole component on every keystroke, diffs it against the last one, finds that only the `<ul>` of results differs, and patches just that element, the search input, header, and footer nodes are left completely untouched in the real DOM.

That last detail matters in practice: because the input element itself is untouched by the patch, the browser's native focus and cursor position inside it are preserved automatically, no manual focus-management code required, something that was a common source of bugs in the pre-Virtual-DOM, manual-DOM-manipulation era.
