---
tags: [platform, testing, e2e]
category: E2E & Browser Testing
---

# Playwright

**Definition:** Microsoft's end-to-end browser testing framework, built to test across Chromium, Firefox, and WebKit with a single API.

## Core Services & Concepts
- **Multi-browser, multi-tab support** — tests real cross-browser behavior in one framework, an area where Cypress historically lagged
- **Auto-waiting** — similar to Cypress, retries assertions automatically instead of needing manual waits
- **Codegen** — can record your manual clicks in a browser and generate test code automatically

## Pros
- True cross-browser testing (Chromium, Firefox, WebKit) from one tool
- Handles multi-tab, multi-origin scenarios that were historically hard in Cypress
- Fast and reliable, backed by active Microsoft development

## Cons
- Slightly steeper learning curve than Cypress's more opinionated, guided setup
- Younger ecosystem and smaller plugin library than Selenium's decades of tooling

## Best For
- Teams needing genuine cross-browser end-to-end test coverage, not just Chromium

## Real Examples
- Increasingly the default choice for new projects choosing between Cypress, Selenium, and Playwright

## Use Cases
- Cross-browser end-to-end testing
- Visual regression testing
- Testing multi-tab or multi-origin user flows
