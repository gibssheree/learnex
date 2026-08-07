---
tags: [term, git, automation]
category: Hooks & Automation
---

# Git Hooks

**Definition:** Scripts Git automatically runs at specific points in the workflow, like before a commit or before a push, used to enforce checks or automate tasks.

## Syntax
Not a command — executable script files inside a repo's hooks folder, named after the event they run on, with no file extension:
```
.git/hooks/pre-commit
.git/hooks/prepare-commit-msg
.git/hooks/commit-msg
.git/hooks/post-commit
.git/hooks/pre-push
.git/hooks/post-checkout
.git/hooks/post-merge
```
Each file needs a shebang (`#!/bin/sh`, `#!/usr/bin/env node`, etc.) and, on Unix/macOS, execute permission (`chmod +x`). On Windows, Git for Windows invokes hooks through its bundled shell interpreter, so a shebang line is still required even without a native execute bit.

## Common Options (common hook names)
- `pre-commit` — runs before the commit message editor opens; takes no arguments; a non-zero exit aborts the commit. Common for linting/formatting/tests
- `prepare-commit-msg` — runs before the editor opens but after the default message is generated; useful for auto-inserting a ticket number parsed from the branch name
- `commit-msg` — runs after the message is written, receives the message file path as `$1`; can validate format (e.g. Conventional Commits) and reject with a non-zero exit
- `post-commit` — runs after the commit is created; can't abort anything, just for notifications/side effects
- `pre-push` — runs before pushing, receives the remote name/URL and reads the refs being pushed from stdin; common for running the full test suite first
- `pre-rebase` — runs before a rebase starts; can be used to block rebasing protected branches
- `post-checkout` / `post-merge` — run after a branch switch or a merge/pull; common for reinstalling dependencies when `package-lock.json` changed

## Basic Example
```sh
#!/bin/sh
# .git/hooks/pre-commit
npx eslint . || exit 1
```
A minimal `pre-commit` hook: runs the linter, and a non-zero exit code blocks the commit entirely — Git prints the hook's output and refuses to proceed. If the hook exits `0`, the commit proceeds exactly as if no hook existed.

## Extended Example
```
npm install husky --save-dev
npx husky init
echo "npx lint-staged" > .husky/pre-commit
git add .husky/pre-commit package.json
git commit -m "Add pre-commit lint hook via Husky"
```
Raw `.git/hooks/` scripts aren't version-controlled or shared automatically, so a hook manager like Husky (Node) or the `pre-commit` framework (Python) stores the hook definitions in a tracked file (`.husky/`, `.pre-commit-config.yaml`) and installs them into every teammate's `.git/hooks/` automatically on `npm install` / `pre-commit install`, so everyone gets the same checks.

## Under the Hood
Git invokes hooks as ordinary child processes at fixed points in its own commands — there's no special hook API, just Git calling `.git/hooks/<name>` if the file exists and is executable, and inspecting its exit code. Some hooks receive arguments, some read from stdin, some get environment variables (e.g. `GIT_PARAMS`, `GIT_DIR`); the exact contract differs per hook and is documented in `githooks(5)`.

Two things control where Git looks for hooks:
- By default, hooks live in `$GIT_DIR/hooks` (usually `.git/hooks/`), which is why they aren't tracked — `.git/` itself is never committed
- `core.hooksPath` (a config value) lets you point Git at a different, trackable directory instead — this is exactly what tools like Husky exploit: `git config core.hooksPath .husky` makes Git run scripts from a folder inside the working tree, which *is* tracked and shipped to every clone

When Git initializes a repo, `.git/hooks/` is pre-populated with `*.sample` files (e.g. `pre-commit.sample`) demonstrating the expected shape for each hook — these are inert until renamed without the `.sample` suffix and made executable.

## Hook Reference (client-side and server-side)
Beyond the commonly used ones, Git defines a larger set of hook points, each with specific arguments and exit-code semantics:

| Hook | Fires on | Args / stdin | Non-zero exit effect |
|---|---|---|---|
| `pre-commit` | `git commit`, before message editor | none | Aborts the commit |
| `prepare-commit-msg` | after default message generated | msg file, source, SHA (for amends) | Aborts the commit |
| `commit-msg` | after message is written | msg file path as `$1` | Aborts the commit |
| `post-commit` | after commit object is created | none | No effect (informational only) |
| `pre-rebase` | before `git rebase` starts | upstream branch, optional rebased branch | Aborts the rebase |
| `post-checkout` | after `git checkout`/`switch` | prev HEAD, new HEAD, branch-checkout flag | No effect |
| `post-merge` | after a successful merge | squash-merge flag (1/0) | No effect |
| `pre-push` | before `git push` transfers data | remote name, URL; refs via stdin | Aborts the push |
| `pre-receive` | server-side, before any refs update | old/new SHA + ref name via stdin | Rejects the entire push |
| `update` | server-side, once per ref being updated | ref name, old SHA, new SHA as args | Rejects that one ref |
| `post-receive` | server-side, after refs are updated | same stdin format as `pre-receive` | No effect (used for notifications, CI triggers) |
| `post-update` | server-side, after `post-receive` | list of updated ref names | No effect |
| `pre-auto-gc` | before an automatic `git gc` runs | none | Aborts the auto-gc |
| `post-rewrite` | after `commit --amend` or `rebase` rewrites commits | command name (`amend`/`rebase`) via `$1`, old/new SHA pairs via stdin | No effect |
| `sendemail-validate` | before `git send-email` sends a patch | patch file path | Aborts sending that patch |

