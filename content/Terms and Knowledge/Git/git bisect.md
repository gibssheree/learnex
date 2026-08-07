---
tags: [term, git, advanced, debugging]
category: Advanced & Internals
---

# git bisect

**Definition:** Uses binary search across your commit history to automatically find the exact commit that introduced a bug.

## Syntax
```
git bisect start
git bisect bad [<commit>]
git bisect good <commit>
git bisect run <script>
git bisect reset
```

## Common Options
- `start [<bad> [<good>...]]` — begin a bisect session; optionally pass the bad and good commits directly instead of marking them in separate steps
- `bad` / `good` — mark the current (or a given) commit as broken or working; Git jumps to the midpoint each time
- `skip` — mark the current commit as untestable (doesn't build, unrelated breakage) without calling it good or bad; Git picks a different midpoint
- `run <script>` — automate the whole process with a script that exits `0` for good, a non-zero non-125 code for bad, and `125` to skip
- `log` / `replay <file>` — save or replay a bisect session, useful for handing the search off to a teammate
- `reset` — end the session, clear the bisect state, and return to the branch you started on
- `visualize` — open the current candidate range in `gitk` (or `git log` if `gitk` isn't installed) to eyeball what's left
- `terms` — print the current good/bad terminology in use for the active session

## Basic Example
```
git bisect start
git bisect bad
git bisect good v1.0
```
Git checks out the midpoint commit between the known-bad current state and the known-good `v1.0` tag, for you to test next; repeat `git bisect good`/`bad` on each checkout until Git names the first bad commit.

## Extended Example
```
git bisect start HEAD v1.0
git bisect run npm test
git bisect reset
```
Fully automates the search — Git checks out each candidate commit, runs `npm test`, reads its exit code to decide good/bad/skip, and narrows down to the exact breaking commit without any manual testing; `reset` afterward restores the original branch and working tree.

## Under the Hood
`git bisect` doesn't do anything magical to the object database — it's a pure search algorithm layered on top of ordinary checkouts. Once you give it a bad commit and a good commit, it computes the set of commits in between (`good..bad` in `git log` terms), picks the one closest to the midpoint of that set by commit-graph distance (not by date), and checks it out in detached HEAD, exactly like `git checkout <sha>` would. Each `good`/`bad`/`skip` you record is written to `.git/BISECT_LOG` and a handful of refs under `.git/refs/bisect/*`, which is why a session survives you closing the terminal — `git bisect log` can replay it, and `git bisect replay <file>` can hand it to someone else.

Because the checkout is a normal detached-HEAD checkout, `bisect` composes with anything else that inspects a working tree: build systems, test runners, even manual eyeballing. `git bisect run` just wraps the good/bad marking in a loop, feeding your script's exit code back in — that's the entire "automation," there's no separate execution engine.

## Flags Reference
| Flag / Subcommand | Effect |
|---|---|
| `start` | Begin a session; can take `[<bad>] [<good>...]` inline |
| `bad [<commit>]` | Mark current (or given) commit broken |
| `good <commit>` | Mark current (or given) commit working |
| `skip [<commit>...]` | Mark commit untestable; Git tries a nearby alternative |
| `run <cmd>` | Auto-drive the search with a script's exit code |
| `visualize` / `view` | Open the current bisect range in `gitk`/`log` |
| `log` | Print the session's history in replayable form |
| `replay <file>` | Re-run a session saved via `log > file` |
| `terms` | Show the current terms (`bad`/`good` by default) |
| `terms --term-new=<t> --term-old=<t>` | Use custom terms, e.g. `broken`/`fixed`, for non-regression bisects |
| `reset [<commit>]` | End session, return to original (or given) branch |

## Common Workflow
Tracking down a regression that shipped somewhere in the last 40 commits, without a known-good tag handy:
```
git bisect start
git bisect bad HEAD                  # current tip is broken
git bisect good HEAD~40              # 40 commits back was fine
git bisect run ./scripts/check.sh    # exits 0/1/125 per commit
# Git prints: "<sha> is the first bad commit"
git show <sha>                       # inspect the exact change
git bisect reset                     # back to your original branch
```
`check.sh` typically builds the project and runs a single targeted test — keep it fast, since bisect on 40 commits only needs about `log2(40) ≈ 6` checkouts, but each one pays the cost of your script.

## Comparison
| | `git bisect` | `git log -S<string>` | Manual `git checkout` loop |
|---|---|---|---|
| Finds | The commit that broke behavior | The commit that added/removed a specific string | Whatever you happen to spot by eye |
| Needs | A reproducible test (manual or scripted) | Just the string to search for | Nothing, but no structure either |
| Search type | Binary search over commit graph | Linear scan of diffs | Ad hoc, usually linear |
| Steps for `n` commits | ~`log2(n)` | Full history scan | Up to `n` |
| Best for | "This used to work, now it doesn't, don't know why" | "I know roughly what code changed, find when" | Small ranges not worth automating |

## History
- `git bisect` has existed since Git's early days, modeled directly on the "binary search for a regression" technique developers already did manually with `checkout` and testing — Git just automated the bookkeeping.
- `git bisect run` (full automation via a script's exit code) was added to remove the manual "checkout, test, mark good/bad, repeat" loop entirely, turning a multi-minute investigation into a single unattended command for anything with a scriptable test.
- `--term-old`/`--term-new` (custom terminology) came later, generalizing bisect beyond "good/bad" bug-hunting to any binary-searchable question over commit history, such as "when did this API contract change" or "when did performance regress past a threshold."
- Modern Git also supports `git bisect start --first-parent`, restricting the search to first-parent history on branches with heavy merge traffic, so the search only considers merge commits rather than every commit within merged-in branches.

## Real-World Example
Finding when a specific test started flaking, using a scripted check rather than manual judgment:
```
git bisect start
git bisect bad HEAD
git bisect good v2.3.0
cat > /tmp/check.sh <<'EOF'
#!/bin/sh
npm run build || exit 125     # build failure: untestable, skip
npm test -- --grep "checkout flow" || exit 1
exit 0
EOF
chmod +x /tmp/check.sh
git bisect run /tmp/check.sh
git bisect log > bisect-findings.txt   # save the session for the PR description
git bisect reset
```
Returning `125` on build failure instead of `1` is the detail that keeps this reliable — without it, a commit that simply doesn't compile (unrelated to the actual regression) would be misread as proof the bug exists there.

## Gotchas Deep-Dive
- **Non-deterministic bugs.** Timing-dependent or environment-dependent bugs can pass or fail differently across otherwise-identical runs, which breaks the core assumption bisect relies on: that a commit's good/bad status is a fixed property of that commit. Run the check multiple times per step for flaky bugs, or bisect with a tighter, more deterministic reproduction first.
- **Bisecting on a branch that later got rebased.** If history was rewritten between when the bug was introduced and now, commit SHAs you remember as "good" may no longer exist on the current branch — check `git log --all` or the reflog for the pre-rebase commits if `good`/`bad` refuse to resolve.
- **Submodule state.** If a bug depends on a submodule's checked-out commit and the submodule pointer changes across the bisected range, plain `git bisect run` won't update the submodule automatically unless your script calls `git submodule update` itself.
- **Wide search ranges with expensive builds.** For a monorepo with a slow build, narrowing the initial `good`/`bad` range as much as possible before starting pays off directly — bisect's `log2(n)` step count still means real wall-clock time per step.
- **Skipping too many consecutive commits.** If every commit near the true midpoint gets `skip`ped (all broken builds in a bad patch of history), bisect can run out of testable candidates and report a range instead of a single commit — worth manually testing one of the skipped commits directly in that case.
- **Assuming `good` always means "older" and `bad` always means "newer."** Bisect doesn't care about chronological order, only ancestry — a `good` commit must be an ancestor of the `bad` commit for the search to make sense, which is usually but not always the same thing as "older."

## FAQ
**Does bisect work with more than one bad range?** Not directly — it assumes a single contiguous range where "good" commits precede "bad" ones on the graph. For multiple independent regressions, run separate sessions.

**Can I bisect merge commits?** Yes, `bisect` walks the full commit graph including merges; it has no special problem with them since it only checks out and tests, it doesn't need to understand parentage the way [[git cherry-pick]] does.

**What if my good/bad terms are confusing for non-bug bisects, like finding when a feature was added?** Use `git bisect start --term-new=fixed --term-old=unfixed` (or any custom pair) so the language matches what you're actually searching for.

**Does bisect require a linear branch with no merges?** No — it walks the full commit graph, merges included, though `--first-parent` is available if you specifically want to restrict the search to mainline history only.

**Can I pause a bisect session and come back later?** Yes — the state lives in `.git/BISECT_*` files and survives across sessions; just run `git bisect log` to see where you left off, or simply continue marking `good`/`bad` on the currently checked-out commit.

**Can I hand a bisect session to a teammate?** Yes — `git bisect log > session.txt` captures every good/bad mark in replayable form; they run `git bisect replay session.txt` to resume exactly where you left off, including the same candidate commit.

**What does bisect do if it lands on a merge commit that's hard to test in isolation?** You can `git bisect skip` it, and Git picks a nearby non-merge commit instead, at the cost of a slightly less precise final answer if the regression is genuinely tied to the merge itself.

## Common Interview Questions
- Why is bisect faster than manually checking commits one by one? — binary search over `n` commits takes about `log2(n)` steps instead of `n`, so 1,000 commits narrow down in roughly 10 checkouts.
- What does `git bisect skip` do differently from `good` or `bad`? — it excludes a commit from consideration without asserting its status, letting Git route around untestable commits instead of forcing a wrong answer.
- How would you fully automate a bisect in CI? — `git bisect start <bad> <good>` followed by `git bisect run <script>`, where the script's exit code (0/1/125) drives the search unattended.
- What's stored on disk during an active bisect session? — `.git/BISECT_LOG`, `.git/BISECT_START`, and refs under `.git/refs/bisect/*` tracking every good/bad mark so the session can resume after an interruption.
- Why might two runs of the same bisect session land on different commits? — a flaky test or environment-dependent bug can produce a different good/bad answer at the same commit on different runs, steering the search differently each time.
- Does bisect modify commit history? — no, it only moves `HEAD` between existing commits via checkout; nothing is created, rewritten, or deleted by the search itself.
- Can bisect be used for something other than bugs, like a performance regression? — yes, as long as the check is scriptable into a good/bad (or custom-termed) result, bisect doesn't care what the underlying question is.
- What's the practical difference between binary search complexity and a real bisect session's wall-clock time? — the step count drops to `log2(n)`, but each step still pays the cost of a checkout plus whatever the test/build takes, so a slow build can dominate total time even with few steps.

## Related Commands
- [[git log]] — inspect commits bisect narrows down to before/after the search
- [[git reflog]] — recover your original branch position if `reset` is skipped or interrupted
- [[git checkout]] — the underlying mechanism bisect uses to move between candidate commits
- [[git cherry-pick]] — useful once bisect identifies a fix that needs porting elsewhere
- [[git tag]] — mark known-good releases in advance so future bisects have a ready-made starting point
- [[git tag]] — mark known-good releases in advance so future bisects have a ready-made starting point
