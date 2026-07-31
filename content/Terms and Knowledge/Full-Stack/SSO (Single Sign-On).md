---
tags: [term, fullstack, auth, security]
category: Authentication & Security
---

# SSO (Single Sign-On)

**Definition:** Logging in once and getting access to multiple separate apps or services without logging in again.

## How It Works
- A central identity provider (Okta, Azure AD, Google Workspace) authenticates the user once
- It issues a token that other connected apps trust

## Why It Matters
- Standard in companies so employees don't juggle a dozen separate passwords across internal tools

## Common Pitfalls
- If the identity provider goes down, every connected app becomes inaccessible — a single point of failure

## Related Terms
- [[OAuth 2.0]]
- [[JWT (JSON Web Token)]]

## Example
Logging into Slack once, and it also signs you into your company's other internal tools automatically.