Client-side hooks (`pre-commit`, `commit-msg`, `pre-push`, etc.) run on the developer's machine and can always be bypassed locally with `--no-verify`. Server-side hooks (`pre-receive`, `update`, `post-receive`) run on the remote and cannot be bypassed by the pushing client at all — this is why serious policy enforcement (blocking force-pushes to `main`, rejecting commits without a signed-off-by line) belongs server-side, not just in a local `pre-commit`.

Not every `--no-verify`-skippable hook is equally low-stakes to bypass, either: skipping `commit-msg` just means one malformed message, but skipping `pre-push` means an entire branch's worth of untested commits can leave the machine. Teams that care about this typically duplicate the same checks in CI so a bypassed local hook still gets caught before merge, rather than relying on developer discipline alone.

## Common Workflow
A realistic setup for a JavaScript project enforcing lint, tests, and commit message format on every commit and push:
```
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
echo "npx lint-staged" > .husky/pre-commit
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
echo "npm test" > .husky/pre-push
git add .husky package.json
git commit -m "Enforce lint, commit format, and tests via hooks"
```
`lint-staged` scopes the linter to only the files actually staged for commit (fast, incremental), `commitlint` rejects malformed commit messages against a config like Conventional Commits, and the `pre-push` hook runs the full suite as a last line of defense before code leaves the machine. Because all of this lives under `.husky/` — a tracked directory — every teammate gets the same hooks automatically after `npm install`, with no manual `.git/hooks/` setup.

## Comparison
| Approach | Tracked in Git? | Setup | Typical use |
|---|---|---|---|
| Raw `.git/hooks/*` scripts | No | Manual, per-clone | Personal automation, quick experiments |
| `core.hooksPath` pointing into the repo | Yes (the target directory is) | One-time `git config` per clone, or automated via a package script | Team-shared hooks without extra dependencies |
| Husky (Node ecosystem) | Yes | `npm install` triggers setup automatically | JS/TS projects already using npm/yarn/pnpm |
| `pre-commit` framework (Python ecosystem) | Yes | `.pre-commit-config.yaml` + `pre-commit install` | Polyglot repos, Python projects, language-agnostic hook chains |
| Lefthook (Go, single binary) | Yes | `lefthook.yml` + `lefthook install` | Large repos wanting parallel hook execution without a Node/Python dependency |

