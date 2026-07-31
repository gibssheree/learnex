---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git status

**Definition:** Shows the current state of the working directory and staging area — what's changed, staged, or untracked.

## Syntax
```
git status [options]
```

## Common Options
- `-s` / `--short` — compact one-line-per-file output
- `-b` — show branch and tracking info even in short format

## Basic Example
```
git status
```
Lists modified, staged, and untracked files with full descriptions.

## Extended Example
```
git status -sb
```
Compact view showing the branch name plus short status codes (`M` modified, `A` added, `??` untracked) — fast to scan, good muscle memory before every commit.

## Common Pitfalls
- Not running it before committing, and accidentally committing unrelated files that happened to already be staged

## Related Commands
- [[git add]]
- [[git diff]]
