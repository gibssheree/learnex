---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git diff

**Definition:** Shows the line-by-line differences between two states — working directory vs staging, staging vs last commit, or between any two commits or branches.

## Syntax
```
git diff [options] [<commit>] [<commit>]
```

## Common Options
- `--staged` / `--cached` — show what's staged vs the last commit, instead of unstaged changes
- `<commit1>..<commit2>` — compare two specific commits or branches
- `-- <path>` — limit the diff to a specific file or folder

## Basic Example
```
git diff
```
Shows unstaged changes in the working directory.

## Extended Example
```
git diff main..feature-branch -- src/
```
Shows only the differences inside the `src/` folder between `main` and `feature-branch` — useful for reviewing a pull request's actual scope before merging.

## Common Pitfalls
- Forgetting `--staged` and wondering why `git diff` shows nothing after you already ran `git add`

## Related Commands
- [[git status]]
- [[git log]]
- [[git show]]
