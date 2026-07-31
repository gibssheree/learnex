---
tags: [programming-language, scripting, oop, web]
category: Scripting/Dynamic
status: to-learn
---

# Ruby

**Definition:** Dynamic language focused on readable code, expressive object models, and fast web application development through the Ruby on Rails ecosystem.

**Paradigm:** OOP | **Typing:** Dynamic

## Pros
- Highly readable syntax with blocks, iterators, and a rich standard library for everyday scripting.
- Rails accelerates CRUD-heavy web development with strong conventions, generators, migrations, and a large gem ecosystem.
- Duck typing and metaprogramming make the language flexible for DSLs and framework design.
- Great for teams that value developer experience and concise domain modeling.

## Cons
- MRI’s interpreter is slower than JVM or native runtimes for many workloads.
- Metaprogramming and dynamic dispatch can obscure behavior in large codebases.
- Concurrency options are improving, but the traditional threading story is not as strong as some competing ecosystems.
- The market is smaller than its Rails peak, so hiring can be more selective.

## Best For
- Startups and product teams optimizing for speed of delivery.
- Server-rendered web apps, APIs, and admin tools built with Rails or Sinatra.

## Real Examples
- GitHub was famously built with Ruby on Rails in its early years.
- Shopify remains one of the most prominent large-scale Ruby/Rails companies.
- Airbnb and many SaaS products used Ruby heavily during their growth phases.

## Use Cases
- Rapid prototyping, internal tools, and customer-facing SaaS CRUD workflows.
- E-commerce and subscription products where Rails conventions speed up shipping.
- Example:

```ruby
users = ["Ava", "Mina", "Leo"]
users.each { |name| puts name.upcase }
```

## Extended Syntax & Features

Ruby is a pure object-oriented language. Everything is an object, including numbers, booleans, and classes.

### Basic Data Types
- **Numbers**: Integers (`1`, `100`), Floats (`3.14`), Rationals (`1/3r`), Complex (`2+3i`).
- **Strings**: Text objects enclosed in single (`' '`) or double (`" "`) quotes. Double quotes allow string interpolation `#{}` and escape sequences.
- **Symbols**: Lightweight string alternatives, prefixed with a colon (`:symbol_name`). They are immutable and widely used as keys in hashes.
- **Booleans**: `true`, `false`. (Only `false` and `nil` are considered falsy in Ruby).
- **NilClass**: `nil` represents nothingness.
- **Arrays**: Ordered collections (`[1, 2, 3]`).
- **Hashes**: Key-value dictionaries (`{ key: 'value' }` or `{ :key => 'value' }`).

### Control Flow
Ruby offers a wide array of control structures.
- **If / Unless**:
  ```ruby
  if condition
    # ...
  elsif other_condition
    # ...
  else
    # ...
  end

  # Unless is equivalent to "if not"
  unless logged_in?
    redirect_to login_path
  end
  ```
- **Modifiers**:
  ```ruby
  puts "Hello" if visible
  return nil unless data_present
  ```
- **Case / When**:
  ```ruby
  case user_type
  when "admin"
    puts "Welcome Admin"
  when "user"
    puts "Welcome User"
  else
    puts "Welcome Guest"
  end
  ```
- **Loops**: While Ruby has `while` and `for` loops, idiomatic Ruby strongly prefers iterators.
  ```ruby
  while count < 10
    count += 1
  end

  5.times { |i| puts i }
  ```

### Blocks, Procs, and Lambdas
Ruby uses closures heavily, known as blocks.
- **Blocks**: Anonymous snippets of code passed to methods. They are defined by `{ ... }` for single lines or `do ... end` for multiple lines.
  ```ruby
  [1, 2, 3].each do |number|
    puts number * 2
  end
  ```
- **Procs**: Blocks saved to variables.
  ```ruby
  greeter = Proc.new { |name| puts "Hello #{name}" }
  greeter.call("Alice")
  ```
