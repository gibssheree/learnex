---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git show

**Definition:** Displays detailed information, metadata plus diff, about a single commit, tag, or other Git object.

## Syntax
```
git show <commit>
git show <tag>
git show <commit>:<path>
git show <commit>^ 
git show <commit>^2
git show --stat <commit>
git show --name-only <commit>
```

## Common Options
- `--stat` — show just a summary of files changed and line counts, not the full diff
- `-p` / `--patch` — show the full diff (default behavior for commits, can be forced explicitly)
- `--name-only` — list just the filenames that changed, no diff or stats
- `--name-status` — list filenames plus a status letter (A/M/D) for each
- `-s` / `--no-patch` — suppress the diff entirely, show only the commit metadata
- `--format=<fmt>` — customize the metadata output, same placeholder syntax as [[git log]]
- `--oneline` — condense the commit header to a single line

## Basic Example
```
git show a1b2c3d
```
Shows the full diff and metadata (author, date, message) for that commit.

## Extended Example
```
git show HEAD~2 --stat
git show HEAD~2:src/config.js
```
The first shows a summary of what changed 2 commits ago, without the full line-by-line diff — quick for a high-level check. The second prints the *entire contents* of `src/config.js` exactly as it existed at that commit, using the `<commit>:<path>` object-path syntax, without checking anything out or modifying the working directory.

## Under the Hood
`git show` is a generic object viewer — it works on any object type Git's object database can store, and it chooses its output format based on what kind of object it's looking at:
- Given a **commit**, it prints the commit metadata (author, date, message) followed by the diff against that commit's first parent — functionally identical to `git log -1 -p <commit>`.
- Given a **tag** (specifically an annotated tag object), it prints the tag's own message and metadata, then recurses to show the commit the tag points at.
- Given a **tree** (via `<commit>^{tree}` or a bare directory path), it lists that tree's contents.
- Given a **blob** (via `<commit>:<path>`), it prints the raw file contents at that point in history — no diff, no metadata, just the bytes.

This is the key difference from `git cat-file`, which is the plumbing-level equivalent: `cat-file -p <sha>` prints an object's raw contents with zero formatting or type-specific prettification, while `show` is the porcelain command that adds human-readable framing (colorized diffs, commit headers, etc.) on top. Internally, `show`'s commit-diffing behavior for merge commits defaults to a compact "combined diff" format showing only lines that differ from *both* parents, unlike `git log -p` on a range which by default skips merge commits' diffs entirely unless `-m` or `-c` is passed.

## History
`git show`'s diff options and the underlying diff machinery it shares with `git diff` and `git log` have accumulated features over time without changing the command's core purpose. One notable recent addition is `--remerge-diff` (Git 2.31+), which, when shown against a merge commit, re-performs the merge internally and displays a diff of exactly what conflict resolutions were made by hand — a targeted way to review whether a merge's manual conflict resolution introduced anything unexpected, distinct from the ordinary combined diff.

`git show`'s output also goes through whatever pager is configured (`core.pager`, typically `less`), and through the same diff algorithm selection as `git diff`: `--diff-algorithm=patience` or `--diff-algorithm=histogram` often produce more human-readable diffs than the default `myers` algorithm on commits that reorder or restructure code heavily, since they try harder to match up whole moved blocks instead of emitting a scattering of small line-level hunks. This is worth reaching for specifically when a commit's diff looks unexpectedly noisy for how small the actual logical change was.

## Comparison
| Command | Compares | Typical use |
|---|---|---|
| `git show <commit>` | One commit against its parent | "What did this specific commit change?" |
| `git diff <a> <b>` | Any two arbitrary points (commits, branches, working tree) | "What's different between X and Y?" |
| `git log -p` | A range of commits, each against its parent | "Walk me through the diffs of a whole series" |

