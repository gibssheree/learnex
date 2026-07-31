---
tags: [programming-language, oop, enterprise, dotnet]
category: OOP/Enterprise
status: to-learn
---

# C#

**Definition:** Microsoft's modern .NET language with strong tooling, managed memory, async/await, LINQ, and a broad application model spanning desktop, web, cloud, and games.

**Paradigm:** OOP, multi-paradigm | **Typing:** Static

## Pros
- Modern language features include pattern matching, records, nullable reference types, top-level statements, and async streams.
- Excellent IDE support in Visual Studio and Rider, with strong refactoring and debugger integration.
- .NET runs cross-platform and ships a mature base class library plus a high-performance runtime.
- ASP.NET Core is a strong option for web APIs, background services, and real-time apps.
- Unity, Godot tooling, and other game workflows make C# a practical scripting language for large projects.

## Cons
- Legacy assumptions about Windows still linger in some libraries, documentation, and enterprise habits.
- The ecosystem is broad, but some third-party packages are heavily Microsoft-centric or opinionated about .NET idioms.
- Runtime features are powerful enough that projects can become abstraction-heavy if teams overuse inheritance or reflection.
- AOT, trimming, and mobile/native deployment require more care than traditional server-side deployments.

## Best For
- Windows desktop apps, internal tools, and enterprise productivity software.
- Game logic and tooling, especially with Unity.
- Web APIs, background workers, and cloud services on the .NET stack.

## Real Examples
- Unity uses C# as its primary scripting language.
- Stack Overflow’s backend is a well-known large-scale .NET/C# system.
- Many enterprise ERP, finance, and internal workflow systems use C# and ASP.NET Core.
- Microsoft’s own product teams use C# across services, tooling, and desktop applications.

## Use Cases
- Game scripting, editor tooling, and asset pipelines in Unity-based projects.
- REST APIs and background jobs using ASP.NET Core and hosted services.
- Windows desktop and internal business applications.
- Example:

```csharp
var names = new[] { "Ada", "Grace", "Linus" };
foreach (var name in names)
{
	Console.WriteLine(name);
}
```

## Extended Syntax & Features

### Basic Data Types and Variables
C# offers a wide variety of built-in data types. It is statically typed, meaning variable types are known at compile time.
- **Value Types:** `int`, `double`, `float`, `decimal`, `bool`, `char`, `structs`.
- **Reference Types:** `string`, `object`, `class`, `interface`, `delegate`, arrays.
- **Implicit Typing:** You can use the `var` keyword to let the compiler infer the type based on the assigned value. This is highly idiomatic in modern C#.

### Control Flow
C# provides standard control flow structures:
- `if`, `else if`, `else`
- `switch` statements (and modern `switch` expressions)
- Loops: `for`, `foreach`, `while`, `do-while`
- Jump statements: `break`, `continue`, `return`, `goto` (rarely used).

### Properties
Unlike languages like Java where getter and setter methods are conventionally used, C# introduces **Properties**. Properties allow exposing data while keeping the implementation encapsulated. Auto-implemented properties make defining models incredibly terse.
```csharp
public class Person
{
    // Auto-implemented property
    public string Name { get; set; }
    
    // Property with custom logic
    private int _age;
    public int Age
    {
        get { return _age; }
        set 
        { 
            if (value >= 0) _age = value; 
        }
    }
}
```

### Language Integrated Query (LINQ)
LINQ is one of C#'s crown jewels. It brings declarative, SQL-like query capabilities directly into the language, allowing developers to filter, sort, and project collections in a unified manner. It works with local collections (LINQ to Objects) and external data sources (like Entity Framework for databases).

## Advanced Concepts

### Memory Management and Garbage Collection
C# runs on the .NET Common Language Runtime (CLR), which handles memory allocation and deallocation via a Garbage Collector (GC). The GC runs automatically, freeing memory used by objects that are no longer reachable. For unmanaged resources (like file handles or database connections), C# provides the `IDisposable` interface and the `using` statement to ensure deterministic cleanup.

### Asynchronous Programming
The `async` and `await` keywords revolutionized concurrent programming in C#. They allow writing non-blocking asynchronous code that reads like synchronous code. When an `await` is encountered, the method yields control back to the caller until the awaited task completes, which is crucial for scalable web applications and responsive UI apps.

### Generics
Generics allow you to define classes, interfaces, and methods with placeholders (type parameters) for the data types they store or use. This maximizes code reuse, type safety, and performance (by avoiding boxing/unboxing for value types). `List<T>` and `Dictionary<TKey, TValue>` are standard examples.

### Delegates and Events
A delegate is a type that safely encapsulates a method, similar to a function pointer in C or C++, but type-safe. Events are a specialized use of delegates that provide a publish/subscribe model. This is particularly prevalent in desktop GUI frameworks (like WPF or WinForms) and game engines like Unity.

### Pattern Matching
Modern C# versions have heavily expanded pattern matching capabilities. You can match against types, property values, and structural patterns. This allows for very expressive and concise logic, especially when combined with `switch` expressions.

