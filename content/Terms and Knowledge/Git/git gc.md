---
tags: [term, git, advanced, maintenance]
category: Advanced & Internals
---

# git gc

**Definition:** Cleans up and optimizes the local repository — compressing loose objects, removing genuinely unreachable data, and speeding up future operations.

## Syntax
```
git gc [options]
```

## Common Options
- `--aggressive` — more thorough optimization, slower to run
- `--prune=<date>` — actually delete unreachable objects older than the given date (default is about 2 weeks, protecting recent reflog-recoverable work)

## Basic Example
```
git gc
```
Git runs this automatically sometimes, but you can trigger it manually on a repo that's grown huge or slow.

## Extended Example
```
git gc --aggressive --prune=now
```
A heavier cleanup pass that also immediately removes unreachable objects instead of waiting the default grace period — useful for shrinking a bloated repo, but destroys your [[git reflog]] recovery safety net for anything already unreachable.

## Common Pitfalls
- Running `--prune=now` carelessly, permanently deleting objects that `git reflog` would have otherwise let you recover

## Related Commands
- [[git reflog]]
