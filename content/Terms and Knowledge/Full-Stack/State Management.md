---
tags: [term, fullstack, frontend]
category: Frontend & State
---

# State Management

**Definition:** How an app tracks and updates data that changes over time, user input, fetched data, UI state, and keeps the UI in sync with it.

## How It Works
- Ranges from simple component-local state to global stores (Redux, Zustand, Context) shared across the whole app
- State lives somewhere (a variable, a store, a URL), and the UI is a function of that state — when the state changes, the parts of the UI that depend on it re-render
- Most frameworks enforce a unidirectional data flow: state flows down to components as props, events flow up as callbacks or dispatched actions, state never gets mutated directly from a child
- Updates are typically funneled through a single mechanism per scope, `setState`/`useState` locally, `dispatch(action)` for a reducer, a store's setter for global libraries — so every change is traceable to one code path instead of scattered mutations
- Frameworks batch multiple state updates that happen within the same event handler or tick into a single re-render, rather than re-rendering after every individual `setState` call
- "State" isn't one bucket — most apps juggle several categories simultaneously (see Types below), and a lot of state management pain comes from treating them all the same way

## Why It Matters
- Badly managed state is the #1 source of confusing bugs in frontend apps, "why did this update when I didn't touch it"
- Where state lives determines how many components re-render on a change — state placed too high in the tree causes cascading, unnecessary re-renders in unrelated branches
- It's the difference between an app that's easy to reason about (one source of truth per piece of data) and one where the same fact is duplicated in three components and drifts out of sync
- Directly affects performance: every state update is a potential trigger for the [[Virtual DOM]] diffing process, so how granular and how frequent your updates are has a real, measurable cost

## Common Pitfalls
- Putting everything in global state when local component state would do, causing unnecessary re-renders and complexity
- Treating server data (fetched from an API) as if it were client UI state — it needs caching, revalidation, and loading/error states that generic stores don't give you for free
- Deriving state that could be computed on the fly (e.g. storing `filteredItems` separately from `items` and `filterText`) instead of computing it during render, leading to state that silently goes stale
- Mutating state directly (`state.items.push(x)`) instead of creating a new reference — many libraries rely on reference equality (`===`) to detect changes, so a direct mutation can fail to trigger a re-render at all
- Prop drilling: passing state through five layers of components that don't use it, just to reach the one that does, instead of using Context or a store
- Overusing Context for frequently-changing values — every consumer of a Context re-renders on any change to it, with no built-in selector/memoization, unlike most dedicated state libraries
- Storing derived or transient UI state (like "is this dropdown open") in a global store out of habit, when it belongs entirely local to the component

