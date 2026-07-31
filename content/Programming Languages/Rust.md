---
tags: [programming-language, systems, compiled]
category: Systems
status: to-learn
---

# Rust

**Definition:** Modern systems language that enforces memory safety, thread safety, and aliasing rules at compile time through ownership, borrowing, and lifetimes rather than a garbage collector.

**Paradigm:** Multi-paradigm, systems, functional, imperative, concurrent | **Typing:** Static, strong, inferred

## Pros
- Memory safety and data-race prevention are enforced before the program runs, which removes entire classes of C/C++ bugs (e.g., use-after-free, double free, dangling pointers).
- Performance is usually close to C/C++ because abstraction costs are often optimized away by LLVM. "Zero-cost abstractions" means what you don't use, you don't pay for.
- Cargo integrates building, testing, dependency management, documentation, and publishing in one highly efficient workflow.
- Pattern matching, enums, traits, and zero-cost abstractions make it possible to express complex domains without runtime overhead.
- The ecosystem is strong for systems work, web services, WASM, embedded systems, and developer tooling.
- Powerful type system helps prevent business logic bugs at compile time (e.g., using `Option` instead of null pointers).

## Cons
- The borrow checker and lifetime model require a different mental model than mainstream GC languages, creating a steep learning curve.
- Compile times can be noticeable, especially in large crates with many generics, monomorphized instantiations, and procedural macros.
- Ergonomics for highly dynamic patterns (like dynamic typing, mocking, or self-referential structs) are weaker than in scripting languages or GC languages.
- Some ecosystem areas (like GUI frameworks or certain niche libraries) are younger or less mature than the equivalent Java/Go/Python stacks.
- Concurrency is safer, but async code can still be difficult to reason about when lifetimes, pinning (`Pin`), and runtime choices (e.g., Tokio) are involved.

## Best For
- Systems programming where memory safety and predictable, highly optimized performance matter.
- WebAssembly (WASM) modules, embedded components, and performance-sensitive core libraries.
- CLI tools and infrastructure utilities that should remain fast, have small binaries, and be reliable under load.
- Security-sensitive services where eliminating undefined behavior and memory vulnerabilities is a major goal.
- High-throughput backend services and network proxies requiring massive concurrency without GC pauses.

## Real Examples
- Firefox’s codebase includes substantial Rust components through the Servo browser engine ecosystem and style subsystems.
- Discord, AWS, and other backend teams have used Rust for performance-sensitive services and video processing.
- Deno and the JavaScript bundler SWC are written in Rust.
- Many Rust web frameworks such as Axum and Actix are production-relevant and top tech empowerment benchmarks.
- Linux kernel now officially supports Rust as a second language for writing kernel modules and drivers.
- Cloudflare has used Rust heavily in network services, edge components, and custom proxies.

## Use Cases
- OS components, device drivers, and embedded firmware where memory safety is critical.
- Low-latency networking, proxies, and high-throughput backend services.
- WASM modules, cryptographic libraries, and blockchain infrastructure.
- High-performance command-line utilities.

---

## Extended Syntax & Features

### Variables and Mutability
By default, all variables in Rust are immutable. This aligns with the language's focus on safety and concurrency. To make a variable mutable, you must explicitly use the `mut` keyword.

```rust
let x = 5; // Immutable variable
// x = 6; // This would cause a compile-time error

let mut y = 10; // Mutable variable
y = 15; // This is perfectly fine
```

### Data Types
Rust is a statically typed language, which means that it must know the types of all variables at compile time.
- **Scalar Types:** Integers (`i8`, `u32`, `isize`), Floating-point numbers (`f32`, `f64`), Booleans (`bool`), and Characters (`char` - 4 bytes, representing a Unicode Scalar Value).
- **Compound Types:**
  - **Tuples:** Group together multiple values with a variety of types. `let tup: (i32, f64, u8) = (500, 6.4, 1);`
  - **Arrays:** Every element of an array must have the same type, and arrays have a fixed length. `let a = [1, 2, 3, 4, 5];`

### Control Flow
Rust's control flow mechanisms are expressions, not just statements.
- **If Expressions:** You can use `if` in a `let` statement because it's an expression.
  ```rust
  let condition = true;
  let number = if condition { 5 } else { 6 };
  ```
- **Loops:** `loop` (infinite), `while`, and `for` (iterator-based).
  ```rust
  for number in (1..4).rev() {
      println!("{}!", number);
  }
  ```

### Structs and Enums
Rust uses `struct` for defining custom types and `enum` for algebraic data types.
- **Structs:** Similar to C structs but with methods.
- **Enums:** More powerful than enums in most languages. They can contain data.
  ```rust
  enum Message {
      Quit,
      Move { x: i32, y: i32 },
      Write(String),
      ChangeColor(i32, i32, i32),
  }
  ```

