---
tags: [term, git, automation]
category: Hooks & Automation
---

# Git Hooks

**Definition:** Scripts Git automatically runs at specific points in the workflow, like before a commit or before a push, used to enforce checks or automate tasks.

## Syntax
Not a command — executable script files inside a repo's hooks folder, named after the event they run on, with no file extension:
```
.git/hooks/pre-commit
.git/hooks/prepare-commit-msg
.git/hooks/commit-msg
.git/hooks/post-commit
.git/hooks/pre-push
.git/hooks/post-checkout
.git/hooks/post-merge
```
Each file needs a shebang (`#!/bin/sh`, `#!/usr/bin/env node`, etc.) and, on Unix/macOS, execute permission (`chmod +x`).

## Common Options (common hook names)
- `pre-commit` — runs before the commit message editor opens; takes no arguments; a non-zero exit aborts the commit. Common for linting/formatting/tests
- `prepare-commit-msg` — runs before the editor opens but after the default message is generated; useful for auto-inserting a ticket number parsed from the branch name
- `commit-msg` — runs after the message is written, receives the message file path as `$1`; can validate format (e.g. Conventional Commits) and reject with a non-zero exit
- `post-commit` — runs after the commit is created; can't abort anything, just for notifications/side effects
- `pre-push` — runs before pushing, receives the remote name/URL and reads the refs being pushed from stdin; common for running the full test suite first
- `pre-rebase` — runs before a rebase starts; can be used to block rebasing protected branches
- `post-checkout` / `post-merge` — run after a branch switch or a merge/pull; common for reinstalling dependencies when `package-lock.json` changed

## Basic Example
```sh
#!/bin/sh
# .git/hooks/pre-commit
npx eslint . || exit 1
```
A minimal `pre-commit` hook: runs the linter, and a non-zero exit code blocks the commit entirely — Git prints the hook's output and refuses to proceed.

## Extended Example
```
npm install husky --save-dev
npx husky init
echo "npx lint-staged" > .husky/pre-commit
git add .husky/pre-commit package.json
git commit -m "Add pre-commit lint hook via Husky"
```
Raw `.git/hooks/` scripts aren't version-controlled or shared automatically, so a hook manager like Husky (Node) or the `pre-commit` framework (Python) stores the hook definitions in a tracked file (`.husky/`, `.pre-commit-config.yaml`) and installs them into every teammate's `.git/hooks/` automatically on `npm install` / `pre-commit install`, so everyone gets the same checks.

## Common Pitfalls
- Writing a raw hook script directly in `.git/hooks/` and assuming it's shared with the team — that folder isn't tracked by Git at all, it's local-only unless you use a hook-management tool
- Forgetting `chmod +x` on a hand-written hook script on Unix/macOS — Git silently skips non-executable hooks instead of raising an error
- Bypassing hooks entirely with `git commit --no-verify` or `git push --no-verify` — useful in a real emergency, but easy to forget you did it and ship something the hook would have caught
- Writing a slow `pre-commit` hook (e.g. running the full test suite on every commit) that everyone starts skipping out of frustration; keep `pre-commit` fast and push heavier checks to `pre-push` or CI

## Related Commands
- [[git commit]]
- [[git commit --amend]]
- [[CI-CD|CI/CD]]
