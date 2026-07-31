---
tags: [programming-language, scripting, web, frontend, backend]
category: Scripting/Dynamic
status: known
---

# TypeScript

**Definition:** JavaScript plus an ahead-of-time type system that erases at compile time, giving editors and build tools more information without changing the runtime semantics of JavaScript.

**Paradigm:** Multi-paradigm | **Typing:** Static (optional), strong

## Pros
- Finds many shape and nullability bugs before deployment, especially around API payloads and refactors.
- Language-service support gives precise autocomplete, jump-to-definition, rename safety, and inline diagnostics.
- Structural typing makes it easy to describe existing JavaScript objects without heavy class hierarchies.
- Incremental adoption is practical because `.js` and `.ts` files can coexist during migration.
- Works well for shared frontend/backend contracts, especially when generated types are derived from OpenAPI, GraphQL, or zod schemas.

## Cons
- Type-only safety can give a false sense of runtime safety if validation is missing at trust boundaries.
- Advanced generic patterns, conditional types, and variance rules can become unreadable quickly.
- Configuration drift in `tsconfig`, module resolution, and path aliases can create build/runtime mismatches.
- Compilation adds an extra step, and large monorepos can feel slow without project references and incremental builds.
- Third-party declaration quality varies, so some libraries need local typings or `any` escape hatches.

## Best For
- Large-scale frontend applications with many shared components and API models.
- Node.js backends that benefit from refactor safety and explicit contracts.
- Teams migrating an existing JavaScript codebase toward stricter tooling in stages.
- Design-system libraries, SDKs, and monorepos where API shape changes need to be visible at compile time.

## Real Examples
- Angular is written in TypeScript and uses it as part of the framework experience.
- Slack’s desktop app and many Electron products use TypeScript heavily for shared UI logic.
- VS Code, Deno, and much of the modern React ecosystem are built with TypeScript.
- Large design systems at companies like Atlassian and Microsoft commonly expose typed component APIs.

## Use Cases
- Typed REST or GraphQL clients where API contracts drive UI state and error handling.
- Shared utility packages that run in browser and Node.js with one source of truth.
- Safer refactors of props, reducers, context values, and event handlers in UI code.
- Example:

```ts
type User = { id: string; name: string; active: boolean };

function displayUser(user: User): string {
	return `${user.name} (${user.active ? "active" : "inactive"})`;
}
```

## Extended Syntax & Features

TypeScript builds upon JavaScript's syntax by adding static type definitions. Its features include basic types, interfaces, enums, unions, intersections, and classes with access modifiers.

### Basic Data Types
TypeScript supports the basic types found in JavaScript along with several additions:
- `boolean`: Represents true or false.
- `number`: Floating point values as well as big integers.
- `string`: Textual data.
- `array`: Collections of values. Written as `Type[]` or `Array<Type>`.
- `tuple`: Arrays with fixed numbers of elements whose types are known.
- `enum`: A way of giving more friendly names to sets of numeric values.
- `any`: An escape hatch that opts out of type checking.
- `unknown`: The type-safe counterpart of `any`. Anything is assignable to `unknown`, but `unknown` isn't assignable to anything but itself and `any` without a type assertion or a control flow based narrowing.
- `void`: The absence of having any type at all, commonly used for function return types.
- `null` and `undefined`: Subtypes of all other types (unless `strictNullChecks` is enabled).
- `never`: Represents the type of values that never occur (e.g., functions that always throw an exception or have infinite loops).

### Interfaces and Type Aliases
TypeScript offers two main ways to name types: `interface` and `type`.

- **Interfaces** are used primarily for declaring the shapes of objects. They support extending other interfaces and can be merged via multiple declarations.
- **Type Aliases** can represent primitives, unions, tuples, and other arbitrary types in addition to objects. Type aliases cannot be merged via multiple declarations.

### Control Flow and Type Narrowing
TypeScript's type checker tracks control flow constructs (`if`, `switch`, loops) and type guards (e.g., `typeof`, `instanceof`, `in`) to narrow types. This means that inside a conditional branch, the type checker knows the specific type of a variable.

### Classes and Access Modifiers
TypeScript brings traditional object-oriented features to JavaScript classes. It includes visibility modifiers:
- `public` (default): Accessible anywhere.
- `private`: Accessible only within the declaring class. Can also use JS `#` private fields.
- `protected`: Accessible within the declaring class and its subclasses.
- `readonly`: Properties that can only be initialized at declaration or in the constructor.

## Advanced Concepts

### Memory Management
TypeScript runs on JavaScript engines (V8, SpiderMonkey, JavaScriptCore), so it inherits JavaScript's memory management model. Memory is allocated when objects are created and freed when they are no longer reachable by the Garbage Collector (GC). The mark-and-sweep algorithm is typically used to identify unreachable objects. Developers must still be mindful of memory leaks, often caused by uncleared closures, event listeners, or global caches.

