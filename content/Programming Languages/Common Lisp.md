---
tags: [programming-language, functional, lisp, ai]
category: Functional
status: to-learn
---

# Common Lisp

**Definition:** Common Lisp is a mature, highly standardized, full-featured Lisp dialect. It combines powerful metaprogramming capabilities, a rich object system (CLOS), and an extensive standard library. Born out of the need to unify various Lisp dialects in the 1980s, Common Lisp has maintained a strong presence in symbolic computing, AI research, and complex system development. It is characterized by its dynamic nature, homoiconicity (code is data), and its ability to be iteratively developed within a live image.

**Paradigm:** Multi-paradigm (Functional, Object-Oriented, Procedural, Metaprogramming) | **Typing:** Dynamic, Strong (with optional static typing declarations)

## Pros
- **Extremely Flexible Macros:** The Common Lisp macro system allows developers to extend the language syntax and semantics, making it highly effective for creating Domain-Specific Languages (DSLs) and advanced metaprogramming.
- **Rich Standard Library:** The ANSI standard (X3.226-1994) includes a vast array of built-in data structures, functions, and utilities, reducing reliance on third-party libraries for core functionality.
- **Interactive Development:** The REPL (Read-Eval-Print Loop) is incredibly powerful. You can redefine functions, classes, and variables on the fly without restarting the application, leading to a highly iterative workflow.
- **Condition System:** A sophisticated error-handling mechanism that allows recovering from errors without unwinding the call stack, enabling interactive debugging and robust fault tolerance.
- **Object System (CLOS):** The Common Lisp Object System supports multiple inheritance, generic functions, and multiple dispatch, making it one of the most advanced object-oriented systems available.
- **Performance:** High-performance implementations (like SBCL) compile directly to native machine code, rivaling C and C++ in execution speed when properly optimized and type-annotated.
- **Multiple Implementations:** A variety of open-source (SBCL, CCL, ECL) and commercial (Allegro CL, LispWorks) implementations exist to suit different needs.

## Cons
- **Niche Ecosystem:** While capable, the modern ecosystem and third-party library availability are smaller compared to mainstream languages like Python, Java, or JavaScript.
- **Syntax Barrier:** The extensive use of parentheses (S-expressions) can be intimidating or visually cluttered to developers accustomed to C-style syntax (often jokingly referred to as "Lots of Irritating Silly Parentheses").
- **Historical Baggage:** Due to its long history, some parts of the standard library have naming conventions or behaviors that reflect older computing paradigms, which can seem idiosyncratic today.
- **Hiring and Adoption:** Production adoption in the mainstream industry is relatively low, meaning that finding experienced Common Lisp developers or finding jobs primarily using Common Lisp can be challenging.
- **Implementation Divergence:** While the ANSI standard ensures a baseline, different implementations often provide their own extensions for features like multi-threading or FFI, leading to potential portability issues.

## Best For
- **Symbolic AI and Computation:** Rule-based systems, expert systems, theorem provers, and computer algebra systems.
- **Rapid Prototyping:** Extremely fast iteration cycles due to the interactive REPL and late binding.
- **Language Design and DSLs:** Implementing new programming languages, compilers, or highly specialized business logic engines.
- **Complex, Long-Running Systems:** Applications that require hot-swapping code without downtime (e.g., aerospace, telecommunications).

## Real Examples
- **Crash Bandicoot:** The original PlayStation game was heavily developed using GOAL (Game Oriented Assembly Lisp), a dialect of Lisp closely related to Common Lisp, enabling rapid development and optimization.
- **AutoCAD (AutoLISP):** While technically a separate dialect, AutoLISP's success in CAD scripting heavily mirrors Common Lisp's utility in extending applications.
- **Orbitz:** The original travel search engine was written in Common Lisp to handle complex, heavily constrained route-finding algorithms efficiently.
- **ITA Software (now Google Flights):** Their QPX pricing system was originally developed in Common Lisp due to its ability to handle immense complexity and search spaces.
- **Grammarly:** Used Common Lisp in its early backend for natural language processing and grammar checking before eventually migrating.
- **NASA (Deep Space 1):** The Remote Agent software used Common Lisp, famously allowing engineers to debug and fix code remotely in space using the REPL.

