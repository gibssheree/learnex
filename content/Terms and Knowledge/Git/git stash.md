---
tags: [term, git, stashing]
category: Stashing
---

# git stash

**Definition:** Temporarily shelves uncommitted changes so you can switch context, like switching branches, with a clean working directory, then bring them back later.

## Syntax
```
git stash [push | pop | apply | list | show | drop | clear | branch | create | store] [options]
```

## Common Options
- `push -m "<message>"` — stash with a descriptive label (`git stash` alone also works and defaults to `push`)
- `pop` — reapply the most recent stash and remove it from the stash list
- `apply` — reapply the most recent stash but keep it in the list, in case you need it again
- `list` — show all stashed changes, most recent first
- `show -p stash@{0}` — show the actual diff contained in a stash, not just its summary
- `drop stash@{n}` — delete a single stash entry without applying it
- `-u` / `--include-untracked` — also stash new, untracked files, not just modified ones
- `-a` / `--all` — stash untracked *and* ignored files too
- `-p` / `--patch` — interactively choose which hunks to stash, leaving the rest in the working directory
- `--keep-index` — stash everything but leave already-staged changes staged in the working directory
- `branch <new-branch> stash@{n}` — create a branch from the commit the stash was based on and apply it there

## Basic Example
```
git stash
```
Shelves all current changes, giving you a clean working directory.

## Extended Example
```
git stash push -u -m "WIP login form before urgent hotfix"
```
Stashes both tracked and untracked changes with a clear label, so you can safely switch to fix an urgent bug and later find and restore exactly this stash with `git stash list` / `git stash pop`.

A more involved sequence, stashing only part of a messy working tree:
```
git stash push -p -m "half-done validation logic"
git stash list
git stash show -p stash@{0}
git checkout main
git pull
git checkout feature/validation
git stash pop
```
The `-p` flag walks through each hunk and asks whether to include it, so unrelated debug prints or half-finished experiments can stay out of the stash entirely.

