---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# MVC (Model-View-Controller)

**Definition:** A pattern that splits an app into data (Model), UI (View), and the logic connecting them (Controller).

## How It Works
- Controller receives input and updates the Model
- Model changes are reflected in the View

## Why It Matters
- One of the oldest and most common ways to organize backend web frameworks: Rails, Django, Laravel, ASP.NET

## Common Pitfalls
- Letting Controllers grow into dumping grounds for business logic instead of delegating to separate service or model layers, the "fat controller" anti-pattern

## Related Terms
- [[Middleware]]
- [[Dependency Injection]]

## Example
In Rails, `UsersController#show` (controller) fetches a `User` (model) and renders `show.html.erb` (view).