### Records and Init-Only Properties
Introduced in C# 9, `record` types provide a concise way to create immutable data models with value-based equality. `init` accessors allow properties to be set only during object initialization, enforcing immutability without the boilerplate of large constructors.

## Ecosystem & Tooling

### IDEs and Editors
- **Visual Studio:** Microsoft's flagship IDE for Windows. Unparalleled debugging, profiling, and enterprise development features.
- **Rider:** JetBrains' cross-platform IDE. Highly popular for its speed, powerful refactoring (ReSharper built-in), and deep Unity/Unreal integration.
- **VS Code:** A lightweight, cross-platform editor. With the C# Dev Kit extension, it offers a great experience for smaller projects or cross-platform .NET Core development.

### .NET CLI and SDK
The `.NET CLI` (`dotnet`) is the primary tool for creating, building, running, and publishing .NET applications from the command line. It works seamlessly across Windows, macOS, and Linux.

### NuGet
NuGet is the package manager for .NET. The public repository contains hundreds of thousands of packages. `dotnet add package <PackageName>` is the standard way to incorporate third-party libraries.

### Major Frameworks
- **ASP.NET Core:** A high-performance, cross-platform framework for building modern, cloud-based, internet-connected applications (APIs, MVC apps, SignalR real-time hubs).
- **Entity Framework Core (EF Core):** The standard Object-Relational Mapper (ORM) for .NET, simplifying database access and migrations.
- **Blazor:** A framework for building interactive client-side web UI using C# instead of JavaScript.
- **MAUI (Multi-platform App UI):** The evolution of Xamarin, allowing developers to create native mobile and desktop apps with a single C# codebase.
- **Unity:** The world's most popular game engine relies almost entirely on C# for game logic and scripting.

## Code Examples

### 1. Hello World and Basic Input/Output
This example demonstrates a modern C# entry point using Top-Level Statements.
```csharp
// Modern C# allows top-level statements, meaning you don't explicitly 
// need a 'class Program' or 'static void Main' for simple apps.
using System;

Console.WriteLine("Welcome to C#!");
Console.Write("Please enter your name: ");
string? name = Console.ReadLine();

// String interpolation using the '$' prefix
Console.WriteLine($"Hello, {name}! It's a great day to learn C#.");
```

### 2. Collections and Iteration
Demonstrating `List<T>`, dictionaries, and basic looping.
```csharp
using System;
using System.Collections.Generic;

// Lists are dynamic arrays
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
numbers.Add(6);

Console.WriteLine("Numbers in list:");
foreach (int num in numbers)
{
    Console.WriteLine(num);
}

// Dictionaries store key-value pairs
Dictionary<string, int> ages = new()
{
    { "Alice", 28 },
    { "Bob", 35 }
};

ages["Charlie"] = 42; // Add or update

foreach (var kvp in ages)
{
    Console.WriteLine($"{kvp.Key} is {kvp.Value} years old.");
}
```

### 3. Object-Oriented Programming
Demonstrating classes, inheritance, interfaces, and polymorphism.
```csharp
using System;

public interface IMovable
{
    void Move();
}

// Abstract base class
public abstract class Animal
{
    public string Name { get; set; }
    
    protected Animal(string name)
    {
        Name = name;
    }
    
    public abstract void Speak();
}

public class Dog : Animal, IMovable
{
    public Dog(string name) : base(name) { }
    
    public override void Speak()
    {
        Console.WriteLine($"{Name} says: Woof!");
    }
    
    public void Move()
    {
        Console.WriteLine($"{Name} runs on four legs.");
    }
}

// Usage:
// Animal myDog = new Dog("Buddy");
// myDog.Speak();
// ((IMovable)myDog).Move();
```

### 4. Advanced LINQ
LINQ makes querying data intuitive and powerful.
```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class Employee
{
    public string Name { get; set; }
    public string Department { get; set; }
    public decimal Salary { get; set; }
}

public class LinqExample
{
    public static void Run()
    {
        var employees = new List<Employee>
        {
            new Employee { Name = "Alice", Department = "IT", Salary = 75000 },
            new Employee { Name = "Bob", Department = "HR", Salary = 60000 },
            new Employee { Name = "Charlie", Department = "IT", Salary = 85000 },
            new Employee { Name = "Diana", Department = "Sales", Salary = 65000 }
        };

        // Method syntax LINQ
        var highEarnersInIT = employees
            .Where(e => e.Department == "IT" && e.Salary > 70000)
            .OrderByDescending(e => e.Salary)
            .Select(e => e.Name);

        Console.WriteLine("High earners in IT:");
        foreach (var name in highEarnersInIT)
        {
            Console.WriteLine(name);
        }
    }
}
```

