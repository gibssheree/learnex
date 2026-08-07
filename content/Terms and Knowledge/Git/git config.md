---
tags: [term, git, setup]
category: Setup & Configuration
---

# git config

**Definition:** Reads or sets configuration values for Git, at the system, global (user), or local (repo) level.

## Syntax
```
git config [--local|--global|--system|--worktree] [--get|--unset|--list|--edit] <key> [<value>]
```

## Common Options
- `--global` — applies to every repo for your user (e.g. name/email)
- `--local` — applies only to the current repo (default if run inside one)
- `--list` — show all currently set config values
- `--get <key>` — read a single value
- `--unset <key>` — remove a key
- `--edit` — open the relevant config file directly in your editor instead of setting a value
- `--show-origin` — show which config file each value came from

## Basic Example
```
git config --global user.name "Gilbert"
git config --global user.email "you@example.com"
```
Sets your identity for every commit you make, in every repo.

## Extended Example
```
git config --global alias.co checkout
git config --global alias.lg "log --oneline --graph --all"
```
Creates shortcuts so `git co` works as `git checkout`, and `git lg` gives you a readable branch graph instantly.

## Under the Hood
Git configuration is just a small set of INI-style text files, read in a defined precedence order where later scopes override earlier ones:
1. **System** — `/etc/gitconfig` (or platform equivalent) — applies to every user on the machine. Set with `--system`.
2. **Global** — `~/.gitconfig` or `~/.config/git/config` — applies to every repo for your user. Set with `--global`.
3. **Local** — `<repo>/.git/config` — applies only to that repository. Set with `--local`, the default when run inside a repo.
4. **Worktree** — `<repo>/.git/config.worktree` — applies only to one worktree, when `extensions.worktreeConfig` is enabled. Set with `--worktree`.

Because later scopes override earlier ones, a `user.email` set locally in one repo silently shadows your global one for that repo only. `git config --list --show-origin` is the fastest way to see exactly which file supplied each active value when something looks wrong.

`git config` is a thin read/write interface over these plain text files — you can edit them directly with any text editor and Git picks up the changes immediately, with no reload step required. Aliases (`alias.co`) are stored as literal `[alias]` sections and are just string substitution: `git co` becomes `git checkout` before Git parses anything else, which means alias values can include flags, chained commands via a leading `!` (running an arbitrary shell command), and even full shell one-liners.

## Flags Reference
| Flag | Effect |
|---|---|
| `--global` | Read/write `~/.gitconfig` |
| `--local` | Read/write `<repo>/.git/config` (default inside a repo) |
| `--system` | Read/write the machine-wide config file |
| `--worktree` | Read/write a per-worktree config file |
| `--list` (`-l`) | Print all resolved key/value pairs |
| `--get <key>` | Print a single key's value |
| `--get-all <key>` | Print all values for a multi-valued key |
| `--unset <key>` | Remove a key |
| `--unset-all <key>` | Remove all instances of a multi-valued key |
| `--edit` (`-e`) | Open the config file in `$EDITOR` |
| `--show-origin` | Prefix output with the file each value came from |
| `--replace-all` | Replace all matching lines instead of adding a new one |
| `--add` | Add a new line for a key even if one already exists, creating a multi-valued entry |
| `--type <t>` | Validate/coerce the value as `bool`, `int`, `path`, `expiry`, etc. |
| `--null` (`-z`) | Terminate output values with NUL instead of newline, for safe scripting |

## History
- Early Git only had two effective scopes in practice — global and repo-local — with system-wide config used mainly on shared multi-user machines.
- `includeIf` conditional includes were added specifically to solve the "different identity per directory tree" problem without requiring a script or manual per-repo setup on every clone.
- Worktree-scoped config (`--worktree`, requiring `extensions.worktreeConfig`) is a comparatively recent addition, arriving alongside broader improvements to `git worktree` support for working on multiple branches of the same repo simultaneously.
- `git config --type` (replacing the older, narrower `--bool`/`--int`/`--path` flags) consolidated value-coercion into a single consistent option.

## Common Workflow
Setting up a fresh machine:
```
git config --global user.name "Gilbert"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git config --global pull.rebase true
```
`pull.rebase true` makes `git pull` rebase your local commits on top of the remote's instead of creating a merge commit — a common preference for keeping history linear.

Using conditional includes to switch identity per-directory (e.g. work vs personal projects) by editing `~/.gitconfig` directly:
```
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work
[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal
```
Any repo under `~/work/` automatically picks up the `user.email` and other settings from `~/.gitconfig-work`, with zero per-repo configuration needed.

## Comparison
| | `git config` | Environment variable (`GIT_*`) | `-c key=value` per-command |
|---|---|---|---|
| Scope | Persistent, written to a config file | Current shell/session only | Single command invocation only |
| Precedence | Lowest of the three | Overrides config files | Highest — overrides everything |
| Typical use | Long-term identity/preferences/aliases | CI or scripted one-off overrides | Testing a setting without saving it anywhere |

