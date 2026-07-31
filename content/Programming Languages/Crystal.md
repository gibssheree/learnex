---
tags: [programming-language, oop, compiled, web]
category: Niche
status: to-learn
---

# Crystal

**Definition:** Ruby-like language that compiles to native code with static typing and fiber-based concurrency.

**Paradigm:** OOP | **Typing:** Static (with inference)

## Pros
- Familiar syntax makes it approachable for Ruby developers.
- Native compilation usually gives substantially better runtime performance than interpreted Ruby.
- Fibers and channels provide lightweight concurrency primitives.
- Type inference reduces annotation burden in many code paths.
- The language feels expressive for web services and CLI tools.
- Null reference safety: Crystal features non-nilable types by default, significantly reducing runtime errors.
- Excellent C bindings: Crystal provides an easy and intuitive way to bind to C libraries without writing boilerplate.
- Built-in formatting tool (`crystal tool format`) enforces a consistent code style across the ecosystem.
- Powerful macro system enables compile-time metaprogramming and code generation, mitigating the loss of Ruby's dynamic `eval`.

## Cons
- The ecosystem is comparatively small, so library availability can be an issue.
- Compile times are slower than interpreted Ruby feedback loops, especially on large codebases.
- Some Ruby metaprogramming patterns do not translate cleanly due to static typing requirements.
- Fewer production references and a smaller hiring pool raise adoption risk.
- Windows support is still maturing compared to Linux and macOS.
- Multi-threading support is currently available but still requires careful handling and isn't fully robust across all standard library modules compared to Go or Rust.
- Dependency management (via `shards`) lacks some advanced features found in Cargo (Rust) or NPM (Node.js).

## Best For
- Teams that like Ruby’s syntax but need native binaries and stronger static guarantees.
- Small-to-medium web services or CLI tools where developer ergonomics still matter.
- Building high-performance microservices that interact heavily with C libraries.
- Rewriting bottlenecks in Ruby applications while maintaining a unified syntax structure across the organization.
- Projects prioritizing fast development speed along with C-like runtime performance.

## Real Examples
- **Kemal:** A lightning-fast, super simple web framework for Crystal, highly inspired by Ruby's Sinatra.
- **Lucky:** A web framework that focuses on catching bugs at compile time and delivering fast, robust applications.
- **Amber:** A web application framework inspired by Rails, Phoenix, and other popular frameworks.
- **Invidious:** An open-source alternative front-end to YouTube, written in Crystal, known for its high performance and low resource consumption.
- **Mint:** A programming language for writing single-page applications, whose compiler is written in Crystal.

## Use Cases
- API servers, command-line utilities, and small internal services.
- Replacing some Ruby scripts when runtime cost matters more than ecosystem breadth.
- Writing fast network services, taking advantage of the built-in non-blocking I/O.
- Creating native standalone binaries that can be distributed easily without a runtime environment (e.g., JVM or Ruby interpreter).
- Example:

```crystal
puts "hello"
```

## Extended Syntax & Features

Crystal's syntax is heavily inspired by Ruby's, meaning it favors developer happiness, expressiveness, and readability. It accomplishes this while being statically typed.

### Basic Data Types
Crystal supports standard primitive types, which are heavily optimized by LLVM.
- **Numbers:** `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32`, `Float64`.
- **Booleans:** `true` (`Bool`), `false` (`Bool`).
- **Strings:** UTF-8 encoded text (`String`). Characters are represented by `Char`.
- **Symbols:** Interned strings used for efficient comparisons (e.g., `:symbol`).
- **Arrays & Hashes:** Typed collections like `Array(Int32)` and `Hash(String, String)`.
- **Tuples & NamedTuples:** Fixed-size, immutable collections of heterogeneous types.

### Variables and Type Inference
You generally don't need to specify types. The compiler infers them.
```crystal
name = "Crystal" # Inferred as String
age = 5          # Inferred as Int32

# Explicit typing when needed
score : Float64 = 99.5
```

### Control Flow
Standard control flow constructs are available, often evaluating to a value (expressions).
```crystal
# If/Else
message = if age > 18
  "Adult"
else
  "Minor"
end

# Case statement (Pattern Matching)
case age
when 0..12
  puts "Child"
when 13..19
  puts "Teen"
else
  puts "Adult"
end

# Unless
puts "Not empty" unless name.empty?
```

