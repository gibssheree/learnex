---
tags: [programming-language, oop, mobile, apple, legacy]
category: OOP/Enterprise
status: to-learn
---

# Objective-C

**Definition:** Apple’s original native application language, combining C with Smalltalk-style object messaging. Developed in the 1980s by Brad Cox and Tom Love, it was adopted by NeXT for its NeXTSTEP operating system, which later became the foundation of Apple's macOS and iOS.

**Paradigm:** Object-Oriented, Imperative, Reflective | **Typing:** Static (with dynamic features and typing available)

## Pros
- Mature and still fully supported across Apple platforms.
- Huge legacy codebase in macOS and older iOS projects.
- Direct interop with C and C++ (via Objective-C++) is natural and extremely powerful.
- Dynamic messaging can be useful for Apple framework patterns, runtime introspection, method swizzling, and metaprogramming.
- Rock-solid stability; the ABI is very stable, making compiled frameworks highly compatible over time.
- Flexible runtime allows for powerful patterns like Key-Value Coding (KVC) and Key-Value Observing (KVO).
- Granular control over low-level system APIs.

## Cons
- Verbose bracket syntax (`[receiver message]`) and message-passing style are less approachable than modern syntax found in Swift or Kotlin.
- Apple has clearly shifted all new development, documentation, and focus toward Swift.
- Manual or semi-manual memory management concepts (even with ARC, you must understand strong/weak/unsafe_unretained cycles) can be daunting.
- Lack of modern language features like optionals, pattern matching, tuples, and first-class functional constructs.
- Namespacing is achieved via prefixes (e.g., `NS`, `UI`, `CG`), leading to long class names and potential collisions compared to module-based namespacing.
- Heavy reliance on header files (`.h`) and implementation files (`.m`), duplicating declarations and slowing down development/compilation.

## Best For
- Maintaining and updating legacy Apple codebases.
- Bridging older C/C++ frameworks to modern Swift applications (using Objective-C as the glue language).
- Low-level system work where the dynamic runtime and direct C interop are beneficial.
- Libraries or frameworks that need to be highly backwards-compatible.
- Projects requiring extensive use of the Objective-C runtime (e.g., method swizzling).

## Real Examples
- Foundation and AppKit/UIKit frameworks (though Apple has been rewriting some in Swift, they originated in and heavily use Objective-C).
- Many long-lived, massive iOS applications (e.g., early versions of Facebook, Instagram, WhatsApp) still have significant Objective-C cores.
- Early versions of the macOS operating system itself (Mac OS X).
- React Native's iOS bridge heavily relies on Objective-C's dynamic messaging to route calls between JavaScript and native modules.

## Use Cases
- Maintaining legacy iOS/macOS apps that have not yet been migrated to Swift.
- Bridging to existing Apple frameworks and runtime APIs.
- Wrapping C/C++ codebases in an object-oriented API for consumption by Swift.
- Building highly dynamic, reflection-heavy developer tools.

## Extended Syntax & Features

### Core Structure
An Objective-C program typically consists of header files (`.h`) for public declarations and implementation files (`.m`) for the code itself. If C++ interop is needed, the extension `.mm` (Objective-C++) is used.

Objective-C is a strict superset of C, meaning any valid C program is a valid Objective-C program. The object-oriented features are an extension to the C language.

### Basic Data Types
Objective-C inherits all C primitive types (`int`, `float`, `double`, `char`, etc.).
Apple provides type definitions in the Foundation framework to ensure consistent sizes across architectures:
- `NSInteger`: 32-bit or 64-bit integer depending on the platform.
- `NSUInteger`: Unsigned version of `NSInteger`.
- `CGFloat`: 32-bit or 64-bit float.
- `BOOL`: A boolean type (values `YES` or `NO`).

For objects, Objective-C uses pointers:
- `NSString *`: An object representing a string.
- `NSArray *`: An object representing an array.
- `id`: A special dynamic type representing any Objective-C object (equivalent to `void *` for objects).

### Control Flow
Standard C control flow is fully supported: `if`/`else`, `for`, `while`, `do`/`while`, `switch`.
Objective-C introduces fast enumeration for iterating over collections:
```objc
NSArray *items = @[@"One", @"Two", @"Three"];
for (NSString *item in items) {
    NSLog(@"Item: %@", item);
}
```

### Classes and Objects
A class declaration (in a `.h` file) uses the `@interface` directive:
```objc
@interface Person : NSObject
@property (nonatomic, strong) NSString *name;
@property (nonatomic, assign) NSInteger age;
- (void)sayHello;
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
@end
```

The implementation (in a `.m` file) uses `@implementation`:
```objc
@implementation Person
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = name;
        _age = age;
    }
    return self;
}
- (void)sayHello {
    NSLog(@"Hello, my name is %@ and I am %ld years old.", self.name, (long)self.age);
}
@end
```

