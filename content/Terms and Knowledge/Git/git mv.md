---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git mv

**Definition:** Moves or renames a tracked file and stages that change in a single step, equivalent to running a plain `mv` followed by `git rm --cached` and `git add`.

## Syntax
```
git mv <source> <destination>
git mv -f <source> <destination>
git mv <source>... <directory>
```

## Common Options
- `-f` / `--force` — overwrite an existing file at the destination instead of refusing
- `-n` / `--dry-run` — show what would be renamed/moved without doing it
- `-k` — skip files that would produce an error instead of aborting the whole operation
- `<source>... <directory>` — move multiple files into a target directory in one call

## Basic Example
```
git mv old-name.js new-name.js
```
Renames the file on disk and stages it as a rename in one command.

## Extended Example
```
git mv src/utils.js src/helpers/utils.js
git mv src/helpers/*.spec.js src/helpers/__tests__/
git status
```
Moves a file into a new subfolder, then bulk-moves matching test files into a `__tests__` directory — `git status` then shows both as `renamed:` rather than a delete plus an untracked add, so reviewers see intent instead of noise in the diff.

## Under the Hood
Git has no dedicated "rename" object type. A commit's tree just records blobs at paths; there is no pointer saying "this blob used to live somewhere else." What `git mv` actually does is mechanical and unglamorous:

1. Move the file on disk with the equivalent of `mv`.
2. Remove the old path from the index (`git rm --cached` semantics) without touching the working tree copy, since it's already moved.
3. Add the new path to the index (`git add` semantics), staging the blob's content under its new name.

The "rename" you see in `git status` or `git diff` is entirely a *display-time* heuristic, computed after the fact by comparing a deleted path's blob against an added path's blob and checking how similar their content is (the similarity index, default threshold 50%). This means `git mv` doesn't actually create anything Git wouldn't have inferred anyway from a manual `mv` + `git add -A` — it just guarantees the rename is *detected as one* immediately, rather than depending on the heuristic finding a strong enough content match. If you move a file and rewrite most of its content in the same step, Git may give up and show it as an unrelated delete-plus-add instead of a rename, whether you used `git mv` or not.

## Flags Reference

| Flag | Effect |
|---|---|
| `-f`, `--force` | Allow overwriting an existing tracked or untracked file at the destination |
| `-n`, `--dry-run` | Print what would happen without moving/staging anything |
| `-k` | Skip invalid moves (e.g. missing source, existing destination) instead of erroring out and stopping the whole command |
| `-v`, `--verbose` | Print each file as it's renamed |
| `--` | Separate paths from options when a filename could be mistaken for a flag |

Case-only renames deserve a special mention: on case-insensitive filesystems (default macOS, Windows), renaming `Foo.js` to `foo.js` can confuse the OS layer even though Git itself is fully case-sensitive internally. `git mv Foo.js foo.js` sometimes needs an intermediate temporary name (`git mv Foo.js tmp && git mv tmp foo.js`) to force the filesystem to register both the delete and the create, since a direct rename may be treated as a no-op by a case-insensitive filesystem while Git's index still expects two distinct path entries.

## Common Workflow
Refactoring a directory layout is where `git mv` earns its keep — do it deliberately, in its own commit, separate from any content changes:
```
git mv src/api.js src/api/client.js
git mv src/api-utils.js src/api/utils.js
git status                          # confirm both show as "renamed:"
git commit -m "Reorganize API module into src/api/"
```
Keeping pure moves in their own commit means `git log --follow src/api/client.js` and `git blame` can walk straight through the rename to the file's prior history, and a reviewer can approve the restructuring commit without also having to re-review logic they've already seen.

## Comparison

| | `git mv old new` | `mv old new` + `git add -A` |
|---|---|---|
| Steps | 1 command | 2 commands |
| Rename detected immediately | Yes, guaranteed | Only if content similarity clears the default ~50% threshold |
| Safe against clobbering | Refuses unless `-f` | Plain `mv` silently overwrites |
| Result in `git status` | Identical once staged | Identical once staged |

Both approaches end up staging the exact same index state — `git mv` is a convenience wrapper, not a different underlying operation.

## History
Rename detection itself was one of the more contentious early design decisions in Git compared to systems like Perforce or ClearCase, which track renames as explicit first-class metadata. Linus Torvalds' original design philosophy for Git deliberately avoided storing rename intent, on the reasoning that content-similarity detection computed at diff/log time is more robust than trusting recorded intent — a file can be "renamed" in name only while its content is completely rewritten, or a rename can be reconstructed accurately from a plain delete-and-add even if the tool used didn't call itself `mv`. `git mv` was added as user-facing convenience on top of that model, not as an exception to it; it has never changed how renames are stored, only how conveniently they're expressed as one command instead of two.

## Rename Detection Tuning
Rename detection isn't unique to `git mv` — it's a general property of `git diff`, `git log`, and `git blame`, controlled independently of how the move happened:
- `git diff -M` (or `-M50%`, `-M90%` for a stricter/looser threshold) forces rename detection on for a single diff invocation, or tune the percentage.
- `diff.renames` in config (`git config diff.renames true`) turns it on by default for all diffs; many setups enable this globally.
- `git log --follow <path>` walks a file's history across renames, showing commits from before it had its current name — without `--follow`, history stops dead at the rename commit.
- `git blame -C` extends blame across renames and even across files, attributing lines to their origin commit even if the code moved between files.

None of this changes based on whether `git mv` or a manual `mv` + `git add` was used — both produce the identical index state, so detection quality depends only on content similarity, not on which command performed the move.

