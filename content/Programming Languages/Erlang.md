---
tags: [programming-language, functional, concurrency, telecom]
category: Functional
status: to-learn
---

# Erlang

**Definition:** Concurrent functional language built for Erlang VM systems that need fault tolerance, distribution, and long-lived uptime.

**Paradigm:** Functional | **Typing:** Dynamic

## Pros
- Lightweight processes and message passing fit failure-isolated service design.
- Supervision trees make restart strategies explicit and local.
- Hot code swapping and upgrades support live systems with minimal disruption.
- The BEAM scheduler is optimized for massive concurrency and responsiveness.
- Proven reliability in telecom and messaging systems over long operational lifetimes.

## Cons
- Syntax and tooling feel unconventional to developers from mainstream OO languages.
- The ecosystem is smaller than web or JVM ecosystems.
- Functional and message-oriented design can be a significant mindset shift.
- Throughput for CPU-heavy work is not the main strength of the platform.

## Best For
- Telecom infrastructure, distributed services, and always-on messaging systems.
- Long-lived backends where process isolation and recovery matter more than raw CPU throughput.

## Real Examples
- WhatsApp’s original backend is a classic Erlang example.
- Telecom switches and other infrastructure systems have long used Erlang-like reliability patterns.
- Messaging and presence systems frequently borrow its concurrency model.

## Use Cases
- Presence services, chat backends, call control, and distributed supervisors.
- Example:

```erlang
io:format("hello~n").
```

## Extended Syntax & Features

Erlang's syntax is heavily influenced by Prolog. Unlike languages in the C family, Erlang statements end with periods (`.`), clauses within a statement are separated by semicolons (`;`), and expressions within a sequence are separated by commas (`,`).

### Data Types
Erlang provides a robust set of built-in data types:
- **Numbers:** Integers and floats. e.g., `42`, `3.14`.
- **Atoms:** Literals, constants with their own name for value. They start with a lowercase letter. e.g., `ok`, `error`, `my_atom`.
- **Booleans:** There is no dedicated boolean type. Instead, the atoms `true` and `false` are used.
- **Tuples:** Fixed-size collections of values. Denoted by curly braces `{}`. e.g., `{point, 10, 20}`.
- **Lists:** Variable-length collections. Denoted by square brackets `[]`. e.g., `[1, 2, 3]`. Strings in Erlang are typically represented as lists of integers (ASCII/Unicode values), though binaries are more efficient for large text.
- **Binaries:** A sequence of bytes or bits, highly optimized. Denoted by `<<>>`. e.g., `<<1, 2, 3>>` or `<<"Hello">>` (a binary string).
- **Maps:** Key-value associative arrays. Denoted by `#{}`. e.g., `#{name => "Alice", age => 30}`.
- **Pids:** Process identifiers, representing a lightweight Erlang process.
- **Refs:** Unique references globally within the Erlang cluster.
- **Ports:** Interfaces to the outside world (OS processes, files, network sockets).

### Variables and Pattern Matching
In Erlang, variables must start with an uppercase letter or an underscore. Variables are immutable; once bound to a value, they cannot be changed.
Pattern matching is arguably the most powerful feature in Erlang. The `=` operator is not assignment; it is a pattern match operator.

```erlang
Point = {10, 20}.
{X, Y} = Point. % X is bound to 10, Y is bound to 20
```

### Control Flow
Erlang uses pattern matching and guard clauses for control flow instead of traditional `if/else` constructs.

- **Case expression:** Matches an expression against a series of patterns.
- **If expression:** Evaluates a series of guard conditions (must evaluate to `true` or `false`).
- **Function clauses:** Functions can have multiple clauses, and the runtime matches the arguments to determine which clause to execute.

### Functions and Modules
Functions are organized into modules. A module is defined in a `.erl` file. Functions can be exported to be called from other modules.

```erlang
-module(math_utils).
-export([add/2, factorial/1]). % Exporting functions with their arity (number of arguments)

add(A, B) -> A + B.

factorial(0) -> 1;
factorial(N) when N > 0 -> N * factorial(N - 1).
```

