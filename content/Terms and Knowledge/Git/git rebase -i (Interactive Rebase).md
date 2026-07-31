---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git rebase -i (Interactive Rebase)

**Definition:** Opens an editable to-do list of a range of past commits, letting you reorder, reword, squash, split, or drop them before that history is shared — the main tool for turning messy local commits into a coherent story.

## Syntax
```
git rebase -i <commit>
git rebase -i --root
```
(`<commit>` is usually `HEAD~n` or a branch name; `--root` rebases all the way back to the very first commit)

## Common Options (actions inside the interactive editor)
- `pick` / `p` — keep the commit as-is
- `reword` / `r` — keep the commit's changes but stop to edit its message
- `edit` / `e` — stop at this commit so you can amend its contents, then run `git rebase --continue`
- `squash` / `s` — merge this commit into the previous one, combining both commit messages for editing
- `fixup` / `f` — like squash, but silently discard this commit's message
- `drop` / `d` — remove the commit entirely (or just delete its line from the list)
- `exec` / `x <cmd>` — run a shell command after that commit is applied, e.g. to run tests at each step

## Basic Example
```
git rebase -i HEAD~3
```
Opens an editor listing your last 3 commits, oldest first, so you can reorder, squash, or reword them before continuing.

## Extended Example
```
git rebase -i HEAD~4
```
```
pick a1b2c3d Add login form
fixup 4d5e6f7 wip
fixup 7a8b9c0 wip again
reword d1e2f3a Add password reset flow
```
Marking two "wip" commits as `fixup` collapses them silently into the first commit, and `reword` pauses the rebase to let you rewrite the fourth commit's message — the result is two clean, well-described commits instead of four, exactly what you want before opening a pull request.

## Common Pitfalls
- Doing this on commits already pushed to a shared branch — same rule as regular rebase, it rewrites commit hashes and breaks history for anyone who already pulled the old commits, forcing them into a manual recovery
- Reordering commits that depend on each other — moving a commit above the one that introduced the file it edits produces a conflict or a broken intermediate state
- Aborting halfway through with Ctrl-C instead of `git rebase --abort` — leaves the repo in a half-rebased, detached state; always use `--abort` to cleanly bail out
- Losing track of dropped commits — they aren't gone forever, they're recoverable via [[git reflog]] until it expires, but only if you notice quickly

## Related Commands
- [[git rebase]]
- [[git commit --amend]]
- [[git reflog]]
