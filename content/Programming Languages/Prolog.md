---
tags: [programming-language, logic, ai, declarative]
category: Legacy/Enterprise
status: to-learn
---

# Prolog

**Definition:** Logic programming language where you declare facts and rules and the inference engine searches for solutions through unification and backtracking.

**Paradigm:** Logic/declarative | **Typing:** Dynamic

## Pros
- Excellent for rule-based reasoning, symbolic AI, and complex search problems.
- Natural fit for expert systems, natural language parsing, and constraint logic.
- Unification and backtracking make relational queries inherently declarative.
- Good when the problem domain is closer to “what is true?” rather than “what exact steps do I execute?”.
- Pattern matching is deeply embedded in the language semantics, making data destructuring trivial.
- Meta-programming is incredibly natural because Prolog code is written as Prolog data structures (Homoiconicity).
- Extremely concise syntax for defining and composing complex logical relationships.
- Inherent support for relational data representations, making it a powerful alternative to SQL for graph-like data.
- Modern implementations (like SWI-Prolog) include robust engines, multi-threading capabilities, HTTP servers, and database integration.
- Encourages rigorous thinking about problem spaces in terms of relations and constraints.

## Cons
- The execution model (depth-first search with chronological backtracking) is highly unfamiliar to most imperative/object-oriented programmers.
- Backtracking can cause the search space to explode exponentially if rules are not ordered or constrained carefully, leading to performance bottlenecks or infinite loops.
- General application development (like building GUIs or scripting operating system tasks) is awkward compared with mainstream languages like Python, Go, or Java.
- The ecosystem, library availability, and hiring pool are considerably small.
- Poor raw performance on heavy numerical or matrix computations compared to C, Rust, Fortran, or even vectorized Python.
- Integration directly with modern software architectures and microservices requires bridging logic systems with stateful environments, which can be non-trivial.
- Abstracting state mutation requires side effects (using `assert` or `retract`), or manually passing state around in parameters (accumulators), which is cumbersome and verbose.

## Best For
- Expert systems, diagnostic rule engines, and automated constraint solving.
- Symbolic AI, classic natural language processing (NLP), and parsing algorithms.
- Automated theorem proving, logic validation, and formal verification.
- Complex database query systems (like Datalog extensions).
- Educational settings that teach formal logic, inference mechanisms, and alternative programming paradigms.
- Scheduling systems, logistics, and resource allocation problems where constraints must be met.

## Real Examples
- Early expert systems and symbolic AI research used Prolog heavily (e.g., MYCIN for medical diagnosis and treatment).
- IBM's Watson QA system heavily used Prolog in its natural language processing pipeline to parse questions and infer meaning.
- Sicstus Prolog has been utilized heavily in enterprise logistics, scheduling algorithms, and bioinformatics applications.
- Clarissa, a fully voice-operated procedure reader used on the International Space Station, was built using Prolog.
- The Erlang programming language was initially prototyped in Prolog, and its syntax and pattern-matching semantics are heavily influenced by Prolog.
- Java's JVM bytecode verification, type checking, and stack map generation in early versions of compilers relied on logic constraints conceptually identical to Prolog.
- Windows NT used a Prolog-like engine for parsing network configuration rules.

## Use Cases
- Building rule-based reasoning engines and dynamic query systems over complex knowledge graphs.
- Constraint logic programming (CLP) for solving optimization and scheduling puzzles.
- Academic AI research, knowledge representation, and computational linguistics.
- Natural Language Processing via Definite Clause Grammars (DCG) for parsing text into syntax trees.
- Automated reasoning, safety verification of hardware designs and software protocols.

## Extended Syntax & Features

Prolog (Programming in Logic) stands apart from almost all mainstream programming languages. Instead of providing a sequence of instructions to the computer, you describe the logical structure of the problem domain. A Prolog program is essentially a knowledge base consisting of **facts** and **rules** (collectively referred to as **clauses**). 

When you run a Prolog program, you don't execute a `main` function. Instead, you interact with an inference engine by issuing **queries** (or goals) to a prompt, and the engine attempts to prove them true based on the provided knowledge base.

### Basic Data Types (Terms)

Everything in Prolog is represented as a **term**. There are four fundamental classifications of terms:

