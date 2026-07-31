---
tags: [term, swe, quality]
category: Maintainability & Delivery
subcategory: Code Maintainability
---

# Code Refactoring and Technical Debt

**Definition:** Technical Debt represents the implied cost of additional rework caused by choosing an easy short-term solution over a better long-term design; Refactoring is restructuring existing code without altering external behavior.

## How It Works
- Refactoring Techniques: Extract Method, Rename Variable, Replace Conditional with Polymorphism
- Code Smells: indicators of underlying design problems (Long Method, God Object, Feature Envy, Duplicate Code)
- Prerequisites: safe refactoring strictly requires comprehensive unit test coverage

## Why It Matters
- Prevents software entropy and keeps feature velocity high over years of codebase growth

## Common Pitfalls
- Refactoring code without existing automated tests, introducing accidental regression bugs

## Related Terms
- [[SOLID Principles]]
- [[Test Pyramid and TDD]]

## Example
Extracting a 300-line database query script into 3 modular repository functions.
