---
tags: [platform, saas, communication]
category: Communication
---

# Microsoft Teams

**Definition:** Microsoft's business communication platform, bundled tightly with Microsoft 365 and often the default choice for organizations already on Microsoft's ecosystem, combining chat, video meetings, and document collaboration in one app.

## Core Services & Concepts
- **Entra ID (Azure AD) login** — [[Microsoft Azure]], Teams identity is tied directly to the same identity system Azure enterprise customers already use, so conditional access and compliance policies apply automatically
- **REST API (Graph API)** — [[REST API]], the Microsoft Graph API is shared across Teams, Outlook, and SharePoint, so a single integration can touch chat, calendar, and files with one auth model
- **Files backed by SharePoint** — every Teams channel's "Files" tab is actually a SharePoint document library under the hood, giving Teams the same permissioning and versioning as SharePoint
- **Teams apps & Power Platform** — first-party integration with Power Automate and Power Apps lets non-developers build workflow bots and forms directly inside Teams

## Pros
- Deep integration with Microsoft 365 (Outlook, SharePoint, Office apps), documents can be co-edited live inside a chat or channel
- Often already included in enterprise licensing (E3/E5 bundles) at no extra incremental cost
- Enterprise-grade compliance and identity controls inherited directly from Entra ID and Microsoft Purview

## Cons
- Historically criticized for being slower and clunkier than Slack, though performance has improved significantly in newer client versions
- Integration ecosystem outside Microsoft's own products is smaller than Slack's third-party app directory
- Channel/Team sprawl and permission complexity (inherited from SharePoint) can confuse users migrating from simpler chat tools

## Best For
- Organizations already standardized on Microsoft 365 and Windows environments wanting one bundled communication and collaboration suite

## Real Examples
- The default communication tool at most large enterprises already using Microsoft 365

## Use Cases
- Enterprise team chat
- Video meetings
- Office document collaboration