### Methods and Messaging
Objective-C does not "call methods" in the traditional sense; it "sends messages" to objects. The syntax uses square brackets:
`[receiver message]`.
Methods can have multiple arguments interleaved with the method name (named parameters):
```objc
// Declaration
- (void)doSomethingWithString:(NSString *)str andInteger:(NSInteger)val;

// Invocation
[myObject doSomethingWithString:@"Test" andInteger:42];
```

## Advanced Concepts

### Memory Management (ARC vs MRC)
Historically, Objective-C used Manual Retain-Count (MRC). Developers had to explicitly call `[object retain]` to claim ownership and `[object release]` or `[object autorelease]` to relinquish it.

Today, Automatic Reference Counting (ARC) is standard. The compiler automatically inserts `retain` and `release` calls at compile time.
However, developers must still understand object graph topology to avoid retain cycles.
Property modifiers specify ownership semantics:
- `strong`: The default for objects. Retains the object.
- `weak`: Does not retain the object. Automatically becomes `nil` when the referenced object is deallocated. Crucial for breaking retain cycles (e.g., in delegates or blocks).
- `assign`: Used for primitive types (C types).
- `copy`: Creates a copy of the object before assignment. Used frequently for `NSString` and block properties to prevent unexpected mutations.

### Categories and Class Extensions
Categories allow you to add methods to an existing class without subclassing it, even if you don't have the source code (e.g., adding methods to `NSString`).
```objc
@interface NSString (MyStringUtils)
- (BOOL)isValidEmail;
@end
```

Class extensions (sometimes called anonymous categories) are declared in the `.m` file to define private properties or methods.
```objc
@interface MyClass ()
@property (nonatomic, strong) NSString *privateString;
@end
```

### Blocks (Closures)
Blocks are Objective-C's implementation of closures or lambdas. They capture their surrounding state.
Block syntax is notoriously cryptic:
```objc
// Declaration
returnType (^blockName)(parameterTypes) = ^returnType(parameters) { ... };

// Example
void (^myBlock)(NSString *) = ^(NSString *msg) {
    NSLog(@"%@", msg);
};
myBlock(@"Hello Blocks!");
```
When accessing `self` inside a block that is retained by `self`, a strong reference cycle occurs. To prevent this, use a `weak` reference:
```objc
__weak typeof(self) weakSelf = self;
self.completionHandler = ^{
    [weakSelf doSomething];
};
```

### Dynamic Runtime and Messaging
The Objective-C runtime is highly dynamic. Methods are resolved at runtime, not compile time.
Features include:
- **Introspection**: Checking class hierarchy (`[obj isKindOfClass:[MyClass class]]`), checking if an object responds to a selector (`[obj respondsToSelector:@selector(myMethod)]`).
- **Message Forwarding**: If an object receives a message it doesn't understand, the runtime gives it a chance to forward the message to another object or handle it dynamically.
- **Method Swizzling**: Exchanging the implementation of a method at runtime. Highly powerful for instrumentation and debugging, but dangerous if misused.

### Protocols (Interfaces)
Protocols define a list of methods that a class must or may implement, similar to interfaces in Java or C#.
```objc
@protocol MyDelegate <NSObject>
@required
- (void)didCompleteTask;
@optional
- (void)didUpdateProgress:(float)progress;
@end
```

## Ecosystem & Tooling

### Xcode
Apple's official IDE, Xcode, is the primary tool for writing Objective-C. It provides deep integration with the Clang compiler, LLDB debugger, and Instruments (for performance profiling).

### Cocoa and Cocoa Touch
The standard application frameworks for Apple platforms.
- **Foundation**: Core data types (NSString, NSArray, NSDictionary), networking, file handling, threading.
- **AppKit** (macOS) / **UIKit** (iOS): The UI layer, providing windows, buttons, text fields, and view controllers.

### Dependency Management
- **CocoaPods**: The most popular centralized dependency manager. Uses a `Podfile` and generates an Xcode Workspace. Still widely used for older projects.
- **Carthage**: A decentralized dependency manager that builds frameworks but leaves the integration to the developer.
- **Swift Package Manager (SPM)**: Apple's official package manager. While designed for Swift, it also supports C, C++, and Objective-C targets.

## Code Examples

### 1. Hello World and String Manipulation
```objc
#import <Foundation/Foundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // Foundation string literal using @
        NSString *greeting = @"Hello, Objective-C!";
        NSLog(@"%@", greeting);
        
        // String formatting
        NSString *name = @"Alice";
        int age = 30;
        NSString *formattedStr = [NSString stringWithFormat:@"%@ is %d years old.", name, age];
        NSLog(@"%@", formattedStr);
        
        // Mutability (Immutable vs Mutable)
        NSMutableString *mutableStr = [NSMutableString stringWithString:@"Mutable"];
        [mutableStr appendString:@" String"];
        NSLog(@"%@", mutableStr);
    }
    return 0;
}
```

