---
tags: [term, git, snapshotting]
category: Basic Snapshotting
---

# git commit

**Definition:** Records the currently staged changes as a new snapshot (commit) in the repository's history.

## Syntax
```
git commit [options]
```

## Common Options
- `-m "<message>"` — provide the commit message inline
- `-a` — automatically stage all tracked, modified files before committing (skips `git add` for files already tracked)
- `--amend` — replace the previous commit instead of creating a new one
- `-v` / `--verbose` — show the diff of staged changes inside the commit message editor, for reference while writing
- `--no-verify` — skip `pre-commit` and `commit-msg` hooks
- `-S` / `--gpg-sign` — cryptographically sign the commit

## Basic Example
```
git commit -m "Add login form validation"
```
Commits the currently staged changes with that message.

## Extended Example
```
git add src/auth.js src/auth.test.js
git commit -m "Add token refresh logic" -m "Refreshes the access token 60s before expiry instead of waiting for a 401, avoiding a redundant round trip on every request."
```
Multiple `-m` flags each become a paragraph: the first is the commit's subject line, later ones become the body — equivalent to opening an editor and leaving a blank line between the summary and the details.

## Under the Hood
When you run `git commit`, Git performs three concrete steps:
1. Writes a **tree object** representing the current state of the staging area (the index) — a snapshot of every file's path and blob hash.
2. Writes a **commit object** that references that tree, references the previous commit as its parent (by SHA), and stores author, committer, timestamp, and message.
3. Moves the branch ref your `HEAD` points to (e.g. `refs/heads/main`) forward to the new commit's SHA.

The staging area — the index, stored at `.git/index` — is the actual input to a commit. `git commit` never looks directly at your working directory; it commits whatever is currently staged. This is why `git add` is a required separate step: it's building the tree that will become the next commit. `-a` doesn't skip that requirement, it just automates the `git add` call for files Git already tracks, updating the index in place immediately before building the tree.

Commit objects are content-addressed: the SHA is computed from the tree hash, parent hash(es), author/committer info, and message. Change any one of those — even just the message — and you get a completely different SHA. That's why amending, rebasing, and cherry-picking all produce new commit IDs even when the file contents end up identical.

## Flags Reference
| Flag | Effect |
|---|---|
| `-m <msg>` | Set commit message without opening an editor |
| `-a` | Stage all modified/deleted tracked files automatically |
| `--amend` | Rewrite the tip commit instead of adding a new one |
| `-v` | Include the diff in the editor buffer as reference |
| `--no-verify` | Skip `pre-commit` and `commit-msg` hooks |
| `--allow-empty` | Create a commit with no changes (CI triggers, markers) |
| `--fixup=<commit>` | Create a commit marked as a fixup for later `rebase -i --autosquash` |
| `--squash=<commit>` | Like `--fixup` but also copies the target commit's message for editing |
| `-S[<keyid>]` | Sign the commit with GPG |
| `--date=<date>` | Override the author date |
| `--author="Name <email>"` | Override the author identity for this commit only |
| `-n` | Alias for `--no-verify` |
| `--dry-run` | Show what would be committed without actually committing |
| `-e` | Force the editor to open even when `-m` is also given |
| `-C <commit>` | Reuse another commit's message and authorship as-is |

## Common Workflow
A typical feature-branch loop:
```
git status                     # see what changed
git add -p                     # stage changes hunk-by-hunk, reviewing each
git commit -v                  # commit with the diff visible for review
git log --oneline -5           # confirm it landed correctly
```
`git add -p` is worth knowing alongside `commit` — it lets you split a messy working-directory diff into several focused commits instead of one giant one, which keeps `git log` and `git blame` useful later.

Using fixups to keep a branch's history clean before opening a PR:
```
git commit --fixup=HEAD~2
git rebase -i --autosquash HEAD~5
```
The fixup commit gets automatically reordered and squashed into `HEAD~2` during the interactive rebase, so the final history reads as if the bug was fixed in the original commit, not three commits later.

Recovering after realizing the last few commits took the wrong approach entirely:
```
git log --oneline -5           # identify the last good commit
git reset --soft <good-sha>    # move HEAD back, keep all changes staged
git commit -m "Redo feature X with the simpler approach"
```
`--soft` rewinds the branch pointer without touching the working directory or index, so every change from the discarded commits is sitting staged and ready to be re-committed as one clean commit — useful when a string of exploratory commits should collapse into a single coherent one.

## Comparison
| | `git commit` | `git commit --amend` |
|---|---|---|
| Effect | Creates a new commit | Replaces the tip commit |
| Parent | Previous `HEAD` | Same parent as the original tip commit |
| History length | Grows by one | Stays the same |
| Safe on already-pushed commits | Yes | No — rewrites a commit others may have based work on |

