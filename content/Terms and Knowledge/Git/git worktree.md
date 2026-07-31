---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git worktree

**Definition:** Lets you check out multiple branches of the same repo into separate folders at the same time, without cloning it multiple times.

## Syntax
```
git worktree add <path> <branch>
```

## Common Options
- `add <path> <branch>` — create a new working directory for a given branch
- `list` — show all active worktrees
- `remove <path>` — remove a worktree when done with it

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

## Common Pitfalls
- Forgetting to `git worktree remove` old worktrees, leaving dangling folders that confuse `git worktree list` and take up disk space

## Related Commands
- [[git branch]]
- [[git stash]]
