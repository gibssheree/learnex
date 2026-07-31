---
tags: [term, git, tagging]
category: Tagging & Releases
---

# git tag

**Definition:** Marks a specific commit with a permanent, human-readable label, typically used for release versions.

## Syntax
```
git tag [<name>]
```

## Common Options
- `-a <name> -m "<message>"` — create an annotated tag (recommended for releases, stores author/date/message)
- `-d <name>` — delete a local tag
- `<name> <commit>` — tag a specific past commit instead of the current one

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

## Common Pitfalls
- Forgetting tags don't push automatically — you need `git push --tags` (or `git push origin v1.2.0`) separately after creating one

## Related Commands
- [[git push]]
- [[Semantic Versioning]]
