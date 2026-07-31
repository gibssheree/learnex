---
tags: [programming-language, scripting, web, backend]
category: Scripting/Dynamic
status: to-learn
---

# PHP

**Definition:** Server-side scripting language built for generating web responses, with tight HTML embedding, broad hosting support, and a huge legacy footprint.

**Paradigm:** Procedural/OOP | **Typing:** Dynamic

## Pros
- Very easy to deploy on shared hosting, small VPS instances, and common LAMP/LNMP stacks.
- Mature web ecosystem with frameworks like Laravel, Symfony, and Yii.
- Still a practical choice for CRUD-heavy apps where request/response code is straightforward.
- The language has improved significantly with modern versions, including stronger typing features, JIT compilation, and better performance.
- WordPress, Drupal, and other CMS platforms keep a massive support ecosystem alive.

## Cons
- Historical inconsistencies and odd naming conventions can make the standard library feel uneven (e.g., `str_replace` vs `strpos`).
- Legacy code often mixes templating, SQL, and business logic in one file, which hurts maintainability and security.
- Security depends heavily on modern framework patterns; old habits around input handling are still common among beginners.
- Large monolithic PHP applications can become difficult to test without disciplined architecture and strict typing.
- Composer and autoloading improved the ecosystem, but older open-source projects may still use ad hoc file loading.

## Best For
- CMS-driven sites, content-heavy portals, and marketing websites (WordPress, Drupal).
- Quick CRUD backends, administrative dashboards, and traditional server-rendered applications.
- Maintaining, scaling, or extending existing PHP estates rather than starting from scratch with another stack.

## Real Examples
- WordPress powers a large fraction of the public web and shapes much of the PHP hosting market.
- Wikipedia, Laravel-based SaaS products, and many agency-built sites are PHP-heavy.
- Facebook began with PHP and later evolved large parts of its stack (creating HHVM and Hack).

## Use Cases
- Content management systems, membership sites, and e-commerce platforms (Magento, WooCommerce).
- REST APIs and GraphQL backends built on Laravel, Symfony, or API Platform.
- Legacy maintenance where PHP is already the dominant operational language in the enterprise.
- Example:

```php
<?php
if (!empty($_GET['q'])) {
	echo htmlspecialchars($_GET['q'], ENT_QUOTES, 'UTF-8');
}
```

## Extended Syntax & Features

### Core Syntax and Structure
PHP scripts are designed to be embedded in HTML or run standalone, enclosed in `<?php ... ?>` tags. Statements are strictly terminated by semicolons `;`. Comments can be single-line `//` or `#`, or multi-line `/* ... */`. Variables are always prefixed with a `$` sign.
Since PHP 8, the language supports strict typing, named arguments, attributes (annotations), and match expressions, modernizing the syntax significantly.

### Basic Data Types
- **Scalars**: `int`, `float` (also known as double), `string`, `bool`.
- **Compound**: `array` (which act as ordered maps, lists, hash maps, or dictionaries), `object`, `callable`, `iterable`.
- **Special**: `resource` (holds references to external resources like database connections or file handles), `null`.
- **Union and Intersection Types**: Introduced in PHP 8, allowing variables to declare they hold more than one type (e.g., `int|string`) or must implement multiple interfaces (e.g., `Iterator&Countable`).

