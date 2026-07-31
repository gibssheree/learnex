---
tags: [programming-language, scripting, text-processing, legacy]
category: Scripting/Dynamic
status: to-learn
---

# Perl

**Definition:** Dynamic scripting language that became famous for text processing, regex-heavy parsing, and quick Unix automation in the pre-Python/PHP era.

**Paradigm:** Procedural | **Typing:** Dynamic

## Pros
- Excellent at regex substitutions, capture groups, and line-oriented text munging.
- CPAN provides a very large catalog of modules for system scripting, web, bioinformatics, and legacy integration.
- Mature runtime and language semantics make decades-old scripts surprisingly portable.
- Great fit for one-off admin tasks where expressiveness matters more than mainstream popularity.

## Cons
- Dense syntax and sigils can be difficult to read in large codebases.
- New projects rarely choose Perl unless they need compatibility with an existing estate.
- The ecosystem is stable, but mainstream momentum has slowed relative to Python and JavaScript.
- Complex Perl can become clever fast, which harms maintainability.

## Best For
- Log parsing, report shaping, and ad hoc data cleanup.
- Legacy sysadmin and ops scripts that already depend on Perl libraries.
- Bioinformatics and scientific pipelines with existing Perl tooling.

## Real Examples
- Many Unix utilities and legacy internal scripts were written in Perl for years.
- Bioinformatics pipelines still use Perl in some labs and research environments.
- CPAN remains one of the broadest legacy module ecosystems in scripting.

## Use Cases
- Text extraction from messy files, headers, and line-based logs.
- Legacy cron jobs that need regex power and mature modules.
- Example:

```perl
while (<STDIN>) {
	s/ERROR/WARN/g;
	print if /WARN/;
}
```

## Extended Syntax & Features

Perl's syntax is heavily influenced by C, shell scripting (sh), awk, and sed. It uses curly braces for code blocks and semicolons to terminate statements.

### Variables and Sigils
Perl uses sigils (symbols in front of variable names) to indicate the data type or the type of access:
- **`$` (Scalar):** Represents a single value, such as a number, a string, or a reference. Think of `$` as "singular".
- **`@` (Array):** Represents an ordered list of scalars. Think of `@` as "all".
- **`%` (Hash):** Represents an unordered set of key/value pairs. Think of `%` as "pairs" or "percent" (keys mapping to values).

```perl
my $name = "Alice";
my @colors = ("red", "green", "blue");
my %ages = ("Alice" => 30, "Bob" => 25);
```

### Context
One of Perl's most defining and sometimes confusing features is **context**. An expression in Perl can be evaluated in scalar context or list context, and its behavior may change drastically.
- **Scalar Context:** When a single value is expected. For example, assigning an array to a scalar variable evaluates the array in scalar context, yielding the number of elements in the array.
- **List Context:** When a list of values is expected.

```perl
my @array = ('a', 'b', 'c');
my $count = @array; # Scalar context: $count is 3
my @copy  = @array; # List context: copies all elements
```

### Control Structures
Perl offers standard control flow constructs, plus some unique ones designed for expressiveness.
- `if`, `elsif`, `else`
- `unless` (the opposite of `if`)
- loops: `while`, `until`, `for`, `foreach`
- Statement modifiers: You can append conditions to statements.
```perl
print "Positive\n" if $number > 0;
die "File not found" unless -e $filename;
```

### Subroutines
Subroutines (functions) are defined using the `sub` keyword. Arguments are passed in the special array `@_`.

```perl
sub greet {
    my ($name) = @_; # Unpack arguments
    print "Hello, $name!\n";
}
```

### Regular Expressions
Perl's regex engine is so powerful that PCRE (Perl Compatible Regular Expressions) became the standard for many other languages. Regexes are tightly integrated into the syntax via the `=~` binding operator.
- Match: `$string =~ /pattern/`
- Substitute: `$string =~ s/pattern/replacement/g`
- Transliterate: `$string =~ tr/a-z/A-Z/`

## Advanced Concepts

### References and Complex Data Structures
Because arrays and hashes can only hold scalars, nested data structures (like an array of arrays, or a hash of hashes) require **references**. A reference is a scalar that "points" to another data structure.

- Creating references: `\`, `[]` (anonymous array), `{}` (anonymous hash).
- Dereferencing: Prefixing the reference with the appropriate sigil (`$`, `@`, `%`) or using the arrow operator `->`.

```perl
my $array_ref = [1, 2, 3];
my $hash_ref  = { key => 'value' };

