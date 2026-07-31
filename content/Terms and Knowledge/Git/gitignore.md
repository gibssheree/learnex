---
tags: [term, git, setup]
category: Setup & Configuration
---

# .gitignore

**Definition:** A file listing patterns for files and folders Git should never track or show as untracked.

## Syntax
Not a command — a plain text file of patterns, one per line:
```
node_modules/
*.log
.env
```

## Common Options (pattern rules)
- `*` — matches anything except `/`
- `**/` — matches directories at any depth
- `!pattern` — negates/re-includes a previously ignored pattern
- Trailing `/` — matches directories only

## Basic Example
```
node_modules/
```
Ignores the entire dependency folder from ever being tracked.

## Extended Example
```
*.log
!important.log
build/
.env*
!.env.example
```
Ignores all `.log` files except `important.log`, ignores the `build/` folder, and ignores all `.env*` files except the example template.

## Common Pitfalls
- Adding a file to `.gitignore` after it's already been committed — it stays tracked until you explicitly run `git rm --cached` on it

## Related Commands
- [[git rm]]
- [[git status]]
