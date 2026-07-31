---
tags: [programming-language, systems, compiled, oop, performance]
category: Systems
status: to-learn
---

# C++

**Definition:** Systems language that extends C with classes, templates, RAII, and a richer standard library, aiming for high performance with zero-cost abstractions.

**Paradigm:** Multi-paradigm (procedural, OOP, generic, increasingly functional since C++11) | **Typing:** Static, strong-ish (with unsafe escape hatches like raw pointers and casts)

## Pros
- Deterministic destruction via RAII makes resource cleanup predictable for files, mutexes, sockets, and heap allocations.
- The standard library and ecosystem provide strong primitives for algorithms, containers, concurrency, and performance work.
- Templates and `constexpr` enable compile-time composition without runtime abstraction penalties.
- Modern standards add move semantics, lambdas, structured bindings, ranges, and concepts, which significantly improve ergonomics.
- C++ interops well with C and remains dominant in game engines, simulation, graphics, and high-performance libraries.
- Predictable performance profiles, meaning the developer has direct control over how memory is allocated and released.
- A vast array of community-contributed libraries (via package managers like vcpkg and Conan) to rapidly build robust applications.

## Cons
- Multiple language eras coexist, so codebases often mix old idioms with C++11/17/20 features.
- Template metaprogramming can make compile errors and code navigation difficult.
- Lifetime bugs remain possible because ownership is convention-based rather than enforced by the compiler.
- Build systems and ABI compatibility often become complex at scale.
- Compile times are still a practical cost, especially when templates and large headers are heavily used.
- A steep learning curve due to the historical baggage, manual memory management aspects, and the sheer volume of language features.

## Best For
- Games and real-time systems with tight frame budgets.
- High-performance libraries, trading systems, codecs, and simulation engines.
- Resource-constrained software where memory layout and allocation strategy are deliberate.
- Browsers, JavaScript engines (V8), and database management systems where ultimate control over hardware is required.
- Operating system level features and embedded systems with performance-critical tasks.

## Real Examples
- Unreal Engine, Frostbite, Source 2, and other major game engines use C++ extensively.
- Chromium, Photoshop, Premiere, and many CAD tools rely on C++ for performance-critical code.
- Major parts of database engines, desktop applications, and operating system components are implemented in C++.
- High-frequency trading, market data, and low-latency infrastructure commonly use it where microseconds matter.
- Node.js’s underlying V8 JavaScript engine is written primarily in C++.
- NASA’s Mars rovers utilize C++ for critical mission execution software.

## Use Cases
- Game development and engine subsystems such as rendering, animation, and physics.
- Low-latency trading, audio/video pipelines, and scientific simulation.
- Embedded or systems software that needs C-level control plus richer abstractions.
- Creating native desktop applications using frameworks like Qt or wxWidgets.
- Machine learning backends (e.g., PyTorch and TensorFlow core engines).

## Extended Syntax & Features

C++ syntax heavily derives from C, but it adds an enormous layer of expressiveness. Let's delve into its features:

### Basic Data Types and Variables
Like C, C++ includes basic data types like `int`, `char`, `float`, `double`, and `bool`. The standard library also introduces safe strings (`std::string`), complex numbers (`std::complex`), and fixed-width integers (e.g., `int32_t`, `uint64_t`) available in `<cstdint>`. Variables can be declared with `auto` (since C++11) to enable type inference.

### Control Flow
Standard control flow includes `if-else`, `switch`, `for`, `while`, and `do-while`. Modern C++ introduces range-based for-loops that cleanly iterate over collections without explicit iterators or indices. Since C++17, you can include initialization statements directly inside `if` or `switch` blocks, improving scope control.

### Functions and Methods
Functions are building blocks of C++ programs. C++ supports function overloading, allowing multiple functions with the same name but different parameter types or counts. Inline functions suggest to the compiler to embed the function code at the call site, saving the overhead of a function call. Moreover, member functions (methods) are central to OOP in C++.

### Object-Oriented Programming (OOP)
C++ supports full OOP capabilities: classes, encapsulation (public, protected, private access specifiers), inheritance (single and multiple), and polymorphism (via `virtual` functions). It also allows operator overloading, empowering developers to define how standard operators work with user-defined types.

### Memory Management and Pointers
C++ retains C-style pointers but strongly advocates for modern memory management paradigms. Instead of manual `new` and `delete`, C++11 introduced smart pointers (`std::unique_ptr`, `std::shared_ptr`, and `std::weak_ptr`) that manage heap memory safely and automatically based on scope and reference counting.

### Exceptions
C++ uses exceptions (`try`, `catch`, `throw`) for error handling, though there is a large debate within the C++ community about their use due to overhead and complexity. In systems where performance is strictly bounded, error codes or `std::expected` (C++23) might be used instead.

## Advanced Concepts

### RAII (Resource Acquisition Is Initialization)
RAII is the core idiom of modern C++. When an object is instantiated, it acquires the resources it needs. When the object falls out of scope, its destructor is automatically called to release those resources. This prevents memory leaks and ensures safe release of file handles, network sockets, and database connections, even if an exception occurs.

