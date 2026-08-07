---
tags: [term, git, advanced, recovery]
category: Advanced & Internals
---

# git reflog

**Definition:** Shows a chronological log of everywhere `HEAD` and branch tips have pointed locally, including commits no longer reachable from any branch — Git's built-in safety net for undoing almost any local mistake.

## Syntax
```
git reflog
git reflog show <branch>
git reflog expire --expire=<time>
```

## Common Options
- `show <branch>` — see the reflog for a specific branch's ref, not just `HEAD`
- `--relative-date` — show human-readable relative timestamps ("2 hours ago") instead of just entry numbers
- `expire --expire=now --all` — manually force-expire entries immediately (rarely needed, mostly used just before `git gc`)
- `HEAD@{n}` — reference syntax for "where HEAD was n moves ago," usable anywhere a commit is expected

## Basic Example
```
git reflog
```
Lists recent HEAD movements with short hashes and the action that caused each one (`commit`, `checkout`, `rebase`, `reset`, etc.), letting you find a commit you thought you lost.

## Extended Example
```
git reset --hard HEAD~5   # oops, meant HEAD~1
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~5
# e4f5g6h HEAD@{1}: commit: Fix payment bug
git reset --hard HEAD@{1}
```
After an accidental hard reset wipes commits off the branch tip, `git reflog` shows `HEAD@{1}` as the position right before the mistake; resetting to that reflog entry restores the branch exactly, as if the bad reset never happened.

## Under the Hood
The reflog is not part of the commit graph and is never transmitted by `push`/`fetch`/`clone` — it's purely local bookkeeping stored as plain text files under `.git/logs/`. `.git/logs/HEAD` records every position `HEAD` has occupied; `.git/logs/refs/heads/<branch>` records the same for each branch tip independently. Each line is an append-only entry: old hash, new hash, committer identity, timestamp, and a free-text message describing the action (`commit`, `commit (amend)`, `checkout: moving from x to y`, `rebase (finish)`, `reset: moving to HEAD~5`, `pull:`, etc.).

Because it's just a log of ref movements, `HEAD@{n}` means "the value HEAD had n movements ago" — every checkout, commit, merge, rebase step, and reset counts as one movement, so `HEAD@{2}` is rarely "2 commits ago." There's a separate, less commonly used syntax `HEAD@{2.hours.ago}` for time-based lookups, e.g. `git reflog HEAD@{yesterday}`.

This distinction — movement count versus commit count — trips people up constantly, and it's worth internalizing with a concrete case: switching branches back and forth five times without committing anything produces five new `HEAD` reflog entries and zero new commits. `HEAD@{5}` in that scenario is "five checkouts ago," which might land on the exact same commit you started at.

Each reflog file is append-only during normal operation — Git never edits a past line, it only adds new ones as the ref moves, which is what makes reading the raw file directly (`cat .git/logs/HEAD`, purely for inspection, never for editing) a legitimate way to understand exactly what `git reflog` is summarizing. The porcelain command layers formatting, relative dates, and `HEAD@{n}` resolution on top of what is otherwise a flat, chronological text log.

Critically, the reflog is what keeps "orphaned" commits alive long enough to matter. When a rebase, reset, or amend rewrites history, the old commits become unreachable from any branch or tag — but they're still full objects sitting in `.git/objects`, and the reflog entry pointing at their old hash keeps them from being immediately garbage-collected. Git's automatic and manual `git gc` respects two expiry windows before pruning: reachable-from-reflog entries expire after 90 days by default (`gc.reflogExpire`), unreachable ones after 30 days (`gc.reflogExpireUnreachable`). Once an entry expires and `gc` actually runs, the underlying objects become eligible for deletion — at that point the reflog can no longer help even though, until `gc` runs, the objects may technically still be sitting in the object store.

## Flags Reference

| Flag / Form | Effect |
|---|---|
| `git reflog` / `git reflog show HEAD` | List HEAD's movement history (default form) |
| `git reflog show <ref>` | List a specific branch/ref's movement history |
| `git reflog expire --expire=<time> [--all]` | Manually drop entries older than `<time>` |
| `git reflog delete <ref>@{n}` | Remove one specific reflog entry |
| `git reflog exists <ref>` | Check whether a ref has a reflog at all |
| `--all` | Apply the operation to every ref's reflog, not just one |
| `--updateref` | Used with `expire`/`delete` to also update the ref itself if the deleted entry was its current tip |
| `-g`, `--walk-reflogs` (on `git log`) | Walk reflog entries instead of the commit graph — enables `git log -g` style inspection with full commit formatting options |
| `--stale-fix` | Recompute reflog entries whose referenced commit is unreachable in an unexpected way, fixing corruption from certain edge cases |

