---
tags: [programming-language, systems, compiled, low-level]
category: Systems
status: to-learn
---

# Zig

**Definition:** Low-level systems language designed as a simpler, more explicit alternative to C, with `comptime` replacing many macro and generics use cases.

**Paradigm:** Procedural | **Typing:** Static

## Pros
- The language is intentionally explicit: failures are returned, not hidden behind exceptions.
- C interop is first-class through `@cImport`, and Zig can also act as a C/C++ compiler front end.
- `comptime` powers generics, reflection-like generation, and constant evaluation in one mechanism.
- The allocator model makes memory ownership visible in APIs rather than implicit.
- Cross-compilation is a core feature rather than an add-on.

## Cons
- The language is still pre-1.0, so minor releases can be source breaking.
- The ecosystem and package story are young compared with Rust or Go.
- Learning resources are limited beyond official docs and community exercises.
- Hiring is mostly limited to early adopters and infrastructure-oriented teams.
- Memory safety depends on discipline and debug checks rather than a borrow checker.

## Best For
- Replacing C in new low-level projects that want explicitness without C++ complexity.
- Cross-compiling from one toolchain to many targets.
- Incrementally migrating existing C/C++ codebases.

## Real Examples
- Bun uses Zig in major parts of its implementation.
- TigerBeetle is a frequently cited Zig production system.
- The Zig compiler is self-hosted.

## Use Cases
- Embedded systems, firmware, and systems tooling.
- Game engine utilities and small native CLIs.
- Example:

```zig
const std = @import("std");

pub fn main() void {
	std.debug.print("hello\n", .{});
}
```

## Extended Syntax & Features

Zig's syntax is heavily influenced by C, but it discards many historical design flaws such as the preprocessor, macros, and hidden control flow. The syntax aims to be readable, highly explicit, and devoid of "magic" features like operator overloading or implicit type casting.

### Variables and Mutability
In Zig, all declarations must be explicit about mutability. The language makes it a compile-time error to leave a variable uninitialized, except when explicitly marked with `undefined`.
- `const` is used for values that cannot change after initialization.
- `var` is used for variables whose values can be mutated.

Types can often be inferred, but they can also be stated explicitly. When declaring variables at the top level of a file, order does not matter.

### Primitive Types
Zig provides a comprehensive set of explicit-width integer types:
- **Signed integers:** `i8`, `i16`, `i32`, `i64`, `i128`, `isize` (pointer-sized integer)
- **Unsigned integers:** `u8`, `u16`, `u32`, `u64`, `u128`, `usize`
- **Arbitrary bit-width integers:** `i1`, `u7`, `i21`, `u256`, etc.
- **Floats:** `f16`, `f32`, `f64`, `f80`, `f128`
- **Booleans:** `bool` (`true` or `false`)

### Control Flow
Zig supports standard control flow constructs, with the addition of payload unwrapping for optional and error types.
- **If statements:** Zig's `if` statements require a boolean condition. There is no implicit truthiness. They can also be used as expressions.
- **Switch statements:** Extremely powerful in Zig. They must be exhaustive; you must either cover all possible values or provide an `else` branch.
- **Loops:** Zig provides `while` loops and `for` loops.
    - `while` loops operate on boolean conditions or can be used for iteration when dealing with optional types or iterators.
    - `for` loops are designed specifically for iterating over slices and arrays, providing access to both the item and its index.

### Error Handling
Instead of throwing exceptions, Zig uses error sets. An error set is like an enum, but exclusively for representing errors. Any function that can fail returns an Error Union type, denoted by `!`, e.g., `ErrorSet!ReturnType` or simply `!ReturnType` if the error set is inferred.
- The `try` keyword is used to evaluate an error union expression. If it is an error, it returns the error from the current function; otherwise, it unwraps the payload.
- The `catch` keyword provides a fallback value or executes a block if an error occurs.
- `if` statements can unwrap errors using payload capture: `if (foo()) |val| { ... } else |err| { ... }`.