- **Lambdas**: Similar to Procs but they strictly check arguments and handle the `return` keyword differently (returning from the lambda itself rather than the enclosing method).
  ```ruby
  l = ->(x, y) { x + y }
  puts l.call(2, 3)
  ```

### Object-Oriented Features
- **Classes**: Defined using the `class` keyword.
- **Instance Variables**: Prefixed with `@` and belong to the specific object.
- **Class Variables**: Prefixed with `@@` and are shared among the class and its subclasses.
- **Modules**: Used as namespaces or as mixins to share behavior across unrelated classes (using `include` or `extend`).
- **Access Control**: `public`, `protected`, and `private` keywords restrict method visibility.

## Advanced Concepts

### Metaprogramming
Metaprogramming is writing code that writes code. Ruby excels at this, allowing dynamic method definition, intercepting missing methods, and inspecting objects at runtime.
- **`define_method`**: Dynamically creates a method at runtime.
- **`method_missing`**: A hook that is triggered when a non-existent method is called. This is how Rails dynamically creates finders like `find_by_first_name_and_last_name`.
  ```ruby
  class DynamicGreeter
    def method_missing(m, *args, &block)
      if m.to_s.start_with?("greet_")
        name = m.to_s.sub("greet_", "").capitalize
        puts "Hello, #{name}!"
      else
        super
      end
    end
  end
  dg = DynamicGreeter.new
  dg.greet_alice # Output: Hello, Alice!
  ```
- **`eval`, `class_eval`, `instance_eval`**: Allow execution of strings as Ruby code or executing blocks in the context of specific objects/classes.

### Concurrency Models
Ruby's concurrency historically struggled due to the Global Interpreter Lock (GIL) in the standard implementation (MRI/CRuby), meaning only one thread can execute Ruby code at a time.
- **Threads**: Useful for I/O bound tasks (like fetching multiple web pages concurrently), but not for CPU-bound tasks in MRI due to the GIL.
- **Fibers**: Lightweight, cooperative concurrency primitives. They provide manual control over scheduling (using `Fiber.yield` and `resume`). Ruby 3 introduced Fiber Scheduler for asynchronous I/O transparently.
- **Ractors**: Introduced in Ruby 3 as an experimental feature for parallel execution. Ractors are actor-model inspired objects that execute in parallel and do not share a global lock, passing messages instead.
- **JRuby and TruffleRuby**: Alternative Ruby implementations that lack a GIL and offer true thread parallelism on top of the JVM and GraalVM, respectively.

### Memory Management and Garbage Collection
Ruby uses an automatic garbage collector (GC).
- **Mark-and-Sweep**: Historically, Ruby used a simple mark-and-sweep algorithm.
- **Generational GC**: Since Ruby 2.1, it features a generational garbage collector, which separates objects into "young" and "old" generations. Most objects die young, so the GC scans the young generation more frequently, improving performance.
- **Compacting GC**: Ruby 2.7 introduced a compacting GC that can defragment the heap memory, reducing memory usage and improving cache locality for long-running processes (like web servers).

### Open Classes and Monkey Patching
Ruby allows modifying existing classes (even core ones like `String` or `Array`) at runtime. This is called monkey patching. While powerful, it can lead to conflicts if multiple libraries modify the same core method. Ruby introduced `Refinements` to scope these changes to specific files or modules.

## Ecosystem & Tooling

### Package Managers
- **RubyGems**: The default package manager for Ruby. Packages are called "gems".
- **Bundler**: The de facto tool for managing a project's gem dependencies. It reads a `Gemfile` and installs the specified versions, ensuring consistent environments across machines.

### Build and Automation
- **Rake**: Ruby Make. A task runner written in Ruby. Used extensively in Rails for database migrations, asset compilation, and general maintenance tasks.

