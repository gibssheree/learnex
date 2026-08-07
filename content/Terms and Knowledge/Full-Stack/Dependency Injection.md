---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# Dependency Injection

**Definition:** A pattern where an object's dependencies are provided to it from outside, instead of it creating them itself.

## How It Works
- Instead of a class instantiating its own database connection, it receives one passed in via constructor, function parameter, or a framework container
- Three main injection styles: constructor injection (dependency passed at creation time), setter/property injection (assigned after construction via a setter), and interface injection (the dependency provides a method that injects itself into the consumer)
- A "composition root" — usually your app's entry point (`main.ts`, `index.js`, `Program.cs`) — is where the object graph gets wired up: concrete classes are instantiated and threaded through constructors, ideally in exactly one place
- An IoC (Inversion of Control) container automates this wiring: you register interfaces/tokens against concrete implementations, and the container resolves the full dependency graph at runtime, instantiating everything in the right order
- Dependencies are typically expressed as interfaces/abstract types rather than concrete classes, so the consumer only knows the shape (e.g., `Logger`) not the implementation (`FileLogger` vs `ConsoleLogger`)
- Resolution can happen eagerly (everything built at startup) or lazily (an object is only constructed the first time it's actually requested), which matters for startup time in large graphs

## Why It Matters
- Makes code far easier to test, since you can swap in a fake dependency, and decouples components from concrete implementations
- Enables the Open/Closed Principle: you can add a new implementation of a dependency (swap Postgres for an in-memory repository) without touching the class that consumes it
- Centralizes configuration of cross-cutting concerns — logging, caching, retry policies — so a single change in the composition root propagates everywhere that dependency is used
- Supports the Liskov Substitution Principle by forcing consumers to code against abstractions, so any conforming implementation is interchangeable without breaking callers
- In large codebases, it prevents "new-ing up" the same heavyweight object (an HTTP client, a DB pool) in dozens of places, which fragments configuration and wastes resources
- Makes parallel development easier: one team can build against an interface while another team implements it, as long as both agree on the contract

## Common Pitfalls
- Over-engineering small projects with heavy DI frameworks/containers when a simple function parameter would do
- "Constructor over-injection" — a class with 8+ constructor parameters is usually a sign it's doing too much and needs to be split, not a sign you need a bigger container
- Service locator anti-pattern: instead of injecting dependencies, code calls `container.resolve('logger')` deep inside a method, which hides the real dependencies and makes testing just as hard as the problem DI was meant to solve
- Circular dependencies (A needs B, B needs A) that the container either fails to resolve or "solves" with lazy proxies that mask a real design problem
- Injecting concrete classes instead of interfaces, which quietly reintroduces tight coupling while looking like DI on the surface
- Runtime resolution failures — "no binding found for X" — that only surface when that code path executes, unlike compile-time errors from direct instantiation
- Mismanaged lifetimes: a "singleton" service that accidentally holds per-request state, causing data to leak between unrelated requests under load

## Under the Hood
- Reflection-based containers (Spring, .NET's `Microsoft.Extensions.DependencyInjection`, Java's Guice) inspect constructor parameter types at runtime and recursively resolve each one from a registry before invoking `new`
- Lifetime/scope management is a core container responsibility: **transient** (new instance every resolution), **singleton** (one instance for the app's lifetime), and **scoped** (one instance per request/unit of work, common in web frameworks) — picking the wrong lifetime is a frequent source of subtle bugs
- Some languages skip runtime containers entirely in favor of compile-time DI: Go projects often use `wire`, which generates plain constructor-calling code at build time, trading container magic for a small amount of generated boilerplate you can actually read and step through in a debugger
- TypeScript decorators (`@Injectable()`, `@Inject()` in Angular/NestJS) attach metadata to classes that the framework's reflector reads to build the dependency graph — this relies on `reflect-metadata` polyfilling type information that TypeScript normally erases at compile time
- Containers detect circular dependencies by walking the graph during resolution; some break the cycle automatically using a lazy proxy, others simply throw, forcing you to refactor

## Variants
- **Constructor injection** — most common, makes dependencies explicit and required, and plays well with immutability (`readonly` fields)
- **Setter injection** — used when a dependency is optional or swappable after construction; more prone to objects existing in a half-configured state before the setter runs
- **Method injection** — dependency passed only to the specific method that needs it, avoiding bloating the whole class with a rarely-used dependency
- **Ambient context / DI via closures** — common in functional codebases (React hooks, Go) where "injection" is just passing a function or config object as an argument, no container required

## Comparison

| Approach | Coupling | Testability | Setup Cost |
|---|---|---|---|
| Manual `new` inside class | Tight | Hard to mock | None |
| Manual DI (constructor param, no framework) | Loose | Easy to mock | Low |
| DI container/framework | Loose | Easy to mock | Moderate–High |
| Service Locator | Loose-looking, actually tight | Hard to mock (hidden deps) | Moderate |

## Best Practices
- Prefer manual constructor injection over a container until the object graph is genuinely complex enough to justify one — most backend services never need a full container
- Depend on interfaces/abstract types, not concrete classes, so implementations are swappable
- Keep the composition root as the *only* place that knows about concrete implementations; nothing else should import a concrete class it doesn't own
- Fail fast: validate the dependency graph at application startup (most containers support this) rather than discovering a missing binding when a rarely-hit code path finally executes
- Avoid injecting more than 4–5 dependencies into one class — treat it as a signal to extract a smaller, more focused class
- Use scoped lifetimes for anything that touches per-request state (like a request ID or a DB transaction) to avoid state bleeding across requests

## FAQ
**Is DI the same as IoC (Inversion of Control)?**
No — IoC is the broader principle (something else controls flow/object creation instead of your code doing it directly). DI is one specific technique for achieving IoC; others include the Observer pattern and template methods.

**Do I need a framework to do DI?**
No. "Poor man's DI" — passing dependencies as constructor arguments with no container — is real DI and is often the right choice for small-to-medium codebases.

**Does DI slow down my app?**
Reflection-based container resolution has a small startup-time cost (resolving the graph), but per-request overhead is typically negligible since singletons/scoped instances are resolved once and reused, not rebuilt per call.

**How is this different from just passing arguments to a function?**
It isn't, fundamentally — DI is that idea applied consistently and formalized, often with tooling to manage the wiring once the graph gets large.

**Can DI cause runtime errors that a type checker would normally catch?**
Yes — this is one of DI's real costs. Because a container often resolves dependencies by string token or reflection rather than a direct function call, a missing or mistyped binding surfaces as a runtime exception ("no provider for X") instead of a compile error, which is why validating the graph at startup matters so much.

## History
- The term "Dependency Injection" was coined by Martin Fowler in a widely-cited 2004 article, though the underlying idea (Inversion of Control) had been discussed in the Java community for years before that under vaguer names
- The Spring Framework (2003) was the vehicle that took DI mainstream in enterprise Java, popularizing XML-configured, then annotation-configured, dependency wiring at a time when most Java code manually instantiated everything through static factories
- .NET, Angular, and later NestJS each built DI into the framework core rather than bolting it on, reflecting how central the pattern became to "modern" object-oriented web framework design by the mid-2010s
- Functional and lighter-weight ecosystems (Go, much of the JS/React world) largely rejected heavyweight containers, favoring explicit constructor/closure-based injection — a reaction to the reflection-heavy, sometimes "magic" feel of Spring-style DI

## Real-World Example
NestJS (a Node.js framework) builds its entire architecture around DI. A `@Injectable()` class marks something as available for injection; NestJS's container inspects a class's constructor parameter types (using TypeScript's emitted metadata) and automatically supplies the right instance:

```typescript
@Injectable()
class UsersRepository {
  findById(id: string) { /* ... */ }
}

@Injectable()
class UsersService {
  constructor(private readonly repo: UsersRepository) {} // auto-resolved by Nest's container
}

@Controller("users")
class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```
No line of application code ever writes `new UsersService()` — the framework's container builds the whole graph at startup, and swapping `UsersRepository` for a test double in a NestJS `Test.createTestingModule()` is a one-line override.

## Related Terms
- [[MVC]]
- [[Microservices vs Monolith]]
- [[ORM]]

## Example
Passing a mock database into a service during unit tests instead of hitting a real database.

## Code Example
```typescript
// Without DI — tightly coupled, hard to test
class OrderService {
  private db = new PostgresConnection(); // hardcoded dependency
  placeOrder(order: Order) {
    this.db.save(order);
  }
}

// With DI — dependency is injected, easy to swap/mock
interface Database {
  save(order: Order): Promise<void>;
}

class OrderService {
  constructor(private db: Database) {} // constructor injection
  placeOrder(order: Order) {
    return this.db.save(order);
  }
}

// Production wiring (composition root)
const service = new OrderService(new PostgresConnection());

// Test wiring — no real database touched
const fakeDb: Database = { save: jest.fn() };
const testService = new OrderService(fakeDb);
```

Python's FastAPI takes a function-based approach instead of a class container — `Depends()` marks a parameter as injected, and FastAPI resolves it (including nested dependencies) per request:

```python
from fastapi import Depends, FastAPI

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db  # injected value
    finally:
        db.close()  # cleanup runs after the request, even on error

@app.get("/orders/{order_id}")
def read_order(order_id: int, db: Session = Depends(get_db)):
    return db.query(Order).get(order_id)

# In tests, override the dependency instead of monkeypatching internals
app.dependency_overrides[get_db] = lambda: fake_session
```
