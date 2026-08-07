---
tags: [term, git, advanced]
category: Advanced & Internals
---

# git submodule

**Definition:** Embeds another Git repository as a subdirectory inside your repo, pinned to a specific commit.

## Syntax
```
git submodule [add|status|init|update|sync|foreach|deinit|absorbgitdirs] [options]
```

## Common Options
- `add <url> <path>` — add a new submodule
- `add -b <branch> <url> <path>` — track a specific branch of the submodule instead of a detached commit
- `update --init --recursive` — after cloning a repo with submodules, actually pull down their content (and any submodules-of-submodules)
- `update --remote` — move the submodule to the latest commit on its tracked branch, not just the commit recorded in the superproject
- `foreach <command>` — run a command inside every submodule
- `status --recursive` — show each submodule's checked-out commit and whether it's dirty
- `sync` — update submodule URLs from `.gitmodules` if they changed
- `deinit -f <path>` — remove a submodule's working directory content while leaving its history in `.git/modules`

## Basic Example
```
git submodule add https://github.com/org/shared-lib.git libs/shared
```
Adds another repo as a subfolder, pinned to its current commit.

## Extended Example
```
git clone --recurse-submodules <url>
```
Or, after a normal clone: `git submodule update --init --recursive` — the two-step dance needed because submodules don't come along automatically with a plain clone.

Updating a submodule to newer upstream code and recording that in the superproject:
```
cd libs/shared
git fetch
git checkout origin/main
cd ../..
git status                 # shows libs/shared as modified (new pinned commit)
git add libs/shared
git commit -m "Bump shared-lib to latest main"
```
The superproject commit doesn't store the submodule's files — it stores the exact SHA the submodule is checked out at. Anyone who later clones or updates picks up exactly that commit, not whatever is newest upstream.

## Under the Hood
The superproject doesn't track submodule content as files. In the tree object, a submodule path is a **gitlink** — a special tree entry with mode `160000` whose "content" is just a 40-character commit SHA, no blob involved. `git ls-tree HEAD` shows this directly:
```
160000 commit a1b2c3d...    libs/shared
```
The mapping of path to remote URL (and optionally branch) lives in a tracked file, `.gitmodules`, at the superproject root — that file is what `git submodule add` writes and what `init`/`sync` read from.

A submodule's actual `.git` isn't a full directory inside `libs/shared` — it's a one-line file:
```
gitdir: ../../.git/modules/libs/shared
```
The real object database, refs, and config for the submodule live under the superproject's `.git/modules/<name>/`. This is the same "absorbed gitdir" mechanism `git worktree` uses for linked worktrees — it's what lets you delete and re-add the submodule's working directory without losing its history, as long as `.git/modules/<name>` survives.

## Flags Reference
| Flag | Subcommand | Effect |
|---|---|---|
| `-b <branch>` | `add` | Track a branch instead of a fixed commit for future `update --remote` |
| `--init` | `update` | Initialize submodules that were cloned but never set up |
| `--recursive` | `update` | Also handle nested submodules-of-submodules |
| `--remote` | `update` | Use the submodule's tracked branch tip instead of the superproject's recorded SHA |
| `--depth <n>` | `update` | Shallow-clone the submodule history |
| `-f`, `--force` | `deinit` | Remove even if the submodule has local modifications |
| `--recursive` | `status`, `foreach` | Recurse into nested submodules |
| `-q`, `--quiet` | most | Suppress progress output |
| `--reference <repo>` | `add`, `update` | Share objects with a local reference repo to speed up fetch and save disk |
| `-j <n>`, `--jobs <n>` | `update` | Fetch multiple submodules in parallel |
| `--checkout` / `--rebase` / `--merge` | `update` | Choose how the submodule's working tree is updated to the target commit |

## Common Workflow
Onboarding a new clone of a project that uses submodules:
```
git clone https://github.com/org/app.git
cd app
git submodule update --init --recursive
```
Changing a submodule's remote URL (e.g. after a repo move) and propagating it:
```
# edit .gitmodules manually, change the url= line
git submodule sync
git submodule update --init --recursive
```
`sync` is required because Git caches the resolved URL separately in `.git/config`, not just `.gitmodules` — editing the tracked file alone doesn't change where `update` actually fetches from.

## Real-World Example
Vendoring a shared design-system library into two separate product repositories, each pinned independently:
```
# in product-web
git submodule add -b main https://github.com/org/design-system.git vendor/design-system
git commit -m "Vendor design-system as submodule"

# months later, bump to a newer, tested release
cd vendor/design-system
git fetch --tags
git checkout v4.2.0
cd ../..
git add vendor/design-system
git commit -m "Bump design-system to v4.2.0"
git push
```
`product-mobile`, a separate repository with its own submodule pointing at the same URL, can stay on an older tag until its team is ready — that independence is the entire point of pinning by commit rather than always tracking a moving branch.

