---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git status

**Definition:** Shows the current state of the working directory and staging area — what's changed, staged, or untracked.

## Syntax
```
git status [options] [--] [<pathspec>...]
```

## Common Options
- `-s` / `--short` — compact one-line-per-file output
- `-b` — show branch and tracking info even in short format
- `--long` — the default verbose format, explicit form
- `-u[<mode>]` / `--untracked-files[=<mode>]` — control how untracked files are reported: `no`, `normal` (default), or `all` (list files inside untracked directories individually instead of collapsing to the directory name)
- `--ignored[=<mode>]` — also list files excluded by `.gitignore`
- `--porcelain[=<version>]` — stable, script-friendly output format that won't change between Git versions
- `-v` / `--verbose` — also show the textual diff of what's staged (and, with `-vv`, unstaged too)

## Basic Example
```
git status
```
Lists modified, staged, and untracked files with full descriptions.

## Extended Example
```
git status -sb
```
Compact view showing the branch name plus short status codes (`M` modified, `A` added, `??` untracked) — fast to scan, good muscle memory before every commit.

For scripts and CI, the porcelain format is what you actually want:
```
git status --porcelain=v2 --branch
```
Produces a stable, parseable format with explicit branch/ahead-behind fields — safe to build tooling around, unlike the human-readable default whose wording can change between Git versions.

## Under the Hood
`git status` is fundamentally a two-way comparison done twice: it diffs `HEAD`'s tree against the index to produce the "Changes to be committed" section, and diffs the index against the working directory to produce "Changes not staged for commit." Untracked files are whatever's on disk that appears in neither.

It's read-only with one caveat: Git may rewrite the index's stat-cache (file size, mtime) as a side effect of checking whether a file changed, so the index's on-disk bytes can change even though the tree/blob content it describes doesn't. This is why `status` can occasionally run faster on a second invocation — the cached stat info let it skip re-hashing file content that the filesystem reports as untouched.

For large repos, scanning the working directory for untracked files is the actual bottleneck, not the index comparison. `core.untrackedCache` and `core.fsmonitor` exist specifically to make repeated `status` calls fast by caching filesystem state between invocations instead of re-walking the whole tree each time.

The index itself is written atomically: Git writes a new `.git/index.lock` file with the updated content, then renames it over `.git/index` only once the write succeeds. `status` normally only reads the index, but any stat-cache refresh it performs still goes through this lock-and-rename path, which is also why a crashed Git process can occasionally leave a stale `index.lock` behind and block every subsequent command with "Unable to create '.git/index.lock': File exists" until it's manually removed.

## Flags Reference
| Flag | Effect |
|---|---|
| `-s`, `--short` | Two-letter XY status codes, one line per file |
| `-b`, `--branch` | Branch + ahead/behind tracking info (paired with `-s` for the compact view) |
| `--long` | Full verbose format (default) |
| `-u[<mode>]` | Untracked file detail: `no` / `normal` / `all` |
| `--ignored[=<mode>]` | Show `.gitignore`d files too: `traditional` / `matching` / `no` |
| `--porcelain[=<version>]` | Stable machine-readable output (`v1` or `v2`) |
| `-z` | NUL-terminate entries instead of newlines, for safe scripting with odd filenames |
| `--show-stash` | Note how many stash entries exist, if any |
| `-v`, `--verbose` | Append diff of staged changes to the output |
| `--find-renames[=<n>]` | Detect renames between added/deleted file pairs above a similarity threshold |
| `--no-renames` | Disable rename detection, listing adds and deletes as unrelated entries |
| `--no-optional-locks` | Skip taking the index lock file, so status doesn't block a concurrent Git operation (useful for editors polling status in the background) |
| `--column[=<options>]` | Lay out untracked file names in columns instead of one per line |

## Common Workflow
The standard "know what you're about to commit" loop:
```
git status -sb
git diff              # review unstaged changes
git add -p            # stage selectively
git status -sb        # confirm exactly what moved to staged
git commit -m "..."
```
Running `status` both before and after `add` catches accidental staging of files that were only incidentally sitting in the working directory.

## Comparison
| | `git status` | `git diff --stat` |
|---|---|---|
| Shows file names + change type | yes | yes |
| Shows actual line content changed | no (use `-v` or `git diff`) | no, only line counts |
| Shows untracked files | yes | no, diff only covers tracked content |
| Distinguishes staged vs unstaged | yes, two separate sections | needs `--cached` run separately for staged |

## History
The short/porcelain formats exist because the original human-readable output was never meant to be parsed by scripts and has changed wording across Git versions — early automation that grepped the verbose format broke more than once as messages were reworded for clarity. `--porcelain` was added specifically as a stability contract: its format is guaranteed not to change between Git versions the way the long format can. `--porcelain=v2`, added later, extended this with more explicit fields (branch tracking, stash count, submodule state) without breaking existing `v1` consumers, which is why the version is opt-in rather than a silent upgrade.

## Gotchas Deep-Dive
A **detached HEAD** state prints differently from a normal branch checkout — the first line reads `HEAD detached at <sha>` instead of `On branch <name>`. Scripts or hooks that parse the first line assuming a branch name is always present will misbehave in this state, which comes up more often than expected in CI, where jobs frequently build a specific commit rather than a branch tip.