### Control Flow
Standard C-style control flow structures are supported:
- `if`, `else`, `elseif`
- `switch` and the newer `match` expression (provides strict comparison, returns a value, and doesn't require `break` statements)
- `while`, `do-while`, `for`, `foreach` (the idiomatic loop for traversing arrays and objects)
- `break`, `continue`, `return`, `require`, `include`, `require_once`, `include_once`

### Functions and Methods
Functions are defined using the `function` keyword. PHP supports type hinting for parameters and return types, which can be enforced strictly per file using `declare(strict_types=1);`. Arrow functions (`fn(args) => expr`) were introduced in PHP 7.4 for concise closures that capture variables from the parent scope automatically by value.

### Object-Oriented Programming
PHP is a fully featured object-oriented language. It supports:
- Classes, interfaces, traits, and abstract classes.
- Visibility modifiers: `public`, `protected`, `private`.
- Magic methods (e.g., `__construct`, `__destruct`, `__get`, `__set`, `__call`, `__toString`).
- Constructor property promotion (PHP 8.0+), significantly reducing boilerplate.
- Enums (PHP 8.1+), readonly properties, and readonly classes (PHP 8.2+), pushing towards immutable data structures.

## Advanced Concepts

### Memory Management and Request Lifecycle
PHP traditionally operates on a "shared nothing" architecture. Each incoming HTTP request starts a fresh, isolated execution environment. Variables, classes, and configurations are initialized from scratch, and memory is completely freed when the request terminates. This makes PHP highly resilient against memory leaks but can introduce overhead. Technologies like PHP-FPM and OPcache mitigate this by keeping pre-compiled script bytecode in memory. Recently, persistent runtimes (like Swoole or RoadRunner) allow PHP to run as long-lived daemons, drastically improving performance for complex apps.

### Error Handling and Exceptions
PHP 7 revolutionized error handling by introducing the `Throwable` interface, allowing previously fatal engine errors to be caught like standard exceptions. The language uses standard `try`, `catch`, `finally` blocks. Developers can create custom exception classes extending `Exception` or `Error`. Error reporting levels are highly configurable via `php.ini` (`error_reporting`, `display_errors`), which is critical for distinguishing between development (showing everything) and production (logging securely).

### Concurrency and Asynchronous Processing
Historically strictly synchronous and blocking, modern PHP has several avenues for concurrency:
- **Fibers**: Introduced natively in PHP 8.1, Fibers provide lightweight, cooperatively scheduled threads, making asynchronous I/O easier to implement without relying on complex callback structures.
- **Extensions**: Swoole, OpenSwoole, and RoadRunner transform PHP into an asynchronous, event-driven runtime similar to Go or Node.js.
- **Message Queues**: In standard enterprise PHP, asynchronous tasks (email sending, image processing) are typically offloaded to queues like RabbitMQ or Redis and processed by background worker CLI scripts.

### Generators and Iterators
Generators (utilizing the `yield` keyword) provide an elegant way to implement simple iterators without the overhead or complexity of implementing a full class that satisfies the `Iterator` interface. They are exceptionally memory-efficient for iterating over massive datasets, as they only compute or load the current item into memory on demand.

### Traits and Code Reuse
PHP uses single inheritance to prevent hierarchy nightmares but allows horizontal code reuse through Traits. Traits are groups of methods that can be injected into a class using the `use` keyword. They are incredibly useful for adding common, decoupled functionality (like logging, soft-deleting, or caching) across unrelated class trees.

## Ecosystem & Tooling

### Package Management: Composer
Composer is the cornerstone of modern PHP. It manages project dependencies, automatically handles class autoloading (enforcing PSR-4 standards), and enables the sharing of open-source packages via Packagist. No modern PHP project is built without it.

### Web Frameworks
- **Laravel**: The dominant PHP framework globally. It provides an elegant, expressive syntax, a powerful ORM (Eloquent), built-in authentication, robust routing, and a massive ecosystem of first-party tools (Forge, Vapor, Livewire, Nova).
- **Symfony**: A collection of reusable PHP components and a robust, highly stable web framework. It acts as the engine behind many other major tools (including Laravel, Drupal, and Magento) and is the gold standard for enterprise applications.
- **Slim / Lumen**: Micro-frameworks designed for building lightweight APIs and simple web services rapidly.

### Content Management Systems (CMS)
- **WordPress**: Powers over 40% of the entire web. Known for its massive plugin and theme ecosystem, making it the go-to for blogs and small business sites.
- **Drupal / Joomla**: More complex, robust CMS platforms tailored for enterprise scale, custom entity structures, and complex permission models.

### Testing and Quality Assurance
- **PHPUnit**: The industry-standard testing framework for unit and integration testing.
- **Pest**: A newer, highly elegant testing framework with a focus on simplicity, developer experience, and behavior-driven syntax (inspired by Jest).
- **PHPStan / Psalm**: Essential static analysis tools that scan code for bugs, type errors, and inconsistencies without executing the code. They bring compiled-language safety to dynamic PHP.
- **PHP_CodeSniffer / Laravel Pint**: Tools for enforcing coding standards (PSR-12) and automatically formatting code.

## Code Examples

### 1. Basic Web Output and Form Handling
```php
<?php
declare(strict_types=1);

// Safely handle a GET request parameter
$name = $_GET['name'] ?? 'Guest'; // Null coalescing operator

// ALWAYS sanitize output to prevent XSS (Cross-Site Scripting)
$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');

echo "<h1>Welcome, {$safeName}!</h1>";

// Basic array manipulation and iteration
$features = ['Fast', 'Flexible', 'Pragmatic'];
$features[] = 'Modern'; // Append to the end of the array

echo "<ul>\n";
foreach ($features as $feature) {
    echo "  <li>" . htmlspecialchars($feature) . "</li>\n";
}
echo "</ul>\n";
```

### 2. Object-Oriented PHP: Modern Features (PHP 8+)
```php
<?php
declare(strict_types=1);

// PHP 8.1+ Enums for strict state representation
enum UserRole: string {
    case ADMIN = 'admin';
    case EDITOR = 'editor';
    case VIEWER = 'viewer';
}

// PHP 8.2+ Readonly Classes ensure immutability
readonly class User {
    // PHP 8.0+ Constructor Property Promotion
    public function __construct(
        public int $id,
        public string $username,
        public string $email,
        public UserRole $role = UserRole::VIEWER,
    ) {}

    public function getProfileSummary(): string {
        return sprintf(
            "User #%d: %s (%s) - Role: %s", 
            $this->id, 
            $this->username, 
            $this->email, 
            $this->role->value
        );
    }
}

$user = new User(1, 'gilbert', 'gilbert@example.com', UserRole::ADMIN);
echo $user->getProfileSummary();
// Output: User #1: gilbert (gilbert@example.com) - Role: admin
```

### 3. Modern Control Flow: Match Expression
```php
<?php
declare(strict_types=1);

function getHttpStatusCodeMessage(int $code): string {
    // The match expression is strictly typed, returns a value, 
    // and throws an UnhandledMatchError if no arm matches.
    return match ($code) {
        200, 201 => 'Success',
        400 => 'Bad Request',
        401, 403 => 'Unauthorized',
        404 => 'Not Found',
        500, 502, 503, 504 => 'Server Error',
        default => 'Unknown Status Code',
    };
}

echo getHttpStatusCodeMessage(404) . "\n"; // Outputs: Not Found
```

### 4. Database Access with PDO
```php
<?php
declare(strict_types=1);

$dsn = 'mysql:host=127.0.0.1;dbname=app_db;charset=utf8mb4';
$user = 'db_user';
$pass = 'db_pass';

// Standard recommended PDO options
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch as associative arrays
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Use true prepared statements
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Using prepared statements is mandatory to prevent SQL Injection
    $stmt = $pdo->prepare('SELECT id, username FROM users WHERE role = :role');
    $stmt->execute(['role' => 'admin']);
    
    $admins = $stmt->fetchAll();
    
    foreach ($admins as $admin) {
        echo "Admin: " . htmlspecialchars($admin['username']) . "\n";
    }
    
} catch (PDOException $e) {
    // Log error internally, do not expose raw stack trace to users
    error_log("Database connection failed: " . $e->getMessage());
    echo "A database error occurred. Please try again later.\n";
}
```

### 5. Generators for Memory Efficiency
```php
<?php
declare(strict_types=1);

/**
 * This function yields one line at a time instead of loading 
 * the whole file into memory. Ideal for parsing GBs of data.
 */
function readHugeLogFile(string $filePath): Generator {
    $handle = fopen($filePath, 'r');
    if (!$handle) {
        throw new RuntimeException("Could not open file.");
    }
    
    while (($line = fgets($handle)) !== false) {
        yield trim($line);
    }
    
    fclose($handle);
}

// Memory usage remains flat regardless of log file size
$logPath = '/var/log/application.log';
if (file_exists($logPath)) {
    foreach (readHugeLogFile($logPath) as $line) {
        if (str_contains($line, 'ERROR')) {
            echo "Found error: " . htmlspecialchars($line) . "\n";
        }
    }
}
```

### 6. Working with APIs (Stream Contexts)
```php
<?php
declare(strict_types=1);

// Using file_get_contents for a simple GET request
$apiUrl = 'https://api.github.com/users/octocat';

// Create a stream context to send headers (required by GitHub API)
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            "User-Agent: PHP-Script",
            "Accept: application/vnd.github.v3+json"
        ]
    ]
]);

$response = @file_get_contents($apiUrl, false, $context);

if ($response !== false) {
    $data = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
    echo "GitHub Name: " . ($data['name'] ?? 'Unknown') . "\n";
} else {
    echo "Failed to fetch API data.\n";
}

// Note: In modern applications, developers typically use the 
// Guzzle HTTP client library for complex network requests.
```

### 7. Traits and Horizontal Code Reuse
```php
<?php
declare(strict_types=1);

trait LoggerTrait {
    public function log(string $message, string $level = 'INFO'): void {
        $timestamp = date('Y-m-d H:i:s');
        echo "[{$timestamp}] [{$level}] {$message}\n";
    }
}

class PaymentProcessor {
    // Inject the trait's methods into this class
    use LoggerTrait;

    public function process(float $amount): bool {
        $this->log("Starting processing for amount: $" . number_format($amount, 2), 'DEBUG');
        // Complex processing logic would go here...
        $this->log("Payment processed successfully.");
        return true;
    }
}

$processor = new PaymentProcessor();
$processor->process(150.75);
```

## Best Practices

### Use Modern PHP Versions
Always run the latest stable version of PHP (currently 8.x). The performance gains (thanks to internal optimizations and the JIT compiler) and syntax improvements are substantial. Older versions reach end-of-life rapidly and stop receiving critical security updates.

### Adhere to PSR Standards
The PHP-FIG (Framework Interop Group) defines standard recommendations (PSR) that the entire community follows.
- **PSR-1/PSR-12**: Define exact coding style and formatting standards.
- **PSR-4**: Standardizes autoloading classes from file paths, allowing interoperability between libraries.
- **PSR-7 / PSR-15**: Standardize HTTP message interfaces and request handlers.
Use automated tools like `PHP_CodeSniffer` or `PHP-CS-Fixer` to enforce these in your CI pipeline.

### Dependency Management
Never commit the `vendor/` directory to source control. Always commit your `composer.json` and `composer.lock` files, and run `composer install --no-dev --optimize-autoloader` on your production deployment servers.

### Security Defenses
- **SQL Injection**: Never interpolate variables directly into SQL strings. Always use prepared statements via PDO, or utilize a robust ORM like Eloquent or Doctrine.
- **XSS (Cross-Site Scripting)**: Always escape user input before outputting it to the browser. Use `htmlspecialchars($str, ENT_QUOTES, 'UTF-8')` or modern templating engines (Twig, Blade) which automatically escape output by default.
- **CSRF**: Always use Anti-CSRF tokens for forms modifying state.
- **Validation**: Never trust user input. Validate data thoroughly at the boundary of your application before processing it.

### Error Handling
Strictly disable `display_errors` in production environments via `php.ini`. Errors should be logged to a secure file or forwarded to a monitoring service (like Sentry, Bugsnag, or Datadog), not printed to the user's screen, to avoid leaking sensitive stack traces, paths, or environment variables.

### Strict Typing
Use `declare(strict_types=1);` at the top of every PHP file. This prevents PHP from silently converting types (like coercing the string `"10"` into the integer `10`) during function calls, leading to fewer hidden bugs, better IDE autocompletion, and highly predictable code. Pair this with static analysis tools like PHPStan for maximum safety.

### Separation of Concerns
Avoid the historical "PHP script" trap where HTML, CSS, JavaScript, SQL, and business logic live in the same `.php` file. Use the MVC (Model-View-Controller) pattern or clean architecture. Let robust frameworks handle routing and request parsing, use templating engines for views, and isolate business logic in dedicated service classes.
