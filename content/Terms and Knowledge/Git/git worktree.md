---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git worktree

**Definition:** Lets you check out multiple branches of the same repo into separate folders at the same time, without cloning it multiple times.

## Syntax
```
git worktree add [-b <new-branch>] <path> [<branch>]
git worktree list [--porcelain]
git worktree remove <path>
git worktree lock|unlock <path>
git worktree move <worktree> <new-path>
git worktree prune
```

## Common Options
- `add <path> <branch>` — create a new working directory for a given branch
- `add -b <new-branch> <path> <start-point>` — create a brand-new branch and a worktree for it in one step
- `add --detach <path> <commit>` — create a worktree checked out at a commit with no branch attached
- `list` — show all active worktrees and what each has checked out
- `remove <path>` — remove a worktree when done with it
- `lock <path> --reason "<why>"` — protect a worktree (e.g. on removable media) from `prune`
- `prune` — clean up administrative data for worktrees whose directories were deleted manually

## Basic Example
```
git worktree add ../hotfix-wt hotfix/urgent-bug
```
Creates a second folder with the `hotfix/urgent-bug` branch checked out, while your main folder stays on whatever branch you were working on.

## Extended Example
Working on a big feature in your main folder, an urgent bug comes in — instead of stashing everything:
```
git worktree add ../urgent main
```
Gives you a clean second copy of `main` in a sibling folder to fix the bug in, with zero disruption to your feature work.

Cleaning up afterward, and creating a brand-new branch straight into its own worktree:
```
git worktree remove ../urgent
git worktree add -b feature/reporting ../reporting origin/main
git worktree list
```
`worktree list` confirms each path, its checked-out branch, and current commit — useful for remembering what all your parallel checkouts are actually pointed at.

## Under the Hood
A repository has exactly one object database (`.git/objects`) and one set of refs (`.git/refs`), but `git worktree` lets multiple working directories share them while each keeps its own `HEAD`, index, and per-worktree state.

The main worktree's administrative data lives in `.git` as usual. For each **linked worktree**, Git creates a directory `.git/worktrees/<name>/` inside the main repo holding that worktree's own `HEAD`, `index`, `ORIG_HEAD`, and other per-checkout files. The linked worktree's own directory then contains not a real `.git` folder but a one-line `.git` **file**:
```
gitdir: /path/to/main-repo/.git/worktrees/hotfix-wt
```
This is the same "external gitdir" pointer mechanism submodules use for their own `.git` files. Because objects and refs are shared, not duplicated, a worktree costs disk space proportional only to its checked-out files, not the whole object history again — and any commit made in one worktree is immediately visible to `git log` in every other worktree of the same repo, since they're reading the same object database.

One direct consequence of sharing refs: Git refuses to check out the **same branch** in two worktrees simultaneously (`fatal: '<branch>' is already checked out at ...`), because two `HEAD`s pointing at the same moving branch ref with independent working trees would make "what does this branch's tip look like" ambiguous. Detached-HEAD worktrees have no such restriction, since nothing is tracking them.

## Flags Reference
| Flag | Subcommand | Effect |
|---|---|---|
| `-b <name>` | `add` | Create a new branch for the worktree instead of using an existing one |
| `--detach` | `add` | Check out a commit with no branch attached |
| `-f`, `--force` | `add` | Allow checking out a branch already checked out elsewhere / override safety checks |
| `--porcelain` | `list` | Stable, script-friendly output |
| `-f`, `--force` | `remove` | Remove even with uncommitted changes present |
| `--reason "<text>"` | `lock` | Record why a worktree is locked (e.g. on a removable drive) |
| `-n`, `--dry-run` | `prune` | Show what would be pruned without doing it |
| `--expire <time>` | `prune` | Only prune worktrees whose lock/administrative data is older than `<time>` |
| `-t`, `--track` / `--no-track` | `add` | Control upstream tracking when the new worktree's branch is created from a remote ref |
| `--guess-remote` | `add` | When creating a branch implicitly, try to match it to an existing remote-tracking branch of the same name |
| `--orphan <branch>` | `add` | Create the worktree on a brand-new branch with no commits/history yet |

## Common Workflow
Reviewing a coworker's pull request without disturbing local work-in-progress:
```
git fetch origin pull/482/head:pr-482
git worktree add ../pr-482-review pr-482
cd ../pr-482-review
npm install && npm test
cd -
git worktree remove ../pr-482-review
```
Running a long build or test suite on `main` while continuing feature work in the primary checkout — no stash juggling, no risk of the build picking up half-finished changes.

## Real-World Example
Running a test suite against several release branches in parallel instead of serially switching and re-running:
```
git worktree add ../test-v1 release/1.x
git worktree add ../test-v2 release/2.x
git worktree add ../test-main main

(cd ../test-v1 && npm ci && npm test) &
(cd ../test-v2 && npm ci && npm test) &
(cd ../test-main && npm ci && npm test) &
wait

git worktree remove ../test-v1
git worktree remove ../test-v2
git worktree remove ../test-main
```
Each worktree gets its own `node_modules` and build output, so the three test runs don't stomp on each other's installed dependencies or compiled artifacts the way running them sequentially in one checkout would risk if anything got left in a half-clean state between runs.

