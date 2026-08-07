---
tags: [term, git, tagging]
category: Tagging & Releases
---

# git tag

**Definition:** Marks a specific commit with a permanent, human-readable label, typically used for release versions.

## Syntax
```
git tag [-a | -s] [-m <message>] <name> [<commit>]
git tag -d <name>
git tag -l [<pattern>]
```

## Common Options
- `-a <name> -m "<message>"` — create an annotated tag (recommended for releases, stores author/date/message)
- `-s <name> -m "<message>"` — create a GPG-signed annotated tag
- `-d <name>` — delete a local tag
- `<name> <commit>` — tag a specific past commit instead of the current one
- `-l "<pattern>"` — list tags matching a glob pattern, e.g. `git tag -l "v1.2.*"`
- `-n<num>` — with `-l`, also print the first `<num>` lines of each tag's annotation message
- `-v <name>` — verify a tag's GPG signature
- `-f` — force-overwrite an existing tag name, moving it to a new commit

## Basic Example
```
git tag v1.0.0
```
Creates a lightweight tag on the current commit.

## Extended Example
```
git tag -a v1.2.0 -m "Add payment integration" a1b2c3d
```
Creates a proper annotated tag with a message, applied to a specific past commit rather than the current one.

A full release sequence:
```
git tag -a v2.0.0 -m "v2.0.0: new checkout flow, drop Node 16 support"
git push origin v2.0.0
git tag -v v2.0.0                     # confirm signature/metadata before publishing further
git tag -l "v1.*" -n1                 # review the previous major version's release notes
```

## Under the Hood
Tags live as refs under `refs/tags/<name>`, the same mechanism as branches under `refs/heads/<name>` — the difference is entirely in what the ref points to and whether anything moves it.

A **lightweight tag** is the simplest case: the ref points directly at a commit SHA, exactly like a branch pointer, except nothing ever advances it automatically. It's functionally a permanent bookmark.

An **annotated tag** adds an extra layer: `refs/tags/<name>` points at a genuine Git object of type `tag`, stored in the object database with its own SHA distinct from the commit's SHA. That tag object records the tagger's name/email, timestamp, message, and — for signed tags — a PGP signature, then itself points at the target commit. You can see the indirection directly:
```
git cat-file -t v2.0.0        # -> "tag" for annotated, "commit" for lightweight
git cat-file -p v2.0.0        # shows tagger/date/message, then "object <commit-sha>"
```
This is why `git describe` and release tooling generally expect annotated tags — lightweight tags carry no metadata for `describe` to report, and many changelog generators simply skip them.

