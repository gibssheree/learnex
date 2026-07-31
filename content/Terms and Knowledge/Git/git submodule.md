---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git submodule

**Definition:** Embeds another Git repository as a subdirectory inside your repo, pinned to a specific commit.

## Syntax
```
git submodule add <url> <path>
```

## Common Options
- `add <url>` — add a new submodule
- `update --init --recursive` — after cloning a repo with submodules, actually pull down their content
- `foreach <command>` — run a command inside every submodule

## Basic Example
```
git submodule add https://github.com/org/shared-lib.git libs/shared
```
Adds another repo as a subfolder, pinned to its current commit.

## Extended Example
```
git clone --recurse-submodules <url>
```
Or, after a normal clone: `git submodule update --init --recursive` — the two-step dance needed because submodules don't come along automatically with a plain clone.

## Common Pitfalls
- Forgetting the `update --init` step after cloning, ending up with empty submodule folders and confusing missing-file errors

## Related Commands
- [[git clone]]