### Popular Frameworks
- **Ruby on Rails**: The behemoth full-stack web framework that popularized MVC, convention over configuration, and active record patterns.
- **Sinatra**: A lightweight, micro-framework for creating quick APIs and simple web applications with minimal overhead.
- **Hanami**: A modern web framework focusing on clean architecture, separated components, and faster boot times.
- **Sidekiq**: The standard for background job processing, using Redis to manage job queues.

### Standard Library
Ruby comes with a very rich standard library (known as "batteries included").
- **`json`**: Built-in JSON parsing and generation.
- **`net/http`**: Standard library for making HTTP requests.
- **`csv`**: Excellent CSV reading and writing support.
- **`date` and `time`**: Comprehensive modules for handling timezones and dates.
- **`erb`**: Embedded Ruby. A templating system used for rendering HTML or configuration files.

### Testing
Ruby has a strong testing culture.
- **Minitest**: The default, fast, and simple testing framework included with Ruby.
- **RSpec**: A highly popular BDD (Behavior-Driven Development) testing framework.
- **Capybara**: Used for end-to-end integration testing simulating user interactions in a browser.

### Version Managers
- **RVM (Ruby Version Manager)**: Historically the most popular.
- **rbenv**: Lighter and simpler, relying on shim executables.
- **asdf**: A universal version manager that supports Ruby via a plugin.

## Code Examples

### 1. Hello World & Basic Data Structures
```ruby
# hello_world.rb
puts "Hello, World!"

# Data Structures
# Array
fruits = ["Apple", "Banana", "Cherry"]
fruits << "Date" # Append to array
fruits.each_with_index do |fruit, index|
  puts "#{index + 1}: #{fruit}"
end

# Hash
person = {
  name: "John Doe",
  age: 30,
  city: "New York"
}
puts "Name: #{person[:name]}, Age: #{person[:age]}"

# Symbol vs String keys
person_string_keys = { "name" => "Jane", "age" => 25 }
```

### 2. Classes and Modules (Mixins)
```ruby
# module_mixin.rb
module Describable
  def describe
    "I am a #{self.class.name} with ID: #{@id}"
  end
end

class Product
  include Describable # Mixin the module

  attr_accessor :name, :price # Generates getters and setters
  attr_reader :id             # Generates only getter

  def initialize(id, name, price)
    @id = id
    @name = name
    @price = price
  end

  def discount(percent)
    @price -= @price * (percent / 100.0)
  end
end

laptop = Product.new(1, "MacBook", 1500)
puts laptop.describe
laptop.discount(10)
puts "New Price: $#{laptop.price}"
```

### 3. Enumerables and Blocks
Ruby's `Enumerable` module provides a massive set of methods for collections.
```ruby
# enumerables.rb
numbers = (1..10).to_a # Range to Array

# Map / Collect
squares = numbers.map { |n| n ** 2 }

# Select / Filter
evens = numbers.select(&:even?) # Using Symbol#to_proc syntax

# Reduce / Inject
sum = numbers.reduce(0, :+)

# Grouping
grouped_by_remainder = numbers.group_by { |n| n % 3 }

puts "Squares: #{squares}"
puts "Evens: #{evens}"
puts "Sum: #{sum}"
puts "Grouped: #{grouped_by_remainder}"
```

### 4. Metaprogramming: Dynamic Methods
```ruby
# metaprogramming.rb
class HtmlBuilder
  # Create a method for any HTML tag missing
  def method_missing(tag_name, content = nil, &block)
    if block_given?
      # If a block is given, recursively yield
      "<#{tag_name}>#{yield}</#{tag_name}>"
    else
      "<#{tag_name}>#{content}</#{tag_name}>"
    end
  end

  # Required when overriding method_missing
  def respond_to_missing?(method_name, include_private = false)
    true
  end
end

builder = HtmlBuilder.new
html = builder.html do
  builder.body do
    builder.h1("Welcome to Ruby!") +
    builder.p("Metaprogramming is fun.")
  end
end
puts html
```