## Common Pitfalls
- Writing a raw hook script directly in `.git/hooks/` and assuming it's shared with the team — that folder isn't tracked by Git at all, it's local-only unless you use a hook-management tool
- Forgetting `chmod +x` on a hand-written hook script on Unix/macOS — Git silently skips non-executable hooks instead of raising an error
- Bypassing hooks entirely with `git commit --no-verify` or `git push --no-verify` — useful in a real emergency, but easy to forget you did it and ship something the hook would have caught
- Writing a slow `pre-commit` hook (e.g. running the full test suite on every commit) that everyone starts skipping out of frustration; keep `pre-commit` fast and push heavier checks to `pre-push` or CI
- Assuming a client-side hook is a security boundary — anyone can `--no-verify` past it, delete it, or clone the repo without it (hooks aren't cloned at all by default). Real enforcement requires server-side hooks or CI/branch protection
- Writing a `commit-msg` hook that mutates `$1` in-place incorrectly (e.g. truncating instead of appending) — since Git reads the file back after the hook runs, a buggy rewrite can silently corrupt every commit message
- Relying on hook exit codes without testing the failure path — a hook that always exits `0` because of a shell scripting mistake (e.g. a `grep` in a pipeline swallowing the real command's exit status) provides zero actual protection while looking like it works
- Assuming `post-commit` or `post-merge` can veto anything — by the time they run, the commit or merge has already fully completed; their non-zero exit code is logged but changes nothing, so they're only appropriate for side effects like notifications, not validation
- Putting secrets or credentials directly in a hook script that later gets moved into a tracked directory (`.husky/`, etc.) — anything under `core.hooksPath` is committed and pushed like any other file, so it's visible to everyone with repo access

## FAQ
**Do hooks get cloned along with the repository?** No. `.git/hooks/` is part of the local `.git` directory, which is never transmitted by `clone`, `fetch`, or `push`. Every clone starts with only the `*.sample` files; that's precisely why hook-management tools relocate hooks into a tracked path via `core.hooksPath`.

**Can a hook stop a `git push --force`?** A client-side `pre-push` hook can inspect the refs being pushed (available via stdin) and reject a force-push locally, but the real, unbypassable control point is a server-side `pre-receive` or `update` hook, or a hosting platform's branch-protection rules.

**What's the difference between `pre-receive` and `update`?** `pre-receive` runs once for the whole push (all refs at once, via stdin) and can reject the entire push atomically. `update` runs once per ref being updated and can accept some refs while rejecting others in the same push.

**Are hooks synchronous?** Yes — Git waits for the hook process to exit before continuing (or aborting) the operation. A hook that hangs (e.g. waiting on network I/O with no timeout) will hang the corresponding Git command.

**Can hooks be written in any language?** Yes, as long as the file is executable and has a valid shebang (or is a `.bat`/`.cmd`/PowerShell wrapper on Windows) — Git just execs the file and reads its exit code. Shell, Python, Node, Ruby, and compiled binaries are all common in practice.

**Do hooks run for GUI Git clients too?** Yes — hooks fire for any tool that goes through Git's plumbing/porcelain commands (command line, GitHub Desktop, GitKraken, IDE integrations), since the hook mechanism lives inside `git` itself, not in any particular frontend. A GUI client that shells out to `git commit` triggers `pre-commit` exactly like the CLI would.

## Gotchas Deep-Dive
- `core.hooksPath` is a per-clone config value, not something that travels with the repository automatically — a hook manager's install step (`husky install`, `pre-commit install`, `lefthook install`) is what actually sets it, typically via a `prepare` script in `package.json` that runs on every `npm install`. If that install step is skipped (e.g. `npm install --ignore-scripts`), hooks silently don't run for that clone
- Hooks inherit the environment and working directory of the Git command that triggered them, which trips people up when a hook assumes it's running from the repo root but was invoked from a subdirectory — use `git rev-parse --show-toplevel` inside the hook rather than assuming `cwd`
- A `pre-commit` hook that modifies files (e.g. auto-formatting) needs to `git add` those changes itself before exiting, or the commit will include the unformatted version — Git snapshots the index at the point the hook is invoked relative to each stage, not "whatever the file looks like when the hook finishes" automatically
- On Windows, line-ending differences (CRLF vs LF) in a hook script can break the shebang interpretation entirely, producing a cryptic "command not found"-style failure; keep hook scripts LF-encoded even when the rest of the repo uses CRLF
- Hook execution order for multiple concerns (lint, then test, then format) is entirely up to how the script chains commands — Git only knows about one file per hook name, so tools like Husky and `pre-commit` implement their own internal task runners to fan a single hook invocation out into multiple checks

## History
Git hooks have existed since Git's early versions as a direct, low-level mechanism — literally "if this file exists and is executable, run it" — with no configuration format of its own. That simplicity is also why the ecosystem grew hook-management tools: teams needed version control, cross-platform reliability, and shared configuration on top of a mechanism Git deliberately kept minimal. `core.hooksPath` (added in Git 2.9, 2016) was the key enabler that let those tools work without manually symlinking or copying files into `.git/hooks/` on every clone, which is the trick nearly every modern hook manager relies on.

## Related Commands
- [[git commit]]
- [[git commit --amend]]
- [[git push]]
- [[git rebase]]
- [[git config]]
- [[git bisect]]
- [[CI-CD|CI/CD]]

## Common Interview Questions
**"How would you enforce a linter before every commit across a team?"** Point to a hook manager (Husky, `pre-commit`, Lefthook) that relocates hooks into a tracked directory via `core.hooksPath`, wired to install automatically via the package manager's lifecycle scripts — not raw `.git/hooks/` files, since those never leave the author's machine.

**"Can a developer bypass a Git hook?"** Yes, trivially, for any client-side hook (`--no-verify`, deleting the script, or simply not installing it). The only unbypassable enforcement point is server-side (`pre-receive`/`update` on the hosting platform) or a separate CI pipeline that reruns the same checks after the push.

**"What's the difference between a Git hook and a CI pipeline step?"** A hook runs locally, before or after a Git action, with zero network round-trip and no shared infrastructure — fast feedback, but bypassable and only as consistent as each developer's local setup. A CI step runs on a shared server after a push, can't be skipped by the pusher, but adds latency and only catches problems after the code has already left the machine. Mature setups use hooks for fast local feedback and CI as the actual gate.

**"Why would a `commit-msg` hook receive a file path instead of the message text directly?"** Because the message may span multiple lines and contain arbitrary characters that are awkward to pass as a single argument; Git writes the in-progress message to a temp file (`.git/COMMIT_EDITMSG`) and hands the hook that path so it can read, and if needed rewrite, the message in place before Git reads it back.
