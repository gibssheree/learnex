---
tags: [platform, saas, project-management]
category: Project Management & Collaboration
---

# Jira

**Definition:** Atlassian's issue and project tracking tool, the de facto standard for agile software development teams, built around configurable workflows, issue types, and permission schemes per project.

## Core Services & Concepts
- **REST API** — [[REST API]], plus JQL (Jira Query Language) for building complex saved filters and dashboards across issues
- **Git integration** — [[CI-CD|CI/CD]], links commits, branches, and pull requests directly to issues via smart commits or the Bitbucket/GitHub integration, and can show build/deploy status on the issue itself
- **Agile boards** — Scrum and Kanban boards built around sprints, backlogs, story points, and burndown/velocity charts
- **Workflow schemes** — custom state machines per issue type and project (e.g. To Do → In Review → QA → Done) with configurable transition rules and required fields
- **Jira Service Management** — a separate ITSM-flavored product built on the same core, used for IT and ops ticketing with SLAs

## Pros
- Deep customization for agile workflows: custom fields, workflow states, and permission schemes per project or team
- Tight integration with the rest of Atlassian's suite (Confluence for docs, Bitbucket/Compass for code and services)
- Industry standard, so most engineers and engineering managers already know it, easing hiring and onboarding
- Strong reporting: velocity, cumulative flow, and burndown charts come built in without extra tooling

## Cons
- Can become slow and bloated with heavy customization; orgs with years of accumulated workflow schemes report sluggish page loads
- Notorious for over-complicating simple workflows, small teams often end up managing more Jira configuration than actual work
- Admin permissions and workflow changes can require dedicated Jira administrators at larger organizations

## Best For
- Software engineering teams running formal agile processes (Scrum/Kanban) that need audit trails, reporting, and cross-team visibility

## Real Examples
- Used by the majority of enterprise software engineering teams; commonly paired with Confluence for specs and Bitbucket or GitHub for source control

## Use Cases
- Sprint planning
- Bug tracking
- Engineering workflow management
- Cross-team IT service requests via Jira Service Management
