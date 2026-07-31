---
tags: [platform, saas, project-management]
category: Project Management & Collaboration
---

# Linear

**Definition:** A modern, fast issue-tracking tool built specifically for software teams, positioned as a simpler, opinionated alternative to Jira with a local-first, keyboard-driven interface.

## Core Services & Concepts
- **GraphQL API** — [[GraphQL]], Linear's API is GraphQL-based rather than REST, and the app itself is built as a local-first client that syncs in the background for near-instant UI response
- **Git integration** — [[CI-CD|CI/CD]], automatically links branches and pull requests to issues by parsing branch names (e.g. `username/eng-123-fix-login`) and updates issue status on PR merge
- **Webhooks** — [[Webhook]], for pushing issue and comment events into Slack or custom systems
- **Cycles** — Linear's opinionated take on sprints, fixed time-boxed periods with automatic issue rollover, rather than Jira's fully configurable sprint model
- **Triage** — a dedicated inbox-style view for incoming bug reports and requests before they're accepted into a cycle

## Pros
- Extremely fast, keyboard-driven interface (command palette, single-key shortcuts) built for engineers who live in the tool all day
- Opinionated simplicity avoids Jira's configuration sprawl, most teams need almost no setup to start using it well
- Clean roadmap and initiative views that scale from a single team to a multi-team org without feeling like enterprise software

## Cons
- Less configurable than Jira for teams with unusual workflows, custom workflow states and fields are more limited by design
- Smaller plugin/marketplace ecosystem than Jira's Atlassian Marketplace
- Weaker fit for non-engineering teams (marketing, ops) compared to more general tools like Asana

## Best For
- Fast-moving startups and product teams who find Jira too heavy and want an issue tracker built specifically around software development

## Real Examples
- Used by many modern SaaS startups, including Vercel, Ramp, and Cursor, as their primary engineering issue tracker

## Use Cases
- Startup engineering issue tracking
- Product roadmap planning
- Bug triage inboxes feeding directly into sprint cycles
