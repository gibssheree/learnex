---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git pull

**Definition:** Fetches commits from a remote and immediately integrates them into your current branch, by default via a merge, or a rebase if configured.

## Syntax
```
git pull [<remote>] [<branch>]
git pull --rebase [<remote>] [<branch>]
git pull --ff-only [<remote>] [<branch>]
```

## Common Options
- `--rebase` — replay local unpushed commits on top of the fetched ones instead of creating a merge commit
- `--ff-only` — only allow a fast-forward pull, fail loudly instead of creating a merge commit
- `--no-commit` — fetch and merge but stop before creating the merge commit, so you can inspect it first
- `--prune` — remove local remote-tracking branches that were deleted on the remote, as part of the fetch
- `-v` / `--verbose` — show more detail about what's being fetched and merged

## Basic Example
```
git pull origin main
```
Fetches `origin/main` and merges it into your current branch, creating a merge commit if your branch has diverged.

## Extended Example
```
git config --global pull.rebase true
git pull origin main
# if it stops on a conflict:
# fix the file, then
git add <file>
git rebase --continue
```
Configuring `pull.rebase` once makes every future `git pull` replay your local commits on top of the remote instead of merging, keeping history linear; if a conflict interrupts the rebase mid-pull, it's resolved with the normal rebase conflict loop, not a merge conflict.

## Common Pitfalls
- `git pull` is really `fetch` + `merge` (or `+ rebase`) under the hood — running it with uncommitted local changes can trigger "Your local changes would be overwritten by merge," forcing a [[git stash]] first
- Pulling with `--rebase` on a branch you've already pushed and others have pulled — it rewrites the commits being replayed, which then conflicts with collaborators' copies just like any other rebase of shared history
- Relying on the default merge behavior on a busy branch produces a noisy "Merge branch 'main' into feature" commit on every sync; many teams set `pull.rebase = true` globally to avoid it

## Related Commands
- [[git fetch]]
- [[git merge]]
- [[git rebase]]
