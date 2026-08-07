---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git commit --amend

**Definition:** Replaces the most recent commit with a new one, either changing its message, its contents, or both.

## Syntax
```
git commit --amend [options]
```

## Common Options
- `--no-edit` — keep the existing commit message, only change the staged content
- `-m "<message>"` — replace the commit message entirely
- `--no-verify` — skip hooks when amending
- `--reset-author` — reset author info to the current user and timestamp (useful after cherry-picking)
- `--date=<date>` — override the author date on the amended commit
- `-a` — automatically stage all tracked, modified files before amending

## Basic Example
```
git commit --amend -m "Fix typo in login validation"
```
Replaces the last commit's message.

## Extended Example
```
git add forgotten-file.js
git commit --amend --no-edit
```
You realize you forgot to include a file in the last commit, so you stage it and fold it into that same commit without changing the message.

## Under the Hood
`--amend` doesn't edit a commit in place — Git commit objects are immutable and content-addressed by hash, so nothing about an existing commit can literally be modified. Instead, `--amend` builds an entirely new commit object using the current index as its tree, the *same parent* as the commit being replaced, and either the message you supply or the original message (with `--no-edit`). It then moves your branch ref to point at this new commit.

The old commit object becomes unreferenced (orphaned) at that point — invisible to `git log`, but not deleted. It lingers in `.git/objects` until garbage collected (`git gc`), and remains fully recoverable via `git reflog` in the meantime.

Because the new commit's parent is unchanged but the commit's own hash is different — a different tree and/or message means a different SHA — amending is really "create a new commit, then move the branch pointer, discarding the old commit from the branch's history." This is the same underlying mechanic `git rebase` performs at scale across many commits at once, which is why both operations carry the same "don't do this on shared history" warning.

## Flags Reference
| Flag | Effect |
|---|---|
| `--no-edit` | Reuse the existing commit message unchanged |
| `-m <msg>` | Overwrite the message |
| `--no-verify` | Skip `pre-commit`/`commit-msg` hooks during the amend |
| `--reset-author` | Set author to current user + now, discarding original author info |
| `--author="Name <email>"` | Set a specific author identity |
| `--date=<date>` | Override the author date |
| `-a` | Stage all tracked modified files before amending, same semantics as `commit -a` |
| `-S[<keyid>]` | Re-sign the amended commit with GPG |
| `--no-gpg-sign` | Skip signing even if `commit.gpgSign` is enabled globally |
| `--allow-empty` | Permit amending into a commit with no changes at all |
| `-e` | Force the message editor open even with `--no-edit` context implied elsewhere |

## Common Workflow
Fixing a typo you notice immediately after committing, before pushing:
```
git commit -m "Add usre auth middleware"
git commit --amend -m "Add user auth middleware"
```

Folding a forgotten file into the last commit without touching the message:
```
git add forgotten-file.js
git commit --amend --no-edit
```

Recovering if you amend the wrong commit, or simply regret it:
```
git reflog                      # find the SHA of the pre-amend commit
git reset --hard HEAD@{1}       # restore the branch to point at it
```
`--amend` only moves your branch's pointer; the original commit object still physically exists until garbage collected, so `reflog` is your safety net for undoing an amend at any point afterward.

Splitting a commit that turned out to bundle two unrelated changes, using amend as the last step:
```
git reset HEAD^                # uncommit, changes return to working dir, unstaged
git add src/auth.js
git commit -m "Add auth middleware"
git add src/logging.js
git commit -m "Add request logging"
```
This isn't `--amend` directly, but it's the standard companion move: `--amend` only ever produces one resulting commit, so splitting requires uncommitting first via `reset`, then committing the pieces separately.

## History
- `--amend` has existed since Git's earliest versions as the direct, single-commit counterpart to what `rebase -i` later generalized to arbitrary commit ranges.
- `--fixup`/`--squash` (on `git commit`) were added specifically to reduce how often people reach for `--amend` mid-review — instead of repeatedly amending and force-pushing, small corrections get queued as separate fixup commits and squashed once at the end via `rebase -i --autosquash`.
- `--force-with-lease` (on `git push`) was added well after `--amend` itself, specifically to make the "amend, then force-push" workflow safer by refusing to overwrite commits the pusher hasn't seen.

## Comparison
| | `git commit --amend` | `git revert` | `git rebase -i` |
|---|---|---|---|
| Targets | Only the tip commit | Any commit, adds a new inverse commit | Any range of commits |
| Rewrites history | Yes | No — adds on top instead | Yes |
| Safe on pushed/shared commits | No | Yes | No |
| Typical use | Fix the last commit before pushing | Undo a commit already on a shared branch | Reorder, squash, or edit multiple commits |

