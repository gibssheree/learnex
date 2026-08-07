---
tags: [term, git, setup]
category: Setup & Configuration
---

# git init

**Definition:** Creates a new, empty Git repository in the current directory (or a specified path).

## Syntax
```
git init [<directory>]
```

## Common Options
- `--bare` — creates a repo with no working directory, used for shared/remote repos
- `-b <name>` / `--initial-branch=<name>` — sets the name of the initial branch (e.g. `main` instead of `master`)
- `--template=<dir>` — copies files from a custom template directory into the new `.git` instead of Git's built-in defaults (useful for pre-populating shared hooks)
- `--separate-git-dir=<dir>` — stores the actual `.git` contents somewhere other than `<project>/.git`, leaving only a pointer file behind in the working directory
- `-q` / `--quiet` — suppresses the "Initialized empty Git repository..." confirmation message

## Basic Example
```
git init
```
Turns the current folder into a Git repo, creates a hidden `.git` folder. Nothing in the working directory is touched or tracked automatically — every existing file remains untracked until you explicitly `git add` it.

## Extended Example
```
git init -b main my-project
cd my-project
git config user.name "Ada Lovelace"
git config user.email "ada@example.com"
echo "node_modules/" > .gitignore
git add .gitignore
git commit -m "Initial commit"
```
Creates a new folder `my-project`, initializes it as a repo, and names the default branch `main` from the start. Setting `user.name`/`user.email` locally (rather than relying on any global default) is common in scripts and CI to guarantee a deterministic author identity, and adding a `.gitignore` before the first real commit avoids ever tracking build artifacts in the first place.

## Under the Hood
`git init` doesn't contact a network, doesn't need existing history, and doesn't fail if files are already present — it simply creates the skeleton directory structure Git needs to function, entirely from built-in templates:
```
.git/
├── HEAD              # symbolic ref, initially "ref: refs/heads/main"
├── config             # repo-local config (core.bare, core.repositoryformatversion, etc.)
├── description         # used only by gitweb, safe to ignore
├── hooks/              # *.sample files for every hook type, all inert until enabled
├── info/
│   └── exclude          # local-only ignore rules, like a private .gitignore
├── objects/             # empty — no commits yet means no objects yet
│   ├── info/
│   └── pack/
└── refs/
    ├── heads/            # empty until the first commit creates a branch ref
    └── tags/
```
Notably, `refs/heads/main` doesn't actually exist as a file yet right after `init` — `HEAD` points at it symbolically, but the ref itself is only created once the first commit gives it something to point to. This is why a freshly initialized repo shows "No commits yet" in `git status` and why `git branch` lists nothing: there is no branch, only a promise of one once you commit.

The `objects/` directory starts completely empty because there's nothing to store yet — no blobs (file contents), no trees (directory snapshots), no commit objects. The very first `git add` is what creates the first blob and tree objects, and the first `git commit` is what creates the first commit object and, as a side effect, finally materializes `refs/heads/<branch-name>` pointing at it.

## Flags Reference
| Flag | Effect |
|---|---|
| `--bare` | No working directory, no `HEAD` checkout; used for repos meant purely as push/pull targets |
| `-b <name>`, `--initial-branch=<name>` | Names the first branch instead of relying on `init.defaultBranch` or the legacy `master` fallback |
| `--template=<dir>` | Uses a custom template directory (default `/usr/share/git-core/templates` or similar) instead of Git's built-in one — lets an organization ship default hooks/config to every new repo |
| `--separate-git-dir=<dir>` | Physically relocates `.git`'s contents, leaving a `gitdir: <path>` pointer file in its place — same mechanism submodules use internally |
| `--shared[=<permissions>]` | Sets up permissions so multiple users on the same machine can push to a shared repo (relevant mainly for `--bare` repos on a shared server) |
| `-q`, `--quiet` | Suppresses the confirmation message, useful in scripted setup |
| `--object-format=<sha1\|sha256>` | Chooses the hash algorithm for the object database at creation time — cannot be changed later without a full history rewrite, so this is a one-time, repo-wide decision |

## Common Workflow
A typical from-scratch project setup, including connecting to a freshly created empty remote:
```
mkdir my-project && cd my-project
git init -b main
git remote add origin git@github.com:user/my-project.git
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main
```
`git init` here happens before there's any remote relationship at all — `git remote add` is what wires the local repo to a specific server URL, and `-u` on the first push sets up the upstream tracking relationship so subsequent `git push`/`git pull` don't need arguments. This is the mirror image of `git clone`, which does all of these steps (init, remote add, first fetch, checkout) as one atomic operation against an *existing* remote.

Note the ordering matters on some hosting platforms: creating the remote repository through a web UI with an auto-generated README first, then trying to `git push -u origin main` from a freshly `git init`'d local repo, often fails with a "fetch first" rejection because the two histories have unrelated roots. The clean fix is `git pull --allow-unrelated-histories origin main` before pushing, or simply creating the remote repository empty (no README, no `.gitignore`) so the very first push has nothing to conflict with.

Setting up a bare repo as a lightweight private remote (common for a local backup or a small team without a hosting platform) looks different:
```
git init --bare /srv/git/project.git
git remote add origin /srv/git/project.git
git push -u origin main
```
A `--bare` repo has no working directory to check out — it exists purely to receive pushes and serve fetches/clones, which is exactly what every repo on GitHub/GitLab/Bitbucket is under the hood.

## Comparison
| Command | Starting point | Result |
|---|---|---|
| `git init` | Nothing, or an existing non-Git folder | New, empty repo with no commits and no remote |
| `git clone <url>` | An existing remote repo | Full copy of history, working directory checked out, `origin` remote pre-configured |
| `git init --bare` | Nothing | Repo with no working directory — a push/pull target only, never `cd`'d into for editing |

