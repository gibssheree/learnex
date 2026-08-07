---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git add

**Definition:** Stages changes, new, modified, or deleted files, to be included in the next commit.

## Syntax
```
git add <file|pattern>
git add -p [<file>...]
```

## Common Options
- `-A` / `--all` — stage all changes in the whole repo (new, modified, deleted), regardless of current directory
- `.` — stage everything in the current directory and below (new and modified files, plus deletions in modern Git)
- `-u` / `--update` — stage modifications and deletions only for files Git already tracks; ignores new untracked files entirely
- `-p` / `--patch` — interactively choose specific chunks (hunks) of a file to stage, hunk by hunk
- `-N` / `--intent-to-add` — record that a new file will be added without staging its content yet, so it shows up in `git diff` instead of as untracked
- `-i` / `--interactive` — full interactive staging menu (status, update, patch, diff) in one prompt
- `--chmod=(+|-)x` — stage a change to a file's executable bit without changing its content, useful for scripts that need `+x` after checkout
- `--renormalize` — re-apply current `.gitattributes` line-ending/filter rules to already-tracked files, used after changing normalization settings

## Basic Example
```
git add index.js
```
Stages just that one file.

## Extended Example
```
git add -p
# for each hunk: y (stage), n (skip), s (split into smaller hunks), q (quit)
git commit -m "Fix off-by-one in pagination"
git add -p
git commit -m "Add missing null check"
```
Walks through each changed chunk one at a time, letting you stage only part of a file's edits — splits one messy working session into several clean, focused commits instead of one commit that mixes unrelated changes.

## Under the Hood
Staging isn't a metaphor — it's a real, separate data structure. Every Git repo has an index file (`.git/index`) that sits between the working directory and the commit history. `git add` reads the current content of a file, writes it into the object database as a blob (a content-addressed object named by the SHA-1/SHA-256 hash of its content), and updates the index to point that file's path at the new blob hash. Nothing touches any commit or branch ref at this point.

That's why `git add` is cheap to run repeatedly and why staging is fully decoupled from your working files: once a blob exists in the object database, it's there permanently (until garbage collected) regardless of what you do to the file afterward. `git commit` later just wraps the current index state into a tree object and a commit object pointing at that tree — it never looks at the working directory directly. This is also why `-N`/`--intent-to-add` works the way it does: it adds the path to the index with a placeholder (empty blob) so tools that diff against the index can see the file, without actually snapshotting its content yet.

The index also stores a "stat cache" alongside each path — file size, modification time, and inode info from the filesystem at the moment it was staged. This is a performance optimization: on the next `git status` or `git add`, Git compares the file's current stat data against the cached values first, and only re-hashes and re-reads the file's content if something looks different. It's why `git status` is fast even in huge repos, and it's the root cause of the rare "racy git" edge case, where a file is modified within the same filesystem timestamp resolution as the `git add` that staged it, and a stat-only check briefly misses the change until content is actually re-read.

## Comparison
| | `git add .` | `git add -A` | `git add -u` |
|---|---|---|---|
| Scope | Current directory and below | Entire repo | Entire repo |
| New (untracked) files | Staged | Staged | Not staged |
| Modified tracked files | Staged | Staged | Staged |
| Deleted files | Staged | Staged | Staged |
| Typical use | Stage everything in the folder you're working in | Stage literally everything before a commit | Stage only changes to files Git already knows about |

## Flags Reference
| Flag | Effect |
|---|---|
| `-A`, `--all` | Stage all adds, modifications, and deletions repo-wide |
| `.` | Stage adds/modifications/deletions in and below the current directory |
| `-u`, `--update` | Stage modifications/deletions for tracked files only, no new files |
| `-p`, `--patch` | Hunk-by-hunk interactive staging |
| `-N`, `--intent-to-add` | Track a new file's path without staging its content |
| `-i`, `--interactive` | Full interactive menu (status/update/revert/add-untracked/patch/diff) |
| `-n`, `--dry-run` | Show what would be added without changing the index |
| `--ignore-errors` | Continue staging remaining files if one path fails |
| `-f`, `--force` | Stage a file even if it matches a `.gitignore` rule |
| `-v`, `--verbose` | Print each file as it's staged |

