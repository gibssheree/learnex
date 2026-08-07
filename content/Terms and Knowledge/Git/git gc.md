---
tags: [term, git, advanced, maintenance]
category: Advanced & Internals
---

# git gc

**Definition:** Cleans up and optimizes the local repository — compressing loose objects, removing genuinely unreachable data, and speeding up future operations.

## Syntax
```
git gc [options]
```

## Common Options
- `--aggressive` — more thorough optimization, slower to run; re-computes delta compression from scratch instead of reusing existing deltas
- `--prune=<date>` — actually delete unreachable objects older than the given date (default is about 2 weeks, protecting recent reflog-recoverable work)
- `--auto` — only run if Git's internal heuristics decide the repo has accumulated enough loose objects/packs to be worth it; this is what runs silently after routine commands
- `--no-prune` — repack and optimize but never delete anything, even objects past the grace period
- `-q` / `--quiet` — suppress progress output, useful in scripts and hooks

## Basic Example
```
git gc
```
Git runs this automatically sometimes (via `git gc --auto`, triggered after operations like `commit` or `merge` once loose-object counts cross a threshold), but you can trigger it manually on a repo that's grown huge or slow. A plain `git gc` repacks loose objects into packfiles, drops unreachable objects older than the prune grace period, packs refs, and expires stale reflog entries — all with safe defaults.

## Extended Example
```
git gc --aggressive --prune=now
```
A heavier cleanup pass that also immediately removes unreachable objects instead of waiting the default grace period — useful for shrinking a bloated repo, but destroys your [[git reflog]] recovery safety net for anything already unreachable. A more realistic maintenance sequence for a repo that's ballooned after a large history rewrite:
```
git reflog expire --expire=now --expire-unreachable=now --all
git gc --aggressive --prune=now
du -sh .git
```
Expiring the reflog first means `git gc` has nothing holding those old commits reachable, so the prune pass actually reclaims the space. Skipping the `reflog expire` step is the single most common reason `git gc --prune=now` "doesn't shrink the repo" — the reflog itself is still pinning the objects as reachable.

## Under the Hood
Git stores every commit, tree, and blob as a "loose object" — an individually zlib-compressed file under `.git/objects/<first-2-hex>/<remaining-38-hex>`, named by its SHA-1 (or SHA-256) hash. Loose objects are simple but wasteful: no delta compression between similar objects, and a large number of small files is slow for the filesystem to enumerate. `git gc` addresses this in a few discrete steps, roughly in order:
- **Repack** — bundles loose objects into one or more packfiles (`.pack` + `.idx` pairs in `.git/objects/pack/`), using delta compression against similar objects so near-duplicate blobs (e.g. successive versions of the same file) cost only a diff, not a full copy
- **Prune** — deletes loose objects that are both unreachable (no ref, no reflog entry points to them, directly or through history) and older than `--prune`'s grace period (default ~2 weeks)
- **Pack refs** — consolidates the many small files under `.git/refs/heads/*` and `.git/refs/tags/*` into a single `.git/packed-refs` file, which is faster to read when a repo has thousands of branches/tags
- **Expire reflogs** — drops reflog entries older than `gc.reflogExpire` (default 90 days) and `gc.reflogExpireUnreachable` (default 30 days for entries that are also unreachable from any ref)
- **Worktree/rerere pruning** — removes stale administrative files for deleted worktrees and old conflict-resolution cache entries

The reflog exists specifically to protect you from `gc` deleting something you might still want — that's why `--prune=now` combined with a fresh `reflog expire` is the only way to truly force deletion of everything unreachable.

## Flags Reference
| Flag | Effect |
|---|---|
| `--auto` | Only runs if object/pack counts exceed `gc.auto` thresholds; silent no-op otherwise |
| `--aggressive` | Forces full re-delta-compression (ignores `--no-reuse-delta`); much slower, marginal size gains after the first run |
| `--prune=<date>` | Deletes unreachable loose objects older than `<date>`; `now` means immediately |
| `--no-prune` | Never deletes anything, only repacks/optimizes |
| `--force` | Runs even if another `gc` process appears to be active (use with caution) |
| `-q`, `--quiet` | Suppresses progress meter output |
| `--keep-largest-pack` | Leaves the single largest existing pack alone and only consolidates the rest |

## Common Workflow
A repo that's accumulated years of history plus a few accidentally-committed large binaries eventually gets slow to clone and fetch. A typical remediation pass:
```
git count-objects -v          # inspect loose object count and disk usage first
git gc --aggressive
du -sh .git
```
If size is still high after a normal `gc`, the bloat is usually reachable (committed) large files, not garbage — at that point `git gc` genuinely cannot help, because it only removes *unreachable* data. The fix is history surgery with something like `git filter-repo` (external tool) or the BFG Repo-Cleaner, followed by `git reflog expire --all --expire=now` and `git gc --prune=now` to actually reclaim the space those rewritten commits freed up.

