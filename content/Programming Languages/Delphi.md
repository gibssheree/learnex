---
tags: [programming-language, oop, desktop, legacy]
category: OOP/Enterprise
status: to-learn
---

# Delphi (Object Pascal)

**Definition:** Object Pascal dialect known for fast native desktop app development, especially on Windows, with strong RAD tooling.

**Paradigm:** OOP | **Typing:** Static

## Pros
- Fast compilation and a productive edit-run cycle.
- Mature RAD tooling makes form-based app development quick.
- Good native Windows performance and direct access to Win32/desktop APIs.
- Strong fit for database-heavy internal tools and line-of-business apps.
- Single-pass compiler design results in extremely fast compile times.
- Compiles to a single executable without dependencies (e.g., no .NET runtime required).
- Powerful Visual Component Library (VCL) heavily encapsulates Windows API.
- FireMonkey (FMX) framework allows cross-platform development (macOS, iOS, Android, Linux).

## Cons
- The community is smaller and older than mainstream enterprise ecosystems.
- Windows-only mindshare limits broader adoption.
- Fewer modern third-party libraries than C#, Java, or web stacks.
- Long-lived codebases can accumulate framework-specific assumptions.
- Proprietary language and tooling (Embarcadero RAD Studio) can be expensive.
- Limited open-source ecosystem compared to alternatives like Python or Node.js.
- Finding younger developers familiar with the language can be challenging.

## Best For
- Native Windows desktop software and internal business tools.
- Maintaining legacy enterprise systems written in Object Pascal.
- Rapid Application Development (RAD) where time-to-market is critical.
- Developing high-performance desktop applications interacting heavily with hardware or OS APIs.
- Migration of legacy client-server apps to multi-tier architectures.

## Real Examples
- Skype’s original Windows client was famously built with Delphi.
- FL Studio (a popular digital audio workstation) is primarily developed in Delphi.
- HeidiSQL, a well-known database management tool.
- Total Commander (Windows file manager).
- Banking, POS, and internal line-of-business desktop apps have long used Delphi.

## Use Cases
- Desktop business apps, database front ends, and POS tools.
- Legacy system maintenance and Win32 integration.
- Industrial automation and control software.
- Custom ERP (Enterprise Resource Planning) systems.
- Healthcare and hospital information systems.

## Extended Syntax & Features

### Program Structure
A Delphi application typically consists of a project file (`.dpr`) and multiple unit files (`.pas`).
Each unit is divided into an `interface` section (public declarations) and an `implementation` section (code and private declarations).

### Variables and Data Types
Delphi is strongly typed. Common types include:
- Integers: `Integer`, `Cardinal`, `Int64`, `Byte`.
- Floating Point: `Single`, `Double`, `Extended`, `Currency`.
- Text: `Char`, `String` (UTF-16 natively since Delphi 2009).
- Booleans: `Boolean`.

Variables must be declared in a `var` block before they are used (though modern Delphi 10.3+ supports inline declarations).

### Functions and Procedures
Delphi distinguishes between functions (which return a value) and procedures (which do not).
Parameters can be passed by value, by reference (`var`), as output only (`out`), or as constant (`const`).

### Control Flow
- **If-Then-Else**: Standard branching structure. No semi-colon is allowed before `else`.
- **Case**: Switch-like statement for ordinal types (Integers, Chars, Enums).
- **For**: Definite loop (`for I := 1 to 10 do`).
- **While**: Pre-condition loop (`while x < 10 do`).
- **Repeat-Until**: Post-condition loop (`repeat ... until x > 10`).

### Object-Oriented Features
- **Classes**: Defined using the `class` keyword. Inherit from a single base class (default is `TObject`).
- **Properties**: Encapsulate field access with getters and setters.
- **Interfaces**: Defined using the `interface` keyword. Support multiple interface inheritance.
- **Methods**: Can be `virtual`, `dynamic`, `override`, `abstract`, or `static`.

## Advanced Concepts

