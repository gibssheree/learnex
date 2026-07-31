---
tags: [term, git, branching]
category: Branching & Merging
---

# git switch

**Definition:** A newer, dedicated command for switching branches, split out of [[git checkout]] to be less ambiguous and safer.

## Syntax
```
git switch <branch>
```

## Common Options
- `-c <new-branch>` — create and switch to a new branch (like `checkout -b`)
- `-` — switch back to the previously checked-out branch

## Basic Example
```
git switch develop
```
Switches to the `develop` branch.

## Extended Example
```
git switch -c feature/payments origin/main
```
Creates a new branch off the remote `main` and switches to it — same result as the `checkout -b` equivalent, but with a command that can't accidentally also touch files.

## Common Pitfalls
- Not being available on very old Git versions (introduced in Git 2.23), so some tutorials and CI images still only reference `checkout`

## Related Commands
- [[git checkout]]
- [[git branch]]