## Common Pitfalls
- Setting user.name/email only locally in one repo and forgetting it doesn't apply elsewhere — commits show the wrong author in other repos
- Editing the config file directly and introducing a syntax error (unbalanced brackets, bad quoting) — every subsequent `git` command in that scope fails with a config parse error until it's fixed
- Confusing `--unset` (removes one matching line) with needing `--unset-all` when a key has multiple values (e.g. multiple `remote.origin.fetch` refspecs) — `--unset` errors out if there's more than one match
- Assuming `--global` settings apply retroactively to already-authored commit history — they don't; past commits keep whatever identity was active at the time they were made
- Forgetting that `--local` is the implicit default — running `git config user.email "x"` inside a repo silently sets it only for that repo, not globally, which surprises people expecting global scope
- Storing a plaintext credential helper (`credential.helper store`) on a shared machine — it writes tokens/passwords unencrypted to disk; prefer `credential.helper cache` (in-memory, time-limited) or an OS-native keychain-backed helper
- Assuming `git config --list` inside a repo shows only that repo's local settings — by default it shows the fully merged view across system, global, and local scopes, which is usually what you want but can mislead you about where a value actually lives without `--show-origin`
- Setting `core.autocrlf` inconsistently across a team's machines — Windows/macOS/Linux defaults differ, and a mismatch causes every file to show as fully modified (line-ending churn) in diffs between collaborators on different OSes
- Forgetting that some keys are booleans with specific accepted spellings (`true`/`false`, `yes`/`no`, `1`/`0`) — an unrecognized value silently fails validation for typed keys instead of being coerced
- Assuming `git config --global --edit` and manually editing `~/.gitconfig` in a text editor behave differently — they don't; `--edit` just opens the same file in whatever `core.editor` points to, with no extra validation beyond basic syntax checking on save

## Gotchas Deep-Dive
- **Per-invocation overrides**: `git -c user.name="Temp Name" commit` sets a config value for a single command only, without touching any file — useful in scripts that need to override identity or behavior without mutating shared config.
- **`includeIf` path matching is prefix-based**: `gitdir:~/work/` matches any repo *under* that directory, recursively, including nested clones — a repo accidentally placed outside the expected directory tree silently falls back to whatever config would otherwise apply, with no warning.
- **Aliases can shell out**: an alias value starting with `!` runs as a shell command instead of a Git subcommand, e.g. `git config --global alias.amend '!git commit --amend --no-edit'` — powerful, but means alias definitions from an untrusted shared `.gitconfig` should be reviewed before importing, since they can execute arbitrary code.
- **Multi-valued keys**: some keys (like `remote.origin.fetch` or `alias` entries with the same name across scopes) can legitimately have more than one value; `git config --get` only returns the last match by default, while `--get-all` returns every value across all applicable files.

## Common Interview Questions
**"Where would you look if a colleague's commits show the wrong email address?"** Check `git config --list --show-origin` in their repo — most likely a local `.git/config` override, or a global default that was never updated after a work/personal email switch.

**"How do you make Git use different SSH keys or emails for different projects automatically?"** `includeIf "gitdir:<path>"` blocks in `~/.gitconfig`, pointing at separate config files per directory tree — no manual per-repo setup required.

**"What's the precedence order when the same key is set at multiple scopes?"** Local overrides global, global overrides system, and (when enabled) worktree config overrides local — the most specific scope always wins.

**"How would you give a script a one-off Git identity without touching any config file?"** Either `git -c user.name="CI Bot" -c user.email="ci@example.com" commit ...` for a single command, or export `GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL` (and the `COMMITTER` equivalents) for the whole process.

**"A teammate says `git config --global core.editor "vim"` didn't work for them — what would you check?"** Whether they actually have a `~/.gitconfig` writable at that path (permissions, or `$HOME` resolving unexpectedly on their platform), and whether a `GIT_EDITOR` or `EDITOR` environment variable is set, since either overrides `core.editor`.

## FAQ
**Where can I see every effective config value and where it comes from?** `git config --list --show-origin`.

**How do I remove a global setting entirely?** `git config --global --unset <key>`, or edit `~/.gitconfig` directly and delete the line.

**Can config values be per-URL instead of per-repo?** Yes — `url.<base>.insteadOf` rewrites URLs matching a pattern, for example rewriting all `https://github.com/` clones to use SSH automatically, configured the same way as any other key.

**What's the difference between `git config` and environment variables like `GIT_AUTHOR_NAME`?** Environment variables take precedence over all config files and apply only to the current shell or process — useful for one-off overrides in scripts without touching any config file.

**Can a repo override my aliases?** No — aliases can only be set at any scope you choose (including `--local`), but a repo's committed files can't inject config into your setup on their own; config always requires an explicit `git config` invocation or manual edit somewhere Git already trusts.

**How do I check a single value without seeing the whole config dump?** `git config --get user.email` (or just `git config user.email`), which prints only that key's resolved value.

**Is there a config scope more specific than `--local`?** Yes, `--worktree`, when `extensions.worktreeConfig` is enabled — it lets each linked worktree of the same repository have its own override for a value like `core.sparseCheckout`, distinct from the main working tree.

**Does `git config` validate values, like ensuring `user.email` looks like an email?** No — Git stores whatever string you give it for most keys; it doesn't validate format. A typo'd email is accepted silently and only becomes visible in `git log` output afterward.

## Related Commands
- [[git init]]
- [[gitignore]]
- [[Git Hooks]]
