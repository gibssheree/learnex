---
tags: [term, git, setup]
category: Setup & Configuration
---

# git clone

**Definition:** Copies an existing remote repository, and its full history, to your local machine.

## Syntax
```
git clone <url> [<directory>]
```

## Common Options
- `--depth <n>` — shallow clone, only fetch the last n commits, much faster for huge repos
- `-b <branch>` — clone and check out a specific branch instead of the default
- `--recurse-submodules` — also clones any submodules the repo references

## Basic Example
```
git clone https://github.com/user/repo.git
```
Downloads the repo into a folder named `repo`.

## Extended Example
```
git clone --depth 1 -b develop https://github.com/user/repo.git my-copy
```
Shallow-clones only the `develop` branch's latest commit into a folder named `my-copy` — much faster when you don't need full history.

## Common Pitfalls
- Using `--depth` then later needing full history for `git blame` or `git log` investigation — you have to un-shallow it with `git fetch --unshallow`

## Related Commands
- [[git init]]
- [[git remote]]
