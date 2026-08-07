---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git clean

**Definition:** Removes untracked files from the working directory — files Git isn't tracking at all, not even staged.

## Syntax
```
git clean [options]
```

## Common Options
- `-n` / `--dry-run` — show what would be deleted without actually deleting it, always run this first
- `-f` — actually force the deletion (Git refuses to run destructively without it)
- `-d` — also remove untracked directories, not just files
- `-x` — also remove files ignored by [[gitignore|.gitignore]] (like `node_modules`)
- `-X` — remove only files ignored by `.gitignore`, leaving other untracked-but-not-ignored files alone
- `-i` / `--interactive` — prompt for confirmation per file or pattern instead of an all-or-nothing delete
- `-e <pattern>` — exclude paths matching a pattern from removal, layered on top of whatever else is selected

## Basic Example
```
git clean -n
```
Previews which untracked files would be deleted.

## Extended Example
```
git clean -fdx
```
Deletes every untracked file and directory, including ignored ones like `node_modules` or build output — a common "nuke and reinstall" reset for a broken local environment.

## Under the Hood
`clean` works purely off the same tracked/untracked classification `git status` uses — it walks the working directory, checks each path against the index (is it tracked?) and against `.gitignore` rules (is it ignored?), and deletes anything that matches the selected category. There is no object-database involvement at all: untracked files were never staged, so no blob was ever created for them, and unlike a committed file removed with [[git rm]], there is no snapshot anywhere in `.git` to recover from. This is the single most important fact about `clean` — it is the one common Git command whose deletions [[git reflog]] cannot undo, because reflog only tracks ref movements, and untracked files were never referenced by anything Git tracks in the first place.

The `-x`/`-X` distinction matters here too: plain `git clean` (even with `-d`) skips anything matching a `.gitignore` pattern, on the assumption that ignored files (build artifacts, `node_modules`, `.env` local overrides) are usually there on purpose. `-x` removes ignored files too; `-X` (capital) does the opposite — removes *only* ignored files, leaving genuinely untracked-but-not-ignored files alone. That's a useful, less destructive variant when you specifically want to nuke build output without touching a new file you forgot to `git add`.

Directory handling deserves its own note: `clean` treats an untracked directory as a single unit by default unless it's asked to look inside. Without `-d`, a directory containing only untracked files (nothing tracked inside it at all) is left alone entirely, not even reported by `-n`, because Git's untracked-file scan by default doesn't recurse into directories that contain nothing it's tracking. This is also why a freshly `git init`-ed subdirectory (with its own `.git`) is treated specially — see the nested-repository gotcha below.

## Flags Reference
| Flag | Effect |
|---|---|
| `-n`, `--dry-run` | List what would be removed, remove nothing |
| `-f`, `--force` | Actually perform the deletion (required unless `clean.requireForce=false`) |
| `-d` | Also remove untracked directories |
| `-x` | Also remove files ignored by `.gitignore` |
| `-X` | Remove *only* ignored files, leave other untracked files alone |
| `-i`, `--interactive` | Prompt per-file/pattern before deleting |
| `-e <pattern>` | Exclude paths matching a pattern from removal |
| `-q`, `--quiet` | Suppress the list of removed files |
| `-f -f` | Force removal, including nested untracked git repositories |
| `--dry-run -x -d` | Combined preview of every category clean can touch, before running for real |

## Common Workflow
A safe, staged approach to resetting a working directory that's accumulated stray build artifacts and abandoned experiment files:
```
git status                      # sanity check what's tracked/staged first
git clean -ndx                  # dry run: preview untracked AND ignored files
git clean -ndx | grep -v node_modules   # eyeball everything except the expected noise
git add -N .                    # optional: register any new files you actually want to keep
git clean -fdx                  # commit to the deletion once the preview looks right
```
Running the dry run with the exact same flag combination you intend to execute is the whole safety mechanism here — there's no undo step after `-f`.