## Real-World Example
Splitting a monolithic module into smaller files is a common refactor where doing the moves as pure `git mv` operations first, then editing content in a follow-up commit, keeps history readable:
```
git mv src/app.js src/app/router.js
git mv src/app.js src/app/state.js   # fails: app.js already moved above
```
This second command fails because `src/app.js` no longer exists after the first `git mv` — splitting one file into two isn't something `git mv` can do directly, since it operates on whole file paths, not partial content. The real-world sequence is: copy or move the file to its primary new location, then trim/split content in a separate step:
```
git mv src/app.js src/app/router.js
git commit -m "Move app.js to app/router.js"
# now extract state logic into a new file
git add src/app/router.js src/app/state.js
git commit -m "Split state management out of router.js"
```
`git status` on the split commit shows a partial rename (Git detects `router.js` as a rename of the old `app.js` with a similarity percentage below 100%, plus a new file `state.js`), which is the expected, honest representation of what happened — a rename that also happens to shed content.

## FAQ
**Does `git mv` work on directories?** Yes — `git mv olddir newdir` moves every tracked file under it in one call, provided `newdir` doesn't already exist (or `-f` is used).

**Can `git mv` move an untracked file?** No — Git refuses with "not under version control." Untracked files need a plain `mv` followed by `git add`, since there's no tracked blob for `git mv` to re-point.

**Does `git mv` work across the whole repo or only the current directory?** It operates relative to the current working directory by default, same as any Git command, but source and destination paths can point anywhere inside the repository, not just nearby files.

**Does `git mv` preserve file permissions and the executable bit?** Yes — the index entry's mode (including the executable bit Git tracks on Unix-like systems) moves along with the blob to the new path; `git mv` doesn't touch permission metadata beyond what the filesystem move already does.

**Does `git mv` stage the change automatically?** Yes — unlike editing a file's content, which still needs `git add`, `git mv` stages the rename immediately as part of running the command.

**Is a rename stored differently in the commit object?** No — as covered under Under the Hood, there's no separate "rename" field in a tree or commit object. Every rename is a delete-at-old-path plus an add-at-new-path, and "rename" is purely a diff-time interpretation of those two changes.

**Does `git mv` handle merge/rebase conflicts differently than a normal file change?** Not fundamentally — a rename that conflicts with changes on another branch (e.g. one side renamed the file, the other edited its content) is handled by Git's rename-aware merge machinery, which tries to apply the content edit at the new path automatically. It can still produce a conflict if both sides renamed the same file differently, or one side deleted it entirely while the other renamed it.

**Does `git mv` support globbing?** Only as much as the shell provides — `git mv *.js src/` works because the shell expands `*.js` before Git ever sees the arguments, not because `git mv` itself implements pattern matching. On Windows shells without glob expansion (plain `cmd.exe`), the same command needs a loop or an explicit file list instead.

## Common Pitfalls
- Using the OS file explorer or a plain shell `mv` instead — Git's similarity-index heuristic (roughly 50% content match by default) usually still detects it as a rename on the next `git add`/`commit`, but only if the content didn't change too much; `git mv` guarantees it's tracked as a rename immediately
- Running it on a file with uncommitted content edits mixed into the same move — the rename and the content change land in the same diff, making it harder for a reviewer to see what actually changed
- Forgetting the destination must not already exist unless `-f` is passed — Git refuses rather than silently clobbering a tracked file
- Assuming a rename is tracked as a first-class fact — it isn't; if you later rebase or cherry-pick around it, Git recomputes the rename detection from scratch each time it diffs, and a heavily-edited file can lose its "renamed" status in some views even though it kept it in others
- Moving a file that has local, uncommitted modifications when the working tree also has unrelated staged changes — `git mv` operates on the specific source/destination pair you name, but a broad `git add -A` afterward can accidentally sweep in unrelated changes if you're not checking `git status` first
- Expecting `git mv` to update references to the old path elsewhere in the codebase — it only moves the file and updates the index; import statements, config paths, and documentation links pointing at the old location are left untouched and need a separate find-and-replace pass
- Running `git mv` inside a submodule boundary without realizing it — moving a file across a submodule's root either fails or produces confusing results, since submodules have their own independent `.git` metadata; the move needs to happen within the correct repository context

## Comparison: git mv vs git rm + git add
Beyond the plain-`mv`-then-`add` comparison above, it's worth contrasting `git mv` with explicitly using `git rm` and `git add` as separate staging steps, since some workflows reach for those instead:

| | `git mv old new` | `git rm old` then `git add new` |
|---|---|---|
| Working tree file | Moved automatically | You must move/create it yourself first |
| Guards against overwrite | Yes, refuses without `-f` | No — `git add` on an existing path just overwrites the index entry |
| Intent in history | Explicit, single atomic operation | Two separate staged changes that Git must infer are related |
| Typical use case | Everyday renames/moves | Rarely used this way directly — mostly relevant when scripting around the index manually |

`git rm` (see [[git rm]]) followed by `git add` is really the two operations `git mv` automates, spelled out — there's no case where doing it manually produces a materially different result, only more steps and more chances to forget the `-f` equivalent when overwriting.

For large-scale reorganizations, some teams prefer scripting many `git mv` calls (or an equivalent `find`/loop) over a single commit rather than relying purely on post-hoc rename detection, precisely because it removes any dependency on the similarity threshold guessing correctly across dozens of files at once.

## Related Commands
- [[git add]]
- [[git rm]]
- [[git status]]
- [[git diff]]
- [[git log]]
