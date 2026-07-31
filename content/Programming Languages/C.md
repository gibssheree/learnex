---
tags: [programming-language, systems, compiled]
category: Systems
status: to-learn
---

# C

**Definition:** Low-level procedural language that exposes memory, pointers, and system calls directly, making it the base layer for kernels, runtimes, and performance-critical software.

**Paradigm:** Procedural | **Typing:** Static, weak

## Pros
- Close to hardware with predictable control over layout, pointer arithmetic, and system interfaces.
- Tiny runtime footprint, so it works well in kernels, embedded systems, bootloaders, and freestanding builds.
- The language standard is compact, which makes compilers and toolchains widely portable.
- Huge amount of existing code, libraries, and systems knowledge across Unix, networking, and embedded domains.
- C interop is straightforward, which is why most runtimes expose a C ABI.

## Cons
- Manual ownership and lifetime management make leaks, double-frees, and use-after-free bugs common if discipline is weak.
- Undefined behavior can turn a small bug into a compiler-dependent failure mode.
- The language offers very few abstractions for data modeling, error handling, or safe collection manipulation.
- Security bugs like buffer overflows and format-string issues are a persistent risk class.
- Large applications require conventions that the language itself does not enforce.

## Best For
- Operating systems, device drivers, bootloaders, and embedded firmware.
- Low-level libraries and performance-critical primitives that need ABI stability.
- Learning memory layout, pointers, calling conventions, and how higher-level runtimes work.

## Real Examples
- The Linux kernel is primarily C with small architecture-specific assembly pieces.
- Git, Redis, SQLite, and curl all rely heavily on C.
- CPython, Ruby MRI, PHP, and many other language runtimes embed or expose C APIs.
- OpenSSL, zlib, and libpng are classic C libraries used by many higher-level stacks.

## Use Cases
- Microcontrollers and embedded firmware where memory and binary size are constrained.
- OS development, libc implementations, and hardware abstraction layers.
- Game engine subsystems, codec libraries, and network stacks.
- Example:

```c
int add(int a, int b) {
	return a + b;
}
```

## Extended Syntax & Features

### Basic Data Types and Sizes
C is statically typed, and it offers primitive data types whose sizes can vary depending on the architecture and compiler, although standard sizes exist. Common types include:
- `char`: The smallest addressable unit, typically 8 bits.
- `int`: The natural word size of the architecture (usually 32 bits).
- `short`: A shorter integer (at least 16 bits).
- `long`: A longer integer (at least 32 bits, often 64 bits on 64-bit systems).
- `long long`: At least 64 bits.
- `float`, `double`: Single and double-precision floating-point numbers.

To ensure exact sizes, the `<stdint.h>` header provides fixed-width integers like `int8_t`, `uint32_t`, `int64_t`, etc.

### Control Flow
C control flow relies on standard procedural constructs:
- `if`, `else if`, `else` for conditional branching.
- `switch`, `case`, `default` for multi-way branching (must use `break` to prevent fallthrough).
- Loops: `for`, `while`, `do-while`.
- `goto`: Supported, though generally discouraged. It is often used in Linux kernel development for unified error handling/cleanup.

### Functions
Functions are the primary building blocks of C programs. C does not support function overloading or default arguments natively. Functions can be forward-declared in header files (`.h`) and defined in source files (`.c`).

### Structs and Unions
- **Structs**: Used to group variables of different types under a single name. Struct fields are laid out in memory in the order they are declared, often with padding to satisfy alignment requirements.
- **Unions**: Similar to structs, but all members share the same memory location. The size of a union is equal to the size of its largest member. It's useful for saving memory or writing type-punning code (though strict aliasing rules apply).

### Enums
Enums assign names to integer constants, making code more readable.
```c
enum Status {
    STATUS_OK = 0,
    STATUS_ERROR = 1,
    STATUS_PENDING = 2
};
```

## Advanced Concepts

### Pointers and Memory Management
Pointers are variables that store memory addresses. C allows direct manipulation of pointers, including pointer arithmetic.
- Dynamic memory is managed using the `<stdlib.h>` functions: `malloc`, `calloc`, `realloc`, and `free`.
- **malloc**: Allocates raw bytes.
- **calloc**: Allocates memory and zero-initializes it.
- **free**: Deallocates memory. Failing to free memory leads to memory leaks, while freeing it twice (double-free) or using it after freeing (use-after-free) causes security vulnerabilities and crashes.

### The C Preprocessor
The preprocessor (`cpp`) runs before compilation, handling directives like `#include`, `#define`, `#ifdef`, and macros.
- Macros can be used for text replacement, conditional compilation, and defining inline-like operations before inline functions were standardized.
- Advanced preprocessor tricks include X-macros, variadic macros, and token pasting (`##`), which can act as a rudimentary form of metaprogramming or code generation.

