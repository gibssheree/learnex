---
tags: [term, git, setup]
category: Setup & Configuration
---

# git clone

**Definition:** Copies an existing remote repository, and its full history, to your local machine.

## Syntax
```
git clone [options] <url> [<directory>]
```

## Common Options
- `--depth <n>` — shallow clone, only fetch the last n commits, much faster for huge repos
- `-b <branch>` / `--branch <branch>` — clone and check out a specific branch instead of the default
- `--recurse-submodules` — also clones any submodules the repo references
- `--single-branch` — only fetch history for the branch being checked out, not every branch
- `--bare` — create a bare repository (no working directory), used as a shared/central remote
- `--mirror` — like `--bare` but also mirrors every ref, including remote-tracking branches, for full backups

## Basic Example
```
git clone https://github.com/user/repo.git
```
Downloads the repo into a folder named `repo`, checks out the default branch (whatever HEAD points to on the remote, usually `main`), and automatically configures a remote named `origin` pointing back at the source URL.

## Extended Example
```
git clone --depth 1 -b develop https://github.com/user/repo.git my-copy
```
Shallow-clones only the `develop` branch's latest commit into a folder named `my-copy` — much faster when you don't need full history.

A more realistic scenario: onboarding onto a large monorepo where a full clone would take twenty minutes and most of the tree is irrelevant to your work:
```
git clone --filter=blob:none --no-checkout https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout init --cone
git sparse-checkout set packages/api packages/shared
git checkout main
```
This combines a partial clone (`--filter=blob:none` defers downloading file *contents* until something actually needs them) with sparse-checkout (only materializes the two packages you work in). You get full commit history and metadata instantly, while blobs stream in lazily as you touch files outside the initial fetch.

## Under the Hood
`git clone` isn't a single primitive — it's a scripted sequence of lower-level operations:
1. Creates the target directory and initializes a `.git` directory inside it (equivalent to `git init`).
2. Adds a remote named `origin` pointing at the URL you gave, roughly `git remote add origin <url>`.
3. Fetches all objects and refs from that remote — every commit, tree, blob, and tag reachable from its branches (or a truncated set, if `--depth` was used).
4. Creates local branches that track the remote's branches, and points local `HEAD` at whatever the remote's `HEAD` referenced.
5. Checks out the working directory for that default branch.

Every commit, file version, and directory snapshot from the source repo is stored locally as a Git object (blob/tree/commit) under `.git/objects`. This is why clones carry full project history by default — you're not downloading a snapshot, you're downloading the entire reachable object graph. `--depth` truncates that graph at the requested number of commits, producing a *shallow* repository: commits older than the cutoff simply don't exist locally, and Git records the cutoff in `.git/shallow` so it knows where history "ends" artificially.

## Flags Reference
| Flag | Effect |
|---|---|
| `--depth <n>` | Truncate history to the last n commits (shallow clone) |
| `--shallow-since=<date>` | Truncate history to commits after a given date |
| `-b`, `--branch <name>` | Check out `<name>` instead of the remote's default branch |
| `--single-branch` | Fetch only the history of the branch being checked out |
| `--no-single-branch` | Explicitly fetch all branches even when `--depth` is set |
| `--recurse-submodules` | Initialize and clone submodules recursively |
| `--filter=blob:none` | Partial clone — commits/trees fetched immediately, file contents fetched on demand |
| `--bare` | No working directory; `.git` contents live at the top level of the target |
| `--mirror` | Bare clone plus all refs (branches, tags, remote-tracking refs) — for exact mirrors and backups |
| `--origin <name>` | Name the remote something other than `origin` |
| `-c <key>=<value>` | Set a config value in the new repo's local config immediately on clone |
| `--no-checkout` | Fetch objects but skip populating the working directory |
| `--reference <repo>` | Borrow objects from an existing local repo to speed up the clone and save disk |
| `--dissociate` | Used with `--reference` to copy borrowed objects in afterward, removing the dependency on the reference repo |
| `--jobs <n>` | Fetch submodules in parallel with `--recurse-submodules` |

## Common Workflow
Setting up a fork-based contribution workflow:
```
git clone https://github.com/you/repo.git
cd repo
git remote add upstream https://github.com/original-owner/repo.git
git fetch upstream
git checkout -b my-feature upstream/main
```
You clone your fork (which becomes `origin`), then add the original project as a second remote (`upstream`) so you can pull in its latest changes without polluting your fork's default branch history.

Mirroring a repo for backup or migration purposes:
```
git clone --mirror https://github.com/org/repo.git repo-backup.git
cd repo-backup.git
git remote set-url origin https://gitlab.com/org/repo.git
git push --mirror
```
`--mirror` captures every branch, tag, and remote-tracking ref exactly as it exists upstream (not just what a normal clone would check out), and `push --mirror` replays that entire ref set onto a new host — the standard pattern for migrating a repo between hosting providers with zero history loss.

## Comparison
| | `git clone` | `git init` |
|---|---|---|
| Starting point | Existing remote repository | Empty or existing local directory |
| History | Copies full (or shallow) history | Starts with zero commits |
| Remote setup | Automatically adds `origin` | No remote configured |
| Use case | Getting a working copy of an existing project | Starting a brand-new project |