## Common Pitfalls
- Amending a commit that's already been pushed and pulled by others — like rebase, it rewrites history, so it's only safe on commits nobody else has based work on yet
- Force-pushing after an amend without warning collaborators — `git push --force-with-lease` is safer than `--force` because it fails if the remote has commits you don't have locally, avoiding accidentally discarding someone else's work
- Amending repeatedly to "save" work-in-progress instead of making separate WIP commits — each amend discards the previous commit object; if you actually needed an intermediate state, it's only recoverable via reflog and only for a limited window before garbage collection
- Forgetting `--no-edit` and accidentally opening the message editor when you only meant to add a file to the previous commit, then unintentionally saving a message change
- Using `--amend` on a merge commit — it works, but rewrites the merge, which can be confusing since the merge's parents and any conflict resolution get silently redone if the index changed since the merge landed
- Amending after already sharing the commit in a code review tool that tracks commit SHAs (some do, some track PR diffs instead) — reviewers may see the commit "disappear" and a new one appear, breaking comment threads anchored to the old SHA
- Assuming `--amend` merges your new staged changes with the old commit's changes intelligently — it doesn't do a merge at all, it just builds a fresh tree from whatever is currently staged, so forgetting to re-stage something the old commit had (if you reset it first) silently drops it
- Running `--amend` inside an in-progress rebase or cherry-pick — the command applies to whatever commit is currently checked out in that operation, not necessarily the branch tip you expect, which can produce confusing results mid-conflict-resolution
- Believing `--amend` preserves the original commit's timestamp by default — it doesn't; the commit date updates to "now" unless you explicitly pass `--date` to keep the old one

## Gotchas Deep-Dive
- **Amend vs. interactive rebase overlap**: `git rebase -i HEAD~1` with `edit` on the top commit is functionally equivalent to `--amend` for the tip — `--amend` is just the shorthand for the single-commit case, so there's no separate mechanism to learn, only a different entry point.
- **Signed commits need re-signing**: amending a GPG-signed commit produces a new object that must be re-signed (`-S`) to stay verified; forgetting the flag on an amend silently produces an unsigned commit even if the original was signed, since signing isn't "sticky" across a new commit object.
- **Amend and pre-commit hooks**: hooks re-run on every amend by default, same as a normal commit — a linter or formatter hook that modifies files can change what actually gets committed versus what you staged, which is easy to miss if you don't check `git diff --staged` right before amending.
- **Detached HEAD amends**: amending while on a detached HEAD (not on any branch) works and creates a new commit object, but nothing points at it once you check out elsewhere — same unreachable-commit risk as any detached-HEAD commit.
- **Amend after a partial `git add -p`**: if you only staged some hunks before amending, the amended commit reflects only those hunks — the rest stay in the working directory as unstaged changes, exactly as if you'd run a normal partial `add` before a normal `commit`.
- **Interaction with `commit.gpgSign`**: if this config is set to `true`, every amend re-signs automatically without needing `-S` explicitly — a detail that trips people up when they expect `--no-gpg-sign` to be the "do nothing" default and are surprised amends keep getting signed.

## Common Interview Questions
**"How is `--amend` different from editing history with `rebase -i`?"** `--amend` only ever touches the tip commit and is a one-step shortcut; `rebase -i` can retarget any commit in a range but requires marking it `edit` or `reword` and stepping through the rebase.

**"What would you do if you amended a commit and immediately regretted it, after already running another command?"** Check `git reflog` first — every ref update, including the amend itself, is logged there with a `HEAD@{n}` reference, so the pre-amend state is almost always one `git reset --hard HEAD@{n}` away as long as it hasn't been garbage collected.

**"Why might a teammate's `git pull` fail right after you amend and force-push?"** Their local branch and yours have diverged at the point of the rewrite — Git sees their branch and the new remote tip as unrelated at that commit, and refuses to fast-forward; they need to reset to the new remote state or rebase their own work on top of it.

**"If I amend a commit, does the original commit get deleted immediately?"** No — it becomes unreferenced but still exists in `.git/objects` until Git's garbage collector runs (`git gc`, or automatically after enough loose objects accumulate), and is recoverable via `git reflog` in the meantime.

**"Why does `git commit --amend` sometimes do nothing visible if I didn't stage anything new?"** It still runs — it rebuilds the commit using the current index, which if unchanged just reproduces the same tree, but the timestamp update still changes the commit hash even though the diff looks identical.

## FAQ
**Does amending change the commit hash?** Always — even `git commit --amend --no-edit` with identical content changes the commit timestamp, which changes the hash. There's no way to "silently" amend without producing a new SHA.

**Can I amend a commit that isn't the most recent one?** Not directly. `--amend` only operates on `HEAD`. To edit an older commit, use `git rebase -i <commit>~1`, mark it `edit`, make your changes, run `git commit --amend`, then `git rebase --continue`.

**Is it safe to amend before the first push?** Yes — as long as no one else has fetched or pulled the commit, amending is completely safe and is the standard way to clean up a commit before sharing it.

**What happens to the discarded commit's reflog entry?** It stays in `git reflog` under the branch name (and under `HEAD`) for the duration of `gc.reflogExpire` (90 days by default for reachable-but-unreferenced commits), so accidental amends are recoverable well after the fact.

**Does `--amend` work if I have nothing staged at all?** Yes — with no staged changes, it simply rewrites the message (or re-applies `--no-edit`) while leaving the tree identical to the original commit; only the message and/or metadata change.

**Can I amend to split a commit into two instead of just editing one?** Not with `--amend` alone — that only ever produces one resulting commit. To split a commit, use `git reset HEAD^` to uncommit it back to staged/unstaged changes, then commit in multiple smaller pieces with `git add -p`.

## Related Commands
- [[git commit]]
- [[git rebase]]
- [[git rebase -i (Interactive Rebase)]]
- [[git reflog]]
- [[git reset]]
- [[git revert]]
