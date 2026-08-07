---
tags: [term, git, branching]
category: Branching & Merging
---

# git merge

**Definition:** Combines the changes from one branch into the branch you're currently on.

## Syntax
```
git merge <branch>
```

## Common Options
- `--no-ff` — always create a merge commit, even if a fast-forward were possible, preserving the fact that a branch existed
- `--squash` — combine all the branch's commits into one set of staged changes, without creating a merge commit yet
- `--ff-only` — refuse to merge unless it can be done as a fast-forward; errors out instead of creating a merge commit
- `--abort` — bail out of a merge that has conflicts, restoring the pre-merge state exactly
- `-X <strategy-option>` — pass a low-level option to the merge strategy, e.g. `-X ours` or `-X theirs` to auto-resolve conflicts in favor of one side

## Basic Example
```
git checkout main
git merge feature/login
```
Brings the `feature/login` branch's changes into `main`. If `main` hasn't diverged from `feature/login` (no new commits on `main` since the branch point), Git performs a fast-forward: it just moves `main`'s pointer forward to `feature/login`'s tip, no new commit created at all.

## Extended Example
```
git merge --no-ff --no-edit feature/login
```
Forces a merge commit, instead of a silent fast-forward, so the team's history clearly shows a feature branch was merged, without opening an editor for the message. A more complete realistic sequence, including conflict handling:
```
git checkout main
git pull
git merge feature/login
# CONFLICT (content): Merge conflict in src/auth.js
# resolve conflict markers by hand in src/auth.js
git add src/auth.js
git commit --no-edit
```
Once `add`ed, the previously conflicting file is marked resolved; `git commit` with no message argument reuses the auto-generated merge commit message rather than opening the editor again, since `--no-edit` (or accepting the default when no changes are pending) skips the prompt.

## Under the Hood
`git merge` determines what kind of merge is needed by first finding the merge base — the most recent common ancestor commit of the two branches (computed the same way as `git merge-base`). From there:
- **Fast-forward**: if the current branch's tip *is* the merge base (i.e. it has no commits the other branch doesn't already contain), Git just moves the branch ref forward. No new commit, no three-way diff, nothing to resolve — this is why fast-forward merges are instant and conflict-free
- **Three-way merge**: if both branches have diverged (each has commits the other lacks), Git computes a diff of the merge base against each branch tip, and combines both diffs into the working tree and index. Where both sides changed the *same* lines, Git can't automatically decide and marks the file as conflicted, inserting `<<<<<<<`/`=======`/`>>>>>>>` markers
- While a merge with conflicts is in progress, Git writes `MERGE_HEAD` (pointing at the commit being merged in) and `MERGE_MSG` (the default commit message) into `.git/`. `git status` uses the presence of `MERGE_HEAD` to know a merge is mid-flight; deleting it manually is how some tools implement a crude `--abort`, though `git merge --abort` is the safe, supported way
- The resulting merge commit, once created, has two (or more, for an octopus merge) parent pointers instead of one — this is the only structural difference between a merge commit and a regular commit in Git's object model

