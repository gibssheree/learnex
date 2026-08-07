---
tags: [term, fullstack, architecture, backend]
category: Architecture & Backend
---

# MVC (Model-View-Controller)

**Definition:** A pattern that splits an app into data (Model), UI (View), and the logic connecting them (Controller).

## How It Works
- Controller receives input and updates the Model
- Model changes are reflected in the View
- The Model owns data and business rules — it doesn't know the Controller or View exist
- The View is a (mostly) passive representation of the Model's state — templates, HTML, or a rendered UI tree
- The Controller is the traffic cop: it interprets input (an HTTP request, a click), calls Model methods, and picks which View to render
- In classic desktop-GUI MVC, the View observes the Model directly (observer pattern) and re-renders on change; in most web frameworks the flow is simpler and request-scoped: Controller pulls fresh data from the Model each request and hands it to the View
- Routing typically maps a URL + HTTP verb to a specific Controller action (`GET /users/5` → `UsersController#show`)

## Why It Matters
- One of the oldest and most common ways to organize backend web frameworks: Rails, Django, Laravel, ASP.NET
- Enforces separation of concerns: presentation logic, application/business logic, and data access don't get tangled in one file
- Makes it possible to swap the View layer (HTML template vs JSON API response) without touching the Model
- Gives teams a shared vocabulary and predictable file layout — a new engineer can guess where `Order` logic lives
- Testability improves because Models (pure data/business logic) can be unit-tested without spinning up HTTP or rendering a page

## History
- Introduced by Trygve Reenskaug at Xerox PARC in 1978 for Smalltalk-80 desktop GUIs, decades before the web existed
- Adapted for the web by frameworks like Struts (Java, 2000) and later popularized for a mainstream audience by Ruby on Rails (2004), which made "convention over configuration" MVC the default for a generation of web frameworks
- Web MVC diverges from the original desktop pattern: there's no long-lived View object listening for Model change events — each request is a fresh Controller → Model → View cycle, closer to what some call "MVC light" or "Model 2" (from the older JSP/Servlet world)

## Common Pitfalls
- Letting Controllers grow into dumping grounds for business logic instead of delegating to separate service or model layers, the "fat controller" anti-pattern
- The inverse anti-pattern, "fat model," where the Model becomes a 2,000-line class doing validation, business rules, external API calls, and serialization all at once
- Putting business logic in the View (e.g., complex conditionals or calculations in an ERB/Jinja template) instead of computing it in the Controller or Model and passing a plain value down
- Confusing MVC's "Model" with an ORM row/table class — a Model should represent a domain concept and its rules, not just be a thin wrapper over a database row
- Skipping a service/interactor layer entirely, so any workflow spanning multiple Models (e.g., "place order" touching `Order`, `Inventory`, `Payment`) ends up awkwardly stuffed into one Controller action
- Tight coupling between Controller and a specific View technology, making it hard to add a JSON API alongside server-rendered HTML later

## Variants
- **MVP (Model-View-Presenter)** — the Presenter takes over all View logic and the View becomes fully passive (no direct Model access), common in older Android and WinForms apps
- **MVVM (Model-View-ViewModel)** — the ViewModel exposes observable state that the View binds to declaratively; the dominant pattern in React (with hooks-as-ViewModel), Vue, Angular, and WPF
- **Flux/Redux** — a reaction to MVC's "any Controller can mutate any Model" problem in large single-page apps: enforces one-directional data flow (`action → reducer → store → view`) to make state changes traceable
- **Hexagonal / Clean Architecture** — a more modern layering (entities, use cases, adapters) sometimes used instead of or on top of MVC in larger backend systems, more strictly enforcing that business logic doesn't depend on frameworks or the database

## Comparison

| Pattern | Who owns UI state | Typical use |
|---|---|---|
| MVC | View re-reads Model each request/render | Server-rendered web apps (Rails, Django, Laravel) |
| MVVM | ViewModel exposes bindable state | Client-side frameworks (React, Vue, Angular) |
| Flux/Redux | Central store, one-way data flow | Large SPAs with complex shared state |

## Best Practices
- Keep Controller actions short: parse input, call one service/model method, pick a response — a handful of lines
- Push validation and business rules into the Model or a dedicated service object, not the Controller
- Keep templates/Views free of database queries or business calculations — pass pre-computed values in
- Design Controllers to be interchangeable per output format: the same underlying service call should be reusable whether the Controller renders HTML or serializes JSON for an API
- Write unit tests against Models and services directly (fast, no HTTP layer) and reserve slower request/integration tests for Controller behavior

## FAQ
**Is MVC still relevant for APIs with no HTML views?** Yes — the "View" for a JSON API is just the serializer/response formatter; the separation of concerns still applies.

**Is React MVC?** Not really — React components blend View and (via hooks/state) ViewModel-like responsibilities; it's closer to MVVM, and "Model" (global state) is usually a separate library like Redux or Zustand.

**Where do database migrations fit in MVC?** They're not really part of the pattern — migrations are schema management, orthogonal to how Models expose behavior once the schema exists.

