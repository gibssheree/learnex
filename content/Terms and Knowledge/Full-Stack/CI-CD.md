---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# CI/CD

**Definition:** Continuous Integration (auto-testing every code change) and Continuous Deployment/Delivery (auto-shipping code that passes).

## How It Works
- A pipeline runs on every push: install dependencies, run tests/lint, build, and, for CD, deploy automatically if everything passes
- Each pipeline run executes in a fresh, isolated environment (often a container) so results don't depend on "works on my machine" state
- Pipelines are typically defined as code, a YAML file checked into the repo, versioned and reviewed like any other source file
- Stages run sequentially or in parallel depending on dependencies: linting and unit tests might run in parallel, but the build stage usually waits for both to pass first

## Why It Matters
- Catches bugs before they reach production and removes manual, error-prone deploy steps
- Shrinks the feedback loop: a broken build is caught in minutes on a pull request, not discovered days later in production
- Makes deploys boring and routine instead of a stressful, manual, once-a-week event, which in turn makes teams comfortable shipping smaller, more frequent changes
- Produces an audit trail: every deploy is tied to a specific commit, build log, and test result, useful for both debugging and compliance

## Common Pitfalls
- A slow or flaky pipeline that developers start ignoring or working around, defeating its purpose
- Flaky tests that fail intermittently for reasons unrelated to the code change, teams start re-running failed builds reflexively instead of investigating, which erodes trust in the whole pipeline
- No caching of dependencies between runs, so every build reinstalls the entire `node_modules` tree from scratch, adding minutes to every single run
- Secrets checked into the pipeline config file instead of the CI provider's encrypted secrets store
- Deploying straight to production with no staging environment or rollback plan, a genuinely bad build reaches real users with no safety net
- Treating "CI passed" as equivalent to "safe to deploy" when the test suite doesn't actually cover the changed code path

## Continuous Integration vs Continuous Delivery vs Continuous Deployment

These three terms get used interchangeably but describe increasing levels of automation:

| Term | What Happens |
|---|---|
| Continuous Integration (CI) | Every code change is automatically built and tested, merged frequently into a shared branch |
| Continuous Delivery | Every change that passes CI is automatically packaged into a deployable artifact, ready to release with one click, but a human still triggers the actual production release |
| Continuous Deployment | Every change that passes CI is automatically deployed to production with no human gate at all |

"CI/CD" as a phrase conflates the last two, most real-world teams practice Continuous Delivery (a human still approves the production push) rather than full Continuous Deployment, especially for anything customer-facing or regulated.

## Under the Hood: Pipeline Stages

A typical pipeline for a web app looks like:

1. **Trigger** — a push, pull request, or tag creation kicks off a run
2. **Checkout** — the runner clones the repo at the specific commit
3. **Install** — dependencies are installed, ideally from a lockfile and a cache
4. **Lint/Static analysis** — fast checks (ESLint, type checking) that fail fast before slower steps run
5. **Test** — unit tests, then integration tests, then (sometimes) end-to-end tests, roughly in order of speed
6. **Build** — compile/bundle the application into deployable artifacts
7. **Publish** — push the built artifact (a Docker image, a static bundle) to a registry or storage
8. **Deploy** — the artifact is rolled out to an environment (staging first, then production)
9. **Verify** — post-deploy smoke tests or health checks confirm the new version is actually working

Each stage should fail fast: if linting fails, there's no reason to spend five minutes running the full test suite.

## Deployment Strategies

How the new version actually replaces the old one in production matters as much as the pipeline that builds it:

- **Rolling deploy**: instances are replaced a few at a time, old and new versions briefly serve traffic simultaneously. Simple, but requires the app to tolerate two versions running concurrently (shared database schema compatibility, in particular)
- **Blue-green deploy**: a full second production environment ("green") is stood up alongside the live one ("blue"), traffic is switched over all at once (usually via [[Load Balancer]] or DNS), and the old environment is kept around briefly for instant rollback
- **Canary deploy**: the new version is rolled out to a small percentage of traffic first (1%, then 10%, then 100%), with metrics monitored at each step, this catches problems that only show up under real production load before they affect everyone
- **Feature-flagged deploy**: the new code ships to 100% of servers but is gated behind a runtime flag, decoupling "deploy" from "release" entirely, see [[Feature Flags]]

## Code Example

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying to production..."
        # e.g. push to a registry, trigger a hosting provider's API
