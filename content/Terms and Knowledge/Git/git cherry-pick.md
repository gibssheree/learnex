---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git cherry-pick

**Definition:** Applies one specific commit from another branch onto your current branch, without merging the whole branch.

## Syntax
```
git cherry-pick <commit-hash>
git cherry-pick <commit1>..<commit2>
```

## Common Options
- `-n` / `--no-commit` — apply the changes but don't auto-commit, so you can adjust or squash with other picks first
- `-x` — append a "(cherry picked from commit ...)" line to the commit message recording which commit it came from
- `-e` / `--edit` — open an editor to modify the commit message before committing
- `-m <parent-number>` — required when cherry-picking a merge commit; specifies which parent to diff against (usually `-m 1` for the mainline)
- `--continue` / `--abort` / `--skip` — resume after resolving a conflict, cancel the whole operation, or skip the current commit when cherry-picking a range

## Basic Example
```
git cherry-pick a1b2c3d
```
Applies just that one commit onto your current branch, creating a new commit with a new hash.

## Extended Example
```
git cherry-pick a1b2c3d^..d4e5f6g
# on conflict:
git status
# fix the conflicted file, then
git add <file>
git cherry-pick --continue
```
Cherry-picks an entire range of consecutive commits, from just before the first through the last, onto the current branch, resolving conflicts one commit at a time — useful for pulling a small set of related fixes without a full merge.

## Under the Hood
A cherry-pick is, mechanically, the same three-way merge machinery Git uses everywhere else, just applied to a single commit's diff instead of an entire branch history. Git computes the diff between the picked commit and *its own parent*, then applies that diff to your current `HEAD` as a patch, using the picked commit's parent as the merge base. If your current code around those lines matches what the original parent looked like, the patch applies cleanly; if it's diverged, you get the familiar `<<<<<<<`/`=======`/`>>>>>>>` conflict markers, resolved the same way as a merge or rebase conflict.

Critically, the result is a brand-new commit object with a brand-new SHA — same author, same message (by default), same diff content, but a different parent and therefore a different hash. This is why cherry-picking the same logical change onto two branches that later merge can look, from Git's perspective, like two unrelated commits that happen to produce identical content — the patch-id matching logic (used by `git log --cherry-mark` and the "Git usually detects the identical patch" behavior on merge) is a heuristic layered on top, not a guarantee.

For merge commits, there's no single "parent diff" — a merge has two or more parents, so Git needs `-m <n>` to know which parent's tree to diff against to produce the change to apply.

## Flags Reference
| Flag | Effect |
|---|---|
| `-n`, `--no-commit` | Apply changes to index/working tree without committing |
| `-x` | Append "(cherry picked from commit ...)" trailer |
| `-e`, `--edit` | Edit the commit message before finalizing |
| `-s`, `--signoff` | Add a `Signed-off-by` trailer |
| `-m <n>` | Pick parent number `n` when the commit is a merge |
| `--strategy=<s>` / `-X <option>` | Use a specific merge strategy or strategy option (e.g. `-X theirs`) |
| `--continue` | Resume after resolving conflicts and staging fixes |
| `--abort` | Cancel the cherry-pick, restore pre-pick state |
| `--skip` | Skip the current commit and move to the next in a range pick |
| `--allow-empty` | Keep an empty commit if the patch ends up producing no changes |
| `--ff` | Fast-forward if cherry-picking onto the pick's own parent, instead of always creating a new commit |
| `--quit` | Stop the current cherry-pick sequence but keep commits already applied |
| `-S[<keyid>]` | GPG-sign the resulting commit(s) |
| `--rerere-autoupdate` | Auto-stage conflict resolutions recorded by `rerere` from a previous identical conflict |
| `--keep-redundant-commits` | Keep commits that end up empty instead of dropping them silently |

## Common Workflow
Backporting a security fix from `main` to a maintenance branch for an older release, without dragging in unrelated `main` history:
```
git log --oneline main -- src/auth.js | head    # find the fix commit
git switch release/2.4
git cherry-pick -x a1b2c3d                       # -x records provenance for the changelog
# suppose it conflicts because release/2.4 lacks a later refactor:
git status
# resolve src/auth.js manually
git add src/auth.js
git cherry-pick --continue
git push origin release/2.4
```
`-x` matters here specifically for audit trails: months later, `git log` on `release/2.4` will show exactly which `main` commit this fix originated from.

## Comparison
| | `git cherry-pick` | [[git rebase]] |
|---|---|---|
| Scope | One commit (or explicit range) | An entire sequence of commits onto a new base |
| Typical use | Backport/forward-port a specific fix | Move a whole branch's history onto updated upstream |
| Result | New commit(s), original branch untouched | Current branch's commits rewritten in place |
| Merge commits | Needs `-m <parent>` to pick one | Handled automatically (or dropped, depending on flags) |

## History
- Cherry-picking predates Git itself as a version-control concept (it existed in tools like Perforce and Mercurial too); Git's implementation has been stable since early releases because it's a thin layer over the same three-way merge machinery used everywhere else.
- `-x` (record provenance) was added specifically for release-branch workflows, where maintainers need an audit trail of exactly which upstream commit a backport came from, visible directly in `git log` without cross-referencing anything external.
- `--allow-empty` was added to accommodate cherry-picks that legitimately produce no diff (e.g. the change was already applied through another path) but should still be recorded as a commit for tracking purposes, rather than being silently dropped.
- The `git cherry` command (list unpicked commits by patch-id) predates `cherry-pick`'s modern flag set and remains a separate, lower-level tool most people never call directly — most workflows now rely on merge/rebase tooling to detect already-applied patches instead.