### Templates and Generic Programming
Templates allow you to write code that works with any data type. Function templates and class templates are compiled into specific types on-demand. Template metaprogramming uses templates to perform computations at compile time, leading to highly optimized runtime code but potentially difficult-to-parse error messages.

### Move Semantics
Introduced in C++11, move semantics solve the performance overhead of unnecessary deep copying. Using rvalue references (`T&&`) and `std::move`, resources can be "stolen" from temporary objects instead of copied. This dramatically speeds up operations like resizing a `std::vector` or returning large objects from functions by value.

### Concurrency
C++ provides a standard thread library (`<thread>`). It includes primitives like `std::mutex`, `std::lock_guard`, `std::condition_variable`, and `std::atomic`. C++20 adds latches, barriers, and coroutines, bringing advanced asynchronous capabilities natively to the language.

### Concepts
Introduced in C++20, concepts allow developers to place constraints on template parameters. Instead of unreadable compiler errors when an invalid type is passed, concepts provide clear, human-readable errors. They also make template code easier to read by explicitly defining what characteristics a type must possess to be used with a given template.

## Ecosystem & Tooling

### Compilers
The three major compiler suites are:
- **GCC (GNU Compiler Collection):** The standard on most Linux systems.
- **Clang:** Built on LLVM, known for faster compile times and excellent error diagnostics.
- **MSVC (Microsoft Visual C++):** The standard compiler on Windows environments.

### Build Systems
- **CMake:** The de facto standard build system generator in the C++ world. It creates Makefiles, Ninja files, or Visual Studio solutions from a generic `CMakeLists.txt` file.
- **Ninja:** A fast, low-level build system often used as the backend for CMake.
- **Meson and Bazel:** Alternatives gaining traction in modern C++ projects for speed and robust dependency management.

### Package Managers
- **vcpkg:** Microsoft's C++ library manager, deeply integrated with CMake and Visual Studio.
- **Conan:** A decentralized, Python-based package manager that handles binaries and build-from-source seamlessly.

### Standard Library (STL)
The C++ Standard Library is immense. Key components include:
- **Containers:** `std::vector`, `std::list`, `std::map`, `std::unordered_map`, etc.
- **Algorithms:** `std::sort`, `std::find`, `std::transform`, mostly found in `<algorithm>`.
- **Iterators:** Glue between containers and algorithms.
- **Ranges:** C++20 introduced `std::ranges` to make standard algorithms composable and lazily evaluated.

## Code Examples

### 1. Hello World and Basic I/O
```cpp
#include <iostream>
#include <string>

int main() {
    // Basic output using standard character output stream
    std::cout << "Hello, World!" << std::endl;
    
    std::string name;
    std::cout << "Enter your name: ";
    // Reading input securely
    std::getline(std::cin, name);
    
    std::cout << "Greetings, " << name << "!" << std::endl;
    return 0;
}
```

### 2. Standard Data Structures and Range-Based For Loop
```cpp
#include <iostream>
#include <vector>
#include <map>
#include <string>

int main() {
    // std::vector is a dynamic array
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    
    // Range-based for loop with auto to deduce type
    for (const auto& num : numbers) {
        std::cout << num << " ";
    }
    std::cout << "\n";
    
    // std::map is an ordered key-value store (usually a Red-Black Tree)
    std::map<std::string, int> ages;
    ages["Alice"] = 30;
    ages["Bob"] = 25;
    
    // Structured binding (C++17) for easy iteration
    for (const auto& [name, age] : ages) {
        std::cout << name << " is " << age << " years old.\n";
    }
    
    return 0;
}
```

### 3. RAII and Smart Pointers
```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource() { std::cout << "Resource acquired.\n"; }
    ~Resource() { std::cout << "Resource destroyed.\n"; }
    void do_something() { std::cout << "Resource in use.\n"; }
};

void use_resource() {
    // std::unique_ptr ensures single ownership and automatic cleanup
    std::unique_ptr<Resource> res = std::make_unique<Resource>();
    res->do_something();
    // No need to delete 'res', it happens automatically here
}

int main() {
    std::cout << "Starting application.\n";
    use_resource();
    std::cout << "Ending application.\n";
    return 0;
}
```

### 4. Move Semantics and Custom Classes
```cpp
#include <iostream>
#include <vector>
#include <utility>

class Buffer {
private:
    size_t size;
    int* data;

public:
    // Regular constructor
    Buffer(size_t s) : size(s), data(new int[s]) {
        std::cout << "Constructed Buffer of size " << size << "\n";
    }

    // Destructor
    ~Buffer() {
        delete[] data;
    }

    // Move Constructor (steals resources from a temporary object)
    Buffer(Buffer&& other) noexcept : size(other.size), data(other.data) {
        other.size = 0;
        other.data = nullptr;
        std::cout << "Moved Buffer\n";
    }
    
    // Delete copy constructor to prevent expensive copies
    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;
};

int main() {
    std::vector<Buffer> buffers;
    
    // std::move is not strictly required here due to rvalue temporary, 
    // but useful to demonstrate semantics.
    buffers.push_back(Buffer(100)); // Calls move constructor
    
    Buffer b(200);
    // Explicitly moving a named object
    buffers.push_back(std::move(b)); 
    
    return 0;
}
```

