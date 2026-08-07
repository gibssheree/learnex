---
tags: [term, git, branching]
category: Branching & Merging
---

# git switch

**Definition:** A newer, dedicated command for switching branches, split out of [[git checkout]] to be less ambiguous and safer.

## Syntax
```
git switch [<branch> | -c <new-branch> | -d <commit> | -]
```

## Common Options
- `-c <new-branch>` — create and switch to a new branch (like `checkout -b`)
- `-C <new-branch>` — same, but force-reset the branch if it already exists, discarding its previous tip
- `-d` / `--detach <commit>` — check out a specific commit or tag without attaching to a branch
- `-m` / `--merge` — perform a three-way merge of local changes into the new branch instead of requiring a clean working tree
- `-f` / `--discard-changes` — switch even if it would overwrite local modifications, discarding them
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

Inspecting an old release without disturbing your current branch:
```
git switch -d v1.4.2
# ...look around, build, test...
git switch -
```
The detached checkout drops you into a headless state (no branch, `HEAD` points straight at the commit) for read-only exploration, and `-` returns you to exactly where you were.

## Under the Hood
`git checkout` historically did two unrelated jobs through the same argument slot: switch which branch `HEAD` points to, *or* restore specific files from some tree-ish into the working directory or index — `git checkout <branch>` and `git checkout -- <file>` look similar but do completely different things. That ambiguity caused real mistakes: typing `git checkout main` when `main` had been deleted but a file named `main` existed would silently restore the file instead of erroring clearly.

`git switch` (and its sibling `git restore`) split this in two along that exact seam. `switch` only ever accepts a branch, commit, or tag as its target — it has no path-restoring behavior at all, so there's no argument-type ambiguity to resolve. Internally it still does the same thing `checkout` does when switching branches: update `HEAD`, update the index, and update working-tree files that differ between the old and new tip — nothing new mechanically, just a narrower, safer entry point.

## Flags Reference
| Flag | Effect |
|---|---|
| `-c <name>` | Create `<name>` and switch to it (errors if it already exists) |
| `-C <name>` | Create or reset-and-switch to `<name>` (silently overwrites existing branch tip) |
| `-d`, `--detach` | Check out a commit/tag directly, bypassing branch attachment |
| `-t`, `--track` | Set up upstream tracking when creating a branch from a remote ref |
| `--no-track` | Explicitly skip auto-tracking even if the name matches a remote branch |
| `-m`, `--merge` | Merge local uncommitted changes into the target branch's files rather than blocking the switch |
| `-f`, `--discard-changes` | Force the switch, throwing away conflicting local modifications |
| `-q`, `--quiet` | Suppress the usual "Switched to branch..." feedback |
| `-` | Shorthand for `@{-1}`, the previously checked-out branch |
| `--orphan <new-branch>` | Create a new branch with no parent history at all — an empty commit graph, useful for things like a `gh-pages` branch |
| `--recurse-submodules` | Also update submodule working trees to match the commit recorded on the branch being switched to |
| `--ignore-other-worktrees` | Allow checking out a branch even though it's technically checked out in another `git worktree` (overrides the normal lock) |

## Comparison
| | `git switch <branch>` | `git checkout <branch>` |
|---|---|---|
| Switches branches | yes | yes |
| Restores individual files | no (use `git restore`) | yes, ambiguous with branch names |
| Can detach HEAD | yes, requires explicit `-d` | yes, implicit if target isn't a branch |
| Introduced | Git 2.23 (2019) | present since Git's earliest versions |
| Safer for scripting | yes, narrower argument surface | no, argument type is inferred |

## Real-World Example
Bisecting manually without `git bisect`, using `switch -d` to hop between candidate commits while keeping the working directory otherwise clean:
```
git switch -d HEAD~20
npm test                # still failing
git switch -d HEAD~10
npm test                # passing
git switch -d HEAD~15
npm test                # narrow it down further...
```
Each `switch -d` leaves no branch behind and requires no cleanup — once the bad commit is found, `git switch main` (or `-`) returns cleanly with nothing left over from the detached hops. For anything beyond a handful of manual jumps, [[git bisect]] automates this same pattern with binary search.

## History
`git switch` and `git restore` were introduced together in Git 2.23 (August 2019) specifically to decompose `checkout`'s overloaded behavior. For several release cycles both commands' documentation carried an "experimental" notice warning that flag behavior could still change — that caveat has since been dropped, and both are considered stable, but it explains why older tutorials, some CI base images, and long-lived internal docs still only reference `checkout`.

## Common Workflow
Trunk-based development, where short-lived branches are the norm:
```
git switch main
git pull
git switch -c feature/rate-limit-headers
# ...work, commit...
git push -u origin feature/rate-limit-headers
# after review feedback, briefly check what main looks like now
git switch main
git pull
git switch feature/rate-limit-headers
git merge main
```
Because `switch` refuses to silently discard uncommitted work, this loop is safe to run even mid-edit — an unclean working tree with conflicting changes stops the switch outright rather than merging file states unexpectedly.

