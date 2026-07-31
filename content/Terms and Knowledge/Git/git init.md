---
tags: [term, git, setup]
category: Setup & Configuration
---

# git init

**Definition:** Creates a new, empty Git repository in the current directory (or a specified path).

## Syntax
```
git init [<directory>]
```

## Common Options
- `--bare` — creates a repo with no working directory, used for shared/remote repos
- `-b <name>` / `--initial-branch=<name>` — sets the name of the initial branch (e.g. `main` instead of `master`)

## Basic Example
```
git init
```
Turns the current folder into a Git repo, creates a hidden `.git` folder.

## Extended Example
```
git init -b main my-project
```
Creates a new folder `my-project`, initializes it as a repo, and names the default branch `main` from the start.

## Common Pitfalls
- Running `git init` inside an existing repo's subfolder by accident, creating a confusing nested repo
- Forgetting to set the initial branch name, ending up with the legacy `master` default on older Git versions

## Related Commands
- [[git clone]]
- [[git config]]
