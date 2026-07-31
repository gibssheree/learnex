---
tags: [term, git, branching]
category: Branching & Merging
---

# git rebase

**Definition:** Replays your branch's commits one by one on top of another branch's latest commit, rewriting their hashes and producing a linear history instead of a merge commit.

## Syntax
```
git rebase <branch>
git rebase --onto <newbase> <upstream> <branch>
git rebase --abort
git rebase --continue
git rebase --skip
```

## Common Options
- `--onto <newbase>` — rebase onto a different branch or commit than the one you originally branched from, useful for moving a branch to a new base
- `--abort` — cancel a rebase in progress and return to the exact state before it started
- `--continue` — resume after manually resolving a conflict mid-rebase
- `--skip` — skip the commit currently causing a conflict entirely, discarding its changes
- `-i` — do it interactively, reordering/squashing/dropping commits (see [[git rebase -i (Interactive Rebase)]])
- `--rebase-merges` — preserve the structure of merge commits within the range instead of flattening them

## Basic Example
```
git rebase main
```
Replays your current branch's commits, one at a time, on top of the latest `main`.

## Extended Example
```
git checkout feature
git rebase main
# on conflict:
git status               # see which files conflicted
# edit the file, resolve the <<<<<<< markers
git add <file>
git rebase --continue
```
The standard rebase-and-resolve loop: Git stops at the first commit that conflicts, you fix it like any merge conflict, stage it, and `--continue` moves on to the next commit in the sequence, repeating until the whole branch has been replayed.

## Common Pitfalls
- Rebasing commits that have already been pushed and pulled by others — it rewrites every commit hash from the rebase point forward, so anyone else's copy diverges painfully. Rule of thumb: never rebase shared/public branches
- Running `git rebase main` instead of `git rebase origin/main` — rebasing onto your possibly-stale local `main` instead of the actual remote tip
- Force-pushing after a rebase without `--force-with-lease` (see [[git push]]) — a plain `--force` can wipe out commits a teammate already pushed to the same branch
- Rebasing a long-lived branch with many conflicting commits — each conflict has to be resolved individually per-commit, which can be far more tedious than resolving one merge conflict

## Related Commands
- [[git merge]]
- [[git rebase -i (Interactive Rebase)]]
- [[git push]]
