---
tags: [programming-language, functional, lisp, jvm]
category: Functional
status: to-learn
---

# Clojure

**Definition:** Modern Lisp dialect on the JVM that emphasizes immutable data, functional composition, and code-as-data macros.

**Paradigm:** Functional | **Typing:** Dynamic

## Pros
- Powerful macros let developers build embedded DSLs and custom abstractions.
- Immutable data by default reduces accidental shared-state bugs.
- Persistent data structures make updates efficient without mutating old values.
- Full Java interop gives access to the JVM ecosystem without reinventing the wheel.
- REPL-driven development supports very fast feedback loops, significantly boosting developer productivity.
- Core library is concise but highly expressive, handling 90% of data transformation tasks effortlessly.
- Concurrency primitives (atoms, refs, agents) simplify concurrent programming in multi-core environments.
- Strong backwards compatibility means code written a decade ago generally still runs perfectly today.

## Cons
- Parentheses-heavy syntax can discourage new developers coming from C-style languages.
- Persistent data and functional style require a completely different mental model from mainstream Object-Oriented stacks.
- The ecosystem is smaller than Java or JavaScript, so you occasionally have to rely on Java libraries with a Clojure wrapper (or write one yourself).
- Performance tuning sometimes requires understanding underlying JVM behavior, garbage collection, and object allocation patterns.
- Stack traces can be intimidating and deeply nested due to the JVM and functional composition (though tooling has improved this).
- Slow startup time for the JVM can be annoying for small CLI scripts, although technologies like GraalVM Native Image are mitigating this issue.

## Best For
- Teams wanting functional programming rigor with unrestricted JVM ecosystem access.
- Systems where immutable state and REPL-driven iteration are valuable, particularly data-heavy applications.
- Concurrent and multi-threaded data processing systems where safety is critical.
- Startups aiming for rapid iteration while maintaining a solid, reliable foundation.
- Domain-specific languages and meta-programming needs.

## Real Examples
- **Walmart**: Handled massive Black Friday loads using Clojure for its receipt processing systems.
- **Nubank**: The largest independent digital bank outside of Asia uses Clojure extensively (and acquired Cognitect, the company behind Clojure).
- **CircleCI**: Uses Clojure extensively for its highly concurrent backend services and build pipelines.
- **Funding Circle**: Uses Clojure for core financial systems and risk analysis algorithms.
- **Puppet Labs**: Utilized Clojure for its next-generation configuration management architecture (PuppetDB).

## Use Cases
- Backend services needing high reliability, uptime, and concurrency.
- Data processing pipelines, ETL jobs, and transformation engines.
- Web development (often using data-driven frameworks like Ring/Compojure or Pedestal).
- Data science and machine learning (utilizing high-performance libraries like Neanderthal and tech.ml).
- Frontend web development via ClojureScript (using React wrappers like Reagent or Re-frame).

## Extended Syntax & Features

Clojure's syntax is rooted in Lisp (List Processing). Code is written in prefix notation and structured as a series of lists inside parentheses.

### Basic Data Types
- **Scalars**: Integers (`1`), Floats (`1.2`), Strings (`"hello"`), Characters (`\a`), Booleans (`true`, `false`), and Nil (`nil`).
- **Keywords**: Identifiers that evaluate to themselves (`:key`, `:name`). They are very fast to look up and are commonly used as map keys.
- **Symbols**: Identifiers used to refer to values or variables (e.g., `map`, `+`, `my-var`).

### Data Structures
All core data structures in Clojure are immutable, persistent, and highly optimized for read and write performance through structural sharing.
- **Lists**: Linked lists, optimized for sequential access and adding to the front. Evaluated as function calls unless quoted. Syntax: `'(1 2 3)`
- **Vectors**: Indexed, array-like structures. Fast random access and addition to the end. Syntax: `[1 2 3]`
- **Maps**: Key-value pairs, also known as dictionaries or hashes. Fast key lookups. Syntax: `{:name "Alice" :age 30}`
- **Sets**: Unordered collections of unique values, optimized for membership tests. Syntax: `#{1 2 3}`

