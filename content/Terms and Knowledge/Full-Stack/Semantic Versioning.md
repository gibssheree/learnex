---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Semantic Versioning

**Definition:** A version numbering convention, `MAJOR.MINOR.PATCH` (e.g. `2.4.1`), where each part signals a specific kind of change.

## How It Works
- `MAJOR` = breaking change
- `MINOR` = new backward-compatible feature
- `PATCH` = backward-compatible bug fix
- The full spec (semver.org, currently v2.0.0) also defines optional pre-release and build metadata suffixes: `1.0.0-alpha.1` (pre-release, sorts before `1.0.0`) and `1.0.0+20260807` (build metadata, ignored for precedence comparisons)
- Version `0.y.z` is explicitly special-cased in the spec as "initial development" — anything can change at any time, and the public API should not be considered stable, which is why so many actively developed libraries sit at `0.x` for a long time before committing to `1.0.0`
- The spec is deliberately narrow in scope: it only defines the *numbering* convention and precedence rules, not how changelogs should be written, how deprecations should be communicated, or how automation should compute the next number — those are conventions the ecosystem layered on top (Conventional Commits, Keep a Changelog)
- Precedence for comparison follows a strict algorithm: compare `MAJOR`, then `MINOR`, then `PATCH` numerically; if those are equal, a version with a pre-release tag has lower precedence than one without (`1.0.0-alpha` < `1.0.0`); pre-release identifiers themselves compare left-to-right, numeric identifiers compared numerically, alphanumeric compared lexically (ASCII sort order)
- Pre-release identifiers themselves have their own conventional ordering that tooling and teams tend to follow even though the spec doesn't mandate specific names: `alpha` < `beta` < `rc` (release candidate), reflecting increasing confidence as a release approaches stability
- Package managers implement range operators on top of semver to express "compatible with": npm's caret `^1.2.3` allows `>=1.2.3 <2.0.0`, tilde `~1.2.3` allows `>=1.2.3 <1.3.0`; these ranges are what actually gets consulted during `npm install` to decide which version satisfies a dependency
- Build metadata (`+build.123`) is explicitly excluded from precedence comparisons in the spec — two versions differing only in build metadata are considered equal for ordering purposes, even though the strings aren't identical
- Numeric identifiers in a version core must not have leading zeros (`1.02.0` is invalid semver), and each of `MAJOR`, `MINOR`, `PATCH` must be a non-negative integer — this strictness is what makes automated parsing and comparison reliable across tools written in different languages

## Why It Matters
- Lets you and your dependencies, like npm packages, upgrade safely, knowing what kind of change to expect
- Enables automated dependency updates (Dependabot, Renovate) to make a judgment call about risk — a patch bump is usually safe to auto-merge, a major bump usually needs a human to read the changelog
- Forms the contract that package manager lockfiles and range operators (`^`, `~`) are built on top of — the entire npm/Cargo/pip dependency resolution algorithm assumes packages actually follow semver honestly
- Gives downstream consumers a way to reason about risk before upgrading without reading every line of a diff — the version number itself is documentation
- Reduces coordination overhead across teams and companies — a platform team can publish a shared internal library and downstream teams can upgrade patch/minor releases without a meeting, reserving actual review time for major version migrations
- Feeds directly into security tooling: vulnerability databases (npm audit, GitHub Dependabot alerts) reference affected version *ranges*, and semver is what makes "upgrade to >=4.17.21" a precise, actionable instruction rather than a vague suggestion
- Underpins CI/CD release automation: tools like `semantic-release` parse commit messages (Conventional Commits) to compute the next version number and publish automatically, removing manual version bumping entirely from the release process

## Common Pitfalls
- Bumping only a patch version for a change that actually breaks existing usage, silently breaking everyone who depends on you
- Treating a change to a *transitive* dependency's behavior as invisible to your own semver — if you bump a dependency that changes your output shape, that's a breaking change for your consumers even though your own code didn't change
- Removing a deprecated function, changing a default parameter value, or altering error message formats that consumers programmatically match against — these often get shipped as minor or patch bumps because they don't "feel" breaking to the author, but they break real consumers
- Assuming semver ranges (`^1.2.3`) fully protect you — they only protect you if the maintainer actually follows semver correctly; a buggy patch release can still break your build even though npm considered it "safe"
- Confusing semver with calendar versioning (CalVer) or build numbers — a version like `2024.03.1` communicates a release date, not compatibility, and mixing the two conventions in one ecosystem confuses consumers about what a version bump actually promises
- Manually editing `package.json`'s version field instead of using `npm version patch/minor/major`, which also creates the matching git tag — manual edits drift out of sync with tags and make it hard to reconstruct release history later
- Skipping straight from `1.x` to `3.0.0` "to signal a big change" — semver has no concept of skipped majors meaning anything; each major increment should represent exactly one breaking release relative to the previous
- Forgetting that adding a required field to a JSON request/response schema is breaking for consumers even though it "just" adds something — new required inputs and new required outputs both count as breaking changes, unlike new optional ones
- Publishing a pre-release tag (`2.0.0-beta.1`) without clearly communicating that npm's default install will skip it — `npm install pkg` ignores pre-release versions unless a consumer explicitly opts in with `pkg@beta` or a matching range, which surprises maintainers expecting wide beta testing

