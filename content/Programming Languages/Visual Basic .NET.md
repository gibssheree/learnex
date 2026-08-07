---
tags: [programming-language, oop, dotnet, legacy]
category: OOP/Enterprise
status: to-learn
---

# Visual Basic .NET

**Definition:** Beginner-friendly, English-like language on the .NET platform, evolved from classic Visual Basic and still used for legacy and internal business tooling.

**Paradigm:** OOP | **Typing:** Static

## Pros
- Easy to read and learn for developers and non-developers alike.
- Strong Windows, Office, and .NET integration.
- Useful for rapid internal tools and line-of-business applications.
- Good interop with the rest of the .NET ecosystem.

## Cons
- Often perceived as outdated compared with C#.
- Community momentum is smaller and shrinking.
- Fewer new tutorials and less mindshare in modern .NET work.
- Outside Microsoft shops, the language is rarely a first choice.

## Best For
- Internal business tools and legacy Windows automation.
- Maintaining older .NET applications and Office-adjacent scripts.

## Real Examples
- Older enterprise Windows forms applications.
- Office automation and line-of-business internal tools.

## Use Cases
- Internal line-of-business apps, WinForms utilities, and simple automation tools.
- Legacy system maintenance where the codebase already exists.

## Extended Syntax & Features

Visual Basic .NET (VB.NET) was designed to be easy to learn, prioritizing English-like keywords over the curly braces and symbols common in C-style languages. Despite its conversational syntax, VB.NET is a fully featured, strongly-typed, object-oriented language that runs on the Common Language Runtime (CLR) of the .NET Framework.

### Basic Data Types
VB.NET supports all standard .NET data types, using recognizable keywords:
- `Integer`: A 32-bit signed integer.
- `Long`: A 64-bit signed integer.
- `Short`: A 16-bit signed integer.
- `Double`: A double-precision floating-point number.
- `Decimal`: A 128-bit data type suitable for financial calculations.
- `Boolean`: Represents `True` or `False`.
- `String`: A sequence of Unicode characters.
- `Char`: A single Unicode character.
- `Date`: Represents a date and time.
- `Object`: The root type from which all other types derive.

Variables are declared using the `Dim` keyword (short for Dimension):
```vb
Dim age As Integer = 30
Dim name As String = "Alice"
Dim isEmployed As Boolean = True
Dim salary As Decimal = 65000.5D
```

### Control Flow
VB.NET provides traditional control flow structures, block-scoped by keywords like `End If`, `Next`, and `End Select`.

**If-Then-Else:**
```vb
If age >= 18 Then
    Console.WriteLine("Adult")
ElseIf age >= 13 Then
    Console.WriteLine("Teenager")
Else
    Console.WriteLine("Child")
End If
```

**Select Case (Switch statement equivalent):**
```vb
Select Case dayOfWeek
    Case 1
        Console.WriteLine("Monday")
    Case 6, 7
        Console.WriteLine("Weekend")
    Case Else
        Console.WriteLine("Midweek")
End Select
```

**Loops:**
- `For ... Next`
- `For Each ... Next` (Iteration over collections)
- `While ... End While`
- `Do While ... Loop` or `Do Until ... Loop`

```vb
For i As Integer = 1 To 5
    Console.WriteLine("Iteration: " & i)
Next

For Each item In collection
    Console.WriteLine(item.ToString())
Next
```

### Functions and Methods
In VB.NET, subroutines that do not return a value are called `Sub`, and those that do return a value are called `Function`. Parameters can be passed `ByVal` (the default) or `ByRef`.

```vb
' A subroutine (no return value)
Sub PrintGreeting(ByVal name As String)
    Console.WriteLine("Hello, " & name)
End Sub

' A function (returns a value)
Function CalculateArea(length As Double, width As Double) As Double
    Return length * width
End Function
```

### Classes and Object-Oriented Features
VB.NET is fully object-oriented, supporting inheritance, polymorphism, encapsulation, and abstraction.
- Classes are defined using `Class ... End Class`.
- Constructors are named `New`.
- Properties use getters and setters, though auto-implemented properties are common.

```vb
Public Class Person
    Public Property Name As String
    Public Property Age As Integer

    Public Sub New(name As String, age As Integer)
        Me.Name = name
        Me.Age = age
    End Sub

    Public Overridable Sub Speak()
        Console.WriteLine("Hello, I am " & Me.Name)
    End Sub
End Class
```

## Advanced Concepts

VB.NET leverages the robust architecture of the .NET framework, meaning its advanced concepts mirror those of C# and F#.