### Pattern Matching
The `match` control flow construct allows you to compare a value against a series of patterns and then execute code based on which pattern matches. Patterns can be made up of literal values, variable names, wildcards, and many other things.

```rust
let coin = 5;
match coin {
    1 => println!("Penny"),
    5 => println!("Nickel"),
    10 => println!("Dime"),
    25 => println!("Quarter"),
    _ => println!("Other"), // The `_` is a catch-all
}
```

### Error Handling
Rust groups errors into two major categories: recoverable and unrecoverable errors.
- **Unrecoverable:** `panic!` macro.
- **Recoverable:** `Result<T, E>` enum, which has variants `Ok(T)` and `Err(E)`. Rust uses the `?` operator for easy error propagation.

---

## Advanced Concepts

### Ownership, Borrowing, and Lifetimes
This is Rust's most unique feature. It enables memory safety without a garbage collector.
1. **Ownership Rules:**
   - Each value in Rust has a variable that’s called its *owner*.
   - There can only be one owner at a time.
   - When the owner goes out of scope, the value will be dropped (memory freed).
2. **Borrowing:** You can create references to values (borrowing) using `&T` (immutable) or `&mut T` (mutable).
   - *Rule:* At any given time, you can have *either* one mutable reference *or* any number of immutable references.
   - References must always be valid.
3. **Lifetimes:** Every reference in Rust has a lifetime, which is the scope for which that reference is valid. Most of the time, lifetimes are implicit and inferred, just like most types. When references could have multiple lifetimes, you must annotate them to ensure dangling pointers never happen.

```rust
// Lifetime annotation 'a ensures the returned reference
// lives at least as long as both x and y.
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

### Smart Pointers
Smart pointers are data structures that act like a pointer but have additional metadata and capabilities.
- `Box<T>`: Allocates values on the heap.
- `Rc<T>`: Reference counting type, enables multiple ownership on the heap (single-threaded).
- `Arc<T>`: Atomic reference counted type, safe for concurrent programming.
- `RefCell<T>`: Enforces borrowing rules at runtime instead of compile time (interior mutability).

### Concurrency
Rust’s approach to concurrency is summarized as "fearless concurrency".
- By leveraging ownership and type systems (specifically the `Send` and `Sync` traits), Rust catches data races at compile time.
- Standard library provides OS threads (`std::thread`), channels (`std::sync::mpsc`), and shared state primitives like `Mutex<T>` and `RwLock<T>`.

### Generics and Traits
- **Generics:** Abstract stand-ins for concrete types or other properties.
- **Traits:** Similar to interfaces in other languages. They define shared behavior. You can use trait bounds to specify that a generic type can be any type that has certain behavior.

### Metaprogramming (Macros)
Rust has a powerful macro system that operates on the abstract syntax tree (AST).
- **Declarative Macros (`macro_rules!`):** Used for pattern matching on code structure.
- **Procedural Macros:** Act more like functions (derive macros, attribute-like macros, function-like macros).

---

## Ecosystem & Tooling

- **Cargo:** The official Rust package manager and build system. Handles downloading dependencies, compiling packages, making distributable packages, and uploading them to crates.io.
  - `cargo check`: Verifies code compiles without building an executable (fast).
  - `cargo build`: Builds the project.
  - `cargo test`: Runs unit and integration tests.
  - `cargo run`: Builds and executes.
- **Rustup:** The toolchain multiplexer. Used to install and manage Rust compilers (stable, beta, nightly) and associated tools.
- **rust-analyzer:** The official Language Server Protocol (LSP) implementation for Rust, providing incredible IDE integration.
- **Clippy:** A collection of lints to catch common mistakes and improve your Rust code.
- **Rustfmt:** A tool for formatting Rust code according to style guidelines.
- **Popular Frameworks & Libraries:**
  - **Web Frameworks:** Axum, Actix-web, Rocket.
  - **Asynchronous Runtimes:** Tokio (industry standard), async-std, smol.
  - **Serialization:** Serde (extremely fast, powerful serialization/deserialization framework).
  - **CLI Tools:** Clap, StructOpt (now merged into Clap).
  - **Database ORMs/Builders:** SQLx (async, compile-time checked queries), Diesel, SeaORM.
  - **TUI/GUI:** Ratatui (terminal UIs), Tauri (Electron alternative), Iced.

---

## Code Examples

### 1. Hello World & Basic Structs
```rust
// Entry point of a Rust application
fn main() {
    println!("Hello, world!");

    // Instantiating a struct
    let user = User {
        username: String::from("alice123"),
        email: String::from("alice@example.com"),
        sign_in_count: 1,
        active: true,
    };

    println!("User {} is active: {}", user.username, user.active);
}

