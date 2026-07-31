---
tags: [programming-language, systems, compiled, metaprogramming]
category: Systems
status: to-learn
---

# D

**Definition:** Systems language designed as a modernized reimagining of C++, keeping native performance and C ABI compatibility while adding optional garbage collection, built-in testing, and cleaner syntax.

**Paradigm:** Multi-paradigm (procedural, OOP, functional, metaprogramming) | **Typing:** Static, strong

## Pros
- C-like ABI interoperability makes it practical to reuse existing C libraries and system interfaces.
- Modules, slices, and built-in arrays make many common patterns shorter than in C++.
- The language can use the GC for convenience or avoid it in `@nogc` code paths when predictability matters.
- CTFE (Compile-Time Function Execution), mixins, and templates give strong compile-time generation without leaving the language.
- Built-in contracts and safety annotations help distinguish safe, trusted, and unsafe regions explicitly.
- Incredibly fast compilation times compared to C++.

## Cons
- The ecosystem is smaller than mainstream systems languages, so package choice can be limited.
- Historical fragmentation (Phobos vs Tango) hurt early momentum and left fewer widely recognized libraries.
- Rust and Go occupy much of the modern systems-language mindshare.
- Compile-time metaprogramming is powerful, but can still create complexity if teams overuse it.
- GC defaults are a plus for productivity, but a concern for programmers who want deterministic memory from the start.
- Small community means fewer StackOverflow answers and tutorials.

## Best For
- Teams that want C++-style control with less syntactic overhead.
- Performance-sensitive modules that can benefit from safer defaults and clearer semantics.
- Numeric or array-heavy code where slices and compile-time generation reduce boilerplate.
- Cross-platform CLI tools and backend services.

## Real Examples
- **WekaIO**: Uses D for their high-performance parallel file system.
- **Sociomantic**: Used D extensively in their real-time bidding system (ad-tech).
- **Remedy Games**: Some game studios and tooling teams have used D for engine-side utilities and code generation.
- **eBay**: Experimented with D for high-performance backend components.

## Use Cases
- Systems tools, code generators, and command-line utilities.
- Engine tooling, data transforms, and native libraries that need predictable runtime behavior.
- High-frequency trading and low-latency financial systems.
- Scripting replacement (D compiles fast enough to run as a script).

## Extended Syntax & Features

D's syntax is heavily inspired by C and C++, making it immediately familiar to developers coming from those ecosystems. However, D drops much of the legacy baggage and syntactic ambiguities of C++, replacing them with modern constructs.