### Structs, Enums, and Unions
- **Structs:** The fundamental way to define composite types in Zig. Structs can also contain declarations (like functions), effectively acting as namespaces.
- **Enums:** Strongly typed enumerations. You can specify the backing integer tag type.
- **Unions:** Tagged unions (often called variants or sum types) are first-class, and Zig allows you to safely switch on them using the active tag.

## Advanced Concepts

### Metaprogramming with `comptime`
One of Zig's defining features is its approach to metaprogramming through the `comptime` (compile-time) keyword. Instead of using a separate macro language or template system (like in C++ or Rust), Zig executes regular Zig code at compile time.
- If an argument to a function is marked as `comptime`, its value must be known at compile time.
- Generics are implemented as functions that take a `comptime type` as an argument and return a `type` (often a newly constructed struct).
- You can iterate over arrays, manipulate types, and use reflection capabilities (like `@typeInfo` and `@TypeOf`) all at compile time to generate highly optimized code.

### Explicit Memory Management
Unlike languages with garbage collection (Go, Java) or borrow checkers (Rust), Zig requires manual memory management. However, unlike C, memory allocation is never hidden. There is no default global allocator.
- Functions that require heap allocation must accept an `Allocator` as a parameter. This makes memory usage extremely visible in the API.
- The standard library provides multiple allocators:
  - `std.heap.page_allocator`: Direct OS page allocations, usually used as a backing allocator.
  - `std.heap.GeneralPurposeAllocator`: A safe, feature-rich allocator designed to detect leaks, double-frees, and use-after-free bugs.
  - `std.heap.ArenaAllocator`: Allocates memory in a chunk and frees it all at once. Extremely useful for short-lived tasks where individual `free` calls are unnecessary overhead.
  - `std.heap.FixedBufferAllocator`: Allocates strictly out of a fixed-size buffer provided by the user, requiring zero heap allocations. This is ideal for embedded systems or performance-critical loops.

### C Interoperability
Zig was designed from day one to be the ultimate C replacement. It achieves this by seamless interoperability.
- The `@cImport` built-in allows Zig code to directly parse C header files without writing explicit FFI bindings.
- You can call C functions and use C types as if they were native Zig constructs.
- Zig itself acts as a fully functional C and C++ compiler (`zig cc` and `zig c++`), capable of cross-compiling massive C/C++ projects with zero external dependencies, making it an incredible drop-in replacement for `clang` or `gcc`.

### Pointers and Safety
Zig provides distinct pointer types to ensure safety and convey intent:
- Single-item pointers: `*T` (similar to C, but never null).
- Many-item pointers: `[*]T` (points to an unknown number of items, used for C interoperability).
- Slices: `[]T` (a pointer and a length). Slices are the safest and most common way to pass arrays around.
- Nullable pointers: `?*T`. In Zig, pointers cannot be null by default. To represent a null pointer, you must wrap it in an Optional type.

Zig performs bounds checking on slices and arrays by default in `Debug` and `ReleaseSafe` build modes, catching out-of-bounds access at runtime and panicking instead of corrupting memory.

## Ecosystem & Tooling

While younger than C++, Rust, or Go, Zig's ecosystem is highly capable, largely due to its unified tooling.

### The Zig Toolchain
The `zig` executable is the heart of the ecosystem. It is an all-in-one tool:
- **`zig build`:** Zig's build system. Instead of using Make or CMake, builds are defined in `build.zig`, which is written in actual Zig code. This allows for complex cross-platform build logic, custom build steps, and easy integration of C/C++ dependencies.
- **`zig cc` / `zig c++`:** A drop-in C/C++ compiler that bundles libc for many targets, enabling effortless cross-compilation (e.g., `zig cc -target x86_64-windows-gnu main.c`).
- **`zig test`:** A built-in test runner. Tests are written alongside the code they test using `test "name" { ... }` blocks.
- **`zig fmt`:** An opinionated code formatter that enforces Zig's standard style.

### Package Management
Zig 0.11 introduced a native package manager via `build.zig.zon` (Zig Object Notation). It allows pulling dependencies by specifying URLs and cryptographic hashes, integrating seamlessly into the `zig build` system.