### Memory Management and Garbage Collection
Memory management in VB.NET is handled automatically by the .NET Garbage Collector (GC). The GC allocates and deallocates memory for objects on the managed heap. While developers do not have to free memory manually, understanding the `IDisposable` interface and the `Using` statement is crucial for deterministically releasing unmanaged resources like file handles or database connections.

```vb
Using reader As New System.IO.StreamReader("file.txt")
    Dim content As String = reader.ReadToEnd()
    Console.WriteLine(content)
End Using ' The reader is automatically disposed here.
```

### Concurrency and Asynchronous Programming
Modern VB.NET natively supports the Task-based Asynchronous Pattern (TAP) via the `Async` and `Await` keywords. This allows developers to write non-blocking code that looks synchronous, avoiding callback hell and UI-freezing.

```vb
Public Async Function FetchDataAsync(url As String) As Task(Of String)
    Using client As New HttpClient()
        ' Await suspends the execution until the network request completes
        Dim response As String = Await client.GetStringAsync(url)
        Return response
    End Using
End Function
```

### Generics
Generics allow you to define classes, interfaces, and methods with placeholders for the types they store or use. This improves type safety and performance by avoiding boxing and unboxing of value types. In VB.NET, generics are denoted using the `(Of T)` syntax.

```vb
' A generic class
Public Class GenericBox(Of T)
    Private _item As T

    Public Sub SetItem(item As T)
        _item = item
    End Sub

    Public Function GetItem() As T
        Return _item
    End Function
End Class
```

### Language-Integrated Query (LINQ)
One of the most powerful features of VB.NET is its deep integration with LINQ. VB.NET provides query comprehension syntax that closely resembles SQL, often making it more expressive for database queries and data manipulation than its C# counterpart.

```vb
Dim numbers As Integer() = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
Dim evens = From num In numbers
            Where num Mod 2 = 0
            Select num

For Each n In evens
    Console.WriteLine(n)
Next
```

### Late Binding and Dynamic Typing
Due to its legacy and COM interop requirements, VB.NET supports late binding. By default (if `Option Strict` is Off), you can call methods on `Object` types at runtime. While this introduces flexibility similar to dynamic languages, it sacrifices compile-time type safety. It is strongly recommended to set `Option Strict On` to prevent unintended late binding.

## Ecosystem & Tooling

