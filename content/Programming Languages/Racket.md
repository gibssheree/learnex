---
tags: [programming-language, functional, lisp, education]
category: Functional
status: to-learn
---

# Racket

**Definition:** Modern Lisp/Scheme descendant designed for language-oriented programming, teaching, and DSL construction.

**Paradigm:** Functional/multi-paradigm | **Typing:** Dynamic (optional static via Typed Racket)

## Pros
- Excellent for building DSLs, macro-heavy libraries, and new languages.
- Strong educational tooling, especially for interactive exploration and teaching.
- Good documentation and a culture of deliberate design.
- Typed Racket adds optional static typing for larger programs.
- Ships with DrRacket, an extremely capable IDE specifically built for it.
- Seamless interoperation between dynamically typed and statically typed code.
- Extensive, batteries-included standard library covering GUI development, networking, web servers, and graphics.
- Extremely powerful hygienic macro system allowing for language extensions.

## Cons
- Small industry adoption and a limited job market.
- Less common in enterprise teams than mainstream languages.
- The syntax and macro system still have a Lisp learning curve.
- Performance, while competitive for dynamic languages, might not match low-level systems languages like C, C++, or Rust.
- Syntax might alienate developers strictly accustomed to C-like or ALGOL-family syntax.
- Garbage collector pauses can affect soft real-time applications.

## Best For
- Teaching, language design, and DSL prototyping.
- Programs that benefit from heavy macro use or custom syntactic forms.
- Language-Oriented Programming (LOP), where you create multiple mini-languages to solve different sub-problems in a larger system.
- Academic research and writing complete textbooks with runnable code (e.g., using Scribble).

## Real Examples
- Common in university programming-languages and PLT courses.
- Some research tools and educational languages are built on Racket.
- The game *Naughty Dog* used Racket for scripting language design internally (historical context).
- Hacker News (via Arc, which was initially built on PLT Scheme/Racket).
- Pollen, a publishing system written in Racket.
- The Bootstrap curriculum (for teaching algebra through programming) uses Racket extensively.

## Use Cases
- Education, custom mini-languages, and research prototypes.
- Web development via the Racket web-server library.
- Creating comprehensive documentations via Scribble.
- Example:

```racket
(define (square x)
	(* x x))
```

## Extended Syntax & Features

### Basics and S-Expressions
Like all Lisps, Racket’s syntax is built primarily on S-expressions (Symbolic Expressions). Code and data share the same structure, enabling powerful metaprogramming capabilities.
Everything is essentially an S-expression surrounded by parentheses `()`, brackets `[]`, or braces `{}`. Code is represented as abstract syntax trees directly in the textual format.

### Basic Data Types
Racket supports a vast array of numeric and non-numeric types:
- **Numbers**: Integers, fractions (exact rationals), floating-point numbers, and complex numbers. Racket enforces exactness tracking.
- **Booleans**: `#t` (true) and `#f` (false). Only `#f` is falsy; everything else is truthy.
- **Strings**: Immutable sequences of Unicode characters, written as `"Hello"`.
- **Symbols**: Interned strings used as identifiers, prefixed with a quote (e.g., `'symbol`). Highly efficient for equality checks.
- **Characters**: `#\a`, `#\newline`, `#\space`.
- **Lists**: Singly-linked lists. Created via `(list 1 2 3)` or `'(1 2 3)`.
- **Vectors**: Fixed-length arrays for fast indexing, written as `#(1 2 3)` or `(vector 1 2 3)`.
- **Hash Tables**: Key-value mappings created with `(hash 'a 1 'b 2)`. Can be mutable or immutable.

### Control Flow
Being expression-oriented, control flow structures in Racket return values.
- **if**: The most basic conditional. Must have both a true and a false branch.
  ```racket
  (if (> x 0)
      "Positive"
      "Non-positive")
  ```
- **cond**: Used for multi-way branching (similar to `switch` or `if-else if`). Very idiomatic in Racket.
  ```racket
  (cond
    [(> x 0) 'positive]
    [(< x 0) 'negative]
    [else 'zero])
  ```
