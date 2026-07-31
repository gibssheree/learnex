---
tags: [programming-language, cross-platform, game-dev]
category: Niche
status: to-learn
---

# Haxe

**Definition:** Cross-platform language that can compile to many targets from one codebase, including JavaScript, C++, Python, and native mobile targets.

**Paradigm:** Multi-paradigm | **Typing:** Static

## Pros
- Write once and target many platforms from the same codebase.
- Strong fit for cross-platform game development and tooling.
- Flexible backend targets let teams pick JavaScript, native, or interpreted outputs.
- The language includes an expressive type system and macro support.

## Cons
- The community is small compared with mainstream languages.
- Learning resources are sparse and often target game developers.
- Niche adoption means fewer package and hiring options.
- Target-specific bugs can appear when generated code behaves differently across backends.

## Best For
- Cross-platform game development and multi-target application code.
- Teams that need one source tree for web and native targets.

## Real Examples
- Dead Cells is a widely cited Haxe example.
- Papers, Please was prototyped with Haxe.

## Use Cases
- 2D game development across multiple platforms.
- Example:

```haxe
class Main {
	static function main() {
		trace("hello");
	}
}
```
