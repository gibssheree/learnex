---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git pull

**Definition:** Fetches commits from a remote and immediately integrates them into your current branch, by default via a merge, or a rebase if configured.

## Syntax
```
git pull [<remote>] [<branch>]
git pull --rebase [<remote>] [<branch>]
git pull --ff-only [<remote>] [<branch>]
```

## Common Options
- `--rebase` — replay local unpushed commits on top of the fetched ones instead of creating a merge commit
- `--ff-only` — only allow a fast-forward pull, fail loudly instead of creating a merge commit
- `--no-commit` — fetch and merge but stop before creating the merge commit, so you can inspect it first
- `--prune` — remove local remote-tracking branches that were deleted on the remote, as part of the fetch
- `-v` / `--verbose` — show more detail about what's being fetched and merged

## Basic Example
```
git pull origin main
```
Fetches `origin/main` and merges it into your current branch, creating a merge commit if your branch has diverged.

## Extended Example
```
git config --global pull.rebase true
git pull origin main
# if it stops on a conflict:
# fix the file, then
git add <file>
git rebase --continue
```
Configuring `pull.rebase` once makes every future `git pull` replay your local commits on top of the remote instead of merging, keeping history linear; if a conflict interrupts the rebase mid-pull, it's resolved with the normal rebase conflict loop, not a merge conflict.

## Under the Hood
`git pull` is not a primitive Git operation — it is a scripted combination of two commands run back to back:

1. `git fetch <remote>` — downloads new objects and updates the remote-tracking ref (e.g. `refs/remotes/origin/main`) to point at the remote's current tip. Your local `main` is untouched at this stage. The fetched tip is also recorded in `.git/FETCH_HEAD` regardless of branch.
2. `git merge FETCH_HEAD` (or `git rebase FETCH_HEAD` with `--rebase`) — integrates that remote-tracking ref into whatever branch you currently have checked out.

Because step 2 operates on whatever's checked out locally, `git pull` on the wrong branch merges/rebases the fetched commits into a branch you didn't intend. The remote-tracking ref itself (`origin/main`) always updates safely regardless — it's a simple fast-forward of Git's local bookkeeping — the risk is entirely in the integration step against your actual working branch.

`pull.rebase` (and its sibling `pull.ff`) are read from config in this order of precedence: `branch.<name>.rebase`, then `pull.rebase`, then the built-in default (merge). Setting it with `--global` changes the default for every repo on the machine that doesn't override it per-branch.

Because the fetch and integrate steps are logically separate, they can also be run manually and independently for more control — `git fetch origin` followed by `git log HEAD..origin/main` to preview incoming commits, then `git merge origin/main` or `git rebase origin/main` once you've decided how to proceed. `git pull` exists purely to collapse that into one step for the common case where you already know which strategy you want.

## Flags Reference

| Flag | Effect |
|---|---|
| `--rebase[=false\|true\|merges\|interactive]` | Integrate via rebase instead of merge; `merges` preserves local merge commits, `interactive` opens the rebase todo list |
| `--ff-only` | Abort instead of creating a merge commit if the branch has diverged |
| `--no-ff` | Always create a merge commit even when a fast-forward is possible |
| `--no-commit` | Merge but leave the result staged, uncommitted, for inspection |
| `--prune` | Delete local remote-tracking refs for branches removed on the remote |
| `--autostash` | Stash uncommitted local changes before pulling, then reapply them after — mainly useful with `--rebase` |
| `--no-tags` | Don't auto-follow tags during the fetch portion |
| `-v`, `--verbose` | Show extra detail about what was fetched and merged |

## Comparison

| | `git pull` | `git fetch` + `git merge`/`git rebase` |
|---|---|---|
| Steps | 1 command | 2 explicit commands |
| Visibility into incoming changes before integrating | None by default | Full — inspect with `git log main..origin/main` or `git diff` before deciding |
| Risk of surprise merge commits | Higher — happens automatically | Lower — you choose merge vs rebase deliberately each time |
| Good for | Fast, routine syncs on a branch you trust | Reviewing upstream changes first, or when history strategy matters |

