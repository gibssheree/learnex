---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git push

**Definition:** Uploads your local commits to a remote repository and updates its branch references to match.

## Syntax
```
git push [<remote>] [<branch>]
git push -u <remote> <branch>
git push --force-with-lease <remote> <branch>
git push <remote> --delete <branch>
```

## Common Options
- `-u` / `--set-upstream` — link your local branch to a remote branch so future `push`/`pull` don't need remote/branch spelled out
- `--force-with-lease` — force-push, but safely: fails if someone else pushed new commits you haven't fetched yet
- `--force` — force-push unconditionally, overwrites the remote branch regardless of what's there
- `--tags` — also push local tags that aren't yet on the remote
- `--delete <branch>` — delete a branch on the remote (equivalent to `git push <remote> :<branch>`)
- `--dry-run` — show what would be pushed without actually pushing

## Basic Example
```
git push origin main
```
Pushes your local `main` branch's new commits to `origin`, fast-forwarding the remote branch.

## Extended Example
```
git rebase -i HEAD~3
git push --force-with-lease origin feature/login
```
After rewriting history with an interactive rebase, a normal push is rejected because local and remote histories have diverged; `--force-with-lease` force-pushes the rewritten branch but first checks the remote-tracking ref still matches what you last fetched, aborting instead of clobbering a teammate's commits you haven't seen.

## Common Pitfalls
- Using plain `--force` on a shared branch — it overwrites the remote unconditionally and can silently discard a teammate's commits with no warning; `--force-with-lease` is the safer default habit, though it still isn't foolproof if you haven't fetched recently
- Pushing to the wrong remote after cloning a fork — `origin` is usually your fork, `upstream` is the original repo; pushing straight to `upstream main` out of habit is a common mistake (see [[git remote]])
- Forgetting `-u` on a brand-new branch's first push, then having plain `git push` fail with "no upstream branch" on every subsequent attempt until it's set

## Related Commands
- [[git pull]]
- [[git remote]]
- [[git rebase]]
