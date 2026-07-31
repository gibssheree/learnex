---
tags: [term, git, branching]
category: Branching & Merging
---

# git merge

**Definition:** Combines the changes from one branch into the branch you're currently on.

## Syntax
```
git merge <branch>
```

## Common Options
- `--no-ff` — always create a merge commit, even if a fast-forward were possible, preserving the fact that a branch existed
- `--squash` — combine all the branch's commits into one set of staged changes, without creating a merge commit yet

## Basic Example
```
git checkout main
git merge feature/login
```
Brings the `feature/login` branch's changes into `main`.

## Extended Example
```
git merge --no-ff --no-edit feature/login
```
Forces a merge commit, instead of a silent fast-forward, so the team's history clearly shows a feature branch was merged, without opening an editor for the message.

## Common Pitfalls
- Merge conflicts — when both branches changed the same lines, Git stops and asks you to resolve them by hand before the merge can complete

## Related Commands
- [[git rebase]]
- [[git branch]]
- [[git diff]]
