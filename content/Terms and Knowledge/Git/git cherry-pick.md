---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git cherry-pick

**Definition:** Applies one specific commit from another branch onto your current branch, without merging the whole branch.

## Syntax
```
git cherry-pick <commit-hash>
git cherry-pick <commit1>..<commit2>
```

## Common Options
- `-n` / `--no-commit` — apply the changes but don't auto-commit, so you can adjust or squash with other picks first
- `-x` — append a "(cherry picked from commit ...)" line to the commit message recording which commit it came from
- `-e` / `--edit` — open an editor to modify the commit message before committing
- `-m <parent-number>` — required when cherry-picking a merge commit; specifies which parent to diff against (usually `-m 1` for the mainline)
- `--continue` / `--abort` / `--skip` — resume after resolving a conflict, cancel the whole operation, or skip the current commit when cherry-picking a range

## Basic Example
```
git cherry-pick a1b2c3d
```
Applies just that one commit onto your current branch, creating a new commit with a new hash.

## Extended Example
```
git cherry-pick a1b2c3d^..d4e5f6g
# on conflict:
git status
# fix the conflicted file, then
git add <file>
git cherry-pick --continue
```
Cherry-picks an entire range of consecutive commits, from just before the first through the last, onto the current branch, resolving conflicts one commit at a time — useful for pulling a small set of related fixes without a full merge.

## Common Pitfalls
- Cherry-picking a commit that depends on earlier context not present on your branch, causing conflicts a normal merge wouldn't have hit
- Cherry-picking a merge commit without `-m <parent-number>` — Git errors out because it doesn't know which parent's changes to apply
- Cherry-picking the same commit onto a branch that later gets merged with the original — Git usually detects the identical patch and skips it silently, but if the picked commit was edited first, the merge can reintroduce the change as a conflict
- Forgetting `-x` when the origin matters for later auditing — without it, there's no trace in the message of where the commit originally came from

## Related Commands
- [[git merge]]
- [[git rebase]]
