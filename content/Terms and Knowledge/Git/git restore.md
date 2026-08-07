---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git restore

**Definition:** A dedicated command, introduced in Git 2.23, for discarding working-directory or staged changes to files — split out of the overloaded [[git checkout]] to make file-restoring operations unambiguous.

## Syntax
```
git restore <file>
git restore --staged <file>
git restore --source <commit> <file>
git restore --staged --worktree <file>
git restore -p <file>
git restore .
```

## Common Options
- `--staged <file>` — unstage a file without touching its working-directory changes (the modern replacement for `git reset <file>`)
- `--worktree` — restore the working-directory copy (default behavior, explicit form used alongside `--staged`)
- `--source <commit> <file>` — restore a file's contents from a specific commit instead of just the last one
- `-p` / `--patch` — interactively choose which hunks of a file to restore, instead of the whole file
- `--ours` / `--theirs` — during a conflicted merge, restore a file to one side's version
- `.` — restore every changed file in the current directory and below

## Basic Example
```
git restore utils.js
```
Discards uncommitted working-directory changes to that file, reverting it to the last commit's version.

## Extended Example
```
git restore --staged --worktree app.js
git restore --source HEAD~2 config.json
```
The first command unstages `app.js` and discards its working-directory edits in one step, a full "forget everything I just did to this file"; the second restores `config.json` to how it looked two commits ago while leaving the rest of the working directory untouched.

## Under the Hood
`restore` always has two independent questions to answer: **which tree does it write to** (working tree, index, or both), and **which tree does it read from** (the source). The flags map directly onto those two questions:

- `--worktree` (implicit default) writes to the working directory.
- `--staged` writes to the index.
- Combine both flags to update both at once.

The source defaults differently depending on which target flags you pass:
- Plain `git restore <file>` (worktree only, default) reads from **the index**. If the file is staged, you get the staged version back in your working tree; if it's not staged, the index matches HEAD anyway, so you effectively get the last commit's version.
- `git restore --staged <file>` reads from **HEAD** by default — it resets the index entry for that file back to what's committed, i.e., unstages it.
- `--source <commit>` overrides the default source entirely, letting you pull a file's contents from any commit into either or both of the working tree and index.

This split is exactly what `git checkout -- <file>` and `git reset <file>` used to do conflated into one overloaded command. `restore` never touches HEAD or switches branches — that responsibility moved entirely to [[git switch]]. This separation of concerns (branch switching vs. file restoring vs. commit-pointer movement) is why Git 2.23 introduced both commands together.

## Flags Reference
| Flag | Effect |
|---|---|
| `--worktree` (default) | Write result to the working directory |
| `--staged` | Write result to the index (staging area) |
| `--staged --worktree` | Write result to both — full revert of a file to the source |
| `--source=<tree>` | Choose the commit/branch/tag to read from (default: index or HEAD, see above) |
| `-p`, `--patch` | Interactively select hunks rather than restoring the whole file |
| `--ours` / `--theirs` | Pick a side's version during an unresolved merge conflict |
| `-q`, `--quiet` | Suppress progress output |
| `--ignore-unmerged` | Silently skip unmerged paths instead of erroring |
| `--pathspec-from-file=<file>` | Read the list of paths to restore from a file instead of the command line |
| `--overlay` | Restore only paths present in the source, without removing paths absent from it (default is non-overlay, which does remove them) |

To see the effect of the two-flag combination concretely:
```
git status
#   modified:   config.json   (staged AND further modified — mixed state)
git restore config.json          # discards only the unstaged edit, staged version remains
git restore --staged config.json # unstages, but working tree still has the staged content
git restore --staged --worktree config.json  # full reset to HEAD, nothing staged or modified
```
Each command narrows the file's state by exactly one layer, which is easiest to reason about by checking `git status` between steps rather than trying to predict the combined effect in your head.

## Comparison
| Task | Old way | Modern way |
|---|---|---|
| Discard working-tree changes | `git checkout -- <file>` | `git restore <file>` |
| Unstage a file | `git reset <file>` | `git restore --staged <file>` |
| Pull a file from an old commit | `git checkout <commit> -- <file>` | `git restore --source <commit> <file>` |
| Switch branches | `git checkout <branch>` | `git switch <branch>` |

None of the "old way" commands were removed — they still work identically today — so existing scripts and muscle memory aren't broken by the split. The practical benefit of the modern commands is entirely about intent being obvious from the command name itself, which matters most in code review, documentation, and onboarding new engineers who haven't internalized `checkout`'s dual meaning yet.

## Gotchas Deep-Dive
During a merge conflict, plain `git restore <file>` doesn't have an obvious single "source" — the file has three relevant versions in play (the common ancestor, "ours," and "theirs"). `--ours` and `--theirs` resolve that ambiguity explicitly: `git restore --ours <file>` takes your current branch's version of the conflicting file, `git restore --theirs <file>` takes the incoming branch's version, either way skipping manual conflict-marker editing entirely for that file. This only works while a conflict is actually in progress — the flags are meaningless on a clean working tree since there's no "ours vs theirs" distinction to resolve.

`git restore` and `git stash` overlap in intent but not in mechanism: `git stash` moves changes *out* of the working tree into a separate stash entry for later reapplication, while `restore` simply discards them against a source and doesn't retain a copy anywhere. If there's any chance the changes being restored are worth keeping, `git stash` first is the reversible move — `restore` typically isn't recoverable unless the discarded content happened to already be staged (and therefore briefly existed as a blob object Git can still find via `git fsck --lost-found`).

