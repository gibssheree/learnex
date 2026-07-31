---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git commit

**Definition:** Records the currently staged changes as a new snapshot (commit) in the repository's history.

## Syntax
```
git commit [options]
```

## Common Options
- `-m "<message>"` — provide the commit message inline
- `-a` — automatically stage all tracked, modified files before committing (skips `git add` for files already tracked)
- `--amend` — replace the previous commit instead of creating a new one

## Basic Example
```
git commit -m "Add login form validation"
```
Commits the currently staged changes with that message.

## Extended Example
```
git commit -am "Fix typo in README"
```
Stages every already-tracked modified file and commits in one step, skipping the separate `git add` call.

## Common Pitfalls
- Using `-a` and assuming it also stages brand-new untracked files — it doesn't, only files Git already knows about

## Related Commands
- [[git add]]
- [[git commit --amend]]
- [[git log]]