1.  **Atoms**: General-purpose symbolic names with no inherent value other than themselves. They typically begin with a lowercase letter or are enclosed in single quotes if they contain spaces or special characters.
    *   Examples: `alice`, `bob`, `camelCase`, `'A string as an atom'`, `+`, `:-`, `[]`
2.  **Numbers**: Integers and floating-point numbers.
    *   Examples: `42`, `-13`, `3.14159`, `6.02e23`
3.  **Variables**: Denoted by a string starting with an uppercase letter or an underscore `_`. Unlike imperative variables which hold a mutable value in memory, Prolog variables are placeholders for terms that have not yet been bound (instantiated) through the process of unification. Once a variable is bound within a specific logical scope, it cannot be mutated. The standalone underscore `_` is an anonymous variable, useful when you don't care about the value.
    *   Examples: `X`, `Result`, `_Name`, `_`, `Tail`
4.  **Compound Terms**: Constructed from a **functor** (which must be an atom) and a sequence of arguments (which are themselves terms) enclosed in parentheses. The number of arguments is called the **arity** of the term. The combination of functor and arity is often written as `functor/arity`.
    *   Examples: `parent(alice, bob)` (arity 2), `tree(node(leaf(1), leaf(2)), leaf(3))` (arity 2).
    *   Lists and even the source code of rules themselves are internally represented as compound terms.

### Facts, Rules, and Clauses

*   **Facts**: Unconditionally true statements about the world. They are simply compound terms followed by a period `.`.
    ```prolog
    likes(john, pizza).       % "John likes pizza" is true.
    human(socrates).          % "Socrates is human" is true.
    capital(france, paris).   % "Paris is the capital of France" is true.
    ```

*   **Rules**: Conditionally true statements. They consist of a **head** and a **body**, separated by the neck operator `:-` (which reads as "if").
    ```prolog
    mortal(X) :- human(X).
    % "X is mortal IF X is human."
    ```
    In a rule body, logical operations are represented by punctuation:
    *   `,` (comma) denotes logical **AND** (conjunction). All sub-goals must succeed.
    *   `;` (semicolon) denotes logical **OR** (disjunction). At least one sub-goal must succeed.

### Control Flow (SLD Resolution and Backtracking)

Prolog has no loops (`for`, `while`) or branching statements (`if`, `switch`) in the traditional sense. Execution is entirely driven by **SLD resolution** and **chronological backtracking**.

When the inference engine is given a query, it searches top-to-bottom through its knowledge base for a matching clause.
1.  If it finds a matching fact, the query succeeds.
2.  If it finds a matching rule, it unifies the head of the rule with the query, binds the variables, and then recursively attempts to prove all the goals in the body of the rule from left to right.
3.  If any sub-goal fails, Prolog **backtracks**: it pauses its current path, returns to the last "choice point" (a place where multiple clauses could have matched), undoes any variable bindings made since that choice point, and tries the next available alternative.

This automatic backtracking allows Prolog to perform exhaustive depth-first searches for solutions seamlessly.

### Lists and Recursion

Lists are fundamental structural elements in Prolog. They are defined recursively: a list is either the empty list `[]`, or it is a compound term comprising a **head** (the first element) and a **tail** (a list containing all remaining elements).

The syntax `[Head|Tail]` is heavily used for both constructing and deconstructing lists via pattern matching.

```prolog
% Assigning a list to a variable
MyList = [1, 2, 3, 4].

% Deconstructing a list via unification
[H|T] = [a, b, c]. 
% H unifies with 'a', T unifies with ['b', 'c']

% Extracting multiple elements
[First, Second | Rest] = [10, 20, 30, 40].
% First = 10, Second = 20, Rest = [30, 40]
```
Because of the lack of loops, iterating over a list is universally done through recursion, processing the head and recursively calling the predicate on the tail.

## Advanced Concepts

### Unification

Unification is the foundational operational mechanism of Prolog. It is the process of making two terms logically identical by finding a substitution for their variables. It is explicitly invoked using the `=` operator, but it implicitly happens every time a query matches a clause head.

*   `a = a` succeeds.
*   `a = b` fails (atoms do not match).
*   `X = a` succeeds, binding the variable `X` to the atom `a`.
*   `parent(alice, Y) = parent(X, bob)` succeeds, binding `X = alice` and `Y = bob`.
*   `f(X, a) = f(b, Y)` succeeds, binding `X = b` and `Y = a`.