## Flags Reference
| Flag | Effect |
|---|---|
| `--ff` (default) | Fast-forward when possible, otherwise create a merge commit |
| `--no-ff` | Always create a merge commit, even when a fast-forward is possible |
| `--ff-only` | Only succeed if a fast-forward is possible; otherwise abort with an error |
| `--squash` | Stage the combined diff without creating a merge commit or recording the second parent — the branch relationship is lost from history |
| `-X ours` / `-X theirs` | Auto-resolve *line-level* conflicts by preferring one side (distinct from `--strategy=ours`, which discards the other side's changes entirely) |
| `-s <strategy>` | Choose the merge strategy: `recursive` (default for two branches), `ours`, `octopus` (for merging more than two branches at once), `subtree` |
| `--abort` | Cancel an in-progress conflicted merge and restore the pre-merge working tree/index |
| `--continue` | After manually resolving conflicts and staging them, complete the merge commit |
| `--no-commit` | Perform the merge and stage the result, but stop before creating the commit, letting you inspect or amend first |
| `--no-edit` | Accept the default merge commit message without opening an editor |

## Common Workflow
A standard feature-branch integration flow used by many teams:
```
git checkout main
git pull origin main
git merge --no-ff feature/checkout-redesign
git push origin main
```
Pulling `main` first ensures the merge is based on the latest remote state, avoiding a scenario where you merge locally, then discover on push that `main` moved and you need to merge or rebase again. `--no-ff` here is a deliberate policy choice — some teams always want an explicit merge commit marking where a feature branch joined history, even when a fast-forward would have been possible, because it makes `git log --graph` meaningfully show feature boundaries.

Recovering from a merge gone wrong before it's pushed:
```
git merge feature/broken-thing
# conflicts appear, or tests fail after resolving
git merge --abort
```
`--abort` only works while `MERGE_HEAD` still exists — i.e. before the merge commit is actually created. Once committed (and especially once pushed), undoing requires [[git reset]] (local, unpushed) or [[git revert]] (safe for already-shared history, since it adds a new commit rather than rewriting).

## Comparison
| | `git merge` | [[git rebase]] |
|---|---|---|
| History shape | Preserves both branches' actual commit history, joined by a merge commit | Rewrites commits onto a new base, producing a linear history |
| Commit hashes | Unchanged for existing commits | Every rebased commit gets a new hash |
| Safe on shared/pushed branches | Yes | No — rewrites history other clones already have |
| Conflict resolution | Once, for the whole merge | Potentially once per replayed commit |
| Resulting graph | Shows exactly when/where branches diverged and rejoined | Looks as if the feature was built sequentially on top of the latest base |

Neither is universally "correct" — `merge` is the honest, non-destructive option for shared branches; `rebase` produces cleaner linear history but must never be used on commits others have already pulled.

## Common Pitfalls
- Merge conflicts — when both branches changed the same lines, Git stops and asks you to resolve them by hand before the merge can complete
- Running `git merge` on the wrong branch because you forgot to `git checkout`/`switch` to the intended target first — the merge always brings changes *into* whatever branch is currently checked out, not the other way around
- Using `--squash` and forgetting it doesn't create a merge commit or record any parent relationship — from history's perspective, a squash merge looks exactly like someone typed all those changes by hand in one commit; `git log --graph` won't show the feature branch at all
- Resolving a conflict by picking one side wholesale with `-X ours`/`-X theirs` without actually reading what the other side changed — this silently discards real changes rather than truly merging them, appropriate only when you're certain one side is simply wrong or obsolete
- Force-pushing after an aborted or redone merge on a shared branch, not realizing collaborators who already pulled the bad merge now have diverged, conflicting history
- Forgetting to `git add` a resolved file before running `git commit` (or `--continue`) — Git will refuse to complete the merge if conflict markers are still unresolved in the index, but a file that looks visually resolved in the editor still needs the explicit `add` to tell Git it's settled

## Gotchas Deep-Dive
- A fast-forward merge produces *no* merge commit at all, which surprises people expecting `git merge` to always create one — check whether a fast-forward happened with `git log --graph` or by noting Git's own "Fast-forward" output message
- `--squash` combined with `--no-commit` is the default even without passing `--no-commit` explicitly — `--squash` never auto-commits, always requiring a manual `git commit` afterward, unlike a normal merge which commits automatically absent conflicts
- Binary file conflicts can't be resolved with conflict markers the way text files can — Git just reports the conflict and expects you to choose one version wholesale (`git checkout --ours <file>` or `--theirs`) or manually replace the file with a hand-merged version
- Merging a branch into itself, or merging an already-merged branch again, is a safe no-op — Git detects there's nothing new to bring in and reports "Already up to date"
- `git merge --continue` and `git commit` are effectively equivalent once all conflicts are resolved and staged — `--continue` is really just Git checking that no unresolved conflicts remain before running the commit

## FAQ
**Why didn't my merge create a commit?** Almost certainly a fast-forward — the target branch had no divergent commits, so Git just moved the ref pointer instead of creating a merge commit. Use `--no-ff` if you always want an explicit merge commit.

**What's the difference between `--squash` and a normal merge?** A normal merge creates a commit with two parents, preserving the branch's full commit history and its relationship to the target branch. `--squash` collapses all the branch's commits into a single set of staged changes with no merge commit and no parent relationship recorded — history-wise, indistinguishable from someone hand-typing the combined diff.

**How do I undo a merge I already pushed?** `git revert -m 1 <merge-commit>` creates a new commit that undoes the merge's changes relative to the first parent, without rewriting history — the safe option once other people may have already pulled the merge.

**Can I merge more than two branches at once?** Yes, via an octopus merge (`git merge branch1 branch2 branch3`), but only when there are no conflicts between any of them — as soon as a conflict appears, Git can't resolve an octopus merge interactively and requires falling back to sequential two-way merges instead.

**Does merging delete the branch that was merged in?** No — `git merge feature/x` leaves `feature/x` fully intact, pointing where it did before. Deleting it afterward (`git branch -d feature/x`) is a separate, deliberate step, and `-d` (lowercase) specifically refuses to delete a branch with unmerged commits as a safety check.

**Why does Git sometimes merge automatically without any conflict, even though both branches touched the same file?** As long as the actual changed *lines* don't overlap, Git's line-based three-way merge combines both sides cleanly — conflicts only occur when both branches' diffs touch the same lines (or adjacent lines close enough that context can't be reconciled), not merely the same file.