Because an annotated tag's object is a first-class member of the object database, it's also subject to the same reachability rules as everything else: a tag ref keeps its target commit (and that commit's whole ancestry) reachable and safe from `git gc`'s pruning, which is one reason deleting old release tags on a long-lived repo can measurably shrink `.git/objects` if those commits aren't reachable from any branch either.

## Flags Reference
| Flag | Effect |
|---|---|
| `-a` | Create an annotated tag object (prompts for a message if `-m` omitted) |
| `-m <msg>` | Supply the annotation message inline, implies `-a` |
| `-s` | Create an annotated, GPG-signed tag |
| `-u <keyid>` | Sign with a specific GPG key instead of the default |
| `-f` | Force-move/overwrite a tag that already exists |
| `-d` | Delete a local tag |
| `-v` | Verify a tag's GPG signature and show its info |
| `-l [<pattern>]` | List tags, optionally filtered by glob pattern |
| `-n<num>` | Show `<num>` lines of annotation with `-l` |
| `--sort=<key>` | Sort listed tags, e.g. `--sort=-creatordate` or `--sort=v:refname` for version-aware order |
| `--contains <commit>` | List only tags that contain the given commit |
| `--merged <branch>` | List only tags reachable from the given branch |
| `--points-at <commit>` | List only tags that point exactly at the given commit |
| `-i`, `--ignore-case` | Case-insensitive matching with `-l <pattern>` |
| `--format=<fmt>` | Customize listing output using `git for-each-ref`-style placeholders like `%(refname)` or `%(taggerdate)` |

## Comparison
| | Lightweight tag | Annotated tag |
|---|---|---|
| Underlying object | none — ref points straight at the commit | dedicated `tag` object with its own SHA |
| Stores tagger/date/message | no | yes |
| Can be GPG-signed | no | yes (`-s`) |
| Shows up in `git describe` | no, by default | yes |
| Typical use | quick local bookmark | releases, anything shared or published |

## Real-World Example
A hotfix released against an already-shipped version, without touching `main`'s current state:
```
git tag -l "v2.*" --sort=-v:refname     # find the last shipped v2 release
git switch -d v2.4.0
git switch -c hotfix/v2.4.1 v2.4.0
# ...fix, commit...
git tag -a v2.4.1 -m "v2.4.1: patch auth token refresh race"
git push origin hotfix/v2.4.1
git push origin v2.4.1
```
The hotfix branch and tag both trace back to the old release commit, not to whatever `main` has accumulated since — exactly what you want when `main` already contains unrelated, unreleased work that shouldn't ship in the patch.

## Common Workflow
Cutting a release and cleaning up a mistake:
```
git tag -a v3.1.0 -m "v3.1.0"
git push origin v3.1.0
# realize the tag is on the wrong commit
git tag -d v3.1.0
git push origin :refs/tags/v3.1.0      # delete it remotely too
git tag -a v3.1.0 -m "v3.1.0" <correct-sha>
git push origin v3.1.0
```
Checking out a tag to build or inspect a past release puts you in detached `HEAD`, same as checking out any other non-branch commit — see [[git switch]] `-d` or [[git checkout]] for a clean way to do that.

## Common Pitfalls
- Forgetting tags don't push automatically — you need `git push --tags` (or `git push origin v1.2.0`) separately after creating one
- Moving/force-overwriting a tag that's already been pushed and pulled by others (`git tag -f`) — like rewriting shared history with rebase, anyone who already fetched the old tag now has a diverging idea of what that version means; treat published tags as immutable
- Using lightweight tags for releases, then being confused when `git describe` or changelog tooling doesn't pick them up — reach for `-a` (or `-s`) by default unless the tag is truly a disposable local marker
- Naming a tag the same as an existing branch — Git will accept it, but `git checkout <name>` and some other commands become ambiguous and may need `refs/tags/<name>` / `refs/heads/<name>` disambiguation
- Deleting a tag locally with `-d` and assuming that removes it from the remote too — it doesn't; the remote copy needs its own explicit delete push
- Assuming `git push` publishes tags along with commits — it never does automatically, use `--follow-tags`, `--tags`, or push the tag name explicitly
- Relying on `git describe` output without any annotated tags in the repo's history — it silently falls back to reporting nothing useful or errors, since lightweight tags are typically excluded from its search by default
- Deleting tags to "clean up" a repo without checking whether any automation (deploy scripts, `git describe`-based version stamping, `--points-at` lookups) depends on their continued existence

## History
Signed tags (`-s`) predate most of Git's other cryptographic verification features and were originally built for kernel development, where Linus Torvalds and other maintainers needed a way to cryptographically prove that a given release tarball genuinely corresponded to a specific, unaltered set of reviewed commits rather than something tampered with in transit. That same GPG infrastructure later extended to signed commits (`git commit -S`) and signed pushes, but tag signing came first and remains the most common of the three in open-source release workflows.

## Gotchas Deep-Dive
`git push` does **not** push tags by default, even ones on commits you're pushing — this is deliberate, since tags are treated as separate, deliberate publication events rather than incidental history. `git push --follow-tags` is a useful middle ground: it pushes only annotated tags that point at commits already being pushed, skipping lightweight tags and any tags on commits not otherwise going up, which avoids accidentally publishing a half-finished release marker.

`git describe` (which reports something like `v2.0.0-14-gabc1234` for "14 commits past the v2.0.0 tag, at abc1234") walks backward from `HEAD` through the commit graph looking for the nearest reachable tag — if two tags are equally close on different branches of history, or if only lightweight tags exist nearby, the output can be less deterministic or simply unavailable. This is one of the more concrete reasons release tooling insists on annotated tags specifically.

Deleting and recreating a tag with the same name but a different underlying commit is functionally a force-push of a ref — anyone who already has the old tag object cached locally (e.g. in a Docker layer, a downloaded source tarball, or their own clone) now silently disagrees with upstream about what that version string refers to. There's no warning mechanism for this beyond social convention; some organizations enforce tag immutability with a server-side pre-receive hook that rejects any `-f` tag push.

## FAQ
**Does the `v` prefix (`v1.0.0` vs `1.0.0`) matter to Git?** No, Git treats tag names as opaque strings. The `v` prefix is purely a convention borrowed from [[Semantic Versioning]] tooling and changelog generators that expect it.

**How do I check out a tag to poke around without creating a branch?** `git switch -d <tag>` or `git checkout <tag>` — both land you in detached `HEAD`, safe for building or inspecting, but commits made there need a branch (`git switch -c`) before you leave or they become unreachable.

**Can a tag and a branch share the same name?** Git allows it, but it's a footgun — many commands accept a plain name and resolve it via a search order (`refs/heads/` before `refs/tags/` in some contexts), so an ambiguous name can silently resolve to the wrong ref. Prefix with `refs/tags/<name>` or `refs/heads/<name>` to force the intended one.

**What's the difference between `git tag -d` and deleting the ref manually?** Nothing meaningful — `git tag -d <name>` is a thin wrapper that deletes `refs/tags/<name>`, equivalent to `git update-ref -d refs/tags/<name>`, it just also validates the tag exists first and prints a friendlier message.

**Can I sort tags by version number instead of alphabetically or by date?** Yes — `--sort=v:refname` understands version-number semantics (so `v2.9.0` sorts before `v2.10.0`, unlike plain alphabetical sort which would put them the other way around).

**How do I find which tag, if any, points at a specific commit?** `git tag --points-at <sha>`, or more generally `git describe --tags <sha>` if you want the nearest tag even when there's no exact match.

## Related Commands
- [[git push]]
- [[git log]]
- [[git branch]]
- [[git checkout]]
