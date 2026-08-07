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

## Extended Syntax & Features

Haxe is a high-level, strictly typed language whose compiler translates source into other languages rather than executing bytecode directly. The same `.hx` file can compile to JavaScript for the browser, C++ for native games, or HashLink bytecode for fast cross-platform binaries.

### Basic Data Types
Haxe provides familiar scalar and composite types:
- **Int and Float:** Numeric types. Integers are 32-bit by default; `Int64` exists for larger ranges.
- **Bool:** `true` and `false`.
- **String:** UTF-8 encoded, immutable strings with interpolation via `'Hello ${name}'`.
- **Void:** Absence of a meaningful return value.
- **Dynamic:** Opt-out of static typing when interoping with untyped externals (use sparingly).
- **Null safety (Haxe 4+):** Optional types use `Null<T>` or `?T` syntax; strict null checking catches NPE-class bugs at compile time.

### Variables and Type Inference
Variables are declared with `var` (mutable) or `final` (immutable, preferred). The compiler infers types when initialization makes them obvious.

```haxe
final name = "Learnitas";
var score:Int = 0;
score += 10;
```

### Control Flow
- **`if / else`:** Standard conditionals; blocks use curly braces.
- **`switch`:** Powerful pattern matching with guards, enum matching, and exhaustiveness checking.
- **`for`:** Iterates arrays, iterators, and integer ranges (`for (i in 0...10)`).
- **`while` and `do-while`:** Standard loops.

```haxe
var label = switch (status) {
	case 200: "OK";
	case 404: "Not Found";
	case code if (code >= 500): "Server Error";
	default: "Unknown";
};
```

### Functions
Functions use the `function` keyword. Default arguments, optional parameters (`?name:String`), and rest parameters (`...args:Array<String>`) are supported. Functions are first-class values and can be assigned, passed, and returned.

```haxe
function greet(name:String, excited:Bool = false):String {
	return excited ? 'Hello, ${name}!' : 'Hello, ${name}.';
}
```

### Classes, Interfaces, and Abstract Types
- **Classes:** Standard OOP with inheritance (`extends`), interfaces (`implements`), and access modifiers (`public`, `private`).
- **Interfaces:** Define contracts without implementation.
- **Abstract types:** Wrap existing types with custom behavior and conversions without runtime overhead — heavily used for unit types and zero-cost wrappers.
- **Enums and algebraic data types:** Enums can carry parameters, enabling expressive domain modeling.

### Typedefs and Structures
Anonymous object types (`{ name:String, age:Int }`) and `typedef` aliases document structured data. `{ field: value }` object syntax creates anonymous structures efficiently.

### Properties
Getters and setters use the `var` property syntax with `(default, never)` or custom accessor functions, keeping field access uniform while controlling mutation.

## Advanced Concepts

### Cross-Platform Compilation
The Haxe compiler backend determines output:
- **JavaScript (js):** Browser and Node.js targets; generates clean ES5/ES6 code.
- **C++ (cpp):** Native compilation via generated C++ and external toolchain (used by OpenFL, Heaps).
- **HashLink (hl):** Custom VM bytecode with a small native runtime; fast iteration for games and tools.
- **Neko, Python, PHP, Java, C#:** Additional targets for scripting, server, or interop scenarios.

Conditional compilation (`#if js`, `#if cpp`) allows platform-specific code paths in a single codebase.

### Macros and Metaprogramming
Haxe macros execute at compile time, generating or transforming AST nodes. They power:
- **Serialization boilerplate** (auto-generating JSON readers/writers).
- **Embedded DSLs** (SQL builders, UI markup).
- **Code generation** from data definitions.

The `haxe.macro` API provides access to types, fields, and expressions during compilation.

### Generics and Type Parameters
Generic classes and functions (`Array<T>`, `Map<K,V>`) provide type-safe containers. Constraints (`T:Serializable`) limit type parameters. Static extension (`using`) adds methods to existing types without inheritance.

### Memory and Performance
On native targets (C++, HashLink), Haxe offers predictable performance close to hand-written C. On JavaScript, output quality matters — avoid excessive Dynamic typing and allocation in hot loops. Object pooling and struct-like anonymous types help game frame budgets.

### Dead Code Elimination (DCE)
The compiler's DCE removes unused types and methods, keeping JavaScript bundles and native binaries small. Mark APIs with `@:keep` or `@:expose` when reflection or external callers need them.

### Extern Classes
`extern` declarations describe APIs in other languages (JavaScript libraries, C++ engines) without Haxe implementations. This is how Haxe binds to OpenFL, Lime, and browser DOM APIs.

## Ecosystem & Tooling

### Compiler and Build
- **Haxe Compiler:** Open-source, installable via `haxelib` or OS packages.
- **haxelib:** Package manager for libraries and command-line tools.
- **HXML / HXP:** Project files listing sources, targets, libraries, and compiler flags.

### Game and Multimedia Frameworks
- **OpenFL:** Flash-compatible API ported to native and HTML5; widely used for 2D games.
- **Heaps:** High-performance 2D/3D framework built on HashLink; used in Dead Cells and other commercial titles.
- **Kha:** Low-level, portable framework abstracting GPU APIs across targets.
- **Flixel:** Classic 2D game framework with Haxe port (HaxeFlixel).