### Concurrency Model
C does not have built-in concurrency in the language syntax itself, but it provides concurrency via libraries.
- Standard C11 introduced `<threads.h>`, offering standard thread, mutex, and condition variable support.
- Traditionally, C applications rely on platform-specific APIs like **POSIX Threads (pthreads)** on Unix-like systems and **Windows API threads** on Windows.
- Concurrency requires careful manual synchronization to avoid race conditions, deadlocks, and data corruption.

### Metaprogramming and Generics
C lacks templates (like C++) or true generics. Instead, developers achieve generic programming through:
- **`void *` pointers**: Allows a function to accept a pointer to any data type, requiring manual casting.
- **Macros**: Preprocessor macros can generate type-specific functions.
- **C11 `_Generic`**: Introduced in C11, `_Generic` allows compile-time selection of expressions based on the type of an argument, enabling function overloading-like behavior (e.g., `<tgmath.h>`).

## Ecosystem & Tooling

### Compilers
- **GCC (GNU Compiler Collection)**: The standard open-source compiler for Unix-like systems, widely used in open-source projects.
- **Clang/LLVM**: A modern, modular compiler known for fast compilation speeds, excellent diagnostics (error messages), and extensive tooling (static analyzers, formatters).
- **MSVC (Microsoft Visual C++)**: The standard compiler on Windows.

### Build Systems
- **Make**: The traditional build tool, using `Makefile`s to manage dependencies and compilation rules.
- **CMake**: A popular meta-build system that generates native build scripts (e.g., Makefiles, Ninja files, Visual Studio projects) from cross-platform configuration files.
- **Ninja**: A small build system with a focus on speed, often used as a backend for CMake.
- **Meson**: A modern, fast build system using Python-like syntax.

### Tooling
- **Valgrind**: A dynamic binary instrumentation framework, famous for its Memcheck tool, which detects memory leaks, uninitialized memory usage, and out-of-bounds accesses.
- **GDB (GNU Debugger) / LLDB**: Command-line debuggers for inspecting running programs, setting breakpoints, and examining memory.
- **AddressSanitizer (ASan)**: A fast memory error detector integrated directly into GCC and Clang.
- **Clang-Tidy**: A powerful linter and static analysis tool.

### Standard Library (libc)
The C Standard Library provides fundamental functions, including string manipulation (`<string.h>`), mathematical operations (`<math.h>`), standard input/output (`<stdio.h>`), and time utilities (`<time.h>`). Popular implementations include **glibc** (GNU), **musl** (lightweight, used in Alpine Linux), and **msvcrt/ucrt** (Windows).

## Code Examples

### 1. Hello World and Basic Input/Output
A fundamental example demonstrating how to read and print data.
```c
#include <stdio.h>

int main(void) {
    // Print to standard output
    printf("Hello, World!\n");
    
    int age;
    printf("Enter your age: ");
    // Read formatted input from standard input
    if (scanf("%d", &age) == 1) {
        printf("You are %d years old.\n", age);
    } else {
        printf("Invalid input.\n");
    }
    
    return 0; // Return success status to the operating system
}
```

### 2. Pointers and Arrays
This example illustrates how arrays decay into pointers and how pointer arithmetic works.
```c
#include <stdio.h>

int main(void) {
    int numbers[] = {10, 20, 30, 40, 50};
    int length = sizeof(numbers) / sizeof(numbers[0]);
    
    // Arrays can be accessed using standard indexing
    printf("First element: %d\n", numbers[0]);
    
    // Or using pointers and pointer arithmetic
    int *ptr = numbers; // ptr points to the first element
    printf("Second element: %d\n", *(ptr + 1));
    
    // Iterating with a pointer
    printf("All elements: ");
    for (int i = 0; i < length; i++) {
        printf("%d ", *(ptr + i));
    }
    printf("\n");
    
    return 0;
}
```

### 3. Dynamic Memory Allocation and Structs
Creating a basic linked list node, demonstrating `malloc` and `free`.
```c
#include <stdio.h>
#include <stdlib.h>

// Define a struct for a linked list node
typedef struct Node {
    int data;
    struct Node *next;
} Node;

int main(void) {
    // Allocate memory dynamically for two nodes
    Node *head = (Node *)malloc(sizeof(Node));
    Node *second = (Node *)malloc(sizeof(Node));
    
    if (head == NULL || second == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        return 1;
    }
    
    // Initialize data
    head->data = 1;
    head->next = second;
    
    second->data = 2;
    second->next = NULL;
    
    // Traverse the list
    Node *current = head;
    while (current != NULL) {
        printf("%d -> ", current->data);
        current = current->next;
    }
    printf("NULL\n");
    
    // Free allocated memory to prevent leaks
    free(second);
    free(head);
    
    return 0;
}
```