## Use Cases
- Symbolic Artificial Intelligence and machine learning algorithms.
- DSL creation for specialized domains like finance, linguistics, or engineering.
- Advanced macro-based tooling and code generators.
- Web development using frameworks like Caveman2 or Hunchentoot.
- Algorithmic trading and quantitative finance systems.

---

## Extended Syntax & Features

Common Lisp syntax is based on **S-expressions** (symbolic expressions). Everything is a list, and code is represented using the same data structures as the data itself (homoiconicity). This is the foundation of Lisp's macro system, as writing macros simply involves manipulating lists.

### Basic Data Types
- **Numbers:** Integers (bignums of arbitrary size, handled transparently), Ratios (e.g., `1/3`), Floats (single, double, short, long), and Complex numbers.
- **Characters and Strings:** `#\A` represents a character. `"Hello"` is a string. Strings are essentially arrays of characters.
- **Symbols:** Interned identifiers used for naming variables and functions. Examples: `foo`, `my-variable`. Keywords are a special type of symbol that evaluate to themselves and are prefixed with a colon: `:my-keyword`.
- **Booleans:** `t` represents true, and `nil` represents false (and is also the empty list `()`).
- **Lists:** The fundamental data structure, created using the `list` function or by quoting data. `'(1 2 3)` is a list of three integers. Behind the scenes, lists are built from "cons cells".
- **Arrays and Hash Tables:** Fast access data structures. Hash tables are highly optimized and support different test functions for key equality.

### Control Flow
Common Lisp provides traditional procedural control flow as well as functional equivalents, often implemented as macros.

- **Conditionals:**
  - `if`: The standard conditional. `(if condition then-form else-form)`
  - `when`: Evaluates the body if the condition is true, returning `nil` otherwise. `(when condition (do-this) (do-that))`
  - `unless`: Evaluates the body if the condition is false.
  - `cond`: Equivalent to switch/case or multiple if-else statements, highly readable for complex logic.
  ```lisp
  (cond ((< x 0) 'negative)
        ((> x 0) 'positive)
        (t 'zero))
  ```

- **Looping:**
  - `loop`: A powerful and complex domain-specific language within Lisp for iteration. It can map, filter, accumulate, and control multiple variables at once.
  ```lisp
  (loop for i from 1 to 10
        when (evenp i) collect i) ; Returns (2 4 6 8 10)
  ```
  - `dotimes`, `dolist`: Simpler, built-in macros for iterating over numeric ranges or lists respectively.

### Functions and Variables
- **Global Variables:** Defined with `defvar` (only sets if unbound) or `defparameter` (always sets). By convention, they are enclosed in asterisks (earmuffs).
  ```lisp
  (defparameter *global-count* 0)
  ```
- **Local Variables:** Defined using `let` (parallel binding) or `let*` (sequential binding).
  ```lisp
  (let ((x 10)
        (y 20))
    (+ x y))
  ```
- **Functions:** Defined with `defun`. They can have optional, keyword, and rest arguments.
  ```lisp
  (defun greet (name &key (greeting "Hello") (punctuation "!"))
    "Greets a user." ; Docstring
    (format t "~a, ~a~a~%" greeting name punctuation))
  ```
- **Anonymous Functions:** Created with `lambda`, which are closures that capture their lexical environment.
  ```lisp
  (lambda (x) (* x x))
  ```

---

## Advanced Concepts

### The Macro System
Unlike C/C++ text-replacement macros, Common Lisp macros are actual Lisp programs that manipulate Lisp code (represented as lists) during compile time. This allows for profound language extension. When you write a macro, you are writing a function that takes un-evaluated source code, transforms it, and returns new source code to be compiled. This allows you to build custom control structures or entirely new sub-languages.

```lisp
(defmacro when-let ((var test) &body body)
  "Binds VAR to the result of TEST. If TEST is true, evaluates BODY."
  `(let ((,var ,test))
     (when ,var
       ,@body)))
