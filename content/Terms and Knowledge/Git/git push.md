---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git push

**Definition:** Uploads your local commits to a remote repository and updates its branch references to match.

## Syntax
```
git push [<remote>] [<branch>]
git push -u <remote> <branch>
git push --force-with-lease <remote> <branch>
git push <remote> --delete <branch>
```

## Common Options
- `-u` / `--set-upstream` — link your local branch to a remote branch so future `push`/`pull` don't need remote/branch spelled out
- `--force-with-lease` — force-push, but safely: fails if someone else pushed new commits you haven't fetched yet
- `--force` — force-push unconditionally, overwrites the remote branch regardless of what's there
- `--tags` — also push local tags that aren't yet on the remote
- `--delete <branch>` — delete a branch on the remote (equivalent to `git push <remote> :<branch>`)
- `--dry-run` — show what would be pushed without actually pushing

## Basic Example
```
git push origin main
```
Pushes your local `main` branch's new commits to `origin`, fast-forwarding the remote branch.

## Extended Example
```
git rebase -i HEAD~3
git push --force-with-lease origin feature/login
```
After rewriting history with an interactive rebase, a normal push is rejected because local and remote histories have diverged; `--force-with-lease` force-pushes the rewritten branch but first checks the remote-tracking ref still matches what you last fetched, aborting instead of clobbering a teammate's commits you haven't seen.

## Under the Hood
A push is fundamentally a request to update refs on another repository. For each `<local-ref>:<remote-ref>` pair, Git:

1. Walks the commit graph from your local ref, figuring out which objects (commits, trees, blobs) the remote doesn't already have.
2. Packs those objects and transmits them (the "send-pack" side talking to "receive-pack" on the remote).
3. Asks the remote to move the target ref to point at your new tip — but only if that update is a **fast-forward** (the new tip is a descendant of the ref's current position), unless a force flag is used.

That fast-forward check is the entire reason force-pushes exist: if you've rewritten history (rebase, amend, filter-branch), your new commit isn't a descendant of the remote's current tip — it has a different ancestor chain with all-new hashes — so the plain push is rejected as non-fast-forward. A force push overrides that check and makes the remote ref point wherever you say, no ancestry required.

Refspecs also matter: `git push origin main` is shorthand for `git push origin main:main` (push local `main` to remote's `main`). You can push a local branch to a differently-named remote branch (`git push origin main:release`), or delete a remote branch with an empty source (`git push origin :old-branch`, equivalent to `--delete`). Server-side, most hosts (GitHub, GitLab, self-hosted) run this through `pre-receive` and `update` hooks (see [[Git Hooks]]) before accepting the ref update, which is how branch protection rules reject force-pushes to `main` even when your local Git client would otherwise allow it.

The upstream tracking relationship set by `-u` lives in plain config, readable with `git config --get branch.main.remote` and `git config --get branch.main.merge` — there's no hidden state beyond those two values, which is why `git branch --unset-upstream` can cleanly remove tracking without touching any commits.

## Flags Reference

| Flag | Effect |
|---|---|
| `-u`, `--set-upstream` | Record the remote/branch as the default target for future `push`/`pull`/`status` on this branch |
| `--force`, `-f` | Overwrite the remote ref unconditionally |
| `--force-with-lease[=<ref>:<expected>]` | Overwrite only if the remote ref still matches your last-known remote-tracking value; optionally pin the exact expected commit |
| `--force-if-includes` | Extra safety on top of `--force-with-lease`: also verifies the remote's current tip is reachable from your local remote-tracking ref |
| `--tags` | Push all local tags not already on the remote |
| `--follow-tags` | Push only annotated tags that point at commits being pushed |
| `--delete`, `-d` | Delete the named branch/ref on the remote |
| `--dry-run` | Show what would be pushed/updated without sending anything |
| `--all` | Push all local branches |
| `-o`, `--push-option=<opt>` | Pass a value through to server-side hooks (e.g. `-o ci.skip` to skip a pipeline, if the host supports it) |
| `--atomic` | When pushing multiple refs, make the update all-or-nothing on the server |

## Comparison

| | `--force` | `--force-with-lease` |
|---|---|---|
| Overwrite condition | Always | Only if remote ref matches your last-fetched value |
| Fails safely if a teammate pushed since your last fetch | No — silently overwrites their commits | Yes — rejects with an error, forcing you to fetch and look first |
| Requires a recent fetch to be meaningful | No | Yes — a stale remote-tracking ref makes the "lease" check pass when it shouldn't |
| Recommended default for solo rewritten branches | Acceptable | Preferred habit regardless |

`--force-with-lease` is not foolproof — it only protects against changes you haven't fetched yet. If your remote-tracking ref is stale because you haven't run `git fetch` recently, the lease check can pass even though the remote has moved, since Git is comparing against outdated local bookkeeping, not the live remote state.

In practice, a reliable habit is: `git fetch origin` immediately before any force-push, so the lease check is comparing against genuinely current information rather than whatever was cached from the last time you happened to fetch.

## Common Workflow
Standard first-push-and-track sequence for a new feature branch, followed by iterating with history rewrites:
```
git checkout -b feature/checkout-flow
git commit -am "WIP checkout flow"
git push -u origin feature/checkout-flow   # sets upstream, future pushes need no args
# ...later, after cleaning up commits...
git rebase -i HEAD~5
git push --force-with-lease
```
Once `-u` has been used once, subsequent pushes on that branch are just `git push` with no remote/branch arguments — Git already knows where it tracks. This same tracked relationship is also what lets `git status` report "Your branch is ahead of 'origin/feature/checkout-flow' by 3 commits" without any network call, since it's comparing against the last-fetched state of the remote-tracking ref.

## Gotchas Deep-Dive
- **`--force-with-lease` without a recent fetch is a false sense of safety.** The lease check compares against your local remote-tracking ref (`refs/remotes/origin/main`), not the live state of the remote. If you haven't fetched since a teammate pushed, your stale remote-tracking ref matches what the lease expects, and the force-push proceeds anyway, overwriting their work. Running `git fetch` immediately before a `--force-with-lease` push is the only way to make the guarantee meaningful.
- **`--force-if-includes` closes that gap.** Added in Git 2.30, it additionally checks that the remote's actual current tip is an ancestor of (i.e. "included in") what your remote-tracking ref knows about, catching the exact stale-fetch scenario above. It's off by default; `push.useForceIfIncludes = true` turns it on automatically whenever `--force-with-lease` is used.
- **Deleting a branch remotely doesn't delete it locally, and vice versa.** `git push origin --delete old-branch` only removes the remote ref; your local `old-branch` (and everyone else's local copies) are untouched until each person runs their own `git branch -d old-branch`.
- **A rejected push isn't always about history.** Server-side hooks, branch protection rules, or a `pre-receive` hook rejecting the commit message format can all produce a rejected push that looks superficially like a non-fast-forward error but has a completely different cause — reading the actual rejection message from the remote matters, not just assuming "must need to pull first."
- **Pushing large binary files repeatedly bloats the remote regardless of `.gitignore`.** Once a large blob has been pushed, it's part of the object history permanently unless history is rewritten and force-pushed (and even then, until a `gc` prunes the old objects on the server, which many hosts don't do automatically) — `.gitignore` only prevents future accidental adds, it does nothing retroactively.

## History
`push.default` — the setting controlling which branch(es) a bare `git push` with no arguments targets — has shipped with different defaults across Git's history. Older Git defaulted to `matching` (push every local branch that has a same-named remote counterpart), which surprised people by pushing branches they didn't intend to share. Git 2.0 (2014) changed the default to `simple`: push only the current branch, and only if its name matches its upstream. This remains the default today and is generally considered the safer, more predictable behavior — it's part of why `-u`/`--set-upstream` matters so much on a branch's first push, since `simple` needs that tracking relationship established.

Other `push.default` values still exist for specific workflows: `current` pushes the current branch to a same-named remote branch regardless of tracking config, `upstream` pushes to whatever the current branch tracks (even if named differently), and `nothing` refuses a bare `git push` entirely, forcing every push to name its target explicitly.

## Common Interview Questions
**What's the difference between `git push` and `git push --force`?** A plain push only succeeds if it's a fast-forward — the remote ref must be an ancestor of what you're pushing. `--force` (or `-f`) overrides that check entirely and makes the remote ref point wherever your local branch says, discarding any commits on the remote that aren't in your local history.