A second common scenario is setting up recurring maintenance instead of remembering to run `gc` by hand:
```
git maintenance start
```
This registers background scheduled tasks (via cron on Unix, Scheduled Tasks on Windows) that run lighter, more frequent maintenance — incremental repacking, loose-object cleanup, commit-graph updates — so no single `gc` invocation ever has to do a huge amount of work at once. It's the recommended approach over relying purely on `gc --auto` for actively-developed large repositories.

## Comparison
| Command | What it does |
|---|---|
| `git gc` | Full maintenance pass: repack + prune + pack-refs + reflog expire |
| `git prune` | Just deletes unreachable loose objects; no repacking |
| `git repack` | Just repacks loose objects into packfiles; no pruning |
| `git count-objects -v` | Read-only — reports how much loose/packed data exists, doesn't change anything |
| `git maintenance` | Scheduler for running `gc`'s constituent tasks incrementally and automatically in the background |
| `git repack -adb` | Manual equivalent of much of what `gc --aggressive` does, with finer-grained control over pack options |

`git gc` is effectively an orchestrator that calls the narrower commands (`prune`, `repack`, `pack-refs`) in the right order with sane defaults, which is why it's the one people reach for directly.

## Common Pitfalls
- Running `--prune=now` carelessly, permanently deleting objects that `git reflog` would have otherwise let you recover
- Assuming `git gc` will shrink a repo bloated by large *committed* files — it only cleans up unreachable/loose data, not history that's still referenced by a branch or tag
- Running `--aggressive` routinely as a habit — it's meaningfully slower and rarely produces better results than Git's own automatic incremental repacking; it's meant for occasional, deliberate maintenance
- Killing a `git gc` process mid-run — it's generally safe (Git uses lock files and temp packs), but on very large repos an interrupted aggressive repack can waste significant time that has to be redone
- Forgetting that a fresh clone or CI checkout doesn't need `gc` at all — the pitfall is running it reflexively as part of automation where it adds runtime for no real benefit
- Assuming `gc.auto` being disabled (`gc.auto = 0`) is safe long-term — loose objects then accumulate indefinitely, and eventually filesystem enumeration of `.git/objects` itself becomes the bottleneck rather than repo size
- Running `git gc --prune=now` on a shared/bare repository that other clones actively fetch from, without checking whether any client has an in-flight fetch reading objects that are about to be pruned — extremely rare in practice due to Git's object-read locking, but worth knowing the theoretical race exists on exotic setups
- Confusing `git gc`'s prune step with `git clean` — one deletes unreachable *history* from the object database, the other deletes untracked *working-tree files*; they solve completely different problems and neither substitutes for the other

## Performance Notes
For very large repositories (game assets, monorepos with binary history), plain `git gc` without `--aggressive` is usually the right default — it reuses existing deltas where possible and finishes in a fraction of the time. Reserve `--aggressive` for occasional deep maintenance windows, not routine use. If repo size is dominated by binary blobs that don't delta-compress well against each other (images, videos, compiled artifacts), no amount of `gc` tuning will help much — that's a signal to look at [[git submodule]] extraction or a dedicated large-file store (e.g. Git LFS) instead of repository-level optimization. Measure before and after with `git count-objects -vH` (the `-H` prints human-readable sizes) rather than guessing — on a healthy repo a `gc` pass typically completes in well under a second, so multi-minute runs are themselves a signal something (binary bloat, an enormous reflog, thousands of stale branches) needs addressing beyond routine maintenance.

A quick before/after check looks like:
```
git count-objects -vH
git gc
git count-objects -vH
```
Watch the `size-pack` and `count` fields specifically — a shrinking pack size with a stable or growing `in-pack` count means compression is working as intended, not deleting anything you'd notice.

## Configuration
`git gc`'s behavior is tunable via `git config`, which matters for teams running it in CI or on large monorepos:
- `gc.auto` — loose object count that triggers an automatic `gc --auto` (default `6700`); set to `0` to disable automatic gc entirely
- `gc.autoPackLimit` — number of packfiles before an auto-gc consolidates them (default `50`)
- `gc.pruneExpire` — default grace period for `--prune` (default `2.weeks.ago`)
- `gc.reflogExpire` / `gc.reflogExpireUnreachable` — how long reflog entries survive
- `gc.aggressiveDepth` / `gc.aggressiveWindow` — control how far `--aggressive` searches for delta candidates; higher values mean smaller packs but much slower repacking
- `gc.worktreePruneExpire` — grace period before administrative files for a deleted [[git worktree]] are purged
- `gc.rerereResolved` / `gc.rerereUnresolved` — expiry windows for the reuse-recorded-resolution cache Git keeps for repeated merge conflicts
- `gc.packRefs` — whether `gc` packs loose refs into `packed-refs`; disabling this is rarely useful, mostly relevant for tooling that expects one-file-per-ref

