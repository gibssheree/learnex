---
tags: [term, git, undoing]
category: Undoing & Rewriting History
---

# git rebase -i (Interactive Rebase)

**Definition:** Opens an editable to-do list of a range of past commits, letting you reorder, reword, squash, split, or drop them before that history is shared — the main tool for turning messy local commits into a coherent story.

## Syntax
```
git rebase -i <commit>
git rebase -i --root
```
(`<commit>` is usually `HEAD~n` or a branch name; `--root` rebases all the way back to the very first commit)

## Common Options (actions inside the interactive editor)
- `pick` / `p` — keep the commit as-is
- `reword` / `r` — keep the commit's changes but stop to edit its message
- `edit` / `e` — stop at this commit so you can amend its contents, then run `git rebase --continue`
- `squash` / `s` — merge this commit into the previous one, combining both commit messages for editing
- `fixup` / `f` — like squash, but silently discard this commit's message
- `drop` / `d` — remove the commit entirely (or just delete its line from the list)
- `exec` / `x <cmd>` — run a shell command after that commit is applied, e.g. to run tests at each step

## Basic Example
```
git rebase -i HEAD~3
```
Opens an editor listing your last 3 commits, oldest first, so you can reorder, squash, or reword them before continuing.

## Extended Example
```
git rebase -i HEAD~4
```
```
pick a1b2c3d Add login form
fixup 4d5e6f7 wip
fixup 7a8b9c0 wip again
reword d1e2f3a Add password reset flow
```
Marking two "wip" commits as `fixup` collapses them silently into the first commit, and `reword` pauses the rebase to let you rewrite the fourth commit's message — the result is two clean, well-described commits instead of four, exactly what you want before opening a pull request.

## Under the Hood
Running `git rebase -i <commit>` generates a plain text file at `.git/rebase-merge/git-rebase-todo` — one line per commit in the range, oldest first, each starting with an action word and a short hash. That file is opened in `$GIT_SEQUENCE_EDITOR` (falling back to `$EDITOR`, then `$VISUAL`, then a platform default). Whatever you save is exactly what gets executed, line by line, top to bottom — it's a literal script the "sequencer" works through, not a preview.

As each line runs, the sequencer applies that commit's diff, and:
- `pick` commits as-is with a new hash (same replay mechanism as a non-interactive rebase — see [[git rebase]]).
- `reword` applies the commit, then immediately opens the commit-message editor before moving on.
- `edit` applies the commit and then **stops the whole rebase**, dropping you back at the shell with that commit checked out and staged — you can amend content, split it into multiple commits, run tests, whatever's needed, then `git rebase --continue` to resume the sequence.
- `squash`/`fixup` combine the current commit's diff into the previous one and open (squash) or suppress (fixup) a combined commit-message editor once the whole run of consecutive squash/fixup lines for that group finishes.
- `exec` runs an arbitrary shell command after that point in history is applied; a non-zero exit status pauses the rebase just like a conflict would, letting you fix things before `--continue`.

State for an in-progress interactive rebase lives entirely under `.git/rebase-merge/` (or `.git/rebase-apply/` for the older non-merge-based backend) — `git rebase --abort` simply deletes that directory and resets the branch back to `ORIG_HEAD`; killing the terminal instead leaves it there, which is why the repo appears "stuck mid-rebase" until you either `--continue`, `--skip`, or `--abort` properly.

## Flags Reference

| Flag | Effect |
|---|---|
| `-i`, `--interactive` | Open the todo list for manual editing |
| `--autosquash` | Automatically reorder and mark commits whose message starts with `squash!`/`fixup!`/`amend!ing;` next to their target commit |
| `--autostash` | Stash uncommitted changes before starting, reapply after finishing |
| `-x`, `--exec <cmd>` | Insert an `exec <cmd>` line after every commit automatically (e.g. to run a test suite at each step) |
| `--keep-empty` | Keep commits that become empty after replay instead of dropping them |
| `--rebase-merges` | Preserve merge commits within the range as part of the todo list instead of flattening them |
| `--committer-date-is-author-date` | Preserve original authored timestamps on rewritten commits |
| `-S[<keyid>]`, `--gpg-sign` | Re-sign each rewritten commit |

## Common Workflow
The `--autosquash` pattern turns cleanup into a two-command habit instead of manual reordering. While working on a feature, fix an earlier commit by creating a `fixup!` commit that targets it directly:
```
git commit --fixup=a1b2c3d
# ...more work, more fixup commits as needed...
git rebase -i --autosquash HEAD~6
```
Git pre-sorts the todo list so each `fixup!`/`squash!` commit is already placed directly under its target with the right action — the editor opens already arranged, often needing nothing but a save-and-close. Set `rebase.autosquash = true` in config to make plain `git rebase -i` behave this way without the flag every time.

## Comparison

| | `git rebase -i` | `git rebase` (non-interactive) |
|---|---|---|
| Purpose | Rewrite/curate commit content and order | Move a branch onto a new base |
| Todo list | Shown for editing before running | Generated and run automatically (all `pick`) |
| Can reorder/squash/drop individual commits | Yes | No |
| Can change a commit's base | Yes, via `--onto` (also available non-interactively) | Yes, via `--onto` |
| Typical use | Cleaning up local commits before a PR | Catching a branch up with `main` |

