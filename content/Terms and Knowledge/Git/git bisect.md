---
tags: [term, git, advanced, debugging]
category: Advanced & Internals
---

# git bisect

**Definition:** Uses binary search across your commit history to automatically find the exact commit that introduced a bug.

## Syntax
```
git bisect start
git bisect bad [<commit>]
git bisect good <commit>
git bisect run <script>
git bisect reset
```

## Common Options
- `start [<bad> [<good>...]]` — begin a bisect session; optionally pass the bad and good commits directly instead of marking them in separate steps
- `bad` / `good` — mark the current (or a given) commit as broken or working; Git jumps to the midpoint each time
- `skip` — mark the current commit as untestable (doesn't build, unrelated breakage) without calling it good or bad; Git picks a different midpoint
- `run <script>` — automate the whole process with a script that exits `0` for good, a non-zero non-125 code for bad, and `125` to skip
- `log` / `replay <file>` — save or replay a bisect session, useful for handing the search off to a teammate
- `reset` — end the session, clear the bisect state, and return to the branch you started on

## Basic Example
```
git bisect start
git bisect bad
git bisect good v1.0
```
Git checks out the midpoint commit between the known-bad current state and the known-good `v1.0` tag, for you to test next; repeat `git bisect good`/`bad` on each checkout until Git names the first bad commit.

## Extended Example
```
git bisect start HEAD v1.0
git bisect run npm test
git bisect reset
```
Fully automates the search — Git checks out each candidate commit, runs `npm test`, reads its exit code to decide good/bad/skip, and narrows down to the exact breaking commit without any manual testing; `reset` afterward restores the original branch and working tree.

## Common Pitfalls
- Forgetting to run `git bisect reset` at the end, leaving your repo in a detached-HEAD state left over from the bisect process
- A flaky test giving a wrong good/bad answer on one step — throws off the entire binary search and lands on the wrong commit; re-run suspicious results before trusting them
- Bisecting through commits that don't build (broken WIP commits, mid-refactor snapshots) without using `skip` — a build failure gets misread as "bad" for the wrong reason
- Marking `good`/`bad` against the wrong branch tip, so the bisect range doesn't actually contain the regression, and the search finishes without a real answer

## Related Commands
- [[git log]]
- [[git reflog]]
