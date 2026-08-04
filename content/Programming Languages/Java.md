---
tags: [programming-language, oop, enterprise, jvm]
category: OOP/Enterprise
status: to-learn
---

# Java

**Definition:** Portable, statically typed language that targets the JVM and relies on HotSpot JIT compilation, mature libraries, and a long-running enterprise ecosystem.

**Paradigm:** OOP | **Typing:** Static

## Pros
- The JVM provides a stable runtime, aggressive JIT optimization, and strong cross-platform compatibility.
- Mature tooling includes IntelliJ IDEA, Eclipse, Maven, Gradle, JUnit, and a deep debugging/profiling story.
- The standard library and ecosystem cover everything from HTTP clients to distributed systems frameworks.
- Strong static typing and class-based structure scale well in large codebases with many contributors.
- Long-lived support releases and conservative language evolution make upgrades predictable for enterprises.

## Cons
- Verbose syntax still appears in bean models, builders, and exception-heavy code despite modern improvements like `var`, records, and switch expressions.
- Startup and warm-up time are worse than native binaries because the JIT needs time to optimize hot paths.
- Heap usage and GC tuning matter in services with tight latency or memory budgets.
- Framework-heavy projects can hide control flow behind annotations and dependency injection.
- Interop across mixed JVM ecosystems can be complicated by classpath conflicts and bytecode compatibility.

## Best For
- Enterprise services that prioritize library maturity, observability, and operational predictability.
- Large team codebases where explicit interfaces and static structure are more valuable than terseness.
- Android legacy codebases and JVM-based backend stacks.
- Applications that need strong vendor support and a long maintenance horizon.

## Real Examples
- Android historically used Java as its primary application language before Kotlin adoption accelerated.
- Minecraft's original client and server codebase used Java.
- Many banking and payment backends, including large parts of enterprise middleware, run on the JVM.
- Spring Boot, Hibernate, Apache Kafka clients, and Elasticsearch's JVM stack illustrate common Java ecosystem anchors.

## Use Cases
- REST services, batch jobs, message consumers, and scheduled workers.
- Domain-heavy enterprise software where annotations, frameworks, and generated code are acceptable tradeoffs.
- Cross-platform tools running on the JVM with predictable library support.
- Example:

```java
record User(String id, String name) {}

static String label(User user) {
	return user.name() + " (" + user.id() + ")";
}
```

## Extended Syntax & Features

Java's syntax is rooted in C-style languages but has evolved significantly since Java 8. Modern Java (17 LTS and later) emphasizes records, sealed types, pattern matching, and concise constructs that reduce boilerplate without abandoning its class-centric model.

### Basic Data Types
Java distinguishes between **primitive types** and **reference types**:
- **Primitives:** `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean`. Stored on the stack or inline in objects; not objects themselves.
- **Reference types:** Classes, interfaces, enums, arrays, and records. Stored on the heap and managed by the garbage collector.
- **Wrapper classes:** `Integer`, `Long`, `Double`, etc., bridge primitives and collections. Autoboxing and unboxing convert between them automatically.
- **Strings:** `String` is immutable. The `StringBuilder` and `StringBuffer` classes handle mutable text efficiently.

### Variables and Type Inference
- **`final`:** Declares a variable that cannot be reassigned after initialization (similar to `const` in other languages).
- **`var` (Java 10+):** Local type inference. The compiler deduces the type from the initializer; the variable remains statically typed.

```java
final int maxRetries = 3;
var users = new ArrayList<User>();
```

### Control Flow
- **`if-else`**, **`for`**, **`while`**, **`do-while`:** Standard imperative control structures.
- **Enhanced for-loop:** Iterates over arrays and any `Iterable` type.
- **`switch` expressions (Java 14+):** `switch` can return a value and supports arrow syntax, eliminating fall-through bugs.
- **Pattern matching for `instanceof` (Java 16+):** Combines type check and cast in one expression.

```java
String status = switch (code) {
	case 200, 201 -> "Success";
	case 404 -> "Not Found";
	default -> "Unknown";
};
```

### Classes, Interfaces, and Enums
- **Classes:** Blueprint for objects with fields, constructors, and methods. Single inheritance only.
- **Interfaces:** Define contracts. Since Java 8, interfaces can include `default` and `static` methods.
- **Abstract classes:** Partial implementations that cannot be instantiated directly.
- **Enums:** Type-safe constants with optional fields and methods.
- **Records (Java 16+):** Immutable data carriers with auto-generated `equals`, `hashCode`, and `toString`.
- **Sealed classes (Java 17+):** Restrict which classes can extend or implement a type, enabling exhaustive pattern matching.

