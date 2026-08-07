---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git revert

**Definition:** Creates a new commit that undoes the changes from a specific previous commit, without altering existing history.

## Syntax
```
git revert <commit>
git revert <commit1>..<commit2>
git revert -n <commit>
git revert -m <parent-number> <merge-commit>
git revert --abort
git revert --continue
git revert --skip
```

## Common Options
- `-n` / `--no-commit` — apply the revert but don't commit yet, useful for reverting multiple commits into one combined commit
- `-m <parent-number>` — required when reverting a merge commit, specifies which parent to consider "mainline" (the side whose changes should be kept)
- `-e` / `--edit` (default) — open an editor to modify the auto-generated revert commit message
- `--no-edit` — accept the default revert commit message without opening an editor
- `--abort` — cancel an in-progress revert that hit a conflict, restoring the pre-revert state
- `--continue` — resume a revert after manually resolving conflicts
- `--skip` — skip the current commit being reverted (used when reverting a range and one commit's undo is unnecessary or already conflicts irreconcilably)

## Basic Example
```
git revert a1b2c3d
```
Creates a new commit that undoes exactly what that commit did. The original commit `a1b2c3d` stays in history untouched — the revert commit simply applies the inverse diff on top.

## Extended Example
```
git revert --no-commit a1b2c3d d4e5f6g
git commit -m "Revert two broken commits"
```
Reverts two separate commits' changes but bundles them into a single new commit instead of two separate revert commits, keeping history tidier when the two commits were logically related (e.g. a feature and its immediate hotfix, both bad).

## Under the Hood
`git revert` computes the diff introduced by the target commit (its changes relative to its parent), then applies the *inverse* of that diff to the current working tree and index — essentially a `git cherry-pick` of the commit's own patch played backward. If that inverse patch applies cleanly, Git commits it immediately with an auto-generated message like `Revert "original commit message"` plus a reference to the SHA being reverted. If it doesn't apply cleanly (because later commits touched the same lines), Git stops mid-operation, leaves conflict markers in the affected files, and waits for `--continue` or `--abort`, exactly like a rebase or cherry-pick conflict.

Because a revert is just a normal new commit, it's fully undoable itself — reverting a revert restores the original change. This makes `revert` fundamentally history-additive rather than history-destructive, which is precisely why it's safe on branches other people have already pulled: nobody's existing commits change identity or disappear, so there's nothing for collaborators' clones to diverge over.

Merge commits are a special case. A regular commit has one parent, so "the inverse diff" is unambiguous. A merge commit has two (or more) parents, so Git needs to know which parent represents the "mainline" you want to preserve — that's what `-m <parent-number>` specifies. `-m 1` typically means "treat the first parent (usually the branch you merged into) as mainline, undo the changes the second parent introduced."

Git also exposes `revert.reference` (a config boolean) which changes the auto-generated commit message to reference the reverted commit by its abbreviated hash in a `(reverts <sha>)`-style trailer instead of quoting the full original subject line — some teams prefer this for terser log output when reverts are frequent, e.g. in bisection-heavy workflows.

## Comparison
| Command | Moves branch pointer? | Rewrites history? | Safe on shared/pushed branches? |
|---|---|---|---|
| `git revert` | no (adds a new commit) | no | yes |
| `git reset` | yes | yes | no |
| `git cherry-pick` | no (adds a new commit) | no | yes |

`revert` and `cherry-pick` are near mirror images of each other: `cherry-pick <commit>` takes a commit's changes and replays them as-is onto the current branch; `revert <commit>` takes the same commit's changes and replays their inverse. Both are additive, both can conflict, and both share the same `--continue`/`--abort`/`--skip` conflict-recovery vocabulary, which is worth remembering since it means learning to resolve a conflicted revert also teaches you to resolve a conflicted cherry-pick.

## Flags Reference
| Flag | Effect |
|---|---|
| `-n`, `--no-commit` | Stage the revert's changes without committing |
| `-m <n>` | Specify mainline parent number when reverting a merge commit |
| `-e`, `--edit` | Open editor for the revert commit message (default) |
| `--no-edit` | Skip the editor, use the default generated message |
| `-s`, `--signoff` | Add a `Signed-off-by` trailer to the revert commit |
| `-S[<keyid>]` | GPG-sign the revert commit |
| `--strategy=<strategy>` | Use a specific merge strategy when applying the inverse patch |
| `-X<option>` | Pass a strategy-specific option through to the merge machinery (e.g. `-Xours`) |
| `--allow-empty` | Commit even if the revert produces no actual changes |
| `--abort` / `--continue` / `--skip` | Control an in-progress multi-commit or conflicted revert |

## Conflict Resolution Walkthrough
A revert that conflicts leaves the repo in the same mid-operation state a conflicted merge would:
```
git revert a1b2c3d
# CONFLICT (content): Merge conflict in src/validator.js
# error: could not revert a1b2c3d... Fix validation bug
```
At this point `src/validator.js` contains standard `<<<<<<<` / `=======` / `>>>>>>>` conflict markers. Resolve by hand, then:
```
git add src/validator.js
git revert --continue
```
`git status` mid-conflict lists exactly which paths still need resolving, same as it does mid-rebase or mid-merge — the three operations share the same conflict-tracking state in the index.

## Gotchas Deep-Dive
When reverting a range with `git revert <older>..<newer>`, Git processes commits newest-first by default — it undoes `<newer>` before working backward toward `<older>`, which mirrors the order you'd want if the commits are independent, but can produce extra, avoidable conflicts if later commits depend on earlier ones in the range. `--no-commit` combined with manual ordering (revert each SHA individually in the sequence you actually want) gives more control when the default order causes friction.

Reverting a commit that only changed file mode (e.g. made a script executable) or that's now empty relative to the current tree — because a later commit already undid the same lines — produces an empty revert by default, which Git refuses to commit unless `--allow-empty` is passed. This shows up often when reverting commits from a long-lived branch that already had partial fixes cherry-picked out of it.

## Common Workflow
Reverting a bad merge that already shipped to `main`:
```
git log --oneline --graph -5
git revert -m 1 <merge-commit-sha>
git push origin main
```
This is the standard emergency-rollback pattern: identify the bad merge commit, revert it against its first parent (the mainline), and push immediately. Because it's a forward-moving commit rather than a rewrite, nobody needs to force-pull or rebase to stay in sync.

## Revert and Bisect
`git revert` shows up naturally alongside [[git bisect]] in regression-hunting workflows: once `bisect` identifies the exact commit that introduced a bug, `git revert <that-sha>` is frequently the fastest safe fix to ship, especially under time pressure, since it doesn't require understanding *why* the commit was wrong, only that undoing it restores correct behavior. A proper root-cause fix can follow later once the immediate incident is resolved — reverting first and investigating after is a common and defensible incident-response order of operations.

## Common Pitfalls
- Reaching for [[git reset]] on already-pushed commits instead — `reset` rewrites history (dangerous on shared branches), `revert` adds a new commit (safe on shared branches)
- Reverting a merge commit without `-m` and getting an error, or worse, picking the wrong parent number and accidentally undoing the wrong side's changes — always check `git log --graph` first to see which parent is which
- Trying to revert the same merge commit again later (e.g. after re-merging the same branch) and hitting an "already reverted" conflict — reverting a merge leaves the tree in a state where the original branch's changes are considered already applied-then-undone, so a later re-merge of that same branch can silently produce no changes unless the revert itself is first reverted
- Expecting `revert` to remove the original commit from `git log` — it doesn't; both the original and the revert commit remain visible in history forever, which is by design but can surprise people used to `reset`'s clean-looking log

## FAQ
**Does reverting a commit delete it from history?** No — both the original commit and the new revert commit stay in the log permanently. This is the whole point: history is additive, not rewritten.

**Can I revert more than one commit at once?** Yes, either as a range (`git revert <older>..<newer>`, which reverts them one at a time, newest first, each as its own commit) or bundled into a single commit with `-n` plus one final `git commit`.

**What happens if a revert conflicts?** Git pauses the operation and leaves conflict markers in the affected files, same as a merge or rebase conflict. Resolve them, `git add` the files, then `git revert --continue`; or bail out entirely with `git revert --abort`.

**Is `git revert` the same as `git cherry-pick` in reverse?** Conceptually yes — both apply a specific commit's patch onto the current tree, `cherry-pick` forward (as-is) and `revert` backward (inverted). They share the same conflict-resolution machinery (`--continue`/`--abort`/`--skip`) and both add new commits rather than rewriting existing ones.

**Are signed commits still verifiable after a revert?** Yes, and independently — a revert commit is its own new commit object with its own signature (if `-S` is used or `commit.gpgsign` is enabled), and it doesn't alter the original commit's signature or hash in any way, unlike history-rewriting operations.

**Should I revert or just fix forward with a new commit?** Either works for a bug found later, but `revert` is preferable when you specifically want the audit trail to show "commit X's changes were undone" as a discrete, reviewable action — useful in regulated environments or when a CI/CD pipeline auto-deploys and you need the fastest possible safe rollback without waiting on a manual fix.

## Common Interview Questions
**"Why would a team prefer `revert` over `reset` for undoing a production deploy?"** Because production branches are shared and often protected — a `reset` there requires a force-push, which most hosting platforms block on protected branches by default and which invalidates any commit-based deploy or CI cache keyed on SHA. `revert` produces a normal forward commit that flows through the same PR and CI process as any other change, with a clean audit trail showing exactly what was undone and when.

**"What does `git revert -m 1` mean and when do you need it?"** It's required when reverting a merge commit, since a merge has multiple parents and Git can't infer on its own which side represents "the code that should remain." `-m 1` tells Git to treat the first parent (conventionally the branch that was merged into) as mainline, and compute the inverse diff relative to that parent — effectively undoing everything the merge brought in from the other side.

**"Can you revert a revert, and what happens?"** Yes — reverting a revert commit re-applies the original commit's changes, since the revert-of-a-revert is the inverse of an inverse. This is a normal, supported pattern for "actually, un-undo that" without touching history.

## Real-World Example
A hotfix rollback under time pressure, using `--no-edit` to skip the commit message prompt in a script or CI job:
```
git fetch origin
git log --oneline origin/main -5
git revert --no-edit -m 1 <bad-merge-sha>
git push origin HEAD:main
```
Fetching first ensures the revert is computed against the latest remote state, not a stale local `main`; `--no-edit` keeps the operation non-interactive, which matters if this is run from an automated rollback script rather than a terminal.

## History
`git revert`'s merge-commit handling (`-m`) was added relatively early in Git's history precisely because reverting merges is conceptually different from reverting regular commits — a merge commit doesn't introduce a clean, single-parent diff, so without an explicit mainline choice Git has no principled default. The command's core behavior (compute inverse diff, apply, commit) has stayed stable for years; most recent changes have been ergonomic, like `--no-edit` becoming common in scripted rollback tooling as automated deploys grew more common.

## Reverting an Unpushed Commit
Reverting isn't limited to pushed history — it works identically on local-only commits, though for those `git reset` is usually simpler since there's no shared-branch risk to worry about. One case where `revert` still wins locally: when the commit being undone isn't the most recent one, and you'd rather not disturb the commits that came after it. `git reset` can only move the pointer backward from the current tip; `git revert <older-sha>` can undo any single commit in the branch's history, wherever it sits, without touching anything after it.

## Related Commands
- [[git reset]]
- [[git log]]
- [[git cherry-pick]]
- [[git merge]]
- [[git reflog]]
- [[git bisect]]
