---
tags: [term, git, branching]
category: Branching & Merging
---

# git checkout

**Definition:** Switches between branches or restores files — an older, multi-purpose command later split into [[git switch]] and [[git restore]].

## Syntax
```
git checkout <branch>
git checkout <commit>
git checkout <commit> -- <file>
git checkout -b <new-branch> [<start-point>]
```

## Common Options
- `-b <new-branch>` — create and switch to a new branch in one step
- `-B <branch>` — like `-b`, but resets the branch to the start point if it already exists
- `-- <file>` — discard local changes to a specific file, restoring it to the last commit (or a given commit if one is specified before `--`)
- `-f` / `--force` — switch branches even with uncommitted changes, discarding conflicting local modifications
- `--track <remote>/<branch>` — create a local branch that tracks a remote branch
- `-p` / `--patch` — interactively choose which hunks of a file to restore, instead of the whole file

## Basic Example
```
git checkout main
```
Switches your working directory to the `main` branch.

## Extended Example
```
git checkout -b hotfix/login-bug origin/main
# ...make and commit the fix...
git checkout main
git checkout hotfix/login-bug -- CHANGELOG.md
```
Creates a new local branch based on the remote `main` and switches to it to start a fix, then later pulls just one file (`CHANGELOG.md`) from that branch into `main` without merging the whole branch.

## Under the Hood
`checkout` operates on three layers at once, which is precisely why it's confusing: the working directory, the index, and `HEAD`. Checking out a branch (`git checkout main`) rewrites `HEAD` to point at `refs/heads/main` (or, for a bare commit, straight at that commit's SHA — "detached HEAD"), then replaces every file in the working directory and index with the tree recorded in that branch's tip commit. Checking out a file (`git checkout -- <file>`) does something narrower: it copies that one path's blob out of a tree (defaulting to whatever `HEAD` or the index currently points to) into the working directory, leaving `HEAD` and every other file untouched.

