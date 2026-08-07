---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git reset

**Definition:** Moves the current branch pointer to a different commit, optionally also changing the staging area and working directory to match — the core tool for undoing commits locally.

## Syntax
```
git reset [--soft|--mixed|--hard] <commit>
git reset [--soft|--mixed|--hard] HEAD~<n>
git reset <file>
git reset -p
git reset --merge <commit>
git reset --keep <commit>
```

## Common Options
- `--soft` — move the branch pointer only, keep all changes staged exactly as they were
- `--mixed` (default) — move the pointer and unstage changes, but keep them in the working directory
- `--hard` — move the pointer and discard all staged and working-directory changes completely, unrecoverable except via [[git reflog]]
- `--merge` — like `--hard` for the index, but preserves uncommitted working-directory changes that don't conflict with the reset, aborting if they do
- `--keep` — similar safety net to `--merge`; refuses to run if local changes overlap with files touched between old and new HEAD
- `<file>` (no mode flag) — unstage a specific file without moving the branch pointer at all, the older equivalent of `git restore --staged`
- `-p` / `--patch` — interactively pick which staged hunks to unstage, instead of the whole file

## Basic Example
```
git reset HEAD~1
```
Undoes the last commit, keeping its changes unstaged in your working directory (default `--mixed` behavior). The commit itself still exists as a dangling object until garbage collected, and remains reachable via `git reflog`.

## Extended Example
```
git reset --soft HEAD~3
git status                        # 3 commits' worth of changes, all staged
git commit -m "Add login flow"
```
Un-commits the last 3 commits but keeps all their combined changes staged, letting you squash a messy sequence of WIP commits into one clean commit with a fresh message, without touching a single file on disk.

## Under the Hood
Every Git working copy juggles three separate "trees," and understanding what `reset` does to each one is the key to understanding the command:

1. **HEAD** — the commit your branch pointer currently references. This is the tip of your committed history.
2. **The index** (aka the staging area) — a snapshot of what will go into the *next* commit. It lives in `.git/index`.
3. **The working directory** — the actual files on disk that you edit.

`git reset <commit>` always does step one: it moves the branch ref (and HEAD, since HEAD is a symbolic ref pointing at the branch) to point at `<commit>`. What happens next depends on the mode:

- `--soft` touches only HEAD. The index and working directory are left exactly as they were, which means everything that used to be committed between the old HEAD and the new one now shows up as staged changes.
- `--mixed` (the default) also resets the index to match the new HEAD, but leaves the working directory alone — so those same changes now show up as unstaged, working-directory modifications.
- `--hard` resets HEAD, the index, *and* the working directory to match the target commit, discarding all uncommitted changes in the process. This is the only mode that can destroy work Git never captured as an object.

Because `reset` moves the branch pointer itself, the commits it "removes" aren't deleted from the object database — they become unreachable from any branch, but they still exist until Git's garbage collector prunes them (typically after 30-90 days by default via `gc.reflogExpire`). `git reflog` keeps a log of where HEAD has pointed, so `git reset --hard <bad-sha>` is almost always recoverable as long as you catch it before a `git gc` runs.

## Flags Reference
| Flag | Effect |
|---|---|
| `--soft <commit>` | Move HEAD only; index and working tree untouched |
| `--mixed <commit>` (default) | Move HEAD and reset index; working tree untouched |
| `--hard <commit>` | Move HEAD, index, and working tree — destructive |
| `--merge <commit>` | Reset HEAD and index like `--hard`, but abort if working-tree changes would be overwritten |
| `--keep <commit>` | Like `--merge`, refuses if the reset range touches files with local modifications |
| `-p` / `--patch` | Interactively select hunks to unstage (implies `--mixed`) |
| `-N` / `--intent-to-add` | Combine with `--mixed` to preserve intent-to-add markers for new files |
| `-q` / `--quiet` | Suppress status output after resetting |

## Comparison: Reset Modes
| Mode | HEAD | Index (staged) | Working directory |
|---|---|---|---|
| `--soft` | moved | unchanged (old state preserved) | unchanged |
| `--mixed` (default) | moved | reset to match new HEAD | unchanged |
| `--hard` | moved | reset to match new HEAD | reset to match new HEAD |

## Comparison: reset vs restore vs revert
| Command | Moves branch pointer? | Rewrites history? | Safe on shared branches? |
|---|---|---|---|
| `git reset` | yes | yes | no |
| `git restore` | no | n/a (only touches index/worktree) | yes |
| `git revert` | no (adds a new commit) | no | yes |

The three commands correspond to three different questions you might actually be asking: "throw away some commits" (`reset`), "throw away some file edits" (`restore`), and "undo what a commit did, but keep the record that it happened" (`revert`). Picking the wrong one is rarely catastrophic on a private branch — `reset` and `restore` both leave recovery paths via reflog or a fresh checkout — but on a branch other people have already pulled, `reset` is the one to avoid entirely.

## Gotchas Deep-Dive
`git reset` with a pathspec (`git reset <commit> <file>`) behaves differently from a bare `git reset <commit>` in a way that trips people up: it only ever updates the index, never HEAD, regardless of which mode flag you pass — in fact `--hard`, `--soft`, and `--mixed` are all rejected outright when a pathspec is given. This is why `git reset HEAD~1 -- config.json` is a legal way to pull one file's index entry back to an older state without moving the branch at all, but `git reset --hard HEAD~1 -- config.json` is simply an error.

`git rebase` also uses `reset` internally between steps — each time it replays a commit, it's effectively doing a `git reset --hard` to the new base before applying the next patch. This is worth knowing when a rebase goes wrong: `git reflog` will show a string of intermediate `rebase (pick)` and `rebase (start)` entries, each corresponding to an internal reset, and any of them can be a recovery point via `git reset --hard <reflog-entry>`.

