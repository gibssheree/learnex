---
tags: [term, git, branching]
category: Branching & Merging
---

# git branch

**Definition:** Lists, creates, or deletes branches.

## Syntax
```
git branch [<branch-name>] [<start-point>]
```

## Common Options
- `-a` — list all branches, including remote-tracking ones
- `-r` — list only remote-tracking branches
- `-v` / `-vv` — show each branch's last commit (`-v`), or also its upstream tracking branch and ahead/behind count (`-vv`)
- `-d <branch>` — delete a branch (safe, refuses if it has commits not merged into its upstream or the current branch)
- `-D <branch>` — force-delete a branch regardless of merge status (shorthand for `--delete --force`)
- `-m <old> <new>` — rename a branch
- `--merged` / `--no-merged` — list branches that have (or haven't) been merged into the current branch, useful for finding stale branches to clean up
- `-u <upstream>` — set the remote-tracking branch for the current branch without pushing
- `--contains <commit>` — list branches that contain a given commit

## Basic Example
```
git branch feature/login
```
Creates a new branch without switching to it.

## Extended Example
```
git branch --merged main | grep -v '^\*\|main' | xargs git branch -d
```
Lists local branches already merged into `main`, filters out the current branch and `main` itself, then batch-deletes the rest — a common way to clean up a cluttered local branch list after a run of feature branches have landed.

## Under the Hood
A branch is nothing more than a file — a 41-byte text file at `.git/refs/heads/<name>` containing the SHA of a single commit. `git branch feature/login` literally just writes that file, pointing it at whatever commit `HEAD` currently resolves to (or at `<start-point>` if given). No objects are copied, no working tree is touched, and no history is duplicated; the branch is just a movable label on an existing commit graph. That's why creating a branch in Git is instant regardless of repo size, unlike centralized VCS tools where a branch could mean copying an entire directory tree.

`HEAD` itself is also just a file (`.git/HEAD`), normally containing a symbolic reference like `ref: refs/heads/main` — it points at a branch, which points at a commit. When you commit, Git updates whichever branch `HEAD` points to, moving that branch's ref file forward to the new commit. Deleting a branch (`-d`/`-D`) just deletes the ref file; it does not delete the commits themselves; they stay in the object database, unreferenced, until `git gc` eventually prunes anything unreachable — which is also why `-D` is recoverable via [[git reflog]] for a while, but not forever.

Remote-tracking branches (`-r`, `origin/main`) work the same way but live under `.git/refs/remotes/<remote>/<branch>` — they're local bookmarks recording where a remote branch was as of your last `fetch`/`pull`, not live connections to the remote.

## Flags Reference
| Flag | Effect |
|---|---|
| `-a` | List local and remote-tracking branches |
| `-r` | List remote-tracking branches only |
| `-v` / `-vv` | Show last commit / also upstream + ahead-behind count |
| `-d <branch>` | Delete if fully merged |
| `-D` | Force-delete regardless of merge status |
| `-m <old> <new>` | Rename a branch |
| `-c <old> <new>` | Copy a branch (including its reflog) under a new name |
| `--merged [<commit>]` | List branches merged into given commit (default: HEAD) |
| `--no-merged [<commit>]` | List branches not yet merged |
| `-u <upstream>`, `--set-upstream-to` | Set tracking branch without pushing |
| `--unset-upstream` | Remove the tracking relationship |
| `--contains <commit>` | List branches whose history includes a commit |
| `--sort=<key>` | Sort output, e.g. `--sort=-committerdate` for most recent first |
| `--list [<pattern>]` | Explicit list form, supports glob filtering (e.g. `git branch --list 'feature/*'`) |
| `--points-at <commit>` | List branches whose tip is exactly a given commit |
| `-f`, `--force` | Allow `-b`-style reset even if uncommitted changes would be overwritten (context-dependent) |
| `--track` / `--no-track` | Explicitly enable or disable automatic upstream tracking on creation |

## Common Workflow
Auditing and cleaning up a local repo after months of feature work, without nuking anything unmerged by accident:
```
git fetch --prune                          # sync remote-tracking branches, drop deleted ones
git branch -vv                              # see upstream + ahead/behind for every local branch
git branch --no-merged main                 # list branches with real unmerged work — leave these alone
git branch --merged main | grep -v '^\* \|main$' | xargs -r git branch -d
git branch -m old-name new-name             # fix a mis-named branch while you're in here
git push origin -u new-name                 # remote still has old-name until pushed under the new one
git push origin --delete old-name           # and the old remote branch needs an explicit delete
```

## Comparison
| | `git branch` | [[git switch]] | [[git checkout]] |
|---|---|---|---|
| Primary job | Create/list/delete/rename branches | Switch branches only | Switch branches or restore files (legacy, overloaded) |
| Creates without switching | Yes (default behavior) | No (`-c` switches immediately) | No (`-b` switches immediately) |
| Can delete branches | Yes (`-d`/`-D`) | No | No |
| Touches working-tree files | No | No | Yes, if given a file path |

## History
- Branches have been cheap, first-class objects since Git's very first releases — this was one of Git's core design differentiators against Subversion and CVS, where a "branch" meant a full directory copy and switching was expensive.
- `git branch --merged`/`--no-merged` were added to solve branch-list clutter directly: as repos accumulated years of feature branches, finding which ones were safe to delete by hand became impractical.
- `-c`/`--copy` (copy a branch, including its reflog) is a newer, less-used addition, mainly useful for preserving a branch's local history when renaming would otherwise be simpler but you want to keep the old name around too.
- The distinction between local branches (`refs/heads/*`) and remote-tracking branches (`refs/remotes/*`) has existed unchanged since the ref namespace was designed — it's what makes `git branch -r` and `git branch -a` meaningfully different views over the same underlying ref storage.
- Default branch naming shifted industry-wide from `master` to `main` starting around 2020 (GitHub made `main` the default for new repos in 2020); `git branch` itself is indifferent to the name, the change was a convention and default-config shift, not a command change.

## Real-World Example
Setting up a new feature branch correctly against a fresh remote state, then fixing a naming mistake before anyone else pulls it:
```
git fetch origin                            # make sure origin/main is current first
git branch feature/checkout-v2 origin/main  # branch from the remote tip, not local main
git branch -u origin/main feature/checkout-v2   # optional: track main for easy rebasing later
git branch -vv                              # confirm the tracking relationship took
# realize the name should match the ticket number
git branch -m feature/checkout-v2 feature/PROJ-482-checkout-v2
git push origin -u feature/PROJ-482-checkout-v2
```
Branching directly from `origin/main` instead of local `main` avoids a subtle trap: if local `main` is stale (not yet fetched/merged), a plain `git branch feature/x main` silently bases the new branch on outdated history.

## Gotchas Deep-Dive
- **Ambiguous short names.** If a branch and a tag share the same name, commands that accept a ref (like `git checkout <name>`) can resolve to the wrong one depending on Git's disambiguation rules; `git branch` itself is unambiguous since it only ever operates on branches, but downstream commands referencing that name aren't.
- **Detached HEAD and `git branch`.** Running `git branch` while in detached HEAD (e.g. mid-bisect, or after `checkout <sha>`) still lists all branches fine, but the current position shows as `(HEAD detached at <sha>)` instead of a branch name — a reminder that whatever you commit next isn't on any branch yet.
- **Force-deleting a branch that was never pushed.** `-D` on a local-only branch with real work is unrecoverable through normal means once the reflog entry for it expires (default 90 days) and `git gc` prunes the now-unreachable commits — there's no remote copy to fall back on.
- **Branch names that look like flags.** A branch named `-foo` or `--bar` can confuse the CLI parser; Git generally requires `--` before such a name (`git branch -- -foo`) to disambiguate it from an option.
- **Case-sensitivity across platforms.** `feature/Login` and `feature/login` are distinct branches on a case-sensitive filesystem (Linux) but can collide on case-insensitive ones (Windows, default macOS), causing confusing "branch already exists" errors for one collaborator and not another.
- **Slashes in branch names creating directory-like ref paths.** `feature/login` is stored as `refs/heads/feature/login` — a real nested path, not just a display convention. This means you can't have both `feature/login` and a branch literally named `feature` at the same time, since one would need `refs/heads/feature` to be both a file and a directory.

## FAQ
**Does creating a branch copy any files or history?** No — it's a single ref file pointing at an existing commit; no working-tree files, blobs, or trees are duplicated.

**What's the difference between a local branch and a remote-tracking branch?** A local branch (`refs/heads/*`) is one you can commit to directly. A remote-tracking branch (`refs/remotes/origin/*`) is a read-only bookmark of where a remote branch was as of your last fetch — you never commit to it directly, only update it via `fetch`/`pull`/`push`.

**Why does `git branch -d` sometimes refuse even though I think the branch is merged?** It checks against the current branch (or upstream, if tracking is set) — if you're comparing against the wrong base, or the branch was merged via squash/rebase (producing different commit hashes even though the content matches), Git can't detect the equivalence and refuses to delete.

**Can two branches point at the same commit?** Yes, freely — a branch is just a label; nothing prevents multiple labels from pointing at identical history until one of them advances with a new commit.

**Does `git branch` ever touch the remote?** No — listing, creating, deleting, and renaming with `git branch` are all local-only operations. Only `git push`/`git fetch` communicate with a remote.

**What happens to a branch's reflog when it's deleted?** It's deleted along with the branch by default; `-c`/`--copy` is the way to preserve a branch's reflog under a new name instead of losing it.

**Is there a limit to how many branches a repo can have?** No hard limit — thousands of branches are fine performance-wise, though `git branch -a` output and tooling UIs become unwieldy well before Git itself struggles.

## Common Interview Questions
- What actually happens when you run `git branch <name>`? — Git writes a new ref file under `refs/heads/<name>` containing the current commit's SHA; nothing else in the repo changes.
- Why is branching in Git considered "cheap" compared to older version control systems? — because a branch is just a pointer to a commit, not a copy of the codebase, so creation and switching are near-instant regardless of repo size.
- What's the safe way to delete a branch versus the forceful way? — `-d` refuses if the branch has unmerged commits relative to its upstream or current branch; `-D` deletes unconditionally, discarding that safety check.
- How do remote-tracking branches get updated? — only through `git fetch` (directly, or as part of `git pull`), never automatically and never by `git branch` itself.
- Why might `git branch -d` fail after a squash merge even though the work landed on `main`? — the squashed commit has a different SHA than any commit on the feature branch, so Git's merge-detection (based on commit ancestry) can't see the equivalence and treats it as unmerged.

## Common Pitfalls
- Using `-D` out of frustration when a normal `-d` refuses to delete — that refusal usually means real unmerged work would be lost; check with `git log <branch> ^main` first
- Trying to delete the branch you're currently on — Git refuses; `checkout`/`switch` elsewhere first
- Renaming a branch with `-m` only renames it locally — the remote still has the old name until you `git push origin -u new-name` and delete the old one there too
- Confusing `--merged`/`--no-merged` direction: they're relative to the *current* branch, not always `main`, so run them right after checking out the branch you mean to compare against
- Running plain `git branch <name>` and expecting to be switched to it — it only creates the branch; forgetting this and then committing leaves you still on the old branch, wondering where your commit went
- Assuming stale remote-tracking branches (`origin/old-feature`) disappear automatically after the branch is deleted on the remote — they don't, until you run `git fetch --prune` or `git remote prune origin`

## Related Commands
- [[git checkout]] — switch to (or create and switch to) a branch
- [[git switch]] — the modern, branch-only alternative to checkout for this purpose
- [[git merge]] — combine another branch's history into the current one
- [[git reflog]] — recover a branch's prior position, or a deleted branch's tip commit, within the retention window
- [[git log]] — inspect a branch's commit history before deciding whether it's safe to delete
- [[git fetch]] — update remote-tracking branches and prune ones removed from the remote
- [[git remote]] — manage the remotes that remote-tracking branches are namespaced under