### Generics
Generics provide compile-time type safety for collections and custom APIs. Type erasure means generic type information is removed at runtime, which limits some reflective operations but keeps bytecode compatible across versions.

```java
List<String> names = new ArrayList<>();
Map<String, Integer> scores = new HashMap<>();
```

### Exception Handling
Java uses checked exceptions (must be declared or caught) and unchecked exceptions (`RuntimeException` and subclasses). Modern style favors unchecked exceptions for programming errors and checked exceptions for recoverable external failures, though opinion varies across teams.

## Advanced Concepts

### The JVM and Just-In-Time Compilation
Java source compiles to **bytecode** (`.class` files), which the JVM interprets and then **JIT-compiles** to native machine code for hot methods. The HotSpot JVM uses tiered compilation: methods start in the interpreter, then move through C1 (fast compile) and C2 (aggressive optimize) tiers. Warm-up time matters for latency-sensitive services; GraalVM and native-image compilation address startup cost for specific deployment models.

### Memory Management and Garbage Collection
The JVM manages heap memory automatically. Generational collectors (G1, ZGC, Shenandoah) optimize for the observation that most objects die young. Tuning `-Xmx`, `-Xms`, and GC algorithm choice affects throughput and pause times. Off-heap memory (direct `ByteBuffer`, foreign memory API in newer JDKs) bypasses GC for high-performance I/O and native interop.

### Concurrency
Java provides rich concurrency primitives:
- **`Thread` and `Runnable`:** OS-thread-based concurrency.
- **`ExecutorService` and thread pools:** Manage worker threads efficiently.
- **`synchronized` and `Lock`:** Mutual exclusion for shared mutable state.
- **`ConcurrentHashMap`, `BlockingQueue`:** Thread-safe collections in `java.util.concurrent`.
- **Virtual threads (Java 21+):** Lightweight threads managed by the JVM, ideal for I/O-bound workloads with blocking APIs.
- **`CompletableFuture`:** Composable asynchronous pipelines without raw callback chains.

### Modules (Project Jigsaw)
Java 9 introduced the **module system** (`module-info.java`) for strong encapsulation and explicit dependencies. Libraries and applications can declare which packages they export and which modules they require, reducing classpath conflicts and enabling slimmer runtime images via `jlink`.

### Streams and Functional APIs
Java 8 added **lambda expressions** and the **Stream API** for declarative collection processing. Streams support `map`, `filter`, `reduce`, and parallel execution over splittable data sources. They favor immutability and side-effect-free operations on pipeline stages.

### Reflection and Annotations
Reflection inspects classes, methods, and fields at runtime. Annotations attach metadata consumed by frameworks (Spring, JPA, JUnit) via reflection or compile-time processors (annotation processing). This powers dependency injection, ORM mapping, and test discovery but adds magic that can obscure control flow.

## Ecosystem & Tooling

### Build Tools
- **Maven:** XML-based, convention-over-configuration build and dependency management. Dominant in enterprise Java.
- **Gradle:** Groovy or Kotlin DSL build scripts with incremental builds and flexible task graphs. Standard for Android and many modern JVM projects.

### Frameworks
- **Spring Boot:** The de facto standard for JVM microservices, REST APIs, security, and data access. Massive ecosystem of starters and integrations.
- **Jakarta EE (formerly Java EE):** Enterprise specifications for servlets, JPA, CDI, and messaging. Implemented by WildFly, Payara, and others.
- **Micronaut / Quarkus:** Frameworks optimized for GraalVM native compilation and fast startup in cloud and serverless environments.
- **Hibernate / JPA:** Object-relational mapping for database access with declarative entity mapping.
- **Apache Kafka clients, gRPC, Netty:** Common building blocks for event-driven and high-performance network services.

### Testing
- **JUnit 5:** Standard unit and integration testing framework.
- **Mockito:** Mocking library for isolating dependencies in tests.
- **Testcontainers:** Spin up real databases and services in Docker for integration tests.

### IDEs and Diagnostics
- **IntelliJ IDEA, Eclipse, VS Code (with Java extensions):** Full-featured editing, refactoring, and debugging.
- **VisualVM, JFR (Java Flight Recorder), async-profiler:** Profiling and production diagnostics.
- **SpotBugs, Checkstyle, PMD:** Static analysis and style enforcement.

## Code Examples

### 1. Hello World and Basic Collections

```java
import java.util.List;
import java.util.ArrayList;

public class HelloWorld {
	public static void main(String[] args) {
		System.out.println("Hello, World!");

		var fruits = new ArrayList<String>();
		fruits.add("apple");
		fruits.add("banana");
		fruits.forEach(System.out::println);
	}
}
```