## Common Pitfalls
- Using `-a` and assuming it also stages brand-new untracked files — it doesn't, only files Git already knows about
- Writing a vague message like "fix stuff" — commit messages are the primary way future-you (and `git blame`) understands *why* a change happened, not just what changed, since the diff already shows the what
- Committing generated files (build output, `node_modules`, `.env`) because they got staged by accident — add them to `.gitignore` before they're ever committed once, since removing them later still leaves them in history forever
- Running `git commit` with nothing staged — Git refuses with "nothing to commit, working tree clean" unless you pass `--allow-empty`, the correct way to intentionally create a marker commit
- Mixing unrelated changes into one commit — makes `git revert` and `git cherry-pick` unusable for isolating just one of those changes later, since both operate on whole commits
- Assuming `git commit` validates that tests pass or code compiles — it doesn't, by itself; that enforcement only exists if a `pre-commit` hook or CI pipeline is configured to check it
- Writing the subject line longer than ~50-72 characters — most Git tooling (`log --oneline`, GitHub's commit list, `git blame`) truncates long subject lines, so the important part should front-load the line
- Committing directly on a detached HEAD without realizing it — the commit exists, but no branch ref points at it, so it becomes unreachable and eligible for garbage collection the moment you check out something else, unless you make a branch there first
- Relying on `-S` to sign commits without ever verifying `git log --show-signature` actually reports "Good signature" — a misconfigured key silently produces unsigned or unverifiable commits with no error

## Gotchas Deep-Dive
- **Conventional commit tooling**: many teams enforce message formats like `feat: add token refresh` or `fix(auth): handle expired sessions` via a `commit-msg` hook (commitlint, husky). `git commit -m` bypasses no validation — the hook still runs — but `--no-verify` skips it entirely, which is why CI usually re-validates message format independently rather than trusting local hooks alone.
- **Empty commits as CI signals**: `git commit --allow-empty -m "Trigger deploy"` is a legitimate pattern for re-triggering a CI pipeline on tools that only build on new commits, without needing an actual code change.
- **Signed commits and verification**: `-S` signs with the key configured via `user.signingkey`; whether GitHub/GitLab show a "Verified" badge depends on that public key being registered with your account there too — signing locally without registering the key produces a signature nobody can verify.
- **Multi-line messages from the CLI**: `-m` used more than once creates separate paragraphs, but a single `-m` with embedded `\n` inside quotes works identically — the editor is only needed when you want to review/edit interactively, not as a hard requirement for multi-line messages.
- **`-C` vs `-c` for reusing messages**: `git commit -C <commit>` reuses another commit's message and authorship verbatim with no editor; lowercase `-c <commit>` reuses them too but opens the editor so you can adjust the text first — an easy pair to mix up under time pressure.
- **Commit templates**: `git config commit.template <file>` pre-fills the editor buffer with boilerplate (e.g. a checklist or required trailers like `Reviewed-by:`), separate from any hook — it's a convenience default, not an enforced requirement, since it can still be deleted or ignored by whoever's committing.

## History
- Early Git commit objects were addressed by SHA-1; since Git 2.29 the object format is pluggable, with SHA-256 repositories supported (though SHA-1 remains the overwhelming default for compatibility with existing hosting services).
- `--fixup` and `--squash` were added to make `rebase -i --autosquash` practical, letting small corrective commits be authored immediately and folded into history later without manually reordering a rebase todo list.
- Commit signing (`-S`) predates most hosting providers' "Verified" UI badges — the cryptographic feature existed in Git well before GitHub/GitLab surfaced it visually.

## Common Interview Questions
**"What actually gets committed — the working directory or the staging area?"** The staging area (the index). `git commit` never looks at the working directory directly; that's exactly why `git add` (or `-a` for tracked files) is a required prior step.

**"Two commits have identical file contents — can they have the same hash?"** Only if every other input to the hash also matches: parent commit, author, committer, timestamp, and message. In practice this essentially never happens, since timestamps differ to the second.

**"What's the fastest way to commit only part of a changed file?"** `git add -p` (or `git commit -p` directly) to interactively stage individual hunks, splitting one file's changes across multiple commits.

## FAQ
**Does `git commit` upload anything to a remote?** No — commits are entirely local until you run `git push`. You can commit hundreds of times fully offline.

**Can I edit a commit message after other commits have been made on top of it?** Not with `--amend` alone, since that only targets the tip. Use `git rebase -i <commit>~1`, mark it `reword`, and continue.

**What's the difference between author and committer?** The author is who originally wrote the change; the committer is who applied it to this repository. They differ after operations like `cherry-pick`, where you (the committer) apply someone else's (the author's) patch — `git log --format=fuller` shows both fields.

**Why does Git sometimes refuse to commit with "Please tell me who you are"?** `user.name` and `user.email` aren't set. Configure them once with [[git config]] `--global` and every future commit uses that identity automatically.

**Can a commit have more than one parent?** Yes — merge commits have two (or more, for octopus merges) parents. A plain `git commit` always creates a commit with exactly one parent (the previous `HEAD`), except for the very first commit in a repo, which has none.

**Does `git commit` run any checks automatically?** Yes, if hooks are installed: `pre-commit` runs before the editor opens (can abort the commit), and `commit-msg` runs after you've written a message (can reject or rewrite it). Neither exists by default in a fresh repo.

**What happens if I close the editor without saving a message?** Git aborts the commit entirely — an empty message (or one where every line is a comment) is treated as "I changed my mind," and nothing is recorded.

**Does the order of `git add` calls affect the resulting commit?** No — the index is a flat map of path to blob hash at commit time; it doesn't matter whether a file was staged first or last, the resulting tree object is identical either way.

## Related Commands
- [[git add]]
- [[git commit --amend]]
- [[git log]]
- [[git status]]
- [[git rebase -i (Interactive Rebase)]]