### Standard Library
The standard library (`std`) is broad and still evolving. It is structured explicitly:
- `std.mem`: Memory manipulation, allocation interfaces, and byte-level operations.
- `std.fs`: File system operations.
- `std.net`: Networking utilities, including TCP and UDP sockets.
- `std.Thread`: Threading, mutexes, condition variables, and atomics.
- `std.http`: Basic HTTP client/server capabilities.

### Popular Frameworks and Libraries
- **Zap:** A high-performance web server framework for Zig.
- **Mach:** A game engine and graphics toolkit built in Zig.
- **River:** A dynamic tiling Wayland compositor written in Zig.
- **TigerBeetle:** A distributed financial accounting database that heavily leverages Zig's safety features and explicit memory management.

## Code Examples

### 1. Variables, Arrays, and Control Flow
```zig
const std = @import("std");

pub fn main() !void {
    // Explicit mutability
    const pi = 3.14159;
    var counter: u32 = 0;
    
    // Arrays and slices
    const primes = [_]u8{2, 3, 5, 7, 11};
    var slice: []const u8 = primes[1..4]; // {3, 5, 7}
    
    // For loop with item capture
    for (slice, 0..) |prime, index| {
        std.debug.print("Prime at index {d} is {d}\n", .{index, prime});
        counter += 1;
    }
    
    // While loop with optional unwrapping
    var optional_val: ?u32 = 42;
    while (optional_val) |v| {
        std.debug.print("Value is {d}\n", .{v});
        optional_val = null; // breaks the loop
    }
}
```

### 2. Error Handling
Zig makes error handling explicit using error unions and `try`/`catch`.

```zig
const std = @import("std");

const FileError = error{
    FileNotFound,
    AccessDenied,
    Unknown,
};

fn readFile(filename: []const u8) FileError![]const u8 {
    if (std.mem.eql(u8, filename, "secret.txt")) {
        return FileError.AccessDenied;
    } else if (std.mem.eql(u8, filename, "missing.txt")) {
        return FileError.FileNotFound;
    }
    return "file contents";
}

pub fn main() void {
    // Using try in a function that returns an error union
    // fn that returns an error must be able to propagate it, or we handle it.
    
    // Handling with if-error capture
    if (readFile("secret.txt")) |contents| {
        std.debug.print("Read: {s}\n", .{contents});
    } else |err| {
        std.debug.print("Failed to read: {any}\n", .{err}); // Handles the error explicitly
    }
    
    // Using catch for a default value
    const data = readFile("missing.txt") catch "default data";
    std.debug.print("Data: {s}\n", .{data});
}
```

### 3. Explicit Memory Management (Allocators)
Passing allocators explicitly ensures no hidden memory usage.

```zig
const std = @import("std");

pub fn main() !void {
    // GeneralPurposeAllocator is great for finding memory leaks in debug mode
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    // Defer the deinitialization to ensure we check for leaks when main exits
    defer {
        const check = gpa.deinit();
        if (check == .leak) {
            std.debug.print("Memory leak detected!\n", .{});
        }
    }
    
    const allocator = gpa.allocator();
    
    // Dynamically allocate a slice of 100 u32 integers
    const buffer = try allocator.alloc(u32, 100);
    // Defer the free so it happens automatically at the end of the scope
    defer allocator.free(buffer);
    
    for (buffer, 0..) |*item, i| {
        item.* = @as(u32, @intCast(i * 2));
    }
    
    std.debug.print("Buffer[50] = {d}\n", .{buffer[50]});
}
```

### 4. Metaprogramming (comptime) and Generics
Generics in Zig are just functions that return types evaluated at compile time.