Cleaning up after a branch is merged:
```
git switch main
git pull
git branch -d feature/rate-limit-headers
git switch -
```
`git branch -d` refuses to delete a branch with unmerged commits, which pairs well with `switch`'s own refusal to discard work — both commands default to the safe outcome and require an explicit `-D`/`-f` to override.

## Gotchas Deep-Dive
`-m`/`--merge` is easy to reach for as a way to "just switch anyway," but it changes what happens to your uncommitted edits, not just whether the switch is allowed: Git performs a real three-way merge between the old branch's version of each file, your working-tree edits, and the new branch's version. If the new branch touched the same lines you have uncommitted changes on, you get conflict markers in your working tree immediately after switching — on a branch you may not have intended to bring unfinished work onto. For anything non-trivial, stashing first and popping after switching back is more predictable than relying on `-m`.

Detached HEAD from `-d` has a sharp edge: any commits made while detached are only reachable through the reflog once you switch away. `git switch -d abc123`, then a few commits, then `git switch main` without first running `git switch -c rescue-branch` leaves those commits dangling — recoverable via `git reflog` for a while, but not through any branch or tag, and eventually subject to garbage collection.

Switching branches doesn't touch files that are identical between the old and new tip, but it does touch every file that differs — on a large repo with a big divergence between branches, this can mean a noticeable pause and a lot of filesystem churn, which in turn can invalidate incremental build caches (webpack, TypeScript's `.tsbuildinfo`, etc.) that key off file mtimes.

`switch` also interacts with sparse checkouts in a way that's easy to miss: if `core.sparseCheckout` is enabled and the target branch's sparse-checkout patterns differ from the current one, files can appear or disappear from the working directory purely as a side effect of the branch switch, independent of whether that branch actually changed those files in its history.

## FAQ
**Does `git switch -c` push the new branch to the remote?** No — it only creates the branch locally. You still need `git push -u origin <branch>` to publish it and set up tracking.

**Can `git switch` check out a remote branch that doesn't have a local copy yet?** Yes — `git switch feature/x` will find `origin/feature/x` if there's an unambiguous match and create a local tracking branch automatically, equivalent to what `checkout` does in the same situation.

**Is `git switch` a full replacement for `git checkout`?** Only for the branch-switching half of `checkout`'s behavior. Restoring individual files, and some less common operations like checking out a path from a specific commit into the index, still belong to `checkout` or its other successor, `git restore`.

**What happens to submodules when I switch branches?** By default, nothing automatic — their working directories keep whatever commit they had checked out, which may now disagree with the gitlink SHA recorded on the new branch. Pass `--recurse-submodules`, or follow up with `git submodule update`, to bring them in line.

**Does `git switch` work the same way with tags as with branches?** You can target a tag, but since a tag doesn't move, Git treats it like any other non-branch commit — it detaches `HEAD` automatically without needing an explicit `-d`, because there's no branch to attach to in the first place.

**Does `switch -c` let me base a new branch on a specific commit instead of a branch name?** Yes — the starting point argument accepts any commit-ish: a branch, a tag, a raw SHA, or a relative expression like `HEAD~3`, so `git switch -c fix/regression HEAD~3` works exactly as expected.

## Common Pitfalls
- Not being available on very old Git versions (introduced in Git 2.23), so some tutorials and CI images still only reference `checkout`
- Confusing `-c` and `-C` — `-c` fails loudly if the branch exists, `-C` silently resets it to the new starting point, discarding any commits the old branch tip had that aren't otherwise reachable
- Expecting `git switch <path>` to restore a file like `checkout` sometimes did — it doesn't accept path arguments at all, so this just errors out (which is the intended safety improvement, but surprises muscle memory)
- Forgetting `-d` when you actually want a detached checkout of a commit SHA — `switch <sha>` without `-d` refuses, since Git assumes attaching to an arbitrary commit by accident is rarely what you want
- Assuming `switch -c` sets up remote tracking automatically for any name — it only auto-tracks when the new branch name unambiguously matches a single remote-tracking branch; otherwise pair it with `-t <remote>/<branch>` explicitly
- Relying on `-m` as a general-purpose "switch anyway" flag without expecting conflict markers — it merges, it doesn't discard
- Running `switch` inside a sparse checkout and being confused when files vanish or appear — that's the sparse-checkout patterns re-applying for the new branch, not file changes introduced by the switch itself
- Forgetting that `switch -c` from a starting point other than the current `HEAD` (e.g. `git switch -c fix origin/main`) bases the new branch on that starting point, not on whatever branch you were previously standing on
- Assuming `-` always resolves to something — on a fresh clone with only one branch ever checked out, there is no "previous" branch yet, and `git switch -` errors out rather than silently doing nothing

## Related Commands
- [[git checkout]]
- [[git branch]]
- [[git restore]]
- [[git log]]
