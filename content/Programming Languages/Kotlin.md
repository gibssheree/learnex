---
tags: [programming-language, oop, functional, jvm, mobile]
category: OOP/Enterprise
status: to-learn
---

# Kotlin

**Definition:** Concise JVM language that emphasizes null safety, interoperability with Java, and expressive syntax for Android, backend, and multiplatform development.

**Paradigm:** OOP/functional | **Typing:** Static

## Pros
- Nullable and non-nullable types prevent many null pointer bugs at compile time.
- Interoperates directly with Java libraries, frameworks, and JVM tooling.
- Data classes, extension functions, sealed classes, and coroutines improve ergonomics without heavy boilerplate.
- Android development is first-class, and Jetpack Compose pairs naturally with Kotlin’s syntax.
- Multiplatform support allows shared logic across Android, desktop, server, and sometimes iOS.

## Cons
- Kotlin compilation can feel slower than Java on large incremental builds.
- Advanced language features can introduce abstraction for teams used to plain Java.
- Multiplatform tooling is useful but not as mature or universal as the JVM core story.
- Some Java frameworks still expose APIs that feel more natural from Java than Kotlin.

## Best For
- Android apps and UI-heavy mobile codebases.
- Modern JVM services that want better null safety and cleaner syntax.
- Shared business logic in multiplatform codebases.

## Real Examples
- Google recommends Kotlin for Android and ships major Android libraries with Kotlin-friendly APIs.
- Trello, Pinterest, and many modern mobile teams use Kotlin in production.
- Backend teams using Spring Boot, Ktor, or Micronaut frequently adopt Kotlin for service code.
- JetBrains developed Kotlin and uses it heavily in its own products.

## Use Cases
- Android UI, view models, repositories, and coroutine-based asynchronous work.
- Server-side APIs using Ktor or Spring Boot.
- Shared domain logic and validation in Kotlin Multiplatform projects.
- Example:

```kotlin
data class User(val id: String, val active: Boolean)

fun label(user: User): String =
	if (user.active) "${user.id}:active" else "${user.id}:inactive"
```

## Extended Syntax & Features

Kotlin's syntax is designed to be expressive and concise. It removes a lot of the boilerplate code that is typical in Java, such as semicolons, explicit type declarations when they can be inferred, and getter/setter methods.

### Basic Data Types
In Kotlin, everything is an object, in the sense that you can call member functions and properties on any variable.
- **Numbers:** `Byte`, `Short`, `Int`, `Long`, `Float`, `Double`.
- **Characters:** `Char` (cannot be treated directly as numbers).
- **Booleans:** `Boolean` (`true` or `false`).
- **Strings:** `String` (immutable). Kotlin supports string interpolation: `"Hello, $name"`.
- **Arrays:** `Array` class, created using `arrayOf()`, `intArrayOf()`, etc.

### Variables
- `val`: Read-only (immutable) variable. Equivalent to a `final` variable in Java.
- `var`: Mutable variable.

```kotlin
val pi = 3.14159 // Inferred as Double, cannot be reassigned
var count = 0 // Inferred as Int, can be modified
count += 1
```

### Control Flow
- `if` expressions: In Kotlin, `if` is an expression and returns a value.
- `when` expressions: Replaces the `switch` statement in C-like languages and is much more powerful.

```kotlin
val max = if (a > b) a else b

val status = when (code) {
    200, 201 -> "Success"
    in 400..499 -> "Client Error"
    is String -> "Unknown String Code"
    else -> "Error"
}
```

### Loops
- `for` loops iterate over anything that provides an iterator.
- `while` and `do-while` loops work as they do in Java.

```kotlin
for (i in 1..10) {
    println(i)
}

for ((index, value) in array.withIndex()) {
    println("Element at $index is $value")
}
```

### Functions
Functions are declared using the `fun` keyword. They can be declared at the top level in a file, meaning you don't need to create a class to hold a function.

```kotlin
fun sum(a: Int, b: Int): Int {
    return a + b
}

// Single-expression function
fun multiply(a: Int, b: Int) = a * b
```

### Null Safety
Kotlin's type system distinguishes between references that can hold `null` (nullable references) and those that cannot (non-null references).

```kotlin
var a: String = "abc"
// a = null // Compilation error

var b: String? = "abc"
b = null // OK

// Safe call operator
val length = b?.length

// Elvis operator
val len = b?.length ?: -1
```

## Advanced Concepts

### Object-Oriented Programming (OOP)
Kotlin supports standard OOP features but with improvements:
- **Classes and Constructors:** Primary constructors are part of the class header. Secondary constructors use the `constructor` keyword.
- **Properties:** Classes can have properties, which are accessed directly (no need for explicit getters/setters unless custom logic is needed).
- **Data Classes:** Automatically generate `equals()`, `hashCode()`, `toString()`, and `copy()` methods.
- **Sealed Classes and Interfaces:** Restrict class hierarchies. A value can have one of the types from a limited set, but cannot have any other type.