Unlike variable assignment in Python or C, unification is bidirectional. `X = 5` and `5 = X` are logically identical and both will bind `X` to `5`.

### The Cut (`!`)

The cut is a controversial but essential control operator in Prolog. When evaluated as a goal, the cut always succeeds. However, as a side-effect, it commits the Prolog engine to all choices made since the parent goal was invoked. It effectively prunes branches of the search tree, preventing backtracking past the cut.

*   **Green Cut**: Does not alter the declarative meaning (the logical truth) of the program. It only optimizes execution by telling the engine to avoid useless backtracking when an answer is already known to be deterministic.
*   **Red Cut**: Changes the logical meaning of the program. Removing a red cut would cause the program to yield different (and often incorrect) results. Overuse of red cuts makes code highly procedural and difficult to debug.

```prolog
% Example using cut for mutually exclusive conditions
% max(X, Y, MaxValue)
max(X, Y, X) :- X >= Y, !. % If X is greater/equal, X is the max. STOP searching.
max(X, Y, Y) :- X < Y.     % Otherwise, Y is the max.
```
Without the cut in the first clause, querying `max(5, 3, Z)` finds `Z=5`. If the user forces a backtrack to seek more answers, Prolog would blindly check the second rule, evaluate `5 < 3`, fail, and then terminate. The cut simply optimizes this by stating: "Once you prove `X >= Y`, commit to this clause; do not look for alternatives."

### Definite Clause Grammars (DCG)

Parsing is such a common use case for Prolog that it includes built-in syntactic sugar for it called Definite Clause Grammars. DCGs hide the cumbersome passing of "difference lists" (state variables) and allow you to define context-free grammars cleanly.

```prolog
% A simple DCG for a subset of English
% The '-->' operator defines a grammar rule.
sentence --> noun_phrase, verb_phrase.
noun_phrase --> article, noun.
verb_phrase --> verb, noun_phrase.
verb_phrase --> verb.

% Terminals are enclosed in lists.
article --> [the] ; [a].
noun --> [cat] ; [dog] ; [mat].
verb --> [chases] ; [sits].

% Query: ?- phrase(sentence, [the, cat, chases, a, dog]).
% Result: true.
```

### Higher-Order Predicates & Metaprogramming

Because Prolog programs are represented as standard Prolog terms (Homoiconicity), it is trivial to write programs that inspect, manipulate, or generate other programs.

*   `call(Goal)`: Dynamically executes a term as a goal at runtime.
*   `maplist(Predicate, ListIn, ListOut)`: Applies a predicate across all elements of a list, similar to `map` in functional languages.
*   `asserta(Clause)`, `assertz(Clause)`: Predicates that modify the engine's database at runtime by adding new facts or rules.
*   `retract(Clause)`: Removes rules from the runtime database.

### Constraint Logic Programming (CLP)

Modern Prologs support CLP, taking logic programming to the next level. Instead of simply generating answers through blind search, CLP allows you to post mathematical or logical constraints on specific domains (e.g., `clpfd` for finite domains of integers). The engine mathematically narrows down the possible domains and solves complex combinatorial problems orders of magnitude faster than naive generate-and-test approaches.

## Ecosystem & Tooling

While Prolog is considered a niche language today, its ecosystem is highly mature and robust for its specialized domains.

*   **SWI-Prolog**: The most popular, comprehensive open-source Prolog implementation. It includes an enormous standard library, robust HTTP web server capabilities, database connectors (ODBC, SPARQL), threading, and a built-in IDE/debugger.
*   **GNU Prolog**: Known for its ability to compile Prolog directly to standalone native machine-code executables and for having a very fast integer constraint solver.
*   **SICStus Prolog**: A high-performance commercial Prolog system widely used in the transportation and logistics industry for constraint solving and planning.
*   **Scryer Prolog**: A modern, newer implementation written entirely in Rust, aiming for strict ISO compliance, secure memory management, and modern features like coroutines.
*   **Package Management**: SWI-Prolog features a built-in package manager accessed via `pack_install(PackName).` Packages are hosted centrally on the SWI-Prolog website.
*   **Logtalk**: An object-oriented logic programming language that can use most standard Prolog implementations as a back-end compiler. It brings modern encapsulation, protocols, and modules to standard Prolog.

## Code Examples

### 1. Hello World & Basic Interaction

