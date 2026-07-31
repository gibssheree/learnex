---
tags: [term, git, advanced, recovery]
category: Advanced & Internals
---

# git reflog

**Definition:** Shows a chronological log of everywhere `HEAD` and branch tips have pointed locally, including commits no longer reachable from any branch — Git's built-in safety net for undoing almost any local mistake.

## Syntax
```
git reflog
git reflog show <branch>
git reflog expire --expire=<time>
```

## Common Options
- `show <branch>` — see the reflog for a specific branch's ref, not just `HEAD`
- `--relative-date` — show human-readable relative timestamps ("2 hours ago") instead of just entry numbers
- `expire --expire=now --all` — manually force-expire entries immediately (rarely needed, mostly used just before `git gc`)
- `HEAD@{n}` — reference syntax for "where HEAD was n moves ago," usable anywhere a commit is expected

## Basic Example
```
git reflog
```
Lists recent HEAD movements with short hashes and the action that caused each one (`commit`, `checkout`, `rebase`, `reset`, etc.), letting you find a commit you thought you lost.

## Extended Example
```
git reset --hard HEAD~5   # oops, meant HEAD~1
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~5
# e4f5g6h HEAD@{1}: commit: Fix payment bug
git reset --hard HEAD@{1}
```
After an accidental hard reset wipes commits off the branch tip, `git reflog` shows `HEAD@{1}` as the position right before the mistake; resetting to that reflog entry restores the branch exactly, as if the bad reset never happened.

## Common Pitfalls
- Assuming reflog is permanent — entries expire eventually (90 days for reachable commits, 30 days for unreachable ones by default), and it's entirely local, never pushed to a remote, so it's a personal safety net, not a backup
- Confusing reflog entries with commit history — `HEAD@{2}` means "2 HEAD movements ago," not "2 commits ago," and includes checkouts, rebases, and resets, not just commits
- Waiting too long after a mistake — a `git gc` run can prune expired unreachable objects, after which reflog can no longer help even if the entry is still technically listed

## Related Commands
- [[git reset]]
- [[git bisect]]
- [[git rebase -i (Interactive Rebase)]]
