---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git mv

**Definition:** Moves or renames a tracked file and stages that change in a single step, equivalent to running a plain `mv` followed by `git rm --cached` and `git add`.

## Syntax
```
git mv <source> <destination>
git mv -f <source> <destination>
git mv <source>... <directory>
```

## Common Options
- `-f` / `--force` — overwrite an existing file at the destination instead of refusing
- `-n` / `--dry-run` — show what would be renamed/moved without doing it
- `-k` — skip files that would produce an error instead of aborting the whole operation
- `<source>... <directory>` — move multiple files into a target directory in one call

## Basic Example
```
git mv old-name.js new-name.js
```
Renames the file on disk and stages it as a rename in one command.

## Extended Example
```
git mv src/utils.js src/helpers/utils.js
git mv src/helpers/*.spec.js src/helpers/__tests__/
git status
```
Moves a file into a new subfolder, then bulk-moves matching test files into a `__tests__` directory — `git status` then shows both as `renamed:` rather than a delete plus an untracked add, so reviewers see intent instead of noise in the diff.

## Common Pitfalls
- Using the OS file explorer or a plain shell `mv` instead — Git's similarity-index heuristic (roughly 50% content match by default) usually still detects it as a rename on the next `git add`/`commit`, but only if the content didn't change too much; `git mv` guarantees it's tracked as a rename immediately
- Running it on a file with uncommitted content edits mixed into the same move — the rename and the content change land in the same diff, making it harder for a reviewer to see what actually changed
- Forgetting the destination must not already exist unless `-f` is passed — Git refuses rather than silently clobbering a tracked file

## Related Commands
- [[git add]]
- [[git rm]]
- [[git status]]
