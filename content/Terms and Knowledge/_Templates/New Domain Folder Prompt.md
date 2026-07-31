---
tags: [template, meta]
---

# New Domain Folder Prompt

Copy-paste this to any agent (Claude, another AI, another session) to add a new subfolder to this vault that matches every existing one (Full-Stack, Git, Artificial Intelligence, Data Structures and Algorithms, etc.) exactly. Fill in `<DOMAIN NAME>`, `<N>`, `<K>` before sending.

Pair it with [[Vault Audit Prompt]] afterward — that's the actual consistency guarantee, not this prompt alone.

---

```
Add a new subfolder to my Obsidian vault at:
C:\Users\gilbert\Documents\gilbert\Learnin\Terms and Knowledge\<DOMAIN NAME>\

This vault already has folders like Full-Stack, Git, Artificial Intelligence, and
Data Structures and Algorithms built to a specific template. Match it exactly.

TOPIC: <DOMAIN NAME> — cover <N> terms/commands across roughly <K> categories that
someone learning <DOMAIN NAME> needs day to day. Pick the categories yourself based
on how the field is naturally organized.

FOR EACH TERM, create one file: Terms and Knowledge/<DOMAIN NAME>/<Term Name>.md

Frontmatter (exact format):
---
tags: [term, <domain-slug>, <relevant-subtag>]
category: <Category Name — must exactly match a section header in the MOC>
---

Body template (use this exact header structure, do not add or remove sections):
# <Term Name>

**Definition:** One or two plain sentences. What it is, not what it's used for.

## How It Works
- 2-4 bullets, mechanism-level, not marketing

## Why It Matters
- 1-3 bullets, the actual practical reason someone learning this should care

## Common Pitfalls
- 1-3 bullets, real mistakes people make, not generic warnings

## Related Terms
- [[Other Term In This Vault]]
- Link outward to other folders too if genuinely related (e.g. a term that
  connects to something already in Full-Stack or Git), not just within this folder

## Example
One concrete, real sentence. Name real tools/companies/products where possible,
not "Company X" or invented examples.

WRITING STYLE (this is enforced, not a suggestion):
- Short, plain sentences. No filler, no throat-clearing intros ("In the world of...").
- Minimal em-dashes (—). Use commas or colons instead. This vault has been audited
  for em-dash overuse before — keep it under control.
- No AI-slop phrasing: nothing like "it's important to note," "in today's world,"
  "unlock the power of," "seamlessly," "robust," "leverage." Just state the fact.
- Technically accurate over impressive-sounding. If unsure of a detail, simplify
  rather than pad.

FILE NAMING (avoid breaking Windows/Obsidian):
- Filename = the note's title, exactly, including any "(Full Name)" the title has.
- Never use / \ : * ? " < > | in a filename. If a term's natural name contains one
  (e.g. "CI/CD", "SSL/TLS"), pick a safe filename (e.g. "CI-CD.md") and use Obsidian's
  alias link syntax everywhere it's referenced: [[CI-CD|CI/CD]]
- For acronyms, put the expansion in parens in the title itself, e.g.
  "JWT (JSON Web Token).md", "SSO (Single Sign-On).md" — this matches every other
  folder in the vault.

MOC (index) FILE — create one at:
Terms and Knowledge/<DOMAIN NAME>/<DOMAIN NAME> Terms MOC.md

---
tags: [moc, term, <domain-slug>]
---

# <DOMAIN NAME> Terms MOC

One sentence: what this covers and how many terms/notes.

## <Category 1>
- [[Term]]
- [[Term]]

## <Category 2>
- [[Term]]

---

## How to use this
1-2 sentences on when to reach for this folder.

## Suggested order if starting from zero
Numbered list, grouping related terms with → arrows, roughly easy-to-hard.

FINAL CHECK before you're done:
- Every [[wikilink]] in every note (Related Terms sections + the MOC) must resolve
  to a filename that actually exists somewhere in the vault. No dangling links.
- Every note's frontmatter `category:` value must exactly match the section header
  text it's filed under in the MOC (same casing, same punctuation).
- Do not create a note with the same title as one that already exists elsewhere in
  the vault — check first, and link to the existing one instead of duplicating it.
```