In Prolog, logic is usually defined in a `.pl` file, which is then loaded into the REPL. However, you can write scripts that execute a main routine and halt.

```prolog
% hello.pl
% :- initialization(main). % Used in SWI-Prolog to define the entry point.

main :-
    % write/1 prints a term to standard output.
    write('Hello, Logic World!'),
    nl, % nl/0 prints a newline character.
    halt. % halt/0 exits the Prolog interpreter.
```

### 2. Relational Database and Inference (Family Tree)

This is the classic Prolog example demonstrating facts, rules, and recursive search.

```prolog
% Facts: parent(Parent, Child).
parent(john, mary).
parent(john, tom).
parent(mary, ann).
parent(mary, fred).
parent(tom, liz).

% Rules
% X is a sibling of Y if they share a parent Z, and X is not Y.
sibling(X, Y) :-
    parent(Z, X),
    parent(Z, Y),
    X \= Y. % \= means "does not unify with"

% Base case: X is an ancestor of Y if X is a direct parent of Y.
ancestor(X, Y) :-
    parent(X, Y).

% Recursive case: X is an ancestor of Y if X is a parent of some Z,
% and Z is an ancestor of Y.
ancestor(X, Y) :-
    parent(X, Z),
    ancestor(Z, Y).

% Example Queries in the REPL:
% ?- sibling(mary, tom).    
% true.
%
% ?- ancestor(john, liz).   
% true.
%
% ?- ancestor(X, ann).      
% X = mary ; 
% X = john.
```

### 3. Pure List Manipulation

Implementing standard functional list operations in pure logic. Notice how variables function as both inputs and outputs depending on how the predicate is queried.

```prolog
% Check if an element is a member of a list.
% Base case: The element is the head of the list.
my_member(X, [X|_]).
% Recursive case: The element is somewhere in the tail.
my_member(X, [_|Tail]) :-
    my_member(X, Tail).

% Concatenate two lists (append).
% append(List1, List2, ResultList).
% Base case: Appending an empty list to L results in L.
my_append([], L, L).
% Recursive case: The head of the first list is the head of the result.
% The tail of the result is the append of the tail of the first list and the second list.
my_append([H|T], L, [H|ResultTail]) :-
    my_append(T, L, ResultTail).

% Reverse a list using an accumulator (tail-recursive approach).
my_reverse(List, Reversed) :-
    reverse_acc(List, [], Reversed).

% reverse_acc(Remaining, Accumulator, FinalResult).
reverse_acc([], Acc, Acc).
reverse_acc([H|T], Acc, Reversed) :-
    reverse_acc(T, [H|Acc], Reversed).
```

### 4. Graph Search (Pathfinding with Cycle Avoidance)

Prolog's backtracking excels at exploring paths through graphs, mazes, or state spaces.

```prolog
% Directed graph edges: edge(NodeA, NodeB, Cost).
edge(a, b, 10).
edge(a, c, 15).
edge(b, d, 20).
edge(c, d, 10).
edge(d, e, 5).

% Find a path from Start to End, accumulating the total Cost.
% Also keeps track of visited nodes to avoid infinite cycles.
path(Start, End, Path, Cost) :-
    walk(Start, End, [Start], ReversedPath, Cost),
    reverse(ReversedPath, Path). % Standard library reverse/2

% Base case: We have reached the destination node.
walk(End, End, Visited, Visited, 0).

% Recursive case: Walk to the next connected node.
walk(Current, End, Visited, FinalPath, TotalCost) :-
    edge(Current, Next, StepCost),
    \+ member(Next, Visited), % \+ is negation as failure (Next is NOT in Visited)
    walk(Next, End, [Next|Visited], FinalPath, RestCost),
    TotalCost is StepCost + RestCost. % 'is' evaluates arithmetic expressions

% Query: ?- path(a, e, Path, Cost).
% Backtracking will yield multiple routes:
% Path = [a, b, d, e], Cost = 35 ;
% Path = [a, c, d, e], Cost = 30 ;
% false.
```

### 5. Constraint Logic Programming (Sudoku Solver)

Using `clpfd` (Constraint Logic Programming over Finite Domains), complex combinatorial puzzles can be expressed declaratively and solved almost instantly.

