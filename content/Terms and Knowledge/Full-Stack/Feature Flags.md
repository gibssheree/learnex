---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Feature Flags

**Definition:** A toggle that lets you turn a feature on or off, or for specific users, without deploying new code.

## How It Works
- Code checks a flag's value, from a config service or database, at runtime to decide whether to show or run a feature
- The simplest form is a boolean read from an env var or config file; production systems use a flag-management service (LaunchDarkly, Split, Flagsmith, GrowthBook, or a homegrown table) that a lightweight SDK polls or streams updates from
- Flags are evaluated per-request against a "context" — usually the current user ID, account plan, region, or a random bucketing hash — so the same flag can return `true` for some users and `false` for others simultaneously
- Client SDKs typically cache flag values locally and refresh via polling or a streaming connection (SSE/websocket), so a flag change in the dashboard propagates to running instances within seconds without a redeploy or restart
- Evaluation logic itself ranges from a flat on/off switch to a full rules engine: percentage rollouts, allow-lists/deny-lists, and attribute-based targeting ("enable if `plan == enterprise` and `country == US`") all resolve to one boolean or variant per request

## Why It Matters
- Lets you ship code to production dark, test with a small percentage of users, and instantly roll back a bad feature without a redeploy
- Decouples *deployment* from *release* — code can sit merged and deployed to production, inert behind a flag, until product/marketing decides it's time to turn it on, independent of the engineering release cadence
- Enables trunk-based development: instead of long-lived feature branches that rot and produce painful merges, developers merge incomplete work to `main` behind a flag and iterate safely
- Turns a bad release into a config change instead of an incident — flipping a flag off is seconds; reverting a deploy and waiting for CI/CD to redeploy is minutes, sometimes with its own risk
- Supports targeted rollouts for high-stakes changes (pricing, checkout, auth) where a canary group of real users validates behavior before full exposure
- Makes A/B testing possible without shipping separate builds — the flag's variant assignment doubles as the experiment bucketing

