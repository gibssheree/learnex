---
tags: [moc, term, fullstack]
---

# Full-Stack Terms MOC

48 terms every full-stack developer runs into day to day. Each note has: definition, how it works, why it matters, common pitfalls, related terms, and a concrete example.

## Authentication & Security
- [[JWT (JSON Web Token)]]
- [[Session]]
- [[Cookies]]
- [[OAuth 2.0]]
- [[SSO (Single Sign-On)]]
- [[CSRF (Cross-Site Request Forgery)]]
- [[XSS (Cross-Site Scripting)]]
- [[CORS (Cross-Origin Resource Sharing)]]

## API & Networking
- [[REST API]]
- [[GraphQL]]
- [[WebSocket]]
- [[HTTP Methods]]
- [[HTTP Status Codes]]
- [[Idempotency]]
- [[Webhook]]
- [[gRPC]]

## Database & Data
- [[SQL vs NoSQL]]
- [[ORM]]
- [[Database Indexing]]
- [[Database Migration]]
- [[Caching]]
- [[ACID Transactions]]
- [[N+1 Query Problem]]
- [[Connection Pooling]]

## Architecture & Backend
- [[Microservices vs Monolith]]
- [[Middleware]]
- [[Load Balancer]]
- [[Message Queue]]
- [[Environment Variables]]
- [[MVC]]
- [[Dependency Injection]]
- [[Serverless]]

## Frontend & State
- [[State Management]]
- [[Virtual DOM]]
- [[SPA vs SSR vs SSG]]
- [[Hydration]]
- [[Debounce vs Throttle]]
- [[Lazy Loading]]
- [[CDN]]
- [[Local Storage vs Session Storage]]

## DevOps & Delivery
- [[CI-CD|CI/CD]]
- [[Docker|Docker / Containerization]]
- [[Reverse Proxy]]
- [[DNS]]
- [[SSL-TLS|SSL/TLS (HTTPS)]]
- [[Rate Limiting]]
- [[Feature Flags]]
- [[Semantic Versioning]]

---

## How to use this
Skim a category before starting a project that touches it. If you hit an unfamiliar term in a tutorial or job posting, check here first before going to Google — most day-to-day full-stack vocabulary is covered.

## Suggested order if starting from zero
1. **Cookies → Session → JWT** — the auth fundamentals, in the order they build on each other
2. **HTTP Methods → HTTP Status Codes → REST API** — how the web actually talks
3. **SQL vs NoSQL → ORM → Database Indexing** — data layer basics
4. **CI/CD → Docker → Environment Variables** — how code actually gets to production
5. Everything else as you bump into it in real projects
