---
tags: [platform, testing, e2e]
category: E2E & Browser Testing
---

# Cypress

**Definition:** An end-to-end testing tool that runs tests directly inside the browser alongside the application, known for fast feedback and time-travel debugging.

## Core Services & Concepts
- **Runs in-browser** — unlike Selenium's remote-control model, Cypress executes inside the same run-loop as the app, giving it deep visibility into what's happening
- **Time-travel debugging** — every test step is snapshotted, letting you hover back through exactly what the app looked like at each point
- **Automatic waiting** — retries assertions automatically instead of requiring manual sleep/wait calls

## Pros
- Excellent developer experience with visual, interactive test runner
- Automatic waiting eliminates a huge class of flaky test problems common in Selenium
- Fast feedback loop during test writing

## Cons
- Historically limited to a single browser tab and origin per test (improving, but still a real constraint)
- No native multi-tab or multi-browser-type support in the same way Playwright offers

## Best For
- Frontend teams wanting fast, reliable end-to-end tests with a great debugging experience

## Real Examples
- Widely adopted by frontend-heavy startups as a Selenium replacement

## Use Cases
- End-to-end testing of web application user flows
- Component testing for frontend frameworks