`git init` followed by manually adding a remote is functionally equivalent to `git clone` only if the remote already has history to fetch; for a genuinely brand-new project, `init` is the only correct starting point since there's nothing yet to clone.

## History
`git init` has kept an almost identical interface since Git's original 2005 release — it was, and remains, deliberately minimal compared to equivalent commands in other version control systems of that era, some of which required a central server to even create a new repository. The `-b`/`--initial-branch` flag and the `init.defaultBranch` config are comparatively recent additions (Git 2.28, 2020), introduced specifically to let users and organizations move away from the historical `master` default without needing to rename the branch manually after every `init`.

## Related Commands

## Common Pitfalls
- Running `git init` inside an existing repo's subfolder by accident, creating a confusing nested repo — Git doesn't warn about this by default, and the nested `.git` silently shadows the parent repo's tracking for everything under that subfolder
- Forgetting to set the initial branch name, ending up with the legacy `master` default on older Git versions, or an unexpected name if `init.defaultBranch` was configured differently than expected by a teammate
- Running `git init` on a directory that already has a `.git` folder — it's a safe no-op (Git reinitializes without destroying existing history or config), but it can mask the fact that the directory was already a repo when a fresh one was actually intended
- Assuming `git init` sets up a remote — it doesn't; a brand-new repo has zero remotes until `git remote add` is run explicitly
- Using `--bare` for a repo you intend to actually edit files in — a bare repo has no working directory at all, so commands like `git status` or editing files simply don't apply to it directly
- Confusing `git init` with `git clone` for the "I want to start contributing to an existing project" case — `init` gives you empty history; for an existing remote project you almost always want `clone`, which fetches history and sets up the remote in one step
- Running `git init` and expecting a `.gitignore`, `README`, or license file to be created automatically — Git's `init` creates only the internal `.git` bookkeeping structure, nothing in the working directory itself; those files are a convention added separately, or provided by a hosting platform's "create repository" wizard rather than by `git init` itself

## FAQ
**Does `git init` require an internet connection?** No — it's entirely local, no network activity of any kind.

**What happens if I run `git init` twice in the same directory?** Git detects the existing `.git` directory and reinitializes it in place (refreshing hooks samples, template files) without touching existing commits, branches, or config — it prints "Reinitialized existing Git repository" instead of "Initialized empty Git repository."

**Is there a difference between `git init` and `git init .`?** No — both target the current directory; the explicit `.` is just more verbose about it. `git init <path>` targeting a different, possibly nonexistent directory is the only case where the argument matters, and Git creates that directory if it doesn't exist.

**Why would I ever use `--bare`?** Any time the repo's sole purpose is to be a push/pull target rather than somewhere you edit files directly — a self-hosted remote, a deployment target that a `post-receive` hook checks out elsewhere, or the target of `git clone --bare` used to mirror a repo.

**Can I turn an existing folder full of files into a Git repo without losing anything?** Yes — that's exactly what `git init` is for on a non-empty directory. It creates `.git` alongside the existing files without modifying or deleting any of them; everything just starts out untracked until you `git add` it.

**Does `git init` create a remote-hosted repository on GitHub/GitLab automatically?** No — `git init` is entirely local. Creating the remote-side repository is a separate step, either through the platform's web UI/API or a CLI tool like `gh repo create`, followed by `git remote add` to connect the two.

## Gotchas Deep-Dive
- On case-insensitive filesystems (default on Windows and macOS), `git init` still creates a case-sensitive object database internally — this rarely causes visible issues at init time, but it's the root cause of later surprises when a repo created on Windows behaves subtly differently once cloned on Linux CI with genuinely case-sensitive paths
- `init.defaultBranch` is a config value, not a Git built-in default per se — Git's compiled-in fallback is still `master` unless `init.defaultBranch` is set (globally, e.g. `git config --global init.defaultBranch main`) or `-b` is passed explicitly on each `init`. Relying on defaults across a team without setting this consistently leads to a mix of `main` and `master` repos
- `--separate-git-dir` is more than a cosmetic relocation — it's the same mechanism Git uses internally for [[git worktree]] and for submodules, where the working directory contains only a `.git` *file* (a single line pointing elsewhere) instead of a `.git` *directory*
- A `template` directory (used by `--template`, or the default template Git ships with) is copied wholesale into `.git/` at init time — this means custom default hooks, a custom `description` file, or a custom `info/exclude` can be organization-wide policy baked into every new repo, not just something configured after the fact

## Initial State Details
Immediately after `git init`, a few things are worth knowing precisely:
- `git status` reports "On branch main" (or whatever `-b` specified) plus "No commits yet" — the branch name exists conceptually via `HEAD`, but no actual ref file exists in `refs/heads/` until the first commit
- `git log` fails with an error (`fatal: your current branch 'main' does not have any commits yet`) rather than showing empty output, since there's no commit to start walking history from
- `git branch` lists nothing at all — again, because a branch ref only comes into existence at the first commit
- The repo's `core.bare` config is `false` by default (or `true` if `--bare` was passed), and this single setting is what most working-directory-aware commands check before deciding whether they're allowed to run
- `core.repositoryformatversion` in the freshly written `config` file records which on-disk repository format Git used — this is what lets later Git versions detect and safely refuse (or migrate) repositories created with incompatible extensions, without needing any separate versioning file

## Related Commands
- [[git clone]]
- [[git config]]
- [[git remote]]
- [[git branch]]
- [[Git Hooks]]
- [[git worktree]]
- [[git submodule]]
- [[gitignore]]
