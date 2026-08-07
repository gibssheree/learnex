---
tags: [term, fullstack, backend, devops]
category: Architecture & Backend
---

# Environment Variables

**Definition:** Configuration values, like API keys and database URLs, stored outside your code and injected at runtime based on where the app is running.

## How It Works
- Set in a `.env` file locally, or your hosting platform's dashboard in production
- Read by the app via `process.env` or the equivalent in your language
- The OS stores environment variables as key-value string pairs attached to a process; when a process spawns a child process, the child inherits a copy of the parent's environment at fork/exec time
- Changes a child process makes to its own environment don't propagate back to the parent — the inheritance is one-directional and copy-based, not a shared reference
- Libraries like `dotenv` (Node), `python-dotenv` (Python), or `godotenv` (Go) parse a `.env` file at process startup and manually populate `process.env`/`os.environ` — the OS itself doesn't know `.env` files exist
- Precedence typically flows: variables set directly in the shell/host environment override anything loaded from a `.env` file, which overrides hardcoded defaults in the app's config code
- In containers, env vars are set via `Dockerfile ENV`, the `docker run -e KEY=value` flag, an `--env-file`, or a Compose/Kubernetes manifest's `environment:`/`env:` block

## Why It Matters
- Keeps secrets out of source control and lets the same code run differently in dev, staging, and production
- Implements the "config" factor of the [12-factor app](https://12factor.net/config) methodology: strict separation between code (which doesn't change between environments) and config (which does)
- Lets the exact same [[Docker|Docker]] image or build artifact be promoted from staging to production unchanged — only the environment variables differ, which is what makes "build once, deploy everywhere" possible
- Enables per-environment behavior — feature toggles, log verbosity, third-party API endpoints — without maintaining separate code branches
- Plays directly into [[CI-CD|CI/CD]] pipelines, where secrets are injected by the CI system at deploy time rather than stored in the repository

## Common Pitfalls
- Committing a `.env` file with real secrets to git
- No sane fallback/default, causing crashes when a variable is missing
- Forgetting that a secret committed once remains in git history forever, even after deleting it in a later commit — requires a history rewrite (`git filter-repo`, BFG) plus rotating the leaked secret
- Confusing build-time and runtime variables in frontend frameworks: a variable read via `import.meta.env.VITE_*` or `process.env.NEXT_PUBLIC_*` gets baked into the compiled JS bundle at build time and is publicly visible to anyone who opens devtools — it is not a secret
- Silent typos in variable names (`DATABAE_URL`) that resolve to `undefined` instead of throwing, since most languages treat a missing env var as an empty/undefined value rather than a compile error
- Loading `.env` in production by accident, overriding correctly-set platform secrets with stale local values baked into a shipped image
- Storing structured data (JSON, arrays) in env vars without a consistent serialization convention, leading to fragile manual `JSON.parse(process.env.CONFIG)` calls scattered across the codebase
- Assuming env vars are automatically encrypted or access-controlled — on most platforms they're plaintext in the process environment and in the platform's dashboard/logs, so leaking a deploy log can leak a secret just as easily as leaking source code
- Different casing or naming conventions across services (`dbUrl` vs `DB_URL` vs `DATABASE_URL`) that make it hard to grep for where a given piece of config is actually consumed

## Under the Hood
- On Linux/macOS, `export FOO=bar` in a shell makes `FOO` part of that shell process's environment *and* marks it for inheritance by child processes; `FOO=bar` without `export` only sets a shell variable visible to the current shell, not to anything it spawns
- Every process on POSIX systems has an `environ` array of `NAME=value` C strings, accessible via `getenv()`; `process.env` in Node.js is a JS object synced to that same underlying table
- Env vars are plaintext in process memory and are visible to anything with permission to inspect the process, e.g. `/proc/<pid>/environ` on Linux or `docker inspect` for a container — this is why they're considered good enough for config but not bulletproof for highly sensitive secrets (a dedicated secret manager with access auditing is stronger)
- Secret managers (HashiCorp Vault, AWS Secrets Manager, Doppler, 1Password Secrets Automation) go a step further: secrets are fetched over an authenticated API call at startup or injected just-in-time, never persisted to disk as a `.env` file, and access is logged and revocable without redeploying

## Variants
- **`.env` layering** — many frameworks (Next.js, Vite, Create React App) support `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.test`, loaded in a defined precedence order so environment-specific overrides don't require duplicating every variable
- **Build-time vs. runtime variables** — build-time variables (often prefixed `NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`) get inlined into the compiled bundle and can never change without a rebuild; runtime variables are read fresh each time the server process starts, letting the same artifact be reconfigured per environment
- **System-level vs. app-level** — some variables (`PATH`, `HOME`, `NODE_ENV`) are set by the OS/shell itself and consumed by many programs; app-level variables are specific to one application's config

## Comparison

| Mechanism | Secrecy | Change without redeploy | Auditable access |
|---|---|---|---|
| Hardcoded in source | None | No | No |
| Env var / `.env` | Low–moderate | Yes (restart process) | No |
| Config file (checked in) | None | No | No |
| Secret manager (Vault, AWS Secrets Manager) | High | Yes | Yes |

## Best Practices
- Never commit `.env` — commit a `.env.example` listing required keys with placeholder/dummy values instead
- Validate required env vars at process startup (`zod`, `envalid`, `joi`) and crash immediately with a clear error if one is missing, rather than failing mysteriously three requests later
- Explicitly prefix any variable that's meant to be exposed to client-side code (`NEXT_PUBLIC_`, `VITE_`) so it's obvious at a glance which values are public
- Use different secret values per environment — never reuse a production database password or API key in staging/dev
- Add `.env` to `.gitignore` before the first commit of a project, not after
- For anything genuinely sensitive (payment provider keys, signing keys), prefer a secret manager over a plain env var where the platform supports it
- Document every required variable in one place (a `.env.example`, a README config table, or a schema file) so a new environment can be stood up without archaeology through the codebase
- Rotate long-lived secrets periodically and after any suspected leak — an env var by itself has no expiration, so rotation has to be a deliberate process, not an automatic one

## FAQ
**Are environment variables secure enough for API keys?**
Reasonably, for server-side secrets not exposed to the client — they keep secrets out of source control and off developer screens during code review. They're not encrypted at rest by default on most platforms, so highly sensitive credentials often warrant a dedicated secret manager instead.

**Why does changing an env var not affect my running app?**
Most runtimes read `process.env` once into config objects at startup; you generally need to restart the process for a changed variable to take effect, unless the app explicitly polls or is signaled to reload config.

**Why is my "secret" env var visible in the browser?**
It was almost certainly a build-time variable (e.g., `NEXT_PUBLIC_*`) that got compiled into the client bundle — anything with that prefix convention is, by design, public.

**Can I store an array or JSON object in an environment variable?**
Only as a string — env vars are always plain text under the hood, so structured data has to be serialized (`JSON.stringify`) on the way in and parsed (`JSON.parse`) on the way out. It works but is fragile at scale; a real config file or secret manager is usually a better fit once values get structured or numerous.

## History
- Environment variables trace back to Unix's earliest days (1970s) as a simple mechanism for a shell to pass context — `PATH`, `HOME`, `USER` — to any program it launched, long before "application configuration" was a distinct concern
- The 12-factor app methodology (published by Heroku engineers in 2011) formalized "store config in the environment" as a named best practice, directly shaping how modern frameworks (Rails, Django, Express, Next.js) expect configuration to be structured
- The `.env` file convention was popularized by Ruby's `dotenv` gem (2012) and later ported to virtually every language's ecosystem, standardizing a de facto format even though no OS or language spec actually defines it
- As container orchestration matured, env vars became the default way to configure a container from the outside (`docker run -e`, Kubernetes `env:`/`envFrom:`), extending a decades-old Unix mechanism into cloud-native infrastructure

## Real-World Example
A Kubernetes Deployment typically separates non-sensitive config (a ConfigMap) from sensitive values (a Secret), both surfaced to the container as ordinary environment variables so the application code doesn't need to know or care where each value came from:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  API_TIMEOUT_MS: "5000"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DATABASE_URL: postgres://user:pass@db:5432/app
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:1.4.0
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: app-secrets
```
The application inside the container reads `process.env.DATABASE_URL` exactly the same way whether it's running on a laptop with a `.env` file or in a cluster with a mounted Secret — the injection mechanism changes, the consuming code doesn't.

## Related Terms
- [[CI-CD|CI/CD]]
- [[Docker|Docker / Containerization]]
- [[Feature Flags]]
- [[Serverless]]

## Example
`DATABASE_URL` pointing to a local Postgres in dev, and a production Postgres instance when deployed.

## Code Example
```bash
# .env (never committed)
DATABASE_URL=postgres://user:pass@localhost:5432/myapp_dev
API_KEY=sk_test_abc123
LOG_LEVEL=debug
```

```typescript
// env.ts — fail fast on missing/invalid config
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const env = envSchema.parse(process.env);
// Throws at startup with a clear message if DATABASE_URL is missing or malformed,
// instead of the app crashing later with a confusing "undefined is not a valid URL"
```
