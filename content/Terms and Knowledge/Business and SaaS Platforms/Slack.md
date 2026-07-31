---
tags: [platform, saas, communication]
category: Communication
---

# Slack

**Definition:** The dominant business messaging platform, organized around channels rather than individual chats, and one of the most integration-friendly tools in business software, now owned by Salesforce.

## Core Services & Concepts
- **Incoming Webhooks** — [[Webhook]], one of the most iconic and widely copied webhook implementations in software: POST a JSON payload to a unique URL and it appears as a message in a channel
- **OAuth 2.0 (Slack Apps)** — [[OAuth 2.0]], scoped bot and user tokens control exactly which APIs (messages, files, channels) an installed app can access
- **Socket Mode / RTM API** — [[WebSocket]], real-time message delivery for apps that can't expose a public HTTPS endpoint for the older Events API
- **Slash commands & Block Kit** — custom `/command` triggers plus a structured JSON layout language (Block Kit) for building interactive messages with buttons, menus, and forms directly inside Slack
- **Workflow Builder** — no-code internal automations (form submission → post to channel → notify a person) built without needing a bot or external server

## Pros
- Extremely rich integration ecosystem, thousands of apps in the Slack App Directory plus a mature bot/webhook API for custom tooling
- Channel-based organization scales well for large teams when channel naming and archiving conventions are enforced
- Became the default expectation for business chat, especially at tech companies

## Cons
- Notification overload and channel sprawl are common complaints without active workspace governance
- Pricing scales with active users, and message history is capped or purged on lower tiers, a common surprise for smaller teams
- Huge integration surface area means a single overly broad OAuth-scoped app can become a real security exposure if compromised

## Best For
- Team communication for companies of any size, especially ones relying on many third-party integrations and bots

## Real Examples
- Used as the primary communication tool at most modern tech companies

## Use Cases
- Team chat
- Bot and integration notifications, like CI/CD or monitoring alerts
- Cross-team coordination