## Real-World Example
Porting a single bugfix from a feature branch into a hotfix branch that needs to ship independently, without cherry-picking the feature's other in-progress commits:
```
git log --oneline feature/new-checkout       # find the fix among several WIP commits
# a1b2c3d Fix double-charge on retry
# 9f8e7d6 WIP: new checkout layout
# 4c5b6a7 WIP: payment form validation
git switch -c hotfix/double-charge main
git cherry-pick -x -n a1b2c3d                # apply without auto-committing
git status                                    # review exactly what's staged
git commit -m "Fix double-charge on payment retry"
git push origin -u hotfix/double-charge
```
`-n` here is deliberate: it lets you review the staged diff with `git status`/`git diff --cached` before committing, useful when you want to double check the picked commit didn't drag in anything unintended, or want to combine it with an additional small fix before committing.

## Gotchas Deep-Dive
- **Author vs. committer metadata.** A cherry-picked commit keeps the original author and author date, but gets a new committer (you) and new committer date — `git log --format=fuller` shows both, which can look confusing until you know cherry-pick preserves authorship but not the act of committing.
- **Cherry-picking across unrelated histories.** If the source and destination branches diverged far enough back that surrounding code looks nothing alike, Git's three-way merge can produce a technically-successful but semantically wrong result — no conflict markers appear, but the applied change may not make sense in the new context. Always review the diff after a pick, not just after a conflict.
- **`--no-commit` leaving stray state.** If you `-n` a pick and then get interrupted (switch tasks, forget about it), the working directory and index are left mid-cherry-pick; `git status` clearly flags this, but it's easy to accidentally build on top of an unfinished pick without noticing.
- **Range picks skip merge commits by default.** `git cherry-pick A..B` silently skips any merge commits in that range unless you also pass `-m`; if the range includes merges, you'll likely need to handle them individually.
- **Empty commits after a pick.** If the target branch already contains an equivalent change, the picked diff can apply as a no-op; by default Git drops these silently rather than creating an empty commit, which can be surprising if you were counting commits in a range pick.

## FAQ
**Does cherry-picking preserve the commit hash?** No — the resulting commit always gets a new hash, since its parent (and therefore its content when hashed) differs from the original. Same diff, same message by default, different SHA.

**Can I cherry-pick uncommitted changes?** No — cherry-pick operates on existing commits only. To bring uncommitted work from elsewhere, use [[git stash]] or manually copy the diff.

**What's the difference between cherry-picking a range with `A..B` versus `A^..B`?** `A..B` excludes `A` itself and picks everything after it through `B`. `A^..B` includes `A` by starting from its parent. If you want commit `A` included in the pick, you need the `^` form.

**Does `git cherry-pick` push anything?** No — like almost every history-modifying Git command, it's entirely local. The new commit exists only in your local repo until you `git push`.

**Can cherry-pick apply multiple non-consecutive commits in one call?** Yes — `git cherry-pick A B C` (space-separated, not a range) applies each listed commit in order, useful when the commits you want aren't contiguous in history.

**What happens if a cherry-pick conflicts on every commit in a range?** You resolve and `--continue` through each one individually; there's no batch conflict resolution — each commit's conflicts must be handled before moving to the next.

**Does the picked commit's message change automatically?** Only if you pass `-x` (appends a provenance trailer) or `-e` (opens an editor); otherwise the original message is reused verbatim.

## Common Interview Questions
- What's the practical difference between `cherry-pick` and `merge`? — merge brings in an entire branch's history (and creates a merge commit tying the histories together); cherry-pick applies one commit's diff in isolation, with no merge commit and no direct history link to the source branch.
- Why does cherry-picking a merge commit require `-m`? — a merge commit has multiple parents, so there's no single unambiguous diff to apply until you specify which parent to diff against.
- If you cherry-pick a commit and its origin branch later gets merged, will the change be duplicated? — usually not; Git detects the identical patch by content and skips it during merge, though this detection can fail if the picked commit was edited before committing.
- How would you cherry-pick just part of a commit's changes? — use `-n`/`--no-commit` to stage everything without committing, then selectively unstage with `git restore --staged <file>` or `git reset -p` before committing what remains.

## Common Pitfalls
- Cherry-picking a commit that depends on earlier context not present on your branch, causing conflicts a normal merge wouldn't have hit
- Cherry-picking a merge commit without `-m <parent-number>` — Git errors out because it doesn't know which parent's changes to apply
- Cherry-picking the same commit onto a branch that later gets merged with the original — Git usually detects the identical patch and skips it silently, but if the picked commit was edited first, the merge can reintroduce the change as a conflict
- Forgetting `-x` when the origin matters for later auditing — without it, there's no trace in the message of where the commit originally came from
- Cherry-picking a long range (`A..B`) and hitting a conflict midway, then running `git cherry-pick --abort` expecting to keep the commits that already applied cleanly — `--abort` rolls back the *entire* range, not just the failing commit; use `--quit` instead if you want to stop but keep already-applied picks
- Losing track of which commits were already cherry-picked across a long-lived branch, leading to duplicate picks — `git cherry <upstream> <branch>` (a different, related command) lists commits not yet applied by patch-id comparison

## Related Commands
- [[git merge]] — bring in an entire branch's history instead of one commit
- [[git rebase]] — replay a whole sequence of commits onto a new base
- [[git revert]] — undo a commit's changes safely on a shared branch
- [[git log]] — locate the exact commit to cherry-pick
- [[git stash]] — set aside uncommitted work before starting a pick that might conflict
- [[git status]] — check for an in-progress, unfinished cherry-pick before starting other work
