---
tags: [programming-language, scripting, devops, shell]
category: Scripting/Dynamic
status: to-learn
---

# Bash

**Definition:** POSIX-adjacent shell scripting language for interactive command-line work and Unix automation, with expansion rules and process semantics that are tightly coupled to the shell environment.

**Paradigm:** Procedural/scripting | **Typing:** Dynamic (string-based)

## Pros
- Installed by default on most Linux distributions and available on macOS and many embedded/CI environments.
- Excellent for orchestrating existing CLI tools because shell pipelines, exit codes, and environment variables are first-class.
- Small scripts can replace a long chain of manual operations, especially for packaging, release, and admin tasks.
- Text processing primitives like `grep`, `sed`, `awk`, `cut`, `sort`, and `xargs` make data-wrangling fast for simple jobs.

## Cons
- Word splitting, glob expansion, and quoting rules are easy to get wrong and can create subtle security or correctness bugs.
- Error handling is fragile unless `set -euo pipefail`, explicit status checks, and careful subshell use are applied.
- Arrays, associative data, and structured control flow are weaker than in general-purpose languages.
- Portability varies between bash, sh, zsh, and dash, so scripts often depend on Bash-specific features without stating it clearly.
- Large codebases in shell become hard to test and debug because state lives in the environment and subprocesses.

## Best For
- Short automation scripts for local development, CI jobs, and release orchestration.
- Linux system administration where the job is to compose existing commands rather than implement business logic.
- Docker entrypoints, provisioning hooks, and install scripts that need to work early in the boot or deployment lifecycle.

## Real Examples
- `~/.bashrc`, `~/.profile`, and deployment hooks on Linux servers.
- Container entrypoints for images that need light startup logic before the main process starts.
- CI/CD steps in GitHub Actions, GitLab CI, and Jenkins where shell commands glue other tooling together.

## Use Cases
- Environment bootstrapping, release tagging, artifact upload, and log collection.
- Process supervision helpers that inspect ports, files, or system state before launching a service.
- Pipeline glue that transforms command output between tools with pipes and temporary files.

## Extended Syntax & Features

Bash is primarily a command processor that typically runs in a text window, where the user types commands that cause actions. Bash can also read and execute commands from a file, called a shell script. It acts as the glue that ties various Unix programs together.

### Basic Data Types

Unlike most general-purpose programming languages, Bash doesn't have a strict typing system. Everything is essentially a string, though the context determines whether that string is treated as text, a number, or a command.

*   **Strings:** The fundamental unit. They can be enclosed in single quotes `'...'` (literal string, absolutely no interpolation) or double quotes `"..."` (allows variable expansion and command substitution).
*   **Integers:** When used in arithmetic contexts like `$((1 + 2))` or with `declare -i`, strings containing only digits can be evaluated as integers.
*   **Arrays:**
    *   **Indexed Arrays:** Numerically indexed, declared using `declare -a arr_name` or `arr_name=(val1 val2)`. These are zero-indexed.
    *   **Associative Arrays:** String-indexed (key-value dictionaries), requires Bash 4.0 or newer, declared using `declare -A hash_name`.

### Control Flow

Bash supports standard control flow structures, often using syntax derived from the Bourne Shell (`sh`).

*   **If-Else Statements:**
    ```bash
    if [ "$VAR" == "yes" ]; then
        echo "Approved"
    elif [ "$VAR" == "no" ]; then
        echo "Denied"
    else
        echo "Unknown"
    fi
    ```
    Note the spacing around `[` and `]`, which are actually command invocations (specifically, the `test` builtin). The `[[ ... ]]` syntax is a newer, safer Bash-specific extension that prevents many common quoting errors.

*   **Loops:**
    *   **For Loops:**
        ```bash
        # Iterating over items
        for i in apple banana cherry; do
            echo "Fruit: $i"
        done

        # C-style for loops
        for ((i = 0; i < 5; i++)); do
            echo "Count: $i"
        done
        ```
    *   **While Loops:**
        ```bash
        count=0
        while [ $count -lt 5 ]; do
            echo "Count: $count"
            ((count++))
        done
        ```
    *   **Until Loops:** Similar to while loops, but run until the condition becomes true.