// Defining a Struct
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}
```

### 2. Error Handling with `Result` and `?`
```rust
use std::fs::File;
use std::io::{self, Read};

// The ? operator can only be used in functions that return Result or Option
fn read_username_from_file() -> Result<String, io::Error> {
    // ? will early return the error if File::open fails
    let mut file = File::open("hello.txt")?;
    let mut s = String::new();
    
    // ? will early return the error if read_to_string fails
    file.read_to_string(&mut s)?;
    
    Ok(s) // Return the successful String wrapped in Ok
}
```

### 3. Traits and Object-Oriented Patterns
```rust
// Defining a trait (interface)
pub trait Summary {
    fn summarize(&self) -> String;
}

pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

// Implementing the trait for a specific type
impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct Tweet {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub retweet: bool,
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}

// Function that accepts any type that implements Summary
pub fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}
```

### 4. Concurrency: Message Passing with Channels
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

fn main() {
    // Create a multiple-producer, single-consumer channel
    let (tx, rx) = mpsc::channel();

    // Spawn a thread to send messages
    thread::spawn(move || {
        let vals = vec![
            String::from("hi"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_millis(100));
        }
    });

    // The main thread receives messages
    for received in rx {
        println!("Got: {}", received);
    }
}
```

### 5. Async/Await (Requires Tokio)
```rust
// This is a common pattern for async main functions using the Tokio runtime
// You would need `tokio = { version = "1", features = ["full"] }` in Cargo.toml
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() {
    println!("Starting task...");
    
    // Await the asynchronous operation
    let result = do_something_async().await;
    
    println!("Task completed with: {}", result);
}

async fn do_something_async() -> i32 {
    sleep(Duration::from_secs(2)).await;
    42
}
```

### 6. Enums and Pattern Matching
```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

fn route(ip_type: IpAddr) {
    match ip_type {
        IpAddr::V4(a, b, c, d) => {
            println!("Routing IPv4: {}.{}.{}.{}", a, b, c, d);
        }
        IpAddr::V6(address) => {
            println!("Routing IPv6: {}", address);
        }
    }
}

fn main() {
    let home = IpAddr::V4(127, 0, 0, 1);
    let loopback = IpAddr::V6(String::from("::1"));

    route(home);
    route(loopback);
}
```

### 7. Enums representing States (State Machine Pattern)
```rust
enum State {
    Draft(String),
    PendingReview(String),
    Published(String),
}

impl State {
    fn request_review(self) -> Self {
        match self {
            State::Draft(content) => State::PendingReview(content),
            other => other,
        }
    }

    fn approve(self) -> Self {
        match self {
            State::PendingReview(content) => State::Published(content),
            other => other,
        }
    }
}
```

---

## Best Practices

1. **Leverage the Compiler:** Don't fight the borrow checker. If the compiler complains about ownership, it's often a sign that your data architecture needs rethinking (e.g., passing references instead of values, or vice versa).
2. **Use `Result` and `Option` Pervasively:** Avoid panicking (`unwrap()`, `expect()`, `panic!()`) in production code. Only use them when a state is truly unrecoverable or in tests. Handle errors gracefully using the `?` operator.
3. **Prefer Structs and Enums over Primitive Obsession:** Wrap primitives in structs or use enums to represent distinct states. This makes invalid states unrepresentable at compile time.
4. **Use `clippy` and `rustfmt`:** Make it a habit to run `cargo clippy` to catch unidiomatic code and `cargo fmt` to keep a consistent style across your project.
5. **Understand `String` vs `&str`:** `String` is an owned, heap-allocated string buffer. `&str` is an immutable, borrowed string slice. Use `&str` for function parameters unless the function explicitly needs to take ownership of the string.
6. **Limit the use of `unsafe`:** The vast majority of Rust code should be written in safe Rust. Only use `unsafe` when absolutely necessary (e.g., FFI, implementing fundamental low-level data structures), and always encapsulate it in safe abstractions.
7. **Document Your Code:** Use doc comments (`///`) extensively. Cargo automatically generates HTML documentation from these, which is a massive boon for maintainability.
8. **Small Crates, Composable Code:** Break large codebases into smaller, well-defined crates or modules. This improves compilation time and code reusability.
9. **Avoid Premature Optimization (like unnecessary `Arc`/`Mutex`):** Start with simple ownership. If you don't need shared state, don't use it.
10. **Use `impl Trait` instead of Trait Objects when possible:** Prefer static dispatch (generics or `impl Trait`) over dynamic dispatch (`Box<dyn Trait>`) for better performance, unless you strictly need runtime polymorphism (e.g., storing a heterogeneous collection in a `Vec`).