### Memory Management
Delphi generally uses manual memory management for objects using `Create` and `Free`.
However, strings, dynamic arrays, and interfaces are reference-counted and automatically managed by the compiler.
For safe object cleanup, developers extensively use `try..finally` blocks.

### Run-Time Type Information (RTTI)
Delphi provides extensive RTTI, allowing for dynamic inspection of objects, invoking methods, and reading/writing properties at runtime. This is foundational for the IDE's visual designer and serialization libraries.

### Generics
Introduced in Delphi 2009, generics allow developers to write type-safe classes, interfaces, and methods that can work with any data type. The `System.Generics.Collections` unit provides generic lists, dictionaries, and queues.

### Anonymous Methods
Delphi supports closures (anonymous methods), enabling higher-order programming. They capture variables from their surrounding scope and extend their lifetime via reference counting.

### Concurrency
Historically, Delphi used the `TThread` class for threading. Modern Delphi includes the Parallel Programming Library (PPL), providing `TTask`, `TFuture`, and `TParallel.For` to simplify multi-threading and async operations.

## Ecosystem & Tooling

### The IDE
- **RAD Studio (Embarcadero)**: The flagship commercial IDE, known for its visual designer and drag-and-drop components. Includes Delphi and C++Builder.
- **Lazarus / Free Pascal**: An open-source IDE and compiler alternative that offers high compatibility with Delphi.

### Frameworks
- **VCL (Visual Component Library)**: The classic, deeply integrated Windows GUI framework wrapping the Win32/Win64 APIs.
- **FMX (FireMonkey)**: A vector-based, cross-platform framework for Windows, macOS, iOS, Android, and Linux.

### Data Access
- **FireDAC**: A universal data access library providing high-performance direct access to databases like SQL Server, Oracle, PostgreSQL, SQLite, and MySQL.

### Third-Party Components
Delphi boasts a massive ecosystem of 3rd party component vendors:
- **DevExpress**: Industry-standard UI controls for VCL.
- **TMS Software**: Extensive components for VCL, FMX, and web (TMS WEB Core).
- **FastReport**: Powerful reporting engine.

### Package Managers and Build Tools
- **GetIt Package Manager**: Integrated into RAD Studio for installing libraries and components.
- **MSBuild**: The Delphi compiler integrates seamlessly with MSBuild for CI/CD pipelines.

## Code Examples

### 1. Hello World (Console App)
```pascal
program HelloWorld;

{$APPTYPE CONSOLE}

uses
  System.SysUtils;

begin
  try
    // Write text to the console
    Writeln('Hello, World!');
    // Wait for user input before closing
    Readln;
  except
    on E: Exception do
      Writeln(E.ClassName, ': ', E.Message);
  end;
end.
```

### 2. Basic Data Structures & Loops
```pascal
procedure LoopExample;
var
  I: Integer;
  Names: array[0..2] of string;
begin
  Names[0] := 'Alice';
  Names[1] := 'Bob';
  Names[2] := 'Charlie';

  // For loop over array
  for I := Low(Names) to High(Names) do
  begin
    Writeln('Name: ', Names[I]);
  end;

  // While loop
  I := 0;
  while I < 3 do
  begin
    Writeln('Count: ', I);
    Inc(I); // Equivalent to I := I + 1
  end;
end;
```

### 3. Object-Oriented Programming (Classes & Inheritance)
```pascal
type
  // Base class
  TAnimal = class
  strict private
    FName: string;
  public
    constructor Create(const AName: string);
    function Speak: string; virtual; abstract;
    property Name: string read FName write FName;
  end;

  // Derived class
  TDog = class(TAnimal)
  public
    function Speak: string; override;
  end;

constructor TAnimal.Create(const AName: string);
begin
  FName := AName;
end;

function TDog.Speak: string;
begin
  Result := 'Woof! I am ' + Name;
end;

procedure TestOOP;
var
  MyDog: TAnimal;
begin
  MyDog := TDog.Create('Rex');
  try
    Writeln(MyDog.Speak);
  finally
    // Ensure memory is freed even if an exception occurs
    MyDog.Free;
  end;
end;
```