## Comparison
| | `git submodule` | `git subtree` |
|---|---|---|
| Storage | pointer (SHA) to external repo | full history merged into main repo |
| Clone size | small, content fetched separately | larger, everything is local from clone |
| Requires extra steps after clone | yes (`update --init`) | no |
| History of the embedded project | kept separate | merged into host repo's log (can be filtered back out) |
| Built into core git | yes | yes, as a contrib merge strategy, less commonly taught |

## Common Pitfalls
- Forgetting the `update --init` step after cloning, ending up with empty submodule folders and confusing missing-file errors
- Working inside a submodule on a **detached HEAD** without noticing — `submodule update` checks out the recorded commit directly, not a branch, so commits made there can be orphaned unless you first `checkout -b` or push before switching away
- Changing files inside a submodule, committing there, but forgetting to also `git add` the submodule path and commit in the superproject — the pointer update is a separate, easy-to-miss commit
- Deleting a submodule with a plain `rm -rf libs/shared` instead of `git submodule deinit` + `git rm` — this leaves stale entries in `.gitmodules`, the index, and `.git/modules`, and confuses future clones
- Assuming `git submodule update` alone pulls the *latest* code — without `--remote` it only ever restores the exact commit the superproject already has pinned
- Running plain `git pull` in the superproject and assuming submodule content updated too — only the gitlink SHA updates; the submodule's working directory needs its own explicit `submodule update`
- Configuring `--recursive` at only one level for a submodule that itself has submodules, leaving grandchild submodules as empty directories despite `init --recursive` appearing to succeed

## History
Submodules have a reputation as one of Git's rougher edges, and it's largely earned by early versions: for a long time cloning a repo with submodules required manually running `init` then `update` as two separate steps with no combined flag, deleting a submodule left orphaned data in `.git/modules` with no cleanup command, and there was no way to run a command across all submodules without hand-rolled shell loops. `submodule foreach`, `--recurse-submodules` on `clone`/`pull`/`push`, and `deinit` were all added incrementally to close these gaps, but the reputation for friction predates the tooling that now mostly addresses it.

## Gotchas Deep-Dive
Running plain `git pull` in the superproject after someone else added or repointed a submodule does **not** update the submodule content — it only updates the gitlink SHA recorded in the superproject's tree. The working directory of the submodule keeps whatever was checked out before, now silently out of sync with the pointer, until you explicitly run `git submodule update`. Teams commonly wire this into a post-merge hook (`git config --global alias.pullall '!git pull && git submodule update --init --recursive'`) precisely because it's so easy to forget.

Branch tracking for submodules is opt-in and easy to lose: `.gitmodules` can record a `branch =` line, but `git submodule update` without `--remote` always checks out the recorded commit, not the tracked branch's tip — the branch setting only matters when `--remote` is explicitly passed. Teams that expect submodules to "just follow main" are often surprised that nothing moves without that flag.

Nested submodules (a submodule that itself has submodules) require `--recursive` at every level — `git submodule update --init` alone only initializes the first level, leaving grandchild submodules as empty directories, a subtler version of the same "forgot `--init`" mistake at one level deeper.

## Common Interview Questions
**What's actually stored in the superproject's repository for a submodule?** Only a gitlink — a tree entry of mode `160000` holding the submodule's commit SHA — plus its path/URL mapping in `.gitmodules`. No submodule file content or history lives in the superproject's own object database.

**Why does cloning with submodules require an extra step compared to a normal clone?** Because the default clone only fetches the superproject's objects. The gitlink SHA tells Git *which* commit a submodule should be at, but not *how to fetch it* at clone time unless `--recurse-submodules` is passed, or `submodule update --init` is run afterward to read `.gitmodules` and pull each submodule's history separately.

## FAQ
**Why does `git status` in the superproject show a submodule as modified even though I didn't edit anything?** Its checked-out commit moved (someone ran `update --remote`, or you switched branches inside it) — the superproject compares the pinned SHA against what's actually checked out, not file content.

**Can two submodules point at the same repository at different commits?** Yes — each submodule path has its own independent gitlink entry, they don't need to agree, though they do share the fetched objects if they resolve to the same underlying repository URL.

**Does deleting `.gitmodules` remove the submodule?** No — it only breaks `init`/`sync` for anyone cloning fresh. The gitlink tree entry, the working directory content, and `.git/modules/<name>` all persist until you run the full `deinit` + `rm` sequence.

**What does `--reference` actually save?** Disk space and fetch time — it tells Git to borrow objects from an existing local clone of the same repository (via hardlinks or an alternates file) instead of downloading everything again, which matters a lot when many product repos vendor the same large submodule.

**Can I run an arbitrary shell command across every submodule at once?** Yes — `git submodule foreach 'git log -1 --oneline'` (or any shell snippet) runs inside each submodule's working directory in turn, with `$name`, `$path`, `$sha1`, and `$toplevel` available as variables.

## Related Commands
- [[git clone]]
- [[git status]]
- [[git diff]]
- [[git rm]]
