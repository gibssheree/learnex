---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git show

**Definition:** Displays detailed information, metadata plus diff, about a single commit, tag, or other Git object.

## Syntax
```
git show <commit|tag>
```

## Common Options
- `--stat` — show just a summary of files changed, not the full diff

## Basic Example
```
git show a1b2c3d
```
Shows the full diff and metadata for that commit.

## Extended Example
```
git show HEAD~2 --stat
```
Shows a summary of what changed 2 commits ago, without the full line-by-line diff — quick for a high-level check.

## Common Pitfalls
- Confusing it with `git diff` — `git show` looks at one commit's own changes, `git diff` compares two arbitrary points

## Related Commands
- [[git log]]
- [[git diff]]