### Recursion and Tail Recursion
Since there are no loops (like `for` or `while`), Erlang relies heavily on recursion. Tail recursion is highly optimized by the compiler, allowing functions to loop indefinitely without consuming the call stack.

## Advanced Concepts

### The Actor Model and Concurrency
Erlang's concurrency model is based on the Actor model. Processes in Erlang are not OS threads; they are extremely lightweight entities managed by the BEAM virtual machine. You can run millions of them on a single machine.
- Processes do not share memory.
- They communicate exclusively through asynchronous message passing.
- Each process has a mailbox where incoming messages are queued.

### Message Passing
The `!` (bang) operator is used to send a message to a process. The `receive` construct is used to pull messages from the mailbox using pattern matching.

### Error Handling and Fault Tolerance
Erlang embraces the "Let it crash" philosophy. Instead of trying to catch every possible error (defensive programming), you design the system so that when a process crashes, it is detected and handled by another process (a supervisor).

- **Links:** Bidirectional connections between processes. If one crashes, the other receives an exit signal.
- **Monitors:** Unidirectional connections. Process A monitors Process B. If B crashes, A gets notified, but if A crashes, B is unaware.

### Supervision Trees
OTP (Open Telecom Platform) is a set of libraries and design principles shipped with Erlang. It formalized the concept of supervision trees. A supervisor is a process whose only job is to start, monitor, and restart child processes (which could be workers or other supervisors) according to a defined strategy (e.g., `one_for_one`, `one_for_all`, `rest_for_one`).

### Hot Code Swapping
Erlang allows updating code in a running system without stopping it. The VM keeps two versions of a module in memory: the "current" and the "old" version. New function calls are routed to the current version, while lingering processes can finish executing the old version.

### Distributed Erlang
Erlang clusters (nodes) can connect to each other and communicate seamlessly. Sending a message to a process on a remote node looks exactly like sending a message to a local process. This makes building distributed systems remarkably straightforward.

## Ecosystem & Tooling

### OTP (Open Telecom Platform)
OTP is the standard library and middleware for Erlang. It provides behaviors (interfaces) for common concurrent patterns, such as `gen_server` (client-server), `gen_statem` (state machines), and `supervisor` (process supervision). Using OTP is the standard way to build Erlang applications.

### Rebar3
Rebar3 is the standard build tool and package manager for Erlang. It handles compiling code, managing dependencies (from Hex.pm), running tests (EUnit, Common Test), and creating releases.

### Hex.pm
Hex is the package manager for the Erlang ecosystem (shared with Elixir). It hosts libraries and applications that can be easily integrated into projects using Rebar3 or Mix (for Elixir).

### Dialyzer
The Discrepancy Analyzer for Erlang (Dialyzer) is a static analysis tool that identifies software discrepancies, such as type errors, unreachable code, and other anomalies. It uses success typing, which infers types without requiring explicit type annotations, though adding `-spec` annotations improves its accuracy.

### Observer
Observer is a built-in GUI tool (and a web-based tool in newer versions) for inspecting and profiling Erlang systems. It allows developers to monitor CPU/memory usage, inspect process states, trace messages, and view supervision trees in real-time.

### Standard Libraries
Erlang comes with a rich standard library (STDLIB), providing modules for string manipulation, list processing, cryptography, networking (TCP/UDP/SSL), ETS (Erlang Term Storage - a robust in-memory database), and much more.

## Code Examples

### 1. Basic Syntax and Data Structures
This example demonstrates lists, tuples, maps, and pattern matching in a simple module.