### Extension Functions
Kotlin provides the ability to extend a class with new functionality without having to inherit from the class or use design patterns such as Decorator.

```kotlin
fun String.removeFirstLastChar(): String = this.substring(1, this.length - 1)
println("Kotlin".removeFirstLastChar()) // Output: otli
```

### Higher-Order Functions and Lambdas
A higher-order function is a function that takes functions as parameters, or returns a function.

```kotlin
fun <T, R> Collection<T>.fold(
    initial: R,
    combine: (acc: R, nextElement: T) -> R
): R {
    var accumulator: R = initial
    for (element: T in this) {
        accumulator = combine(accumulator, element)
    }
    return accumulator
}
```

### Coroutines
Coroutines are Kotlin's approach to asynchronous programming. They are lightweight threads. By using coroutines, you can write asynchronous code in a sequential manner.
- `launch`: Starts a new coroutine without blocking the current thread and returns a reference to the coroutine as a `Job`.
- `async`: Starts a new coroutine and returns a `Deferred` which represents a future result.
- `suspend`: Keyword used to mark functions that can be paused and resumed.

### Generics and Variance
Kotlin supports generics with a cleaner syntax. It uses declaration-site variance (using `in` and `out` keywords) instead of Java's use-site variance (wildcards `? extends T` and `? super T`).
- `out T`: Covariant. You can only produce `T`.
- `in T`: Contravariant. You can only consume `T`.

### Inline Functions and Reified Type Parameters
High-order functions can cause a performance overhead. Marking a function as `inline` tells the compiler to copy the code of the function and its lambda arguments directly to the call site.
Reified type parameters allow you to access the type `T` at runtime within an inline function, which is normally erased due to type erasure.

## Ecosystem & Tooling

### Build Tools
- **Gradle:** The standard build system for Kotlin projects (and Android). Kotlin provides a Gradle DSL (build.gradle.kts) allowing you to write build scripts in Kotlin instead of Groovy.
- **Maven:** Also fully supported and often used in backend Kotlin projects.

### Frameworks
- **Android / Jetpack Compose:** The primary ecosystem for Kotlin. Jetpack Compose is Android's modern toolkit for building native UI using a declarative approach in Kotlin.
- **Ktor:** An asynchronous framework for creating microservices, web applications, and more. Built by JetBrains from the ground up using coroutines.
- **Spring Boot:** The most popular Java framework has excellent first-class support for Kotlin, making backend development seamless.
- **Kotlin Multiplatform (KMP):** Allows sharing code between iOS, Android, Desktop, and Web.

### Package Management
Dependencies are managed through Maven Central and Google's Maven repository via Gradle or Maven build files.

### Standard Library
Kotlin's standard library is rich, especially its collection framework. It provides extensions to the Java Collections API, adding many functional programming paradigms like `map`, `filter`, `reduce`, `groupBy`, etc.

## Code Examples

### 1. Hello World and Basic Data Structures

```kotlin
// The entry point of a Kotlin application is the main function.
fun main() {
    println("Hello, World!")
    
    // Immutable list
    val readOnlyList = listOf("apple", "banana", "cherry")
    println("First item: ${readOnlyList.first()}")
    
    // Mutable map
    val mutableMap = mutableMapOf("one" to 1, "two" to 2)
    mutableMap["three"] = 3 // Adding an entry
    
    for ((key, value) in mutableMap) {
        println("$key -> $value")
    }
}
```

### 2. Object-Oriented and Functional Patterns

```kotlin
// Data class automatically provides equals, hashCode, toString, copy
data class Person(val name: String, val age: Int, val email: String?)

// Extension function on the Person class
fun Person.isAdult(): Boolean = this.age >= 18

fun main() {
    val people = listOf(
        Person("Alice", 29, "alice@example.com"),
        Person("Bob", 17, null),
        Person("Charlie", 35, "charlie@example.com")
    )
    
    // Using functional API on collections
    val adultEmails = people
        .filter { it.isAdult() } // Lambda using implicit 'it' parameter
        .mapNotNull { it.email } // Maps to email, filtering out nulls
        
    println(adultEmails) // Output: [alice@example.com, charlie@example.com]
}
```

### 3. Sealed Classes and When Expressions

```kotlin
// Sealed classes restrict class hierarchies
sealed class Result<out T> {
    data class Success<out T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}

fun processResult(result: Result<String>) {
    // The compiler knows all possible types of Result, 
    // so an 'else' branch is not needed in the 'when' expression.
    val message = when (result) {
        is Result.Success -> "Got data: ${result.data}"
        is Result.Error -> "Error occurred: ${result.exception.message}"
        Result.Loading -> "Loading data..."
    }
    println(message)
}
```