*   **Case Statements:** Good for handling multiple possible string matches.
    ```bash
    case "$1" in
        start)
            echo "Starting..."
            ;;
        stop)
            echo "Stopping..."
            ;;
        restart|reload)
            echo "Restarting..."
            ;;
        *)
            echo "Usage: $0 {start|stop|restart}"
            ;;
    esac
    ```

### Functions

Functions in Bash group commands and can take arguments. Arguments are passed as positional parameters (`$1`, `$2`, etc.), not as named arguments in the function definition.

```bash
my_function() {
    local param1="$1"
    local param2="$2"
    echo "Param 1: $param1, Param 2: $param2"
    
    # Return an exit status, not a string value
    # To return data, echo it and capture it with command substitution
    return 0
}

# Calling the function
my_function "Hello" "World"
```
The `local` keyword restricts the variable scope to the function, which is crucial for preventing global namespace pollution.

## Advanced Concepts

### Expansion and Substitution

Bash is heavily reliant on expansions, which happen before a command is executed.

1.  **Brace Expansion:** Generates arbitrary strings. `echo a{d,c,b}e` -> `ade ace abe`. It's often used for generating sequences: `echo {1..5}`.
2.  **Tilde Expansion:** Expands `~` to the home directory of the current user.
3.  **Parameter/Variable Expansion:** Accessing variable values with `$VAR` or `${VAR}`. Supports robust string manipulation:
    *   `${VAR:-default}`: Use default if VAR is unset or null.
    *   `${VAR:=default}`: Assign and use default if VAR is unset.
    *   `${VAR#pattern}`: Remove shortest match of pattern from start.
    *   `${VAR##pattern}`: Remove longest match of pattern from start.
    *   `${VAR%pattern}`: Remove shortest match of pattern from end.
    *   `${VAR%%pattern}`: Remove longest match of pattern from end.
    *   `${VAR/search/replace}`: Replace first occurrence.
    *   `${VAR//search/replace}`: Replace all occurrences.
4.  **Command Substitution:** Executes a command and replaces it with its standard output. Use `$(command)` instead of the older, hard-to-nest backticks `` `command` ``.
5.  **Arithmetic Expansion:** Evaluates an arithmetic expression and replaces it with the result. `$((expression))`.
6.  **Process Substitution:** Allows a process's input or output to be referred to using a filename. `<(command)` or `>(command)`.
7.  **Word Splitting:** The shell scans the results of parameter expansion, command substitution, and arithmetic expansion for word boundaries defined by the `$IFS` (Internal Field Separator) variable. By default, this is space, tab, and newline.
8.  **Filename Expansion (Globbing):** Replaces patterns like `*`, `?`, `[...]` with matching filenames in the file system.

### File Descriptors and Redirection

Unix models input and output streams as file descriptors.
*   `0`: Standard Input (stdin)
*   `1`: Standard Output (stdout)
*   `2`: Standard Error (stderr)

*   `> file`: Redirect stdout to a file (overwrite).
*   `>> file`: Redirect stdout to a file (append).
*   `2> file`: Redirect stderr to a file.
*   `&> file`: Redirect both stdout and stderr to a file.
*   `2>&1`: Redirect stderr to where stdout is currently pointing.
*   `< file`: Feed a file into stdin.
*   `<< EOF`: Here-document. Feed a multiline string block into stdin.
*   `<<< "string"`: Here-string. Feed a single string into stdin.

### Subshells and Concurrency

When commands are grouped with `( ... )`, they execute in a subshell—a separate child process. Variables modified in a subshell do not affect the parent shell.

Concurrency in Bash is primarily achieved by sending processes to the background using `&` and managing them with `wait`.

```bash
# Run jobs in background
task1 &
task2 &

# Wait for all background jobs to finish
wait
echo "All tasks completed."
```
Pipes (`|`) also inherently create concurrency, as each command in a pipeline is executed in its own subshell simultaneously, with stdout of one feeding stdin of the next.

