---
tags: [programming-language, functional, concurrency, backend]
category: Functional
status: to-learn
---

# Elixir

**Definition:** Functional language on the Erlang VM that uses the BEAM scheduler, OTP behaviors, and immutable data to build fault-tolerant concurrent systems.

**Paradigm:** Functional | **Typing:** Dynamic

## Pros
- BEAM processes are extremely lightweight, so millions of concurrent processes are feasible in the right architecture.
- OTP supervisors, GenServer, and other behaviors provide a strong pattern for fault isolation and recovery.
- Pattern matching, pipelines, and macros make code expressive without giving up runtime reliability.
- Phoenix and LiveView make real-time web UIs and APIs productive.

## Cons
- The language is less common than mainstream web stacks, so hiring and ecosystem breadth are smaller.
- Functional thinking and immutable data take adjustment for teams used to mutable object graphs.
- Some libraries and integrations lag the sheer breadth of JavaScript or Python ecosystems.
- Tooling is good, but less ubiquitous than JavaScript or JVM stacks in enterprise environments.

## Best For
- Real-time apps, chat, presence systems, and event-driven backends.
- Highly available services that need graceful failure handling and quick restarts.
- APIs and dashboards that benefit from Phoenix or LiveView.

## Real Examples
- Discord has used Elixir/BEAM technology for messaging and real-time systems.
- Pinterest has used Elixir for notification and service components.
- Many telecom and messaging platforms draw on Erlang/Elixir reliability patterns.

## Use Cases
- Chat systems, event feeds, notification pipelines, and long-lived websocket services.
- Supervisable backends where failure isolation is a design goal rather than an afterthought.
- Example:

```elixir
Enum.map(["Ada", "Grace", "Linus"], &String.upcase/1)
```

## Extended Syntax & Features

Elixir provides an expressive, modern syntax built on top of the Erlang VM (BEAM). It strongly emphasizes immutability, pattern matching, and function composition.

### Basic Data Types
Elixir's core data types form the foundation of its immutable data structures:

*   **Integers and Floats:** Standard numeric types.
    *   `10`, `0x1F`, `3.14`
*   **Booleans and Nil:** `true`, `false`, and `nil` are atoms in Elixir.
*   **Atoms:** Constants where their name is their value, similar to Symbols in Ruby.
    *   `:ok`, `:error`, `:user_not_found`
*   **Strings:** UTF-8 encoded binaries.
    *   `"Hello, World"`
*   **Lists:** Linked lists, meaning prepend operations are fast (`O(1)`), but appending and random access are slow (`O(n)`).
    *   `[1, 2, 3]`
*   **Tuples:** Contiguous memory arrays, making access fast but modifications (which copy the whole tuple) slow. Commonly used for fixed-size collections like return values.
    *   `{:ok, "Success"}`
*   **Maps:** Key-value stores.
    *   `%{name: "Alice", age: 30}`
*   **Keyword Lists:** Lists of two-element tuples where the first element is an atom. Often used for optional arguments.
    *   `[name: "Alice", age: 30]`

### Pattern Matching
The `=` operator in Elixir is not just assignment; it's the **match operator**.

```elixir
# Basic match
x = 1

# Tuple match
{:ok, result} = {:ok, "data"} # result becomes "data"

# List match
[head | tail] = [1, 2, 3] # head is 1, tail is [2, 3]

# Map match
%{name: name} = %{name: "Alice", age: 30} # name is "Alice"
```
If a match fails, Elixir raises a `MatchError`, promoting early failure.

### Control Flow
Elixir favors pattern matching over traditional `if`/`else` structures, although those exist.

*   **`case`:** Matches a value against several patterns.
*   **`cond`:** Matches conditions (like a giant `if`/`else if` block).
*   **`if`/`unless`:** Standard conditionals (rarely used for complex logic).
*   **`with`:** Used to chain operations that might fail, returning early if a match fails.

### The Pipe Operator (`|>`)
One of Elixir's most beloved features, the pipe operator takes the result of the expression on its left and passes it as the *first argument* to the function on its right.

