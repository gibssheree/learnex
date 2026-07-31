---
tags: [programming-language, scripting, devops, windows]
category: Scripting/Dynamic
status: to-learn
---

# PowerShell

**Definition:** Microsoft’s object-oriented shell and scripting language for Windows automation, now available cross-platform with object-based pipelines.

**Paradigm:** Procedural/scripting, object pipeline | **Typing:** Dynamic, with strong typing support

## Pros
- Pipelines pass .NET objects instead of plain text, which makes structured automation easier.
- Deep integration with Windows, Active Directory, Exchange, and Azure tooling.
- Rich scripting features include functions, modules, remoting, and job control.
- Cross-platform PowerShell 7 extends the model to Linux and macOS.
- Built-in error handling and debugging capabilities that outshine traditional shells.
- Seamless interoperation with .NET libraries (C#), allowing the use of advanced programming paradigms natively.
- Consistent verb-noun naming convention for cmdlets, making discoverability easy.

## Cons
- Cmdlet naming is verbose but consistent, which can feel heavy at first.
- Mindshare is still strongest in Microsoft-centric environments, despite being open source and cross-platform.
- Some third-party scripts and modules assume Windows behavior.
- Object pipelines are powerful, but can feel unfamiliar to text-centric shell users (e.g., Bash or Zsh users).
- Slower startup time compared to simpler text-based shells.
- Memory consumption can be higher due to the underlying .NET runtime and object manipulation.

## Best For
- Windows system administration, automation, and endpoint management.
- Azure cloud automation and hybrid enterprise scripting.
- Building robust CI/CD pipelines in Azure DevOps.
- Cross-platform automation scripts where object structures are preferred over regex parsing.
- Interacting with REST APIs and manipulating JSON/XML data natively.

## Real Examples
- Enterprise IT automation, server provisioning, and maintenance scripts.
- Azure DevOps pipelines and cloud deployment tasks.
- Microsoft Exchange server mailbox management and migration.
- Desired State Configuration (DSC) for infrastructure as code.
- Active Directory bulk user management and policy enforcement.

## Use Cases
- Windows server management, AD operations, and fleet automation.
- Cloud infrastructure tasks, especially in Microsoft environments.
- Automated testing of infrastructure and configuration using Pester.
- Scraping and parsing complex configuration files across different server environments.
- Example:

```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```

## Extended Syntax & Features

### Basic Syntax and Variables
PowerShell uses the `$` prefix for variables. It evaluates variables dynamically, but you can strictly type them to enforce specific data formats and take advantage of .NET types.
```powershell
$stringVar = "Hello World"
$intVar = 42
[int]$typedVar = 100
[string]$strictlyString = "This can only be text"
$arrayVar = @(1, 2, 3, 4)
$hashTable = @{ Name = "John"; Age = 30 }
```

### Control Flow
PowerShell supports standard loops and conditionals similar to C#. It also supports specialized constructs for evaluating conditions across arrays.

```powershell
# If-Else
if ($intVar -gt 50) {
    Write-Host "Greater than 50"
} elseif ($intVar -eq 42) {
    Write-Host "Exactly 42"
} else {
    Write-Host "Less than 50"
}

# Switch statement, capable of handling wildcards and regex
switch -Wildcard ($stringVar) {
    "Hello*" { Write-Host "Greeting detected"; break }
    default { Write-Host "Unknown string" }
}

# Loops
for ($i = 0; $i -lt 5; $i++) {
    Write-Host "Loop $i"
}

foreach ($item in $arrayVar) {
    Write-Host "Item: $item"
}
```

### Functions and Cmdlets
Functions in PowerShell can be simple or advanced. Advanced functions behave exactly like compiled cmdlets, providing access to standard parameters like `-Verbose`, `-WhatIf`, and `-Confirm`.

```powershell
function Get-Greeting {
    param (
        [string]$Name = "World"
    )
    return "Hello, $Name!"
}

# Advanced Function Example
function Get-SystemInfo {
    [CmdletBinding(SupportsShouldProcess=$true)]
    param(
        [Parameter(Mandatory=$true)]
        [string]$ComputerName
    )
    process {
        Write-Verbose "Fetching info for $ComputerName"
        if ($PSCmdlet.ShouldProcess($ComputerName, "Gather System Info")) {
            # Implementation goes here...
        }
    }
}
```

### Object Pipeline
Unlike Bash where pipelines pass strings, PowerShell pipelines pass full .NET objects. This completely eliminates the need for string parsing tools like `grep`, `awk`, or `sed` in most workflows.
```powershell
# Find files larger than 1MB, then select just the name and size, outputting as objects
Get-ChildItem -Path C:\Temp | Where-Object { $_.Length -gt 1MB } | Select-Object Name, Length
```

## Advanced Concepts

### The .NET Framework Integration
Because PowerShell runs on top of the .NET runtime (Core/.NET 5+ for PowerShell 7+), you can instantiate and use any .NET object directly within your scripts. This fundamentally elevates PowerShell from a basic shell to a robust, fully-featured scripting language.

```powershell
# Using the .NET Math class directly for static methods
$result = [Math]::Pow(2, 10)

# Creating a generic list object to hold strings (faster than PowerShell arrays for adding elements)
$list = New-Object 'System.Collections.Generic.List[string]'
$list.Add("Apple")
$list.Add("Banana")
```

### Remoting and WinRM
PowerShell Remoting allows executing commands on one or hundreds of remote systems simultaneously. It works natively over WinRM (Windows Remote Management) on Windows, and over SSH for cross-platform scenarios.

```powershell
# Execute a restart command across two servers concurrently
Invoke-Command -ComputerName Server01, Server02 -ScriptBlock {
    Restart-Service -Name W3SVC
}
```
This paradigm simplifies bulk administration significantly compared to running looping SSH commands, as results are returned as objects that contain the origin computer's name.

### Jobs and Concurrency
PowerShell provides several ways to run tasks asynchronously to improve performance on long-running scripts.
- **Background Jobs:** `Start-Job` creates a separate PowerShell process for isolation (high overhead).
- **ThreadJobs:** Available via module, runs in a separate thread within the same process (faster, lower overhead).
- **Runspaces:** The lowest-level, fastest way to achieve parallel execution by leveraging .NET runspaces directly.

### Desired State Configuration (DSC)
DSC is a management platform in PowerShell that enables deploying and managing configuration data for software services and managing the environment in which these services run. It provides idempotency for configuration management.

```powershell
Configuration WebServer {
    Node "Server01" {
        WindowsFeature IIS {
            Ensure = "Present"
            Name   = "Web-Server"
        }
    }
}
```

### Error Handling
PowerShell uses `try`, `catch`, and `finally` blocks, treating errors as exceptions (similar to C#). It distinguishes between Terminating (halts execution) and Non-Terminating (logs error but continues) errors.

```powershell
try {
    # -ErrorAction Stop forces a non-terminating error to become terminating
    Get-Content -Path "C:\NonExistentFile.txt" -ErrorAction Stop
} catch [System.IO.FileNotFoundException] {
    Write-Warning "File not found specifically! Check the path."
} catch {
    Write-Error "An unexpected error occurred: $_"
} finally {
    Write-Host "Cleanup phase executed regardless of error."
}
```

## Ecosystem & Tooling

### Package Management
- **PowerShell Gallery:** The central, official repository for sharing PowerShell code, modules, and scripts.
- **PowerShellGet:** The module used to discover, install, update and publish PowerShell artifacts from the Gallery.
- **NuGet:** Deeply integrated as the underlying provider for downloading and managing packages.

### Popular Frameworks and Modules
- **Pester:** The ubiquitous testing and mocking framework for PowerShell. Crucial for CI/CD of PowerShell scripts to guarantee reliability.
- **Az (Azure PowerShell):** The official, cross-platform module for managing Azure resources.
- **PSReadLine:** Enhances the console editing experience with syntax coloring, multiline editing, predictive IntelliSense, and history tracking.
- **DBatools:** A massive, highly regarded community module for SQL Server management and migration.
- **PSScriptAnalyzer:** The standard static code checker/linter for PowerShell modules and scripts to enforce best practices.

### Build and CI/CD Tooling
- **Invoke-Build / psake:** Popular task runners and build automation tools written in PowerShell, resembling Make or Rake.
- **Azure DevOps & GitHub Actions:** PowerShell is treated as a first-class citizen in both, often used as the primary scripting glue for custom pipeline steps.

### Editors
- **Visual Studio Code (VS Code):** The defacto standard editor for PowerShell development, backed by the official PowerShell extension which provides rich IntelliSense, debugging, and linting.
- **PowerShell ISE:** The legacy built-in editor on Windows. Deprecated in favor of VS Code but still widely used by sysadmins for quick local edits.

## Code Examples

### 1. Hello World and Basic File I/O
This example demonstrates reading text from a file, appending some content, and writing it out.

```powershell
<#
.SYNOPSIS
    A simple script to demonstrate basic file I/O operations.
#>

$sourceFile = ".\input.txt"
$destFile = ".\output.txt"

# Create a sample file using pipeline output
"Hello World from PowerShell!" | Out-File -FilePath $sourceFile

# Read the file content into a variable
$content = Get-Content -Path $sourceFile

# Append to the string and save to a new file
$newContent = $content + " And goodbye."
$newContent | Out-File -FilePath $destFile

Write-Host "Operations completed. Output:" -ForegroundColor Green
Get-Content -Path $destFile
```

### 2. Working with Arrays and HashTables
Data structures are vital for data manipulation. Arrays and HashTables are the most commonly used collections.

```powershell
# Defining a simple array of strings
$servers = @("web01", "web02", "db01", "db02")

# Defining a HashTable (Dictionary) for key-value pair mapping
$serverRoles = @{
    "web01" = "Frontend"
    "web02" = "Frontend"
    "db01"  = "Database"
    "db02"  = "Database"
}

# Iterating over the array sequentially
foreach ($server in $servers) {
    # Looking up the role in the HashTable using the server name as the key
    $role = $serverRoles[$server]
    Write-Host "Server $server is a $role server." -ForegroundColor Cyan
}

# Adding a new element to the existing HashTable
$serverRoles.Add("cache01", "Redis")
```

### 3. REST API Interaction and JSON Parsing
PowerShell excels at interacting with web services. It automatically handles the conversion between JSON payloads and custom PowerShell objects.

```powershell
<#
.SYNOPSIS
    Fetches data from a public REST API and processes the JSON response natively.
#>

$apiUrl = "https://jsonplaceholder.typicode.com/users"

try {
    # Invoke-RestMethod automatically parses the JSON response into PowerShell objects
    $users = Invoke-RestMethod -Uri $apiUrl -Method Get -ErrorAction Stop

    # We can now filter and select properties exactly as if it was a local object array
    $filteredUsers = $users | Where-Object { $_.email -like "*@biz" } | Select-Object name, email, company

    foreach ($user in $filteredUsers) {
        Write-Host "User: $($user.name) works at $($user.company.name)"
    }
} catch {
    Write-Error "Failed to fetch data from API. Exception: $_"
}
```

### 4. Advanced Function with Validation
Creating a robust, reusable function simulating a compiled cmdlet. This shows off parameters, validation attributes, and PSCustomObject output.

```powershell
function Get-LocalDiskSpace {
    <#
    .SYNOPSIS
        Retrieves the free space of local disks.
    .DESCRIPTION
        This advanced function queries CIM to find local disks and reports their free space in Gigabytes.
    .EXAMPLE
        Get-LocalDiskSpace -DriveLetter C
    #>
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $false, ValueFromPipeline = $true)]
        [ValidatePattern("^[A-Z]$")]
        [string]$DriveLetter = "*"
    )

    begin {
        Write-Verbose "Starting disk space check..."
    }
    process {
        # Construct the WMI/CIM filter dynamically
        $filter = "DriveType=3" # 3 = Local Disk
        if ($DriveLetter -ne "*") {
            $filter += " AND DeviceID='$DriveLetter:'"
        }

        # Fetch data using CIM (modern WMI replacement)
        $disks = Get-CimInstance -ClassName Win32_LogicalDisk -Filter $filter

        foreach ($disk in $disks) {
            # Create a clean, formatted custom object for the output
            [PSCustomObject]@{
                Drive        = $disk.DeviceID
                VolumeName   = $disk.VolumeName
                TotalSizeGB  = [math]::Round($disk.Size / 1GB, 2)
                FreeSpaceGB  = [math]::Round($disk.FreeSpace / 1GB, 2)
                PercentFree  = [math]::Round(($disk.FreeSpace / $disk.Size) * 100, 2)
            }
        }
    }
    end {
        Write-Verbose "Disk space check completed."
    }
}

# Example Usage: Pipe directly to Format-Table for readable terminal output
Get-LocalDiskSpace | Format-Table -AutoSize
```

### 5. Asynchronous Operations (ThreadJobs)
A demonstration of running background tasks for faster execution across multiple targets.

```powershell
# Requires ThreadJob module (included in PowerShell 7, installable in WinPS 5.1)
# Install-Module -Name ThreadJob -Scope CurrentUser

# Create an array of IPs to ping
$serversToPing = 1..20 | ForEach-Object { "192.168.1.$_" }
$jobs = @()

foreach ($server in $serversToPing) {
    # Start a lightweight thread job for each ping operation
    $jobs += Start-ThreadJob -ScriptBlock {
        param($ip)
        $result = Test-Connection -ComputerName $ip -Count 1 -Quiet
        [PSCustomObject]@{
            IPAddress = $ip
            IsUp      = $result
        }
    } -ArgumentList $server
}

# Wait for all background jobs to complete execution
Wait-Job -Job $jobs | Out-Null

# Receive the output payload from the completed jobs
$results = Receive-Job -Job $jobs

# Display active servers
$results | Where-Object IsUp -eq $true | Format-Table
```

## Best Practices

### Use Approved Verbs
Always use the approved verb list (e.g., `Get`, `Set`, `New`, `Remove`) for functions and scripts. You can find these by running the `Get-Verb` cmdlet. This maintains consistency across the ecosystem and helps users predict what a command does.

### Output Objects, Not Strings
Functions should output objects (using `[PSCustomObject]`), not text formatted with `Write-Host`. This allows downstream commands in the pipeline to filter, sort, or export the data naturally. Use `Write-Host` only for user-facing console messages that shouldn't be captured in variables.

### Implement Error Handling
Avoid wrapping entire scripts in giant `Try/Catch` blocks unless necessary. Handle specific exceptions where they occur, and use `$ErrorActionPreference` or `-ErrorAction Stop` to turn non-terminating errors (which just print red text) into catchable terminating errors.

### Use Parameter Validation
Leverage attributes like `[ValidateSet()]`, `[ValidatePattern()]`, and `[ValidateNotNullOrEmpty()]` in your function parameters. This prevents invalid data from entering your function logic and provides automatic tab-completion in the console for users.

### Write Comment-Based Help
Always include comment-based help blocks (`<# .SYNOPSIS ... #>`) at the beginning of your functions or scripts. This integrates directly with the native `Get-Help` cmdlet and makes your code self-documenting.

### Avoid Aliases in Scripts
While aliases (like `?` for `Where-Object` or `%` for `ForEach-Object`) are great for interactive, rapid use on the command line, they make scripts much harder to read and maintain. Always use the full cmdlet names in saved scripts and modules.

### Profile Your Code
Use the `Measure-Command` cmdlet to profile performance bottlenecks. When dealing with massive arrays (e.g., thousands of items), using generic lists (`List[T]`) or standard `foreach` loops can be significantly faster than the pipeline `ForEach-Object` cmdlet, which incurs pipeline overhead.