### Signals and Traps

Bash can intercept signals sent to the script (like SIGINT when you press Ctrl+C) using the `trap` command. This is essential for cleaning up temporary files or gracefully shutting down.

```bash
cleanup() {
    echo "Cleaning up temporary files..."
    rm -f /tmp/my_temp_file
}

# Run the cleanup function on EXIT, SIGINT, or SIGTERM
trap cleanup EXIT SIGINT SIGTERM
```

## Ecosystem & Tooling

While Bash isn't used to build large applications with frameworks in the traditional sense, it has a rich ecosystem of tools that are routinely combined with it.

*   **Core Utilities (GNU coreutils):** The essential tools found on every Unix system: `ls`, `cat`, `rm`, `cp`, `mv`, `mkdir`, `tail`, `head`, `date`, `touch`, `chmod`, `chown`.
*   **Text Processing:**
    *   `grep`: Searching text using regular expressions.
    *   `sed`: Stream editor for text substitution and manipulation.
    *   `awk`: A full text processing language, excellent for column-based data.
    *   `cut`, `sort`, `uniq`, `tr`, `wc`: Essential tools for filtering and sorting text.
*   **Networking:** `curl`, `wget`, `netcat` (nc), `ssh`, `scp`, `ping`, `ip`.
*   **Process Management:** `ps`, `top`, `htop`, `kill`, `pkill`, `pgrep`.
*   **JSON Parsing:** `jq` is the standard, indispensable tool for processing JSON data within shell scripts.
*   **Linters and Formatters:**
    *   `shellcheck`: A static analysis tool that finds bugs, edge cases, and stylistic issues in shell scripts. It's considered mandatory for modern Bash development.
    *   `shfmt`: A formatter that automatically formats shell scripts according to consistent style guidelines.
*   **Testing Frameworks:**
    *   `BATS` (Bash Automated Testing System): A popular testing framework for Bash, structured similarly to RSpec or Jest.
    *   `shUnit2`: An xUnit-based testing framework.

## Code Examples

### 1. The Basics: Hello World & Variables

```bash
#!/usr/bin/env bash
# The shebang above tells the OS to run this script with bash

# Variable assignment (no spaces around '=')
NAME="World"
GREETING="Hello, $NAME!"

echo "$GREETING"

# Reading input
read -p "What is your name? " user_name
# Uses default 'Stranger' if input is empty or unset
echo "Nice to meet you, ${user_name:-Stranger}!" 
```

### 2. Data Structures: Indexed and Associative Arrays

```bash
#!/usr/bin/env bash

# Indexed array
servers=("web01" "web02" "db01" "cache01")
servers+=("loadbalancer") # Append element

echo "First server: ${servers[0]}"
echo "All servers: ${servers[@]}"
echo "Number of servers: ${#servers[@]}"

for server in "${servers[@]}"; do
    echo "Deploying to $server..."
done

# Associative array (requires Bash 4+)
declare -A users
users=( ["alice"]="admin" ["bob"]="developer" ["eve"]="auditor" )
users["charlie"]="developer"

echo "Alice's role is ${users[alice]}"

for name in "${!users[@]}"; do
    echo "$name has the role of ${users[$name]}"
done
```

### 3. File Operations and Error Handling

```bash
#!/usr/bin/env bash
# Unofficial Bash Strict Mode
set -euo pipefail
IFS=$'\n\t'

CONFIG_FILE="/etc/my_app.conf"
BACKUP_DIR="/var/backups/my_app"

# Check if script is run as root
if [[ "${EUID}" -ne 0 ]]; then
    echo "Error: This script must be run as root." >&2
    exit 1
fi

# Create backup dir if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if file exists before operating
if [[ -f "$CONFIG_FILE" ]]; then
    # Create a timestamped backup
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp "$CONFIG_FILE" "${BACKUP_DIR}/my_app_${timestamp}.conf"
    echo "Backup created successfully."
else
    echo "Warning: $CONFIG_FILE not found, nothing to backup."
fi
```

