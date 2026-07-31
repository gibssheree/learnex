---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git remote

**Definition:** Manages the set of remote repositories, such as GitHub or GitLab URLs, that your local repo is connected to and can fetch from or push to.

## Syntax
```
git remote [-v]
git remote add <name> <url>
git remote remove <name>
git remote rename <old> <new>
git remote set-url <name> <new-url>
```

## Common Options
- `-v` / `--verbose` — show remote names with both their fetch and push URLs
- `add <name> <url>` — connect a new remote under a given name
- `remove <name>` — disconnect a remote entirely (also drops its remote-tracking branches)
- `rename <old> <new>` — rename a remote, updating its remote-tracking branch namespace too
- `set-url <name> <url>` — change an existing remote's URL, e.g. switching from HTTPS to SSH
- `show <name>` — show detailed info about a remote, including which local branches track it

## Basic Example
```
git remote -v
```
Lists all configured remotes and their URLs for both fetch and push.

## Extended Example
```
git remote add upstream https://github.com/original-owner/repo.git
git fetch upstream
git rebase upstream/main
```
Adds a second remote named `upstream`, the standard setup for contributing to a forked open-source repo, then syncs your fork's local `main` with the original project's latest commits before opening a pull request (your fork stays `origin`, the original repo becomes `upstream`).

## Common Pitfalls
- Confusing `origin` (your default remote, usually your own fork) with `upstream` (someone else's repo you forked from), and pushing to the wrong one
- Changing a remote's URL with `set-url` after switching auth methods (HTTPS to SSH) and forgetting that existing clones on other machines still point at the old URL
- Deleting a remote with `remove` and being surprised its remote-tracking branches (`<remote>/<branch>`) vanish too, even though local branches based on them stay intact

## Related Commands
- [[git clone]]
- [[git fetch]]
- [[git push]]
