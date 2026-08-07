---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git log

**Definition:** Shows the commit history of the current branch, most recent first.

## Syntax
```
git log [options] [<revision range>] [[--] <path>...]
```

## Common Options
- `--oneline` — one line per commit, just hash + message
- `--graph` — draws an ASCII graph of branches and merges
- `-p` — shows the full diff for each commit
- `--author="<name>"` — filter by commit author
- `-n <number>` / `-<number>` — limit output to the last N commits (e.g. `git log -5`)
- `--since=<date>` / `--until=<date>` — filter commits by date range

## Basic Example
```
git log --oneline
```
A quick, scannable history: one line per commit showing the abbreviated hash and the first line of the commit message, without the full author/date/body noise of the default format.

## Extended Example
```
git log --oneline --graph --all --decorate
```
Shows a visual branch graph across every branch, with branch and tag names labeled — the standard way to make sense of messy history. `--all` includes every ref (not just the current branch's ancestry), `--decorate` prints branch/tag names next to the commits they point at, and `--graph` draws the `*`/`|`/`\` lines showing where branches diverged and merged.

## Under the Hood
`git log` doesn't scan a separate history log file — Git has no such thing. Instead, it starts at the commit(s) given (defaulting to `HEAD`) and walks backward through parent pointers: every commit object stores the SHA of its parent commit(s) (zero for the root commit, one for a normal commit, two or more for a merge commit). `git log` is a graph traversal over these parent links, not a lookup into any kind of append-only ledger.

This has real consequences:
- History is reconstructed from the tip backward, so `git log` on a shallow clone (`git clone --depth`) simply hits a "grafted" boundary where parent links were intentionally truncated, and can't show commits before that
- Because a merge commit has multiple parents, `git log`'s default traversal follows *all* of them, which is why a plain `git log` on a heavily-merged branch shows commits from feature branches interleaved by date rather than strictly linearly — `--first-parent` restricts traversal to only the first parent of each merge, effectively showing "what happened on this branch" without descending into merged-in branch history
- `git log <path>` doesn't require a special index — Git compares each commit's tree object against its parent's tree object for that specific path and only reports commits where it actually differs, which is why `-p` combined with a path can be slow on large histories: it's doing real diff work per commit, not a simple filter

## Flags Reference
| Flag | Effect |
|---|---|
| `--stat` | Shows per-file insertion/deletion counts for each commit, without the full diff |
| `--shortstat` | Just the summary line (files changed, insertions, deletions) per commit |
| `-S<string>` | "Pickaxe" search — shows commits that changed the *number of occurrences* of `<string>` (added or removed it) |
| `-G<regex>` | Similar to `-S` but matches on a regex against the diff content itself, catching modifications `-S` would miss |
| `--follow -- <file>` | Follows a file's history across renames (single-file argument only) |
| `--merges` / `--no-merges` | Show only merge commits, or exclude them entirely |
| `--first-parent` | Only follow the first parent of merge commits — effectively "this branch's story," ignoring what came in from merged branches |
| `--grep=<pattern>` | Filter by commit message content (combine with `--all-match` to require multiple `--grep` patterns all match) |
| `--author=<pattern>` / `--committer=<pattern>` | Filter by author or committer identity |
| `--pretty=format:"..."` / `--format="..."` | Fully custom output format using placeholders like `%h` (short hash), `%an` (author name), `%ad` (author date), `%s` (subject) |
| `--abbrev-commit` | Shows shortened hashes even outside `--oneline` |
| `-L <start>,<end>:<file>` | Line-level history — shows commits that touched a specific line range in a file, more precise than `-p` on the whole file |
| `--reverse` | Walks history oldest-first instead of newest-first |

## Common Workflow
Investigating when a bug was introduced in a specific function, without knowing the exact commit:
```
git log -L 40,60:src/parser.js
```
Shows every commit that touched lines 40-60 of that file, each with the actual diff for those lines only — often faster than reading `git blame` output and cross-referencing full diffs manually. Combined with `-S`/`-G` for a broader net:
```
git log -G"parseTimestamp" --oneline
```
Finds every commit where a line matching `parseTimestamp` was added, removed, or modified anywhere in the diff — useful when you know a function name changed behavior at some point but don't know when. Both `-S` and `-G` accept `--pickaxe-regex` and can be scoped to a path the same way any other `log` invocation can, which matters on a large repo where an unscoped pickaxe search walks the entire history's diffs.

Auditing exactly who touched a security-sensitive file recently, restricted to a date window:
```
git log --since="3 months ago" --author="" --oneline -- src/auth/session.js
```
Combining a date filter, an unset author filter (matches everyone), and a path restriction narrows the output to a manageable, reviewable list rather than the file's entire history.

A common release-notes workflow:
```
git log --oneline --no-merges v1.2.0..v1.3.0
```
Lists every commit between two tags, excluding merge commits, giving a clean list of actual changes for a changelog. `--first-parent` is often added on top when the branch has a lot of squash-free feature-branch merges, so only the "landed on main" commits show up rather than every internal commit from each feature branch.

## Comparison
| Command | Purpose |
|---|---|
| `git log` | Walks and displays commit history, optionally with diffs |
| `git show <commit>` | Displays one specific commit's full diff and metadata (equivalent to `git log -1 -p <commit>`) |
| `git diff <a>..<b>` | Shows only the net difference between two points, no per-commit breakdown |
| `git blame <file>` | Shows, per line of a file's *current* content, which commit last touched it |
| `git reflog` | Shows a local, time-ordered log of where `HEAD` has pointed — a completely different data source (the reflog, not the commit graph), and it survives history rewrites that would make `git log` show something different |

## Common Pitfalls
- Running plain `git log` on a big repo and getting a wall of full commit messages — most people alias `--oneline --graph` immediately (see [[git config]] for aliases)
- Assuming `git log <file>` shows every commit that ever touched that path under all its historical names — by default it stops at the most recent rename; `--follow` is required to trace across renames, and only works with a single file argument
- Using `-S<string>` and expecting it to behave like a text search across the whole diff — it only reports commits where the *count* of that string's occurrences changed, so a commit that moved a line without changing its net count won't show up (use `-G` for content-pattern matching instead)
- Forgetting that `git log` by default only follows the current branch's ancestry — history on other branches, including unmerged feature work, is invisible without `--all` or explicitly naming those branches/commits
- Piping `git log -p` into `less` or a pager on a huge repo and being surprised by how slow it is — full diffs for the entire history is expensive; scope with a path, `-n`, or a revision range first
- Confusing author date and commit date — `git log`'s default `--pretty` shows the author date, which can differ substantially from the commit date after a rebase (the author date is preserved from the original commit, while the commit date reflects when the rebase actually created the new commit object)

## Gotchas Deep-Dive
- `git log A..B` and `git log B..A` are not the same thing and are easy to swap by mistake — `A..B` means "commits reachable from B but not from A," i.e. what B has that A doesn't
- Three-dot syntax (`git log A...B`) means something different again — commits reachable from either A or B but not both, i.e. the symmetric difference, often combined with `--left-right` to show which side each commit came from
- `git log` output order for commits with identical timestamps (common after a scripted rebase or import) falls back to a stable but not always intuitive tie-breaking order — don't assume strict chronological ordering is guaranteed to the second in edge cases
- `--graph` combined with `--oneline` on a very tangled history (many long-lived branches merging back and forth) can produce genuinely hard-to-read ASCII art; for real visual clarity, GUI tools (`gitk`, IDE history views) render the same graph data far more legibly
- `git log --all` includes remote-tracking branches (`origin/main`, etc.), stash refs are *not* included by default even though they're technically commits, and reflog-only (fully unreachable-by-ref) commits never show up in `log` at all regardless of flags — that's what `git reflog` and `git fsck --unreachable` are for instead
- Date filters (`--since`, `--until`) parse a surprisingly wide range of human-readable formats ("2 weeks ago", "yesterday", "2024-01-15") but silently accept ambiguous input by picking Git's best guess — always sanity-check the actual commits returned rather than trusting the filter blindly on ambiguous phrasing

## FAQ
**Does `git log` show commits from branches other than the current one?** Not by default — only the current branch's ancestry. Use `--all` for every ref, or name specific branches/commits explicitly.

**How do I see who last changed a specific line, not the whole file?** `git blame <file>` for a line-by-line current-state view, or `git log -L <start>,<end>:<file>` for the full history of just that line range including old diffs.

**What's the fastest way to find which commit introduced a bug?** If you can identify a code change (function name, string, line pattern), `git log -S` or `-G` narrows it directly. If you only know a good and bad commit but not what changed, [[git bisect]] does a binary search over the range instead.

**Why does `git log` sometimes show a commit twice with different hashes?** That's not actually the same commit twice — it's usually the pre- and post-rebase (or cherry-picked) versions of a logically identical change, each with a distinct hash because the parent or tree differs. `git log --cherry-mark` or `--cherry-pick` on a symmetric range can detect and annotate these as equivalent patches.

**Can `git log` show commits not yet pushed to a remote?** Yes — `git log origin/main..HEAD` shows commits on the current branch that the remote's `main` doesn't have yet, a common pre-push sanity check.

**Why do rebased commits show a different date than when I originally wrote them?** `git log`'s default view shows the *author* date, which is preserved through a rebase. The *commit* date changes because the commit object itself is genuinely new after a rebase (different parent, different tree in some cases, different hash). `git log --pretty=fuller` shows both dates side by side.

**Does `git log` work before the first commit exists?** No — it errors with something like "your current branch does not have any commits yet," since there's no starting point to walk from.

## Useful Format Strings
The `--pretty=format:` placeholders are worth knowing directly rather than relying only on the built-in presets (`oneline`, `short`, `medium`, `full`, `fuller`):
| Placeholder | Meaning |
|---|---|
| `%H` / `%h` | Full / abbreviated commit hash |
| `%an` / `%ae` | Author name / email |
| `%ad` | Author date (respects `--date=` formatting) |
| `%cn` / `%cd` | Committer name / committer date |
| `%s` | Subject line (first line of the message) |
| `%b` | Body (everything after the subject) |
| `%d` | Ref names pointing at this commit (like `--decorate`, inline) |
| `%p` | Abbreviated parent hashes |

A common custom alias combines several of these:
```
git log --pretty=format:"%h %ad %s (%an)" --date=short
```
Producing compact, script-friendly output — useful for generating changelogs or feeding commit metadata into other tooling without parsing the verbose default format.

## Performance Notes
On very large repositories, a few options meaningfully change how much work `git log` has to do:
- Restricting to a path (`git log -- path/to/file`) or a revision range (`git log v1.0..v2.0`) limits traversal, but Git still has to walk the full commit graph checking ancestry — it isn't a pre-indexed lookup unless the repo has a commit-graph file generated (`git commit-graph write`)
- `-p` and `--stat` require computing an actual diff for every commit visited, which is far more expensive than just printing metadata — on a large monorepo, `git log -p` over full history can take noticeably longer than `git log --oneline` over the same range
- `--follow` disables some traversal optimizations because it has to actively detect renames commit-by-commit rather than following a fixed path string, making it slower than a plain path-scoped `log`

## Related Commands
- [[git diff]]
- [[git show]]
- [[git blame]]
- [[git bisect]]
- [[git reflog]]
- [[git config]]
- [[git branch]]
- [[git tag]]
