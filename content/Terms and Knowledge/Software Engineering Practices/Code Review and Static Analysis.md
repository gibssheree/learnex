---
tags: [term, swe, quality]
category: Testing & Quality
subcategory: Code Maintainability
---

# Code Review and Static Analysis

**Definition:** Code Review is peer inspection of proposed pull requests; Static Analysis uses automated tools (Linters/SAST) to detect bugs and security flaws without executing code.

## How It Works
- Static Analysis: parses source code AST to flag unused variables, type mismatches, formatting errors, and OWASP flaws (ESLint, SonarQube)
- Code Review: human evaluation of domain logic correctness, readability, architecture alignment, and test coverage

## Why It Matters
- Ensures consistent codebase standards, shares domain knowledge across engineers, and catches bugs early

## Common Pitfalls
- Bickering over code formatting in human reviews instead of enforcing automated linters (Prettier/Black)

## Related Terms
- [[CI-CD Best Practices]]
- [[SOLID Principles]]

## Example
ESLint flagging missing `await` statements automatically before a PR is assigned to a team member.