```

`npm ci` (not `npm install`) is deliberate here: it installs exactly what's in the lockfile and fails if `package.json` and the lockfile disagree, which is what you want for reproducible CI builds.

## History

Continuous Integration as a formal practice traces back to Extreme Programming (XP) in the late 1990s, Kent Beck and Martin Fowler advocated integrating code into a shared mainline multiple times a day to avoid painful, big-bang merges. Early tooling (CruiseControl, 2001) automated the "build and test on every commit" part. Jenkins (originally Hudson, 2004) became the dominant self-hosted CI server for over a decade. The 2010s shifted the industry toward hosted, config-as-code CI (Travis CI, CircleCI, GitLab CI), and GitHub Actions (2019) further consolidated CI/CD into the same platform developers already used for code review, removing the need for a separate CI tool entirely for many teams.

## Real-World Example
A team merges a database migration that adds a `NOT NULL` column without a default value. In a mature CI/CD setup, this gets caught two ways before it can hurt anyone: the CI pipeline runs the migration against a fresh ephemeral database as part of integration tests and fails immediately if existing seed data violates the constraint, and even if that passes, a canary deploy stage rolls the change out to 5% of production traffic first, automated health checks and error-rate monitoring catch the spike in 500s from services still writing rows without that column, and the deploy is automatically halted and rolled back before it reaches the remaining 95%.

## Best Practices
- Fail fast: order stages from cheapest/fastest to most expensive, so a bad commit is rejected in seconds, not after a 20-minute build
- Cache dependencies (`node_modules`, Docker layers, package manager caches) between runs to keep pipeline time down
- Run the exact same test suite locally and in CI, a pre-commit hook that mirrors CI checks catches problems before they even reach the pipeline
- Keep pipeline configuration in version control and treat changes to it like any other code change, subject to review
- Separate "build once, deploy many": build a single artifact and promote the same one through staging then production, rather than rebuilding from source at each stage, this guarantees what you tested is exactly what you ship
- Always have a fast, tested rollback path, deploys will fail eventually no matter how good the pipeline is

## Related Terms
- [[Environment Variables]]
- [[Docker|Docker / Containerization]]
- [[Feature Flags]]
- [[Semantic Versioning]]
- [[Load Balancer]]

## Example
GitHub Actions running your test suite on every pull request, then auto-deploying to production when merged to main. A developer opens a PR, the pipeline runs lint, unit tests, and a build in about ninety seconds, a green checkmark appears next to the PR, a reviewer approves, and merging to `main` triggers a second pipeline that builds a Docker image, pushes it to a registry, and rolls it out to production via a rolling deploy, no human touches a server directly at any point.

## FAQ

**What's the difference between a CI runner and a build agent?**
Mostly terminology, both describe the machine (often an ephemeral container or VM) that actually executes the pipeline steps. "Runner" is GitHub Actions/GitLab CI terminology; "agent" is more common in Jenkins.

**Should tests run against a real database or a mocked one in CI?**
Depends on the test tier. Unit tests should mock external dependencies for speed and isolation. Integration tests should run against a real (but ephemeral, spun up fresh per run) database instance, mocking the database at that layer tends to hide real bugs like incorrect SQL or migration issues.

**Why do teams still deploy manually sometimes even with CI/CD set up?**
Regulatory or change-control requirements (a human must approve production changes), high-risk changes like schema migrations, or simply not yet trusting the automated pipeline enough, Continuous Delivery with a manual approval gate is a common, deliberate middle ground rather than a limitation.

**What's a "quality gate" in a pipeline?**
A threshold that must be met for the pipeline to proceed, minimum test coverage percentage, zero critical vulnerabilities from a dependency scan, or a passing score from a static analysis tool like SonarQube. Gates turn "we should really check for X" into an enforced, automated rule rather than a policy nobody follows consistently.

**How does CI/CD interact with monorepos?**
Naively, a monorepo pipeline rebuilds and retests everything on every change, which gets slow fast. Mature setups use dependency-graph-aware tooling (Nx, Turborepo, Bazel) to detect which packages were actually affected by a given change and only run the pipeline stages relevant to those, dramatically cutting build times as the repo grows.

**What does "shift left" mean in this context?**
Moving quality checks earlier in the pipeline, closer to the developer's own machine, rather than catching them late. A pre-commit hook running the linter is more "shift left" than the same lint check only running in CI after a push; security scanning a dependency before merge is more shift left than scanning it after it's already deployed to production.

**How long should a CI pipeline take?**
There's no universal number, but as a rule of thumb, teams start losing focus and context-switching away once a pipeline regularly exceeds ten minutes, which is a strong argument for parallelizing stages and caching aggressively rather than letting pipeline time creep upward unchecked.