```erlang
-module(data_structures).
-export([demo/0, process_person/1]).

demo() ->
    % Tuple
    Point = {x, 10, y, 20},
    
    % List
    Fruits = [apple, banana, cherry],
    [FirstFruit | Rest] = Fruits, % Pattern matching on list
    
    % Map
    Person = #{name => "Alice", age => 30, role => admin},
    
    % Output
    io:format("Point: ~p~n", [Point]),
    io:format("First fruit: ~p, Rest: ~p~n", [FirstFruit, Rest]),
    process_person(Person).

process_person(#{role := admin, name := Name}) ->
    io:format("Admin ~s access granted.~n", [Name]);
process_person(#{name := Name}) ->
    io:format("User ~s access denied.~n", [Name]).
```

### 2. Tail Recursion and List Processing
Demonstrates how to write efficient tail-recursive functions, a cornerstone of functional programming in Erlang.

```erlang
-module(list_utils).
-export([reverse/1, sum/1]).

% Public API for reverse
reverse(List) ->
    reverse(List, []).

% Tail-recursive helper for reverse
reverse([], Acc) ->
    Acc;
reverse([Head | Tail], Acc) ->
    reverse(Tail, [Head | Acc]).

% Public API for sum
sum(List) ->
    sum(List, 0).

% Tail-recursive helper for sum
sum([], Total) ->
    Total;
sum([Number | Rest], Total) when is_number(Number) ->
    sum(Rest, Total + Number).
```

### 3. Concurrency and Message Passing
A simple actor that holds state (a counter) and responds to asynchronous messages.

```erlang
-module(counter_actor).
-export([start/0, loop/1, increment/1, get_value/1]).

% Starts the actor and returns its PID
start() ->
    spawn(fun() -> loop(0) end).

% Send an increment message
increment(Pid) ->
    Pid ! increment.

% Send a request for the value and wait for the response
get_value(Pid) ->
    Pid ! {get, self()},
    receive
        {value, V} -> V
    after 5000 ->
        {error, timeout}
    end.

% The actor's event loop
loop(State) ->
    receive
        increment ->
            loop(State + 1);
        {get, CallerPid} ->
            CallerPid ! {value, State},
            loop(State);
        stop ->
            ok
    end.
```

### 4. OTP `gen_server` Implementation
The idiomatic way to write stateful processes in Erlang is using the `gen_server` behavior. This provides a robust, standard interface that integrates with supervision trees.

```erlang
-module(kv_store).
-behaviour(gen_server).

%% API
-export([start_link/0, put/2, get/1, stop/0]).

%% gen_server callbacks
-export([init/1, handle_call/3, handle_cast/2, handle_info/2, terminate/2, code_change/3]).

%% --- API ---
start_link() ->
    gen_server:start_link({local, ?MODULE}, ?MODULE, #{}, []).

put(Key, Value) ->
    gen_server:cast(?MODULE, {put, Key, Value}).

get(Key) ->
    gen_server:call(?MODULE, {get, Key}).

stop() ->
    gen_server:stop(?MODULE).

%% --- Callbacks ---
init(State) ->
    {ok, State}.

handle_call({get, Key}, _From, State) ->
    case maps:find(Key, State) of
        {ok, Value} -> {reply, Value, State};
        error -> {reply, not_found, State}
    end.

handle_cast({put, Key, Value}, State) ->
    NewState = maps:put(Key, Value, State),
    {noreply, NewState}.

handle_info(_Info, State) ->
    {noreply, State}.

terminate(_Reason, _State) ->
    ok.

code_change(_OldVsn, State, _Extra) ->
    {ok, State}.
```

### 5. Supervision Tree Example
A simple supervisor that starts and restarts the `kv_store` worker if it crashes.

```erlang
-module(main_sup).
-behaviour(supervisor).

-export([start_link/0, init/1]).

start_link() ->
    supervisor:start_link({local, ?MODULE}, ?MODULE, []).

init([]) ->
    SupFlags = #{strategy => one_for_one, intensity => 1, period => 5},
    ChildSpecs = [
        #{id => kv_store,
          start => {kv_store, start_link, []},
          restart => permanent,
          shutdown => 5000,
          type => worker,
          modules => [kv_store]}
    ],
    {ok, {SupFlags, ChildSpecs}}.
```