### Concurrency Model
Like JavaScript, TypeScript is single-threaded and uses an event loop with a non-blocking I/O model.
- **Call Stack:** Executes synchronous code.
- **Task Queue / Microtask Queue:** Handles asynchronous callbacks (e.g., `setTimeout`, Promises).
- Promises and the `async`/`await` syntax provide a clean way to handle asynchronous operations.
- Worker Threads (in Node.js) and Web Workers (in the browser) allow for actual parallel execution in background threads.

### Generics
Generics provide a way to create reusable components that can work over a variety of types rather than a single one. They allow capturing the type provided by the user so that it can be used later.

```ts
function identity<T>(arg: T): T {
    return arg;
}
```

### Advanced Types
- **Union and Intersection Types:** Combine multiple types into one.
- **Mapped Types:** Create new types by mapping over properties of an existing type (e.g., `Partial<T>`, `Readonly<T>`).
- **Conditional Types:** Types that depend on a condition (e.g., `T extends U ? X : Y`).
- **Utility Types:** Built-in types that facilitate common type transformations (`Record<K, T>`, `Pick<T, K>`, `Omit<T, K>`, `Exclude<T, U>`, `Extract<T, U>`).

## Ecosystem & Tooling

TypeScript's ecosystem is vast, largely overlapping with JavaScript's but enhanced with type-specific tooling.

### Build Tools and Compilers
- **tsc (TypeScript Compiler):** The official compiler, typically used for type checking and generating declaration files (`.d.ts`).
- **Babel:** Can strip TypeScript syntax but does not perform type checking.
- **esbuild, SWC:** Extremely fast bundlers/compilers written in Go and Rust respectively, supporting TypeScript out-of-the-box (compilation only, no type checking).
- **Vite, Webpack, Rollup:** Standard module bundlers that integrate perfectly with TypeScript plugins.

### Package Managers
- **npm / Yarn / pnpm / Bun:** All handle TypeScript seamlessly. They manage both runtime dependencies and development dependencies, including `@types/*` packages from DefinitelyTyped, which provide type definitions for JS libraries.

### Popular Frameworks
- **React, Vue, Angular:** The holy trinity of web frameworks all have first-class TypeScript support. Angular is written entirely in TS.
- **Next.js, Nuxt.js, SvelteKit:** Meta-frameworks that heavily leverage TypeScript for type-safe routing and API endpoints.
- **NestJS, Express, Fastify:** Backend frameworks. NestJS is heavily inspired by Angular and strictly uses TypeScript.
- **Prisma, TypeORM, Drizzle:** ORMs that provide strict database schema typing and fully type-safe queries.

### Standard Libraries
TypeScript relies on the JavaScript standard library (ECMAScript) and browser/Node.js APIs. The `@types/node` package provides robust typings for the Node.js runtime environment.

## Code Examples

### 1. Hello World and Basic Types
The fundamental types and how to run a basic program.

```typescript
// basic_types.ts

// String
const greeting: string = "Hello, TypeScript!";

// Number
const answerToLife: number = 42;

// Boolean
const isAwesome: boolean = true;

// Array
const frameworks: string[] = ["React", "Vue", "Angular", "Svelte"];

// Tuple
const httpResponse: [number, string] = [200, "OK"];

// Enum
enum LogLevel {
    INFO,
    WARN,
    ERROR,
}

function logMessage(level: LogLevel, message: string): void {
    console.log(`[${LogLevel[level]}] ${message}`);
}

logMessage(LogLevel.INFO, greeting);
```

### 2. Interfaces and Object Shapes
Defining complex object structures using interfaces.

```typescript
// interfaces.ts

interface Address {
    street: string;
    city: string;
    zipCode: string;
}

interface UserProfile {
    readonly id: string; // Cannot be modified after creation
    username: string;
    email: string;
    address?: Address; // Optional property
}

const user: UserProfile = {
    id: "uuid-1234",
    username: "ts_ninja",
    email: "ninja@example.com",
    address: {
        street: "123 Type Way",
        city: "Strict City",
        zipCode: "10101"
    }
};

// Error: Cannot assign to 'id' because it is a read-only property.
// user.id = "new-uuid"; 
```

### 3. Functions and Type Guards
Using functions, optional parameters, and type narrowing.

```typescript
// functions.ts

type StringOrNumber = string | number;

/**
 * Multiplies a value. If it's a string, it repeats it.
 */
function multiply(value: StringOrNumber, factor: number = 2): StringOrNumber {
    // Type Guard: typeof
    if (typeof value === "string") {
        return value.repeat(factor);
    } else {
        return value * factor;
    }
}

console.log(multiply(10)); // 20
console.log(multiply("TS!", 3)); // "TS!TS!TS!"

// Custom Type Guard
function isString(val: any): val is string {
    return typeof val === "string";
}

const mixedArray: (string | number)[] = [1, "two", 3, "four"];
const stringsOnly = mixedArray.filter(isString); // Type narrowed to string[]
```

### 4. Classes and Object-Oriented Patterns
Implementing interfaces and using access modifiers in classes.

