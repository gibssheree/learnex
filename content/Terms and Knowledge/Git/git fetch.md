---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git fetch

**Definition:** Downloads commits, branches, and tags from a remote, without merging them into your local branches.

## Syntax
```
git fetch [<remote>] [<refspec>] [options]
```

## Common Options
- `--all` — fetch from every configured remote
- `--prune` — remove local references to remote branches that no longer exist on the remote
- `<remote> <branch>` — fetch just one branch instead of everything
- `--tags` — also fetch all tags, even ones not reachable from fetched branches
- `--dry-run` — show what would be fetched without downloading or updating any refs

## Basic Example
```
git fetch origin
```
Updates your local knowledge of `origin`'s branches without touching your working files.

## Extended Example
```
git fetch --all --prune
```
Refreshes every remote's branch list and cleans up stale remote-tracking branches that were deleted on the server, keeping `git branch -a` output tidy.

## Under the Hood
A remote in Git isn't a live connection — it's a URL plus a set of **remote-tracking branches**, refs of the form `refs/remotes/<remote>/<branch>` (e.g. `refs/remotes/origin/main`) that record where each remote branch was last known to point. `git fetch` is the operation that updates those remote-tracking refs to match the actual state of the remote:

1. Connects to the remote and asks what refs it has and their current SHAs.
2. Downloads any commit, tree, and blob objects you don't already have that are reachable from those refs — the actual network transfer, negotiated efficiently so Git only sends objects you're missing.
3. Updates your local `refs/remotes/<remote>/*` refs to point at the new SHAs.
4. Updates `FETCH_HEAD`, a temporary ref recording what was just fetched, used internally by `git pull`.

Critically, step 3 never touches `refs/heads/*` — your actual local branches. That's the entire distinction between `fetch` and `pull`: fetch updates your *knowledge* of the remote (`origin/main` moves), while your own `main` branch and working directory stay completely untouched until you explicitly merge or rebase, which `git pull` does automatically as a second step.

## Flags Reference
| Flag | Effect |
|---|---|
| `--all` | Fetch from every configured remote |
| `--prune` (`-p`) | Delete local remote-tracking refs for branches removed on the remote |
| `--prune-tags` | Same, but for tags (requires `--prune` or `fetch.pruneTags`) |
| `--tags` | Fetch all tags, not just ones reachable from fetched branches |
| `--no-tags` | Fetch no tags at all |
| `--depth <n>` | Shallow-fetch, limiting history depth |
| `--unshallow` | Convert a shallow repo into a full one by fetching remaining history |
| `--dry-run` | Show what would happen without transferring or updating refs |
| `-v`, `--verbose` | Show detailed ref update output |
| `<remote> <branch>` | Fetch only the specified branch |
| `--force` (`-f`) | Allow non-fast-forward updates to remote-tracking refs |
| `--recurse-submodules` | Also fetch updates for any submodules |
| `-j <n>`, `--jobs <n>` | Fetch multiple submodules in parallel |

## Common Workflow
Keeping remote-tracking refs accurate on a repo where branches get deleted often after merging:
```
git fetch --all --prune
git branch -a
```
Without `--prune`, `origin/<deleted-branch>` would linger locally forever, cluttering `git branch -a` and tab-completion with branches that no longer exist upstream.

Checking what's new on a branch before deciding whether to integrate it:
```
git fetch origin
git log HEAD..origin/main --oneline
git diff HEAD...origin/main --stat
```
This inspects incoming changes without touching your working directory or local branch at all — you can review exactly what a `pull` or `merge` would bring in, and back out with zero cleanup if you decide not to integrate it yet.

Recovering a shallow clone to full history:
```
git fetch --unshallow
```

Setting up a read-only "upstream" remote to track an open-source project you've forked, without ever pushing to it:
```
git remote add upstream https://github.com/original/project.git
git remote set-url --push upstream DISABLE
git fetch upstream
git log main..upstream/main --oneline
```
Setting the push URL to a bogus value is a common safety trick — it lets you fetch from `upstream` freely while making an accidental `git push upstream` fail loudly instead of silently attempting to push to a repo you don't have write access to anyway.

## Comparison
| | `git fetch` | `git pull` |
|---|---|---|
| Updates remote-tracking refs (`origin/main`) | Yes | Yes |
| Updates your local branch (`main`) | No | Yes |
| Touches the working directory | No | Yes |
| Can cause a merge conflict | No | Yes |
| Typical use | Safely check what's new | Actually integrate remote changes |

