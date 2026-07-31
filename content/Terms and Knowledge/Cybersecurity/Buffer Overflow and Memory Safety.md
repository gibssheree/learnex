---
tags: [term, security, vulnerabilities]
category: Application Security & Vulnerabilities
subcategory: Application Security
---

# Buffer Overflow and Memory Safety

**Definition:** A memory corruption vulnerability occurring when a program writes data beyond allocated buffer boundaries, corrupting adjacent memory (Stack/Heap).

## How It Works
- Stack Smashing: overwriting function return address on the execution call stack to jump to malicious shellcode
- Mitigations: Address Space Layout Randomization (ASLR), Data Execution Prevention (DEP / NX bit), Stack Canaries
- Memory-safe languages (Rust, Go, Java) eliminate buffer overflows at compile time or via runtime boundary checks

## Why It Matters
- Historically accounts for the majority of severe remote code execution (RCE) zero-day vulnerabilities

## Common Pitfalls
- Using unsafe C string functions (`strcpy`, `gets`, `sprintf`) without bounded memory length checks (`strncpy`, `snprintf`)

## Related Terms
- [[OWASP Top 10 Security Risks]]

## Example
Heartbleed vulnerability in OpenSSL was a buffer over-read leak caused by missing array bounds checking in C.
