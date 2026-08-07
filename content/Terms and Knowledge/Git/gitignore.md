---
tags: [term, git, setup]
category: Setup & Configuration
---

# .gitignore

**Definition:** A file listing patterns for files and folders Git should never track or show as untracked.

## Syntax
Not a command — a plain text file of patterns, one per line:
```
node_modules/
*.log
.env
```

## Common Options (pattern rules)
- `*` — matches anything except `/`
- `**/` — matches directories at any depth
- `!pattern` — negates/re-includes a previously ignored pattern
- Trailing `/` — matches directories only
- `#` at the start of a line — comment, ignored entirely
- Leading `/` — anchors the pattern to the location of the `.gitignore` file itself, rather than matching at any depth

## Basic Example
```
node_modules/
```
Ignores the entire dependency folder from ever being tracked. Because there's no leading `/`, this matches a directory named `node_modules` anywhere in the tree, not just at the repo root — handy for monorepos with nested `node_modules` folders per package.

## Extended Example
```
*.log
!important.log
build/
.env*
!.env.example
```
Ignores all `.log` files except `important.log`, ignores the `build/` folder, and ignores all `.env*` files except the example template. Order matters for negation: a `!pattern` can only re-include a file if none of its parent directories were themselves excluded by an earlier pattern — you cannot un-ignore a file inside an ignored directory without also explicitly re-including the directory.

## Under the Hood
`.gitignore` doesn't stop Git from tracking a file that's *already* tracked — it only affects three things: what `git status` reports as untracked, what `git add .` / `git add -A` picks up implicitly, and what interactive/glob-based commands silently skip. Internally, Git checks a file path against ignore patterns using the same matching engine as `.gitattributes`, evaluating multiple sources in a defined precedence order (highest to lowest specificity wins, later matching patterns override earlier ones within the same file):
1. `$GIT_DIR/info/exclude` — per-clone, never committed, useful for personal ignores you don't want to impose on the team
2. `.gitignore` files in the working tree, from the file's own directory up through the repo root — closer (more specific) files take precedence over ones nearer the root
3. The global gitignore file, configured via `core.excludesFile` (commonly `~/.gitignore_global`) — for OS/editor cruft you want ignored in every repo on your machine (`.DS_Store`, `*.swp`, `.idea/`)

Because ignore rules are purely a working-tree/index concern, a `.gitignore` file itself can be — and almost always should be — tracked and committed, so the whole team shares the same ignore rules for build artifacts, dependency folders, and local config.

## Pattern Reference
| Pattern | Matches |
|---|---|
| `foo` | Any file or directory named `foo`, anywhere in the tree |
| `/foo` | Only `foo` at the root of the `.gitignore`'s directory |
| `foo/` | Only directories named `foo` (not a file named `foo`) |
| `*.log` | Any file ending in `.log`, at any depth |
| `/*.log` | Only `.log` files directly in the root, not in subdirectories |
| `**/foo` | `foo` at any depth (equivalent to bare `foo` in most cases) |
| `foo/**` | Everything inside `foo/`, but not `foo/` itself as an entry |
| `a/**/b` | `b` under `a`, at any depth of nesting in between |
| `!foo` | Re-includes `foo` if it would otherwise be excluded by an earlier, less specific pattern |
| `\#notacomment` | Escapes a leading `#` so it's treated as a literal filename character, not a comment |
| `\!important` | Escapes a leading `!` so it's treated as a literal filename character, not a negation |
| `[Bb]uild/` | Bracket expression — matches either `Build/` or `build/`, useful for cross-platform case mismatches |

## Common Workflow
Setting up ignores for a new project before the first commit, so nothing unwanted is ever accidentally staged:
```
git init
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
echo ".env" >> .gitignore
echo ".vscode/" >> .gitignore
git add .gitignore
git commit -m "Add .gitignore"
```
Starting from a language/framework-specific template (GitHub maintains a large collection) and layering project-specific additions on top avoids reinventing common exclusions (build output, package manager caches, editor folders) and reduces the odds of ignoring something the framework actually needs tracked.

