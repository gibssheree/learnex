---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git diff

**Definition:** Shows the line-by-line differences between two states — working directory vs staging, staging vs last commit, or between any two commits or branches.

## Syntax
```
git diff [options] [<commit>] [<commit>] [-- <path>...]
```

## Common Options
- `--staged` / `--cached` — show what's staged vs the last commit, instead of unstaged changes
- `<commit1>..<commit2>` — compare two specific commits or branches
- `-- <path>` — limit the diff to a specific file or folder
- `--stat` — show a summary of changed files and line counts instead of the full diff
- `-w` / `--ignore-all-space` — ignore whitespace-only changes
- `--word-diff` — show differences at the word level instead of the line level

## Basic Example
```
git diff
```
Shows unstaged changes in the working directory.

## Extended Example
```
git diff main..feature-branch -- src/
```
Shows only the differences inside the `src/` folder between `main` and `feature-branch` — useful for reviewing a pull request's actual scope before merging.

## Under the Hood
`git diff` compares two "blobs" — snapshots of file content addressed by SHA — and computes a textual delta using a diff algorithm (Myers by default; `--patience` and `--histogram` are alternatives better suited to code with repeated blocks, like generated files or minified JS). Which two states it compares depends entirely on the arguments:

| Command | Compares |
|---|---|
| `git diff` | Working directory vs the index (staging area) |
| `git diff --staged` | Index vs `HEAD` (the last commit) |
| `git diff HEAD` | Working directory vs `HEAD`, ignoring the index entirely |
| `git diff <a> <b>` | Any two commits, branches, or tags directly |
| `git diff <a>...<b>` | `b` vs the merge-base of `a` and `b` — what `b` introduced since diverging |

This three-way distinction between the working directory, the index, and `HEAD` is the same three-tree model underlying `git status`, `git add`, and `git commit` — `diff` is really just "show me the delta between any two of these trees, or between any two arbitrary commits."

The `..` vs `...` distinction is one of the most commonly missed details: `git diff main..feature` shows literal differences between the two tips, while `git diff main...feature` shows only what changed on `feature` since it branched off `main`, ignoring any commits made on `main` in the meantime. The triple-dot form is almost always what you want when reviewing a feature branch's own contribution.

## Flags Reference
| Flag | Effect |
|---|---|
| `--staged`, `--cached` | Diff the index against `HEAD` instead of the working directory |
| `--stat` | Summarize files changed, insertions, deletions per file |
| `--name-only` | List only the filenames that differ |
| `--name-status` | List filenames with a status letter (A/M/D/R) |
| `-w`, `--ignore-all-space` | Ignore whitespace differences entirely |
| `-b`, `--ignore-space-change` | Ignore changes in amount of whitespace, not its presence |
| `--word-diff` | Highlight word-level rather than line-level changes |
| `-U<n>` | Show `<n>` lines of context around each change (default 3) |
| `--color-words` | Word diff shown inline with color instead of markers |
| `-M` | Detect renames |
| `-C` | Detect copies |
| `<a>..<b>` | Direct diff between two refs |
| `<a>...<b>` | Diff `b` against the merge-base of `a` and `b` |
| `--shortstat` | Print only the final summary line (files/insertions/deletions) |
| `--diff-filter=<chars>` | Restrict output to certain change types, e.g. `A` (added), `D` (deleted), `M` (modified) |
| `--no-index` | Diff two arbitrary files outside any Git repository entirely |

## Common Workflow
Reviewing your own work before committing, in stages:
```
git diff                 # what's changed but not staged
git add -p               # stage the parts you're confident about
git diff --staged        # double check exactly what will be committed
git commit
```

