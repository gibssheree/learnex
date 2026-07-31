---
tags: [term, swe, testing]
category: Testing & Quality
subcategory: Testing Strategy
---

# Test Pyramid and TDD

**Definition:** The Test Pyramid is an architectural strategy recommending a broad base of fast isolated Unit Tests, fewer Integration Tests, and minimal slow End-to-End (E2E) Tests; Test-Driven Development (TDD) is a workflow writing tests before code.

## How It Works
- Unit Tests: fast, isolated tests mocking external network/DB dependencies (70-80% of test suite)
- Integration Tests: verifies communication between components/databases (15-20% of test suite)
- End-to-End (E2E) Tests: verifies complete user flows via browser/API (5-10% of test suite)
- TDD Red-Green-Refactor Loop: 1) Write failing test (Red) -> 2) Write minimal code to pass (Green) -> 3) Refactor code cleanliness

## Why It Matters
- Provides instant feedback loops, prevents regressions, and enables confident automated deployments

## Common Pitfalls
- Inverted Pyramid (Ice Cream Cone Anti-Pattern): heavy reliance on slow, flaky UI E2E tests with zero unit tests

## Related Terms
- [[SOLID Principles]]
- [[CI-CD Best Practices]]

## Example
Jest/PyTest unit tests run in 2 seconds; Playwright E2E browser tests run in 3 minutes.