A useful mental model: `git show` is `git log -p` with the range collapsed to exactly one commit, plus the ability to target non-commit objects. If a task starts as "let me look at this one commit" and grows into "let me look at how this evolved over several commits," that's the natural point to switch from `show` to `log -p` rather than repeating `show` in a loop.

## Flags Reference
| Flag | Effect |
|---|---|
| `--stat` | Summary of files changed, insertions/deletions, no diff |
| `--shortstat` | Just the final summary line (files changed, insertions, deletions) |
| `--name-only` | Filenames only |
| `--name-status` | Filenames with A/M/D/R status codes |
| `-s`, `--no-patch` | Metadata only, no diff |
| `-U<n>` | Show `<n>` lines of diff context instead of the default 3 |
| `--word-diff` | Diff at the word level instead of the line level |
| `--format=<fmt>` | Custom metadata format string (e.g. `--format=%H %an %s`) |
| `--no-color` | Disable ANSI color codes, useful when piping to a file or another tool |
| `--abbrev-commit` | Show abbreviated SHAs instead of full 40-character hashes |
| `<commit>^{tree}` | Show the tree object instead of the commit's diff |

A scripting-friendly one-liner combining several of these:
```
git show -s --format='%h  %an  %ad  %s' --date=short a1b2c3d
```
```
a1b2c3d  Jane Smith  2026-07-14  Fix header bug on mobile Safari
```
`-s` suppresses the diff, `--format` picks exactly the fields needed, and `--date=short` trims the timestamp to just a date — the kind of compact, single-line output that's useful for changelogs or commit-lookup tooling rather than interactive reading.

## Gotchas Deep-Dive
`--format` accepts the same placeholder tokens as `git log --format`, which is worth knowing since `show` and `log -1` are so closely related: `%H` (full hash), `%h` (short hash), `%an`/`%ae` (author name/email), `%ad` (author date, respects `--date=`), `%s` (subject), `%b` (body). A common scripting pattern is `git show -s --format='%h %s' <commit>` to grab a compact one-line summary of a commit with no diff at all — useful in changelog generation or commit-message linting scripts.

`git show` on a lightweight tag (created with `git tag v1.0` and no `-a`) behaves differently from an annotated tag: since a lightweight tag is just a ref pointing directly at a commit with no tag object in between, `git show` on it prints the commit's info directly, skipping the "tag metadata" layer entirely — there's no tagger, date, or tag message to show because none was ever created. This is a fast way to tell the two tag types apart without inspecting `.git/refs` directly.

## Common Workflow
Investigating a bug report that references a commit hash from CI logs:
```
git show --stat a1b2c3d          # quick overview of what files it touched
git show a1b2c3d                 # full diff if the summary looks suspicious
git show a1b2c3d:package.json    # check a specific file's exact state at that commit
```
This progressive drill-down — stat, then full diff, then a single file's raw content — avoids scrolling through an unnecessarily large diff when only a summary is needed first.

Inspecting what a release tag actually points to before deploying:
```
git show v2.3.0 --stat
```
Confirms both the tag's own annotation message and a summary of the commit it references, useful for verifying a tag wasn't accidentally created against the wrong branch.

## Inspecting Object Types Directly
For a lower-level look at exactly what kind of object a ref resolves to before deciding how to `show` it, `git cat-file -t <ref>` prints just the type (`commit`, `tag`, `tree`, or `blob`) without any formatting. This is occasionally useful when scripting against an unknown ref — checking the type first avoids `show` producing an unexpected format for, say, a tag versus a commit.

## Common Pitfalls
- Confusing it with `git diff` — `git show` looks at one commit's own changes (against its parent), `git diff` compares two arbitrary points and needs no commit to "own" the comparison
- Running `git show <merge-commit>` and being confused by the combined-diff output, which only shows lines differing from *all* parents by default — pass `-m` to see the diff against each parent separately
- Forgetting the colon syntax for viewing file contents (`<commit>:<path>`, not `<commit> <path>` or `<commit>/<path>`) and getting a "no such path" or "ambiguous argument" error
- Using `git show <branch>` expecting a range of commits — it only ever shows the single commit at the tip of that branch, not the branch's whole history; that's what [[git log]] is for
- Piping `git show`'s colorized output into another tool or file and getting garbled ANSI escape codes — add `--no-color` or pipe through `cat` when color isn't wanted