## Common Pitfalls
- Using `--depth` then later needing full history for `git blame` or `git log` investigation — you have to un-shallow it with `git fetch --unshallow`
- Cloning a huge repo with all its history when you only need the latest state — costs bandwidth and disk for history you'll never inspect; use `--depth 1` for CI checkouts that just need to build
- Forgetting `--recurse-submodules` on a repo that uses submodules — you end up with empty directories where the submodules should be, and have to run `git submodule update --init --recursive` afterward
- Cloning over HTTPS into a script or CI job without a credential helper configured — every subsequent fetch prompts for a password; use a token or SSH instead
- Assuming a shallow clone (`--depth`) can be worked with freely — pushing new commits works fine, but merge-base calculations and some rebases against the truncated history will fail or behave unexpectedly
- Re-cloning a large repo from scratch every time you need a clean copy instead of using `git clone --reference <existing-local-repo>` to borrow objects from a copy you already have on disk, saving bandwidth and time
- Cloning into a directory that already exists and isn't empty — Git refuses outright rather than merging into it, unlike some other tools that silently overlay files
- Assuming `--mirror` and `--bare` are interchangeable — `--mirror` implies `--bare` and adds a refspec that mirrors *every* ref, including remote-tracking branches; a plain `--bare` clone only gets branches and tags, not the source's own remote-tracking refs
- Forgetting that a clone's remote-tracking branches (`origin/main`, etc.) are a snapshot from clone time — they go stale the moment someone else pushes, and only update on your next `git fetch` or `git pull`, not automatically

## Gotchas Deep-Dive
- **Shallow clones and CI**: many CI systems default to `--depth 1` for speed. This breaks any tooling that needs commit count or tags reachable from older history — version-from-git-tags schemes (`git describe`), changelogs, and `git blame` past the cutoff all fail silently or error out. Fetch full depth, or at least tags, when the build depends on them: `git fetch --tags --unshallow`.
- **LFS repos clone in two phases**: Git LFS repos download pointer files (tiny text stubs) fast as part of the normal clone, then fetch actual large-file content via a separate smudge filter during checkout. A clone can appear "done" while LFS content is still transferring, and a network failure there leaves literal pointer text sitting in files that should contain binaries.
- **Protocol choice affects auth, not content**: `https://` URLs prompt for a username/token, cached by a credential helper; `git@github.com:...` (SSH) URLs authenticate with your SSH key and skip password prompts once the key is registered with the host. Switching a clone's protocol later means editing `origin`'s URL with `git remote set-url`, not re-cloning.
- **Case-insensitive filesystems**: cloning a repo on macOS or Windows that has two files differing only by case (legal in the object database on a case-sensitive system) silently collapses one onto the other in your working directory.
- **Disk space, `.git` vs working tree**: a clone's `.git` directory can dwarf the working tree on repos with long history or large binary churn, since every past version of every file is stored. `du -sh .git` versus the checked-out files makes this obvious on an old repo.
- **Default branch surprises**: the branch you land on after cloning is whatever the remote's `HEAD` points to, which the remote's maintainers control server-side — it can legitimately differ from `main` or `master`, and scripts that hardcode a branch name can silently check out the wrong thing on a rename.

## History
- Early Git (2005) supported only the `git://` protocol and local filesystem clones.
- "Smart" HTTP transport — negotiated fetches instead of dumb static file serving — arrived later and is now the default for most hosted services (GitHub, GitLab, Bitbucket).
- Shallow clones (`--depth`) were added specifically to make CI and one-off checkouts practical on repos with years of accumulated history.
- Partial clones (`--filter=blob:none` / `--filter=blob:limit=<size>`) landed in Git 2.19+, aimed at very large monorepos where even a shallow clone still transfers more file content than a given workflow needs.

## Common Interview Questions
**"What's the difference between `git clone` and `git pull` on a fresh directory?"** You can't `git pull` into a directory with no repository — `pull` requires an existing local repo with a configured remote. `clone` is the bootstrapping step that creates that repo in the first place; `pull` is what you run afterward to stay current.

**"How would you clone only the last week of history?"** `git clone --shallow-since="1 week ago" <url>`.

**"If two people clone the same repo, do they get identical commit hashes?"** Yes — commit hashes are deterministic content hashes, not machine- or user-specific IDs, so every clone of the same history produces byte-identical commit objects and SHAs.

**"Why might cloning the same URL take vastly different times on two machines?"** Network latency and bandwidth to the remote dominate for large repos, but so does whether the remote supports smart HTTP / partial-clone negotiation — an older or misconfigured server falls back to slower transport.

## FAQ
**Does `git clone` copy uncommitted changes from the source machine?** No — it only copies what's been committed to the repository. Local working-directory changes on the source machine never leave that machine.

**Can I clone just one file?** Not directly — `git clone` always copies the repository (or a filtered subset via `--filter`), never individual files. Combine `--filter=blob:none` with sparse-checkout if you only need specific paths.

**What happens to `.git` if I clone a bare repo?** With `--bare`, the contents that would normally live inside `.git/` are placed directly at the top level of the target directory instead, and there's no working directory at all — it's meant to be a server-side or shared remote, not something you edit files in directly.

**Why does the clone default to a branch I didn't ask for?** It checks out whatever the remote's `HEAD` points to, which the remote's own maintainers configure — usually `main`, but can be changed server-side independently of any local setting.

**Does `git clone` also copy the remote's hooks or config?** No — `.git/hooks` and most of the remote's server-side configuration are never transferred. You get the object history and refs only; any hooks you want locally have to be set up yourself, or distributed through some other mechanism like a setup script.

**Can I clone from a local path instead of a URL?** Yes — `git clone /path/to/repo` (or `file:///path/to/repo`) works, and by default hard-links objects instead of copying them when both are on the same filesystem, making local clones nearly instantaneous.

**How do I check whether a clone is shallow after the fact?** `git rev-parse --is-shallow-repository` returns `true` or `false`; `cat .git/shallow` (if present) lists the commit SHAs where history is truncated.

## Related Commands
- [[git init]]
- [[git remote]]
- [[git fetch]]
- [[git submodule]]