## Common Pitfalls
- Letting old flags pile up forever, turning the codebase into a maze of `if (flag) {...} else {...}` branches nobody dares delete
- Treating a flag check as free — every additional flag multiplies the number of effective code paths that need testing; 5 independent flags means 32 possible combinations of on/off
- Flag drift between environments — a flag is `true` in staging but was never flipped in production, so "it worked in staging" doesn't mean anything
- No expiration/ownership tracking, so nobody remembers *why* a flag exists or whether it's safe to remove six months later
- Evaluating a flag inconsistently within a single user session (e.g., re-evaluating on every request with a source of randomness that isn't sticky to the user), causing a feature to flicker on and off for the same person
- Using feature flags as a long-term permissions/entitlement system instead of a temporary rollout mechanism — this conflates two different problems and usually needs its own dedicated system
- Client-side flags shipped to the browser exposing unreleased feature names or logic to anyone inspecting network requests, effectively leaking roadmap information
- Relying on a flag as a substitute for proper testing — "we'll just turn it off if it breaks" doesn't excuse skipping unit and integration tests for the code the flag guards
- Forgetting that flags multiply monitoring surface area: an incident dashboard that doesn't segment by flag state makes it hard to tell whether a metric regression correlates with a specific rollout

## Under the Hood
- Percentage rollouts need *sticky* bucketing — the same user must consistently land in the same bucket across requests, or the experience flickers. This is typically done by hashing a stable identifier (user ID + flag key) into a number in [0, 100) and comparing against the rollout percentage, rather than using `Math.random()` per request
- Flag evaluation should be fast and fail open in a defined direction: SDKs cache the last-known rule set locally so a flag-service outage doesn't take down the whole app, and each flag has an explicit fallback value used when the service is unreachable
- Server-side evaluation keeps targeting rules and unreleased feature logic off the client entirely; client-side flags need care to avoid shipping information (flag names, targeting criteria) that reveals unreleased plans
- Streaming updates (SSE/websocket) push new flag values to connected SDKs in near-real-time; polling-based SDKs instead re-fetch the full rule set on an interval (e.g., every 30s), trading a small propagation delay for a simpler client implementation

## Variants
- **Release toggles** — short-lived, gate an in-progress feature until it's ready; deleted once fully rolled out
- **Kill switches / ops toggles** — long-lived, let on-call instantly disable a risky or expensive feature (e.g., a third-party integration) under load or during an incident
- **Experiment flags** — power A/B/n tests, assigning users to variants and feeding results to an analytics/experimentation platform
- **Permission/entitlement flags** — gate a feature by plan tier or account type (e.g., "SSO available on Enterprise plan"); these tend to be long-lived by design, unlike release toggles
- **Percentage rollouts** — gradually increase exposure (1% -> 10% -> 50% -> 100%) while watching error rates and business metrics at each step

## Comparison

| Mechanism | Rollback speed | Requires redeploy | Per-user targeting |
|---|---|---|---|
| Feature flag | Seconds | No | Yes |
| Environment variable | Minutes (restart) | Sometimes | No |
| Git revert + redeploy | Minutes–hours | Yes | No |
| Canary deployment (infra-level) | Minutes | Yes | Partial (by instance, not user) |

| Flag Type | Typical Lifespan | Owner |
|---|---|---|
| Release toggle | Days–weeks | Engineering |
| Experiment flag | Weeks (until statistical significance) | Product/Data |
| Kill switch | Indefinite | On-call/SRE |
| Permission/entitlement flag | Indefinite | Product |

## Best Practices
- Give every flag an owner and a removal date at creation time — a release toggle that outlives its rollout is tech debt
- Delete the flag and dead code path as soon as a feature is fully rolled out and stable; don't let "we'll clean it up later" become permanent
- Keep flag evaluation logic in one place (a thin wrapper/service) rather than scattering raw SDK calls through the codebase, so flags are easy to grep for and remove
- Default to a safe fallback value if the flag service is unreachable — decide explicitly whether "fail open" (feature on) or "fail closed" (feature off) is correct per flag
- Log flag evaluations for high-stakes flags so you can correlate an incident with a specific rollout percentage or targeting change
- Avoid nesting flags — a feature gated by two or three independent flags simultaneously is a combinatorial testing nightmare
- Treat flag names as permanent-ish identifiers once referenced in analytics/experiment data — renaming a flag mid-rollout breaks the historical link between exposure data and outcomes

## FAQ
**How is a feature flag different from an environment variable?**
An env var is set once per process at startup and requires a restart to change. A flag is evaluated per-request/per-user, can target specific segments, and updates live without any restart or redeploy.

**Do feature flags replace A/B testing tools?**
They're the delivery mechanism experiments run on top of — the flag controls which variant a user sees, while a separate analytics layer measures the outcome and determines statistical significance.

**Should QA test with flags on or off?**
Both, deliberately — and ideally the flag combinations that will actually exist in production, not just the two extremes of "all on" and "all off."

**What happens if the flag service is down when a request comes in?**
A well-built SDK caches the last successfully fetched rule set locally and keeps serving from it, so a transient outage doesn't take down the app — this is why every flag should have an explicit, sane default baked into the code itself, not just in the remote config.

**Can feature flags be tested automatically in CI?**
Yes — most flag SDKs support a local/offline provider where you set flag values directly in test setup instead of hitting the real service, letting CI exercise both the "flag on" and "flag off" code paths deterministically.

## History
- Feature flags trace back to conditional compilation and `#ifdef` blocks in C, where flags determined what got compiled at all rather than what ran at runtime
- Flickr's engineering team wrote one of the earliest widely-cited accounts (2009) of using runtime flags to deploy code dark and control exposure gradually, influencing how the wider industry talked about the technique
- Trunk-based development and continuous delivery, popularized through the 2010s (notably via Martin Fowler's writing and the DevOps movement), made feature flags close to mandatory — without them, keeping `main` always-deployable while big features are mid-development is much harder
- Dedicated flag-management SaaS products (LaunchDarkly founded 2014, Split 2015) turned what used to be a bespoke database table and a handful of `if` statements into a full product category with targeting rules, experimentation, and audit trails

## Real-World Example
A typical progressive rollout for a risky change (e.g., a new payment provider) moves through stages over days, not one atomic switch:

1. Deploy the code behind `flag: new-payment-provider`, default `false` — feature is dark in production, verified only via internal test accounts targeted by user ID
2. Enable for 1% of traffic, watch error rates and payment success rate for a few hours
3. Ramp to 10%, then 50%, comparing key metrics (checkout completion rate, payment failure rate) between the flagged and unflagged cohorts
4. Roll to 100% once metrics hold steady across a full traffic cycle (including peak hours)
5. Once stable for an agreed period, delete the flag and the old payment provider's now-dead code path

If step 2 or 3 shows a spike in payment failures, the flag flips back to `false` in seconds — no rollback deploy, no incident bridge waiting on CI to finish.

## Related Terms
- [[CI-CD|CI/CD]]
- [[Environment Variables]]
- [[Microservices vs Monolith]]

## Example
Rolling out a new checkout flow to 5% of users first, then ramping up to 100% if no issues appear.

## Code Example
```typescript
// Minimal flag evaluation wrapper — centralizes the check
async function isEnabled(flagKey: string, user: { id: string; plan: string }): Promise<boolean> {
  const flag = await flagClient.getFlag(flagKey, {
    userId: user.id,
    attributes: { plan: user.plan },
  });
  return flag?.value ?? false; // explicit fail-closed default
}

// Usage
if (await isEnabled("new-checkout-flow", currentUser)) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

```json
// Example rule set for a percentage rollout with a targeting override
{
  "key": "new-checkout-flow",
  "defaultValue": false,
  "rules": [
    { "if": { "plan": "enterprise" }, "serve": true },
    { "rolloutPercentage": 5, "serve": true }
  ]
}
```

```typescript
// Simplified sticky bucketing — the same user always lands in the same bucket
// for a given flag, so the experience doesn't flicker between requests
import { createHash } from "crypto";

function isInRollout(flagKey: string, userId: string, percentage: number): boolean {
  const hash = createHash("md5").update(`${flagKey}:${userId}`).digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) % 100; // 0-99
  return bucket < percentage;
}

// Same user + same flag always hashes to the same bucket, so a 5% rollout
// consistently includes or excludes a given user across every request.
isInRollout("new-checkout-flow", "user_123", 5); // deterministic per user
```