### 4. Generics and Collections
```pascal
uses
  System.Generics.Collections;

procedure TestGenerics;
var
  Dict: TDictionary<string, Integer>;
  Key: string;
begin
  // Create a generic dictionary
  Dict := TDictionary<string, Integer>.Create;
  try
    Dict.Add('One', 1);
    Dict.Add('Two', 2);
    Dict.Add('Three', 3);

    // Iterate through keys
    for Key in Dict.Keys do
    begin
      Writeln(Key, ' = ', Dict[Key]);
    end;
  finally
    Dict.Free;
  end;
end;
```

### 5. Anonymous Methods and Higher Order Functions
```pascal
uses
  System.SysUtils;

type
  // Define an anonymous method type
  TFilterFunc = reference to function(Value: Integer): Boolean;

procedure FilterArray(const Arr: TArray<Integer>; Filter: TFilterFunc);
var
  Val: Integer;
begin
  for Val in Arr do
  begin
    if Filter(Val) then
      Writeln(Val, ' passed the filter.');
  end;
end;

procedure TestAnonymousMethods;
var
  Numbers: TArray<Integer>;
begin
  Numbers := [1, 2, 3, 4, 5, 6];

  // Pass an inline anonymous method (closure)
  FilterArray(Numbers, function(Value: Integer): Boolean
    begin
      Result := Value mod 2 = 0; // Filter even numbers
    end);
end;
```

### 6. Exception Handling and Resource Management (try-finally)
```pascal
uses
  System.Classes, System.SysUtils;

procedure WriteToFile(const FileName: string; const Content: string);
var
  StringList: TStringList;
begin
  // Resource allocation
  StringList := TStringList.Create;
  try
    try
      StringList.Add(Content);
      StringList.SaveToFile(FileName);
      Writeln('File saved successfully.');
    except
      on E: EInOutError do
        Writeln('I/O Error: ', E.Message);
      on E: Exception do
        Writeln('General Error: ', E.Message);
    end;
  finally
    // Always free resources here
    StringList.Free;
  end;
end;
```

### 7. Multi-threading using Parallel Programming Library
```pascal
uses
  System.Threading;

procedure TestParallelFor;
begin
  Writeln('Starting parallel loop...');
  
  // TParallel.For executes iterations concurrently across multiple threads
  TParallel.For(1, 10, procedure(I: Integer)
    begin
      // Note: Writeln is not completely thread-safe for interleaved console output,
      // but used here for simple demonstration.
      Writeln('Processing item ', I, ' on thread ', TThread.Current.ThreadID);
    end);
    
  Writeln('Parallel loop finished.');
end;
```

### 8. Interfaces and Polymorphism
```pascal
type
  // Interfaces always inherit from IInterface (or IUnknown)
  ILogger = interface
    ['{B94038AE-5E8F-4D23-96DB-0062C7FAD0A3}'] // GUID required for interface querying
    procedure Log(const Message: string);
  end;

  // Classes implementing interfaces must provide _AddRef, _Release, QueryInterface.
  // TInterfacedObject provides this out of the box.
  TConsoleLogger = class(TInterfacedObject, ILogger)
  public
    procedure Log(const Message: string);
  end;

procedure TConsoleLogger.Log(const Message: string);
begin
  Writeln('[LOG]: ', Message);
end;

procedure TestInterfaces;
var
  Logger: ILogger;
begin
  // Memory for Interfaces is reference counted!
  // No need for a try..finally Free block here.
  Logger := TConsoleLogger.Create;
  Logger.Log('This is a test message via Interface.');
  // Logger is automatically freed when it goes out of scope.
end;
```