### 4. OOP Pattern in C (Opaque Pointers)
C doesn't have classes, but you can achieve encapsulation using opaque pointers.
```c
// counter.h
#ifndef COUNTER_H
#define COUNTER_H

typedef struct Counter Counter;

Counter* counter_create(void);
void counter_increment(Counter* c);
int counter_get(Counter* c);
void counter_destroy(Counter* c);

#endif // COUNTER_H

// counter.c
#include <stdlib.h>
// #include "counter.h"

// Definition is hidden from the header, encapsulating the state
struct Counter {
    int value;
};

Counter* counter_create(void) {
    Counter* c = (Counter*)calloc(1, sizeof(Counter));
    return c;
}

void counter_increment(Counter* c) {
    if (c) c->value++;
}

int counter_get(Counter* c) {
    return c ? c->value : 0;
}

void counter_destroy(Counter* c) {
    free(c);
}

// main.c
#include <stdio.h>
int main(void) {
    Counter* my_counter = counter_create();
    counter_increment(my_counter);
    counter_increment(my_counter);
    
    printf("Counter value: %d\n", counter_get(my_counter));
    
    counter_destroy(my_counter);
    return 0;
}
```

### 5. Advanced: POSIX Threads (pthreads) Concurrency
A basic example of spinning up threads and protecting shared data with a mutex.
```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

#define NUM_THREADS 5

int shared_counter = 0;
pthread_mutex_t lock;

// The thread payload function
void* increment_counter(void* arg) {
    long thread_id = (long)arg;
    
    // Lock the mutex before accessing shared data
    pthread_mutex_lock(&lock);
    
    shared_counter++;
    printf("Thread %ld incremented counter to %d\n", thread_id, shared_counter);
    
    // Unlock the mutex
    pthread_mutex_unlock(&lock);
    
    return NULL;
}

int main(void) {
    pthread_t threads[NUM_THREADS];
    
    // Initialize the mutex
    if (pthread_mutex_init(&lock, NULL) != 0) {
        fprintf(stderr, "Mutex init failed\n");
        return 1;
    }
    
    // Create threads
    for (long i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&threads[i], NULL, increment_counter, (void*)i) != 0) {
            fprintf(stderr, "Thread creation failed\n");
            return 1;
        }
    }
    
    // Wait for all threads to finish
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }
    
    printf("Final counter value: %d\n", shared_counter);
    
    // Destroy the mutex
    pthread_mutex_destroy(&lock);
    
    return 0;
}
```

### 6. Function Pointers (Callbacks)
Function pointers allow passing functions as arguments, forming the basis of callback systems and dynamic dispatch.
```c
#include <stdio.h>

// Define a type for a function pointer that takes two ints and returns an int
typedef int (*Operation)(int, int);

int add(int a, int b) { return a + b; }
int multiply(int a, int b) { return a * b; }

// A generic execution function
void execute_operation(int x, int y, Operation op, const char* name) {
    int result = op(x, y);
    printf("Result of %s: %d\n", name, result);
}

int main(void) {
    execute_operation(5, 3, add, "Addition");
    execute_operation(5, 3, multiply, "Multiplication");
    return 0;
}
```

### 7. C11 Generic Selection Macro
Using the `_Generic` keyword to create type-generic macros.
```c
#include <stdio.h>

// Print format selection based on type
#define print_val(x) _Generic((x), \
    int: printf("int: %d\n", x), \
    double: printf("double: %f\n", x), \
    char*: printf("string: %s\n", x), \
    default: printf("unknown type\n") \
)

int main(void) {
    int a = 10;
    double b = 3.14;
    char* c = "Hello";
    
    print_val(a);
    print_val(b);
    print_val(c);
    
    return 0;
}
```

## Best Practices

1. **Always Check Return Values**: Check the return values of functions like `malloc`, `fopen`, and `scanf`. Failing to do so can lead to null pointer dereferences and undefined behavior.
2. **Use Fixed-Width Integers**: Prefer `<stdint.h>` types (`int32_t`, `uint64_t`) when the size of data matters, such as in network protocols or file formats.
3. **Initialize Variables Immediately**: Uninitialized local variables contain garbage data. Always initialize them (e.g., `int x = 0;` or `char buf[256] = {0};`).
4. **Avoid Magic Numbers**: Use `#define` or `enum` to name constants. This makes the code easier to read and maintain.
5. **Memory Ownership Semantics**: Clearly document who is responsible for freeing dynamically allocated memory. A function that allocates and returns memory transfers ownership to the caller.
6. **Use Sanitizers**: During development, compile with `-fsanitize=address,undefined` (ASan and UBSan) to catch memory leaks, out-of-bounds accesses, and undefined behavior early.
7. **Const Correctness**: Use the `const` keyword extensively. If a function accepts a pointer but doesn't modify the data, declare it as `const type *`. This prevents accidental modification and helps the compiler optimize.
8. **String Handling**: Be extremely careful with C strings. Standard functions like `strcpy` and `sprintf` can cause buffer overflows. Prefer safer alternatives like `strncpy`, `snprintf`, or platform-specific bounds-checking functions if available.
9. **Avoid Global State**: Limit the use of global variables. If necessary, make them `static` to restrict their visibility to the current translation unit (source file).
10. **The `goto` Cleanup Pattern**: In functions that acquire multiple resources, a common and accepted pattern is to use `goto` to jump to a single cleanup section at the end of the function, ensuring all resources are freed on error.