- **match**: Powerful pattern matching for destructuring complex data.

### Functions and Methods
Functions are first-class citizens. You can define them using `define` or create anonymous functions using `lambda`.
```racket
;; Named function
(define (greet name)
  (string-append "Hello, " name))

;; Lambda (anonymous function)
(define add (lambda (a b) (+ a b)))
```

Racket supports keyword arguments, optional arguments, and rest arguments, making function APIs highly expressive.
```racket
(define (greet-complex name #:greeting [msg "Hello"])
  (string-append msg ", " name))
```

## Advanced Concepts

### Metaprogramming and Macros
Racket's crown jewel is its macro system. Unlike C-style text-substitution macros, Racket provides hygienic macros (`syntax-rules`, `syntax-case`, `syntax-parse`) that respect lexical scoping and avoid variable capture.
Macros allow developers to extend the syntax of the language, creating new constructs or entirely new DSLs. `syntax-parse` provides advanced error reporting and pattern matching for macros.

```racket
;; A simple macro to execute a block of code multiple times
(define-syntax-rule (repeat n body ...)
  (for ([i (in-range n)])
    body ...))

(repeat 3 (displayln "Hello"))
```

### Typed Racket
Typed Racket is a sibling language (`#lang typed/racket`) that introduces a gradual type system. It allows developers to optionally type-check their programs to catch errors at compile-time. Unlike many gradual type systems, Typed Racket uses occurrence typing (also known as flow typing). This means the type checker is smart enough to narrow down types based on predicates.
If you check `(string? x)`, within the truthy branch of that conditional, `x` is statically known to be a String. Typed Racket modules can seamlessly import and export to untyped Racket modules, inserting run-time contracts at boundaries to guarantee type soundness.

### Language-Oriented Programming (LOP)
Racket elevates LOP by making `#lang` a core language feature. By starting a file with `#lang racket`, you are actually invoking the Racket base language. You can create your own `#lang my-lang`, defining exactly what parser, macros, and runtimes should be used for that file.
This allows a single project to have modules written in completely different syntax trees (like Datalog, Scribble, or a custom state-machine syntax), yet compiled to the same bytecode.

### Concurrency and Parallelism
Racket provides several concurrent paradigms:
- **Threads**: Racket threads are lightweight, scheduled by the Racket runtime (green threads). They are ideal for I/O bound concurrency.
- **Futures**: Provide true hardware parallelism for computationally intensive, purely functional code without side effects.
- **Places**: An actor-model-like parallelism where separate OS threads do not share memory and communicate via message passing (channels). This enables full multi-core utilization for mutable state.

### Memory Management
Racket is garbage-collected. The modern runtime (Racket CS) is built entirely on top of Chez Scheme, which brings an extremely fast, precise, and highly optimized generational garbage collector.

### Functional Features and Tail-Call Optimization (TCO)
Racket fully embraces the functional paradigm:
- Immutable data structures by default.
- Higher-order functions (`map`, `filter`, `foldl`, `foldr`).
- Guaranteed Tail-Call Optimization (TCO). This means you can write recursive functions that loop indefinitely or recurse extremely deeply without blowing up the stack or overflowing. This is a crucial guarantee for functional state machines and iterative processes.

## Ecosystem & Tooling

### Package Manager (`raco`)
`raco` is the Racket command-line tool. It serves as a build tool, package manager, and test runner.
- `raco pkg install <package>`: Installs libraries globally or locally.
- `raco test <file>`: Runs the unit tests embedded in or associated with a file.
- `raco make <file>`: Compiles a file to bytecode ahead-of-time.
- `raco exe`: Compiles your racket program into a standalone executable that you can distribute.

### DrRacket IDE
DrRacket is the pedagogical IDE that ships with Racket. It features:
- Syntax highlighting and intelligent macro steppers.
- Interactive REPL.
- Built-in visual tools for tracing function calls.
- Image rendering directly in the REPL (ideal for teaching and graphics).

