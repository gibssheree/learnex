---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git blame

**Definition:** Shows who last modified each line of a file, and in which commit.

## Syntax
```
git blame [options] <file>
```

## Common Options
- `-L <start>,<end>` — limit output to a specific line range
- `-w` — ignore whitespace-only changes when attributing lines
- `-C` / `-C -C` — detect lines moved or copied from other files in the same commit (repeat for a wider search); slower but finds the real origin of copy-pasted code
- `-M` — detect lines moved within the same file
- `-e` — show the author's email instead of name
- `--since=<date>` — only consider commits after a given date
- `--ignore-rev <sha>` / `--ignore-revs-file <file>` — skip a specific commit (e.g. a mass reformat) when attributing lines, blaming through to the change before it
- `--first-parent` — when a merge commit touched a line, attribute to the merge itself rather than walking into the merged-in branch's history
- `--root` — treat the file's initial commit as a normal boundary commit instead of a special "root" case, useful for scripting consistent output

## Basic Example
```
git blame utils.js
```
Shows the commit, author, and date responsible for every line.

## Extended Example
```
git blame -L 40,60 -w -C utils.js
```
Checks only lines 40-60, ignoring whitespace-only edits and following code moved in from elsewhere in the same commit, so you find the actual logic change instead of a reformatting or copy-paste commit.

## Under the Hood
`blame` works by walking backward through commit history one revision at a time, computing a diff between each commit and its parent, and tracking which lines survive unchanged versus which lines a given commit actually introduced. For every line in the file's current state, it stops walking as soon as it finds the earliest commit where that exact line first appears in its current form — that commit gets the credit (or blame).

This is fundamentally an line-tracing algorithm, not metadata Git stores anywhere — there's no "blame index." That's also why it can be slow on large files with deep history: every line requires tracing back through potentially thousands of diffs. The `-C`/`-M` move-and-copy detection makes this more expensive still, because instead of just diffing a commit against its parent, Git has to search the rest of the tree (or the rest of the file) at that commit for a matching block of text before concluding a line was genuinely "added" versus "moved from elsewhere."

Internally this algorithm is shared with `git log --follow` and rename detection elsewhere in Git — both rely on the same similarity-index heuristic (a percentage threshold of matching content) to decide whether two blobs at different paths or times represent "the same" file content that moved, rather than unrelated files that happen to coexist. That's also why blame's rename/copy detection is a similarity search, not an exact match requirement: a file that was renamed and had 20% of its lines changed in the same commit is still detected as a move by default.

## Flags Reference
| Flag | Effect |
|---|---|
| `-L <start>,<end>` | Limit to a line range (also accepts `-L /regex/`) |
| `-w` | Ignore whitespace-only diffs when attributing |
| `-M` | Detect lines moved within the same file |
| `-C` | Detect lines moved/copied from other files changed in the same commit |
| `-C -C` | Also search files not modified in that commit |
| `-C -C -C` | Also search the commit that created the file |
| `-e` | Show author email instead of name |
| `-s` | Suppress author/date, show only sha and line |
| `--since=<date>` | Only walk commits after a given date |
| `--ignore-rev <sha>` | Skip a specific commit, attributing through to the prior change |
| `--ignore-revs-file <file>` | Skip a whole list of commits (e.g. mass reformats) from a file |
| `--reverse <since>..<until>` | Walk forward instead of backward, finding when a line was later removed or changed |
| `-p` / `--porcelain` | Machine-readable output for tooling and editor integrations |
| `--first-parent` | Attribute merge-touched lines to the merge commit, not the merged branch |
| `--root` | Treat the initial commit as an ordinary boundary, not a special case |
| `-f` | Show the filename in each line of output (useful with `--follow` across renames) |
| `-n` | Show line numbers from the original file instead of the current one |
| `-t` | Show raw timestamps instead of formatted relative dates |

