---
tags: [moc, platform, testing]
---

# Testing Tools and Frameworks MOC

8 concrete tools across 3 categories, same comparison template as [[Cloud Platforms Terms MOC|Cloud Platforms]]. Where [[Software Engineering Practices Terms MOC|Software Engineering Practices]] covers testing *strategy* (TDD, the test pyramid), this folder covers what you'd actually install and run.

## Unit Testing Frameworks
- [[Jest]]
- [[PyTest]]
- [[JUnit]]

## E2E & Browser Testing
- [[Cypress]]
- [[Playwright]]
- [[Selenium]]

## API & Load Testing
- [[Postman]]
- [[k6]]

---

## How to use this
Pick by language and layer, not brand recognition: [[PyTest]] or [[Jest]] for unit tests depending on your stack, [[Playwright]] or [[Cypress]] for anything a real user would click through, [[Postman]] for exploring an API by hand, [[k6]] once correctness is solved and you need to know if it survives real traffic.

## Suggested order if starting from zero
1. **Jest** or **PyTest** — matching whichever language you already know (see [[Full-Stack Terms MOC|Full-Stack]])
2. **Postman** — the fastest way to actually understand an API you didn't build
3. **Playwright** — modern default for end-to-end testing, learn this before Selenium
4. **k6** — once you have something worth load-testing
5. **JUnit, Cypress, Selenium** — as the specific stack or legacy codebase requires