They share the same underlying sequencer — `-i` just puts a human editing step between "generate the todo list" and "execute it."

## Splitting a Commit
The todo list has no dedicated `split` action, but the `edit` action combined with `git reset` accomplishes it:
```
git rebase -i HEAD~3
# mark the commit to split as "edit", save and close
git reset HEAD^                    # uncommit it, keep changes staged... actually unstaged
git add <file-a>
git commit -m "First half of the change"
git add <file-b>
git commit -m "Second half of the change"
git rebase --continue
```
`git reset HEAD^` (soft-ish here, more precisely a mixed reset against the commit's own parent) undoes the single commit `edit` stopped on, leaving its changes in the working tree unstaged. From there it's just normal staging and committing into as many pieces as needed before resuming with `--continue`, which then replays every remaining commit after this point in the original list.

## Real-World Example
Cleaning up a feature branch before opening a pull request, combining several of the available actions in one pass:
```
git log --oneline main..HEAD
# a1b2c3d Fix typo in login.js
# 4d5e6f7 Add password reset flow
# 7a8b9c0 wip: debugging
# d1e2f3a wip: still debugging
# e5f6a7b Add login form

git rebase -i main
```
```
pick e5f6a7b Add login form
pick 4d5e6f7 Add password reset flow
pick a1b2c3d Fix typo in login.js
fixup 7a8b9c0 wip: debugging
fixup d1e2f3a wip: still debugging
```
Reordering `a1b2c3d` earlier and marking the two "wip: debugging" commits `fixup` (folded silently into whichever `pick`/`fixup` chain precedes them once reordered next to their real target) collapses five noisy commits into three well-scoped ones before the branch is ever seen by a reviewer. This is precisely the kind of history cleanup that would be impossible with a non-interactive `git rebase`, since that only replays commits in their existing order with no editing.

## Under the Hood: exec and Continuous Verification
`--exec <cmd>` (or `-x <cmd>`) is worth calling out separately because it turns interactive rebase into a lightweight bisection/verification tool, not just a history editor:
```
git rebase -i --exec "npm test" HEAD~5
```
This inserts an `exec npm test` line after every `pick` in the generated todo list, so the test suite runs after each commit is individually replayed. If a commit breaks the build, the rebase pauses right there with that specific commit checked out — pinpointing exactly which commit introduced the regression, something a single test run at the end of a whole rebase can't do.

## Common Pitfalls
- Doing this on commits already pushed to a shared branch — same rule as regular rebase, it rewrites commit hashes and breaks history for anyone who already pulled the old commits, forcing them into a manual recovery
- Reordering commits that depend on each other — moving a commit above the one that introduced the file it edits produces a conflict or a broken intermediate state
- Aborting halfway through with Ctrl-C instead of `git rebase --abort` — leaves the repo in a half-rebased, detached state; always use `--abort` to cleanly bail out
- Losing track of dropped commits — they aren't gone forever, they're recoverable via [[git reflog]] until it expires, but only if you notice quickly
- Confusing `squash` and `fixup` — `squash` stops to let you edit a combined commit message from both commits; `fixup` silently discards the fixup commit's message entirely, keeping only the target's. Picking the wrong one either leaves an unwanted extra message prompt or silently drops a message you actually wanted to keep
- Deleting a todo-list line instead of marking it `drop` — functionally identical (both remove the commit), but deleting the line by accident during editing is an easy way to lose a commit you meant to keep; double-check the final list before saving
- Forgetting `edit` stops the rebase entirely — after marking a commit `edit` and saving, the rebase pauses there immediately; nothing further in the list runs until `git rebase --continue` is issued

## FAQ
**Can you change the diff of a commit without renaming it `edit`?** Not directly through the todo list — `edit` is the only action that pauses the rebase for content changes. `reword` only opens the message editor, it never stops for `git add`/amend of file content.

**What happens if two `fixup!`/`squash!` commits target the same commit?** With `--autosquash`, both get sorted directly beneath their shared target and folded in the order they appear in the todo list — the sequencer processes them as a consecutive run of squash/fixup lines against the same `pick`.

**Does interactive rebase work across merge commits by default?** No — by default, merge commits within the range are dropped from the todo list entirely and their branches flattened into the linear replay order. `--rebase-merges` includes them as `merge` lines in the todo list, allowing the branching structure to be edited and preserved instead.

**Is there a limit to how many commits `git rebase -i` can handle at once?** No hard limit, but very large ranges make the todo list unwieldy to review by hand and increase the chance of a conflict appearing many steps in, requiring a long resolve-and-continue chain. `--onto` combined with a narrower range is often more practical for big restructurings.

## Related Commands
- [[git rebase]]
- [[git commit --amend]]
- [[git reflog]]
- [[git cherry-pick]]
- [[git reset]]
- [[git merge]]
- [[git log]]