### 5. Network Requests with standard library and blocks
```ruby
# network_request.rb
require 'net/http'
require 'json'

url = URI('https://jsonplaceholder.typicode.com/todos/1')

begin
  response = Net::HTTP.get_response(url)

  if response.is_a?(Net::HTTPSuccess)
    # Parse JSON string into Ruby Hash
    data = JSON.parse(response.body)
    puts "User ID: #{data['userId']}"
    puts "Title: #{data['title']}"
    puts "Completed: #{data['completed']}"
  else
    puts "Error: Received HTTP #{response.code}"
  end
rescue SocketError => e
  puts "Network error: #{e.message}"
rescue JSON::ParserError => e
  puts "Failed to parse JSON: #{e.message}"
end
```

### 6. Exception Handling
```ruby
# exception_handling.rb
def divide(a, b)
  raise ArgumentError, "b cannot be negative" if b < 0
  a / b
rescue ZeroDivisionError => e
  puts "Rescued: You cannot divide by zero!"
  0 # Return value on rescue
rescue ArgumentError => e
  puts "Rescued: #{e.message}"
  nil
ensure
  puts "This block always runs, regardless of exceptions."
end

puts divide(10, 2)
puts divide(10, 0)
puts divide(10, -5)
```

### 7. Concurrency with Threads
```ruby
# threads.rb
urls_to_fetch = [
  "http://example.com",
  "http://example.org",
  "http://example.net"
]

threads = []

urls_to_fetch.each do |url|
  # Spawn a new thread for each URL
  threads << Thread.new(url) do |u|
    require 'net/http'
    start_time = Time.now
    response = Net::HTTP.get_response(URI(u))
    duration = Time.now - start_time
    puts "Fetched #{u} in #{duration.round(3)}s with status #{response.code}"
  end
end

# Wait for all threads to complete
threads.each(&:join)
puts "All fetches complete."
```

## Best Practices

### Idiomatic Ruby
- **Use blocks over loops**: Prefer `each`, `map`, `select` over `for` or `while`.
- **Symbol#to_proc**: Use the shorthand `(&:method)` for mapping or selecting: `users.map(&:name)`.
- **Implicit Returns**: Ruby methods automatically return the result of the last evaluated expression. Omit the `return` keyword unless returning early.
- **Naming Conventions**:
  - `snake_case` for variables, symbols, and methods.
  - `CamelCase` for Classes and Modules.
  - `SCREAMING_SNAKE_CASE` for Constants.
  - Suffix methods that return booleans with `?` (e.g., `empty?`, `valid?`).
  - Suffix methods that mutate the object (or are dangerous) with `!` (e.g., `sort!`, `save!`).

### Common Pitfalls
- **String mutation**: Strings in Ruby are mutable by default. Modifying them in loops or keeping them in constants can lead to bugs. Use `.freeze` for string constants (or the magic comment `# frozen_string_literal: true` at the top of the file) to prevent modification and reduce object allocation.
- **Monkey Patching globally**: If you must monkey patch, use `Refinements` (`using ModuleName`) to limit the scope of the monkey patch to the current file or lexical scope, rather than polluting the global namespace.
- **N+1 Queries in Rails**: A classic performance trap when iterating over database records. Always use `includes` or `eager_load` to fetch associated records in a single query.
- **Variables Scope in blocks**: Variables defined outside a block are accessible inside. Be careful not to accidentally overwrite a variable name from the outer scope within a block iterator.

### Linting and Style
- **RuboCop**: The definitive linter and code formatter for Ruby. Adhering to the standard Ruby Style Guide is highly recommended. It enforces consistency across projects and catches common syntactical mistakes.

### Memory Leaks
- Avoid long-lived caches inside standard Ruby data structures (like global Hashes) without eviction policies. Because Ruby GC relies on reachability, keeping references to objects forever will prevent them from being garbage collected. Use specialized caching systems (like Redis or Memcached) instead.