**Why would a push be rejected even though you haven't touched that branch?** Someone else pushed to it since your last fetch. Your local branch no longer has the remote's current tip as an ancestor from the remote's perspective, so the fast-forward check fails — the fix is to fetch and reconcile (merge or rebase) before pushing, not to force.

**What's the practical difference between `-u` and plain `git push origin branch`?** `-u` additionally records the upstream tracking relationship in `.git/config` (`branch.<name>.remote` and `branch.<name>.merge`), so future bare `git push`/`git pull` commands on that branch know their target without needing it spelled out again.

## Common Pitfalls
- Using plain `--force` on a shared branch — it overwrites the remote unconditionally and can silently discard a teammate's commits with no warning; `--force-with-lease` is the safer default habit, though it still isn't foolproof if you haven't fetched recently
- Pushing to the wrong remote after cloning a fork — `origin` is usually your fork, `upstream` is the original repo; pushing straight to `upstream main` out of habit is a common mistake (see [[git remote]])
- Forgetting `-u` on a brand-new branch's first push, then having plain `git push` fail with "no upstream branch" on every subsequent attempt until it's set
- Assuming a successful push means CI/deploy has also run — pushing only updates the remote ref; any automated pipeline triggered by it is a separate system reacting asynchronously, and a push can succeed while the pipeline it triggers still fails
- Force-pushing to `main`/`master` at all — most teams enable branch protection specifically to reject this; if it's rejected server-side even with `--force`, that's the protection working as intended, not a bug
- Confusing "rejected: non-fast-forward" with a real conflict — it just means the remote has commits you don't have locally; the fix is usually `git pull --rebase` (or a fetch and manual rebase/merge), not force-pushing over it
- Trusting `--force-with-lease` blindly without a fresh fetch first — as covered in the Gotchas section, a stale remote-tracking ref can make the lease check pass even when it shouldn't, giving a false sense of safety
- Assuming `--tags` is implied by a normal push — annotated and lightweight tags are never pushed automatically unless they point at a commit being pushed and `--follow-tags` (or `push.followTags`) is set, or `--tags` is passed explicitly

## Real-World Example
Publishing a release tag alongside the commits it points to, a case where `--tags`/`--follow-tags` distinctions actually matter:
```
git checkout main
git pull --ff-only origin main
git tag -a v2.4.0 -m "Release 2.4.0"
git push origin main --follow-tags
```
`--follow-tags` here pushes `v2.4.0` automatically because it's an annotated tag pointing at a commit that's part of this push, without also pushing every other local tag that might exist for unrelated reasons (which plain `--tags` would do indiscriminately). This keeps the remote's tag list limited to intentionally-published releases.

## FAQ
**When is it actually safe to force-push?** On a branch only you are working on — most commonly your own feature branch after an interactive rebase or amend. Never on `main`, `develop`, or any branch others have already pulled and built on top of.

**What does "everything up-to-date" mean?** Your local branch and the remote already point at the same commit; there's nothing new to send. It's not an error.

**Can a push be undone?** On the remote, yes if you still know the previous commit hash — force-push back to it. Locally, the pre-push state is still in your own [[git reflog]] if you need to recover what you had before pulling something in.

**Does `git push` run any tests or checks before uploading?** Not by itself — but a repo can define a local `pre-push` hook (see [[Git Hooks]]) that runs arbitrary checks (linting, tests) and aborts the push on failure before anything reaches the network. Server-side, the remote can independently trigger CI after receiving the push, which is a separate mechanism entirely.

**What's the difference between pushing a branch and pushing a tag?** Branches are refs that move (each new commit updates them); tags are normally meant to be fixed points. `git push` doesn't push tags by default specifically because they're not expected to change — an explicit `--tags`/`--follow-tags` or naming the tag directly (`git push origin v2.4.0`) is required.

**What does `git push --dry-run` actually check?** It performs the full negotiation with the remote — figuring out which objects would need to be sent and whether the ref update would be accepted — without transmitting objects or updating any refs. It's a reliable way to confirm a force-push's blast radius before committing to it.

## Related Commands
- [[git pull]]
- [[git remote]]
- [[git rebase]]
- [[git fetch]]
- [[git reflog]]
- [[Git Hooks]]
- [[git branch]]