print $array_ref->[0];      # Outputs 1
print $hash_ref->{key};     # Outputs 'value'
```

### Object-Oriented Perl
Historically, OOP in Perl was bolted on. A class is just a package, an object is simply a referenced data structure "blessed" into a package, and a method is a subroutine whose first argument is the object or class name.

Because manual blessing involves boilerplate, modern Perl heavily relies on object systems like **Moose** or its lighter variant **Moo**, which provide attributes, roles (traits), type constraints, and method modifiers.

### Map and Grep
Perl embraces functional programming concepts like `map` and `grep` for transforming and filtering lists, which makes data processing extremely concise.

```perl
my @numbers = (1..5);
my @squares = map { $_ * $_ } @numbers;       # 1, 4, 9, 16, 25
my @evens   = grep { $_ % 2 == 0 } @numbers;  # 2, 4
```

### Metaprogramming and `AUTOLOAD`
Perl allows flexible metaprogramming. If you call a method that doesn't exist, Perl will look for a subroutine named `AUTOLOAD` in the class hierarchy. This allows for dynamic method generation at runtime.

### Lexical Scoping and Closures
`my` creates lexically scoped variables. Perl fully supports closures, allowing subroutines to capture and maintain access to lexical variables from their enclosing scope even after that scope has finished executing.

## Ecosystem & Tooling

### CPAN (Comprehensive Perl Archive Network)
CPAN is Perl's killer feature. It is a vast, centralized repository of over 200,000 modules contributed by the community. For almost any task (parsing obscure formats, interfacing with old hardware, interacting with web APIs), there is likely a CPAN module.

### Package Managers
- **cpan**: The traditional shell for CPAN.
- **cpanm (cpanminus)**: A modern, fast, zero-configuration client for downloading and installing CPAN modules. It's the standard for modern Perl development.
- **Carton**: A dependency manager for Perl, similar to Ruby's Bundler or Node's npm/yarn.

### Web Frameworks
- **Mojolicious**: A modern, real-time web framework out of the box, with built-in async capabilities, WebSockets, and zero dependencies.
- **Dancer2**: A lightweight, micro-framework similar to Ruby's Sinatra or Python's Flask.
- **Catalyst**: An older, highly flexible enterprise-level MVC framework.

### Development Tools
- **perlbrew / plenv**: Tools to manage multiple installations of Perl in your user directory, avoiding conflicts with the system Perl.
- **Test::More**: The standard testing module. Perl has a very strong culture of testing, and the Test Anything Protocol (TAP) originated here.
- **Perl::Critic**: A static analysis tool to enforce best practices and coding standards (often based on Damian Conway's *Perl Best Practices* book).
- **Perl::Tidy (perltidy)**: A code formatter to ensure consistent indentation and style.

## Code Examples

### 1. Basic Hello World and Data Types

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use feature 'say';

# Scalar
my $greeting = "Hello, World!";
say $greeting; # 'say' is like 'print' but adds a newline

# Array
my @fruits = ('Apple', 'Banana', 'Cherry');
say "First fruit: $fruits[0]";
say "Total fruits: ", scalar @fruits;

# Hash
my %user = (
    name => 'Alice',
    role => 'Admin'
);
say "User $user{name} is an $user{role}.";
```

### 2. File I/O and Error Handling

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use autodie; # Automatically die upon failed system calls like 'open'

my $filename = 'example.txt';

# Write to a file
# Use 3-argument open and lexical filehandles ($fh)
open(my $out_fh, '>', $filename);
print $out_fh "Line 1: Perl is powerful\n";
print $out_fh "Line 2: Text processing is easy\n";
close($out_fh);

# Read from a file
open(my $in_fh, '<', $filename);
while (my $line = <$in_fh>) {
    chomp $line; # Remove trailing newline
    print "Read: $line\n";
}
close($in_fh);
```

### 3. Advanced Regex and Log Parsing

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use Data::Dumper;

my @logs = (
    '2023-10-01 12:00:01 INFO User admin logged in.',
    '2023-10-01 12:05:22 WARN High memory usage detected.',
    '2023-10-01 12:10:45 ERROR Database connection failed!'
);

my @parsed_logs;

foreach my $entry (@logs) {
    # Using named capture groups in regex (requires Perl 5.10+)
    if ($entry =~ /^(?<date>\S+)\s+(?<time>\S+)\s+(?<level>[A-Z]+)\s+(?<msg>.*)$/) {
        push @parsed_logs, {
            date  => $+{date},
            time  => $+{time},
            level => $+{level},
            msg   => $+{msg}
        };
    }
}

# Dump the parsed data structure
print Dumper(\@parsed_logs);
```

### 4. Closures and Functional Programming

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use feature 'say';

# A subroutine that returns an anonymous subroutine (a closure)
sub make_counter {
    my $start = shift || 0;
    
    return sub {
        my $increment = shift || 1;
        $start += $increment;
        return $start;
    };
}

my $counter1 = make_counter(10);
my $counter2 = make_counter(100);

say "Counter 1: ", $counter1->();  # 11
say "Counter 1: ", $counter1->(4); # 15
say "Counter 2: ", $counter2->();  # 101
```

### 5. Object-Oriented Programming (with Moo)

```perl
#!/usr/bin/env perl
use strict;
use warnings;

# Definition of the class
package Animal {
    use Moo; # A lightweight OOP system
    
    # Define an attribute
    has name => (
        is       => 'ro', # Read-only
        required => 1,
    );

    has sound => (
        is      => 'rw', # Read-write
        default => sub { '...' },
    );

    # Method
    sub speak {
        my ($self) = @_;
        printf "%s says %s!\n", $self->name, $self->sound;
    }
}