Large hosting platforms (GitHub, GitLab) run their own server-side maintenance separate from a client's local `git gc`, so on hosted repos your local `.git gc` only ever affects your own clone's disk usage, not the remote's. Modern Git also ships `git maintenance`, a newer scheduler-friendly wrapper that runs individual maintenance tasks (`gc`, `commit-graph`, `loose-objects`, `incremental-repack`) on independent schedules via `git maintenance start`, intended to eventually replace ad hoc `gc --auto` calls for repos that opt in.

## Gotchas Deep-Dive
- A `git gc` that runs concurrently with another Git operation (e.g. a long-running `rebase` in another terminal) can be delayed or refused via a lock file (`gc.pid`) — this is intentional, not a bug, and `--force` overrides it at your own risk
- Shallow clones (`git clone --depth`) interact oddly with `gc`; because history is intentionally truncated, pruning behaves differently and `--aggressive` provides little benefit since there's less history to delta against
- On Windows in particular, a large aggressive repack can be I/O-bound and take dramatically longer than on Linux/macOS due to filesystem differences — schedule it deliberately rather than as a routine cron job on a big repo
- `git gc` does not touch untracked or ignored working-tree files at all — that's [[git clean]]'s job, a completely separate concern from object-database housekeeping
- Submodules each have their own independent `.git` directory (or `.git` file pointing at one under the superproject's `.git/modules/`), so running `git gc` at the top level does not recurse into submodules; each needs its own `gc` if it's also bloated
- A repo with an active `git bisect` session, unfinished `rebase -i`, or unresolved merge in progress is still safe to `gc` — none of that state depends on loose objects being left uncompressed, only on refs like `BISECT_START` or files under `.git/rebase-merge/`, which `gc` doesn't touch

## History
Git's object model has stored loose objects and packfiles this way since its earliest versions in 2005, when performance under Linux kernel development's history (Git's original use case) demanded a compressed, delta-based storage format rather than one loose file per revision. `git gc --auto` was added specifically so contributors wouldn't need to think about maintenance at all under normal use — the overwhelming majority of `gc` runs on any given machine are these silent, automatic ones, not manual invocations.

## FAQ
**Does `git gc` ever run without me asking for it?** Yes — most porcelain commands call `git gc --auto` at the end, which checks thresholds (`gc.auto`, default 6700 loose objects) and only does real work if exceeded.

**Can `git gc` delete a commit I care about?** Only if it's genuinely unreachable (no branch, tag, or reflog entry points to it) and past the prune grace period. If you're mid-way through an interactive rebase or have stashes, those are still reachable and safe.

**Why does my repo not shrink after `git gc`?** Almost always because the large data is still reachable from a ref — `git gc` isn't a history rewriter.

**Is it safe to run `git gc` on someone else's clone, e.g. a CI checkout?** Yes, but usually pointless — CI checkouts are typically shallow or ephemeral, and the time spent gc'ing is time not spent building.

**Does `--aggressive` risk data loss more than a plain `git gc`?** No — `--aggressive` only changes *how thoroughly* reachable data is repacked, not what counts as prunable. The risky flag is `--prune=now`, independent of `--aggressive`.

**What's the difference between `git gc` and what GitHub/GitLab do server-side?** Hosting platforms run their own maintenance (repacking, geometric repacking, bitmap indexes) on the server copy for fetch/clone performance across all users. Your local `git gc` only ever optimizes your own working clone's `.git` directory — the two are unrelated and running one doesn't affect the other.

**Should I add `git gc` to a pre-push or CI hook?** Generally no — it adds runtime for a benefit that mostly matters on long-lived local clones, not ephemeral CI checkouts. If anything, schedule it as an occasional manual or cron task on developer machines for genuinely large repos.

**Can I undo a `git gc`?** Not directly — it's not itself destructive to reachable data, so nothing needs undoing for a plain run. If a `--prune=now` pass removed something you needed, the only recovery path is whatever backup or remote copy still holds the commit; once truly unreachable and pruned, it's gone from that local object database.

**Does `git gc` compress the working directory too?** No — it only operates on `.git`, Git's internal object database. Your checked-out files on disk are untouched, regardless of how aggressive the pass is.

## Related Commands
- [[git reflog]]
- [[git config]]
- [[git clone]]
- [[git worktree]]
- [[git clean]]
- [[git submodule]]