### 2. Records, Sealed Classes, and Pattern Matching

```java
public sealed interface Shape permits Circle, Rectangle {}

public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}

public class AreaCalculator {
	public static double area(Shape shape) {
		return switch (shape) {
			case Circle c -> Math.PI * c.radius() * c.radius();
			case Rectangle r -> r.width() * r.height();
		};
	}
}
```

### 3. Streams and Optional

```java
import java.util.List;
import java.util.Optional;

public class StreamExample {
	record Employee(String name, int age, String department) {}

	public static void main(String[] args) {
		List<Employee> staff = List.of(
			new Employee("Alice", 34, "Engineering"),
			new Employee("Bob", 28, "Sales"),
			new Employee("Carol", 41, "Engineering")
		);

		var engNames = staff.stream()
			.filter(e -> e.department().equals("Engineering"))
			.map(Employee::name)
			.toList();

		Optional<Employee> youngest = staff.stream()
			.min((a, b) -> Integer.compare(a.age(), b.age()));

		youngest.ifPresent(e -> System.out.println("Youngest: " + e.name()));
	}
}
```

### 4. CompletableFuture for Async Work

```java
import java.util.concurrent.CompletableFuture;

public class AsyncExample {
	static CompletableFuture<String> fetchUser() {
		return CompletableFuture.supplyAsync(() -> {
			try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
			return "Alice";
		});
	}

	static CompletableFuture<Integer> fetchScore(String user) {
		return CompletableFuture.supplyAsync(() -> user.length() * 10);
	}

	public static void main(String[] args) throws Exception {
		String result = fetchUser()
			.thenCompose(AsyncExample::fetchScore)
			.thenApply(score -> "Score: " + score)
			.get();
		System.out.println(result);
	}
}
```

### 5. Virtual Threads (Java 21+)

```java
import java.util.concurrent.Executors;

public class VirtualThreadDemo {
	public static void main(String[] args) throws Exception {
		try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
			for (int i = 0; i < 10_000; i++) {
				int taskId = i;
				executor.submit(() -> {
					Thread.sleep(100);
					return taskId;
				});
			}
		}
		System.out.println("All virtual thread tasks completed.");
	}
}
```

### 6. HTTP Client (Java 11+)

```java
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class HttpExample {
	public static void main(String[] args) throws Exception {
		var client = HttpClient.newHttpClient();
		var request = HttpRequest.newBuilder()
			.uri(URI.create("https://api.github.com/repos/openjdk/jdk"))
			.header("Accept", "application/json")
			.GET()
			.build();

		var response = client.send(request, HttpResponse.BodyHandlers.ofString());
		System.out.println("Status: " + response.statusCode());
		System.out.println("Body length: " + response.body().length());
	}
}
```

### 7. JUnit 5 Test Example

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
	@Test
	void addReturnsSum() {
		assertEquals(5, 2 + 3);
	}

	@Test
	void divideByZeroThrows() {
		assertThrows(ArithmeticException.class, () -> {
			int x = 1 / 0;
		});
	}
}
```

## Best Practices

1. **Prefer modern Java features:** Use records for DTOs, sealed types for closed hierarchies, `var` for obvious local types, and switch expressions over verbose if-else chains.
2. **Immutability where practical:** Favor `final` fields, unmodifiable collections (`List.of`, `Map.copyOf`), and records to reduce shared mutable state bugs.
3. **Avoid null:** Use `Optional` for absent values in return types; validate inputs early and fail fast with clear exceptions.
4. **Choose the right concurrency model:** Use virtual threads for blocking I/O at scale; use `ExecutorService` with bounded pools for CPU-bound work; avoid unbounded thread creation.
5. **Keep frameworks at the edges:** Isolate Spring/JPA annotations and framework types from core domain logic so business rules remain testable without a container.
6. **Profile before optimizing:** Use JFR and async-profiler to find real bottlenecks. Micro-optimizing without data often wastes effort.
7. **Manage dependencies carefully:** Pin versions in Maven/Gradle lockfiles; scan for CVEs; avoid shading conflicts in large classpath deployments.
8. **Write tests at the right level:** Unit tests for domain logic; integration tests with Testcontainers for database and messaging paths; avoid testing framework internals.
9. **Document public APIs:** Use Javadoc on public classes and methods; keep module boundaries (`module-info.java`) explicit in library projects.
10. **Plan LTS upgrades:** Target supported LTS releases (17, 21, 25) and test incrementally. Deprecated APIs like SecurityManager removal require migration planning.