## Common Workflow
Tracking down the real author of a confusing block of logic in a file that's been through a company-wide `prettier` reformat:
```
git log --oneline -- utils.js | grep -i prettier
# a1b2c3d Apply prettier formatting repo-wide
echo "a1b2c3d" >> .git-blame-ignore-revs
git config blame.ignoreRevsFile .git-blame-ignore-revs
git blame -w -C utils.js
```
Once `blame.ignoreRevsFile` is configured, every future `git blame` in the repo (and GitHub's own blame view, which respects the same file) skips straight past the reformat commit to the change underneath it, without needing `--ignore-rev` typed out each time.

## Comparison
| | `git blame` | `git log -- <file>` | `git log -p -- <file>` |
|---|---|---|---|
| Granularity | Per-line | Per-commit | Per-commit, with full diffs |
| Answers | "Who wrote this specific line, and when" | "What commits touched this file, in what order" | "What exactly changed in each commit" |
| Output shape | One attribution per current line | Chronological commit list | Chronological list plus diffs |
| Typical use | Understanding a specific piece of logic | Understanding a file's overall evolution | Reading every historical change in full |
| Speed on large history | Slower (line-tracing) | Fast | Slower (renders every diff) |

## History
- `blame` is one of Git's original porcelain commands, present since the earliest public releases, directly inspired by equivalent tools in CVS and SVN (`cvs annotate`, `svn blame`) — the concept predates Git itself.
- `-C`/`-M` move-and-copy detection were later additions specifically to fix the "reformatted or refactored file blames everything to the refactor" complaint, letting blame trace content instead of just line position.
- `blame.ignoreRevsFile` (and the standalone `--ignore-rev`/`--ignore-revs-file` flags) were added well after the core command existed, once mass-reformat commits (`gofmt`, `prettier`, `black`) became common enough that "blame is useless after we auto-formatted the codebase" was a recurring complaint. GitHub, GitLab, and most code-review tools now read the same `.git-blame-ignore-revs` file automatically.
- `git annotate` is an older, near-identical command that predates `blame`'s modern flag set; it's kept for compatibility but `blame` is the actively developed, more feature-complete version.
- Editor integrations (VS Code's GitLens, JetBrains' built-in annotate gutter, Vim's fugitive plugin) all shell out to the same `git blame` under the hood — there's no separate API, just the same porcelain command with different presentation on top.

## Real-World Example
Investigating why a specific validation rule exists before removing it, tracing through a rename along the way:
```
git log --oneline --follow -- src/validators/email.js   # see the file's full history, including its rename
git blame -C -M -w src/validators/email.js               # attribute lines, following moves/copies, ignoring whitespace
# line 42 points to commit e4f5g6h
git show e4f5g6h                                          # read the full commit message and diff for context
git log -1 --format="%an <%ae>, %ad" e4f5g6h              # get author and date without the full diff noise
```
The combination of `--follow` on `log` and `-C -M` on `blame` matters here: the file used to live at `src/validation/email.js` before a directory rename, and without following renames, both commands would silently stop at the rename commit instead of surfacing the original author's reasoning.

## Gotchas Deep-Dive
- **Blame across a squash-merge.** If a feature branch was squash-merged, all of that branch's individual commits collapse into one commit on `main` — blame will attribute every line from the feature to that single squash commit, losing the granular history of who wrote which specific line during development (still visible on the original feature branch if it wasn't deleted).
- **Blame in a shallow clone.** A shallow clone (`git clone --depth 1`) doesn't have the full commit history, so blame can only trace lines back as far as the shallow boundary — anything older reports the boundary commit as the origin, which is misleading if taken at face value.
- **Uncommitted changes.** Blame only reflects committed history by default; a line you just edited but haven't committed shows up as `0000000` ("Not Committed Yet") attributed to you, not to whoever last committed a change to it.
- **Performance on monorepos.** On files with thousands of historical commits, especially combined with `-C -C -C` (search the entire history for copy origins), blame can take a long time; prefer `-L` to scope to the lines you actually care about, or use `--since` to cap how far back it searches.
- **Merge commits obscuring the real author.** Without `--first-parent`, a line that was only touched inside a merged-in branch (not on the mainline itself) still attributes to whoever wrote it on that branch, which is usually what you want — but it can surprise reviewers expecting the merge commit's author to show up instead.
- **Case sensitivity in `--ignore-revs-file` paths.** The ignore-revs file itself must be tracked or reachable relative to the repo root; a typo'd or gitignored path fails silently on some Git versions rather than erroring, leaving you back at square one without realizing the config didn't take effect.

## FAQ
**Does `git blame` show who wrote the code originally, or who last touched it?** The latter — it shows the most recent commit that changed each line's current content, which may be a reformat, a rename, or a genuine rewrite, not necessarily the original author.

**Can I blame a specific commit instead of the working tree's current state?** Yes — `git blame <commit> -- <file>` shows attribution as of that commit, useful for understanding history as it stood before later changes.

**Is there a way to see blame for a whole directory at once?** Not natively in one command; `blame` operates per-file. Most editors and web UIs (GitHub, GitLab, VS Code's GitLens) layer a directory-wide view on top of running `blame` per file as needed.

**Why does blame show a different commit than the PR that reviewed the change?** Blame attributes to the actual commit that touched the line, which is often a squash or rebase-produced commit different from any individual commit visible in the PR's own timeline.

**Does blame work on files that were deleted and later re-added?** Only from the re-add commit forward by default; use `git log --follow` first to locate the earlier history, then `git blame <old-commit> -- <path>` against the version before deletion if you need that older attribution.

**Can I get blame output in a script-friendly format?** Yes — `git blame --porcelain` (or `-p`) emits a structured, line-oriented format with full commit metadata per hunk, meant for tools rather than terminal reading.

**Does blame respect `.mailmap`?** Yes — if a repo has a `.mailmap` file normalizing author identities (e.g. someone who committed under two different emails), blame's author output uses the mapped canonical name automatically.

**Is there a limit to how far back blame can trace?** Only the repo's actual history — a full clone can trace all the way to the root commit; a shallow clone stops at its depth boundary.

## Common Interview Questions
- What does `git blame -C` do that plain `blame` doesn't? — it detects lines moved or copied from elsewhere in the same commit, attributing to the real origin instead of the commit that merely relocated the code.
- Why can a mass-reformat commit make blame useless, and how do you fix it? — every line's last-touched commit becomes the reformat; fix with `.git-blame-ignore-revs` plus `blame.ignoreRevsFile` so blame skips past it automatically.
- Is `git blame` suitable for finding when a bug was introduced? — not directly; it finds the last change to a line's current text, not necessarily the change that caused a regression — [[git bisect]] answers that question instead.
- How does blame handle a file that's been renamed multiple times? — with `-C`/`-M` (or an editor/tool that calls blame with rename-following enabled), it chains similarity matches across each rename to keep tracing back through the file's full history.
- What information does each blame line actually carry? — an abbreviated commit hash, author name, commit date, the original line number, and the line's content itself.
- Why is `-C -C` slower than a single `-C`? — each additional `-C` widens the search scope for copy origins, from "files touched in the same commit" to "the whole tree at that commit," multiplying the comparisons Git has to run.

## Common Pitfalls
- Reading "blame" as an accusation — it's really "who last touched this and why," useful context for understanding unfamiliar code, not a callout
- A single mass reformat or `prettier`/`gofmt` commit "blaming" every line in the file to itself, hiding the real history — fix by adding that commit's hash to a `.git-blame-ignore-revs` file and setting `git config blame.ignoreRevsFile .git-blame-ignore-revs`
- Running plain `blame` on a renamed or moved file and getting no history before the rename — needs `-C`/`-M` (or `git log --follow`) to see through renames
- Blame can be slow on files with very long histories in large repos; scoping with `-L` avoids walking the whole file's history
- Assuming the blamed commit is where a bug was introduced — it only shows the *last* change to a line, not necessarily the change that broke anything; for that, [[git bisect]] is the right tool
- Forgetting `-w` when a line was reindented in the same commit as a real logic change — without it, the whole line (including the meaningful edit) gets attributed correctly, but nearby purely-whitespace lines get misleadingly flagged as changed too

## Related Commands
- [[git log]] — see the full commit history behind a file, not just per-line attribution
- [[git show]] — inspect the full diff and message of a commit blame points to
- [[git bisect]] — find which commit introduced a regression, as opposed to who last touched a line
- [[git diff]] — compare versions directly instead of tracing per-line authorship
- [[git config]] — set `blame.ignoreRevsFile` so mass-reformat commits are skipped automatically
- [[git status]] — check for uncommitted changes before trusting a blame result on the working tree