### 4. Advanced: API Interactions using curl and jq

```bash
#!/usr/bin/env bash
set -eo pipefail

API_URL="https://api.github.com/repos/torvalds/linux/releases/latest"

echo "Fetching latest Linux release info..."

# Use curl to fetch JSON, then pipe to jq to parse
# -s hides progress bar, -f fails on HTTP errors
response=$(curl -s -f "$API_URL" || echo "")

if [[ -z "$response" ]]; then
    echo "Failed to fetch data." >&2
    exit 1
fi

# Extract specific fields using jq
version=$(echo "$response" | jq -r '.tag_name')
release_date=$(echo "$response" | jq -r '.published_at')

echo "Latest Linux Kernel Version: $version"
echo "Released on: $release_date"
```

### 5. Advanced: Process Substitution and Parallel Execution

```bash
#!/usr/bin/env bash

# Process Substitution: comparing two dynamically generated outputs
# Diff doesn't need to read actual files on disk, it reads from the file descriptors
diff -u <(ls -l /bin | grep bash) <(ls -l /usr/bin | grep bash) || true

# Parallel execution for speed
process_image() {
    local img="$1"
    echo "Processing $img in background... (PID: $BASHPID)"
    sleep 2 # Simulate work
    echo "Finished $img"
}

images=("img1.jpg" "img2.jpg" "img3.jpg" "img4.jpg")

for img in "${images[@]}"; do
    process_image "$img" &  # Push to background
done

echo "Waiting for all image processing to complete..."
wait
echo "All done!"
```

## Best Practices

1.  **Use the Unofficial Bash Strict Mode:** Always start scripts with `set -euo pipefail`.
    *   `-e`: Exit immediately if a pipeline returns a non-zero status.
    *   `-u`: Treat unset variables as an error when substituting.
    *   `-o pipefail`: Return value of a pipeline is the status of the last command to exit with a non-zero status, or zero if no command exited with a non-zero status.
2.  **Quote Your Variables:** Always put double quotes around variable substitutions (`"$VAR"`) unless you specifically want word splitting and globbing to occur. This is the #1 cause of bugs in Bash.
3.  **Prefer `[[ ... ]]` over `[ ... ]`:** The double bracket test construct is a Bash extension that is safer, doesn't require quoting variables as strictly, and supports regex matching (`=~`) and unescaped logical operators (`&&`, `||`).
4.  **Use ShellCheck:** Integrate `shellcheck` into your editor and CI/CD pipelines. It will catch the vast majority of quoting errors and subtle syntax mistakes.
5.  **Use `local` in Functions:** Always declare function variables as `local` to avoid unintended side-effects and clobbering global variables in the broader script scope.
6.  **Use `$(...)` instead of `` `...` ``:** Command substitution with `$()` is more readable, can be nested easily, and handles escaping far better than backticks.
7.  **Use `/usr/bin/env bash`:** Use `#!/usr/bin/env bash` instead of `#!/bin/bash` in the shebang. It makes your script more portable across different Unix-like systems (like macOS or FreeBSD) where Bash might not be in `/bin`.
8.  **Meaningful Exit Codes:** Use `exit 0` for success and non-zero `exit 1`, `exit 2`, etc., to indicate different types of failures. Document what these codes mean.
9.  **Write Output to stderr for Errors:** Use `echo "Error message" >&2` so that standard output only contains the expected data and errors can be redirected or handled separately by the caller.
10. **Keep it Short:** If your Bash script exceeds 300-500 lines, heavily relies on complex data structures (like multi-dimensional arrays or objects), or requires complex string manipulation/math, it is usually time to rewrite it in a general-purpose language like Python, Go, or Ruby.
11. **Treat Bash as Glue:** Use it to orchestrate commands, not to reimplement business logic, parsers, or stateful services.
12. **Prefer Functions over Repetition:** If a script has repeated command sequences, wrap them in a function so the flow stays readable and easier to debug.
13. **Keep Portability in Mind:** If a script may run under `sh`, `dash`, or different Linux distros, document which Bash features it depends on.