### Web and Application Frameworks
- **Haxe React (hxreact):** React bindings for browser UIs.
- **Bowser, ufront:** Server-side Haxe for web applications (niche but functional).

### Tooling
- **Visual Studio Code (Haxe extension):** Primary editor with completion, diagnostics, and debugging.
- **HashLink debugger, vshaxe:** Integrated debugging for HashLink and JavaScript targets.
- **Dox:** Documentation generator from Haxe doc comments.

### Community Resources
- **Haxe Foundation:** Maintains compiler and core libraries.
- **Community Discord, GitHub, and forums:** Smaller but active; game dev questions dominate.

## Code Examples

### 1. Hello World and Basic Types

```haxe
class Main {
	static function main() {
		trace("Hello, Haxe!");

		final pi:Float = 3.14159;
		var count:Int = 0;
		count++;

		final items:Array<String> = ["apple", "banana", "cherry"];
		for (item in items) {
			trace(item);
		}
	}
}
```

### 2. Classes and Inheritance

```haxe
class Animal {
	public var name:String;

	public function new(name:String) {
		this.name = name;
	}

	public function speak():String {
		return "...";
	}
}

class Dog extends Animal {
	public function new(name:String) {
		super(name);
	}

	override public function speak():String {
		return 'Woof! I am ${name}';
	}
}

class Main {
	static function main() {
		var dog = new Dog("Rex");
		trace(dog.speak());
	}
}
```

### 3. Enums and Pattern Matching

```haxe
enum Result<T> {
	Success(data:T);
	Error(message:String);
	Loading;
}

class Main {
	static function describe<T>(result:Result<T>):String {
		return switch (result) {
			case Success(data): 'Got: ${Std.string(data)}';
			case Error(msg): 'Error: ${msg}';
			case Loading: "Loading...";
		};
	}

	static function main() {
		trace(describe(Success(42)));
		trace(describe(Error("network timeout")));
	}
}
```

### 4. Typedefs and Anonymous Structures

```haxe
typedef User = {
	name:String,
	age:Int,
	?email:String
};

class Main {
	static function greet(user:User):String {
		var base = 'Hello, ${user.name} (${user.age})';
		return user.email != null ? '${base} <${user.email}>' : base;
	}

	static function main() {
		var alice:User = { name: "Alice", age: 30, email: "alice@example.com" };
		trace(greet(alice));
	}
}
```

### 5. Maps and Functionals

```haxe
class Main {
	static function main() {
		var scores = new Map<String, Int>();
		scores.set("Alice", 95);
		scores.set("Bob", 87);

		var total = 0;
		for (name => score in scores) {
			trace('${name}: ${score}');
			total += score;
		}
		trace('Average: ${total / scores.count()}');
	}
}
```

### 6. Conditional Compilation

```haxe
class PlatformInfo {
	public static function getTarget():String {
		#if js
		return "JavaScript";
		#elseif cpp
		return "C++ Native";
		#elseif hl
		return "HashLink";
		#else
		return "Other";
		#end
	}
}

class Main {
	static function main() {
		trace(PlatformInfo.getTarget());
	}
}
```

### 7. Extern JavaScript Interop

```haxe
#if js
extern class Console {
	static function log(v:Dynamic):Void;
}

class Main {
	static function main() {
		Console.log("Called from Haxe via extern");
	}
}
#end
```

### 8. Simple Game Loop Pattern (Heaps-style)

```haxe
class GameApp {
	var playerX:Float = 100;
	var playerY:Float = 100;

	public function new() {}

	public function update(dt:Float) {
		playerX += 50 * dt;
		if (playerX > 800) playerX = 0;
	}

	public function render() {
		trace('Player at (${playerX}, ${playerY})');
	}
}

class Main {
	static function main() {
		var app = new GameApp();
		for (i in 0...5) {
			app.update(0.016);
			app.render();
		}
	}
}
```

## Best Practices

1. **Choose the right target early:** JavaScript for web reach; HashLink or C++ for performance-critical games. Target choice affects library availability and debugging workflow.
2. **Minimize Dynamic:** Reserve `Dynamic` for true extern boundaries. Core game and app logic should stay strictly typed for compiler optimizations and DCE.
3. **Use final by default:** Prefer `final` over `var` unless mutation is required. Immutability simplifies reasoning across async and game update loops.
4. **Leverage enums for state:** Replace stringly-typed status flags with enums; the compiler enforces exhaustive switch handling.
5. **Organize with packages and modules:** Mirror directory structure with package names; one top-level class per file is conventional.
6. **Test on every target you ship:** Generated JavaScript and native code can diverge on edge cases (integer division, null handling, reflection). CI should build all release targets.
7. **Use haxelib dependencies carefully:** Pin versions in `haxelib.json`; game frameworks (OpenFL, Heaps) have coordinated release cycles — upgrade deliberately.
8. **Profile on the target platform:** Browser devtools for js; native profilers for cpp/hl. Compiler speed on desktop does not predict mobile or browser frame times.
9. **Document extern APIs:** Extern bindings are the fragile boundary to host engines and JS libraries. Keep them thin and well-commented.
10. **Contribute upstream when fixing target bugs:** The Haxe community is small; fixes to compiler backends and framework issues benefit everyone and build reputation in a niche ecosystem.