## Under the Hood
A stash isn't a special Git object type — it's a set of ordinary commits that `git stash` builds and points a ref at. `git stash push` creates:
- a commit for the index state (parent: current `HEAD`)
- a commit for the working tree state (parent: the index commit, plus `HEAD` — it's a merge commit)
- optionally a third commit for untracked files when `-u`/`-a` is used

That final merge commit is what `refs/stash` points to. You can inspect it directly:
```
git log --oneline -1 refs/stash
git show stash@{0}^2   # the working-tree side of the stash
```
The `stash@{n}` notation isn't a numbered ref like `refs/tags/v1`, it's a **reflog** lookup — `refs/stash` only ever holds the newest stash directly, and older entries live in `.git/logs/refs/stash`, addressed by reflog position. That's why `git stash drop stash@{1}` renumbers everything after it.

## Flags Reference
| Flag | Applies to | Effect |
|---|---|---|
| `-m`, `--message` | `push` | Attach a description instead of the default "WIP on \<branch\>" |
| `-u`, `--include-untracked` | `push` | Include untracked files in the stash |
| `-a`, `--all` | `push` | Include untracked *and* .gitignore'd files |
| `-p`, `--patch` | `push` | Interactively select hunks |
| `--keep-index` | `push` | Leave staged changes in the working tree after stashing |
| `--index` | `pop`, `apply` | Try to restore the original staged/unstaged split, not just flatten everything into unstaged |
| `-q`, `--quiet` | most subcommands | Suppress status output |
| `--pathspec-from-file` | `push` | Read the list of paths to stash from a file instead of the command line |
| `-S`, `--staged` | `push` | Stash only the index content, leaving unstaged working-tree edits alone (Git 2.35+) |
| `create` | (subcommand) | Build a stash commit and print its SHA without touching `refs/stash` or the working tree |
| `store` | (subcommand) | Record a previously-created stash commit SHA into `refs/stash` |

## Common Workflow
Interrupt-driven work is the canonical use case:
```
# mid-feature, urgent bug arrives
git stash push -u -m "WIP: cart discount rounding"
git switch main
git switch -c hotfix/checkout-crash
# ...fix, commit, push, PR merged...
git switch feature/cart-discount
git stash pop
```
If `pop` reports conflicts, resolve them like a merge conflict, then run `git stash drop` manually — a conflicting `pop` deliberately leaves the stash entry in the list rather than silently discarding your only copy of the work.

## Real-World Example
Juggling two unrelated experiments without committing either one:
```
git stash push -m "try: redis cache for session lookup"
git switch -c experiment/postgres-cache
# ...different approach, more edits...
git stash push -m "try: postgres cache for session lookup"
git stash list
```
```
stash@{0}: On experiment/postgres-cache: try: postgres cache for session lookup
stash@{1}: On main: try: redis cache for session lookup
```
Each entry remembers which branch it was created on, visible in the `On <branch>:` prefix — that's metadata only, `apply`/`pop` will happily put a stash onto a different branch than the one it lists, but it's a useful reminder of original intent when scanning `list` weeks later.

## Comparison
| | `git stash` | WIP commit + amend later | `git worktree` |
|---|---|---|---|
| Setup cost | one command | one command | new folder + checkout |
| Shows up in `git log` | no | yes, until squashed/amended | no (separate history view) |
| Survives `git reset --hard` on the branch | yes (separate ref) | no risk, it's already a commit | yes, untouched |
| Good for | short interruptions | work you might forget to finish | long-running parallel contexts |

## Common Pitfalls
- Forgetting you have stashed changes sitting around for weeks — always check `git stash list` before assuming your working directory reflects everything you've done
- Running plain `git stash pop` when you have multiple stashes queued up — it always targets `stash@{0}`, the most recent, not necessarily the one you meant
- Using `apply` and then stashing again later, ending up with duplicate stash entries for the same changes because `apply` never removes the original
- Stashing without `-u` and assuming new files were captured — untracked files are silently skipped by default, so `git status` still shows them as untracked after the stash
- Popping a stash onto a branch whose files have diverged significantly from where the stash was created — Git applies it as a patch, and unrelated changes can produce conflicts that have nothing to do with your original edit
- Assuming `git stash list` orders entries chronologically by creation date alone — it's a reflog, so it's ordered by when each entry was pushed relative to the others, which is usually the same thing but can surprise after manual reflog surgery
- Naming two stashes with the same message and later grabbing the wrong `stash@{n}` from a `list` skim — `show -p` before `pop`/`drop` on anything you're not certain about costs one extra command and avoids losing work

## History
`git stash` originally shipped as a shell script wrapping lower-level plumbing commands, dating back to Git 1.5.3 in 2007. It was later reimplemented as a builtin C command for performance and portability, since the scripted version paid the cost of spawning several subprocesses on every invocation — noticeable on Windows and on repositories with large working trees. The user-facing behavior and the underlying commit-based storage model stayed the same across that rewrite; only the implementation changed.

More recent Git versions (2.35+) added a `--staged` flag to `push`, letting you stash only the index content and leave unstaged working-tree edits untouched — useful when you want to test what a commit would look like without losing in-progress edits on top of it.

## Gotchas Deep-Dive
`git stash clear` deletes every stash entry and drops `refs/stash` entirely, with no confirmation prompt and no per-entry undo — unlike `drop`, there's no "oops, that was the wrong one" recovery path through the stash reflog itself, since the whole reflog goes with it. The underlying commits are still in the object database until garbage collection runs, so `git fsck --unreachable` immediately afterward can sometimes recover the SHAs, but there's no supported command for it — treat `clear` as effectively permanent.

`--keep-index` is frequently misunderstood: it does not mean "only stash staged changes." It stashes everything (staged and unstaged) as usual, then additionally re-applies the staged changes back into the index afterward, leaving the working directory clean of *unstaged* edits while staged ones stay staged. It's meant for testing "does this commit pass CI with exactly what I'm about to commit," not for partial stashing — use `-p` for that.

Stash conflicts on `pop` behave differently from merge conflicts in one important way: Git does not automatically commit anything, and the stash entry is deliberately left in the stash list until you resolve conflicts and explicitly `git stash drop` it. Running `pop` again before resolving will error, since the working tree isn't clean.

## FAQ
**Does `git stash` affect the branch history?** No. Nothing is added to the branch's commit graph; the stash commits exist off to the side, reachable only through `refs/stash` and its reflog.

**Can I apply a stash to a different branch than the one I made it on?** Yes — a stash is just a diff-bearing commit pair, `git stash apply` will try to merge it into whatever branch is currently checked out.

**What happens to a stash if I delete the branch it was created on?** Nothing — the stash is independent of the branch and survives branch deletion, since its underlying commits aren't reachable from the branch ref at all.

**Can I see what a stash contains without applying it?** Yes — `git stash show -p stash@{0}` prints the full diff, and `git stash show --stat stash@{0}` gives a summary of files touched, neither one touches the working directory.

**How long do stashes stick around before Git cleans them up?** Stash entries are reflog entries, subject to the same expiry as any reflog — by default 90 days for reachable entries via `gc.reflogExpire`, though in practice most repos never run aggressive enough `gc` for this to matter for typical stash lifetimes.

**Is there a limit to how many stashes I can have?** No hard limit — `refs/stash`'s reflog can grow indefinitely, though a stash list with dozens of unlabeled entries becomes a productivity problem long before it becomes a technical one. Naming every stash with `-m` pays off quickly once you have more than two or three at once.

**What do the `create` and `store` subcommands do, and when would I use them?** `create` builds a stash commit exactly like `push` would, but only prints its SHA without touching `refs/stash` or the working tree — useful in scripts that want to build a stash object programmatically. `store` then takes that SHA and records it into `refs/stash`, the bookkeeping step `push` normally folds into one command.

**Can I stash changes to just one file?** Yes — `git stash push -- path/to/file`, or interactively with `-p` and decline the hunks belonging to other files.

## Related Commands
- [[git branch]]
- [[git checkout]]
- [[git switch]]
- [[git commit]]
- [[git diff]]
- [[git worktree]]