### Popular Frameworks and Standard Libraries
- **Scribble**: A programmatic documentation language that is widely used to write Racket's excellent documentation, as well as academic papers and books.
- **Web-Server**: A robust, continuation-based web server. It allows writing web applications in a direct style, as if they were console applications, by suspending and resuming state across HTTP requests via continuations.
- **Pollen**: A framework/DSL for creating web-based books and digital publications.
- **Racket GUI**: A cross-platform GUI toolkit that provides native widgets on Windows, macOS, and Linux out of the box.

## Code Examples

### 1. Hello World & Basic Types
```racket
#lang racket

;; Printing to stdout
(displayln "Hello, World!")

;; Different data types
(define my-string "Racket is cool")
(define my-number 42)
(define my-rational 1/3)
(define my-complex 3+4i)
(define my-boolean #t)
(define my-symbol 'hello)
(define my-list '(1 2 3 4 5))

;; Formatting output
(printf "The list has ~a elements.\n" (length my-list))
```

### 2. Data Structures (Lists, Hashes, Structs)
```racket
#lang racket

;; Lists and basic higher-order functions
(define numbers '(1 2 3 4 5))
(define squared-numbers (map (lambda (x) (* x x)) numbers))
(displayln squared-numbers) ; '(1 4 9 16 25)

;; Folding/Reducing
(define sum (foldl + 0 numbers))
(displayln sum) ; 15

;; Hash tables
(define ages (hash "Alice" 30 "Bob" 25))
(displayln (hash-ref ages "Alice")) ; 30

;; Structs (records)
;; transparent makes the struct printable and its fields accessible
(struct person (name age) #:transparent)
(define charlie (person "Charlie" 40))

(displayln (person-name charlie)) ; "Charlie"
(displayln charlie)               ; #(struct:person "Charlie" 40)
```

### 3. Object-Oriented / Class System
Racket has a fully featured class-based object system, though functional programming is the default paradigm.

```racket
#lang racket
(require racket/class)

;; Define a class 'animal%'
(define animal%
  (class object%
    (super-new) ; initialize superclass
    
    (init-field name)
    
    (define/public (speak)
      (printf "~a makes a noise.\n" name))))

;; Define a subclass 'dog%'
(define dog%
  (class animal%
    (super-new)
    
    (define/override (speak)
      (printf "~a says woof!\n" (get-field name this)))))

(define my-dog (new dog% [name "Fido"]))
(send my-dog speak) ; Fido says woof!
```

### 4. Concurrency (Places and Channels)
Using Racket Places for parallel computation across multiple CPU cores.

```racket
#lang racket

(define (main)
  ;; Create a new place that runs a function
  (define p (place ch
                   ;; Receive a message from the main thread
                   (define msg (place-channel-get ch))
                   ;; Compute something and send the result back
                   (place-channel-put ch (string-append "Processed: " msg))))
  
  ;; Send message to the place via the channel
  (place-channel-put p "Hello from main thread")
  
  ;; Wait for and print the response
  (displayln (place-channel-get p)))

(main)
```

### 5. Web Server and Continuations
A simple web server demonstrating Racket's stateless web framework. Racket's continuations allow you to write web applications as if they were simple terminal loops.

```racket
#lang web-server/insta

;; A simple request handler returning an X-expression (XML/HTML as S-expressions)
(define (start request)
  (response/xexpr
   '(html
     (head (title "My Racket Blog"))
     (body (h1 "Welcome to Racket")
           (p "This is served via the built-in Racket web-server.")
           (a ([href "/about"]) "About page")))))
           
;; To run this, you just execute the script, and DrRacket/racket
;; will spawn a local server and open your web browser.
```

### 6. Pattern Matching
Pattern matching is highly idiomatic in Racket, especially when working with ASTs (Abstract Syntax Trees) or complex nested lists.

