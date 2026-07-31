---
tags: [term, git, branching]
category: Branching & Merging
---

# git branch

**Definition:** Lists, creates, or deletes branches.

## Syntax
```
git branch [<branch-name>] [<start-point>]
```

## Common Options
- `-a` — list all branches, including remote-tracking ones
- `-r` — list only remote-tracking branches
- `-v` / `-vv` — show each branch's last commit (`-v`), or also its upstream tracking branch and ahead/behind count (`-vv`)
- `-d <branch>` — delete a branch (safe, refuses if it has commits not merged into its upstream or the current branch)
- `-D <branch>` — force-delete a branch regardless of merge status (shorthand for `--delete --force`)
- `-m <old> <new>` — rename a branch
- `--merged` / `--no-merged` — list branches that have (or haven't) been merged into the current branch, useful for finding stale branches to clean up
- `-u <upstream>` — set the remote-tracking branch for the current branch without pushing
- `--contains <commit>` — list branches that contain a given commit

## Basic Example
```
git branch feature/login
```
Creates a new branch without switching to it.

## Extended Example
```
git branch --merged main | grep -v '^\*\|main' | xargs git branch -d
```
Lists local branches already merged into `main`, filters out the current branch and `main` itself, then batch-deletes the rest — a common way to clean up a cluttered local branch list after a run of feature branches have landed.

## Common Pitfalls
- Using `-D` out of frustration when a normal `-d` refuses to delete — that refusal usually means real unmerged work would be lost; check with `git log <branch> ^main` first
- Trying to delete the branch you're currently on — Git refuses; `checkout`/`switch` elsewhere first
- Renaming a branch with `-m` only renames it locally — the remote still has the old name until you `git push origin -u new-name` and delete the old one there too
- Confusing `--merged`/`--no-merged` direction: they're relative to the *current* branch, not always `main`, so run them right after checking out the branch you mean to compare against

## Related Commands
- [[git checkout]]
- [[git switch]]
- [[git merge]]