```

### The Common Lisp Object System (CLOS)
CLOS is a highly dynamic object system characterized by its flexibility compared to C++ or Java object models:
- **Generic Functions:** Unlike traditional OOP where methods belong to classes, in CLOS, generic functions are standalone entities. The implementation executed depends on the types of *all* arguments (Multiple Dispatch), not just the first one (`this` or `self`).
- **Multiple Inheritance:** Classes can inherit from multiple superclasses, and CLOS provides a sophisticated mechanism for resolving conflicts via a deterministic class precedence list.
- **Method Combinations:** You can define `:before`, `:after`, and `:around` methods to hook into the execution of generic functions, providing powerful aspect-oriented programming capabilities built right in.

### The Condition System
Instead of a simple try/catch mechanism that unwinds the stack immediately, Common Lisp separates the act of signaling an error from handling it. The `signal`, `error`, and `cerror` functions raise conditions. `handler-case` acts like a traditional try/catch, but `handler-bind` combined with `restart-case` allows handling an error *before* the stack is unwound. This means you can write handlers that inspect the error, execute a "restart", and resume computation from the exact point of failure, which is invaluable for long-running servers or interactive debugging.

### Interactive Development (Image-Based Programming)
Common Lisp is typically developed inside a running "image". The entire state of the program, including compiled code, variables, threads, and open files, is kept in memory. The developer connects to this running image via an editor (like Emacs with SLIME or SLY) and compiles or evaluates functions individually. When an error occurs, the REPL opens at the point of failure, allowing you to redefine the buggy function, apply a restart, and continue the execution without losing the application's state.

---

## Ecosystem & Tooling

While older, the Common Lisp ecosystem has standardized on a few key tools that modern developers rely on, providing a robust environment for application development.

### Implementations
- **SBCL (Steel Bank Common Lisp):** The most popular high-performance compiler. It compiles to highly optimized native machine code and features excellent type inference and a strict compiler that catches many errors at compile-time.
- **CCL (Clozure Common Lisp):** Known for incredibly fast compilation times, a small memory footprint, and excellent native threading support. Great for development and macOS deployment.
- **ECL (Embeddable Common Lisp):** Compiles Lisp to C code, making it highly portable across different architectures and easy to embed within larger C/C++ applications as a scripting layer.
- **ABCL (Armed Bear Common Lisp):** Runs on the JVM, allowing seamless integration with Java libraries and deployment in enterprise environments.

### Package Management & Build Tools
- **ASDF (Another System Definition Facility):** The de facto standard for defining how Lisp source files are organized, compiled, and loaded. It handles dependencies between different Lisp files and external libraries.
- **Quicklisp:** The standard package manager for Common Lisp. It provides a central repository (similar to pip or npm) of libraries that can be easily downloaded and loaded with `(ql:quickload "package-name")`.
- **Roswell:** An environment setup utility, installation manager, and scripting wrapper for Common Lisp, making it easier to run Lisp programs as standalone command-line scripts.

### Popular Frameworks and Libraries
- **Web Development:** Hunchentoot (a robust, production-ready web server), Caveman2 (a modern web framework similar to Sinatra or Flask), Clack (a web server abstraction layer).
- **GUI:** McCLIM (a free implementation of the Common Lisp Interface Manager, an advanced GUI toolkit), Ltk (Tk bindings for quick and easy UIs).
- **Database:** Postmodern (a highly featured PostgreSQL library), CL-DBI (a database independent interface providing a unified API for various SQL engines).
- **Parsing:** Esrap (a Packrat parser generator for Parsing Expression Grammars), cl-ppcre (a fast, Perl-compatible regular expression engine).
- **Concurrency:** Bordeaux-threads (a portable threading abstraction over various implementation-specific thread APIs), lparallel (a powerful parallel programming library for map/reduce and futures).

---

## Code Examples

### 1. Hello World and Basic Arithmetic
```lisp
;; The simplest Hello World
(format t "Hello, World!~%")

;; Basic arithmetic operations
(defun math-demo ()
  (let ((sum (+ 1 2 3 4))
        (product (* 5 6))
        (quotient (/ 10 3)) ; Returns a precise rational number: 10/3
        (float-quotient (/ 10.0 3.0)))
    (format t "Sum: ~a~%Product: ~a~%Quotient: ~a~%Float: ~a~%" 
            sum product quotient float-quotient)))