## Deeper Dive: What Counts as "Breaking"
- Removing or renaming a public function, class, export, or config option
- Changing a function's required parameters, return type, or thrown error types
- Changing default behavior in a way existing callers didn't opt into (e.g. a library that used to fail silently now throws)
- Dropping support for a previously supported runtime version (e.g. dropping Node 16 support) — this is breaking for consumers still on that runtime even if no code changed
- Changing the shape of emitted data (API response fields, CLI output format, log format) that other tools or scripts parse
- What does *not* count as breaking: adding a new optional parameter, adding a new export, fixing a bug whose old (wrong) behavior nobody could have been relying on in a way documented as supported, performance improvements that don't change output
- Gray areas that reasonable maintainers disagree on: tightening input validation (rejecting previously-accepted-but-nonsensical input), changing TypeScript type definitions in a stricter direction (compiles fine at runtime, breaks `tsc` for consumers), and dropping support for very old browsers or Node versions in a library with no explicit "supported engines" policy

## Variants and Related Schemes
- **Calendar Versioning (CalVer)** — versions encode a date (`2026.08`, `26.08.1`), used by Ubuntu, Black (the Python formatter); communicates recency rather than compatibility
- **Zero-based versioning** — deliberately staying at `0.x.y` indefinitely to retain the freedom to break the API at any time without a "real" major bump; some tools (early Vite, early Deno) did this intentionally
- **Sentimental Versioning** — a tongue-in-cheek reaction acknowledging that many projects bump major versions for marketing reasons ("this feels like a big deal") rather than strict breaking-change discipline; it's less a real standard than an observation of how semver is often actually used in the wild
- **Zero-version pinning debates** — some ecosystem tooling (npm's own treatment of `0.x` caret ranges) exists specifically because so many real packages spend years at `0.x` in practice, forcing package managers to define sane defaults for a state the spec treats as inherently unstable
- **Romantic Versioning (RomVer)** — a loosely related joke/backronym where `MAJOR.MINOR.MICRO` roughly maps to marketing-driven decisions rather than the strict technical breaking-change rule; mentioned mostly to illustrate how much drift exists in practice between the spec and real-world usage
- **Hash-based / content-addressed versioning** — some systems (Nix, some container registries) version by content hash instead of a human-assigned number, sidestepping the "did the author classify this correctly" trust problem entirely at the cost of human readability
- **API versioning in URLs** (`/v1/`, `/v2/`) — a related but distinct practice for HTTP APIs, where the version lives in the route rather than a package manifest, letting a server run multiple major API versions concurrently for clients that haven't migrated yet

## History
- Version numbers predate semver by decades — early software just incremented ad hoc, with no agreed meaning behind `MAJOR.MINOR` boundaries; different projects and even different teams within the same company used wildly inconsistent conventions
- Tom Preston-Werner (GitHub co-founder) published the Semantic Versioning specification in 2009-2011, explicitly to solve "dependency hell" — the problem of pinning dependencies too loosely (breaking on update) or too tightly (missing security patches)
- npm adopted semver as its foundational versioning convention from very early on, which is a large part of why semver became the de facto standard across the JavaScript ecosystem and then spread to other package managers (Cargo, Composer, RubyGems all use semver-compatible schemes)
- Semver 2.0.0 (2013) is the current stable version of the spec itself — clarifying pre-release precedence rules and build metadata handling that were ambiguous in earlier drafts
- The rise of automated release tooling (`semantic-release`, first released around 2015, and Conventional Commits formalized shortly after) turned semver from a manual discipline enforced by careful maintainers into something CI pipelines can compute and enforce mechanically

## Comparison: SemVer vs CalVer

| | SemVer | CalVer |
|---|---|---|
| Format | `MAJOR.MINOR.PATCH` | e.g. `YYYY.MM.PATCH` |
| Communicates | Compatibility risk | Release recency |
| Good for | Libraries, APIs, dependencies | Applications, OS distributions, tools with regular release cadence |
| Ordering meaning | Bigger number = more change | Bigger number = more recent |
| Examples | React, Express, most npm packages | Ubuntu, Black, PyCharm |

## Deeper Dive: Version Ranges Across Ecosystems
Different package managers implement semver-style ranges with subtly different syntax and defaults, which trips people up when working across ecosystems:
- **npm/yarn/pnpm** — `^1.2.3`, `~1.2.3`, `1.2.x`, `>=1.2.3 <2.0.0`; caret is the default when you run `npm install <pkg>`
- **Cargo (Rust)** — bare `1.2.3` in `Cargo.toml` behaves like npm's caret by default (`>=1.2.3, <2.0.0`); explicit `~1.2` and comparison operators are also supported
- **Composer (PHP)** — uses `^` and `~` similarly to npm, but `~1.2.3` in Composer means something closer to npm's caret than npm's tilde, a frequent source of confusion for developers moving between ecosystems
- **pip (Python)** — historically looser about enforcing semver at all; PEP 440 defines its own versioning scheme that's semver-adjacent but not identical, and compatible-release operator `~=1.2.3` maps roughly to npm's tilde
- **Go modules** — takes a stricter stance: a new major version must live at a different import path (`github.com/foo/bar/v2`), making a breaking change impossible to install accidentally via a normal `go get` upgrade
- **Docker image tags** — technically free-form strings, not enforced semver at all, but the convention of tagging images `myapp:1.4.2` alongside `myapp:1.4`, `myapp:1`, and `myapp:latest` mimics semver range behavior manually, letting consumers choose how much auto-update risk they want by picking which tag to pull

## Deeper Dive: Lockfiles and Reproducibility
- A lockfile (`package-lock.json`, `yarn.lock`, `Cargo.lock`, `poetry.lock`) records the exact resolved version of every dependency (direct and transitive) at install time, independent of the semver ranges declared in the manifest
- Without a lockfile, two installs of the same `package.json` at different times can resolve to different actual versions if new releases were published in between — semver ranges describe what's *allowed*, not what's *installed*
- Lockfiles are what make CI builds reproducible: the same lockfile checked into version control guarantees every developer and every CI run gets byte-identical dependency versions, regardless of what's been published since
- Regenerating a lockfile (`npm update`, `cargo update`) is a deliberate action that re-resolves ranges against the latest available versions — this is usually when a "safe" semver range quietly pulls in a buggy patch release and something breaks despite nobody touching the manifest
- CI should always install from the lockfile exactly (`npm ci` rather than `npm install`) — `npm ci` fails fast if the lockfile and manifest disagree, instead of silently re-resolving and potentially testing against different versions than what will actually deploy

## Code Example
```json
// package.json dependency ranges
{
  "dependencies": {
    "express": "^4.18.2",   // >=4.18.2 <5.0.0 — minor/patch updates allowed
    "lodash": "~4.17.21",   // >=4.17.21 <4.18.0 — only patch updates allowed
    "react": "18.2.0"       // exact version only, no auto-updates
  }
}
```

```bash
# Conventional Commits driving automated semver bumps
git commit -m "fix: correct off-by-one in pagination"     # -> patch bump
git commit -m "feat: add CSV export option"                # -> minor bump
git commit -m "feat!: remove deprecated v1 auth endpoint"   # -> major bump
# The "!" or a "BREAKING CHANGE:" footer is what semantic-release
# looks for to decide a commit warrants a major version bump
```

## Best Practices
- Adopt Conventional Commits (`feat:`, `fix:`, `chore:`, `BREAKING CHANGE:`) so version bumps can be computed automatically and consistently instead of guessed at release time
- Write a CHANGELOG alongside every release, not just a version number — the number tells you *that* something changed, the changelog tells you *what*
- Deprecate before removing: ship a deprecation warning in a minor release, keep the old behavior working, and only remove it in the next major — gives consumers a migration window instead of a surprise break
- Pin exact versions in application lockfiles (`package-lock.json`, `Cargo.lock`) even while using ranges in `package.json`/`Cargo.toml` — the range expresses intent, the lockfile expresses what's actually installed and tested
- For libraries, be conservative about what you promise as "public API" — the smaller your documented surface area, the fewer things count as breaking, and the less often you're forced into major bumps
- Batch breaking changes into infrequent, well-announced major releases rather than trickling them out — consumers can plan one migration instead of chasing a moving target across many majors
- Use tooling that diffs your public API surface between releases (TypeScript's `--declaration` output diffing, `api-extractor`, Rust's `cargo public-api`) to catch accidental breaking changes before they ship as a minor or patch
- Document your major version support policy (e.g. "we support the last 2 major versions with security patches") so consumers know how long they have before an upgrade becomes mandatory

## FAQ
- **Does going from `0.9.0` to `1.0.0` require a breaking change?** No — by convention `1.0.0` marks "first stable public API," but the spec doesn't strictly require a breaking change to justify it; it's more a statement of confidence and commitment to stability going forward.
- **What's the difference between `^1.2.3` and `~1.2.3`?** Caret allows any change that doesn't touch the leftmost non-zero digit (so minor and patch updates for `1.x`); tilde allows only patch-level updates, holding the minor version fixed.
- **How does semver handle `0.x` releases in ranges?** npm treats `^0.2.3` as `>=0.2.3 <0.3.0` (not `<1.0.0`) — because the spec says anything can break at `0.x`, the caret is deliberately stricter there, treating the minor version as if it were the major.
- **Can two packages with the same major version still be incompatible?** Yes, if either one doesn't actually follow semver correctly — the guarantee is a social contract enforced by the maintainer's discipline, not by any tooling that verifies API compatibility automatically (though tools like `api-extractor` and `semver-checks` try to catch violations before publish).
- **Should application repos (not libraries) use semver too?** Opinions differ — many teams use CalVer or a simple incrementing build number for deployed applications since "compatibility" is meaningless when there's only one consumer (the deployed environment itself), reserving strict semver for published, reusable packages.

## Real-World Example
The `left-pad` incident (2016) is the canonical semver-adjacent cautionary tale: a developer unpublished a tiny 11-line npm package that thousands of projects — including Babel and React tooling — transitively depended on, instantly breaking builds across the JavaScript ecosystem. It wasn't strictly a semver violation, but it exposed how much the entire dependency resolution system (built on semver ranges) assumes published versions stay available and stable; npm's response was to disallow unpublishing packages older than 24 hours specifically to prevent a repeat. A cleaner semver example: when Node.js dropped support for older Node versions in a new major release, or when Babel 7 (2018) shipped scoped packages (`@babel/core` instead of `babel-core`) as part of a major version bump specifically because it was an intentionally breaking, opt-in migration rather than something that could sneak in via a minor release.

## Common Interview Questions
- **What's the difference between a minor and a patch release?** A minor release adds functionality in a backward-compatible way (existing code keeps working, new capabilities are available); a patch release only fixes bugs without adding or changing any public-facing behavior.
- **Why does semver treat `0.x` differently from `1.x`+?** Because pre-1.0 software is explicitly allowed to break its API at any time under the spec — there's no stability promise yet, so tooling (like npm's caret range) tightens its interpretation of compatibility accordingly.
- **How would you decide whether a change is a major, minor, or patch bump?** Ask whether any correctly-written consumer code that worked before would now throw, behave differently, or need to change to keep working — if yes, it's major; if it's new capability with no risk to existing callers, minor; if it's a pure bug fix with no interface change, patch.
- **What problem does semver actually solve?** It gives automated tooling (package managers, CI, dependency bots) a machine-readable signal for upgrade risk, replacing the alternative of either pinning every dependency exactly (missing fixes) or always installing latest (risking unexpected breaks).

## Related Terms
- [[CI-CD|CI/CD]]
- [[Database Migration]]
- [[Feature Flags]]

## Example
Going from `1.2.3` to `2.0.0` signals "this release has breaking changes, read the changelog before upgrading." A concrete npm scenario: Express 4.x and Express 5.x can be installed side by side in different projects because `^4.18.2` and `^5.0.0` never overlap in npm's dependency resolution — an app pinned to `^4.x` will never accidentally pull in Express 5 even years after it's released, precisely because the major version boundary is the contract npm's resolver trusts.

This is also why library maintainers dread major version bumps: every `2.0.0` fragments the install base into "still on 1.x" and "migrated to 2.x" users, each needing continued support until the older cohort finishes migrating.

It's a strong incentive to batch breaking changes rather than shipping them piecemeal across several majors in a short window — consumers plan for one migration, not five.