```elixir
# Without pipe
String.upcase(String.trim("  hello  "))

# With pipe
"  hello  "
|> String.trim()
|> String.upcase()
```
This makes data transformations highly readable.

### Functions and Modules
Elixir code is organized into modules. Functions can be anonymous or named (defined within a module).

*   **Anonymous Functions:** `fn x -> x * 2 end`
*   **Named Functions:** Defined with `def` (public) or `defp` (private).

Function clauses allow defining multiple bodies for a function based on pattern matching and guard clauses.

## Advanced Concepts

### The BEAM VM and Concurrency Model
Elixir does not use OS threads. Instead, it runs on the BEAM VM, which implements the Actor model using **processes**.
*   **Lightweight:** Processes take a few kilobytes of memory. You can easily run hundreds of thousands of them concurrently on a single machine.
*   **Isolated:** Processes share no memory. They communicate exclusively by sending and receiving messages.
*   **Preemptive Scheduling:** The BEAM scheduler ensures no single process can hog the CPU, guaranteeing low latency even under heavy load.

### OTP (Open Telecom Platform)
OTP is a set of libraries and design principles that ship with Erlang/Elixir. It abstracts common concurrent patterns.
*   **GenServer (Generic Server):** A behavior for implementing client-server architectures within your app. It handles state, synchronous/asynchronous calls, and timeouts.
*   **Supervisors:** Processes whose sole job is to monitor other processes (workers or other supervisors) and restart them if they crash. This is the core of the "Let it crash" philosophy.
*   **Application:** A component that can be started and stopped as a unit, often representing a supervision tree.

### Fault Tolerance ("Let it crash")
Instead of writing defensive code (`try`/`catch` everywhere), Elixir developers write code for the happy path. If an unexpected error occurs, the process crash. A Supervisor detects the crash and restarts the process from a known, clean state. This prevents cascading failures and undefined states.

### Macros and Metaprogramming
Elixir is extensible. Much of its core syntax (like `if`, `def`, `case`) is implemented as macros. Macros allow you to write code that writes code, executing at compile time.
*   **AST (Abstract Syntax Tree):** Elixir exposes its AST as simple Elixir tuples (e.g., `{function, metadata, arguments}`).
*   **`quote` and `unquote`:** Primitives for generating and manipulating the AST.
*   *Warning:* Macros should be used sparingly, as they increase complexity and compile times.

### Protocols
Protocols are Elixir's mechanism for polymorphism. They allow dispatching to different function implementations based on the data type of the first argument.

## Ecosystem & Tooling

Elixir's tooling is universally praised for its consistency and developer experience.

### Build and Package Management
*   **Mix:** The standard build tool. It creates projects, compiles code, runs tests, and manages dependencies. You rarely need external build tools like Make or Webpack for pure Elixir code.
*   **Hex:** The package manager for the Erlang ecosystem. Seamlessly integrated with Mix.

### Web Frameworks
*   **Phoenix:** The premier web framework. It is fast, productive, and robust. It provides a familiar MVC structure but is built on functional paradigms.
*   **Phoenix LiveView:** A paradigm-shifting library that allows building rich, real-time user interfaces (like single-page applications) writing mostly Elixir code on the server, pushing HTML updates over WebSockets. No JavaScript required for most interactive features.

### Database Interaction
*   **Ecto:** Not an ORM (Object-Relational Mapper), but a database wrapper and query generator. It emphasizes explicit queries and data validation through changesets.