### 5. Template Functions and Concepts (C++20)
```cpp
#include <iostream>
#include <concepts>
#include <string>

// A concept defining that a type must be integral (int, long, etc.)
template <typename T>
concept Integral = std::is_integral_v<T>;

// This function only accepts types that satisfy the Integral concept
template <Integral T>
T add(T a, T b) {
    return a + b;
}

int main() {
    std::cout << add(5, 10) << "\n";       // Valid, ints are integral
    // std::cout << add(5.5, 10.5);        // Error at compile time: constraints not satisfied
    
    return 0;
}
```

### 6. Concurrency: Multithreading and Mutexes
```cpp
#include <iostream>
#include <thread>
#include <vector>
#include <mutex>

std::mutex mtx;
int shared_counter = 0;

void increment_counter(int iterations) {
    for (int i = 0; i < iterations; ++i) {
        // lock_guard provides RAII-style mutex locking
        std::lock_guard<std::mutex> lock(mtx);
        ++shared_counter;
    }
}

int main() {
    std::vector<std::thread> threads;
    
    // Spawn 10 threads, each incrementing the counter 1000 times
    for (int i = 0; i < 10; ++i) {
        threads.emplace_back(increment_counter, 1000);
    }
    
    // Join all threads to main execution
    for (auto& t : threads) {
        t.join();
    }
    
    std::cout << "Final counter value: " << shared_counter << "\n";
    return 0;
}
```

### 7. Functional Programming: Lambdas and Standard Algorithms
```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 9, 3, 7};
    
    // Sort in descending order using a lambda
    std::sort(numbers.begin(), numbers.end(), [](int a, int b) {
        return a > b;
    });
    
    std::cout << "Sorted: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\n";
    
    // Count elements greater than 5
    int threshold = 5;
    auto count = std::count_if(numbers.begin(), numbers.end(), [threshold](int n) {
        return n > threshold;
    });
    
    std::cout << "Count > " << threshold << ": " << count << "\n";
    
    // Calculate sum using std::accumulate
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum: " << sum << "\n";
    
    return 0;
}
```

### 8. Inheritance, Virtual Functions, and Polymorphism
```cpp
#include <iostream>
#include <vector>
#include <memory>

class Animal {
public:
    // Virtual destructor is crucial for polymorphic classes
    virtual ~Animal() = default;
    
    // Pure virtual function makes this an abstract base class
    virtual void speak() const = 0;
};

class Dog : public Animal {
public:
    void speak() const override {
        std::cout << "Woof!\n";
    }
};

class Cat : public Animal {
public:
    void speak() const override {
        std::cout << "Meow!\n";
    }
};

int main() {
    // Polymorphic collection using smart pointers
    std::vector<std::unique_ptr<Animal>> zoo;
    zoo.push_back(std::make_unique<Dog>());
    zoo.push_back(std::make_unique<Cat>());
    zoo.push_back(std::make_unique<Dog>());
    
    for (const auto& animal : zoo) {
        animal->speak(); // Dynamic dispatch at runtime
    }
    
    return 0;
}
```

## Best Practices

- **Use Modern C++ (C++11 and beyond):** Avoid raw pointers (`*`) and `new`/`delete`. Prefer `std::unique_ptr` for exclusive ownership and `std::shared_ptr` only when shared ownership is strictly necessary.
- **Prefer `auto`:** Let the compiler deduce types where it is obvious. This keeps code readable and robust against refactoring, but don't overdo it if it harms readability.
- **Const Correctness:** Mark functions, variables, and pointers as `const` whenever they are not meant to modify data. This allows the compiler to catch logic errors and apply optimizations.
- **Pass by Reference/Value:** Pass built-in types (int, float) by value. Pass large objects (std::string, std::vector) by `const Type&` to avoid copying. Pass by value and move when storing sinks (e.g., constructors that take a string to store it).
- **Rule of Zero / Rule of Five:** Ideally, write classes that don't need custom destructors, copy constructors, or move constructors (Rule of Zero). If you must implement one (e.g., to manage a raw resource), you typically need to implement or `= delete` all five (destructor, copy constructor, move constructor, copy assignment, move assignment).
- **Embrace RAII:** Never rely on manual initialization and cleanup functions. Wrap resources in classes so their lifecycle is tied to scope.
- **Avoid Global Variables:** Global state makes debugging concurrency issues and unit testing incredibly difficult.
- **Namespace Use:** Do not use `using namespace std;` in header files. It pollutes the global namespace of any file that includes the header. Use it cautiously in implementation files if at all.
- **Leverage Standard Algorithms:** Before writing a raw `for` loop, check if a standard algorithm (`std::find`, `std::transform`, `std::all_of`) does what you need. It communicates intent better and is heavily optimized.
- **Enable Compiler Warnings:** Always compile with warnings treated as errors during development (e.g., `-Wall -Wextra -Werror` on GCC/Clang). This catches potential pitfalls early.