Many experienced users prefer `fetch` followed by an explicit `merge`/`rebase`/`reset` precisely because `pull` hides that decision point — it picks a strategy for you before you've seen what's incoming.

This distinction matters most in high-stakes situations: reviewing a large incoming set of upstream changes before integrating, or on `main`/`release` branches where an unexpected merge commit or rebase could complicate a release process. On a routine feature branch synced daily, the convenience of `git pull` usually outweighs the loss of that inspection step.

## Common Workflow
Keeping a feature branch current with a fast-moving `main`, without merge-commit clutter:
```
git checkout feature/checkout-flow
git pull --rebase origin main
# resolve any conflicts the normal rebase way, then:
git push --force-with-lease origin feature/checkout-flow
```
Note that `pull --rebase origin main` here rebases the checked-out branch onto `origin/main` directly — it doesn't touch your local `main`. Because it rewrites the feature branch's commits, the follow-up push needs `--force-with-lease` (see [[git push]]) instead of a plain push.

This pattern is common enough on active feature branches that some engineers alias it: `git config alias.sync '!git pull --rebase && git push --force-with-lease'` collapses the whole cycle into `git sync`, though relying on an alias like this is worth doing only once the underlying steps are well understood, since it hides the force-push step behind a friendly name.

## Gotchas Deep-Dive
- **Divergent branches without a configured default.** Since Git 2.27, running plain `git pull` on a diverged branch with no `pull.rebase`/`pull.ff` setting and no `--rebase`/--no-rebase` flag prints an explicit warning and refuses to guess, because merge-vs-rebase is a real behavioral choice, not a safe default. Setting `pull.rebase` (or passing `--no-rebase` for the old merge behavior explicitly) silences it permanently.
- **`--autostash` only helps with `--rebase`.** Plain merge-based pulls have always tolerated some uncommitted changes as long as they don't overlap with incoming changes; rebase-based pulls are stricter, since the sequencer replays commits one at a time and any dirty working tree state can collide with an early step. `--autostash` (or `rebase.autoStash = true`) papers over this by stashing before and popping after automatically.
- **A merge conflict during `pull` looks different depending on strategy.** With the default merge, resolving means editing the file, `git add`, then `git commit` to finalize the merge commit. With `--rebase`, resolving means editing the file, `git add`, then `git rebase --continue` — using the merge-style resolution (`git commit`) on a rebase-in-progress pull is a common mix-up that leaves the rebase stuck.
- **Shallow clones and `git pull`.** A repo cloned with `--depth`  has an incomplete history; pulling can require `--unshallow` or produce confusing "unrelated histories" errors if the fetch needs commits older than what the shallow clone retained.

## History
Prior to Git 2.27 (2020), `git pull` with no `pull.rebase` configured and a diverged branch silently defaulted to a merge with no warning at all. The 2.27 change to warn explicitly was a response to how often the merge-vs-rebase choice caught users off guard — particularly newcomers who didn't realize a merge commit had even been created until they saw it later in `git log`. The underlying fetch+integrate mechanism itself hasn't changed; what changed is Git being more insistent that the choice be made deliberately rather than defaulted silently.

## FAQ
**What's the difference between `git pull` and `git pull --rebase` in terms of final file content?** None, assuming no conflicts — both produce the same final working tree state. The difference is entirely in the resulting commit graph: one adds a merge commit, the other rewrites your local commits on top of the fetched ones.

**Does `git pull` fetch tags too?** Yes, by default it follows the same tag-fetching behavior as `git fetch` — new tags pointing at fetched commits are downloaded automatically unless `--no-tags` is passed or `tagOpt` is configured otherwise.

**Can `git pull` be run without an argument?** Yes, if the current branch has an upstream configured (via `-u` on a prior push, or `git branch --set-upstream-to`) — `git pull` alone then fetches and integrates from that tracked remote/branch.

**Why did `git pull` create a merge commit I didn't expect?** The branch had diverged from its upstream (you had local commits, and the remote had new commits too), and the merge strategy was in effect — either the global default or an explicit `pull.rebase = false`. Checking `git log --graph --oneline` after the fact shows exactly where the branches diverged and merged back.

**Does `git pull` ever need network access if there's nothing new?** Yes — it always contacts the remote to check for updates (that's the fetch half), even if the result is "Already up to date." There's no way to run the merge/rebase half in isolation without at least attempting the fetch, short of using `git merge`/`git rebase` directly against an existing remote-tracking ref.

**What happens if I `git pull` with no remote configured at all?** Git errors out immediately — "There is no tracking information for the current branch" — since it has no default source to fetch from. The fix is either specifying `git pull <remote> <branch>` explicitly or setting up tracking with `git branch --set-upstream-to=<remote>/<branch>`.

## Real-World Example
A common CI/deploy-adjacent scenario: pulling the latest `main` right before starting new work, cleanly, with no surprises:
```
git checkout main
git status                     # confirm clean working tree first
git pull --ff-only origin main
```
Using `--ff-only` here is deliberate — on `main`, there should never be local commits to reconcile, so any divergence means something unexpected happened (a local commit made directly on `main` by mistake, or `main` was rewritten upstream). Failing loudly instead of silently merging or rebasing surfaces that immediately rather than papering over it with an unwanted merge commit.

## Common Pitfalls
- `git pull` is really `fetch` + `merge` (or `+ rebase`) under the hood — running it with uncommitted local changes can trigger "Your local changes would be overwritten by merge," forcing a [[git stash]] first
- Pulling with `--rebase` on a branch you've already pushed and others have pulled — it rewrites the commits being replayed, which then conflicts with collaborators' copies just like any other rebase of shared history
- Relying on the default merge behavior on a busy branch produces a noisy "Merge branch 'main' into feature" commit on every sync; many teams set `pull.rebase = true` globally to avoid it
- Running a bare `git pull` while on the wrong branch — it's easy to forget which branch is checked out and accidentally merge remote changes into a feature branch instead of `main`
- Assuming `--ff-only` failing means something is broken — it's working as designed, telling you the branches have diverged and a merge or rebase decision is required rather than silently picking one
- Mixing merge-conflict resolution steps into a rebase-based pull — after a `pull --rebase` conflict, running `git commit` instead of `git rebase --continue` creates a stray commit inside the rebase sequence rather than resuming it correctly
- Assuming a successful `git pull` means the working tree has no other outstanding issues — it only reports on the fetch-and-integrate step; a clean pull can still leave you with unrelated uncommitted changes or an out-of-date lockfile that needs a dependency install

## FAQ
**Does `git pull` ever lose local commits?** No — a merge or rebase either integrates cleanly, stops on a conflict for you to resolve, or (with `--ff-only`) refuses outright. It never silently discards committed work. Uncommitted changes are a different story: they can block the pull or, in rare cases with `--rebase`, need `--autostash` to survive.

**Why does my team recommend `pull --rebase` over plain `pull`?** It avoids the "merge bubble" commits that accumulate from routinely syncing a branch with a moving target, keeping `git log --oneline` linear and easier to read.

## Comparison: pull.rebase Settings

| Setting | Behavior |
|---|---|
| `pull.rebase` unset (default) | Merge — creates a merge commit on divergence |
| `pull.rebase = true` | Rebase local commits onto the fetched branch |
| `pull.rebase = merges` | Rebase, but preserve local merge commits within the range instead of flattening them |
| `pull.rebase = interactive` | Rebase using the interactive todo-list editor every time |
| `branch.<name>.rebase` | Per-branch override, takes precedence over the global `pull.rebase` |

Teams that standardize on rebase-based pulls generally set `pull.rebase = true` globally via `git config --global pull.rebase true` once, rather than remembering `--rebase` on every invocation — consistency here matters because mixed merge/rebase pulls on the same branch by different teammates can produce genuinely confusing, tangled history.

## Related Commands
- [[git fetch]]
- [[git merge]]
- [[git rebase]]
- [[git push]]
- [[git stash]]