For a file that was accidentally committed before it was added to `.gitignore`:
```
echo "secrets.json" >> .gitignore
git rm --cached secrets.json
git commit -m "Stop tracking secrets.json"
```
`git rm --cached` removes the file from the index (future commits) while leaving it on disk — critical when the file is something like a local config you still need, just don't want Git to track anymore.

## Comparison
| Mechanism | Tracked/shared? | Scope | Typical use |
|---|---|---|---|
| `.gitignore` in repo | Yes (should be committed) | That directory and below | Team-shared ignores: build output, dependencies |
| `.git/info/exclude` | No, local only | Whole repo | Personal scratch files you don't want to impose on teammates |
| Global `core.excludesFile` | No, machine-wide | Every repo on that machine | OS/editor cruft (`.DS_Store`, `*.swp`) that has nothing to do with any specific project |
| `.gitattributes` | Yes | Path-based, but for attributes not ignoring | Line-ending normalization, diff/merge strategies, export-ignore — a different mechanism entirely, occasionally confused with `.gitignore` |

## Common Pitfalls
- Adding a file to `.gitignore` after it's already been committed — it stays tracked until you explicitly run `git rm --cached` on it
- Assuming a nested `.gitignore` pattern can un-ignore a file inside a directory that a parent `.gitignore` already excluded wholesale — Git won't even descend into an ignored directory to evaluate finer-grained rules, so the negation silently does nothing
- Using `*.env` or similarly broad wildcards without realizing they also match unintended files like `production.env.example`, accidentally hiding a file you actually wanted tracked
- Forgetting that `.gitignore` has zero effect on files already staged or committed — new team members are often confused when `git status` shows a file as clean despite it matching an ignore pattern, simply because it was tracked before the pattern existed
- Committing secrets, then adding the file to `.gitignore` and assuming the history is now clean — the secret is still fully present in every earlier commit; a real leak requires history rewriting (`git filter-repo`, BFG) plus rotating the credential
- Putting an absolute filesystem path (like `C:\Users\me\project\build`) into `.gitignore` instead of a repo-relative pattern — `.gitignore` patterns are always relative to the file's own location, never to an absolute OS path
- Expecting `.gitignore` changes to take effect against files Git has already indexed without re-checking — after editing `.gitignore`, `git status` reflects the new rules immediately for untracked paths, but tracked paths matching the new pattern require the explicit `git rm --cached` step; there's no automatic "stop tracking" side effect
- Using Windows-style backslashes (`build\output`) in pattern paths — `.gitignore` syntax always uses forward slashes regardless of platform, even when the repository is only ever used on Windows

