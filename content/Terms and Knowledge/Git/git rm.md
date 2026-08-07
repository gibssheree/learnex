---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git rm

**Definition:** Removes a file from both the working directory and the staging area — its tracked history stays intact.

## Syntax
```
git rm <file>
git rm -r <directory>
git rm --cached <file>
git rm -f <file>
git rm -n <file>
git rm '*.log'
```

## Common Options
- `--cached` — untrack the file but keep it on disk (common after forgetting to add something to `.gitignore`)
- `-r` — remove a directory recursively
- `-f` / `--force` — force removal even if the file has staged or working-directory changes not yet committed (overrides Git's built-in safety check)
- `-n` / `--dry-run` — show what would be removed without actually removing anything
- `-q` / `--quiet` — suppress the listing of removed files
- `--ignore-unmatch` — exit successfully even if the given pathspec matches nothing, useful in scripts

## Basic Example
```
git rm old-script.js
```
Deletes the file from disk and stages the removal in one step. The next commit will record that the file was deleted.

## Extended Example
```
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Stop tracking .env, add to gitignore"
```
Stops tracking `.env` going forward, so it can be safely added to [[gitignore|.gitignore]], without deleting it from your local disk — critical when the file contains secrets you still need locally but never wanted committed in the first place.

## Under the Hood
`git rm` is essentially two operations fused into one: it deletes the file from the working directory (like the shell's `rm`), and it stages that deletion in the index (like `git add`, but for a removal instead of a modification). That's why running plain `rm file.js` followed by `git add file.js` produces the exact same staged result as `git rm file.js` — the command is a convenience wrapper, not something magic. `git rm --cached` only performs the index half: it removes the file's entry from the staging area so the next commit won't include it, but skips the working-directory deletion, leaving the file sitting on disk as an untracked file afterward.

Git includes a safety check by default: it refuses to `git rm` a file whose working-directory or staged content differs from what's recorded in HEAD, on the theory that removing it would silently discard changes that were never committed anywhere. `-f` bypasses that check. This is the same category of safety net `git checkout` and `git branch -d` apply elsewhere in Git — a guard against permanently losing uncommitted work through an operation that isn't obviously destructive at first glance.

## History
Before `git add -A` and `git add -u` gained wide adoption for whole-tree staging, `git rm` (or its manual `rm` + `git add` equivalent) was the primary way to stage deletions at all — early Git's `git add` only staged new content, not removals, which is part of why `rm` exists as its own dedicated porcelain command rather than being folded entirely into `add`. Modern `git add -A` now stages adds, modifications, and deletions in one pass across the whole working tree, but `git rm` remains the more explicit, single-purpose tool when the intent is specifically "delete and stage this deletion" rather than "stage whatever changed."

Under `.git/`, `git rm` on a tracked file performs roughly two operations in sequence: an `unlink()` of the working-tree path (unless `--cached`), and an index update that either drops the path's entry entirely or, more precisely, records a staged deletion by removing that path's cache entry so the next `git write-tree` (which `git commit` calls internally) omits it from the new tree object. Nothing about the file's *history* changes — every earlier commit's tree object still references the old blob, which is why the file remains fully viewable via `git show <old-commit>:<path>` or recoverable via `git checkout <old-commit> -- <path>` even after being removed at HEAD.

## Comparison
| Goal | Command | File stays on disk? | Still tracked after? |
|---|---|---|---|
| Delete and stop tracking | `git rm <file>` | no | no |
| Stop tracking only, keep local copy | `git rm --cached <file>` | yes | no |
| Manual equivalent of `git rm <file>` | `rm <file>` then `git add <file>` | no | no |
| Just delete without staging | `rm <file>` (shell only) | no | staged as "deleted" only after `git add`/`git rm` |

The row that trips people up most is the last one: deleting a file with a plain shell `rm` (or dragging it to the trash in a file manager) doesn't stage anything by itself. `git status` will show it as "deleted" but unstaged until something — `git add`, `git rm`, or `git add -A` — actually records that deletion in the index. Until then, the file is fully recoverable with a plain `git restore <file>`, since the index still has its last-known content.

## Flags Reference
| Flag | Effect |
|---|---|
| `-r` | Recurse into directories |
| `--cached` | Remove from the index only, leave the working-tree file alone |
| `-f`, `--force` | Override the "would discard uncommitted changes" safety check |
| `-n`, `--dry-run` | Preview affected files without removing them |
| `-q`, `--quiet` | Don't list each removed file |
| `--ignore-unmatch` | Don't error if the pathspec matches no files |
| `--sparse` | Allow removing paths outside the sparse-checkout cone |
| `--` | Separate pathspecs from flags/refs when a filename looks like an option |

A dry run before a wide recursive removal is cheap insurance:
```
git rm -r -n build/
```
```
rm 'build/index.html'
rm 'build/bundle.js'
rm 'build/bundle.js.map'
```
`-n` prints exactly what would be removed without touching the index or disk, which is worth the extra step before any `-r` targeting a directory whose contents you haven't fully audited — glob and directory pathspecs can match more than expected, especially after a rename or restructure.

## Gotchas Deep-Dive
On case-insensitive filesystems (default on Windows and macOS), `git rm` followed by re-adding a file with different casing (`git rm README.md`, then `git add readme.md`) can produce confusing index states, since Git itself is case-sensitive internally even when the filesystem underneath it isn't — the two operations can appear to "not take" from the shell's perspective while the index genuinely has both entries queued. Renaming purely for casing is more reliably done with [[git mv]], or a two-step commit that removes then re-adds with `-f`.

`git rm` on a symlink removes the link itself, not the file it points to — this is usually the expected behavior since Git tracks the symlink as its own blob (storing the target path as content), but it surprises people who assume `git rm` follows links like some shell utilities' `-L` flag does. Similarly, `git rm -r` on a directory that contains a nested Git repository (a submodule that wasn't properly declared via [[git submodule]]) will refuse or behave unpredictably, since Git treats an embedded `.git` directory specially.

## Common Workflow
Cleaning up a repo where a build directory or dependency folder was accidentally committed:
```
echo "node_modules/" >> .gitignore
git rm -r --cached node_modules
git add .gitignore
git commit -m "Untrack node_modules, was committed by mistake"
```
`-r --cached` together untrack an entire directory tree recursively while leaving every file physically present on disk — nobody has to reinstall dependencies just because the repo stopped tracking them.

## Interaction with Worktrees
In a repo using [[git worktree]] to check out multiple branches into separate directories simultaneously, `git rm` in one worktree only affects that worktree's working directory and its shared index view of the current branch — it has no effect on files checked out in a sibling worktree on a different branch, since each worktree maintains its own working-tree state even though they share the same underlying object database and branch history.

## Common Pitfalls
- Forgetting `--cached` and permanently deleting a file from disk that you actually wanted to keep locally, just untracked — there's no undo for the disk deletion unless the file is still recoverable from a previous commit
- Trying to `git rm` a file with uncommitted changes and getting blocked by Git's safety check, then reaching straight for `-f` without checking what those changes were — always run `git diff` or `git status` first to see what's about to be discarded
- Using a bare glob like `git rm *.log` without quotes and having the shell expand it before Git sees it, which fails silently on files outside the current directory or behaves inconsistently across shells — quote the pattern (`git rm '*.log'`) so Git's own pathspec matching handles it
- Forgetting `-r` when trying to remove a directory and getting a "not removing X recursively without -r" error
- Assuming `git rm` also updates `.gitignore` automatically — it doesn't; a `--cached` removal without a matching `.gitignore` entry means the file just reappears as untracked-but-visible in `git status`, and could get re-added by an unwary `git add .`

## FAQ
**Does `git rm` delete the file's history?** No. Every prior commit that included the file still has it in that commit's tree — `git log --follow -- <file>` or checking out an old commit will still show it. Only future commits lack it.

**How do I remove a file that Git thinks is already deleted from disk?** If you deleted it with plain `rm` (or your OS file manager) and Git shows it as "deleted" but unstaged, `git rm <file>` at that point just stages the already-performed deletion rather than trying to delete it again; alternatively `git add <file>` stages a deletion just as well.

**Can I undo a `git rm` before committing?** Yes — `git restore --staged --worktree <file>` (or the older `git reset HEAD -- <file>` followed by `git checkout -- <file>`) brings the file back from the index/HEAD as long as you haven't committed the removal yet.

**What if I already committed and pushed a `git rm --cached` on a secrets file?** Untracking it going forward doesn't remove it from history — every prior commit still contains the secret in its tree. `git rm --cached` alone is not a security remediation; the file remains fetchable by anyone with clone access via old commits. Fully purging it requires history rewriting (`git filter-repo` or the older `git filter-branch`) plus rotating the leaked secret itself, since a rewritten history doesn't retroactively invalidate anything anyone already cloned.

**Does `git rm` support glob patterns natively, or does the shell expand them?** Git's own pathspec matching supports globs (`*`, `**`, `?`, character classes) independent of the shell. Quoting the pattern (`git rm '*.log'`) hands the raw string to Git so it does the matching against tracked files, which is more predictable than shell globbing that only sees files currently present in the working directory and ignores case-sensitivity or `.gitignore` state.

## Common Interview Questions
**"What's the difference between `git rm` and `git rm --cached`?"** `git rm` deletes the file from both the working directory and the index, staging the deletion for the next commit. `git rm --cached` only touches the index — it stops Git from tracking the file going forward but leaves the physical file on disk untouched, which is the standard fix for a file that was committed by mistake but is still needed locally (like `.env` or a local config override).

**"Why does `git rm` sometimes refuse to remove a file?"** By default it checks that the file's working-directory and staged content match what's recorded in HEAD before allowing removal, to avoid silently discarding uncommitted changes. If the file has been modified and not committed, `git rm` errors out unless `-f` is passed to force it.

**"How would you remove a large binary or dependency folder that was accidentally committed, without breaking teammates' local copies?"** `git rm -r --cached <path>` plus a `.gitignore` entry, committed and pushed — this untracks the path for everyone going forward without deleting anyone's local files, since `--cached` never touches the working tree.

## Real-World Example
Removing a renamed set of files where the old path no longer exists on disk (already deleted manually) but Git still shows them as tracked-and-missing:
```
git status
#   deleted:    legacy/old-api.js
#   deleted:    legacy/old-utils.js
git add legacy/
git commit -m "Remove legacy API module, replaced by src/api"
```
When files are already gone from disk, plain `git add` on the containing path stages the deletions exactly like `git rm` would — Git detects the missing files and records them as removed, since `add` stages the current state of a path, deletion included, not just new content.

**Does `git rm` work with pathspecs relative to the repo root or the current directory?** Relative to wherever the command is run, same as most Git commands — running `git rm old.js` from inside a subdirectory targets that subdirectory's `old.js`, not one at the repo root. Use a leading `:/` pathspec magic (`git rm :/old.js`) to force a repo-root-relative match regardless of current directory.

## Removing Files Matched by .gitignore
`git rm` normally operates on tracked files, but a related edge case comes up when a file matches a `.gitignore` pattern yet is still tracked (because it was added before the ignore rule existed). Git doesn't retroactively untrack files just because a pattern now matches them — `.gitignore` only affects *new*, previously-untracked files. Removing an already-tracked-but-now-ignored file still requires an explicit `git rm --cached`, same as any other file; adding it to `.gitignore` alone does nothing to files already in the index.

## Related Commands
- [[gitignore|.gitignore]]
- [[git status]]
- [[git mv]]
- [[git restore]]
- [[git commit]]
- [[git worktree]]
