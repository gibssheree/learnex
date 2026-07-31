---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git add

**Definition:** Stages changes, new, modified, or deleted files, to be included in the next commit.

## Syntax
```
git add <file|pattern>
git add -p [<file>...]
```

## Common Options
- `-A` / `--all` — stage all changes in the whole repo (new, modified, deleted), regardless of current directory
- `.` — stage everything in the current directory and below (new and modified files, plus deletions in modern Git)
- `-u` / `--update` — stage modifications and deletions only for files Git already tracks; ignores new untracked files entirely
- `-p` / `--patch` — interactively choose specific chunks (hunks) of a file to stage, hunk by hunk
- `-N` / `--intent-to-add` — record that a new file will be added without staging its content yet, so it shows up in `git diff` instead of as untracked
- `-i` / `--interactive` — full interactive staging menu (status, update, patch, diff) in one prompt

## Basic Example
```
git add index.js
```
Stages just that one file.

## Extended Example
```
git add -p
# for each hunk: y (stage), n (skip), s (split into smaller hunks), q (quit)
git commit -m "Fix off-by-one in pagination"
git add -p
git commit -m "Add missing null check"
```
Walks through each changed chunk one at a time, letting you stage only part of a file's edits — splits one messy working session into several clean, focused commits instead of one commit that mixes unrelated changes.

## Common Pitfalls
- `git add .` accidentally staging files you meant to keep untracked, like a stray `.env`, because [[gitignore|.gitignore]] wasn't set up first
- Editing a file again after `git add`-ing it, then assuming the new edits are staged too — staging is a snapshot; further edits stay unstaged until you `git add` again
- Answering `y` to a hunk in `git add -p` that depends on a variable defined in a hunk you skipped, leaving the staged snapshot in a state that doesn't even compile
- Running `git add -A` from inside a subdirectory expecting it to behave like `.` — `-A` always targets the whole repo, not just the current path

## Related Commands
- [[git status]]
- [[git commit]]
- [[gitignore|.gitignore]]