Sparse checkouts add another wrinkle: `git restore` respects `core.sparseCheckoutCone` patterns, so restoring a path outside the configured sparse-checkout cone silently does nothing to the working tree (the file isn't materialized there) even though the index entry may still update. This surprises people migrating large repos to sparse/partial clones who expect `restore` to behave identically to a full checkout.

## Common Workflow
Recovering from a botched `git add .` where you staged more than you meant to, while keeping the actual edits:
```
git status                              # see what's staged
git restore --staged .                  # unstage everything
git add src/                            # re-stage only what you meant
git commit -m "Refactor auth module"
```
Nothing here touches the working directory — the edits stay exactly as typed, only the index selection changes.

## Restoring Deleted Files
`git restore` also un-deletes a tracked file that was removed with a plain `rm` (or [[git rm]]) but not yet committed — since the deletion is just another kind of "working-tree change" from restore's point of view:
```
rm important-config.yml
git status
#   deleted:    important-config.yml
git restore important-config.yml
```
This brings the file back exactly as it was in the index, with zero difference from restoring a modified file — deletion, modification, and content changes are all just "working tree differs from source" as far as `restore` is concerned. If the deletion was already staged (via `git rm` or `git add`), add `--staged` too to reverse both layers.

## Common Pitfalls
- Confusing plain `git restore <file>` (discards working changes, destructive) with `git restore --staged <file>` (only unstages, keeps your edits intact) — the flag completely changes what's at risk
- Expecting `git restore` to switch branches — it only ever touches files, branch switching is [[git switch]]'s job now
- Running it without `--source` on a file that's both staged and modified further, then being surprised which version comes back — plain `git restore <file>` pulls from the index, so it restores the *staged* version, discarding only the unstaged edits on top, not everything. Check `git status` first to know exactly which state you're restoring from
- Assuming `git restore .` only affects the current directory recursively but forgetting it silently skips untracked files — new files aren't "restored" because there's nothing to restore them from; use [[git clean]] for those
- Not realizing `--staged` alone leaves working-directory edits in place — a common assumption is that unstaging also reverts the file, but it doesn't unless `--worktree` is added too

## FAQ
**Does `git restore` work on untracked files?** No. It only operates on files Git already knows about (tracked in the index or a commit). Untracked files need [[git clean]] to remove, or `git add` to start tracking.

**What happened to `git checkout -- <file>`?** It still works — Git kept it for backward compatibility — but `git restore` is the recommended command going forward since `checkout`'s dual role (switching branches and restoring files) was a frequent source of confusion and even mistakes like accidentally discarding changes when you meant to switch branches.

**Can I restore just part of a file?** Yes, `git restore -p <file>` walks through each changed hunk and asks whether to restore it, letting you selectively discard some edits while keeping others.

**Is `git restore` considered stable, or still experimental?** It shipped alongside `git switch` in Git 2.23 (2019) explicitly marked experimental, since the Git project wanted room to adjust the UI based on feedback before committing to it permanently. As of recent Git versions both commands are considered stable and safe for daily use and scripting, though a small number of edge-case flag names changed between 2.23 and later releases.

**Why did Git split `checkout` into `switch` and `restore` at all?** `git checkout` historically did two unrelated things depending on its argument — pass a branch name and it switches branches; pass a file path and it discards changes to that file. That overload was a well-known source of costly mistakes: typing `git checkout` with a mistyped or ambiguous argument could switch branches when you meant to discard a file's edits, or vice versa. Splitting the responsibilities makes each command's blast radius unambiguous from its name alone.

## Common Interview Questions
**"How does `git restore` differ from `git checkout -- <file>`?"** They're functionally equivalent for the simplest case (discard working-directory changes to a tracked file), but `restore` was purpose-built to remove `checkout`'s ambiguity between file operations and branch switching. `restore` never accepts a branch name as its main argument the way `checkout` does, so there's no risk of a typo silently doing the wrong kind of operation.

**"What does `git restore --staged <file>` actually change?" ** Only the index entry for that file, resetting it to match HEAD (or whatever `--source` specifies). Nothing in the working directory changes — a file that was both staged and further modified keeps its unstaged edits exactly as they were; only the staged snapshot reverts.

**"How would you discard all uncommitted changes in a repo, tracked and untracked?"** `git restore .` clears tracked working-directory changes back to the index; it does not touch untracked files. Untracked files need [[git clean]] (`git clean -fd` for files and directories) run separately, since `restore` operates purely on paths Git already has index entries for.

## Real-World Example
Resolving a merge conflict by picking one side wholesale for a generated/lock file that shouldn't be manually merged:
```
git merge feature-branch
# CONFLICT (content): Merge conflict in package-lock.json
git restore --theirs package-lock.json
git add package-lock.json
git commit
```
Lock files are a common case where line-by-line conflict resolution is pointless — regenerating or accepting one side wholesale and letting the package manager reconcile it afterward is more reliable than hand-editing merge markers in a machine-generated file.

**What's the safest way to preview what `git restore` would discard before running it?** `git diff <file>` (for working-tree changes) or `git diff --staged <file>` (for staged changes) shows exactly what would be lost, since `restore` itself has no `--dry-run` flag — unlike `git rm -n` or `git clean -n`, there's no built-in preview mode, so checking with `diff` first is the closest equivalent.

## Related Commands
- [[git checkout]]
- [[git reset]]
- [[git status]]
- [[git switch]]
- [[git clean]]