### Control Flow
Unlike many languages, almost everything in Clojure is an expression that returns a value.
- **`if`**: The basic conditional. `(if condition then-branch else-branch)`
- **`cond`**: Evaluates pairs of conditions and expressions sequentially. Good for multiple branches. `(cond (= x 1) "one" (= x 2) "two" :else "other")`
- **`when`**: Like `if`, but only evaluates if the condition is true and allows multiple expressions (an implicit `do` block).
- **`for`**: A powerful list comprehension engine, not a traditional imperative loop. `(for [x [1 2 3]] (* x x))`
- **`loop`/`recur`**: Used for explicit tail-recursive looping, bypassing the JVM's lack of automatic tail-call optimization.

### Functions and Arity
Functions are first-class citizens. They are created using `defn` (for named functions) or `fn` (for anonymous functions).
Functions can have multiple arities (different behaviors based on the number of arguments).
Anonymous functions can also be written with a shorthand reader macro syntax: `#(inc %)` is equivalent to `(fn [x] (inc x))`.

### Destructuring
Clojure has a powerful destructuring syntax to cleanly bind names to values inside complex data structures in function parameters or `let` bindings.
```clojure
(let [[first-elem second-elem & the-rest] [1 2 3 4 5]]
  the-rest) ; returns (3 4 5)

(let [{:keys [username age email]} {:username "Bob" :age 25 :email "bob@example.com"}]
  (str username " is " age)) ; returns "Bob is 25"
```

## Advanced Concepts

### Immutability & Persistent Data Structures
In Clojure, data structures are immutable. When you seemingly "modify" a collection, you actually receive a new collection with the changes, while the old one remains untouched. Under the hood, Clojure implements these as persistent data structures using bit-partitioned hash tries. This means that instead of deeply copying the entire collection on every change, the new collection shares almost all of its structure with the old one, making updates both memory-efficient and very fast.

### Concurrency Primitives (The Epochal Time Model)
Clojure embraces the reality of multi-core processors and separates the concept of *identity* from *state*. State is immutable, but identities can point to different states over time.
- **Atoms**: For synchronous, uncoordinated state changes. They manage independent identity and state safely. You update an atom using `swap!` (which applies a pure function) or `reset!`.
- **Refs**: For synchronous, coordinated state changes across multiple identities. They use Software Transactional Memory (STM) via the `dosync` block, similar to database transactions, ensuring ACID properties in memory.
- **Agents**: For asynchronous, uncoordinated state changes. Updates are queued and processed on a thread pool using `send` or `send-off`.
- **Vars**: Provide thread-local, dynamic state isolation, managed via the `binding` macro.

### Homoiconicity and Macros
Because Clojure code is literally composed of Clojure data structures (lists, vectors, maps), it is "homoiconic". This means the language syntax is identical to its Abstract Syntax Tree (AST). This property makes it trivial to write programs that write programs—known as macros. Macros execute at compile time, taking raw code as input and transforming it into different code before evaluation. This allows developers to bend the language, creating custom control structures and powerful Domain Specific Languages (DSLs) tailored to their exact problem domain.

### Memory Management and the JVM
Clojure completely delegates memory management and garbage collection to the JVM. While this provides world-class, heavily optimized memory management for free, developers must occasionally be aware of object retention (e.g., holding onto the head of a lazy sequence) which can prevent the garbage collector from reclaiming memory and lead to `OutOfMemoryError`s.

### Java Interop
Since Clojure is hosted on the JVM, calling Java code is seamless and idiomatic. Clojure handles type conversions automatically where possible.
- `(Classname.)` to instantiate an object.
- `(.methodName object args)` to call a method.
- `(.-fieldName object)` to access a field.
- `Classname/staticMethod` to call static methods.
- The `doto` macro allows chaining method calls on a single Java object.