```zig
const std = @import("std");

// A generic Stack data structure
fn Stack(comptime T: type) type {
    return struct {
        items: []T,
        len: usize,
        allocator: std.mem.Allocator,

        const Self = @This();

        pub fn init(allocator: std.mem.Allocator) Self {
            return .{
                .items = &[_]T{},
                .len = 0,
                .allocator = allocator,
            };
        }

        pub fn deinit(self: *Self) void {
            self.allocator.free(self.items);
        }

        pub fn push(self: *Self, item: T) !void {
            const new_memory = try self.allocator.realloc(self.items, self.len + 1);
            self.items = new_memory;
            self.items[self.len] = item;
            self.len += 1;
        }

        pub fn pop(self: *Self) ?T {
            if (self.len == 0) return null;
            self.len -= 1;
            return self.items[self.len];
        }
    };
}

pub fn main() !void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    defer arena.deinit();
    const allocator = arena.allocator();

    // Instantiate a Stack of i32
    var my_stack = Stack(i32).init(allocator);
    // No need to call deinit on my_stack because the ArenaAllocator cleans it all up!

    try my_stack.push(10);
    try my_stack.push(20);

    if (my_stack.pop()) |val| {
        std.debug.print("Popped: {d}\n", .{val}); // 20
    }
}
```

### 5. C Interoperability
Using `@cImport` to call C standard library functions directly.

```zig
const std = @import("std");

// Import C standard library headers directly
const c = @cImport({
    @cInclude("stdio.h");
    @cInclude("stdlib.h");
});

pub fn main() void {
    // Call C printf
    _ = c.printf("Hello from C's printf! The answer is %d\n", 42);
    
    // Call C malloc and free
    const ptr = c.malloc(1024);
    if (ptr != null) {
        c.free(ptr);
        std.debug.print("Allocated and freed using C stdlib!\n", .{});
    }
}
```

### 6. Concurrency and Threading
Zig provides a low-level thread API that maps closely to OS threads, and atomics for lock-free data structures.

```zig
const std = @import("std");

// A shared state protected by a Mutex
const SharedState = struct {
    counter: u32 = 0,
    mutex: std.Thread.Mutex = .{},
    
    fn increment(self: *SharedState) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        self.counter += 1;
        std.debug.print("Counter incremented to {d}\n", .{self.counter});
    }
};

fn worker(state: *SharedState) void {
    // Each worker increments the counter 5 times
    for (0..5) |_| {
        state.increment();
        std.time.sleep(10 * std.time.ns_per_ms);
    }
}

pub fn main() !void {
    var state = SharedState{};
    
    // Spawn 3 threads
    const t1 = try std.Thread.spawn(.{}, worker, .{&state});
    const t2 = try std.Thread.spawn(.{}, worker, .{&state});
    const t3 = try std.Thread.spawn(.{}, worker, .{&state});
    
    // Wait for all threads to finish
    t1.join();
    t2.join();
    t3.join();
    
    std.debug.print("Final counter value: {d}\n", .{state.counter});
}
```

## Best Practices

1. **Use `defer` heavily:** Resource cleanup, unlocking mutexes, and freeing memory should be deferred immediately after they are acquired. This ensures cleanup happens regardless of early returns or errors.
2. **Prefer `ArenaAllocator` for request lifetimes:** In web servers or localized tasks (like parsing a file), allocate an arena at the start, pass it to all functions, and free it at the end. This is vastly more efficient than tracking individual allocations and freeing them manually.
3. **Handle Errors explicitly:** Avoid using `catch unreachable` unless you are absolutely mathematically certain an error cannot occur. `unreachable` triggers a panic in debug mode and undefined behavior in ReleaseFast mode.
4. **Use Explicit Integer Types:** Don't default to `i32` or `usize` unless appropriate. If a value represents a bit flag, use `u8` or `u16`. If it's an array index, use `usize`.
5. **Leverage `comptime` instead of macros:** If you find yourself writing repetitive boilerplate, see if a `comptime` function can generate the types or code you need. Metaprogramming in Zig is extremely powerful and typed.
6. **Pass parameters by value or pointer strategically:** Zig allows the compiler to decide whether to pass structs by value or by reference under the hood for optimization. For large structs that you want to mutate, explicitly pass a pointer (`*T`).
7. **Initialize with `.{}`, not `undefined`:** Always initialize structs cleanly. Use `undefined` only for large buffers where zeroing out the memory would cause a measurable performance hit.
8. **Test Alongside Code:** Keep `test` blocks at the bottom of the file they are testing. This promotes unit testing and ensures tests don't rot since they are right next to the implementation. Use `zig test` frequently.