### 9. File I/O
```pascal
uses
  System.IOUtils; // Modern file I/O operations

procedure ModernFileIO;
var
  FilePath: string;
  Content: string;
begin
  FilePath := TPath.Combine(TPath.GetDocumentsPath, 'test.txt');
  
  // Write all text (handles opening/closing automatically)
  TFile.WriteAllText(FilePath, 'Hello Delphi I/O!');
  
  if TFile.Exists(FilePath) then
  begin
    // Read all text
    Content := TFile.ReadAllText(FilePath);
    Writeln('Read from file: ', Content);
  end;
end;
```

### 10. Database Connection (FireDAC mock)
```pascal
uses
  FireDAC.Comp.Client, FireDAC.Stan.Def, FireDAC.Phys.SQLite, Data.DB;

procedure ConnectDatabase;
var
  Connection: TFDConnection;
  Query: TFDQuery;
begin
  Connection := TFDConnection.Create(nil);
  Query := TFDQuery.Create(nil);
  try
    Query.Connection := Connection;
    
    // Setup SQLite connection parameters
    Connection.DriverName := 'SQLite';
    Connection.Params.Database := 'mem:?mode=memory&cache=shared'; // In-memory DB
    Connection.Connected := True;

    // Execute DDL
    Connection.ExecSQL('CREATE TABLE Users (Id INTEGER, Name TEXT)');
    Connection.ExecSQL('INSERT INTO Users (Id, Name) VALUES (1, ''Alice'')');

    // Fetch data
    Query.SQL.Text := 'SELECT * FROM Users';
    Query.Open;
    
    while not Query.Eof do
    begin
      Writeln('User: ', Query.FieldByName('Name').AsString);
      Query.Next;
    end;
  finally
    Query.Free;
    Connection.Free;
  end;
end;
```

## Best Practices

### Memory Management
- **Always use `try..finally`**: Whenever you create an object manually, immediately follow it with a `try` block, and call `Free` in the `finally` block to prevent memory leaks.
- **`FreeAndNil`**: When destroying objects referenced by fields or global variables, use `FreeAndNil(Obj)` rather than `Obj.Free` to nullify the reference, preventing dangling pointer access.
- **Interfaces**: Take advantage of interface reference counting to automate memory management for complex, transient objects, but be wary of circular references (use `[weak]` attribute for weak references).

### Naming Conventions
Follow the established Delphi coding standards:
- **Types/Classes**: Prefix with `T` (e.g., `TMyClass`, `TButton`).
- **Interfaces**: Prefix with `I` (e.g., `IMyInterface`).
- **Fields**: Prefix with `F` (e.g., `FName`).
- **Arguments/Parameters**: Prefix with `A` (e.g., `AName`, `AValue`).
- **Exceptions**: Prefix with `E` (e.g., `EArgumentException`).
- **Units**: Pascal case, sometimes prefixed with the company or project name (e.g., `MyApp.MainForm.pas`).

### Structure and Modularity
- **Avoid Global Variables**: Do not place variables in the `interface` section of a unit unless absolutely necessary. Use classes, singletons, or dependency injection.
- **Use Units Effectively**: Break down monolithic systems into smaller, cohesive units. Understand the difference between `interface` uses (which can cause circular dependency errors) and `implementation` uses.
- **Strict Visibility**: Default to using `strict private` and `strict protected` over `private` and `protected` to enforce true encapsulation, as standard `private` in Delphi is visible to everything within the same unit.

### Modern Language Features
- **Generics**: Favor generic collections (`TList<T>`, `TDictionary<TKey, TValue>`) over older untyped collections (`TList`, `TStringList` for general objects) to avoid unsafe type casting.
- **Inline Variable Declarations**: In modern Delphi (10.3+), use inline variable declarations (`var I: Integer := 0;`) to scope variables tightly to their block and reduce verbosity.
- **Cross-Platform Readiness**: Avoid Windows-specific API calls (`Windows.pas`) in business logic. Abstract OS interactions or use cross-platform RTL features like `System.IOUtils`.

### Error Handling
- Never use empty `except` blocks (`except end;`), as they swallow errors silently. Always log or handle the specific exception type.
- Use `raise` inside an `except` block to re-raise an exception if you cannot fully handle it locally, preserving the original call stack.