```typescript
// classes.ts

interface Animal {
    name: string;
    makeSound(): void;
}

class Dog implements Animal {
    // public by default, but explicit declaration is good practice
    public name: string;
    // private property, only accessible within the Dog class
    private breed: string;

    constructor(name: string, breed: string) {
        this.name = name;
        this.breed = breed;
    }

    public makeSound(): void {
        console.log(`${this.name} barks!`);
    }

    public getBreed(): string {
        return this.breed;
    }
}

const myDog = new Dog("Rex", "German Shepherd");
myDog.makeSound();
// console.log(myDog.breed); // Error: Property 'breed' is private.
```

### 5. Generics
Creating reusable components that work with any data type.

```typescript
// generics.ts

// Generic Interface
interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

const stringNumberPair: KeyValuePair<string, number> = {
    key: "age",
    value: 30
};

// Generic Class
class DataStore<T> {
    private data: T[] = [];

    addItem(item: T): void {
        this.data.push(item);
    }

    getItems(): T[] {
        return [...this.data];
    }
}

const numberStore = new DataStore<number>();
numberStore.addItem(10);
numberStore.addItem(20);

const stringStore = new DataStore<string>();
stringStore.addItem("hello");

// Generic function with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

const point = { x: 10, y: 20, z: 30 };
const xVal = getProperty(point, "x"); // Type is number
// const wVal = getProperty(point, "w"); // Error: Argument of type '"w"' is not assignable to parameter of type '"x" | "y" | "z"'.
```

### 6. Asynchronous Programming (Promises & Async/Await)
Handling async code using native Promises, fully typed.

```typescript
// async_await.ts

interface User {
    id: number;
    name: string;
}

// Mocking a network request
function fetchUser(id: number): Promise<User> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id === 1) {
                resolve({ id: 1, name: "Alice" });
            } else {
                reject(new Error("User not found"));
            }
        }, 1000);
    });
}

async function getUserData(id: number): Promise<void> {
    try {
        console.log(`Fetching user ${id}...`);
        const user = await fetchUser(id); // 'user' is strongly typed as 'User'
        console.log(`Successfully fetched: ${user.name}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching data: ${error.message}`);
        } else {
            console.error("Unknown error occurred");
        }
    }
}

// Usage
getUserData(1);
```

### 7. Utility Types and Mapped Types
Leveraging built-in types to transform existing shapes.

```typescript
// utility_types.ts

interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

// Partial: Makes all properties optional
type UpdateTaskInput = Partial<Task>;

function updateTask(id: number, update: UpdateTaskInput) {
    // logic to update the task
}
updateTask(1, { completed: true });

// Pick: Selects a subset of properties
type TaskPreview = Pick<Task, "id" | "title">;

// Omit: Removes a subset of properties
type TaskWithoutId = Omit<Task, "id">;

// Record: Creates an object type with specific keys and values
type TaskRecord = Record<string, Task>;

const tasks: TaskRecord = {
    "task-1": { id: 1, title: "Learn TS", description: "Read docs", completed: false },
};
```

### 8. Conditional Types and Infer
Advanced type metaprogramming.

```typescript
// conditional_types.ts

// A type that extracts the element type from an Array, or returns the type itself
type Flatten<T> = T extends Array<infer U> ? U : T;

type StrArray = string[];
type Str = Flatten<StrArray>; // Type is string

type Num = Flatten<number>; // Type is number

// A type that checks if a type is a Promise, and if so, returns its resolved type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ResolvesToBoolean = Promise<boolean>;
type ExtractedType = UnwrapPromise<ResolvesToBoolean>; // Type is boolean
```

## Best Practices

1. **Enable `strict` mode:** Always enable `"strict": true` in your `tsconfig.json`. This turns on `strictNullChecks`, `noImplicitAny`, and other flags that give you the full power and safety of TypeScript.
2. **Avoid `any`:** Refrain from using `any`. If you don't know the type, use `unknown` instead, which forces you to do type checking before usage.
3. **Use Interfaces for Objects:** Prefer `interface` over `type` for defining object shapes because interfaces can be extended more cleanly and produce better error messages. Use `type` for unions, intersections, and primitives.
4. **Leverage Type Inference:** Do not explicitly annotate types when TypeScript can infer them easily (e.g., `let x = 10;` is better than `let x: number = 10;`).
5. **Use Utility Types:** Instead of duplicating interface shapes, use `Partial<T>`, `Pick<T, K>`, or `Omit<T, K>` to create derived types.
6. **Keep Types Co-located:** Keep types close to the implementation they describe. Export them if they need to be shared across boundaries.
7. **Type API Boundaries:** Always type the payloads entering and leaving your application boundaries (e.g., REST API responses). Using runtime validation libraries like Zod or Yup combined with TypeScript types is highly recommended.
8. **Consistent Naming:** Do not use the `I` prefix for interfaces (e.g., `IUser`). Just name it `User`. Use PascalCase for type names and camelCase for variable/function names.
9. **Beware of Type Assertions (`as` keyword):** Type assertions tell the compiler to trust you, skipping checks. Use them sparingly. Prefer type guards and control flow narrowing.
10. **Use Enums carefully:** TypeScript enums can have surprising behavior (like reverse mapping in numeric enums). String unions (`type LogLevel = "INFO" | "WARN" | "ERROR"`) are often simpler and safer, or use `const` objects with `as const`.
