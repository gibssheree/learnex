---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git clean

**Definition:** Removes untracked files from the working directory — files Git isn't tracking at all, not even staged.

## Syntax
```
git clean [options]
```

## Common Options
- `-n` / `--dry-run` — show what would be deleted without actually deleting it, always run this first
- `-f` — actually force the deletion (Git refuses to run destructively without it)
- `-d` — also remove untracked directories, not just files
- `-x` — also remove files ignored by [[gitignore|.gitignore]] (like `node_modules`)

## Basic Example
```
git clean -n
```
Previews which untracked files would be deleted.

## Extended Example
```
git clean -fdx
```
Deletes every untracked file and directory, including ignored ones like `node_modules` or build output — a common "nuke and reinstall" reset for a broken local environment.

## Common Pitfalls
- Running `-f` without `-n` first — deleted untracked files are gone for good, Git has no history of something it never tracked

## Related Commands
- [[gitignore|.gitignore]]
- [[git reset]]
