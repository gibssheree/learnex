---
tags: [term, swe, oop]
category: Design Principles & Patterns
subcategory: Design Principles
---

# SOLID Principles

**Definition:** Five object-oriented design principles intended to make software designs more understandable, flexible, and maintainable.

## How It Works
- Single Responsibility (SRP): a class should have one, and only one, reason to change
- Open/Closed (OCP): software entities should be open for extension, but closed for modification
- Liskov Substitution (LSP): subtypes must be substitutable for their base types without breaking code correctness
- Interface Segregation (ISP): client should not be forced to depend upon interfaces it does not use
- Dependency Inversion (DIP): depend upon abstractions (interfaces), not concrete implementations

## Why It Matters
- Prevents fragile codebases, simplifies unit testing, and enables easy software refactoring

## Common Pitfalls
- Dogmatic over-engineering: splitting code into dozens of single-method interfaces and tiny classes prematurely

## Related Terms
- [[Design Patterns Overview]]
- [[Code Refactoring and Technical Debt]]

## Example
Dependency Inversion: Injecting a `PaymentProcessor` interface into a `CheckoutService` instead of hardcoding `StripeProcessor` directly.
