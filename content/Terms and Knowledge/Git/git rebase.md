---
tags: [term, git, branching]
category: Branching & Merging
---

# git rebase

**Definition:** Replays your branch's commits one by one on top of another branch's latest commit, rewriting their hashes and producing a linear history instead of a merge commit.

## Syntax
```
git rebase <branch>
git rebase --onto <newbase> <upstream> <branch>
git rebase --abort
git rebase --continue
git rebase --skip
```

## Common Options
- `--onto <newbase>` — rebase onto a different branch or commit than the one you originally branched from, useful for moving a branch to a new base
- `--abort` — cancel a rebase in progress and return to the exact state before it started
- `--continue` — resume after manually resolving a conflict mid-rebase
- `--skip` — skip the commit currently causing a conflict entirely, discarding its changes
- `-i` — do it interactively, reordering/squashing/dropping commits (see [[git rebase -i (Interactive Rebase)]])
- `--rebase-merges` — preserve the structure of merge commits within the range instead of flattening them

## Basic Example
```
git rebase main
```
Replays your current branch's commits, one at a time, on top of the latest `main`.

## Extended Example
```
git checkout feature
git rebase main
# on conflict:
git status               # see which files conflicted
# edit the file, resolve the <<<<<<< markers
git add <file>
git rebase --continue
```
The standard rebase-and-resolve loop: Git stops at the first commit that conflicts, you fix it like any merge conflict, stage it, and `--continue` moves on to the next commit in the sequence, repeating until the whole branch has been replayed.

## Under the Hood
A rebase does not move or edit existing commits — it cannot, since a commit's hash is a function of its content, parent, author, and message, and changing any of those changes the hash. Instead, for each commit in the range being rebased, Git:

1. Computes the diff that commit introduced relative to its original parent.
2. Applies that diff on top of the current tip of the new base (essentially a `cherry-pick`).
3. Creates a **brand-new commit object** with the same message/author/diff but a new parent and therefore a new hash.
4. Moves your branch ref to point at that new commit, and repeats for the next one in the sequence.

This is why a rebased branch's commits share no hash with the originals, even though the content is identical — from Git's object-graph perspective they are entirely unrelated commits that happen to carry the same patch. The old commits aren't deleted; they simply become unreachable from any branch once the branch ref is moved, which is exactly what makes `git reflog` able to recover them (via `HEAD@{n}` entries logged before the rebase started) if something goes wrong.

Before starting, Git records the branch's pre-rebase position as `ORIG_HEAD`, giving a one-step recovery path (`git reset --hard ORIG_HEAD`) separate from digging through the reflog. Internally, even a plain non-interactive `git rebase` is driven by the same sequencer machinery as `git rebase -i` — it just generates a todo list of all `pick` lines automatically instead of opening it in an editor for you.

`--onto` is the tool for surgical history rewriting: `git rebase --onto <newbase> <upstream> <branch>` takes only the commits reachable from `<branch>` but not from `<upstream>`, and replays exactly that slice onto `<newbase>`. It's how you move a branch that was accidentally started from the wrong point, or split a stack of commits so only part of it moves.

Merge conflicts during a rebase are resolved using the same three-way merge machinery as `git merge` — Git isn't doing anything conceptually different when a replayed commit's patch doesn't apply cleanly, it's just doing it once per commit in the sequence instead of once for the whole range.

## Flags Reference

| Flag | Effect |
|---|---|
| `--onto <newbase>` | Replay commits onto an arbitrary commit instead of the branch's original base |
| `--abort` | Stop the rebase and restore the branch to its pre-rebase state |
| `--continue` | Resume after resolving a conflict or empty-commit prompt |
| `--skip` | Drop the current commit entirely and move to the next one |
| `-i`, `--interactive` | Open the todo list for manual editing before replaying |
| `--rebase-merges[=rebase-cousins]` | Preserve merge commit topology in the range instead of flattening it into a straight line |
| `--strategy=<strategy>`, `-X<option>` | Use a specific merge strategy (e.g. `-Xours`, `-Xignore-space-change`) when applying each commit |
| `--autostash` | Stash uncommitted changes automatically before rebasing, reapply after |
| `--committer-date-is-author-date` | Keep the original commit timestamp instead of stamping the replay time |
| `-f`, `--force-rebase` | Force a rebase even when it looks like a no-op (fast-forward would suffice) |
| `--whitespace=<option>` | Control whitespace-error handling while applying each patch |
| `--reapply-cherry-picks` | Re-apply already-cherry-picked commits instead of dropping them as duplicates (opt-in, since the default skips patches whose changes already appear in the new base) |
| `-q`, `--quiet` / `-v`, `--verbose` | Suppress or expand progress output during the replay |

## Comparison

| | `git rebase` | `git merge` |
|---|---|---|
| Resulting history | Linear — commits replayed in sequence | Branching — preserves the actual timeline with a merge commit |
| Commit hashes | Rewritten for every replayed commit | Original commits untouched, new merge commit added |
| Conflict resolution | Potentially once per conflicting commit | Once, for the whole merge |
| Safe on shared/pushed branches | No — rewrites history others may have | Yes — only adds new commits |
| Best for | Cleaning up a local/feature branch before sharing | Integrating finished work into a shared branch |
| Undo mechanism | `git reflog` + `ORIG_HEAD` (rewritten hashes need recovery) | Simple `git revert` of the merge commit if needed |

## Common Workflow
Keeping a long-lived feature branch current with an actively-changing `main` without generating merge-commit clutter, then landing it:
```
git checkout feature/payments
git fetch origin
git rebase origin/main
# resolve conflicts as they occur, git add + git rebase --continue each time
git push --force-with-lease origin feature/payments
# once approved:
git checkout main
git merge --ff-only feature/payments
```
Rebasing onto `origin/main` (not local `main`) ensures you're replaying against the actual remote tip, not a possibly-stale local copy. The final `merge --ff-only` on `main` is trivial precisely because the feature branch was kept rebased — no merge commit is even needed.