```

### 2. Working with Lists and Higher-Order Functions
Lisp excels at manipulating lists. Here is an example of mapping, filtering, and reducing using standard functional programming techniques.

```lisp
(defun process-data (data-list)
  "Multiplies even numbers by 10 and sums the results."
  (let* ((evens (remove-if-not #'evenp data-list))    ; Filter: keep only evens
         (scaled (mapcar (lambda (x) (* x 10)) evens)) ; Map: scale by 10
         (total (reduce #'+ scaled)))                  ; Reduce: sum them up
    total))

(process-data '(1 2 3 4 5 6)) ; Returns: (+ 20 40 60) => 120
```

### 3. Object-Oriented Programming (CLOS)
Defining classes, generic functions, and methods using the Common Lisp Object System. Notice how the method belongs to the generic function `area`, not the classes themselves.

```lisp
;; Define a base class
(defclass shape ()
  ((color :initarg :color
          :initform 'black
          :accessor shape-color)))

;; Define a subclass
(defclass circle (shape)
  ((radius :initarg :radius
           :accessor circle-radius)))

;; Define a subclass
(defclass rectangle (shape)
  ((width :initarg :width
          :accessor rectangle-width)
   (height :initarg :height
           :accessor rectangle-height)))

;; Define a generic function
(defgeneric area (shape)
  (:documentation "Calculates the area of a shape."))

;; Method for circle
(defmethod area ((c circle))
  (* pi (expt (circle-radius c) 2)))

;; Method for rectangle
(defmethod area ((r rectangle))
  (* (rectangle-width r) (rectangle-height r)))

;; Create instances and calculate area
(let ((my-circ (make-instance 'circle :radius 5 :color 'red))
      (my-rect (make-instance 'rectangle :width 10 :height 20)))
  (format t "Circle area: ~a~%" (area my-circ))
  (format t "Rectangle area: ~a~%" (area my-rect)))
```

### 4. Advanced Metaprogramming (Macros)
A macro that creates a simple `while` loop, which doesn't exist out-of-the-box in basic Lisp (though the `loop` macro handles it easily). This demonstrates how code can be generated at compile-time.

```lisp
(defmacro while (condition &body body)
  "Executes BODY repeatedly as long as CONDITION evaluates to true."
  (let ((loop-block (gensym "LOOP-BLOCK-"))) ; Avoid variable capture
    `(block ,loop-block
       (tagbody
        start
          (unless ,condition
            (return-from ,loop-block nil))
          ,@body
          (go start)))))

;; Using the custom macro
(let ((counter 0))
  (while (< counter 5)
    (format t "Counter is ~a~%" counter)
    (incf counter)))
```

### 5. The Condition System (Error Handling)
Demonstrating how to handle errors interactively or programmatically without unwinding the stack, using Restarts.

```lisp
(define-condition network-error (error)
  ((message :initarg :message :reader error-message))
  (:report (lambda (condition stream)
             (format stream "Network error occurred: ~a" (error-message condition)))))

(defun fetch-data (url)
  "Simulates fetching data, potentially failing."
  (let ((success (random 2))) ; 50% chance to fail
    (if (= success 0)
        ;; Signal an error, but provide ways to recover (restarts)
        (restart-case (error 'network-error :message (format nil "Failed to connect to ~a" url))
          (retry ()
            :report "Try connecting again."
            (fetch-data url))
          (use-fallback-data ()
            :report "Return default fallback data."
            '(:data "Fallback Data")))
        '(:data "Real Data"))))

(defun process-request ()
  "Handles the request and binds restarts to recover automatically."
  (handler-bind ((network-error #'(lambda (c)
                                    (format t "Caught error: ~a~%" c)
                                    ;; Automatically choose to use the fallback restart
                                    ;; This resolves the error without unwinding the stack!
                                    (invoke-restart 'use-fallback-data))))
    (fetch-data "http://example.com/api")))

(process-request)
```

### 6. Concurrent Programming with Bordeaux-Threads
Using the standard compatibility layer to spawn threads and perform work in parallel.

```lisp
;; Note: Requires (ql:quickload "bordeaux-threads")
(defun threaded-worker (id)
  (format t "Thread ~a starting.~%" id)
  (sleep (+ 1 (random 3))) ; Simulate some blocking work
  (format t "Thread ~a finished.~%" id))

(defun run-threads ()
  (let ((threads (loop for i from 1 to 5
                       collect (bt:make-thread (lambda () (threaded-worker i))
                                               :name (format nil "worker-~a" i)))))
    ;; Wait for all threads to finish their execution
    (dolist (thread threads)
      (bt:join-thread thread))
    (format t "All workers completed.~%")))
```

### 7. Reading and Writing Files
Basic file I/O operations in Common Lisp, demonstrating the use of `with-open-file` which safely ensures file streams are closed even if errors occur.

```lisp
(defun write-log (filename message)
  "Appends a message to the specified log file."
  (with-open-file (stream filename
                          :direction :output
                          :if-exists :append
                          :if-does-not-exist :create)
    (format stream "[~a] ~a~%" (get-universal-time) message)))

(defun read-log (filename)
  "Reads and prints all lines from a log file."
  (with-open-file (stream filename :direction :input)
    (loop for line = (read-line stream nil 'eof)
          until (eq line 'eof)
          do (format t "Line: ~a~%" line))))
```

### 8. Making HTTP Requests (with Dexador)
Dexador is a popular, high-performance HTTP client for Common Lisp.

```lisp
;; Note: Requires (ql:quickload "dexador") and (ql:quickload "yason") for JSON
(defun fetch-json (url)
  "Fetches a JSON payload from the provided URL and parses it."
  (handler-case
      (let* ((response (dex:get url))
             (parsed (yason:parse response)))
        parsed)
    (dex:http-request-failed (e)
      (format t "HTTP Request failed with status ~a~%" (dex:response-status e))
      nil)))

;; Example usage to fetch data from an API:
;; (fetch-json "https://jsonplaceholder.typicode.com/todos/1")
```

### 9. Project Definition with ASDF
ASDF is how Common Lisp projects define their structure, dependencies, and build instructions. This is typically placed in a `.asd` file.

```lisp
;; my-project.asd
(defsystem "my-project"
  :description "An example project demonstrating ASDF."
  :version "0.1.0"
  :author "Jane Doe <jane.doe@example.com>"
  :license "MIT"
  :depends-on ("dexador" "yason" "bordeaux-threads")
  :components ((:module "src"
                :components
                ((:file "packages")
                 (:file "utils" :depends-on ("packages"))
                 (:file "main" :depends-on ("utils"))))))
```

---

## Best Practices

1. **Use `let` over Mutating State:** Always try to bind variables immutably within a lexical scope using `let` or `let*`. Avoid mutating global state wherever possible to maintain a more functional style, which is less prone to side effects.
2. **Master the REPL:** Don't write Common Lisp like a batch script (write code -> compile -> run -> debug). Start your Lisp image, connect your editor (e.g., Emacs + SLIME, Vim + Vlime, or VSCode + Alive), and evaluate functions one by one. Test your code interactively as you write it.
3. **Use `defparameter` for Re-evaluable Globals:** When defining global variables that you might want to reload or change during interactive development, use `defparameter`. `defvar` will only set the value if it is not already bound, which can be confusing during REPL sessions. Use the `*earmuffs*` convention for global variables (e.g., `*config*`).
4. **Leverage Quicklisp:** Do not attempt to manage dependencies manually. Use Quicklisp and ASDF for project definition and dependency loading. They are the standard and make sharing code significantly easier.
5. **Beware of Variable Capture in Macros:** When writing macros, always use `gensym` to generate unique variable names for local bindings within the macro expansion. This prevents accidental clashes with variables in the user's code, a problem known as variable capture.
6. **Prefer High-Order Functions over Manual Loops:** While `loop` is incredibly powerful, functions like `mapcar`, `reduce`, `remove-if-not`, and `find-if` often lead to cleaner, more readable functional code, especially for simple transformations.
7. **Document with Docstrings:** Always include docstrings in your `defun`, `defmacro`, `defvar`, and `defclass` forms. The REPL and IDE tools can display these on demand, greatly improving the developer experience.
8. **Optimize with Type Declarations:** Common Lisp is dynamically typed, but high-performance compilers like SBCL can utilize type declarations `(declare (type fixnum x))` to generate heavily optimized machine code. However, follow the rule of "make it work, then make it fast"—apply these only after profiling indicates a bottleneck.
9. **Use Keywords Wisely:** Keyword symbols (e.g., `:my-keyword`) are great for named arguments and flags, but avoid using them as general strings or data payload keys, as they are interned in the global keyword package and can bloat memory if generated dynamically in large numbers.
10. **Embrace CLOS:** Don't try to reinvent object-oriented patterns manually using structs and closures. CLOS is one of the most powerful object systems ever designed; take the time to learn generic functions, method combinations, and standard method dispatch.