# Main script using the class
package main {
    my $dog = Animal->new(name => 'Fido', sound => 'Woof');
    $dog->speak();

    my $unknown = Animal->new(name => 'Mystery');
    $unknown->speak();
}
```

### 6. Complex Data Structures (HoA)

```perl
#!/usr/bin/env perl
use strict;
use warnings;

# Hash of Arrays
my %departments = (
    Engineering => ['Alice', 'Bob', 'Charlie'],
    Sales       => ['David', 'Eve'],
    HR          => ['Frank']
);

# Adding an element to the nested array
push @{ $departments{Sales} }, 'Grace';

# Iterating over the structure
foreach my $dept (sort keys %departments) {
    print "$dept Department:\n";
    foreach my $employee (@{ $departments{$dept} }) {
        print "  - $employee\n";
    }
}
```

### 7. Network Requests using HTTP::Tiny

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use HTTP::Tiny;
use JSON::PP;

my $http = HTTP::Tiny->new();
my $url  = 'https://api.github.com/repos/perl/perl5';

print "Fetching data from $url...\n";
my $response = $http->get($url);

if ($response->{success}) {
    # Decode JSON response
    my $data = decode_json($response->{content});
    printf "Repository: %s\n", $data->{full_name};
    printf "Stars: %d\n", $data->{stargazers_count};
    printf "Description: %s\n", $data->{description};
} else {
    die "Failed to fetch data: $response->{status} $response->{reason}\n";
}
```

### 8. Command Line Arguments parsing

```perl
#!/usr/bin/env perl
use strict;
use warnings;
use Getopt::Long;

my $verbose = 0;
my $file    = "";
my @tags    = ();

# Parse command line options
GetOptions(
    "verbose!" => \$verbose,    # Flag (--verbose or --noverbose)
    "file=s"   => \$file,       # String value (--file path/to/file)
    "tag=s"    => \@tags,       # Multiple string values (--tag a --tag b)
) or die "Error in command line arguments\n";

print "Verbose mode: ", ($verbose ? "ON" : "OFF"), "\n";
print "Target File: $file\n" if $file;
print "Tags: ", join(", ", @tags), "\n" if @tags;

# Remaining non-option arguments are in @ARGV
print "Remaining args: @ARGV\n";
```

### 9. Subroutine argument validation and signatures

```perl
#!/usr/bin/env perl
use strict;
use warnings;
# Enable experimental subroutine signatures (introduced in 5.20, no longer experimental in 5.36)
use feature 'signatures';
no warnings 'experimental::signatures';

# Using signatures instead of manual @_ unpacking
sub calculate_area ($width, $height) {
    die "Width and height must be positive" 
        if $width <= 0 || $height <= 0;
    
    return $width * $height;
}

printf "Area: %d\n", calculate_area(5, 10);
```

### 10. Exception Handling (eval)

```perl
#!/usr/bin/env perl
use strict;
use warnings;

sub risky_operation {
    my $divisor = shift;
    die "Cannot divide by zero!" if $divisor == 0;
    return 100 / $divisor;
}

# The 'eval' block traps exceptions (dies)
eval {
    print "Attempting division by 2...\n";
    my $result1 = risky_operation(2);
    print "Result: $result1\n";

    print "Attempting division by 0...\n";
    my $result2 = risky_operation(0); # This will die
    print "This line will not be reached.\n";
};

# Check if an exception was caught
if ($@) {
    warn "Caught an exception: $@";
}

print "Program continues normally.\n";
```

## Best Practices

1. **Always use strict and warnings:** Every Perl script or module should start with `use strict;` and `use warnings;`. This prevents typos, forces variable declaration, and catches many common logical errors.
2. **Lexical Filehandles:** Always use the 3-argument version of `open` and lexical filehandles. Avoid global bareword filehandles. 
   - Good: `open(my $fh, '<', $filename) or die $!;`
   - Bad: `open(FH, "<$filename");`
3. **Check System Calls:** Always check the return value of system calls (like `open`, `close`, `system`). Use the `autodie` pragma to automatically throw exceptions on failure.
4. **Use CPAN:** Before reinventing the wheel (especially for CSV parsing, JSON parsing, date/time manipulation, or HTTP requests), search CPAN for an existing, well-tested module.
5. **Modern OOP:** Avoid manual `bless` for complex objects. Use `Moo` or `Moose` to construct robust object-oriented systems with predictable attributes and roles.
6. **Readable Regex:** For complex regular expressions, use the `/x` modifier. This allows you to add whitespace and comments inside the regex pattern, vastly improving readability.
7. **Perl Critic:** Use `Perl::Critic` (or `perlcritic` command) to analyze your code and ensure adherence to established community best practices.
8. **Pass by Reference:** When passing large arrays or hashes to subroutines, pass references (`\@array`, `\%hash`) rather than passing the entire structure by value, which flattens the lists and consumes unnecessary memory and time.
9. **Avoid `$_` in complex scopes:** The default variable `$_` is incredibly useful for concise one-liners and short loops. However, relying on it in large `while` loops or deeply nested logic can cause subtle bugs if functions implicitly overwrite it. Use named variables in larger scopes.