## Comparison
| | `git clean -fd` | `git clean -fdx` | [[git reset]] `--hard` | [[git rm]] |
|---|---|---|---|---|
| Affects | Untracked files/dirs | Untracked files/dirs, including ignored | Tracked files + branch pointer | Tracked files (stages a deletion) |
| Recoverable via reflog | No | No | Yes (commits survive) | Yes (it's a normal commit) |
| Needs a commit to undo | N/A — nothing to undo | N/A — nothing to undo | N/A | Yes, revert or reset |
| Typical use | Wipe stray temp/output files | "Nuke and reinstall" reset | Discard commits and local changes | Remove a tracked file from the repo |

## History
- `clean` has existed since early Git releases as the counterpart to `git status`'s ability to list untracked files — once Git could tell you about them, a command to remove them in bulk followed naturally.
- `clean.requireForce` (defaulting to `true`) was a deliberate safety design choice from early on: unlike almost every other Git command, `clean` performs genuinely unrecoverable deletions, so the maintainers made the destructive flag mandatory by default rather than opt-out.
- The `-x`/`-X` distinction (ignored files vs. only-ignored files) was added once `.gitignore`-based build artifacts (compiled output, `node_modules`, `.class` files) became common enough that "clean everything" and "clean only untracked-but-not-ignored" needed to be separate, deliberate choices.
- `-i`/`--interactive` mode came later, offering a middle ground between the all-or-nothing `-n`/`-f` workflow and manually deleting files one at a time.
- The double-force requirement for nested repositories (`-f -f`) was added after enough reports of `clean -fd` accidentally deleting an entire unrelated project that happened to live as an unregistered subdirectory inside a working tree.

## Real-World Example
Recovering from a broken local environment after a dependency upgrade goes sideways, without touching work in progress:
```
git status                       # confirm nothing important is uncommitted
git stash -u                     # just in case, snapshot untracked + tracked changes first
git clean -ndx                   # preview: build output, node_modules, stray temp files
git clean -fdx                   # commit to the wipe
npm install                      # reinstall clean dependencies
git stash pop                    # bring back whatever was stashed
```
Stashing with `-u` before a `clean -fdx` is a good habit even when you're fairly confident — `stash` is recoverable via [[git reflog]]'s stash entries for a while, whereas `clean` is not, so it costs nothing to have the extra safety net in place first.

## Gotchas Deep-Dive
- **No confirmation, no trash bin.** Unlike deleting a file in a GUI file manager, `git clean -f` does not send anything to a recycle bin or trash folder — the delete is immediate and permanent, using the same underlying filesystem removal as `rm`.
- **Nested git repositories.** If an untracked directory itself contains a `.git` folder (e.g. a submodule that was cloned but never registered with `git submodule add`), plain `git clean -fd` refuses to descend into it by default, printing a warning — `-f -f` (force twice) is required to actually remove nested repositories, a deliberate extra safety gate.
- **Large repos and clean's scan cost.** On a repository with a very large number of untracked/ignored files (deep `node_modules` trees, large build caches), `-n` itself can take noticeable time since it has to walk and classify every path — this is normal and not a sign anything is wrong.
- **Clean vs. editor swap/temp files.** Editor-generated files (`.swp`, `~` backups) that aren't gitignored show up as untracked and get swept up by a broad `clean -fd` — worth having a global gitignore (`core.excludesFile`) covering common editor artifacts so they're never candidates for accidental deletion in the first place.
- **Order of operations with stash.** Running `git clean` before `git stash` (instead of after) means any untracked files you meant to stash with `-u` are already gone by the time you try to stash them — always stash first if there's any chance you want to keep untracked work.
- **Interactive mode's own sub-menu.** `-i` doesn't just prompt yes/no per file — it opens a small menu (clean, filter by pattern, select numbers, ask each) that behaves differently from `-p`-style patch prompts elsewhere in Git, worth trying once before relying on it under pressure.

## FAQ
**Can I get deleted files back after `git clean -f`?** Only through OS-level or filesystem-level undelete tools, and only if you act immediately and the disk blocks haven't been overwritten — Git itself has no record of the content, since it was never staged or committed.

**Does `git clean` touch `.gitignore`d files by default?** No — plain `git clean` (even with `-d`) skips anything matching a `.gitignore` pattern. You need `-x` to include ignored files, or `-X` to remove only ignored files.

**Does `clean` care which branch you're on?** No — it operates purely on the working directory's tracked/untracked/ignored classification at the moment it runs, independent of branch or commit history.

**Why does Git refuse to run `git clean -d` without `-f`?** The `clean.requireForce` setting defaults to `true` specifically because clean's deletions are irreversible — Git wants an explicit, deliberate confirmation before performing them.

**Is there a safer, undo-able alternative to `git clean`?** Not built into Git directly — the closest equivalent is manually moving untracked files to a temporary location instead of deleting, or relying on `-n`/`-i` to review carefully before committing to `-f`.

**Does `git clean` respect `.gitignore` exceptions (negation patterns)?** Yes — a `.gitignore` rule using `!pattern` to un-ignore a specific file is honored the same way it is everywhere else in Git; `clean` won't touch a file explicitly un-ignored that way unless it's genuinely untracked and you've passed the right flags.

**Can `clean` remove files inside a tracked directory?** Only untracked ones — if the directory itself is tracked (contains at least one tracked file) but also has stray untracked files inside it, `clean` (with `-d` if needed) removes just the untracked ones and leaves tracked files alone.

**Does `clean` work the same way inside a submodule?** Yes, run from within the submodule's own working directory — but a top-level `clean` in the superproject does not recurse into submodules by default, since submodule directories are tracked (as gitlinks), not untracked, from the superproject's point of view.

## Common Interview Questions
- What's the difference between `git clean` and `git reset --hard`? — `clean` removes untracked files only; `reset --hard` moves the branch pointer and discards changes to tracked files, but leaves untracked files alone. A full reset to a pristine checkout typically needs both.
- Why does Git require `-f` for `git clean` but not for most other commands? — because clean's deletions are permanent and unrecoverable through Git itself, unlike almost every other operation which can be undone via the reflog or by recovering objects still in the database.
- What does `-x` do that plain `git clean -fd` doesn't? — it additionally removes files matched by `.gitignore` rules, such as build output or dependency directories, which are skipped by default.
- Why is `-f -f` needed to remove a nested untracked git repository? — it's a deliberate double-confirmation, since deleting a nested repo could destroy an entire separate project's history that happens to sit inside the working directory.
- How would you preview exactly what a destructive `clean -fdx` will do before running it? — run the identical flags with `-n` (or swap `-f` for `-n`) first, since dry-run mode uses the same selection logic and prints the same file list without deleting anything.
- Does `git clean` recurse into submodules by default? — no, submodule directories are tracked as gitlinks from the superproject's perspective, so a top-level clean leaves them alone unless run from inside the submodule itself.
- Why is `clean` considered riskier than most other Git commands? — because its deletions bypass Git's object database entirely; nothing about an untracked file was ever recorded anywhere for `reflog` or `fsck` to recover.

## Common Pitfalls
- Running `-f` without `-n` first — deleted untracked files are gone for good, Git has no history of something it never tracked
- Assuming `clean` also resets tracked files that have been modified — it doesn't touch anything Git already knows about; that's [[git reset]] `--hard` or [[git restore]]'s job, and a full "get back to a clean checkout" reset usually needs both together
- Forgetting `-d`, then being confused that an entire untracked directory (like a half-generated `dist/`) survived — plain `git clean -f` only removes untracked *files*, not directories, unless `-d` is added
- Running `git clean -fdx` inside a repo with local, uncommitted `.env` or IDE config files that are gitignored on purpose — `-x` deletes those too, since "ignored" doesn't mean "protected"
- Not realizing `clean.requireForce` can be set to `false` in config, making bare `git clean -d` destructive without `-f` — worth checking `git config clean.requireForce` on an unfamiliar machine before assuming the safety default is active
- Running clean inside a directory containing an unregistered nested git repo and being surprised it's skipped — that's intentional; `-f -f` is required to force removal of nested `.git` directories
- Forgetting that `-e <pattern>` excludes are additive, not a whitelist — `git clean -fdx -e '*.log'` still removes everything else matched by `-x`, only `.log` files are spared
- Running `git clean` as a reflex "fix anything weird" command without first checking `git status` — it only ever affects untracked files, so it's the wrong tool if the actual problem is uncommitted changes to tracked files

## Related Commands
- [[gitignore|.gitignore]] — defines which untracked files `clean` treats as "ignored" for `-x`/`-X`
- [[git reset]] — discards changes to tracked files; pair with `clean` for a full working-directory wipe
- [[git rm]] — removes tracked files, the counterpart to `clean`'s untracked-only scope
- [[git status]] — preview untracked and ignored files before deciding what to clean
- [[git stash]] — snapshot untracked work with `-u` before running a destructive clean
- [[git config]] — check or change `clean.requireForce` and `core.excludesFile`