## Gotchas Deep-Dive
- Ignore pattern precedence can surprise people: a more specific `.gitignore` deeper in the tree can re-include something a root-level `.gitignore` excluded, but only if the excluding pattern didn't exclude the containing *directory* itself (see the "can't un-ignore inside an ignored directory" pitfall above)
- `git check-ignore -v <path>` is the debugging tool for "why is this file being ignored" — it prints exactly which pattern, in which file, at which line number, is responsible, which is far faster than manually re-reading nested `.gitignore` files
- Empty directories are never tracked by Git regardless of `.gitignore` content, since Git only tracks file blobs, not directories as first-class objects — a common workaround is committing a placeholder file (`.gitkeep`, itself just a convention, not special to Git) inside directories you want to exist in every clone
- Trailing whitespace on a pattern line is significant and easy to introduce accidentally by copy-pasting from a chat app or webpage — Git treats trailing spaces as literal unless escaped with `\`, so `build/ ` (with a trailing space) may silently fail to match `build/`
- Case sensitivity depends on the underlying filesystem, not on `.gitignore` itself — on case-insensitive filesystems (default macOS, Windows), a pattern like `Build/` will also match a folder named `build/`, which can differ from behavior on a case-sensitive Linux CI runner and cause "works on my machine" ignore mismatches

## FAQ
**Does `.gitignore` work retroactively on already-committed files?** No — it only affects untracked files going forward. Already-tracked files need `git rm --cached` to actually stop being tracked.

**Can I have multiple `.gitignore` files in one repo?** Yes, and it's common — a `.gitignore` in a subdirectory applies to that subdirectory and below, layered on top of (and able to add to, though not always override) rules from parent directories.

**What's the difference between `.gitignore` and `.git/info/exclude`?** Both use identical pattern syntax, but `.gitignore` is a tracked file shared with everyone who clones the repo, while `.git/info/exclude` lives inside the untracked `.git` directory and is purely local to that one clone.

**Does ignoring a file remove it from the working directory?** No — `.gitignore` only affects Git's bookkeeping. The file stays on disk exactly as before; use `git clean` (separately, and carefully) if you actually want ignored files deleted from disk.

**Why does `git add .` sometimes still pick up a file I thought was ignored?** Usually a pattern-precedence issue — check with `git check-ignore -v <file>` first. A common cause is a pattern anchored with a leading `/` that only matches at the repo root, while the actual file lives in a subdirectory.

**Can `.gitignore` patterns use full regular expressions?** No — the syntax is glob-based (shell-style wildcards: `*`, `?`, `[abc]`, `**`), not regex. There's no way to express alternation like `(foo|bar)` directly; you'd need two separate pattern lines.

**Does `.gitignore` affect `git fetch` or `git pull`?** No — ignore rules are purely local, working-tree bookkeeping. They have no bearing on what's transferred between repositories; a file's presence in history is unaffected by any local `.gitignore`.

**What happens if I delete `.gitignore` entirely?** Previously-ignored files immediately show up as untracked in `git status`. Nothing about already-committed history changes, since `.gitignore` was never more than a filter on what counts as untracked/ignorable going forward.

## Interaction with Other Git Features
`.gitignore` patterns also influence a few commands beyond plain `status`/`add`:
- `git clean -x` deliberately overrides ignore rules to delete ignored files too (vs. plain `git clean` which by default leaves ignored files alone) — a frequent source of "why did clean delete my `node_modules`" surprise
- `git stash` skips ignored files by default; `git stash -u` includes untracked files but still respects `.gitignore` unless `-a`/`--all` is also passed
- `git archive` never includes ignored files in its output bundle
- `git worktree add` creates a fresh working tree that still respects the same `.gitignore` files tracked in the branch being checked out, so ignore behavior stays consistent across worktrees for the same repo
- Editors and IDEs with Git integration (VS Code, JetBrains IDEs) typically read `.gitignore` to decide what to exclude from search results and the file explorer's "show all files" view, layering their own UI convenience on top of Git's rules without changing what Git itself does
- Tab-completion in shells with Git integration (and many IDEs' file trees) often reads `.gitignore` to gray out or hide matching paths, which is a convenience layered on top of Git's own behavior, not something Git itself does

## Nested and Monorepo Considerations
In a monorepo with multiple packages, it's common to combine a broad root `.gitignore` (covering universal concerns like `node_modules/`, `.env`, OS files) with narrower per-package `.gitignore` files for build outputs specific to that package's toolchain (`dist/`, `.next/`, `target/`). This keeps the root file short and lets each package own its own build-artifact exclusions without every contributor needing to know every subproject's output directory names. The precedence rules described above (closer file wins on conflict) make this layering predictable rather than fragile.

A related but distinct need is ignoring files inside a package that itself gets consumed as a [[git submodule]] by other repos — in that case, the submodule's own `.gitignore` travels with it, but the parent repo's `.gitignore` has no effect inside the submodule's working tree, since Git treats a submodule as its own independent repository with its own ignore rules.

## History
`.gitignore` has existed since Git's earliest releases as a simple, deliberately unintelligent mechanism: pattern matching against paths, nothing more. There's no built-in "ignore anything not source code" heuristic and no per-language awareness baked into Git itself — that's why the community-maintained `github/gitignore` template repository exists, offering a maintained set of starting-point files per language and framework rather than Git trying to guess.

The `**` double-asterisk syntax (matching at any depth) was a later addition, standardizing behavior that previously required more verbose, less readable pattern repetition to express "at any level of nesting." Older `.gitignore` files predating that addition sometimes still use redundant patterns like `foo` and `*/foo` and `*/*/foo` side by side to approximate what `**/foo` now expresses in one line.

## Related Commands
- [[git rm]]
- [[git status]]
- [[git add]]
- [[git clean]]
- [[git config]]
- [[git stash]]
- [[git worktree]]
- [[git submodule]]