## Common Workflow
A typical "shape my edits into clean commits" flow after a long coding session with unrelated changes tangled together:
```
git status                  # see the mess: 4 files touched
git add -N new-helper.js    # register the new file so it appears in diff
git diff                    # review everything, including the new file, before staging
git add -p utils.js         # stage only the bugfix hunk
git commit -m "Fix pagination off-by-one"
git add -p utils.js         # stage the remaining refactor hunk separately
git commit -m "Simplify pagination loop"
git add new-helper.js
git commit -m "Add helper for page size calculation"
```
`-N` combined with `git diff` is the key trick here: without it, a brand-new file shows up only in `git diff --cached` or `git status`, not in a plain `git diff`, because an untracked file has nothing in the index to diff against.

## Common Pitfalls
- `git add .` accidentally staging files you meant to keep untracked, like a stray `.env`, because [[gitignore|.gitignore]] wasn't set up first
- Editing a file again after `git add`-ing it, then assuming the new edits are staged too — staging is a snapshot; further edits stay unstaged until you `git add` again
- Answering `y` to a hunk in `git add -p` that depends on a variable defined in a hunk you skipped, leaving the staged snapshot in a state that doesn't even compile
- Running `git add -A` from inside a subdirectory expecting it to behave like `.` — `-A` always targets the whole repo, not just the current path
- Assuming `git add` on an ignored file does nothing — it actually errors with "The following paths are ignored," and needs `-f` to override, which is a useful safety check but confuses people who expect a silent no-op
- Forgetting that a deleted file also needs `git add` (or `git rm`) to stage the deletion itself — `git status` shows it as "deleted, not staged for commit" until then

## History
- Pre-Git 2.0, `git add .` only staged new and modified files — it silently ignored deletions unless you also ran `git add -u` or `git add -A`. This tripped up a lot of scripts that assumed `.` meant "everything."
- Git 2.0 (2014) changed the default: `git add .` (and plain `git commit -a`) now stage deletions too, matching `-A`'s behavior but still scoped to the current directory rather than the whole repo.
- `-p`/`--patch` staging predates most of Git's other UX niceties and has stayed essentially unchanged since it was added in Git 1.5 — it remains one of the few genuinely interactive Git subcommands.
- `-N`/`--intent-to-add` was added later specifically to solve the "why doesn't `git diff` show my new file" complaint, by giving new files a zero-byte placeholder blob in the index.

## Real-World Example
Reviewing your own work before a code review, catching a debug statement before it ships:
```
git add -A
git diff --cached                 # read the full staged diff top to bottom
# notice a stray console.log left in api/client.js
git restore --staged api/client.js
git add -p api/client.js          # re-stage everything except that one line
git diff --cached -- api/client.js   # confirm it's gone from the staged version
git commit -m "Add retry logic to API client"
```
This pattern — stage broadly, review with `--cached`, selectively unstage/re-stage anything that shouldn't ship — catches exactly the kind of mistake that a rushed `git commit -am` would ship straight to the reviewer.

