---
tags: [platform, testing, e2e]
category: E2E & Browser Testing
---

# Selenium

**Definition:** The original and longest-standing browser automation framework, controlling real browsers remotely via the WebDriver protocol it helped establish as a standard.

## Core Services & Concepts
- **WebDriver protocol** — the standardized way to remotely control a browser, which Selenium pioneered and other tools still interoperate with
- **Grid** — runs tests across many browsers and machines in parallel at scale
- **Broad language support** — official bindings for Java, Python, C#, JavaScript, Ruby, and more

## Pros
- Supports more browsers, browser versions, and languages than any newer alternative
- Massive, mature ecosystem and decades of accumulated documentation/solutions
- Selenium Grid scales well for large parallel test suites

## Cons
- More prone to flaky tests than Cypress or Playwright without careful explicit waits
- More boilerplate and setup required compared to newer, more opinionated tools

## Best For
- Legacy systems or environments needing broad browser/language support beyond what Cypress or Playwright cover

## Real Examples
- Still the backbone of QA automation at many large, established enterprises

## Use Cases
- Cross-browser legacy application testing
- Large-scale parallel test execution via Selenium Grid
