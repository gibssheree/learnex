---
tags: [term, git, branching]
category: Branching & Merging
---

# git checkout

**Definition:** Switches between branches or restores files — an older, multi-purpose command later split into [[git switch]] and [[git restore]].

## Syntax
```
git checkout <branch>
git checkout <commit>
git checkout <commit> -- <file>
git checkout -b <new-branch> [<start-point>]
```

## Common Options
- `-b <new-branch>` — create and switch to a new branch in one step
- `-B <branch>` — like `-b`, but resets the branch to the start point if it already exists
- `-- <file>` — discard local changes to a specific file, restoring it to the last commit (or a given commit if one is specified before `--`)
- `-f` / `--force` — switch branches even with uncommitted changes, discarding conflicting local modifications
- `--track <remote>/<branch>` — create a local branch that tracks a remote branch
- `-p` / `--patch` — interactively choose which hunks of a file to restore, instead of the whole file

## Basic Example
```
git checkout main
```
Switches your working directory to the `main` branch.

## Extended Example
```
git checkout -b hotfix/login-bug origin/main
# ...make and commit the fix...
git checkout main
git checkout hotfix/login-bug -- CHANGELOG.md
```
Creates a new local branch based on the remote `main` and switches to it to start a fix, then later pulls just one file (`CHANGELOG.md`) from that branch into `main` without merging the whole branch.

## Common Pitfalls
- Because it does two very different jobs, switching branches vs restoring files, it's easy to fat-finger and lose uncommitted changes. Most teams now prefer the clearer `git switch` / `git restore` split
- Checking out a specific commit hash directly (`git checkout a1b2c3d`) puts you in detached HEAD — commits made there aren't on any branch and can be lost once you switch away unless you `git checkout -b <name>` first
- `git checkout -- <file>` silently overwrites uncommitted local edits with no confirmation — and since those edits were never committed, not even [[git reflog]] can bring them back

## Related Commands
- [[git switch]]
- [[git restore]]
- [[git branch]]