### 5. Asynchronous Programming and Networking
Using `HttpClient` with `async/await` for non-blocking I/O.
```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;

public class NetworkExample
{
    // The method signature uses 'async' and returns a 'Task'
    public static async Task FetchDataAsync()
    {
        using HttpClient client = new HttpClient();
        
        try
        {
            Console.WriteLine("Fetching data...");
            // await pauses method execution until the HTTP request completes,
            // freeing the calling thread to do other work.
            string responseBody = await client.GetStringAsync("https://api.github.com/zen");
            
            Console.WriteLine("Response received:");
            Console.WriteLine(responseBody);
        }
        catch (HttpRequestException e)
        {
            Console.WriteLine($"\nException Caught! Message: {e.Message}");
        }
    }
}
```

### 6. Modern Pattern Matching and Records
Showcasing C# 9+ features for concise data manipulation.
```csharp
using System;

// Records provide value equality and concise syntax for immutable data
public record Point(int X, int Y);

public abstract record Shape;
public record Circle(double Radius) : Shape;
public record Rectangle(double Width, double Height) : Shape;
public record Triangle(double Base, double Height) : Shape;

public class Geometry
{
    public static double CalculateArea(Shape shape) => shape switch
    {
        // Switch expression with pattern matching
        Circle c => Math.PI * c.Radius * c.Radius,
        Rectangle r => r.Width * r.Height,
        Triangle t => (t.Base * t.Height) / 2,
        null => throw new ArgumentNullException(nameof(shape)),
        _ => throw new ArgumentException("Unknown shape")
    };
    
    public static void Run()
    {
        Shape myCircle = new Circle(5.0);
        Console.WriteLine($"Area: {CalculateArea(myCircle)}");
        
        // Records support non-destructive mutation with 'with' expressions
        Point p1 = new Point(10, 20);
        Point p2 = p1 with { X = 15 }; // Creates a copy with X modified
        
        Console.WriteLine(p1); // Point { X = 10, Y = 20 }
        Console.WriteLine(p2); // Point { X = 15, Y = 20 }
    }
}
```

### 7. File I/O and Deterministic Cleanup
Using the `using` statement for safely handling unmanaged resources.
```csharp
using System;
using System.IO;
using System.Threading.Tasks;

public class FileExample
{
    public static async Task WriteAndReadFileAsync()
    {
        string filePath = "example.txt";
        
        // The 'using' declaration ensures the StreamWriter is disposed (and file closed)
        // when it goes out of scope at the end of the method.
        using (StreamWriter writer = new StreamWriter(filePath))
        {
            await writer.WriteLineAsync("First line of text.");
            await writer.WriteLineAsync("Second line of text.");
        } // writer is disposed here

        // Simpler syntax in modern C# (using declaration)
        using StreamReader reader = new StreamReader(filePath);
        string content = await reader.ReadToEndAsync();
        
        Console.WriteLine("File contents:");
        Console.WriteLine(content);
        
        File.Delete(filePath); // Cleanup
    }
}
```

## Best Practices

### SOLID Principles
C# is heavily steeped in Object-Oriented design. Adhering to SOLID principles (Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion) is standard practice. The language features (interfaces, abstract classes, dependency injection containers built into ASP.NET Core) are tailored to support these patterns.

### Naming Conventions
- **PascalCase:** For Classes, Interfaces, Methods, Properties, and Namespaces (e.g., `MyClass`, `ExecuteTask()`). Interface names should start with a capital `I` (e.g., `IEnumerable`).
- **camelCase:** For local variables and method parameters.
- **_camelCase:** (Underscore prefix) for private instance fields (e.g., `_myPrivateField`).

### Dependency Injection
In modern .NET applications, particularly ASP.NET Core, Dependency Injection (DI) is a first-class citizen. Rather than instantiating dependencies inside classes with the `new` keyword, accept them via constructor parameters. This makes your code highly testable and decoupled.

### Asynchronous Best Practices
- **Async All the Way:** Don't mix synchronous and asynchronous code. If you call an async method, the calling method should also be async. Using `.Result` or `.Wait()` on Tasks can cause deadlocks.
- **Suffix Async Methods:** By convention, name asynchronous methods with an "Async" suffix (e.g., `GetDataAsync()`).
- **Avoid `async void`:** The only exception for `async void` is for event handlers (like UI button clicks). Everywhere else, use `async Task`.

### Use LINQ Where Appropriate
Favor LINQ for transforming, filtering, and querying collections over manual `for`/`foreach` loops. It communicates the *intent* of the data manipulation much more clearly. However, be mindful of performance in highly critical hot-paths, as LINQ can introduce slight overheads via allocations and delegate invocations.

### Exception Handling
- Throw specific exceptions (e.g., `ArgumentNullException`, `InvalidOperationException`) rather than the base `Exception` class.
- Don't use exceptions for control flow.
- When re-throwing an exception inside a `catch` block, use `throw;` rather than `throw e;` to preserve the original stack trace.

### Prefer Records and Init for Immutability
When modeling simple data transfer objects (DTOs), API responses, or configuration settings, prefer `record` types or classes with `init` properties over mutable classes. Immutability leads to fewer bugs, especially in concurrent applications.