## Ecosystem & Tooling

### Build Tools & Package Managers
- **Leiningen**: The traditional, widely-used build tool for Clojure. Projects are defined declaratively in a `project.clj` file. It handles dependencies, testing, compiling, and running REPLs.
- **Clojure CLI / deps.edn**: The official, modern way to manage dependencies and run tasks. It is more flexible, data-driven, and relies on composing discrete command-line aliases.
- **Shadow-cljs**: The de-facto standard build tool for ClojureScript projects, deeply integrating with the NPM ecosystem.

### Popular Frameworks & Libraries
- **Ring**: The foundational HTTP abstraction for web applications, conceptually similar to Ruby's Rack or Python's WSGI. Web apps are simply pure functions taking a request map and returning a response map.
- **Compojure & Reitit**: Routing libraries built on top of Ring. Reitit is modern and heavily data-driven.
- **Pedestal**: A robust, interceptor-based web framework focused on scalability and async processing.
- **Hiccup**: For generating HTML directly using vectors and keywords instead of string templates.
- **core.async**: A standard library for asynchronous programming using channels, strongly inspired by Go's goroutines and CSP (Communicating Sequential Processes).
- **ClojureScript**: A compiler for Clojure that targets JavaScript, allowing developers to share code across the full stack.

### Development Environment & REPL
The REPL (Read-Eval-Print Loop) is the heart of Clojure development. You don't just run the program; you connect your editor to a running REPL and evaluate code expression by expression.
- **CIDER**: The definitive Clojure development environment for Emacs users.
- **Calva**: A highly popular, feature-rich extension for Visual Studio Code, providing a seamless and beginner-friendly REPL experience.
- **Cursive**: An IntelliJ IDEA plugin that offers excellent structural editing, intelligent code navigation, and refactoring capabilities.

## Code Examples

### 1. Hello World & Basic Math
```clojure
;; The classic Hello World
(println "Hello, World!")

;; Basic arithmetic uses prefix notation (the operator comes first)
;; This natively supports variable arity
(+ 1 2 3)        ; => 6
(* 10 (- 5 2))   ; => 30
(/ 22 7.0)       ; => 3.142857142857143

;; Working with equality
(= 1 1.0)        ; => false (different types)
(== 1 1.0)       ; => true (numeric equivalence)
```

### 2. Working with Data Structures
```clojure
;; Defining a map (dictionary)
(def user {:id 1 :name "Alice" :role :admin})

;; Accessing values (keywords act as functions looking themselves up in maps)
(:name user)     ; => "Alice"
(get user :role) ; => :admin

;; "Modifying" a map - returns a completely new map instantly!
(def updated-user (assoc user :age 30 :name "Alicia"))

;; The original map is entirely unchanged
user             ; => {:id 1, :name "Alice", :role :admin}
updated-user     ; => {:id 1, :name "Alicia", :role :admin, :age 30}

;; Vector operations
(def nums [1 2 3])
(conj nums 4)    ; => [1 2 3 4] (adds to the end for vectors)

;; List operations
(def my-list '(1 2 3))
(conj my-list 4) ; => (4 1 2 3) (adds to the front for lists)
```

### 3. Functional Data Processing
```clojure
(def data
  [{:id 1 :status :active :score 85}
   {:id 2 :status :inactive :score 90}
   {:id 3 :status :active :score 95}
   {:id 4 :status :active :score 70}])

;; Find the average score of active users using standard sequence functions
(defn average-active-score [users]
  (let [active-users (filter #(= (:status %) :active) users)
        scores       (map :score active-users)
        total        (reduce + scores)
        count        (count scores)]
    (if (zero? count)
      0
      (/ total count))))

(average-active-score data) ; => 250/3 or approx 83.33

;; A much more idiomatic approach using the thread-last macro (->>)
;; This pipes the result of one function as the last argument to the next
(defn average-active-score-threaded [users]
  (let [scores (->> users
                    (filter #(= (:status %) :active))
                    (map :score))]
    (if (empty? scores)
      0
      (/ (reduce + scores) (count scores)))))
```