## Common Workflow
Uncommitting a bad commit that was never pushed, then redoing it properly:
```
git commit -m "wip: broken login validation"
git reset --soft HEAD~1
# edit files to fix the actual bug
git add .
git commit -m "Fix login validation edge case"
```
This is the everyday case for `--soft`: the mistake was in the commit message or the commit boundary, not the changes themselves, so nothing needs to leave the index.

## Common Pitfalls
- Running `git reset --hard` with uncommitted work and permanently losing it — always check `git status` first. Commits themselves are recoverable via `git reflog` since the objects still exist, but uncommitted changes were never captured as objects and are gone for good
- Running `git reset --hard` on a commit that's already been pushed, then force-pushing — this is functionally the same history rewrite as a rebase and breaks collaborators' clones the same way
- Confusing `reset` with [[git revert]] — `reset` moves the pointer backward and erases commits from the branch's history, which is dangerous on shared branches; `revert` adds a new commit undoing the changes, which is safe to push anywhere
- Reaching for `git reset <file>` out of habit when `git restore --staged <file>` is the modern, less ambiguous equivalent — `reset` with a pathspec silently ignores the mode flags (`--hard` with a file argument is an error) which trips people up
- Forgetting that `--mixed` is the default when typing bare `git reset HEAD~1` — some engineers expect it to behave like `--soft` and are surprised their changes land back in the working directory unstaged

## FAQ
**Does `git reset --hard` delete commits permanently?** Not immediately — the commit objects stay in `.git/objects` until garbage collection runs. `git reflog` plus `git reset --hard <old-sha>` can usually recover them within the retention window.

**What's the difference between `--merge` and `--keep`?** Both try to preserve uncommitted working-directory changes during a reset instead of blindly overwriting them. `--merge` performs a three-way merge between your changes and the reset target, aborting on conflict. `--keep` is more conservative: it refuses outright if any file touched by the reset range has local modifications, rather than attempting to merge.

**Can I reset just one file to an old commit's version?** Yes with `git reset <commit> -- <file>` (updates the index only) or better, use `git restore --source=<commit> <file>` which is the purpose-built modern command for that.

**Does `git reset` work on a detached HEAD?** Yes — it moves whatever HEAD currently points at, branch or not. On a detached HEAD, that means you're moving a bare commit pointer with no branch attached, so once you switch away without creating a branch there, the commits you were pointed at become unreachable except through the reflog.

**Is there a way to reset without losing the reflog entry for what HEAD pointed to before?** You never lose it — every `reset` that moves HEAD adds a new entry to the reflog (`HEAD@{0}`, `HEAD@{1}`, ...) rather than overwriting it, which is precisely the mechanism that makes `reset --hard` recoverable in the first place.

## Common Interview Questions
**"What's the difference between `git reset --soft` and `git reset --mixed`?"** Both move the branch pointer without touching the working directory. `--soft` also leaves the index untouched, so the changes from the undone commits stay staged; `--mixed`, the default, additionally resets the index to match the new HEAD, so the same changes become unstaged working-directory edits instead.

**"How would you recover from an accidental `git reset --hard`?"** Run `git reflog` to find the commit SHA HEAD pointed to before the reset (it'll be listed with a description like `commit: <message>` right before the `reset: moving to ...` entry), then `git reset --hard <that-sha>` to restore the branch to that point. This works because the commit objects and their trees/blobs are still in `.git/objects` until garbage collected — only the ref pointing at them moved.

**"Why is `git reset` considered unsafe on shared branches but `git revert` isn't?"** `reset` changes what commit a branch ref points to, which means every commit hash from the reset point forward effectively "disappears" from that branch's history as far as anyone re-fetching it is concerned. Anyone who already has the old commits will diverge from the rewritten branch and need to force-pull or rebase. `revert` never moves any ref backward — it only ever adds a new commit on top, so existing history and everyone's local clones stay perfectly consistent with it.

## Real-World Example
Splitting one oversized commit into several focused ones before pushing:
```
git log --oneline -1                # note the SHA in case you need to bail out
git reset --soft HEAD~1
git restore --staged .              # unstage everything from that commit
git add src/auth/
git commit -m "Add authentication middleware"
git add src/logging/
git commit -m "Add request logging"
```
Soft-resetting one commit back re-stages all of its changes as a single group; unstaging and re-adding in smaller batches replays a bloated commit as several logically separate ones with distinct messages, all before anything is pushed and while it's still cheap to rewrite.

## History
Before `git restore` existed (pre-Git 2.23), `git reset <file>` was the standard way to unstage a file — there was no dedicated command for it. That overload is why `reset`'s behavior splits so awkwardly between "move the branch pointer" (no pathspec) and "just touch the index for these paths" (with a pathspec): the pathspec form was retrofitted onto a command originally designed around moving HEAD. Modern guidance is to use `git restore --staged` for the unstaging case and reserve `git reset` for genuinely moving the branch pointer.

**Does `git reset` ever touch untracked files?** No, none of the three modes create, delete, or modify untracked files — `--hard` discards changes to tracked files only. Untracked files are entirely [[git clean]]'s domain.

**Why does `git status` show "unmerged paths" after a reset during a conflicted merge?** `git reset --hard` (or `--merge`) is the standard way to bail out of a merge entirely and return to the pre-merge state; if you instead used `--soft` or `--mixed` mid-conflict, the unmerged index entries can persist since those modes don't fully rewrite the index structure the way `--hard` does. `git merge --abort` is generally the more direct tool for abandoning an in-progress merge cleanly.

## Related Commands
- [[git revert]]
- [[git restore]]
- [[git reflog]]
- [[git checkout]]
- [[git commit --amend]]
