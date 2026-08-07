---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Middleware

**Definition:** Code that runs between receiving a request and sending a response, used for cross-cutting concerns.

## How It Works
- Requests pass through a chain of middleware functions, auth check, logging, parsing, before reaching the actual route handler
- Each middleware function receives the request (and often the response), does something with it, then either passes control to the next middleware or short-circuits the chain
- In Express, that hand-off is explicit: calling `next()` moves to the next function in the chain; not calling it stalls the request forever
- Middleware can run **before** the route handler (parsing, auth), **wrap around it** (timing, logging both request and response), or run **after** on the way out (error formatting, response compression)
- Order matters: middleware registered first runs first, so a body-parser must come before any handler that reads `req.body`, and auth middleware must come before the routes it protects

## Under the Hood
- Conceptually, middleware is the **chain of responsibility** design pattern applied to HTTP request handling
- Each layer is a function of shape `(request, response, next) => void` (Express) or `(request, next) => response` (Koa, many others) — the exact signature varies by framework but the composition idea is the same
- Many frameworks build the final handler as nested function composition: `mw1(mw2(mw3(handler)))`, so calling the outermost function walks inward through every layer
- **Error-handling middleware** is usually a special case: in Express it's any middleware function with 4 arguments `(err, req, res, next)`, and calling `next(err)` anywhere in the chain skips straight to it, bypassing normal middleware
- Async middleware needs care: an unhandled promise rejection inside a middleware function won't automatically call `next(err)` unless the framework wraps it (Express 5 does this natively; Express 4 requires manual try/catch or a wrapper like `express-async-handler`)
- Middleware can be scoped globally (`app.use(fn)`, every request), per-router (`router.use(fn)`), or per-route (`app.get('/admin', authMiddleware, handler)`)

## Why It Matters
- Keeps common logic like auth and logging out of every individual route
- Centralizes cross-cutting concerns so they're implemented once and applied consistently, instead of copy-pasted (and drifting) across every handler
- Makes route handlers focus purely on business logic — by the time a handler runs, it can assume the request is authenticated, parsed, and rate-limited
- Composable: middleware can be mixed and matched per route (e.g., only some routes need file-upload parsing), and third-party middleware (helmet for security headers, cors for CORS, morgan for logging) plugs into the same chain as custom code
- The same mental model shows up outside HTTP frameworks too: Redux middleware intercepts actions before they reach the reducer, gRPC interceptors wrap RPC calls, and GraphQL resolvers often chain through similar plugin/directive pipelines

## Common Pitfalls
- Forgetting to call `next()` in Express-style middleware, which hangs the request forever
- Calling `next()` *and* still sending a response (or vice versa — sending a response but also calling `next()`), causing "headers already sent" errors
- Registering middleware in the wrong order — e.g., putting auth middleware after the routes it's supposed to protect, so it never runs
- Doing expensive synchronous work (heavy computation, blocking I/O) inside middleware that runs on every single request, silently tanking throughput
- Mutating the request object in surprising ways (attaching huge objects to `req`) that later middleware or handlers don't expect, creating hidden coupling between unrelated middleware
- Not scoping middleware narrowly enough — applying an expensive or route-specific middleware (like file upload parsing) globally instead of only on the routes that need it
- Swallowing errors inside middleware instead of passing them to `next(err)`, so failures fail silently instead of hitting error-handling middleware

## Variants
- **Application-level middleware** — bound to the whole app instance, runs on every matching request (`app.use(logger)`)
- **Router-level middleware** — scoped to a specific router/subset of routes, common for grouping e.g. all `/admin/*` routes behind an admin-auth check
- **Built-in middleware** — framework-provided, like Express's `express.json()` for body parsing or `express.static()` for serving files
- **Third-party middleware** — published packages solving common concerns: `helmet` (security headers), `cors`, `compression`, `morgan`/`pino-http` (logging), `passport` (auth strategies)
- **Error-handling middleware** — the 4-argument variant in Express that catches errors passed via `next(err)` and formats a response
- Outside Express-style HTTP servers, the same idea appears as: Redux middleware (`store => next => action => ...`), gRPC interceptors, Django/Rails filters (`before_action`, decorators), and API gateway policies (rate limiting, auth) in front of [[Microservices vs Monolith|microservices]]

## Comparison