Reviewing a pull request's actual scope, ignoring noise:
```
git diff main...feature-branch -- src/ -w --stat
```
Combines the merge-base comparison (only the feature branch's own changes), whitespace-insensitivity, path scoping, and a summary view — a fast way to sanity-check size and shape before reading the full diff line by line.

Auditing exactly what a merge would introduce before actually performing it:
```
git fetch origin
git diff HEAD...origin/main --stat
git diff HEAD...origin/main -- package.json
```
Checking `--stat` first gives a quick sense of scope (how many files, how much churn), then scoping to a specific file like `package.json` catches dependency changes that are easy to miss in a large diff but often matter most for review.

## Comparison
| | `git diff` | `git status` | `git log -p` |
|---|---|---|---|
| Shows | Line-by-line content changes | Which files changed (not content) | Full history of commits, each with its diff |
| Scope | Two specific states you choose | Working dir vs index vs HEAD, summarized | Every commit in a range |
| Typical use | "What exactly changed?" | "What's dirty right now?" | "How did this evolve over time?" |

## Common Pitfalls
- Forgetting `--staged` and wondering why `git diff` shows nothing after you already ran `git add`
- Using `..` when you meant `...` (or vice versa) when comparing branches — `..` includes divergence from both sides, `...` shows only one side's changes since the common ancestor, and the two can produce very different-looking diffs on long-lived branches
- Diffing binary files and getting an unhelpful "Binary files differ" — configure a diff driver in `.gitattributes` (e.g. for images or Word docs) to get meaningful output via external tools
- Trusting `git diff` alone to catch renamed files without similarity detection kicking in — Git tries to detect renames heuristically, but a heavily edited renamed file may show as a delete plus an add instead of a rename unless you tune the `-M` similarity threshold
- Piping `git diff` output somewhere and losing the color/formatting that made it readable interactively — use `--color=always` when piping to a pager or tool that supports ANSI codes
- Assuming `git diff` respects `.gitignore` for untracked files the way `git status` does — it's not comparing untracked files at all, so ignore rules are irrelevant to it; they only matter for `git add` and `git status`
- Reviewing a diff with default 3-line context and missing that a change also affected an unrelated block further down — `-U10` or more widens context when reviewing subtle logic changes in dense code
- Comparing a file that changed encoding (UTF-8 to UTF-16, for instance) and getting a "Binary files differ" message even though the content is conceptually text — Git determines binary-vs-text heuristically by scanning for NUL bytes, which most non-UTF-8 encodings trigger
- Assuming `git diff` output is stable to parse with custom scripts across Git versions — output formatting details (context markers, hunk headers) can shift; use `--numstat` or `git diff --raw` for machine-readable output instead of scraping the human-oriented format
- Expecting `git diff` to paginate automatically in every environment — it does when run interactively in a terminal with `core.pager` set (the default), but piping or redirecting output disables the pager, which can be surprising the first time it happens in a script

## Gotchas Deep-Dive
- **Diff algorithm choice matters for readability**: `--histogram` and `--patience` (vs the default Myers algorithm) often produce far more legible diffs on code with repeated structural patterns — e.g. a function moved and lightly edited can appear as one clean move instead of scattered line-by-line noise. Set permanently with `git config --global diff.algorithm histogram`.
- **External diff tools**: `git difftool` wraps `git diff` to launch a GUI tool (VS Code, Beyond Compare, meld) configured via `diff.tool` — useful for large or structural changes where a terminal diff is hard to read, without changing how plain `git diff` behaves for scripting.
- **`.gitattributes` diff drivers**: mapping a file extension to a custom textconv filter (e.g. extracting text from a `.docx` or `.pdf` before diffing) turns "Binary files differ" into an actual readable diff, entirely configured per-repo without touching Git itself.
- **Diffing against a nonexistent path is silent, not an error**: `git diff HEAD -- path/that/never/existed` returns no output and exit code 0, which can mask a typo'd path in a script rather than failing loudly.
- **Exit codes for scripting**: with `--exit-code`, `git diff` returns 1 if differences exist and 0 if not (instead of always 0), which makes it usable directly in shell conditionals like `if git diff --exit-code --quiet; then ...`.
- **`--quiet` suppresses output entirely**: combined with `--exit-code`, useful for CI checks like "fail the build if generated files are out of date," since only the exit status matters, not the diff text itself.

## Common Interview Questions
**"How do you review only what a feature branch actually changed, ignoring commits merged into main after the branch was cut?"** `git diff main...feature` (triple-dot), which diffs against the merge-base rather than main's current tip.

**"Why might `git diff` show a rename as delete+add?"** The file changed enough that its similarity to the "renamed-to" file fell below Git's detection threshold (default ~50%); lowering it with `-M40%` or similar can recover the rename detection.

**"What's the difference between `git diff` and `git diff --staged`?"** `git diff` compares the working directory to the index; `--staged` (or `--cached`) compares the index to `HEAD` — together they cover both halves of what `git status` summarizes.

**"How would you fail a CI job if a generated file wasn't regenerated and committed?"** Regenerate the file, then `git diff --exit-code -- path/to/generated/file` — a nonzero exit means the checked-in version is stale.

**"Someone asks for 'just the list of files that changed, not the content' — what do you run?"** `git diff --name-only` (or `--name-status` if they also want add/modify/delete classification per file).

## FAQ
**Does `git diff` show untracked files?** No — untracked files have nothing to compare against in the index or `HEAD`, so they never appear in `git diff` output. Use `git status` to see them, and `git add` before they can appear in a diff.

**How do I diff a single file across two commits?** `git diff <commit1> <commit2> -- path/to/file`.

**Can I see a diff of a specific commit by itself, not a range?** Yes — `git show <commit>` is equivalent to `git diff <commit>^ <commit>` for a single commit, and also includes the commit message.

**Why does `git diff` sometimes show a file as fully deleted and re-added instead of modified?** Usually a line-ending or encoding change (CRLF vs LF) touching every line, or the file exceeding Git's rename/similarity detection threshold after heavy edits.

**How do I diff two arbitrary commits that aren't on the same branch?** `git diff <sha1> <sha2>` works regardless of branch relationships — Git just needs two valid commit references, not a common branch.

**Can `git diff` show changes across an entire directory rename?** Yes, if similarity detection succeeds — `-M` applies per-file, and with enough unchanged content Git reports the move even when nested inside a renamed directory, though very large renames may need `-M` with a lower threshold to be caught.

**Is there a way to see just the number of lines changed without the content?** `git diff --shortstat`, which prints a single summary line like "3 files changed, 42 insertions(+), 7 deletions(-)".

## Related Commands
- [[git status]]
- [[git log]]
- [[git show]]
- [[git add]]