### 4. Concurrency with Atoms
```clojure
;; Define mutable state using an atom
(def app-state (atom {:counter 0 :users []}))

;; Read the state using deref or the @ reader macro
@app-state ; => {:counter 0, :users []}

;; Update the state using swap! which applies a pure function to the current value.
;; If another thread updates the atom simultaneously, swap! automatically retries.
(defn increment-counter! []
  (swap! app-state update :counter inc))

(increment-counter!)
@app-state ; => {:counter 1, :users []}

;; Reset the state entirely (overwrites unconditionally)
(reset! app-state {:counter 0 :users []})
```

### 5. Macros: Creating a Custom Control Flow
```clojure
;; A simple macro that executes the body only if a condition is false.
;; Macros manipulate the code structure (AST) before it is evaluated.
(defmacro unless
  "Evaluates body if condition is false."
  [condition & body]
  `(if (not ~condition)
     (do ~@body)))

;; Usage:
(unless (= 1 2)
  (println "Math is not broken.")
  (println "Everything is fine."))

;; Expands at compile time to exactly:
;; (if (not (= 1 2)) (do (println "Math is not broken.") (println "Everything is fine.")))
```

### 6. Java Interop and Simple Object Interaction
```clojure
;; Using Java's java.util.Date and formatting it
(import '[java.util Date]
        '[java.text SimpleDateFormat])

(defn get-formatted-date []
  (let [now (Date.)
        formatter (SimpleDateFormat. "yyyy-MM-dd HH:mm:ss")]
    (.format formatter now)))

;; Output example: "2023-10-27 15:30:00"

;; Using doto to initialize and mutate a Java object in one go
(import '[java.util ArrayList])

(def my-java-list
  (doto (ArrayList.)
    (.add "Apple")
    (.add "Banana")
    (.add "Cherry")))
```

### 7. Asynchronous Programming with core.async
```clojure
(require '[clojure.core.async :as async :refer [>! <! go chan]])

;; Create a communication channel
(def my-channel (chan))

;; Start a background lightweight process (a go block)
(go
  (println "Waiting for message...")
  ;; <! asynchronously waits to take a value from the channel
  (let [msg (<! my-channel)] 
    (println "Received:" msg)))

;; Send a message to the channel from another go block
;; >! asynchronously puts a value onto the channel
(go
  (>! my-channel "Hello from the other side!"))
```

### 8. Polymorphism with Protocols
```clojure
;; Protocols define a set of methods (an interface)
(defprotocol Shape
  (area [this])
  (perimeter [this]))

;; Records implement protocols and generate underlying Java classes
(defrecord Circle [radius]
  Shape
  (area [this] (* Math/PI radius radius))
  (perimeter [this] (* 2 Math/PI radius)))

(defrecord Rectangle [width height]
  Shape
  (area [this] (* width height))
  (perimeter [this] (* 2 (+ width height))))

;; Instantiate the records
(def c (->Circle 5))
(def r (->Rectangle 4 6))

;; Polymorphic method dispatch without switch statements
(area c)      ; => 78.53981633974483
(perimeter r) ; => 20
```

### 9. Namespaces and Requiring Libraries
```clojure
;; Idiomatic namespace declaration at the top of a file
(ns my-app.core
  (:require [clojure.string :as str]
            [clojure.set :refer [intersection union]]))

(str/upper-case "clojure")       ; => "CLOJURE"
(intersection #{1 2 3} #{2 3 4}) ; => #{2 3}
```

### 10. Spec and Data Validation
```clojure
(require '[clojure.spec.alpha :as s])

;; Define declarative specifications for data shapes
(s/def ::name string?)
(s/def ::age pos-int?)
(s/def ::person (s/keys :req [::name ::age]))

;; Validate data against the spec at runtime
(s/valid? ::person {::name "Bob" ::age 30})   ; => true
(s/valid? ::person {::name "Alice" ::age -5}) ; => false

;; Explain exactly why data is invalid
(s/explain ::person {::name "Alice" ::age -5})
;; stdout: -5 - failed: pos-int? in: [:age] at: [:age] spec: :my-app.core/age
```

## Best Practices

### Embrace Immutability and Pure Functions
Always prefer pure functions and immutable data structures. Pure functions depend only on their inputs and have no side effects, making them trivial to test and reason about. Avoid using Atoms or mutable state unless absolutely necessary for performance or coordinating explicit concurrent operations. When dealing with state, push the side effects to the extreme boundaries of your application (e.g., right before writing to a database or responding to an HTTP request).

### Leverage the REPL-Driven Workflow
Clojure development is heavily centered around the REPL (Read-Eval-Print Loop). Don't just write a bunch of code in a file and run the whole program. Instead, write a tiny function, evaluate it directly in your editor's REPL, test it immediately against real data, and iterate. This drastically reduces the feedback loop, eliminates much of the need for mock-heavy unit tests, and builds deep confidence in your code as you write it.

### Threading Macros (`->`, `->>`)
When processing data through multiple transformations, deeply nested function calls quickly become unreadable (the "Lisp parenthesis pyramid").
Use threading macros to un-nest them and read sequentially from top to bottom.
- `->` (thread-first macro) is usually for operating on maps or single entities, passing the result as the *first* argument to the next function.
- `->>` (thread-last macro) is typically for sequence operations (like `map`, `filter`, `reduce`), passing the result as the *last* argument.

### Keep Functions Small and Composable
Write functions that do exactly one thing and return a predictable value. Compose these small functions into larger, more complex pipelines. This Unix-philosophy approach to programming makes your Clojure code highly testable, extremely reusable, and easy to refactor.

### Use Namespaces Effectively
Organize your code logically into namespaces. Always use `:require` with `:as` aliases (e.g., `[clojure.string :as str]`) instead of `:use` or heavy `:refer :all`. This prevents namespace pollution and makes the origin of every function crystal clear to any developer reading the code, dramatically improving maintainability.

### Master Destructuring
Use destructuring to concisely bind variables directly from complex nested data structures instead of manually extracting them with functions like `get`, `first`, or `nth`. Destructuring makes your code significantly cleaner, more declarative, and explicitly documents the shape of the data a function expects.

### Understand Sequence Laziness and Realization
Many standard sequence operations in Clojure (like `map` and `filter`) return lazy sequences. This is incredibly powerful for handling infinite streams or massive datasets efficiently. However, beware of "holding onto the head" of a lazy sequence unnecessarily, which can consume massive amounts of memory and cause `OutOfMemoryError`s. Furthermore, if you need side effects to happen immediately (like writing to a file), mapping over a lazy sequence won't execute them until the sequence is actually consumed. Use `doall`, `dorun`, or `doseq` when you specifically require side effects.

### Prefer Protocols for Polymorphism
When you require polymorphic dispatch (functions that behave differently depending on the type of data), prefer Clojure Protocols over Multimethods for raw performance. Reserve Multimethods for situations requiring complex, open-ended dispatch logic (like dispatching on multiple values or arbitrary attributes) which protocols cannot handle. Completely avoid deep `cond` statements checking types manually.

### Documentation and Spec
Document your functions using docstrings directly after the function name: `(defn my-func "Does cool things." [x] ...)`. Keep comments informative about the *why* (business logic constraints, weird bug workarounds), as idiomatic Clojure is usually clean enough to naturally explain the *how*. Furthermore, adopt `clojure.spec` to document and validate the exact shapes of your data flowing through critical system boundaries.