Because VB.NET is a first-class citizen of the .NET platform (though it has taken a backseat to C# in recent years), it enjoys access to the vast .NET ecosystem.

### Tooling
- **Visual Studio**: The premier IDE for VB.NET. It offers unparalleled features for VB.NET, including background compilation, a rich WinForms drag-and-drop designer, and extensive refactoring tools.
- **.NET CLI**: The `dotnet` command-line tool can create, build, and run VB.NET projects (`dotnet new console -lang vb`).
- **MSBuild**: The build engine used under the hood to compile VB.NET projects into MSIL (Microsoft Intermediate Language).

### Package Managers
- **NuGet**: The standard package manager for all .NET languages. Any library written in C# and published on NuGet can be seamlessly consumed in a VB.NET project.

### Frameworks and Environments
- **.NET Core / .NET 5+**: While Microsoft has stated that VB.NET will not evolve as rapidly as C# going forward, it is fully supported in modern .NET for console applications, class libraries, and web APIs.
- **Windows Forms (WinForms) & WPF**: The traditional bread-and-butter for VB.NET, heavily used for building thick-client Windows desktop applications.
- **ASP.NET**: Historically, VB.NET was widely used in ASP.NET Web Forms. While still possible in ASP.NET Core, it's far less common for new web projects.

### Standard Libraries
VB.NET uses the Base Class Library (BCL) of .NET (`System.*` namespaces). In addition, it includes the `Microsoft.VisualBasic` namespace, which provides compatibility functions and unique features like `My` namespace (`My.Computer`, `My.Application`) that offer simplified access to the OS, network, and application state.

## Code Examples

### 1. Hello World
The classic introductory program. VB.NET uses a `Module` or a `Class` containing a `Main` subroutine as the entry point.

```vb
' Program.vb
Imports System

Module Program
    Sub Main()
        ' Prints a message to the console
        Console.WriteLine("Hello, World!")
        
        ' Wait for user input before closing
        Console.ReadLine()
    End Sub
End Module
```

### 2. Data Structures and Collections
Working with .NET generic collections is strongly typed and safe. Here we use a `List(Of T)` and a `Dictionary(Of TKey, TValue)`.

```vb
Imports System.Collections.Generic

Module CollectionsExample
    Sub Main()
        ' Using a generic List
        Dim fruits As New List(Of String)()
        fruits.Add("Apple")
        fruits.Add("Banana")
        fruits.Add("Cherry")
        
        Console.WriteLine("--- List of Fruits ---")
        For Each fruit In fruits
            Console.WriteLine(fruit)
        Next
        
        ' Using a generic Dictionary
        Dim ages As New Dictionary(Of String, Integer)()
        ages.Add("Alice", 28)
        ages.Add("Bob", 35)
        
        Console.WriteLine(vbCrLf & "--- Dictionary of Ages ---")
        For Each kvp In ages
            Console.WriteLine($"{kvp.Key} is {kvp.Value} years old.")
        Next
    End Sub
End Module
```

### 3. Object-Oriented Programming
Demonstrating inheritance, method overriding, and polymorphism.

```vb
Public MustInherit Class Animal
    Public Property Name As String
    
    Public Sub New(name As String)
        Me.Name = name
    End Sub
    
    ' An abstract method that must be implemented by derived classes
    Public MustOverride Sub MakeSound()
End Class

Public Class Dog
    Inherits Animal
    
    Public Sub New(name As String)
        MyBase.New(name)
    End Sub
    
    Public Overrides Sub MakeSound()
        Console.WriteLine($"{Name} says: Woof!")
    End Sub
End Class

Public Class Cat
    Inherits Animal
    
    Public Sub New(name As String)
        MyBase.New(name)
    End Sub
    
    Public Overrides Sub MakeSound()
        Console.WriteLine($"{Name} says: Meow!")
    End Sub
End Class

Module OOPExample
    Sub Main()
        Dim myPets As New List(Of Animal) From {
            New Dog("Buddy"),
            New Cat("Whiskers")
        }
        
        For Each pet In myPets
            pet.MakeSound()
        Next
    End Sub
End Module
```

### 4. File I/O and Exception Handling
Reading and writing files while properly handling potential errors using `Try...Catch...Finally`.

```vb
Imports System.IO

Module FileIOExample
    Sub Main()
        Dim filePath As String = "test.txt"
        
        ' Writing to a file
        Try
            Using writer As New StreamWriter(filePath)
                writer.WriteLine("This is the first line.")
                writer.WriteLine("This is the second line.")
            End Using
            Console.WriteLine("Data successfully written to file.")
            
        Catch ex As UnauthorizedAccessException
            Console.WriteLine("Error: You do not have permission to write to this file.")
        Catch ex As Exception
            Console.WriteLine($"An unexpected error occurred: {ex.Message}")
        End Try
        
        ' Reading from a file
        Try
            If File.Exists(filePath) Then
                Using reader As New StreamReader(filePath)
                    Dim content As String = reader.ReadToEnd()
                    Console.WriteLine(vbCrLf & "File Content:")
                    Console.WriteLine(content)
                End Using
            Else
                Console.WriteLine("Error: File does not exist.")
            End If
        Catch ex As Exception
            Console.WriteLine($"Failed to read file: {ex.Message}")
        Finally
            Console.WriteLine("File IO operations completed.")
        End Try
    End Sub
End Module
```

### 5. Asynchronous Network Request
Using `HttpClient` and the `Async`/`Await` pattern to fetch data from an API without blocking the main thread.

```vb
Imports System.Net.Http
Imports System.Threading.Tasks

Module NetworkExample
    ' Main can be Async in modern .NET versions
    Async Function Main() As Task
        Dim apiUrl As String = "https://jsonplaceholder.typicode.com/todos/1"
        Console.WriteLine("Fetching data from API...")
        
        Try
            Dim result As String = Await FetchDataAsync(apiUrl)
            Console.WriteLine(vbCrLf & "Response received:")
            Console.WriteLine(result)
        Catch ex As HttpRequestException
            Console.WriteLine($"Network error: {ex.Message}")
        End Try
    End Function

    Async Function FetchDataAsync(url As String) As Task(Of String)
        Using client As New HttpClient()
            ' Asynchronously send a GET request
            Dim response As HttpResponseMessage = Await client.GetAsync(url)
            
            ' Ensure the request was successful
            response.EnsureSuccessStatusCode()
            
            ' Asynchronously read the response body as a string
            Dim responseBody As String = Await response.Content.ReadAsStringAsync()
            Return responseBody
        End Using
    End Function
End Module
```

### 6. Functional Features with LINQ
LINQ queries allow for declarative data manipulation. VB.NET has excellent syntactical support for LINQ.

```vb
Imports System.Linq

Module LinqExample
    Class Employee
        Public Property Id As Integer
        Public Property Name As String
        Public Property Department As String
        Public Property Salary As Decimal
    End Class

    Sub Main()
        Dim employees As New List(Of Employee) From {
            New Employee With {.Id = 1, .Name = "Alice", .Department = "IT", .Salary = 75000},
            New Employee With {.Id = 2, .Name = "Bob", .Department = "HR", .Salary = 60000},
            New Employee With {.Id = 3, .Name = "Charlie", .Department = "IT", .Salary = 85000},
            New Employee With {.Id = 4, .Name = "Diana", .Department = "Finance", .Salary = 90000}
        }
        
        ' Query syntax (similar to SQL)
        Dim itEmployees = From emp In employees
                          Where emp.Department = "IT"
                          Order By emp.Salary Descending
                          Select emp.Name, emp.Salary
                          
        Console.WriteLine("IT Department Employees (Ordered by Salary):")
        For Each emp In itEmployees
            Console.WriteLine($"{emp.Name} - {emp.Salary:C}")
        Next
        
        ' Method syntax (Fluent API)
        Dim averageSalary = employees.Average(Function(e) e.Salary)
        Console.WriteLine(vbCrLf & $"Average Company Salary: {averageSalary:C}")
    End Sub
End Module
```

## Best Practices

To write maintainable and robust VB.NET code, the community and Microsoft recommend several best practices:

### 1. Enforce Strict Typing (`Option Strict On`)
By default, VB.NET allows implicit type conversions and late binding, a relic of classic VB. This can lead to runtime errors that could have been caught at compile time.
**Rule:** Always enable `Option Strict On` in your project settings. This forces explicit casting and enforces type safety.
```vb
' With Option Strict On, this is illegal:
' Dim obj As Object = "Hello"
' Dim length As Integer = obj.Length ' Compiler Error

' Instead, do this:
Dim str As String = "Hello"
Dim length As Integer = str.Length
```

### 2. Avoid Legacy VB6 Functions
VB.NET includes the `Microsoft.VisualBasic` namespace for backward compatibility (e.g., `MsgBox()`, `CInt()`, `Len()`, `Mid()`).
**Rule:** Use modern .NET Framework equivalents instead. It makes code more uniform with the rest of the .NET ecosystem.
- Instead of `MsgBox()`, use `MessageBox.Show()` (in WinForms).
- Instead of `Len(str)`, use `str.Length`.
- Instead of `Mid(str, 1, 5)`, use `str.Substring(0, 5)`.
- Instead of `CInt(val)`, use `Convert.ToInt32(val)` or `Integer.Parse(val)`.

### 3. Use `String.Format` or String Interpolation
String concatenation using `&` can become messy and unreadable. Modern VB.NET supports string interpolation, making string construction cleaner.
```vb
Dim name As String = "John"
Dim age As Integer = 30

' Avoid:
Dim message1 = "My name is " & name & " and I am " & age & " years old."

' Better (String.Format):
Dim message2 = String.Format("My name is {0} and I am {1} years old.", name, age)

' Best (Interpolation):
Dim message3 = $"My name is {name} and I am {age} years old."
```

### 4. Properly Dispose of Resources
Whenever working with unmanaged resources (database connections, file streams, network sockets), ensure they are closed.
**Rule:** Always use the `Using` statement for objects that implement `IDisposable`. This guarantees `Dispose()` is called even if an exception occurs.
```vb
' The connection is guaranteed to be closed when exiting the block
Using conn As New SqlConnection(connectionString)
    conn.Open()
    ' Execute queries
End Using
```

### 5. Favor Generic Collections over Arrays or Legacy Collections
Legacy collections like `ArrayList` or `HashTable` are weakly typed (store `Object`), leading to boxing/unboxing overhead and runtime type errors.
**Rule:** Use generic collections from `System.Collections.Generic` (e.g., `List(Of T)`, `Dictionary(Of TKey, TValue)`). They are strongly typed and more performant.

### 6. Avoid "Catch Everything" Blocks
Swallowing exceptions without proper logging or handling makes debugging nearly impossible.
**Rule:** Catch specific exceptions when possible. If you must catch a general `Exception`, at least log it. Never leave an empty `Catch` block.
```vb
Try
    ' risky code
Catch ex As FileNotFoundException
    ' Handle specifically
    Console.WriteLine("File not found: " & ex.FileName)
Catch ex As Exception
    ' Log and/or rethrow
    Logger.LogError(ex)
    Throw
End Try
```

### 7. Name Conventions
Follow standard .NET naming conventions:
- **PascalCase** for Classes, Methods, Properties, and Namespaces.
- **camelCase** for local variables and method parameters.
- **_camelCase** for private class-level fields.

```vb
Public Class CustomerService
    Private _customerRepository As ICustomerRepository ' Private field

    Public Sub New(customerRepository As ICustomerRepository) ' Parameter
        _customerRepository = customerRepository
    End Sub

    Public Function GetCustomerName(customerId As Integer) As String ' Method and PascalCase
        Dim customerName As String = _customerRepository.GetName(customerId) ' Local variable
        Return customerName
    End Function
End Class
```