### Methods
Methods are defined using `def` and support default arguments, keyword arguments, and block yielding.
```crystal
def greet(name : String, punctuation = "!")
  "Hello, #{name}#{punctuation}"
end

puts greet("World") # => "Hello, World!"
```

### Classes and Objects
Crystal is purely object-oriented. Everything is an object.
```crystal
class Person
  # Macros for generating getters and setters
  property name : String
  property age : Int32

  def initialize(@name, @age)
  end

  def celebrate_birthday
    @age += 1
  end
end
```

## Advanced Concepts

### Memory Management
Crystal relies on the Boehm-Demers-Weiser (BDW) conservative garbage collector. This allows developers to write code without manually allocating and freeing memory (unlike C or C++), while still maintaining high performance. Although the GC adds some overhead, Crystal’s compile-time optimizations often alleviate memory allocations altogether.

### Concurrency Model: Fibers and Channels
Crystal’s concurrency is based on Communicating Sequential Processes (CSP), similar to Go. It uses Fibers, which are lightweight threads managed by the Crystal runtime, rather than OS-level threads.

- **Fibers:** Spawned using the `spawn` keyword. They are extremely cheap to create.
- **Channels:** Used to communicate between fibers safely without locks.

```crystal
channel = Channel(Int32).new

spawn do
  # Perform some heavy work
  sleep 1.second
  channel.send(42)
end

# Execution blocks here until the channel receives a value
result = channel.receive
puts "Received: #{result}"
```
*Note: Crystal traditionally ran in a single OS thread using an event loop (libevent) for non-blocking I/O. Multi-threading support is available and actively being improved.*

### Macros and Metaprogramming
Unlike Ruby, which uses runtime evaluation (`eval`, `define_method`), Crystal handles metaprogramming at compile time using Macros. Macros generate abstract syntax tree (AST) nodes.
```crystal
macro define_method(name, content)
  def {{name}}
    {{content}}
  end
end

define_method(say_hi, puts "Hi!")
say_hi # => "Hi!"
```

### Union Types and Nil Safety
A variable can hold multiple types, known as a Union Type. For example, `Int32 | String`.
Crystal has strict nil-checking. `nil` is its own type (`Nil`). If a variable can be nil, it has a union type like `String | Nil` (often written as `String?`). The compiler forces you to check for `nil` before using the variable, eliminating a massive class of runtime errors.

## Ecosystem & Tooling

The Crystal ecosystem, while smaller than Ruby's or Node's, is focused on high quality and performance.

### Shards (Package Manager)
`shards` is the official dependency manager. Dependencies are defined in a `shard.yml` file.
```yaml
name: my_app
version: 0.1.0

dependencies:
  kemal:
    github: kemalcr/kemal
```
Running `shards install` fetches the dependencies from Git repositories.

### Build Tools and Compiler
The `crystal` executable is an all-in-one tool:
- `crystal build src/app.cr`: Compiles the application into a native binary.
- `crystal build --release src/app.cr`: Compiles with heavy LLVM optimizations for production.
- `crystal run src/app.cr`: Compiles and runs the app on the fly (useful for development).
- `crystal spec`: Runs the built-in testing framework (similar to RSpec).
- `crystal tool format`: Formats code to community standards.

### Popular Frameworks
1. **Kemal:** Microframework for fast API development and simple web apps.
2. **Lucky:** Full-stack, strongly typed framework prioritizing safety and speed.
3. **Amber:** Full-stack MVC framework, providing Rails-like conventions and CLI generators.
4. **Athena:** Framework for building robust and scalable web applications, leveraging annotations and dependency injection.

## Code Examples

### 1. Hello World & Basic CLI
A simple script demonstrating string interpolation and command-line arguments.
```crystal
# hello.cr
if ARGV.empty?
  puts "Usage: crystal run hello.cr -- <name>"
  exit 1
end

name = ARGV.first
puts "Hello, #{name}! Welcome to Crystal."
```

