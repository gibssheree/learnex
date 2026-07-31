---
tags: [term, git, stashing]
category: Stashing
---

# git stash

**Definition:** Temporarily shelves uncommitted changes so you can switch context, like switching branches, with a clean working directory, then bring them back later.

## Syntax
```
git stash [push|pop|apply|list|drop]
```

## Common Options
- `push -m "<message>"` — stash with a descriptive label (`git stash` alone also works)
- `pop` — reapply the most recent stash and remove it from the stash list
- `apply` — reapply the most recent stash but keep it in the list, in case you need it again
- `list` — show all stashed changes
- `-u` / `--include-untracked` — also stash new, untracked files, not just modified ones

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

## Common Pitfalls
- Forgetting you have stashed changes sitting around for weeks — always check `git stash list` before assuming your working directory reflects everything you've done

## Related Commands
- [[git branch]]
- [[git checkout]]