## Common Pitfalls
- Assuming `fetch` updates your working files like `pull` does — it only updates your local knowledge of the remote, your own branch doesn't move
- Forgetting `--prune` and accumulating stale remote-tracking branches for every deleted upstream branch, making `git branch -a` and autocomplete noisy and slow to scan
- Running `git fetch` on a shallow clone and expecting full history to appear — a normal fetch on a shallow repo still respects the existing depth; you need `--unshallow` or an explicitly increased `--depth`
- Confusing `FETCH_HEAD` with a branch — it's a transient marker of the last fetch, overwritten by the next `fetch`, not something to build work on directly
- Fetching a single branch with `git fetch origin some-branch` and then being confused that `git checkout some-branch` doesn't work — a one-off branch fetch like that only updates `FETCH_HEAD`, it doesn't create a local tracking branch automatically; use `git fetch origin some-branch:some-branch` to also create a local branch
- Assuming a scheduled/background `git fetch` is completely free — on very large repos or with many remotes, frequent automatic fetching (some IDEs and Git clients do this every few minutes) has a real bandwidth and server-load cost, which is why `fetch.prunetags` and interval settings exist to tune it
- Forgetting that `git fetch` alone doesn't warn you about conflicts — since it never touches your branch, there's nothing to conflict yet; the conflict only surfaces later when you `merge`, `rebase`, or `pull`
- Assuming every remote branch is automatically trackable after a fetch — `git checkout <branch>` on a recent Git version auto-creates a local tracking branch from a uniquely-matching remote-tracking ref, but with multiple remotes having the same branch name, that shorthand becomes ambiguous and fails
- Fetching from a remote over an unauthenticated protocol (plain `git://`) on a network you don't trust — unlike HTTPS or SSH, it has no encryption or server verification, making it vulnerable to tampering in transit

## Gotchas Deep-Dive
- **Refspecs control what fetch actually does**: the default refspec (`+refs/heads/*:refs/remotes/origin/*`, visible via `git config --get remote.origin.fetch`) is what maps remote branches to local remote-tracking refs. Custom refspecs let you fetch things that aren't normal branches — e.g. `git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'` pulls down every GitHub pull request as a local ref, without any GitHub-specific tooling.
- **`fetch.prune` as a persistent default**: `git config --global fetch.prune true` makes every future `fetch` behave like `fetch --prune` automatically, which most people want once they've been bitten by stale branch clutter once.
- **Force-updated remote branches**: if someone force-pushes a branch upstream, a plain `git fetch` updates your remote-tracking ref to match — but if your fetch would have to discard commits from that remote-tracking ref (a non-fast-forward update), Git reports a rejected update for that ref specifically, distinct from a rejected push.
- **Fetching tags can pull in unexpected objects**: `--tags` fetches every tag on the remote regardless of whether it's reachable from a branch you're tracking, which can pull in entire disconnected pieces of history attached only to an old release tag.
- **Partial and shallow fetches interact with `--depth`**: running `git fetch --depth 10` on a repo that's already shallow at depth 5 extends the history further back, but repeatedly shallow-fetching with varying depths can leave a slightly inconsistent shallow boundary that `git fsck` will flag as unusual, though not corrupt.
- **`fetch.parallel`**: a config value controlling how many submodules (or, with newer Git, remotes) are fetched concurrently, distinct from the per-invocation `--jobs` flag — useful as a persistent default in monorepos with many submodules.

## Common Interview Questions
**"Why is `git fetch` considered safe to automate, but `git pull` isn't?"** Fetch never modifies local branches or the working directory, so it can't create merge conflicts or lose uncommitted work — pull's implicit merge/rebase step can do both.

**"How would you inspect what a `pull` would bring in before running it?"** `git fetch` followed by `git log HEAD..origin/<branch>` (or `git diff HEAD...origin/<branch>`) to preview the incoming commits without integrating them.

**"What does `--prune` actually delete?"** Only local remote-tracking refs (`refs/remotes/origin/*`) for branches gone from the remote — it never deletes local branches you created yourself, even ones named the same.

**"How would you fetch a specific pull request from GitHub without a GitHub-specific CLI tool?"** `git fetch origin pull/123/head:pr-123`, using GitHub's convention of exposing PR heads as refs under `refs/pull/<number>/head` on the remote.

**"Your teammate says `origin/main` looks outdated in their local repo — what's the actual cause?"** They simply haven't fetched recently; `origin/main` is a snapshot from their last `fetch` (or `pull`, which fetches internally), not a live view of the remote, so it only updates on demand.

## FAQ
**Is `git fetch` safe to run at any time?** Yes — it never modifies your working directory, staged changes, or local branches, only remote-tracking refs. It's effectively read-only from your working copy's perspective, which is why it's fine to run frequently or on a timer.

**How do I fetch just tags, without any branches?** `git fetch --tags origin` (combine with `--no-recurse-submodules` if submodules aren't relevant to the check).

**Why does `git status` say "your branch is behind" only after I fetch?** `git status` compares your branch against its remote-tracking ref (`origin/main`), which is only as current as your last fetch — it doesn't contact the network itself.

**What does `git remote show origin` add on top of a plain fetch?** It fetches (unless `-n` is passed) and then prints a full summary: tracked branches, which are stale, and push/pull configuration — useful for auditing a remote's setup in one shot.

**Can `git fetch` fail partway through and leave things in a bad state?** No worse than "some refs updated, some didn't" — each ref update is effectively independent, so a network drop mid-fetch just means the next fetch picks up where it left off, without corrupting anything already written.

**Does fetching require write access to the remote?** No — fetch is a read-only operation from the remote's perspective, which is why anonymous/public clones can fetch freely even without any push credentials configured.

**How is `git fetch` different from `git remote update`?** `git remote update` fetches from every remote configured with `remote.<name>.skipFetchAll` unset — essentially a multi-remote wrapper. A plain `git fetch <remote>` targets just one.

## Related Commands
- [[git pull]]
- [[git remote]]
- [[git clone]]
- [[git branch]]
- [[git log]]