Detached HEAD is the direct consequence of `HEAD` being allowed to point straight at a commit SHA instead of at a branch ref. Commits made in that state still get written to the object database normally, and `HEAD` still moves forward with each commit — but no branch ref moves with it. If you then switch to a branch, those commits become unreachable from any ref (though still recoverable via [[git reflog]] until Git's garbage collector eventually prunes them).

Git 2.23 split `checkout`'s two jobs into [[git switch]] (branches only) and [[git restore]] (files only) specifically because this overloading caused real data loss — a typo'd branch name that happens to also be a valid file path silently does the wrong operation.

## Flags Reference
| Flag | Effect |
|---|---|
| `-b <name>` | Create and switch to a new branch |
| `-B <name>` | Create/reset and switch, even if the branch exists |
| `-- <path>` | Restore path(s) from a tree, without switching branches |
| `-f`, `--force` | Discard conflicting local changes when switching |
| `--track <remote>/<branch>` | Create a local branch tracking a remote one |
| `--orphan <branch>` | Create a new branch with no history/parent at all |
| `-p`, `--patch` | Interactively restore specific hunks instead of whole files |
| `-m`, `--merge` | Attempt a 3-way merge of local changes when switching branches |
| `<commit> -- <file>` | Restore a file's content from a specific commit, not just HEAD |
| `-` | Shorthand for "the previously checked-out branch" |
| `--detach` | Explicitly enter detached HEAD even when checking out something that is a branch |
| `-q`, `--quiet` | Suppress progress and feedback output |
| `--ignore-other-worktrees` | Allow checking out a branch already checked out in another worktree (normally blocked) |
| `--recurse-submodules` | Also update submodule checkouts to match the superproject's recorded commit |

## Common Workflow
Recovering a single file's older version without disturbing anything else you're working on:
```
git log --oneline -- config/settings.yml     # find when it last looked right
git checkout a1b2c3d -- config/settings.yml   # pull just that version into the working tree
git diff --cached                             # review before committing
git commit -m "Revert settings.yml to pre-migration config"
```
Note this stages the restored file automatically — `checkout -- <file>` with a commit given before `--` both restores *and* stages, unlike `git restore --source` which restores to the working tree only unless `--staged` is added too.

## Comparison
| | `git checkout` | [[git switch]] | [[git restore]] |
|---|---|---|---|
| Switches branches | Yes | Yes | No |
| Restores files | Yes | No | Yes |
| Can enter detached HEAD | Yes (`checkout <sha>`) | Yes (`switch --detach`) | No |
| Introduced | Git's original command | Git 2.23 | Git 2.23 |
| Ambiguity risk | High (one command, two jobs) | Low | Low |

## History
- `checkout` is one of Git's oldest and most heavily overloaded porcelain commands — it accreted branch-switching, file-restoring, and detached-HEAD exploration into a single verb over many years of incremental feature additions.
- The overloading became enough of a real-world usability problem (accidental data loss from ambiguous argument parsing) that Git 2.23 (2019) split it into [[git switch]] and [[git restore]], both explicitly positioned as the recommended interface going forward.
- `checkout` itself was never deprecated or removed — it remains fully supported for backward compatibility, and its scripting behavior is considered more stable across Git versions than the newer commands, some of which were initially marked experimental.
- `--orphan` (create a branch with no parent history) was added later to support use cases like maintaining a `gh-pages` branch with completely unrelated history from `main` in the same repository.
- `--recurse-submodules` support was added as submodule usage grew, so a single checkout could update nested repositories to match the superproject's recorded state without a separate `git submodule update` step.

## Real-World Example
Exploring an old release tag to compare behavior, then safely turning that exploration into a real branch once you decide it's worth keeping:
```
git checkout v1.4.0                 # detached HEAD, just looking around
npm test                             # confirm something about the old behavior
# turns out worth digging into further
git checkout -b investigate/v1.4-regression
git log --oneline -5                 # you're now on a real branch, commits here are safe
git checkout main                    # done investigating, back to normal work
```
Without the intermediate `-b`, any commits made while poking around `v1.4.0` in detached HEAD would become unreachable the moment `git checkout main` runs, recoverable only via [[git reflog]] for a limited window.

## Gotchas Deep-Dive
- **Silent data loss on file restore.** `git checkout -- <file>` has no confirmation prompt and no undo path for uncommitted work — this is the single most-cited reason the command was split; `git restore` behaves identically here but the explicit verb makes the destructive intent clearer at a glance.
- **Ambiguous argument resolution.** `git checkout foo` tries to resolve `foo` as a branch first; if no branch matches, Git checks whether it's a valid path instead. A branch that happens to share a name with a file or directory in the repo root can produce surprising behavior depending on which exists at the time.
- **Detached HEAD surprises in CI.** Many CI systems check out a specific commit (not a branch) by design, which means any script assuming `git branch --show-current` returns a name will get an empty string — worth handling explicitly rather than assuming a branch context always exists.
- **`-f` discarding merge-in-progress state.** Forcing a checkout mid-conflict (during an unfinished merge, rebase, or cherry-pick) abandons that operation's state without the usual `--abort` cleanup, which can leave stray files or an inconsistent index if not done carefully.
- **Checking out a branch already active in another worktree.** If you use [[git worktree]], Git normally refuses to check out a branch that's already checked out elsewhere, to prevent two working directories from diverging on the same branch pointer simultaneously — `--ignore-other-worktrees` overrides this deliberately, at the risk of confusing state.
- **Path arguments that look like revisions.** `git checkout main` is unambiguous if `main` is only ever a branch, but a poorly named branch like `HEAD` or a numeric-looking name can collide with Git's own special syntax, producing confusing resolution errors.
- **Stale working-tree files after a failed checkout.** If a checkout is interrupted partway (disk full, process killed), the working directory can be left in a mixed state between the old and new branch's files — `git status` and a clean re-checkout of the intended branch are the way to recover.

## FAQ
**Should I use `checkout` or `switch`/`restore` in new scripts?** For scripting and automation, `switch`/`restore` are preferred for their unambiguous, single-purpose behavior. `checkout` remains fine for everyday interactive use and is still what most tutorials and muscle memory default to.

**Does `git checkout <branch>` fetch anything from the remote first?** No — it only operates on local refs and remote-tracking branches as of your last `fetch`. If the remote has moved on, you won't see that until you `fetch`/`pull`.

**What exactly is "detached HEAD"?** A state where `HEAD` points directly at a commit SHA instead of at a branch ref. You can still commit, but nothing tracks those commits except `HEAD` itself, so switching away loses the trail unless you create a branch first.

**Can `checkout` merge changes instead of overwriting them when switching branches?** With uncommitted changes that don't conflict with the target branch, a plain `git checkout <branch>` carries them over automatically; `-m`/`--merge` extends this to attempt a real three-way merge when there would otherwise be a conflict.

**Does `git checkout -- <file>` stage the restored file?** No, when restoring from `HEAD` implicitly it just updates the working directory; but `git checkout <commit> -- <file>` (an explicit commit before `--`) both restores the file *and* stages it, matching the index to that commit's version.

**Why does Git sometimes warn about "you are in detached HEAD state" with a long explanation?** It's a deliberate safety message added specifically because so many users found themselves there accidentally (via `checkout <tag>` or `checkout <sha>`) without understanding the consequences for new commits.

**Does checking out a tag put you in detached HEAD too?** Yes — tags point at commits, not branches, so checking one out behaves exactly like checking out a raw commit SHA.

**Is `git checkout -` the same as `git switch -`?** Functionally yes for branch switching — both jump back to whatever branch (or commit) you were on before the current one, using the same `@{-1}` shorthand internally.

**Can `checkout` create a branch that tracks a remote branch automatically?** Yes — `git checkout <name>` where `<name>` doesn't exist locally but matches exactly one remote-tracking branch (e.g. `origin/<name>`) automatically creates a local branch tracking it, equivalent to `--track origin/<name>`.

## Common Interview Questions
- Why was `git checkout` split into `switch` and `restore`? — because combining branch-switching and file-restoring in one command created ambiguous, sometimes destructive argument parsing; separating them removes that ambiguity.
- What is detached HEAD and how do you get out of it safely? — a state where `HEAD` points at a commit instead of a branch; `git checkout -b <name>` from that state creates a branch capturing any commits made there before they become unreachable.
- What does `git checkout <commit> -- <file>` do differently from `git checkout <branch>`? — it restores a single file's content from a given commit into the working directory and index, without moving `HEAD` or affecting any other file.
- What three things does `checkout` potentially touch, and which of those does file-restoring leave alone? — the working directory, the index, and `HEAD`; restoring a specific file touches only the working directory and index, leaving `HEAD` untouched.

## Common Pitfalls
- Because it does two very different jobs, switching branches vs restoring files, it's easy to fat-finger and lose uncommitted changes. Most teams now prefer the clearer `git switch` / `git restore` split
- Checking out a specific commit hash directly (`git checkout a1b2c3d`) puts you in detached HEAD — commits made there aren't on any branch and can be lost once you switch away unless you `git checkout -b <name>` first
- `git checkout -- <file>` silently overwrites uncommitted local edits with no confirmation — and since those edits were never committed, not even [[git reflog]] can bring them back
- Typing `git checkout <name>` where `<name>` matches both a branch and a file path in the working directory — Git resolves the ambiguity by preferring the branch, but warns; a stray extra argument or missing `--` can send you down the file-restore path instead
- Using `-f` to force a branch switch through uncommitted conflicting changes without realizing those changes are discarded, not stashed — [[git stash]] first if there's any chance you'll want them back
- Forgetting that `-b` errors if the branch already exists — reach for `-B` when you specifically want to reset an existing branch to a new start point

## Related Commands
- [[git switch]] — the modern, unambiguous replacement for branch-switching
- [[git restore]] — the modern, unambiguous replacement for file-restoring
- [[git branch]] — create, list, or delete branches without switching
- [[git stash]] — set aside uncommitted changes before a risky checkout
- [[git reflog]] — recover commits stranded by leaving detached HEAD
- [[git worktree]] — check out multiple branches simultaneously in separate directories instead of switching in place