## Framework Implementations
MVC isn't a single spec — every framework bends it slightly:

| Framework | Model | Controller | View |
|---|---|---|---|
| Ruby on Rails | ActiveRecord classes | `ApplicationController` subclasses | ERB/Haml templates |
| Django | `models.Model` subclasses | "Views" (confusingly — functions/classes that act as Controllers) | Django templates (`.html` with template tags) |
| Laravel | Eloquent models | Controller classes in `app/Http/Controllers` | Blade templates |
| ASP.NET Core MVC | POCO classes / EF entities | Controller classes with action methods | Razor views (`.cshtml`) |
| Spring MVC (Java) | POJOs / JPA entities | `@Controller` annotated classes | JSP/Thymeleaf templates |

Django is the classic gotcha here: what Django calls a "View" (a function that takes a request and returns a response) is architecturally a Controller in MVC terms; Django's templates are the actual View. Django's own docs call this "MTV" (Model-Template-View) to sidestep the naming clash, but it maps directly onto MVC once you know the substitution.

## Testing Around MVC
- **Model tests**: pure unit tests, no HTTP server needed — instantiate the object, call methods, assert on state or return values; these should be the fastest and most numerous tests in the suite
- **Controller/request tests**: spin up (or simulate) an HTTP request through the router and assert on status code, response body, and side effects — slower than Model tests since they exercise the routing and middleware stack too
- **View/template tests**: often skipped in favor of end-to-end tests, since asserting on rendered HTML structure is brittle; snapshot testing or targeted assertions ("does the page contain the user's name") are more common than full-markup comparisons
- A healthy MVC test suite is bottom-heavy: many fast Model tests, fewer Controller tests, and a handful of end-to-end tests covering critical user flows

## More FAQ
**Why do some frameworks call the Controller layer "Views" (Django) or "Handlers" (Go)?** Naming drifted as frameworks evolved independently; the underlying three-way split (data, request-handling logic, presentation) is consistent even when the vocabulary isn't.

**Does MVC preclude a service/business-logic layer?** No — classic MVC only names three components, but almost every real system adds a fourth informal layer (services, interactors, use cases) between Controllers and Models once business logic outgrows either.

**Is MVC compatible with microservices?** Yes, at a different scale — a single [[Microservices vs Monolith|microservice]] often implements MVC internally for its own HTTP layer, independent of how many other services exist around it.

## When MVC Starts to Strain
- Large single-page apps outgrow classic MVC's request-scoped cycle because there's no "request" — state changes happen continuously from user interaction, which is why client-side frameworks lean toward MVVM or Flux/Redux instead
- APIs with no server-rendered View at all (pure JSON backends) keep the Model and Controller but the "View" shrinks to a thin serialization step — some teams drop the MVC label entirely in favor of "Controller-Service-Repository"
- Complex domains with many cross-cutting workflows tend to outgrow "Controller calls Model" and reach for an explicit service/use-case layer, or a more prescriptive layering like Clean Architecture, once a handful of Controllers all need to orchestrate the same multi-step business process

## Common Interview Questions
**"Explain MVC to someone who's never heard of it."** A good answer names the three roles concretely and gives an example request flow: a browser hits a URL, the router picks a Controller action, the Controller asks a Model for data, and the Controller hands that data to a View to render — emphasizing that each piece has exactly one job.

**"What breaks first as an MVC app grows, and how do you fix it?"** Controllers, typically — they accumulate business logic because it's the easiest place to add "just one more thing" during a rushed feature. The fix is extracting that logic into service/interactor objects the Controller merely calls, keeping the Controller itself a thin coordinator.

**"How would you unit test a Controller without hitting a real database?"** Inject or stub the Model/service layer (dependency injection, mocking the data-access call) so the test exercises routing, parameter handling, and response shaping without needing a live database connection — see [[Dependency Injection]].

## Related Terms
- [[Middleware]]
- [[Dependency Injection]]
- [[REST API]]
- [[ORM]]
- [[State Management]]

## Example
In Rails, `UsersController#show` (controller) fetches a `User` (model) and renders `show.html.erb` (view):

```ruby
class UsersController < ApplicationController
  def show
    @user = User.find(params[:id])   # Model: data + validations live here
  end
  # implicitly renders app/views/users/show.html.erb (View)
end
```

The same Controller action could instead respond with JSON for an API consumer, reusing the same Model lookup:

```ruby
class Api::UsersController < ApplicationController
  def show
    user = User.find(params[:id])
    render json: UserSerializer.new(user)   # different View, same Model
  end
end
```

The same shape in Django, where the "View" function plays the Controller role and a template plays the View:

```python
# models.py -- Model
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()

# views.py -- Controller (Django calls it a "view", MVC calls it a controller)
def user_detail(request, user_id):
    user = User.objects.get(id=user_id)
    return render(request, "users/detail.html", {"user": user})

# urls.py -- routes a URL to the controller function
urlpatterns = [path("users/<int:user_id>/", user_detail)]
```
```html
<!-- users/detail.html -- View -->
<h1>{{ user.name }}</h1>
<p>{{ user.email }}</p>
```