## Gotchas Deep-Dive
- **Partial adds and half-working commits.** `git add -p` stages hunks, not files or logical units. If function A calls a helper defined in a hunk you declined to stage, the staged snapshot (what `git commit` will actually record) can be syntactically broken even though your working directory compiles fine. Always run the test suite against the staged state, not just the working tree, before trusting a `-p` commit.
- **Binary files and `-p`.** Patch mode only works on text-diffable content; for binary files (images, compiled assets) `git add -p` just offers a whole-file yes/no, not a hunk breakdown, because there's no meaningful line-level diff to split.
- **Case-only renames on case-insensitive filesystems.** On Windows or macOS's default filesystem, renaming `Utils.js` to `utils.js` can be invisible to a plain `git status` until you explicitly `git add` both the old and new paths, because the filesystem itself treats them as the same file.
- **Symlinks.** `git add` on a symlink stages the link target path as content, not the file it points to — copying a symlink's target into a repo needs the actual file added, not just the link.
- **Line-ending churn.** If `core.autocrlf` or `.gitattributes` line-ending rules change after files were already committed with the old convention, `git add` on an untouched file can suddenly show it as "modified" purely from normalization. `git add --renormalize .` re-stages every tracked file against the current rules in one pass instead of touching them file by file.
- **Staged-but-identical no-ops.** Running `git add` on a file whose content exactly matches what's already staged (e.g. you edited it, then undid the edit) is harmless — Git computes the same blob hash and the index entry doesn't meaningfully change, so it won't show up as a phantom change in the next commit.

## FAQ
**Does `git add` upload anything or touch the remote?** No. Staging is entirely local; it only writes to your local object database and index. Nothing leaves your machine until `git push`.

**Can I unstage a file after `git add`?** Yes — `git restore --staged <file>` (or the older `git reset <file>`) removes it from the index without touching your working-directory edits.

**Why does `git diff` show nothing after I `git add` a file, but `git diff --cached` does?** `git diff` compares the working directory against the index; once a file is staged, those two match, so there's no diff. `git diff --cached` compares the index against the last commit, which is where the staged change now shows up.

**Does staging a file count as a backup?** Practically, yes, for content — once a blob is written to the object database it survives even if you later discard the working-tree edit, and it's recoverable via `git fsck --lost-found` even after being unstaged. But it's not a substitute for committing: unreferenced blobs are exactly the kind of object `git gc` eventually prunes.

**What's the difference between `git add -A` and `git add --all` with a pathspec, like `git add -A src/`?** Without a pathspec, `-A` covers the whole repo. With one, it's scoped to that path — so `git add -A src/` behaves like `git add src/` but additionally picks up deletions under `src/`, which bare `git add src/` on very old Git versions used to miss.

**Can I stage a file that doesn't exist yet, ahead of creating it?** No, `git add` requires the path to exist in the working directory at the time you run it. `-N` comes closest — it registers the path before you've written meaningful content, but the file still has to exist (even empty).

**Does the order I run `git add` on multiple files matter?** No. The index is a flat, sorted structure keyed by path — staging `b.js` before `a.js` produces an identical index to the reverse order. Order only matters for interactive flows like `-p`, where it determines the sequence hunks are presented in.

## Common Interview Questions
- What's the difference between the working directory, the staging area, and the repository? — three distinct states a change passes through: edited-but-not-added, added-but-not-committed, and committed.
- Why would you use `git add -p` instead of `git add <file>`? — to split unrelated changes within the same file into separate, reviewable commits.
- What happens to the staging area after a commit? — it isn't cleared; it becomes identical to the new commit's tree, ready to diff against the next round of edits.
- Is a staged file's content stored anywhere before you commit? — yes, as a blob object in `.git/objects` the moment `git add` runs, independent of the commit that eventually references it.
- Does `git add` know or care what branch you're on? — no, staging is branch-agnostic; it only interacts with the working directory, the index, and the object database.
- Why does staging exist at all instead of committing the working directory directly? — it lets you shape a commit's contents deliberately, separate from what happens to be sitting on disk at any given moment.

## Related Commands
- [[git status]] — see what's staged vs unstaged before or after adding
- [[git commit]] — turn the current staged snapshot into a permanent commit
- [[gitignore|.gitignore]] — keep files out of `git add .`/`-A` in the first place
- [[git restore]] — the modern way to unstage or discard changes `git add` staged
- [[git rm]] — stage a file's removal, the deletion counterpart to `git add`
- [[git diff]] — inspect exactly what a pending `git add` would capture