## Merge Strategies
Git ships several pluggable merge strategies beyond the default, selectable via `-s`:
- `recursive` (or `ort` in modern Git, its successor) — the default for merging two branches; handles renames, and recursively merges the merge-base itself when there are multiple candidate common ancestors (a "criss-cross" merge scenario)
- `resolve` — an older, simpler two-way merge strategy, mostly superseded by `recursive`/`ort`
- `octopus` — the default when merging more than two branches simultaneously; fails outright on any conflict rather than trying to resolve one
- `ours` — resolves every conflict in favor of the current branch's version, but still creates a proper merge commit recording the other branch as a parent (distinct from `-X ours`, which resolves conflicts line-by-line in favor of the current side while still incorporating the other side's non-conflicting changes)
- `subtree` — a variant of `recursive` designed for merging one project into a subdirectory of another, adjusting paths as part of the merge

`ort` (Ostensibly Recursive's Twin) replaced `recursive` as the default strategy in modern Git versions, offering better performance and more correct rename handling, while remaining command-line compatible — most users never need to specify `-s` explicitly at all.

## Conflict Resolution Mechanics
When a conflict is left in a file, Git writes all three versions inline using standard markers:
```
<<<<<<< HEAD
current branch's version
=======
incoming branch's version
>>>>>>> feature/login
```
Resolving means editing the file down to the single correct result and removing the markers entirely, then `git add`ing it. Git also keeps the three original versions accessible during a conflict via stage numbers in the index — `git show :1:file` (common ancestor), `:2:file` (current branch/"ours"), `:3:file` (incoming branch/"theirs") — which is what tools like `git mergetool` and `git diff --ours`/`--theirs` read from, rather than re-deriving the three-way diff from scratch.

## Related Commands
- [[git rebase]]
- [[git branch]]
- [[git diff]]
- [[git reset]]
- [[git revert]]
- [[git cherry-pick]]
- [[git stash]]
- [[git switch]]
- [[git checkout]]

## Common Interview Questions
**"Explain the difference between a fast-forward merge and a three-way merge."** A fast-forward is possible only when the current branch has no commits the incoming branch doesn't already contain — Git just moves the branch pointer, no new commit. A three-way merge is required once both branches have diverged, using the merge base plus both tips to compute and combine changes, producing a new commit with two parents.

**"How would you resolve a merge conflict from the command line without a GUI tool?"** Open the conflicted file, look for `<<<<<<<`/`=======`/`>>>>>>>` markers, manually edit the file to the correct final content, remove the markers, then `git add` the file and `git commit` (or `git merge --continue`) once every conflict in the merge is resolved.

**"When would you choose `merge` over `rebase` for integrating a feature branch?"** Whenever the branch has already been pushed and possibly pulled by others — rebasing rewrites commit hashes and breaks anyone else's copy of that history, while merging is always safe on shared branches since it only adds a new commit rather than altering existing ones.