## FAQ
**How do I see just a file's content at an old commit without a diff?** `git show <commit>:<path>` — this is also the standard way to redirect an old file version to disk: `git show HEAD~3:src/app.js > old-app.js`.

**Can `git show` display more than one commit at once?** Yes, pass multiple refs (`git show HEAD HEAD~1`) or a range like `HEAD~3..HEAD` — for ranges it behaves like `git log -p` under the hood, printing each commit's diff in sequence.

**What's the difference between `git show HEAD^` and `git show HEAD^2`?** `HEAD^` (or `HEAD^1`) means the first parent of HEAD; `HEAD^2` means the second parent, which only exists if HEAD is a merge commit. This notation is how you navigate merge history without needing the actual SHA.

**Can `git show` display an object by its raw SHA instead of a ref?** Yes — any full or abbreviated SHA that Git can uniquely resolve works identically to a branch or tag name: `git show a1b2c3d4`. Abbreviated hashes just need to be long enough to be unambiguous in the current repo, typically 7-8 characters, though Git will ask for more if there's a collision.

**How is `git show`'s default output decided when I don't pass any format flags?** It follows the `pretty.<name>` / built-in format presets — the default for commits is roughly equivalent to `--pretty=medium`, showing hash, author, date, and message before the diff. Passing `--oneline` switches to a condensed single-line header, and `--format=fuller` expands it to include both author and committer identity/date separately, which matters when a commit was authored by one person and later applied or rebased by another.

**Does `git show` need network access for a commit that's already been fetched?** No — everything it displays comes from the local object database. It's a purely offline, read-only inspection command, same as `log` or `diff`, unlike `fetch` or `pull` which contact a remote.

**How do you make `git show`'s output script-friendly, avoiding pager and color interference?** Pipe through `--no-color` and either `| cat` or set `core.pager=cat` for that invocation, and prefer `--format` with explicit placeholders over the default pretty format, since default formats can shift slightly between Git versions while explicit `%H`/`%s`-style placeholders are stable across them.

## Common Interview Questions
**"What's the difference between `git show` and `git log -p -1`?"** They're nearly identical for a single commit — both print the commit's metadata and its diff against its parent. `git show` is the more general tool since it also works on tags, trees, and blobs, whereas `git log` is specifically built for walking a history range and only ever operates on commits.

**"How would you view a deleted file's last known content?"** Find the commit that deleted it with `git log --diff-filter=D -- <path>`, then view the file as it existed in the commit just before that: `git show <deleting-commit>^:<path>`. The `^` steps back to the parent, where the file still existed.

**"What does `git show <commit>^{tree}` do?"** The `^{tree}` suffix dereferences a commit down to the tree object it points at, so instead of a diff, `git show` lists that tree's direct contents (like `ls` at that point in history) rather than what changed to produce it.

**Does `git show` respect `.gitattributes` diff drivers (e.g. for Jupyter notebooks or binary formats)?** Yes — since it uses the same diff engine as `git diff`, any configured `diff=<driver>` attribute (textconv filters, custom binary diff tools) applies identically, so a notebook configured with a JSON-aware diff driver renders readably in `git show` output too, not just in `git diff`.

**Can `git show` be used to inspect a stash entry?** Yes — a stash is stored as a set of special commit objects, so `git show stash@{0}` shows the diff of the most recent stash exactly like any other commit reference, and `git show stash@{0}^3` (the third parent, when present) shows just the untracked files that were stashed alongside tracked changes.

## Related Commands
- [[git log]]
- [[git diff]]
- [[git tag]]
- [[git blame]]
- [[git cherry-pick]]
- [[git stash]]
