---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git rm

**Definition:** Removes a file from both the working directory and the staging area — its tracked history stays intact.

## Syntax
```
git rm <file>
```

## Common Options
- `--cached` — untrack the file but keep it on disk (common after forgetting to add something to `.gitignore`)
- `-r` — remove a directory recursively

## Basic Example
```
git rm old-script.js
```
Deletes the file from disk and stages the removal.

## Extended Example
```
git rm --cached .env
```
Stops tracking `.env` going forward, so it can be added to [[gitignore|.gitignore]], without deleting it from your local disk.

## Common Pitfalls
- Forgetting `--cached` and permanently deleting a file from disk that you actually wanted to keep locally, just untracked

## Related Commands
- [[gitignore|.gitignore]]
- [[git status]]
