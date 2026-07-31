---
tags: [term, git, inspecting]
category: Inspecting & Comparing
---

# git blame

**Definition:** Shows who last modified each line of a file, and in which commit.

## Syntax
```
git blame [options] <file>
```

## Common Options
- `-L <start>,<end>` — limit output to a specific line range
- `-w` — ignore whitespace-only changes when attributing lines
- `-C` / `-C -C` — detect lines moved or copied from other files in the same commit (repeat for a wider search); slower but finds the real origin of copy-pasted code
- `-M` — detect lines moved within the same file
- `-e` — show the author's email instead of name
- `--since=<date>` — only consider commits after a given date
- `--ignore-rev <sha>` / `--ignore-revs-file <file>` — skip a specific commit (e.g. a mass reformat) when attributing lines, blaming through to the change before it

## Basic Example
```
git blame utils.js
```
Shows the commit, author, and date responsible for every line.

## Extended Example
```
git blame -L 40,60 -w -C utils.js
```
Checks only lines 40-60, ignoring whitespace-only edits and following code moved in from elsewhere in the same commit, so you find the actual logic change instead of a reformatting or copy-paste commit.

## Common Pitfalls
- Reading "blame" as an accusation — it's really "who last touched this and why," useful context for understanding unfamiliar code, not a callout
- A single mass reformat or `prettier`/`gofmt` commit "blaming" every line in the file to itself, hiding the real history — fix by adding that commit's hash to a `.git-blame-ignore-revs` file and setting `git config blame.ignoreRevsFile .git-blame-ignore-revs`
- Running plain `blame` on a renamed or moved file and getting no history before the rename — needs `-C`/`-M` (or `git log --follow`) to see through renames
- Blame can be slow on files with very long histories in large repos; scoping with `-L` avoids walking the whole file's history

## Related Commands
- [[git log]]
- [[git show]]