### 2. Classes, Properties, and Methods
```objc
#import <Foundation/Foundation.h>

// Person.h
@interface Person : NSObject
@property (nonatomic, copy) NSString *name;
@property (nonatomic, assign) NSInteger age;
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age;
- (void)introduceYourself;
+ (Person *)personWithName:(NSString *)name age:(NSInteger)age; // Factory method
@end

// Person.m
@implementation Person
- (instancetype)initWithName:(NSString *)name age:(NSInteger)age {
    self = [super init];
    if (self) {
        _name = [name copy];
        _age = age;
    }
    return self;
}

+ (Person *)personWithName:(NSString *)name age:(NSInteger)age {
    return [[self alloc] initWithName:name age:age];
}

- (void)introduceYourself {
    NSLog(@"Hi, I'm %@, %ld years old.", self.name, (long)self.age);
}
@end

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        Person *p = [Person personWithName:@"Bob" age:25];
        [p introduceYourself];
    }
    return 0;
}
```

### 3. Collections (Arrays and Dictionaries)
```objc
#import <Foundation/Foundation.h>

void demonstrateCollections() {
    // Array literals (immutable)
    NSArray *fruits = @[@"Apple", @"Banana", @"Cherry"];
    NSLog(@"First fruit: %@", fruits[0]); // Subscripting support
    
    // Mutable Array
    NSMutableArray *mutableFruits = [NSMutableArray arrayWithArray:fruits];
    [mutableFruits addObject:@"Date"];
    
    // Dictionary literals (immutable)
    NSDictionary *ages = @{
        @"Alice": @30, // NSNumber literal
        @"Bob": @25
    };
    NSLog(@"Alice's age: %@", ages[@"Alice"]);
    
    // Enumerating a dictionary
    [ages enumerateKeysAndObjectsUsingBlock:^(id key, id obj, BOOL *stop) {
        NSLog(@"%@ is %@", key, obj);
    }];
}
```

### 4. Concurrency with Grand Central Dispatch (GCD)
GCD is the C-based API for handling concurrent operations.
```objc
#import <Foundation/Foundation.h>

void fetchNetworkData(void (^completion)(NSData *data)) {
    // Dispatch to a background queue
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSLog(@"Fetching data on background thread...");
        [NSThread sleepForTimeInterval:2.0]; // Simulate network delay
        NSData *mockData = [@"Response Data" dataUsingEncoding:NSUTF8StringEncoding];
        
        // Dispatch back to the main queue to update UI or return result
        dispatch_async(dispatch_get_main_queue(), ^{
            NSLog(@"Data fetch complete, returning on main thread.");
            if (completion) {
                completion(mockData);
            }
        });
    });
}
```

### 5. Delegation Pattern
The delegation pattern is pervasive in Cocoa. It uses protocols and weak references.
```objc
#import <Foundation/Foundation.h>

// DataFetcher.h
@protocol DataFetcherDelegate <NSObject>
- (void)dataFetcherDidCompleteWithData:(NSString *)data;
- (void)dataFetcherDidFailWithError:(NSError *)error;
@end

@interface DataFetcher : NSObject
// Delegate must be weak to prevent retain cycles
@property (nonatomic, weak) id<DataFetcherDelegate> delegate;
- (void)fetchData;
@end

// DataFetcher.m
@implementation DataFetcher
- (void)fetchData {
    // Simulate fetching
    BOOL success = YES;
    if (success) {
        // Check if delegate responds before sending message
        if ([self.delegate respondsToSelector:@selector(dataFetcherDidCompleteWithData:)]) {
            [self.delegate dataFetcherDidCompleteWithData:@"Secret Data"];
        }
    }
}
@end
```

### 6. Working with Blocks and Avoiding Retain Cycles
```objc
#import <Foundation/Foundation.h>

@interface TaskRunner : NSObject
@property (nonatomic, copy) void (^completionBlock)(void);
@property (nonatomic, strong) NSString *taskName;
- (void)startTask;
@end

@implementation TaskRunner
- (void)startTask {
    // WRONG: Using self directly causes a retain cycle if self retains the block.
    // self.completionBlock = ^{ NSLog(@"Finished %@", self.taskName); };
    
    // CORRECT: Use a weak reference to self inside the block.
    __weak typeof(self) weakSelf = self;
    self.completionBlock = ^{
        // Optionally create a strong reference inside the block to ensure it lives for the duration of the execution
        __strong typeof(weakSelf) strongSelf = weakSelf;
        if (strongSelf) {
            NSLog(@"Finished %@", strongSelf.taskName);
        }
    };
    
    // Simulate task completion
    self.completionBlock();
}
@end
```

