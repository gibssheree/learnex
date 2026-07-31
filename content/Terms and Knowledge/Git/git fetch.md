---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git fetch

**Definition:** Downloads commits, branches, and tags from a remote, without merging them into your local branches.

## Syntax
```
git fetch [<remote>]
```

## Common Options
- `--all` — fetch from every configured remote
- `--prune` — remove local references to remote branches that no longer exist on the remote

## Basic Example
```
git fetch origin
```
Updates your local knowledge of `origin`'s branches without touching your working files.

## Extended Example
```
git fetch --all --prune
```
Refreshes every remote's branch list and cleans up stale remote-tracking branches that were deleted on the server, keeping `git branch -a` output tidy.

## Common Pitfalls
- Assuming `fetch` updates your working files like `pull` does — it only updates your local knowledge of the remote, your own branch doesn't move

## Related Commands
- [[git pull]]
- [[git remote]]
