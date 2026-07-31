---
tags: [template, meta]
---

# Vault Audit Prompt

Run this after any agent (this one included) adds new content to the vault — it's what actually catches drift between batches, not [[New Domain Folder Prompt]] alone. Different agents phrase things differently even with identical instructions (e.g. em-dash usage varied a lot batch to batch), so treat this as the real quality gate.

---

```
Audit C:\Users\gilbert\Documents\gilbert\Learnin for consistency. Specifically:

1. Write a script that scans every .md file in the vault, extracts every [[wikilink]]
   (handle the [[Target|Display Text]] alias form too), and checks whether each
   target resolves to an actual filename somewhere in the vault. Report every
   broken link with its source file.

2. For every note under "Terms and Knowledge", extract its frontmatter `category:`
   value and confirm it exactly matches a section header in that folder's MOC file.

3. Group every note by its set of ## headers and report how many distinct header
   patterns exist across the vault — there should only be 1-2 (the term-glossary
   template, and the Git command-reference template). Flag any outlier.

4. Check for duplicate note titles (same filename) appearing in more than one
   folder — these usually mean the same concept got written twice with drifting
   content instead of being linked once.

5. Report em-dash (—) usage per folder so I can see if any batch drifted from the
   "minimal em-dash" style rule.

Fix anything genuinely broken (retarget a mislabeled link, write a missing note
that multiple other notes already reference but doesn't exist yet). For anything
that's a judgment call rather than clearly broken, report it to me instead of
changing it.
```