## Comparison
| | `git worktree add` | A second `git clone` |
|---|---|---|
| Disk usage | shares one object database | full duplicate history on disk |
| Setup speed | fast, no network/object copy | slow for large repos, re-copies everything |
| Shares local branches/refs instantly | yes | no, needs fetch/push to sync |
| Shares uncommitted stashes | yes (stash is repo-wide, not per-worktree) | no, entirely separate repo |
| Can check out the same branch twice | no, Git blocks it | yes, they're unrelated repos |

## History
`git worktree` was added in Git 2.5 (2015), well after branches, stashing, and submodules were established, because before it the only ways to work on two branches simultaneously were either a second full clone (slow, disconnected from the original's refs) or `git stash`/context-juggling within a single checkout. It formalized a pattern power users had already been approximating with manual `GIT_DIR`/`GIT_WORK_TREE` environment variable tricks, wrapping that mechanism in a supported, safer command surface.

## Gotchas Deep-Dive
Deleting the **main** worktree (the original clone directory) is not supported the way removing a linked worktree is — `git worktree remove` refuses to touch it, since it holds the actual `.git` directory every linked worktree points back to. If the main worktree's folder is lost or moved outside of Git's knowledge, every linked worktree's `gitdir:` pointer breaks, and `git worktree repair` is the documented recovery path, run from each affected linked worktree (or from the main repo with paths listed) to rewrite the pointers.

Locking matters for anything on removable or network storage: `git worktree prune` will happily delete the administrative data for a worktree whose directory it can't currently see, which is exactly what happens to a worktree living on a detached USB drive or an unmounted network share. `git worktree lock <path> --reason "external drive"` exempts it from pruning until explicitly unlocked, regardless of whether the directory is reachable at the moment prune runs.

Because hooks live in the shared `.git/hooks` (or `.git/worktrees/<name>/hooks` if configured per-worktree via `core.hooksPath`), a hook that assumes it's always running against "the" working directory can misbehave across worktrees — a pre-commit hook that hardcodes an absolute path back to the main checkout's `node_modules`, for instance, silently breaks or does the wrong thing in a linked worktree.

Configuration is shared by default too: a `.gitignore` change, a `core.editor` setting, or a remote added in one worktree is visible from every other worktree of the same repository immediately, since they all read the same `.git/config`. Per-worktree config is possible (`git config extensions.worktreeConfig true` plus `--worktree`-scoped settings) but is opt-in and rarely turned on.

## Common Interview Questions
**How is `git worktree` different from just cloning the repo again into another folder?** A worktree shares one object database and one set of refs with the original repository; a second clone is a fully independent repository that happens to share history at clone time, requiring its own fetches to stay in sync and using roughly as much disk space as the original.

**Why can't the same branch be checked out in two worktrees at once?** Because a branch ref combined with a working tree is what defines "what does this branch currently look like on disk" — two independent working trees both claiming to be the live state of the same moving ref would make that question ambiguous, so Git enforces a one-worktree-per-branch rule (detached checkouts are exempt, since nothing is tracking them).

## FAQ
**Do worktrees share the same stash list?** Yes — `git stash` is repo-wide, backed by a single `refs/stash`, not per-worktree. A stash pushed in one worktree can be popped from any other worktree of the same repository.

**Can I create a worktree from a commit that isn't on any branch yet?** Yes, with `--detach`, or by giving `add` a raw SHA — you get a working directory checked out at that exact commit with no branch attached, same as a detached `HEAD` from [[git switch]] `-d`.

**Does each worktree need its own dependency install (`node_modules`, virtualenv, etc.)?** Yes — worktrees share Git's object database, not your build tooling's state. Each is a genuinely separate directory on disk, so language/package-manager caches, installed dependencies, and build output all need to exist independently in each one.

## Common Pitfalls
- Forgetting to `git worktree remove` old worktrees, leaving dangling folders that confuse `git worktree list` and take up disk space
- Deleting a worktree's folder manually with `rm -rf` instead of `git worktree remove` — the admin data under `.git/worktrees/<name>` survives and clutters `list`/status until you run `git worktree prune`
- Trying to check out a branch that's already active in another worktree and being surprised by the refusal — the fix is to finish or stash work in the other worktree first, or use a detached checkout instead
- Assuming worktrees are isolated like separate clones — they share the same `.git/config`, hooks, and stash list, so a `git stash` run in one worktree is visible (and poppable) from any of them
- Moving a worktree's directory on disk with a plain `mv` instead of `git worktree move` — the linked `.git` file's path and the main repo's bookkeeping fall out of sync
- Letting `git worktree prune` run against a worktree on temporarily-unmounted storage without locking it first, losing the administrative link even though the directory itself is fine
- Expecting `git worktree remove` to work on the main worktree — it can't; the main checkout is removed the normal filesystem way (delete the directory), which also takes every linked worktree's `.git` pointer down with it
- Hardcoding absolute paths in hooks or build scripts that assume there's only ever one working directory for the repo, which breaks the moment a second worktree runs the same tooling

## Related Commands
- [[git branch]]
- [[git stash]]
- [[git clone]]
- [[git switch]]