### Basic Data Types
D supports a rich set of built-in data types:
- **Integer Types**: `byte`, `short`, `int`, `long` (signed) and their unsigned counterparts `ubyte`, `ushort`, `uint`, `ulong`.
- **Floating-Point Types**: `float`, `double`, `real` (hardware's largest float, typically 80-bit on x86).
- **Characters**: `char` (UTF-8), `wchar` (UTF-16), `dchar` (UTF-32).
- **Strings**: `string` is simply an alias for `immutable(char)[]`.
- **Arrays**: Built-in dynamic and static arrays.
- **Associative Arrays**: Built-in hash maps.

### Control Flow
D provides standard imperative control structures alongside advanced additions:
- `if`, `else if`, `else`
- `while`, `do-while`, `for`
- `foreach` and `foreach_reverse`: The preferred way to iterate over arrays and ranges.
- `switch`: Supports fallthrough only if explicitly requested; strings can be switched on.

### Functions and Methods
Functions in D are first-class citizens. They support default arguments, variadic arguments, and can be nested. D also has Uniform Function Call Syntax (UFCS), allowing any function `foo(a, b)` to be called as `a.foo(b)`.

## Advanced Concepts

### Memory Management (GC and `@nogc`)
By default, D is garbage-collected. This vastly simplifies programming and prevents memory leaks and dangling pointers in typical applications. However, systems programming often requires deterministic memory management.
D allows the developer to opt out of the GC completely. Functions can be marked with the `@nogc` attribute, which ensures at compile time that no GC allocations occur within them. For memory management in `@nogc` code, D provides `core.memory`, `std.experimental.allocator`, and manual allocation (`malloc`/`free`).

### Compile-Time Function Execution (CTFE)
CTFE is a cornerstone of D's metaprogramming capabilities. D can execute a large subset of the language at compile time. This allows you to generate lookup tables, parse configurations, or calculate complex constants during compilation, resulting in zero runtime overhead.

### Templates and Mixins
- **Templates**: D's templates are cleaner and more powerful than C++ templates. They use a straightforward `!` syntax, e.g., `Array!int`.
- **String Mixins**: `mixin("code string")` compiles the string as if it were written in the source file. Combined with CTFE, this allows for unparalleled code generation capabilities.

### Concurrency and Parallelism
D embraces modern concurrency models. The standard library provides `std.concurrency` based on the Actor model (message passing between isolated threads, similar to Erlang) and `std.parallelism` for task-based parallelism (parallel foreach, map, reduce).

## Ecosystem & Tooling

### Package Management: DUB
DUB is the official package manager and build tool for D. It handles dependencies, builds, and configuration. DUB packages are hosted on `code.dlang.org`.
Common commands:
- `dub init`: Create a new project.
- `dub build`: Compile the project.
- `dub run`: Compile and run.
- `dub test`: Run unit tests.

### Compilers
D has three main compilers:
- **DMD (Digital Mars D)**: The reference compiler. Extremely fast compilation times, ideal for development.
- **LDC (LLVM D Compiler)**: Uses the LLVM backend. Generates highly optimized machine code. Preferred for production and cross-compilation.
- **GDC (GNU D Compiler)**: Part of GCC. Excellent for platforms supported by GCC.

### Frameworks and Libraries
- **Vibe.d**: A high-performance asynchronous I/O and web framework. The de facto standard for building web servers and APIs in D.
- **Mir**: A set of libraries for scientific computing, fast JSON parsing, and algorithms.
- **Derelict / BindBC**: Libraries for dynamically loading C libraries (OpenGL, SDL, etc.).

## Code Examples

### 1. Basic Hello World and Syntax
This example showcases standard I/O and the entry point of a D program.

```d
import std.stdio;
import std.string;

// Entry point of the program
void main() {
    // Print to standard output
    writeln("Hello, World!");
    
    // Formatted printing
    int year = 2024;
    writefln("Welcome to D programming in %d", year);
}
```

### 2. Data Structures (Arrays and Associative Arrays)
D has powerful built-in arrays, slices, and hash maps (associative arrays).

```d
import std.stdio;

void main() {
    // Dynamic array
    int[] numbers = [1, 2, 3, 4, 5];
    numbers ~= 6; // Append to array
    
    // Slices (views into an array)
    int[] slice = numbers[1 .. 4]; // [2, 3, 4]
    
    // Associative array (Hash map)
    string[string] capitals = [
        "France": "Paris",
        "Japan": "Tokyo"
    ];
    
    capitals["Germany"] = "Berlin"; // Add new key-value pair
    
    // Foreach iteration
    foreach (country, capital; capitals) {
        writefln("The capital of %s is %s", country, capital);
    }
}
```

### 3. Object-Oriented and Functional Patterns
D supports class-based OOP (single inheritance, interfaces) and functional constructs (UFCS, higher-order functions).

```d
import std.stdio;
import std.algorithm;
import std.array;

// Interface definition
interface Animal {
    void speak();
}

// Class implementing interface
class Dog : Animal {
    private string name;
    
    this(string name) {
        this.name = name;
    }
    
    void speak() {
        writeln(name, " says Woof!");
    }
}

void main() {
    Animal dog = new Dog("Buddy");
    dog.speak();
    
    // Functional programming with UFCS (Uniform Function Call Syntax)
    int[] nums = [1, 2, 3, 4, 5, 6];
    
    // Chaining operations: filter even, square them, convert to array
    auto result = nums
        .filter!(n => n % 2 == 0)
        .map!(n => n * n)
        .array();
        
    writeln("Squared evens: ", result); // [4, 16, 36]
}
```

### 4. Compile-Time Function Execution (CTFE)
One of D's most powerful features: executing code during compilation to generate constants.

```d
import std.stdio;

// This function can run at runtime OR compile time
int computeFactorial(int n) {
    int result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

void main() {
    // 'enum' forces compile-time evaluation in D
    enum int fact5 = computeFactorial(5);
    
    // 'fact5' is replaced with 120 directly in the compiled binary!
    writeln("Factorial of 5 is: ", fact5);
    
    // Runs at runtime
    int x = 6;
    writeln("Factorial of 6 is: ", computeFactorial(x));
}
```

### 5. Memory Safety and `@nogc`
D allows you to disable the garbage collector for performance-critical regions.

```d
import std.stdio;
import core.stdc.stdlib : malloc, free;

// @nogc prevents the function from allocating via the GC
@nogc void processData(int[] data) {
    // Array iteration without GC allocations
    foreach (ref val; data) {
        val *= 2;
    }
}

void main() {
    // Manual memory allocation (similar to C)
    int* ptr = cast(int*) malloc(5 * int.sizeof);
    
    // Error handling
    if (ptr is null) return;
    
    // Create a slice from the manually allocated pointer
    int[] manualArray = ptr[0 .. 5];
    
    // Initialize
    foreach (i, ref val; manualArray) {
        val = cast(int) i;
    }
    
    // Call the @nogc function
    processData(manualArray);
    
    // Manual deallocation
    free(ptr);
}
```

### 6. Concurrency (Message Passing)
D's standard library provides actor-model concurrency, avoiding shared state issues.

```d
import std.stdio;
import std.concurrency;
import core.thread;

// Worker thread function
void worker(Tid parentTid) {
    bool running = true;
    while (running) {
        receive(
            (int msg) {
                writeln("Worker received number: ", msg);
                send(parentTid, msg * 2); // Send back result
            },
            (string msg) {
                if (msg == "stop") {
                    writeln("Worker stopping...");
                    running = false;
                }
            }
        );
    }
}

void main() {
    // Spawn a new thread
    Tid workerTid = spawn(&worker, thisTid);
    
    // Send messages to the worker
    send(workerTid, 10);
    send(workerTid, 21);
    
    // Receive responses
    for (int i = 0; i < 2; i++) {
        receive(
            (int result) {
                writeln("Main received result: ", result);
            }
        );
    }
    
    // Shutdown worker
    send(workerTid, "stop");
    thread_joinAll();
}
```

### 7. Contract Programming
D has built-in support for Design by Contract (preconditions, postconditions, and invariants).

```d
import std.stdio;

class BankAccount {
    private double balance;
    
    // Invariant condition that must hold before and after any public method
    invariant {
        assert(balance >= 0, "Balance cannot be negative!");
    }
    
    this(double initialBalance) {
        balance = initialBalance;
    }
    
    void deposit(double amount)
    in {
        // Precondition
        assert(amount > 0, "Deposit amount must be positive");
    }
    out {
        // Postcondition
        assert(balance > 0, "Balance must be positive after deposit");
    }
    do {
        // Actual implementation
        balance += amount;
        writeln("Deposited: ", amount, ", New Balance: ", balance);
    }
    
    void withdraw(double amount)
    in {
        assert(amount > 0, "Withdrawal amount must be positive");
        assert(amount <= balance, "Insufficient funds");
    }
    do {
        balance -= amount;
        writeln("Withdrew: ", amount, ", New Balance: ", balance);
    }
}

void main() {
    BankAccount account = new BankAccount(100.0);
    account.deposit(50.0);
    account.withdraw(30.0);
    // account.withdraw(200.0); // This would trigger an AssertionError
}
```

### 8. Network Requests (Using standard library socket)
D can handle networking natively, though frameworks like vibe.d are preferred for complex HTTP tasks.

```d
import std.stdio;
import std.socket;

void main() {
    // Create a TCP socket
    auto sock = new TcpSocket();
    
    // Resolve hostname to IP address
    auto addresses = getAddress("example.com", 80);
    
    // Connect to the first resolved address
    sock.connect(addresses[0]);
    
    // Send HTTP GET request
    string request = "GET / HTTP/1.1\r\nHost: example.com\r\nConnection: close\r\n\r\n";
    sock.send(request);
    
    // Buffer for receiving data
    char[1024] buffer;
    long received;
    
    writeln("Response:");
    // Read response in chunks
    while ((received = sock.receive(buffer)) > 0) {
        write(buffer[0 .. received]);
    }
    
    sock.close();
}
```

## Best Practices

1. **Use `auto` for Type Inference**: Rely on `auto` when the type is obvious from the right-hand side, keeping the code cleaner.
2. **Leverage UFCS (Uniform Function Call Syntax)**: Instead of `map(filter(array, condition), transform)`, use `array.filter!(condition).map!(transform)`. It significantly improves readability, resembling method chaining in modern languages.
3. **Minimize GC Allocations in Hot Paths**: Use `@nogc` and `std.experimental.allocator` in performance-critical sections (e.g., rendering loops, high-frequency trading logic).
4. **Prefer `foreach` over `for`**: Standard `for` loops are rarely needed in D. `foreach` is safer and more idiomatic when iterating arrays and ranges.
5. **Use Contracts for Safety**: Utilize `in` and `out` blocks for self-documenting constraints and runtime safety checks that don't obfuscate the main logic.
6. **Prefer Ranges over Arrays**: When designing algorithms, use the Range API (`std.range`) instead of strict arrays to make your functions work seamlessly with lazy sequences and generators.
7. **Organize using Modules**: Always define a `module` declaration at the top of your files (e.g., `module mypackage.myfeature;`) to avoid namespace collisions and improve compile times.