Submodules add another wrinkle: a submodule shows as modified in the superproject's `status` output whenever its checked-out commit differs from the pinned SHA, even if no file inside it was hand-edited — switching branches inside the submodule alone is enough to dirty the superproject's view. `--ignore-submodules=dirty` hides uncommitted edits inside submodules while still flagging a moved pointer; `--ignore-submodules=all` hides submodule state entirely.

`git status` also silently respects `.gitignore`, `.git/info/exclude`, and any global excludes file — a file can be "untracked but invisible" to status without ever appearing in the output at all, which is a common source of "why doesn't `git add .` pick this up" confusion. `git check-ignore -v <path>` pinpoints exactly which pattern in which file is responsible.

## Real-World Example
A pre-push sanity check many teams script by hand:
```
git fetch origin
git status -sb
```
If the branch line reads `## feature/x...origin/feature/x [behind 3]`, a plain `git push` will be rejected — this two-command check catches that before the push attempt fails, and before a `git pull` mid-review muddies the diff a reviewer already started looking at.

## Scripting Example
A minimal pre-commit hook that blocks a commit while unresolved merge conflict markers remain:
```sh
#!/bin/sh
if git status --porcelain | grep -q '^UU'; then
  echo "Unresolved conflicts present, aborting commit."
  exit 1
fi
```
`--porcelain`'s stability guarantee is what makes this safe long-term — the same grep pattern keeps working across Git upgrades, unlike scraping the long-format human-readable output, whose wording is free to change between releases.

## FAQ
**Why does a file show up under both "Changes to be committed" and "Changes not staged for commit"?** Because it's partially staged — some hunks were `git add`ed, others were edited afterward. `git diff --cached` shows the staged part, `git diff` shows the rest.

**Why isn't a file I just created showing up at all?** It's likely matched by a `.gitignore` pattern. Confirm with `git check-ignore -v <file>`, or run `git status --ignored` to see it explicitly.

**Does `git status` ever modify tracked files?** No — it never touches working-tree file content. It may only update the index's internal stat cache, which is metadata about the index itself, not your files.

**Why is `git status` slow on a huge monorepo right after cloning?** The untracked-file scan and stat-based change detection both have to walk the entire working tree cold, with no cache built yet. `core.fsmonitor` and `core.untrackedCache` amortize this cost across subsequent runs by watching for filesystem changes instead of re-scanning everything each time.

**Does `-uall` meaningfully change performance?** Yes, on repos with large untracked directories present (a `node_modules` not yet covered by `.gitignore`, for instance) — it forces Git to enumerate every file inside instead of reporting the directory as one collapsed untracked entry, which can turn a near-instant scan into a slow one.

**What's the practical difference between `--short` and `--porcelain`?** They look similar but serve different audiences: `--short` is for human eyes and has more room to evolve cosmetically; `--porcelain` is the explicit machine-readable contract, guaranteed stable across Git versions even when `--short`'s formatting details change.

**Can `git status` show me how far ahead/behind I am from a remote without fetching first?** It can report ahead/behind counts, but only against whatever `origin/<branch>` was as of the last `fetch` — it never talks to the network itself, so the numbers are only as fresh as your last fetch, not the true live state of the remote.

## Common Pitfalls
- Not running it before committing, and accidentally committing unrelated files that happened to already be staged
- Reading the short-format `XY` codes backwards — the first column (`X`) is the index/staged state, the second (`Y`) is the working-tree state, so `MM` means a file has staged changes *and* additional unstaged changes on top of those
- Assuming a clean `git status` means the working directory content matches the remote — it only compares against local `HEAD`, not `origin/HEAD`; run `git fetch` first if you need that
- Treating `??` (untracked) as safe to ignore — it also flags entirely new files you meant to `git add`, not just build artifacts
- Expecting `status` to show content diffs — it only reports *that* a file changed, not *how*; that's `git diff`'s job
- Forgetting that a clean submodule pointer can still hide dirty content inside it unless you pass `--ignore-submodules=none` or run `status` from inside the submodule directly
- Parsing the long, human-readable output in a script instead of `--porcelain` — the wording is not guaranteed stable across Git versions, while the porcelain formats explicitly are
- Not noticing the "Untracked files not listed" truncation note that appears when there are a very large number of untracked paths and `status.showUntrackedFiles` or a low `-u` mode is trimming the list

## Comparison Notes
Short-format codes worth memorizing since they show up constantly: `M` modified, `A` added, `D` deleted, `R` renamed, `C` copied, `U` unmerged (conflict), `??` untracked, `!!` ignored (only with `--ignored`). A conflicted file mid-merge typically shows `UU`; a renamed-and-modified file can show `RM`.

Combined with `git status -s`, these codes are also what most shell prompt plugins (like `git-prompt.sh` or Oh My Zsh's git theme) parse under the hood to render the little "3 modified, 1 untracked" indicators next to a branch name — they're calling `status` in short/porcelain form on every prompt render, which is part of why a slow `status` on a huge repo makes the whole shell feel sluggish.

## Related Commands
- [[git add]]
- [[git diff]]
- [[git commit]]
- [[git restore]]
- [[gitignore]]
