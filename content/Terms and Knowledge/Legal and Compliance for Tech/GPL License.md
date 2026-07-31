---
tags: [term, legal, licensing]
category: Software Licenses
---

# GPL License

**Definition:** A "copyleft" open-source license requiring that any derivative work built on GPL-licensed code must also be released under the GPL, with source code made available.

## How It Works
- Copyleft: if you distribute software that incorporates GPL code, you must also release your combined work's source code under the GPL
- Different from permissive licenses like MIT, which impose no such requirement on derivative works
- LGPL (Lesser GPL) relaxes this for linking against libraries without forcing the whole application to become GPL

## Why It Matters
- Using GPL-licensed code inside a proprietary, closed-source commercial product can create real legal obligations to open-source your own code, a decision many companies deliberately avoid

## Common Pitfalls
- Accidentally including a GPL-licensed dependency inside a closed-source commercial product without realizing the obligation it creates
- Confusing GPL with LGPL, they have meaningfully different implications for linking against a library versus incorporating its code directly

## Related Terms
- [[MIT License]]
- [[Apache License 2.0]]

## Example
Linux itself is GPL-licensed, meaning any modifications to the Linux kernel source code that get distributed must also be released under the GPL.