### Standard Library and Core Tools
*   **ExUnit:** The built-in testing framework. It's fast, concurrent, and provides excellent error messages.
*   **IEx (Interactive Elixir):** A powerful REPL with auto-completion, debugging tools, and the ability to connect to running nodes.
*   **Dialyxir / Dialyzer:** A static analysis tool for identifying type discrepancies (using Elixir's typespecs).
*   **Credo:** A static code analysis tool that focuses on teaching and code consistency.
*   **ExDoc:** Generates beautiful, searchable HTML documentation from inline code comments.

## Code Examples

### 1. Basic Data Structures and Pattern Matching

```elixir
defmodule UserSystem do
  @doc """
  Demonstrates pattern matching on Maps and Tuples.
  """
  def process_user({:ok, %{role: "admin", name: name}}) do
    "Welcome Administrator #{name}!"
  end

  def process_user({:ok, %{name: name}}) do
    "Hello regular user #{name}."
  end

  def process_user({:error, reason}) do
    "Failed to process user: #{reason}"
  end
end

# Usage:
# UserSystem.process_user({:ok, %{name: "Alice", role: "admin"}})
# UserSystem.process_user({:error, "Database timeout"})
```

### 2. The Pipe Operator and Enumerable

```elixir
defmodule DataProcessing do
  @doc """
  Takes a string of comma-separated numbers, parses them, 
  filters out odds, squares the evens, and sums them up.
  """
  def sum_of_even_squares(data_string) do
    data_string
    |> String.split(",")             # ["1", " 2 ", "3", "4"]
    |> Enum.map(&String.trim/1)      # ["1", "2", "3", "4"]
    |> Enum.map(&String.to_integer/1) # [1, 2, 3, 4]
    |> Enum.filter(fn x -> rem(x, 2) == 0 end) # [2, 4]
    |> Enum.map(fn x -> x * x end)   # [4, 16]
    |> Enum.sum()                    # 20
  end
end
```

### 3. Concurrency Basics (Processes and Messages)

```elixir
defmodule SimpleActor do
  @doc """
  Spawns a new process that listens for messages.
  """
  def start do
    # spawn/1 creates a new process and returns its Process ID (PID)
    spawn(fn -> loop(0) end)
  end

  # Recursive loop to keep the process alive and maintain state
  defp loop(count) do
    receive do
      {:increment, amount} ->
        new_count = count + amount
        IO.puts("Count is now: #{new_count}")
        loop(new_count) # Tail-recursive call updates state

      {:get_count, caller_pid} ->
        # Send a message back to the caller
        send(caller_pid, {:current_count, count})
        loop(count)
        
      :stop ->
        IO.puts("Stopping actor.")
        # Exiting the loop terminates the process
    end
  end
end

# Usage:
# pid = SimpleActor.start()
# send(pid, {:increment, 5})
```

### 4. GenServer (OTP Standard)

```elixir
defmodule KeyValueStore do
  @moduledoc """
  A standard GenServer implementation for a simple key-value store.
  """
  use GenServer

  # --- Client API ---

  def start_link(initial_state \\ %{}) do
    GenServer.start_link(__MODULE__, initial_state, name: __MODULE__)
  end

  def put(key, value) do
    # cast is asynchronous (fire and forget)
    GenServer.cast(__MODULE__, {:put, key, value})
  end

  def get(key) do
    # call is synchronous (waits for a reply)
    GenServer.call(__MODULE__, {:get, key})
  end

  # --- Server Callbacks ---

  @impl true
  def init(initial_state) do
    {:ok, initial_state}
  end

  @impl true
  def handle_cast({:put, key, value}, state) do
    new_state = Map.put(state, key, value)
    {:noreply, new_state}
  end

  @impl true
  def handle_call({:get, key}, _from, state) do
    value = Map.get(state, key)
    {:reply, value, state} # Reply with value, maintain state
  end
end
```

### 5. Supervisor Tree

```elixir
defmodule MyApp.Supervisor do
  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    # Define the children to be supervised
    children = [
      # If KeyValueStore crashes, the Supervisor will restart it
      {KeyValueStore, %{}} 
    ]

    # Strategy :one_for_one means if a child crashes, only that child is restarted.
    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### 6. Structs and Protocols

```elixir
# Defining a Struct
defmodule User do
  defstruct name: "Unknown", age: nil, active: true
end

# Defining a Protocol
defprotocol JSONEncoder do
  @doc "Encodes data to JSON string representation"
  def encode(data)
end

# Implementing the Protocol for our Struct
defimpl JSONEncoder, for: User do
  def encode(%User{name: name, age: age, active: active}) do
    # A highly simplified representation
    "{\"name\": \"#{name}\", \"age\": #{age}, \"active\": #{active}}"
  end
end

# Implementing for built-in types
defimpl JSONEncoder, for: BitString do
  def encode(string), do: "\"#{string}\""
end

# Usage:
# user = %User{name: "Bob", age: 42}
# JSONEncoder.encode(user)
```

### 7. Task for Async Operations

```elixir
defmodule AsyncFetcher do
  @doc """
  Fetches multiple URLs concurrently using Task.async/await.
  """
  def fetch_all(urls) do
    urls
    |> Enum.map(fn url -> 
      # Spawns a separate process for each fetch
      Task.async(fn -> mock_http_get(url) end) 
    end)
    |> Enum.map(fn task -> 
      # Waits for the processes to complete and collects results
      Task.await(task, 5000) # 5 second timeout
    end)
  end

  defp mock_http_get(url) do
    Process.sleep(Enum.random(100..500)) # Simulate network delay
    {:ok, "Content of #{url}"}
  end
end
```

### 8. Metaprogramming (Simple Macro)

```elixir
defmodule LoggerMacro do
  @doc """
  A macro that injects timing code around an expression.
  """
  defmacro time_it(expression) do
    quote do
      start = System.monotonic_time(:millisecond)
      result = unquote(expression)
      stop = System.monotonic_time(:millisecond)
      IO.puts("Execution took: #{stop - start} ms")
      result
    end
  end
end

# Usage (in another module):
# require LoggerMacro
# LoggerMacro.time_it(Process.sleep(150))
```

## Best Practices

### 1. Embrace Immutability and Transformations
Do not try to mutate state. Instead, think of your program as a series of data transformations. Use the pipe operator (`|>`) to make these pipelines explicit and readable.

### 2. Design for Concurrency Early
Don't wait until performance is an issue to use processes. Use GenServers and Tasks to model independent components of your system naturally. If a component manages its own state or needs to run independently, it should probably be a process.

### 3. Let It Crash (Within Reason)
Avoid defensive programming (excessive `case` statements handling impossible errors or `try`/`catch`). Let processes crash if they enter an invalid state. Rely on Supervisors to restore them to a known good state. Only handle errors that are expected (e.g., bad user input, temporary network failures).

### 4. Use Structs Over Maps for Domain Entities
While maps are great for generic key-value data, use `defstruct` for your core domain models. Structs provide compile-time guarantees about the keys that exist and allow for polymorphic behavior via Protocols.

### 5. Keep Functions Small and Composable
Leverage pattern matching in function signatures to break down complex logic into small, single-purpose function clauses.

```elixir
# Bad: One large function with nested conditionals
def process(data) do
  if data.valid? do
    if data.type == :admin do
      # ...
    else
      # ...
    end
  else
    {:error, :invalid}
  end
end

# Good: Multiple clauses
def process(%{valid?: false}), do: {:error, :invalid}
def process(%{type: :admin} = data), do: handle_admin(data)
def process(data), do: handle_user(data)
```

### 6. Avoid Process Bottlenecks
A GenServer processes messages sequentially. If you perform heavy computation or slow network requests inside a GenServer's `handle_cast` or `handle_call`, the process mailbox will fill up, creating a bottleneck. Delegate heavy work to `Task`s or separate worker pools.

### 7. Documentation and Typespecs
Use `@moduledoc` and `@doc` generously. Elixir's documentation system is first-class. Use `@spec` to define typespecs for public functions, enabling Dialyzer to catch type-related bugs statically.

### 8. Use `with` for Complex Control Flow
When you have a series of operations that can fail, avoid deeply nested `case` statements. Use `with` to create a clean pipeline that handles the happy path and delegates errors gracefully.

```elixir
def create_user(params) do
  with {:ok, valid_params} <- validate(params),
       {:ok, user} <- insert_db(valid_params),
       {:ok, _email} <- send_welcome_email(user) do
    {:ok, user}
  else
    # Handles failures from any of the steps above
    {:error, reason} -> {:error, reason}
  end
end
```