### 6. Network Requests (TCP Echo Server)
Using Erlang's powerful `gen_tcp` module to build a concurrent TCP server.

```erlang
-module(echo_server).
-export([start/1, accept/1, loop/1]).

start(Port) ->
    {ok, ListenSocket} = gen_tcp:listen(Port, [binary, {packet, 0}, {active, false}, {reuseaddr, true}]),
    io:format("Listening on port ~p~n", [Port]),
    accept(ListenSocket).

accept(ListenSocket) ->
    {ok, Socket} = gen_tcp:accept(ListenSocket),
    spawn(fun() -> loop(Socket) end),
    accept(ListenSocket).

loop(Socket) ->
    case gen_tcp:recv(Socket, 0) of
        {ok, Data} ->
            gen_tcp:send(Socket, Data),
            loop(Socket);
        {error, closed} ->
            io:format("Client disconnected~n");
        {error, Reason} ->
            io:format("Error: ~p~n", [Reason])
    end.
```

## Best Practices

### 1. Let It Crash
Do not write defensive code to catch every possible exception (e.g., massive `try...catch` blocks). Instead, validate inputs and crash early if something is wrong. Let a supervisor handle the restart and recovery. This ensures the system returns to a known good state.

### 2. Use OTP Behaviors
Always prefer `gen_server`, `gen_statem`, and `supervisor` over raw `spawn` and `receive` loops for production code. OTP provides heavily tested abstractions that handle edge cases, debugging, hot code swapping, and system messages correctly.

### 3. Keep Processes Lightweight and Focused
Each process should have a single responsibility. Since they are extremely cheap to create, don't hesitate to spawn a new process for a distinct task or a concurrent request. Avoid "god processes" that become bottlenecks.

### 4. Optimize Pattern Matching
Order your function clauses and case statements from most specific to least specific. The Erlang compiler optimizes pattern matching, but providing clear, non-overlapping patterns helps both performance and readability.

### 5. Tail Recursion for Long-Lived Loops
Ensure that recursive functions, especially those implementing a process's event loop, are tail-recursive. This means the recursive call must be the absolute last operation in the function. Otherwise, the call stack will grow continuously and eventually crash the process.

### 6. Dialyzer and Type Specs
Use Dialyzer extensively. Document your functions using `-spec` declarations. This not only serves as fantastic documentation but allows Dialyzer to catch subtle type-related bugs at compile time.

```erlang
-spec add(integer(), integer()) -> integer().
add(A, B) -> A + B.

### 7. Practical Erlang Notes
- Keep message formats explicit and stable; tagged tuples are easier to evolve than ad hoc maps in many systems.
- Use supervisors to define recovery behavior up front instead of sprinkling retry logic across workers.
- Watch mailbox sizes in production, because a process that cannot keep up can become a hidden memory leak.
- For long-running nodes, prefer many small processes over a few complex ones.
- When debugging distributed code, start with node connectivity and cookie configuration before blaming application logic.
```

### 7. Avoid Shared State via Message Passing
Do not try to build mutable shared state structures. If multiple processes need to access a shared piece of data, either wrap it in a `gen_server` (which acts as a serializer), or use ETS (Erlang Term Storage) for high-performance concurrent read/write access.

### 8. Binaries for Text Processing
When dealing with large volumes of text (like parsing JSON or handling HTTP requests), use binaries (`<<"string">>`) rather than lists of integers (`"string"`). Binaries are much more memory efficient and have optimized pattern matching operations.

### 9. Properly Handle Process Exits
If a process spawns other processes that depend on it, use `link/1` or `spawn_link/1` so they crash together, avoiding orphaned processes (zombies). If a process just needs to know when another crashes without crashing itself, use `monitor/2`.

### 10. Meaningful Atoms and Naming Conventions
Use descriptive atoms for status codes (`ok`, `error`, `not_found`). Follow the convention of naming variables in `CamelCase` (starting with an uppercase letter) and functions/atoms in `snake_case` (starting with a lowercase letter).
