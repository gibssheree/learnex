---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git revert

**Definition:** Creates a new commit that undoes the changes from a specific previous commit, without altering existing history.

## Syntax
```
git revert <commit>
```

## Common Options
- `-n` / `--no-commit` — apply the revert but don't commit yet, useful for reverting multiple commits into one combined commit
- `-m <parent-number>` — required when reverting a merge commit, specifies which parent to consider "mainline"

## Basic Example
```
git revert a1b2c3d
```
Creates a new commit that undoes exactly what that commit did.

## Extended Example
```
git revert --no-commit a1b2c3d d4e5f6g
git commit -m "Revert two broken commits"
```
Reverts two separate commits' changes but bundles them into a single new commit instead of two separate revert commits.

## Common Pitfalls
- Reaching for [[git reset]] on already-pushed commits instead — `reset` rewrites history (dangerous on shared branches), `revert` adds a new commit (safe on shared branches)

## Related Commands
- [[git reset]]
- [[git log]]
