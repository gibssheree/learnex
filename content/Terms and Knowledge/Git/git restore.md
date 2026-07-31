---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git restore

**Definition:** A dedicated command, introduced in Git 2.23, for discarding working-directory or staged changes to files — split out of the overloaded [[git checkout]] to make file-restoring operations unambiguous.

## Syntax
```
git restore <file>
git restore --staged <file>
git restore --source <commit> <file>
git restore -p <file>
```

## Common Options
- `--staged <file>` — unstage a file without touching its working-directory changes (the modern replacement for `git reset <file>`)
- `--source <commit> <file>` — restore a file's contents from a specific commit instead of just the last one
- `--worktree` — restore the working-directory copy (default behavior, explicit form used alongside `--staged`)
- `-p` / `--patch` — interactively choose which hunks of a file to restore, instead of the whole file
- `.` — restore every changed file in the current directory and below

## Basic Example
```
git restore utils.js
```
Discards uncommitted working-directory changes to that file, reverting it to the last commit's version.

## Extended Example
```
git restore --staged --worktree app.js
git restore --source HEAD~2 config.json
```
The first command unstages `app.js` and discards its working-directory edits in one step, a full "forget everything I just did to this file"; the second restores `config.json` to how it looked two commits ago while leaving the rest of the working directory untouched.

## Common Pitfalls
- Confusing plain `git restore <file>` (discards working changes, destructive) with `git restore --staged <file>` (only unstages, keeps your edits intact) — the flag completely changes what's at risk
- Expecting `git restore` to switch branches — it only ever touches files, branch switching is [[git switch]]'s job now
- Running it without `--source` on a file that's both staged and modified further, then being surprised which version comes back — check `git status` first to know exactly which state you're restoring from

## Related Commands
- [[git checkout]]
- [[git reset]]
- [[git status]]