## Types of State
- **Local/component state** — owned and used by a single component (`useState`, a class's `this.state`). Should be the default; only lift it up when something else genuinely needs it
- **Global/shared client state** — UI state needed across unrelated parts of the tree: theme, current user, cart contents, feature flags
- **Server state** — data that actually lives on a server and is just cached on the client: API responses, database records. It can go stale, needs refetching, and has its own concerns (caching, deduping requests, background revalidation) — this is why libraries like React Query / TanStack Query and SWR exist as a distinct category from Redux/Zustand
- **URL state** — state encoded in the URL (query params, route segments): current page, active filters, selected tab. Shareable and bookmarkable by nature, and survives a refresh without any extra code
- **Form state** — input values, validation errors, touched/dirty fields, submission status. High-churn and localized, which is why dedicated libraries (Formik, React Hook Form) exist instead of routing every keystroke through a global store

## Under the Hood
- Most state libraries are, at their core, a subscription system: a store holds a value, components subscribe to it (or to a slice of it), and the store notifies subscribers on change so they re-render
- Reducer-based state (Redux, `useReducer`) formalizes updates as `(state, action) => newState`, a pure function, which makes state changes deterministic, loggable, and replayable (this is what powers Redux DevTools' time-travel debugging)
- Fine-grained reactive systems (Solid, Vue 3, MobX, Svelte 5 runes) skip the "re-render a whole component tree and diff" step entirely — they track exactly which DOM expressions read a given piece of state and update only those, no virtual DOM diffing involved
- Selector functions (`useSelector` in Redux, a Zustand slice) let a component subscribe to a narrow piece of a larger store instead of the whole object, avoiding re-renders when unrelated parts of the store change

## Comparison
| Approach | Scope | Boilerplate | Re-render granularity |
|---|---|---|---|
| `useState`/`useReducer` | Single component (+ children via props) | Minimal | Component-level |
| React Context | Subtree of components | Low | Every consumer re-renders on any change |
| Redux / Redux Toolkit | Whole app | Moderate–high | Fine, via selectors |
| Zustand / Jotai | Whole app | Low | Fine, via selectors/atoms |
| React Query / SWR | Server-derived data only | Low | Per-query, with built-in caching |

## Code Example
```jsx
// Local state — fine for a toggle nobody else needs
function Accordion() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(o => !o)}>{open ? "Hide" : "Show"}</button>;
}

// Global state with Zustand — shared cart count across header + cart page
import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  count: () => useCartStore.getState().items.length,
}));

function CartBadge() {
  const items = useCartStore((state) => state.items); // selector: only re-renders on items change
  return <span>{items.length}</span>;
}
```

## Code Example: Context + useReducer for App-Wide State
```jsx
// A minimal global store without pulling in an external library
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  return useContext(CartContext); // custom hook keeps consumers decoupled from Context internals
}
```

## Code Example: Server State with React Query
```jsx
// Server state gets its own tool — caching, refetching, and loading/error
// states come for free instead of being hand-rolled with useEffect
function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(res => res.json()),
    staleTime: 60_000, // treat cached data as fresh for 60s, skip refetch
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  return <ul>{data.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```

## Best Practices
- Default to local state; lift it up only when a sibling or parent genuinely needs it, not preemptively
- Keep derived values out of state entirely — compute them during render (or memoize with `useMemo` if the computation is expensive)
- Separate server state from client state and use a purpose-built tool (React Query, SWR, RTK Query) for the former instead of manually wiring `useEffect` + `fetch` + a reducer
- Normalize deeply nested or relational state (flat maps keyed by ID) rather than nested arrays of objects, to make updates O(1) instead of requiring a deep clone
- Never mutate state in place — always create new objects/arrays so reference-equality checks (and the [[Virtual DOM]] diff) work correctly
- Colocate state with the component tree that uses it rather than defaulting everything to a top-level store, "lift state up, not to the top"
- Name actions/events by intent (`ADD_ITEM`) rather than by implementation (`SET_ITEMS_ARRAY`), it keeps the reducer's log of state transitions readable and debuggable

## FAQ
**Do I need Redux for every React app?** No. Modern React (Context + `useReducer`, or a lightweight library like Zustand) covers most apps. Redux earns its complexity in large apps with intricate cross-cutting state, complex async flows, and a need for strict traceability/DevTools.

**Why does my component re-render when unrelated Context state changes?** Context has no built-in selector mechanism — any change to the value passed to `Provider` re-renders every consumer, even ones that only read an untouched field. Split Context into smaller providers or switch to a library with selectors to avoid this.

**Is URL state "real" state management?** Yes, and it's underused. Anything that should survive a refresh or be shareable via link (filters, pagination, active tab) belongs in the URL, not in a JS store that resets on reload.

**What's the difference between "state" and "props"?** State is data a component owns and can change itself; props are data passed in from a parent, and a component can't modify its own props. A common pattern is "lifting state up" — moving a piece of state to the nearest common ancestor of the components that need to read or change it, then passing it down as props plus a setter callback.

**Why do some teams avoid Redux entirely now?** Redux Toolkit (the now-standard way to write Redux) addressed most of the old boilerplate complaints, but the ecosystem has also matured toward splitting concerns: server state to React Query/SWR, and only genuinely global client state to a small store like Zustand or Jotai. For many apps that split alone removes most of the reason to reach for Redux's full machinery.

## History
Early web apps kept state directly in the DOM or scattered across global variables and jQuery callbacks, there was no formal concept of "state" separate from the page itself. As apps grew more interactive, this became unmanageable: the same fact (is the user logged in, is the cart open) could be checked and set in a dozen different places with no single source of truth. Flux (Facebook, 2014) introduced the unidirectional-data-flow pattern explicitly to fix this, actions flow to a dispatcher, which updates stores, which the view reads from, never the reverse. Redux (2015) simplified Flux into a single store with pure reducer functions, which became the dominant pattern for years. More recently, the rise of dedicated server-state libraries (React Query, SWR) reflects a realization that "state management" was really two different problems, client UI state and cached server data, that had been awkwardly forced into one tool for a decade.

## Related Terms
- [[Virtual DOM]]
- [[SPA vs SSR vs SSG]]
- [[Hydration]]

## Example
A shopping cart's item count needs to show in both the header and the cart page, so it lives in shared/global state. The list of products on the page, meanwhile, is server state fetched from an API and cached with a library like React Query, not hand-rolled into the same store — and whether the "sale items only" filter is active lives in the URL (`?filter=sale`) so a shared link reproduces the same view.