### 2. Data Structures & Enumerable
Crystal's Enumerable module is incredibly rich, providing dozens of methods for collections.
```crystal
# Working with Arrays and Hashes
numbers = [1, 2, 3, 4, 5, 6]

# Map and Select (Filter)
even_squares = numbers
  .select { |n| n.even? }
  .map { |n| n ** 2 }

puts even_squares # => [4, 16, 36]

# Hashes
capitals = {
  "France" => "Paris",
  "Japan"  => "Tokyo",
  "Peru"   => "Lima"
}

capitals.each do |country, capital|
  puts "The capital of #{country} is #{capital}"
end
```

### 3. Object-Oriented Patterns (Inheritance & Modules)
Crystal supports single inheritance and multiple mixins via modules.
```crystal
module Drivable
  def start_engine
    puts "Engine started... Vroom!"
  end
end

abstract class Vehicle
  getter wheels : Int32

  def initialize(@wheels)
  end
end

class Car < Vehicle
  include Drivable

  def initialize
    super(wheels: 4)
  end
end

my_car = Car.new
puts "My car has #{my_car.wheels} wheels."
my_car.start_engine
```

### 4. Fibers and Channels (Concurrency)
A practical example of fetching multiple items concurrently.
```crystal
require "http/client"

# Fetch HTTP status from multiple URLs concurrently
urls = [
  "https://crystal-lang.org",
  "https://github.com",
  "https://news.ycombinator.com"
]

channel = Channel(String).new

urls.each do |url|
  spawn do
    begin
      response = HTTP::Client.get(url)
      channel.send("#{url}: #{response.status_code}")
    rescue ex
      channel.send("#{url}: Error - #{ex.message}")
    end
  end
end

# Wait for and print all responses
urls.size.times do
  puts channel.receive
end
```

### 5. JSON Serialization
Crystal's standard library provides powerful JSON mapping using macros.
```crystal
require "json"

class User
  include JSON::Serializable

  # Map JSON keys to Crystal properties
  @[JSON::Field(key: "first_name")]
  property first_name : String

  property last_name : String

  # Optional field
  property age : Int32?
end

json_string = %({"first_name": "Alan", "last_name": "Turing"})
user = User.from_json(json_string)

puts user.first_name # => Alan
puts user.last_name  # => Turing
puts user.age.nil?   # => true (it was omitted in the JSON)

# Serialize back to JSON
puts user.to_json
```

### 6. C Bindings (FFI)
Calling C functions directly from Crystal is straightforward.
```crystal
# Bind to the standard C library
@[Link("c")]
lib LibC
  # Define the C function signature
  fun cos(x : Float64) : Float64
end

# Call the C function
result = LibC.cos(1.5)
puts "Cosine of 1.5 is #{result}"
```

## Best Practices

### 1. Embrace the Type System
While Crystal has excellent type inference, explicitly typing method arguments and return types improves readability and helps the compiler catch errors earlier. It also speeds up compilation since the compiler has to do less guessing.
```crystal
# Good
def calculate_total(prices : Array(Float64)) : Float64
  prices.sum
end
```

### 2. Handle Nil Explicitly
Never assume a value is present if its type includes `Nil`. Use `if` assignments or `try` blocks.
```crystal
user = find_user(id) # Returns User | Nil
if user
  # Compiler knows `user` is strictly `User` here
  puts user.name
else
  puts "User not found"
end

# Alternatively, use `try` to call a method if not nil
puts user.try(&.name)
```

### 3. Use Structs for Immutable Data
Crystal offers both `class` (reference types allocated on the heap) and `struct` (value types allocated on the stack). Use structs for small, immutable data structures (like 2D points, configuration objects) to reduce garbage collection overhead and improve performance.

### 4. Leverage Standard Library over External Dependencies
Crystal’s standard library is batteries-included. Features like JSON parsing, HTTP client/server, WebSockets, and cryptography are built-in. Before reaching for a third-party shard, check if the standard library has what you need.

### 5. Use `crystal tool format`
Always format your code before committing. The community relies entirely on the built-in formatter, which prevents endless debates about spacing and alignment. Integrate it into your editor or CI pipeline.

### 6. Be Mindful of Compile Times
Crystal evaluates the entire program and heavily optimizes it via LLVM. This makes compilation slow. During development, avoid compiling with `--release`. Use `crystal run` or a watcher tool (like `sentry`) to quickly test changes without running the full optimization passes.
