---
tags: [term, git, remote]
category: Remote & Collaboration
---

# git remote

**Definition:** Manages the set of remote repositories, such as GitHub or GitLab URLs, that your local repo is connected to and can fetch from or push to.

## Syntax
```
git remote [-v]
git remote add <name> <url>
git remote remove <name>
git remote rename <old> <new>
git remote set-url <name> <new-url>
git remote set-url --push <name> <new-url>
git remote get-url <name>
git remote show <name>
git remote prune <name>
git remote update [<name>]
```

## Common Options
- `-v` / `--verbose` — show remote names with both their fetch and push URLs
- `add <name> <url>` — connect a new remote under a given name
- `remove` (alias `rm`) `<name>` — disconnect a remote entirely (also drops its remote-tracking branches)
- `rename <old> <new>` — rename a remote, updating its remote-tracking branch namespace and any `branch.<name>.remote` config too
- `set-url <name> <url>` — change an existing remote's fetch URL, e.g. switching from HTTPS to SSH
- `set-url --push <name> <url>` — set a separate push URL distinct from the fetch URL (used for push-only mirrors or read-only fetch caches)
- `get-url <name>` — print a remote's configured URL(s), useful in scripts
- `show <name>` — show detailed info about a remote: its URLs, which local branches track it, and which remote branches are stale
- `prune <name>` — delete local remote-tracking refs for branches that no longer exist on the remote
- `update` — shorthand that fetches all remotes (or remote groups) configured for it at once

## Basic Example
```
git remote -v
```
Lists all configured remotes and their URLs for both fetch and push. A freshly cloned repo has exactly one, `origin`, pointing at the URL you cloned from.

## Extended Example
```
git remote add upstream https://github.com/original-owner/repo.git
git fetch upstream
git remote -v
git rebase upstream/main
```
Adds a second remote named `upstream`, the standard setup for contributing to a forked open-source repo, then syncs your fork's local `main` with the original project's latest commits before opening a pull request (your fork stays `origin`, the original repo becomes `upstream`). Running `git remote -v` afterward confirms both remotes are wired up correctly before rebasing onto `upstream/main`.

## Under the Hood
`git remote` is largely a friendly wrapper around editing `.git/config`. Adding a remote writes a stanza like:
```
[remote "origin"]
	url = https://github.com/you/repo.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```
That `fetch` line is a refspec — it tells Git where to write the remote's branches locally. When you run `git fetch origin`, Git downloads objects and updates refs under `refs/remotes/origin/*`, which is why `origin/main` is a *local, read-only snapshot* of the remote's `main`, not a live view of it. It only moves when you fetch again — never on its own. `git remote add` writes the default refspec automatically; `git remote set-branches` narrows it to specific branches, useful in large monorepos where you only care about a handful. Deleting a remote with `remove` deletes both the config stanza and every ref under `refs/remotes/<name>/`, but leaves any local branches you created from them (say, a local `feature` branch checked out from `origin/feature`) completely untouched, since local branches live under the independent `refs/heads/` namespace.

Remote-tracking state also surfaces through `git branch -vv`:
```
git branch -vv
```
```
* main     a1b2c3d [origin/main] Fix header bug
  feature  d4e5f6g [origin/feature: ahead 2] Add search
```
`-vv` reads the `branch.<name>.remote` and `branch.<name>.merge` config entries that were written when the branch was created or pushed with `-u`, then compares your local commit against the cached remote-tracking ref to compute the "ahead/behind" counts — again, all cached data from the last fetch, not a live query.

## URL Formats & Authentication
Remote URLs come in two common shapes:
```
https://github.com/user/repo.git       # HTTPS — prompts for username/token, cacheable via a credential helper
git@github.com:user/repo.git           # SSH — authenticates via a local SSH key, no password prompt once configured
```
HTTPS remotes rely on a credential helper (`git config credential.helper`) to avoid retyping a personal access token on every push; SSH remotes rely on `~/.ssh/config` and an `ssh-agent` holding the matching private key. Mixing the two on the same workflow — cloning over HTTPS, then trying to push with an SSH key registered on the hosting service — is a common source of "permission denied (publickey)" or repeated password prompt errors. `git remote set-url` is the fix: switch the URL scheme in place without re-cloning the whole repo.

