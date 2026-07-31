---
tags: [term, git, setup]
category: Setup & Configuration
---

# git config

**Definition:** Reads or sets configuration values for Git, at the system, global (user), or local (repo) level.

## Syntax
```
git config [--local|--global|--system] <key> <value>
```

## Common Options
- `--global` — applies to every repo for your user (e.g. name/email)
- `--local` — applies only to the current repo (default if run inside one)
- `--list` — show all currently set config values

## Basic Example
```
git config --global user.name "Gilbert"
git config --global user.email "you@example.com"
```
Sets your identity for every commit you make, in every repo.

## Extended Example
```
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
```
Creates shortcuts so `git co` works as `git checkout`, and `git lg` gives you a readable branch graph instantly.

## Common Pitfalls
- Setting user.name/email only locally in one repo and forgetting it doesn't apply elsewhere — commits show the wrong author in other repos

## Related Commands
- [[git init]]