### 7. Method Swizzling (Advanced Runtime)
Swizzling swaps the implementation of two methods at runtime. Used carefully for logging, analytics, or patching bugs in compiled frameworks.
```objc
#import <Foundation/Foundation.h>
#import <objc/runtime.h>

@interface UIViewController (Tracking)
@end

@implementation UIViewController (Tracking)

+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class class = [self class];
        
        SEL originalSelector = @selector(viewWillAppear:);
        SEL swizzledSelector = @selector(xxx_viewWillAppear:);
        
        Method originalMethod = class_getInstanceMethod(class, originalSelector);
        Method swizzledMethod = class_getInstanceMethod(class, swizzledSelector);
        
        // Attempt to add the method (in case it's implemented in a superclass)
        BOOL didAddMethod = class_addMethod(class,
                                            originalSelector,
                                            method_getImplementation(swizzledMethod),
                                            method_getTypeEncoding(swizzledMethod));
        
        if (didAddMethod) {
            class_replaceMethod(class,
                                swizzledSelector,
                                method_getImplementation(originalMethod),
                                method_getTypeEncoding(originalMethod));
        } else {
            method_exchangeImplementations(originalMethod, swizzledMethod);
        }
    });
}

#pragma mark - Method Swizzling

- (void)xxx_viewWillAppear:(BOOL)animated {
    // Call the original method. This doesn't cause infinite recursion because
    // the implementations have been swapped. xxx_viewWillAppear: now points to the original.
    [self xxx_viewWillAppear:animated];
    NSLog(@"viewWillAppear: swizzled! %@ is appearing.", NSStringFromClass([self class]));
}
@end
```

### 8. Nullability Annotations
Modern Objective-C uses nullability annotations to improve interoperability with Swift's optionals.
```objc
// The NS_ASSUME_NONNULL_BEGIN/END macros wrap headers
NS_ASSUME_NONNULL_BEGIN

@interface UserProfile : NSObject
// Property will never be nil (Swift: String)
@property (nonatomic, copy) NSString *username;

// Property can be nil (Swift: String?)
@property (nonatomic, copy, nullable) NSString *bio;

// Method taking non-null and returning non-null
- (NSString *)generateGreetingForUser:(NSString *)user;
@end

NS_ASSUME_NONNULL_END
```

## Best Practices

1. **Prefix Class Names**: Objective-C lacks namespace support. Always prefix class names with 2-3 uppercase letters unique to your project or company (e.g., `MYCDataManager`, `XYZNetworkClient`). Apple reserves two-letter prefixes (like `NS` and `UI`).
2. **Use `instancetype`**: Always use `instancetype` as the return type for `init` methods and factory methods, rather than `id`. It provides better compile-time type checking.
3. **Avoid `#import` in Headers**: Use `@class` forward declarations in header files to minimize compilation dependencies. Only `#import` what is absolutely necessary in the header; import the rest in the `.m` file.
4. **Prefer Properties over Instance Variables (ivars)**: Always declare `@property` instead of raw ivars. Properties automatically generate getters/setters and handle memory management (retain/copy semantics) correctly. Access them via `self.propertyName`, except inside `init` and `dealloc` methods where direct ivar access (`_propertyName`) is safer to avoid firing KVO or side effects.
5. **Manage Blocks Carefully**: Always use weak references (`__weak typeof(self) weakSelf = self;`) when referencing `self` inside a block that is retained by `self` or another object in a cycle.
6. **Use Fast Enumeration**: Prefer `for (id object in array)` over index-based C loops (`for (int i=0; i<array.count; i++)`) for better performance and readability.
7. **Literal Syntax**: Use modern Objective-C literals (`@[]` for arrays, `@{}` for dictionaries, `@42` for numbers) to make code more concise and safer (literals crash if you try to insert `nil`, catching bugs early).
8. **Nullability Annotations**: Annotate public APIs with `_Nullable` and `_Nonnull` (or use `NS_ASSUME_NONNULL_BEGIN`) to ensure safe bridging into Swift.
9. **Beware of `nil` Messaging**: Sending a message to `nil` in Objective-C is completely valid and silently returns 0/nil. While this prevents crashes from null pointer exceptions, it can hide logical bugs. Be cautious when chaining method calls.
10. **Deallocation**: In ARC, you rarely need to implement `dealloc`. If you do, it's only to remove observers (KVO/NSNotificationCenter) or release C-level resources. Never call `[super dealloc]` under ARC.