## Common Workflow
Recovering a branch that was deleted outright — a case where the branch name itself is gone, not just moved:
```
git branch -D feature/old-experiment    # oops, still needed it
git reflog                              # find where its tip was: e.g. "checkout: moving from feature/old-experiment to main"
git checkout -b feature/old-experiment a1b2c3d
```
Because `HEAD` was pointed at that branch's tip at some point before the delete, the commit is still findable in `HEAD`'s reflog even though the branch ref itself is gone — deleting a branch doesn't touch the commits it pointed to, only the name.

## What Reflog Cannot Recover
It's worth being explicit about the boundary, since it's a common source of false hope during an incident:
- **Uncommitted working tree changes.** Reflog only tracks committed states via ref movements. If `git reset --hard` or `git checkout` discards changes that were never committed (not even to a stash), reflog has nothing to recover — those changes were never captured as an object in the first place.
- **`git clean` deletions.** Removing untracked files with `git clean -fd` is unrelated to any ref, so it leaves no reflog trail whatsoever. This combination — `git reset --hard` followed by `git clean` — is one of the few genuinely unrecoverable local mistakes in Git, precisely because neither operation is undoable through the reflog.
- **Anything from before the repository was cloned.** A fresh clone's reflog starts empty; it has no knowledge of ref movements that happened in the source repository before or during the clone.
- **Objects already pruned by `git gc`.** If garbage collection has already run past an entry's expiry, the underlying commit/blob/tree objects can be physically deleted from `.git/objects`, at which point even a reflog entry still technically present in the log file points at nothing recoverable.

## Comparison

| | `git reflog` | `git log` |
|---|---|---|
| Scope | Local ref movements only (this clone/checkout) | Commit ancestry graph |
| Shared via push/fetch | Never | Yes, part of the object graph |
| Shows unreachable/orphaned commits | Yes | No — only what's reachable from the given ref |
| Entries represent | Every HEAD/branch-tip movement (checkout, reset, rebase step, commit...) | Actual commits, in ancestry order |
| Lifespan | Expires (default 90/30 days) | Permanent as long as the commit is reachable |
| Typical command | `git reflog`, `git log -g` | `git log`, `git log --oneline --graph` |
| Primary use case | "What did I do, and how do I undo it" | "What changed, and by whom" |

## Gotchas Deep-Dive
- **A reflog entry number shifts as new entries are added.** `HEAD@{1}` right now might be `HEAD@{2}` after your next single action. Never treat a captured `HEAD@{n}` reference as stable across time — resolve it to an actual commit hash (`git rev-parse HEAD@{1}`) immediately if you need to reference it later.
- **`reflog` and `git log --all` answer different questions.** `git log --all` shows every commit reachable from any *ref* (branches, tags), including ones you haven't touched recently. `git reflog` shows *movements of a single ref* (usually `HEAD`) over time, including states that are no longer reachable from anything. A commit can appear in one and not the other.
- **`git gc --aggressive` and `git prune` respect the same expiry windows** as automatic `gc`, but can be run manually. Running either right after a mistake, before checking reflog, is one of the few ways to genuinely destroy recoverable work — this is why "did you already run `gc`?" is often the first troubleshooting question when reflog seems to have failed.
- **Reflog does not track file-level history.** It only records ref (HEAD/branch) positions, not which files changed in each step. To see what changed between two reflog states, diff them explicitly: `git diff HEAD@{1} HEAD@{0}`.

## Real-World Example
Recovering from an interactive rebase that went wrong — commits accidentally dropped instead of squashed:
```
git rebase -i HEAD~6
# accidentally marked a commit "drop" instead of "squash", rebase completes
git log --oneline -5           # the commit is missing, as expected
git reflog
# f7e6d5c HEAD@{0}: rebase (finish): returning to refs/heads/feature
# a4b3c2d HEAD@{1}: rebase (pick): Add validation helper
# 9c8b7a6 HEAD@{2}: rebase (start): checkout HEAD~6
git reset --hard HEAD@{1}      # state right after the pick, before the rest of the rebase continued
```
The `rebase (start)` / `rebase (pick)` / `rebase (finish)` entries are exactly the kind of granular, step-by-step record that makes reflog invaluable for rebase recovery specifically — every intermediate state during a multi-commit interactive rebase gets its own entry, not just the final result.