## Flags Reference
| Flag | Effect |
|---|---|
| `-v`, `--verbose` | Show fetch and push URLs per remote |
| `add -t <branch>` | Track only the given branch(es) when adding a remote |
| `add -f` | Run `git fetch` immediately after adding the remote |
| `add --mirror=fetch\|push` | Configure the remote as a fetch or push mirror |
| `set-url --add` | Add an additional URL to a remote instead of replacing it (push to multiple URLs at once) |
| `set-url --delete` | Remove one URL from a remote that has several |
| `show -n` | Skip querying the remote for stale-branch info (faster, less accurate) |
| `prune -n` / `--dry-run` | Preview which stale tracking refs would be deleted, without deleting them |
| `update -p` | Prune stale remote-tracking refs while updating |

## Common Workflow
A typical fork-and-contribute cycle uses two remotes together:
```
git clone https://github.com/you/repo.git
cd repo
git remote add upstream https://github.com/original-owner/repo.git
git fetch upstream
git switch -c feature-branch upstream/main
# ...make changes, commit...
git push origin feature-branch
```
`origin` is where you push your work (your fork); `upstream` is where you pull the latest project state from. This keeps your fork's `main` clean and avoids ever pushing directly to the upstream project, which you typically can't do anyway without write access.

## Comparison
| Concept | What it is | Where it lives |
|---|---|---|
| Remote | A named URL Git knows about (`origin`, `upstream`) | `.git/config` |
| Remote-tracking branch | Local snapshot of a remote's branch as of the last fetch | `refs/remotes/<remote>/<branch>` |
| Local branch | Your own branch, may or may not track a remote one | `refs/heads/<branch>` |

## Common Pitfalls
- Confusing `origin` (your default remote, usually your own fork) with `upstream` (someone else's repo you forked from), and pushing to the wrong one
- Changing a remote's URL with `set-url` after switching auth methods (HTTPS to SSH) and forgetting that existing clones on other machines still point at the old URL — every collaborator has to run the same `set-url` locally, this command doesn't propagate
- Deleting a remote with `remove` and being surprised its remote-tracking branches (`<remote>/<branch>`) vanish too, even though local branches based on them stay intact
- Assuming `origin/main` updates automatically — it's a cached ref, only refreshed by `fetch`, `pull`, or `remote update`; it can silently drift stale for weeks on an inactive local clone, making `git status`'s "ahead/behind" counts misleading
- Running `git remote show origin` on a large or slow remote and being surprised it hangs — unlike `-v`, it actually contacts the remote over the network to check branch status

## FAQ
**Can a repo have more than two remotes?** Yes, there's no limit — some setups add a `staging`, `production`, or per-teammate remote alongside `origin`/`upstream`.

**Does renaming a remote break my branches' tracking?** No — `git remote rename` updates the `branch.<name>.remote` config for every branch that tracked the old name, so tracking relationships survive the rename.

**How do I stop tracking a remote branch that was deleted upstream?** Run `git fetch --prune` or `git remote prune origin` to clear out local refs for branches that no longer exist on the remote.

**What's the difference between `git remote update` and `git fetch --all`?** Functionally similar — both fetch every configured remote — but `remote update` also understands remote groups defined under `[remotes "<group>"]` in `.git/config`, letting a single command fetch a curated subset by group name instead of literally everything.

**Why does `git push` sometimes create a remote branch I never explicitly asked for?** Because the local branch had no upstream tracking configured yet; `git push -u origin <branch>` (or a `push.autoSetupRemote` config) creates the corresponding branch on the remote server and wires up tracking in the same step, so future plain `git push` calls know where to go.

## Real-World Example
Migrating a repository to a new hosting provider without losing any history, branches, or tags:
```
git remote rename origin old-origin
git remote add origin https://github.com/neworg/repo.git
git push -u origin --all
git push origin --tags
git remote remove old-origin
```
Pushing `--all` sends every local branch, not just the current one, and `--tags` sends every tag separately since tags aren't included by a plain branch push. Keeping `old-origin` around until both pushes succeed gives a fallback if something fails partway through; only remove it once `git remote show origin` on the new host confirms everything landed.

A second common case: adding a deploy-only remote alongside the normal collaboration remote, common with platforms that deploy directly from a git push:
```
git remote add production git@deploy-host:app.git
git push production main
```
`production` never needs fetching or tracking branches — it exists purely as a push target, which is a legitimate one-directional use of `git remote add`.

## History
Git's remote protocol got a significant upgrade with "protocol version 2" (Git 2.18+, `protocol.version=2`), which made operations like `ls-remote` and fetching against repos with many refs — large monorepos with thousands of branches and tags — dramatically faster by letting the client filter ref advertisements server-side instead of always downloading the full list. Git negotiates the highest protocol both client and server support automatically, so the upgrade was transparent: older clients still work fine against v2 servers by falling back to v0.

## Related Commands
- [[git clone]]
- [[git fetch]]
- [[git push]]
- [[git branch]]
- [[git config]]