This is the core of what's often called a "rebase workflow" or "linear history" workflow, as opposed to a "merge workflow" where feature branches are integrated with `git merge --no-ff` and the branching structure is preserved permanently in `git log --graph`. Neither is objectively correct — the tradeoff is a clean linear log versus a history that literally shows how work was organized into branches over time.

## Gotchas Deep-Dive
- **Rewritten hashes break shared history.** Once someone else has pulled a commit, rebasing it locally and force-pushing creates two divergent histories for the "same" logical commits. Their next pull either creates a confusing duplicate merge or fails outright depending on their local state.
- **Conflicts can repeat per-commit.** A change that conflicts with the new base may conflict again on the very next replayed commit if that commit touches the same lines, since each commit is applied as a separate patch, not as one combined diff. `git rebase --skip` should be used carefully — it discards the current commit's changes entirely, not just the conflicting hunk.
- **Empty commits after rebase.** If a commit's changes are already present in the new base (e.g. it was cherry-picked there separately), rebase may produce an empty commit and prompt to skip or keep it (`--keep-empty` / `--no-keep-empty` control the default).
- **Author vs committer date.** A rebased commit keeps its original author date but gets a fresh committer date (the moment it was replayed), unless `--committer-date-is-author-date` is passed. This is why `git log` can show commits appearing "out of order" by committer timestamp after a rebase even though the author dates still reflect when the work was originally done.
- **`git rebase main` vs `git rebase origin/main`.** The former rebases onto your local `main`, which is only as fresh as your last fetch/pull of it; the latter rebases onto the actual remote tip. Confusing the two is a very common source of "I rebased but I'm still behind."

## Common Interview Questions
**What actually happens to the original commits after a rebase?** They aren't deleted or modified — they become unreachable from any branch ref once the branch pointer moves to the newly-created replayed commits. They remain full objects in `.git/objects` until garbage collection eventually prunes them, and until then they're recoverable through [[git reflog]] via `ORIG_HEAD` or the relevant `HEAD@{n}` entry.

**Why does Git recommend never rebasing shared history?** Because rebase produces new commit objects with new hashes for content that already existed elsewhere. Anyone who already has the old commits now has a completely different, unrelated set of hashes representing "the same" changes as what you've pushed — their next `pull` either creates a tangled duplicate merge or fails, and there's no clean way to reconcile the two histories without manual intervention (or one side just discarding their view and re-syncing).

**How is `git rebase` different from `git cherry-pick` internally?** They share the same replay mechanism — `cherry-pick` takes one specific commit and reapplies it onto your current `HEAD`, `rebase` does the same thing for an entire range of commits in sequence, automatically, one after another. A rebase can meaningfully be described as "cherry-pick a whole branch."

**What's `ORIG_HEAD` and when is it set?** It's a ref Git updates before operations that substantially rewrite the current branch — rebase, reset, merge — recording where the branch pointed immediately beforehand. It gives a single dedicated recovery point (`git reset --hard ORIG_HEAD`) distinct from digging through the full reflog history.

**Is a rebase ever a genuinely no-op that Git skips?** Yes — if the branch is already directly on top of the target (a pure fast-forward situation), rebase just moves the branch pointer with no replay at all, unless `--force-rebase` is passed to force it to replay commits anyway.

## Real-World Example
Splitting off part of a branch that was built on the wrong base — a case `--onto` handles cleanly where a plain `rebase` cannot:
```
git log --oneline topic
# f4e5d6c Add rate limiting        <- only this commit should move
# a1b2c3d Add caching layer        <- built on the wrong base, stays
# 9f8e7d6 (base) Initial API setup
git rebase --onto main a1b2c3d topic
```
This replays only the commits reachable from `topic` but not from `a1b2c3d` (i.e. just `f4e5d6c`) onto `main`, leaving the caching-layer commit and its original base untouched on the old branch line. It's the tool of choice when a branch was accidentally started from the wrong point and only part of its history needs to move.

## Common Pitfalls
- Rebasing commits that have already been pushed and pulled by others — it rewrites every commit hash from the rebase point forward, so anyone else's copy diverges painfully. Rule of thumb: never rebase shared/public branches
- Running `git rebase main` instead of `git rebase origin/main` — rebasing onto your possibly-stale local `main` instead of the actual remote tip
- Force-pushing after a rebase without `--force-with-lease` (see [[git push]]) — a plain `--force` can wipe out commits a teammate already pushed to the same branch
- Rebasing a long-lived branch with many conflicting commits — each conflict has to be resolved individually per-commit, which can be far more tedious than resolving one merge conflict
- Forgetting `--abort` exists mid-conflict panic — walking away or force-quitting the terminal leaves the repo mid-rebase; `git rebase --abort` cleanly restores the pre-rebase state using `ORIG_HEAD`
- Assuming a successful rebase with no conflicts means nothing changed semantically — replaying commits onto a different base can silently produce working code that behaves differently than intended if the base branch changed behavior the original commits implicitly depended on; running the test suite after a rebase is worth the extra step
- Rebasing a branch that contains merge commits without `--rebase-merges` — by default those merge commits are flattened away entirely, silently converting a branching history into a straight line and losing the information about what was merged and when

## Related Commands
- [[git merge]]
- [[git rebase -i (Interactive Rebase)]]
- [[git push]]
- [[git cherry-pick]]
- [[git reflog]]
- [[git reset]]
- [[git revert]]