### 4. Concurrency with Coroutines

```kotlin
import kotlinx.coroutines.*
import kotlin.system.measureTimeMillis

// Suspend function can be paused and resumed
suspend fun fetchUserData(): String {
    delay(1000L) // Non-blocking delay
    return "User Data"
}

suspend fun fetchUserSettings(): String {
    delay(1000L)
    return "User Settings"
}

fun main() = runBlocking {
    val time = measureTimeMillis {
        // async starts a concurrent coroutine
        val dataDeferred = async { fetchUserData() }
        val settingsDeferred = async { fetchUserSettings() }
        
        // await waits for the results without blocking the thread
        println("${dataDeferred.await()} and ${settingsDeferred.await()}")
    }
    println("Completed in $time ms") // Completes in ~1000ms, not 2000ms
}
```

### 5. Delegated Properties

```kotlin
import kotlin.properties.Delegates

class UserProfile {
    // Lazy delegation: computed only on first access
    val lazyValue: String by lazy {
        println("Computing lazy value...")
        "Hello"
    }
    
    // Observable delegation: triggers callback on change
    var name: String by Delegates.observable("no name") { prop, old, new ->
        println("$old -> $new")
    }
}

fun main() {
    val profile = UserProfile()
    println(profile.lazyValue) // Prints "Computing lazy value..." then "Hello"
    println(profile.lazyValue) // Just prints "Hello"
    
    profile.name = "Alice" // Prints "no name -> Alice"
    profile.name = "Bob"   // Prints "Alice -> Bob"
}
```

### 6. Scope Functions (let, run, with, apply, also)

```kotlin
data class Configuration(var host: String = "", var port: Int = 0)

fun main() {
    // 'apply' is useful for configuring an object. Returns the object itself.
    val config = Configuration().apply {
        host = "localhost"
        port = 8080
    }
    
    // 'let' is often used for null safety checks. Returns the lambda result.
    val nullableString: String? = "Kotlin"
    val length = nullableString?.let {
        println("String is not null: $it")
        it.length
    } ?: 0
    
    // 'with' is used to call multiple methods on an object. Returns the lambda result.
    with(config) {
        println("Connecting to $host on port $port")
    }
}
```

### 7. Generics and Reified Types

```kotlin
import com.google.gson.Gson

// Reified type parameters allow access to the type T at runtime
inline fun <reified T> fromJson(json: String): T {
    val gson = Gson()
    return gson.fromJson(json, T::class.java)
}

data class UserDto(val id: Int, val name: String)

fun main() {
    val jsonString = """{"id": 1, "name": "John Doe"}"""
    // The type parameter is inferred from the variable type
    val user: UserDto = fromJson(jsonString)
    println(user.name)
}
```

## Best Practices

1. **Embrace Immutability:** Prefer `val` over `var`. Use read-only collections (`listOf()`, `mapOf()`) instead of mutable ones unless necessary. This reduces side effects and makes code easier to reason about, especially in concurrent environments.
2. **Utilize Null Safety:** Avoid using the `!!` (not-null assertion) operator, as it throws a NullPointerException if the value is null, defeating Kotlin's null safety guarantees. Use safe calls `?.`, the Elvis operator `?:`, or `let` instead.
3. **Use Data Classes:** Whenever a class is primarily meant to hold data, declare it as a `data class`. This automatically generates useful utility methods.
4. **Leverage Scope Functions Judiciously:** Functions like `let`, `apply`, `run`, `with`, and `also` are powerful but can make code hard to read if nested deeply or used incorrectly. Use `apply` for initialization, `let` for null checks, and `also` for side effects.
5. **Prefer Expressions Over Statements:** Kotlin allows constructs like `if`, `when`, and `try-catch` to be used as expressions that return values. This leads to more concise and functional code.
6. **Use Extension Functions Sparingly:** While extension functions are great for adding utility to existing classes, don't overuse them to the point where the original class's API becomes confusing or cluttered.
7. **Adopt Coroutines for Concurrency:** Instead of relying on raw threads or complex RxJava chains, use Kotlin Coroutines for asynchronous tasks. They are lighter, easier to read, and handle cancellation gracefully.
8. **Follow Naming Conventions:** Class names should be PascalCase, and function/property names should be camelCase. Constants (`val` inside a `companion object` or at the top level) should be UPPER_SNAKE_CASE.
9. **Avoid Boilerplate Interfaces:** Unlike Java, Kotlin doesn't strictly require an interface for every service. Use functional types or single-method interfaces (`fun interface`) where appropriate.
10. **Use String Templates:** Prefer string templates (`"Value is $value"`) over string concatenation (`"Value is " + value`), as they are more readable and idiomatic in Kotlin.