## Common Pitfalls
- Assuming reflog is permanent — entries expire eventually (90 days for reachable commits, 30 days for unreachable ones by default), and it's entirely local, never pushed to a remote, so it's a personal safety net, not a backup
- Confusing reflog entries with commit history — `HEAD@{2}` means "2 HEAD movements ago," not "2 commits ago," and includes checkouts, rebases, and resets, not just commits
- Waiting too long after a mistake — a `git gc` run can prune expired unreachable objects, after which reflog can no longer help even if the entry is still technically listed
- Expecting a teammate's reflog to help you — it's per-clone, so `git reflog` on your machine knows nothing about what happened in their working copy, and cloning a repo starts with an empty reflog
- Forgetting each branch has its own reflog separate from `HEAD`'s — `git reflog show some-branch` can surface entries that `git reflog` (which defaults to `HEAD`) won't, especially after switching branches around a lot
- Running `git reflog expire` manually without understanding it's largely irreversible prep for `git gc` — there's rarely a reason to force-expire entries early outside of deliberately shrinking repo size or scrubbing sensitive data before a prune
- Treating a `HEAD@{n}` index as a stable long-term reference — as covered in the Gotchas section, that index shifts with every new entry, so it should be resolved to a real commit hash immediately if it needs to be reused later
- Searching only `git reflog show HEAD` after a mistake made on a specific branch — if the mistake happened while that branch was checked out, `HEAD`'s reflog does capture it, but for changes made through scripts or tools that manipulate a branch ref directly without checking it out, `git reflog show <branch>` may hold entries `HEAD`'s reflog doesn't

## History
The reflog mechanism dates back to very early Git and was one of the features that distinguished it from the systems it competed with at the time — its existence reflects Git's general design philosophy that local history should be forgiving of mistakes, since almost every destructive-looking local operation (reset, rebase, checkout, even branch deletion) is actually just a ref update, and ref updates can be logged and inspected. It has stayed largely unchanged in behavior for most of Git's life; the main evolutions have been performance and default-expiry-window tuning (`gc.reflogExpire`/`gc.reflogExpireUnreachable`) rather than any change to what gets logged or how.

## FAQ
**Can reflog recover a commit after `git gc` has run?** Usually not, if the object was actually pruned — `gc` only removes objects with no reachable reference (including reflog entries) pointing at them, so if an object was pruned it means nothing, including the reflog, was keeping it alive anymore.

**Does `git clone` bring along the original repo's reflog?** No. A fresh clone starts with a fresh, essentially empty reflog — the reflog documents *your* local history of ref movements, not the project's.

**Is reflog a substitute for backups or `git push`?** No — it's local-only and expires. Anything that matters long-term should be pushed to a remote or otherwise backed up; reflog is strictly a short-term local undo mechanism.

**Can you search reflog for a specific string, like a commit message?** Yes — `git log -g --grep="<pattern>"` searches reflog entries (the `-g`/`--walk-reflogs` flag switches `git log` into reflog mode) rather than the normal commit graph, useful when you remember part of a commit message but not when it happened.

**Does every ref get a reflog, or just branches?** By default, `HEAD` and local branch refs get one. Remote-tracking refs (`refs/remotes/origin/*`) and tags generally don't have reflogs enabled by default, since they're considered mirrors of remote/fixed state rather than something you're actively moving around locally — though `core.logAllRefUpdates` can be configured to log more broadly.

**What's the quickest way to see "what was HEAD an hour ago"?** `git reflog HEAD@{1.hour.ago}` resolves directly to whatever commit HEAD pointed to at that relative time, without needing to manually scan through numbered entries.

**Does `git reflog` show anything for a brand-new repository with one commit?** Yes — even the very first commit generates a reflog entry (`commit (initial): ...`), since that's still a `HEAD` movement from the unborn-branch state to a real commit.

**Is there a GUI-free way to browse reflog history interactively?** `git reflog --relative-date` piped through a pager, or `git log -g --oneline --all`, are the common terminal-only approaches; most Git GUI clients (GitKraken, Sourcetree, VS Code's Git Graph) also surface reflog entries in some form, usually labeled "recent activity" or similar rather than the raw Git term.

**Does stashing show up in the reflog?** Yes and no — `git stash` creates its own separate reflog under `refs/stash` (viewable with `git stash list`, which is really `git reflog show refs/stash` under a friendlier name), distinct from `HEAD`'s reflog, though the checkout/pop actions around a stash do still generate normal `HEAD` movement entries too.

## Related Commands
- [[git reset]]
- [[git bisect]]
- [[git rebase -i (Interactive Rebase)]]
- [[git rebase]]
- [[git branch]]
- [[git gc]]
- [[git stash]]
- [[git log]]