```racket
#lang racket

(define (evaluate expr)
  (match expr
    [(? number? n) n]
    [`(+ ,a ,b) (+ (evaluate a) (evaluate b))]
    [`(* ,a ,b) (* (evaluate a) (evaluate b))]
    [_ (error "Unknown expression" expr)]))

(displayln (evaluate '(+ 2 (* 3 4)))) ; 14
```

### 7. Creating a Custom DSL (Language-Oriented Programming)
You can define an entire language by specifying `#lang syntax/module-reader`. This is a tiny macro-based example of a DSL for a simple state machine.

```racket
#lang racket
;; macro-example.rkt
(define-syntax (state-machine stx)
  (syntax-case stx (->)
    [(_ init-state
        [state -> next-state] ...)
     #'(define (run-machine current)
         (cond
           [(equal? current 'state) 
            (displayln (format "Transitioning: ~a -> ~a" 'state 'next-state))
            (run-machine 'next-state)]
           ...
           [else (displayln (format "Halted at: ~a" current))]))]))

(state-machine start
  [start -> middle]
  [middle -> end])

(run-machine 'start)
```

### 8. Network Requests (HTTP Client)
Making basic network requests using the standard library.

```racket
#lang racket
(require net/http-client)
(require json)

;; A function to fetch and parse JSON from a public API
(define (fetch-todo id)
  (define-values (status headers in)
    (http-sendrecv "jsonplaceholder.typicode.com" 
                   (format "/todos/~a" id)
                   #:ssl? #t))
  
  (if (bytes=? status #"HTTP/1.1 200 OK")
      (read-json in)
      (error "Failed to fetch data")))

;; The resulting output will be a Racket hash representing the JSON data
(displayln (fetch-todo 1))
```

## Best Practices

### Idiomatic Patterns
- **Favor Immutability**: While Racket supports mutable variables (`set!`) and mutable data structures (`mcons`, mutable hashes), idiomatic Racket relies on pure functions and immutable data structures whenever possible. Use `for/fold` or recursion for iterative state updates.
- **Use `match`**: The `match` form is vastly superior for destructuring data than manually calling accessors like `car`, `cdr`, or struct getters. It makes code cleaner and less error-prone.
- **Contracts**: Use Racket’s extensive contract system (`define/contract`, `provide/contract`) to enforce pre- and post-conditions on your module boundaries. This acts as a powerful middle ground between dynamic typing and static typing.
- **Modules for Encapsulation**: Everything in Racket should live in a module. Modules ensure proper encapsulation, avoid namespace pollution, and form the basis of the compilation unit.
- **Naming Conventions**: 
  - Predicates usually end with a question mark (e.g., `string?`, `empty?`).
  - Functions with side-effects or mutations end with an exclamation mark (e.g., `set!`, `hash-set!`).
  - Conversion functions often use `->` (e.g., `string->number`, `list->vector`).

### Common Pitfalls
- **Overusing Macros**: Because macros are immensely powerful, beginners often try to solve every problem with them. A good rule of thumb: do not write a macro if a normal function will suffice. Macros should be reserved for controlling evaluation order or abstracting boilerplate syntax.
- **Parentheses Balancing**: In complex Lisp/Scheme code, managing parentheses can be daunting. You must rely on editor support (like DrRacket or Emacs with Paredit) to handle balancing automatically. Do not manually format or count parens.
- **Dynamic Typing in Large Codebases**: As projects grow, the lack of static types can lead to frustrating runtime errors. Adopting `Typed Racket` early for the core business logic components is highly recommended.
- **Assuming O(1) Operations on Lists**: Remember that `list-ref` on a singly linked list is O(N). If you need fast random access, use vectors or hash tables.

### Debugging and Profiling
- **Macro Stepper**: Use DrRacket's macro stepper to expand macros step-by-step. This is an invaluable tool for debugging complex syntax transformations and verifying hygiene.
- **Errortrace**: Require `errortrace` to get better stack traces in dynamic code execution, which can otherwise be tricky due to tail-call optimizations and macro expansions.
- **Profiler**: Use Racket's built-in statistical profiler (`raco test --submodule test` or `raco profile`) to identify bottlenecks rather than guessing where performance issues lie.
