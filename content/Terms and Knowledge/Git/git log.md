---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git log

**Definition:** Shows the commit history of the current branch, most recent first.

## Syntax
```
git log [options]
```

## Common Options
- `--oneline` — one line per commit, just hash + message
- `--graph` — draws an ASCII graph of branches and merges
- `-p` — shows the full diff for each commit
- `--author="<name>"` — filter by commit author

## Basic Example
```
git log --oneline
```
A quick, scannable history.

## Extended Example
```
git log --oneline --graph --all --decorate
```
Shows a visual branch graph across every branch, with branch and tag names labeled — the standard way to make sense of messy history.

## Common Pitfalls
- Running plain `git log` on a big repo and getting a wall of full commit messages — most people alias `--oneline --graph` immediately (see [[git config]] for aliases)

## Related Commands
- [[git diff]]
- [[git show]]
- [[git blame]]