| | Middleware | Controller/Route handler |
|---|---|---|
| Scope | Cross-cutting, applies to many routes | Specific to one endpoint |
| Runs | Before/around/after the handler | The actual business logic |
| Typical use | Auth, logging, parsing, CORS, rate limiting | Fetch data, apply domain logic, build response |
| Reusability | Designed to be shared across routes | Usually route-specific |

## Best Practices
- Keep each middleware function focused on one concern (auth, logging, parsing) — resist combining unrelated responsibilities into one function
- Always call `next()` on the success path, and always pass errors to `next(err)` instead of throwing silently or sending a response directly
- Order middleware deliberately: parsing → security headers → CORS → auth → rate limiting → route handlers → error handler last
- Scope expensive or route-specific middleware as narrowly as possible instead of applying it globally
- For async middleware, ensure rejected promises are caught and forwarded to error-handling middleware (native `async` support in Express 5, or a wrapper utility in Express 4)
- Put the error-handling middleware last in the chain — Express identifies it by argument count and arity, not registration order relative to routes, but it must still be registered after routes to catch their errors

## FAQ
**Is middleware the same thing as a decorator?** Related but not identical — both wrap behavior around a core function, but middleware specifically refers to a chain applied to requests/actions in a pipeline, while decorators (Python `@app.route`, TypeScript decorators) are a language feature for wrapping any function or class.

**Can middleware modify the response after the handler runs?** Yes, if it wraps the call — code placed after `next()` resolves inside the same middleware function runs on the way back out, which is how response-compression or response-timing middleware works.

**Does middleware order affect performance, not just correctness?** Yes — cheap checks (like a fast auth-token presence check) should generally run before expensive ones (like a database-backed permission lookup) to fail fast and avoid unnecessary work.

## Middleware Across Frameworks
The chain-of-responsibility idea is nearly universal, but the mechanics differ:

```js
// Koa: middleware wraps via async/await instead of a next() callback
app.use(async (ctx, next) => {
  const start = Date.now();
  await next(); // downstream middleware + handler run here
  console.log(`${ctx.method} ${ctx.url} - ${Date.now() - start}ms`); // runs on the way back out
});
```

```python
# Django: middleware is a class with methods called before and after the view
class TimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)  # calls the next middleware / view
        response["X-Response-Time"] = f"{time.time() - start:.3f}s"
        return response
```

```go
// Go (net/http): middleware is just a function wrapping a Handler
func Logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("%s %s", r.Method, r.URL.Path)
        next.ServeHTTP(w, r) // pass control onward
    })
}
```

Despite different syntax, all three share the same shape: receive the request, optionally act before passing control onward, let the next layer run, and optionally act again after it returns.

## More FAQ
**Can middleware short-circuit the chain entirely?** Yes — that's exactly what auth middleware does when it returns a 401 without calling `next()`; the route handler and any middleware after it simply never run.

**Does middleware order matter for security-critical checks?** Yes, significantly — a rate limiter placed after an expensive auth/database check wastes the resource it's meant to protect; put cheap, high-value gates (IP blocklists, basic rate limiting) as early as possible in the chain.

**Is a reverse proxy like Nginx "middleware"?** Conceptually similar (it sits between the client and the app, handling concerns like TLS termination, compression, and routing) but it's a separate process, not code running inside the application's request-handling pipeline — think of it as middleware at the infrastructure layer rather than the application layer.

**How is middleware different from an API Gateway?** An API Gateway is middleware's infrastructure-level cousin: it applies cross-cutting concerns (auth, rate limiting, routing) once, in front of many services, instead of duplicating that logic inside each service's own middleware stack — common in [[Microservices vs Monolith|microservices]] architectures.

## Related Terms
- [[REST API]]
- [[MVC]]
- [[Dependency Injection]]
- [[JWT (JSON Web Token)]]
- [[Load Balancer]]

## Example
An auth middleware that checks for a valid JWT before letting the request reach the actual `/orders` route:

```js
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    req.user = verifyJwt(token); // attach decoded user for downstream handlers
    next(); // pass control to the next middleware or route handler
  } catch (err) {
    next(err); // forward to error-handling middleware, don't swallow it
  }
}

app.use(express.json());          // parse JSON bodies first
app.use('/orders', requireAuth);  // scoped only to /orders routes
app.get('/orders', (req, res) => {
  res.json(getOrdersForUser(req.user.id)); // handler assumes req.user exists
});

// error-handling middleware, registered last
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.message });
});
```