```prolog
:- use_module(library(clpfd)).

% Sudoku solver in a declarative style.
sudoku(Rows) :-
    length(Rows, 9), maplist(same_length(Rows), Rows),
    append(Rows, Vs), Vs ins 1..9,
    maplist(all_distinct, Rows),
    transpose(Rows, Columns),
    maplist(all_distinct, Columns),
    Rows = [As,Bs,Cs,Ds,Es,Fs,Gs,Hs,Is],
    blocks(As, Bs, Cs), blocks(Ds, Es, Fs), blocks(Gs, Hs, Is).

blocks([], [], []).
blocks([N1,N2,N3|Ns1], [N4,N5,N6|Ns2], [N7,N8,N9|Ns3]) :-
    all_distinct([N1,N2,N3,N4,N5,N6,N7,N8,N9]),
    blocks(Ns1, Ns2, Ns3).
```

### 6. Minimal HTTP API Server (SWI-Prolog)

Modern Prologs like SWI can build highly concurrent network services out of the box.

```prolog
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).

% Register a handler for the '/api/hello' route.
:- http_handler(root(api/hello), say_hello, []).

% Start the server on the given port (e.g., 8080).
server(Port) :-
    http_server(http_dispatch, [port(Port)]).

% Handler implementation.
% The Request variable contains metadata about the HTTP request.
say_hello(_Request) :-
    % Generate a Prolog dict (modern SWI-Prolog structure for JSON)
    Reply = _{
        message: 'Hello from SWI-Prolog!',
        status: 'success'
    },
    % Write the dict as JSON to the HTTP stream
    reply_json(Reply).

% To run in REPL:
% ?- server(8080).
% Then visit http://localhost:8080/api/hello in your browser.
```

## Best Practices

### Idiomatic Patterns

1.  **Tail Recursion**: Because Prolog relies completely on recursion instead of loops, deeply nested recursive calls can quickly exhaust the call stack. Idiomatic Prolog uses **tail recursion** (often by utilizing accumulator variables) so the compiler can optimize the recursion into a standard `while` loop under the hood, consuming zero extra stack frames.
2.  **Generate and Test**: A classic logic programming design pattern where one predicate acts as a generator for potential candidate solutions, and subsequent predicates act as filters to test their validity. For optimal performance, developers must carefully order clauses to move the most restrictive tests as early in the rule as possible.
3.  **Difference Lists**: A highly powerful technique for achieving constant-time $O(1)$ list concatenation, which is particularly useful in parsers and generators. It represents a list as the logical difference between two lists, leaving an uninstantiated variable at the tail that can be directly bound later.

### Common Pitfalls

1.  **Left Recursion**: Writing a rule like `ancestor(X, Y) :- ancestor(X, Z), parent(Z, Y).` is logically sound, but will cause infinite loops in standard depth-first search Prolog engines. The base case or a strictly progressing relation must be evaluated first to ensure termination.
2.  **Misunderstanding Arithmetic (`is` vs `=`):** 
    *   `X is 2 + 2` dynamically evaluates the arithmetic expression and binds `X` to `4`. 
    *   `X = 2 + 2` simply unifies `X` with the compound structural term `+(2, 2)`. It does not perform math.
3.  **Negation as Failure (`\+`)**: The operator `\+` means "cannot be proven true", which is not strictly the same as "is logically false". For instance, `\+ human(X)` will fail if `X` is uninstantiated and there is *any* human in the database, which is often not the intended behavior. Negation behaves predictably only when all variables involved are fully instantiated.
4.  **Overusing Red Cuts (`!`):** Sprinkling cuts everywhere to force a program to behave procedurally makes Prolog code brittle, incredibly hard to read, and destroys its core declarative nature. Use green cuts for optimization, and limit red cuts strictly to well-understood if-else boundaries.

### Community Standards

- Predicate names are typically written in `snake_case`.
- Variables MUST be written in `CamelCase` or `PascalCase`.
- Use descriptive variable names rather than single letters, unless you are writing highly generic, short list-processing algorithms (where `[H|T]` is standard).
- It is standard practice to document predicates with comments specifying the expected **instantiation pattern** of their arguments using mode indicators: 
  *   `+` for instantiated arguments (inputs).
  *   `-` for uninstantiated arguments (outputs).
  *   `?` for arguments that can be either.
  *   Example comment: `% append(?List1, ?List2, ?List3)` signifies that the `append` predicate works no matter which arguments are provided or omitted.
