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
```

## Common Options
- `--soft` — move the branch pointer only, keep all changes staged exactly as they were
- `--mixed` (default) — move the pointer and unstage changes, but keep them in the working directory
- `--hard` — move the pointer and discard all staged and working-directory changes completely, unrecoverable except via [[git reflog]]
- `<file>` (no mode flag) — unstage a specific file without moving the branch pointer at all, the older equivalent of `git restore --staged`

## Basic Example
```
git reset HEAD~1
```
Undoes the last commit, keeping its changes unstaged in your working directory (default `--mixed` behavior).

## Extended Example
```
git reset --soft HEAD~3
git status                        # 3 commits' worth of changes, all staged
git commit -m "Add login flow"
```
Un-commits the last 3 commits but keeps all their combined changes staged, letting you squash a messy sequence of WIP commits into one clean commit with a fresh message, without touching a single file on disk.

## Common Pitfalls
- Running `git reset --hard` with uncommitted work and permanently losing it — always check `git status` first. Commits themselves are recoverable via `git reflog` since the objects still exist, but uncommitted changes were never captured as objects and are gone for good
- Running `git reset --hard` on a commit that's already been pushed, then force-pushing — this is functionally the same history rewrite as a rebase and breaks collaborators' clones the same way
- Confusing `reset` with [[git revert]] — `reset` moves the pointer backward and erases commits from the branch's history, which is dangerous on shared branches; `revert` adds a new commit undoing the changes, which is safe to push anywhere

## Related Commands
- [[git revert]]
- [[git restore]]
- [[git reflog]]
