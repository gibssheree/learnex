---
tags: [moc, term, git]
---

# Git Terms MOC

37 Git commands across 10 categories. Each note has: syntax, common options explained, a basic example, an extended real-world example, common pitfalls, and related commands.

## Setup & Configuration
- [[git init]]
- [[git clone]]
- [[git config]]
- [[gitignore|.gitignore]]

## Basic Snapshotting
- [[git status]]
- [[git add]]
- [[git commit]]
- [[git rm]]
- [[git mv]]

## Inspecting & Comparing
- [[git diff]]
- [[git log]]
- [[git show]]
- [[git blame]]

## Branching & Merging
- [[git branch]]
- [[git checkout]]
- [[git switch]]
- [[git merge]]
- [[git rebase]]

## Remote & Collaboration
- [[git remote]]
- [[git fetch]]
- [[git pull]]
- [[git push]]

## Undoing & Rewriting History
- [[git reset]]
- [[git revert]]
- [[git restore]]
- [[git clean]]
- [[git commit --amend]]
- [[git rebase -i (Interactive Rebase)]]

## Stashing
- [[git stash]]

## Tagging & Releases
- [[git tag]]

## Advanced & Internals
- [[git cherry-pick]]
- [[git bisect]]
- [[git reflog]]
- [[git submodule]]
- [[git worktree]]
- [[git gc]]

## Hooks & Automation
- [[Git Hooks]]

---

## How to use this
Use it as a lookup, not a read-front-to-back reference. When a tutorial or job posting mentions a command you don't recognize, check here first.

## Suggested order if starting from zero
1. **git init → git add → git commit → git status → git diff** — the absolute daily loop
2. **git branch → git checkout/switch → git merge** — working with more than one line of work
3. **git remote → git fetch → git pull → git push** — working with GitHub/GitLab
4. **git log → git stash → git rebase** — once the basics are automatic
5. **git reset vs git revert vs git restore** — learn these together, they're constantly confused with each other
6. Everything in **Advanced & Internals** — only when you actually hit the problem it solves (lost commit, need to bisect a bug, etc.), not before

## Related
- [[CI-CD|CI/CD]] and [[Git Hooks]] connect Git to your deployment pipeline
- [[Semantic Versioning]] pairs with [[git tag]] for releases
