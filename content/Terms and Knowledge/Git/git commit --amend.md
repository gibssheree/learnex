---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git commit --amend

**Definition:** Replaces the most recent commit with a new one, either changing its message, its contents, or both.

## Syntax
```
git commit --amend [-m "<new message>"]
```

## Common Options
- `--no-edit` — keep the existing commit message, only change the staged content
- `-m "<message>"` — replace the commit message entirely

## Basic Example
```
git commit --amend -m "Fix typo in login validation"
```
Replaces the last commit's message.

## Extended Example
```
git add forgotten-file.js
git commit --amend --no-edit
```
You realize you forgot to include a file in the last commit, so you stage it and fold it into that same commit without changing the message.

## Common Pitfalls
- Amending a commit that's already been pushed and pulled by others — like rebase, it rewrites history, so it's only safe on commits nobody else has based work on yet

## Related Commands
- [[git commit]]
- [[git rebase]]
