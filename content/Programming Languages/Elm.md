---
tags: [programming-language, functional, frontend, web]
category: Functional
status: to-learn
---

# Elm

**Definition:** Pure functional language that compiles to JavaScript and is designed for reliable web frontends with a tightly controlled architecture.

**Paradigm:** Pure functional | **Typing:** Static, strong

## Pros
- The compiler eliminates many runtime errors by making invalid states unrepresentable.
- Error messages are unusually explicit and are a major part of the developer experience.
- The architecture encourages clear separation of model, update, and view logic.
- Elm’s purity and immutability make front-end state changes easier to reason about.
- The runtime output is small and predictable because the language surface is intentionally constrained.

## Cons
- The ecosystem is smaller than React/Vue/Svelte/TypeScript stacks.
- JavaScript interop is intentionally limited, which makes some browser APIs harder to reach.
- The language’s constraints can feel restrictive for teams that want freedom over convention.
- The community and hiring pool are small.

## Best For
- Web frontends where correctness and maintainability matter more than broad package choice.
- Teams willing to trade flexibility for stricter compile-time guarantees.

## Real Examples
- NoRedInk is the most commonly cited Elm production example.
- Some fintech and internal dashboard teams have used Elm for reliability-focused UI layers.

## Use Cases
- Internal admin dashboards with lots of form state and validation.
- Reliability-focused frontend apps where a narrow architecture is acceptable.
- Example:

```elm
type alias Model =
	{ count : Int }
```

## Extended Syntax & Features

Elm's syntax is heavily inspired by ML, Haskell, and F#. It is minimalistic, preferring a small set of orthogonal features over a massive language specification. There are no loops or mutation; everything is functional.

### Primitives and Basic Data Types
Elm provides a small set of primitives:
- `String`: Double-quoted strings (`"Hello"`). Elm does not have string interpolation, relying on `++` for concatenation.
- `Char`: Single-quoted characters (`'A'`).
- `Int`: Arbitrary-precision integers.
- `Float`: Double-precision floating-point numbers.
- `Bool`: `True` or `False`.

### Records
Records in Elm are similar to JavaScript objects but with strict typing.
```elm
user = { name = "Alice", age = 28 }

-- Accessing fields
userName = user.name

-- Updating records (creates a new record)
olderUser = { user | age = 29 }
```
Elm's record update syntax only allows updating existing fields, not adding or removing them. This guarantees structural consistency at runtime.

### Lists and Tuples
- **Lists** hold multiple values of the *same* type. They are implemented as linked lists, making prepending (`::`) fast (O(1)) and appending slow (O(n)).
  ```elm
  numbers = [1, 2, 3, 4]
  moreNumbers = 0 :: numbers -- [0, 1, 2, 3, 4]
  ```
- **Tuples** hold a fixed number of values of *potentially different* types (up to 3-tuples are common, max 3 elements built-in).
  ```elm
  pair = (True, "Success")
  ```

### Functions
Functions are defined without explicit `return` keywords. Every function takes exactly one argument; multiple arguments are achieved via currying.
```elm
add : Int -> Int -> Int
add x y =
    x + y

-- Partial application is natural
addFive : Int -> Int
addFive = add 5
```
Elm encourages using the pipe operator `|>` to chain function calls, reading from left to right.
```elm
result =
    "hello"
        |> String.toUpper
        |> String.reverse
```
And the backward pipe `<|` which is useful for avoiding parentheses:
```elm
value =
    String.reverse <| String.toUpper "hello"
```

### Control Flow
Elm has no loops. Iteration is done via recursion or list functions like `List.map`, `List.filter`, and `List.foldl`.
- **If Expressions**: Must always have an `else` branch, and both branches must return the exact same type. There are no ternary operators, as `if` acts like an expression itself.
  ```elm
  status = if age >= 18 then "Adult" else "Minor"
  ```
- **Case Expressions**: The primary way to branch logic, used heavily with Custom Types and pattern matching.
  ```elm
  case user of
      Admin -> "Full Access"
      Guest -> "Read Only"
  ```

### Custom Types (Algebraic Data Types)
Custom types allow you to model data precisely and eliminate "impossible states."
```elm
type Status
    = Loading
    | Success String
    | Failure Error
```

### Maybe and Result
Elm does not have `null` or `undefined`. Instead, missing data or potential failures are modeled using built-in Custom Types:
- **Maybe**: For values that might be missing.
  ```elm
  type Maybe a = Just a | Nothing
  ```
- **Result**: For operations that might fail with an error.
  ```elm
  type Result error value = Ok value | Err error
  ```

## Advanced Concepts

### The Elm Architecture (TEA)
The Elm Architecture is a simple pattern for architecting interactive applications. It consists of three parts:
1. **Model**: The state of your application.
2. **View**: A way to turn your state into HTML.
3. **Update**: A way to update your state based on messages.
Every Elm app follows this cycle: User interaction triggers a `Msg`, which goes to `update`, which returns a new `Model` (and optionally `Cmd`s), which goes to `view` to render the DOM.

### Side Effects: Commands and Subscriptions
Elm is purely functional, meaning functions cannot perform side effects (like making HTTP requests, generating random numbers, or getting the current time). Instead, Elm uses `Cmd` (Commands) and `Sub` (Subscriptions).
- **Cmd**: You return a `Cmd` from the `update` function to tell the Elm runtime to perform an action (e.g., fetch data). When it's done, the runtime sends a `Msg` back to your `update` function.
- **Sub**: Subscriptions let you listen to external events like JavaScript interop ports, keyboard events, or window resizing.

### Ports (JavaScript Interop)
Since Elm cannot directly call JavaScript APIs, it uses **Ports** to communicate securely with JavaScript.
- **Outgoing Ports**: Elm sends messages to JavaScript.
- **Incoming Ports**: JavaScript sends messages to Elm.
Ports ensure that data entering Elm from JS is type-checked at the boundary. Only certain data types (strings, primitives, records) can cross a port.

### Immutability and Structural Sharing
In Elm, all values are immutable. When you "change" a list or a record, Elm creates a new one. Under the hood, Elm uses structural sharing to make this efficient. If you change one node in a tree, the rest of the tree is reused in memory, drastically reducing memory overhead and garbage collection pauses.

### Opaque Types
An opaque type is a Custom Type where the constructor is not exposed from the module. This forces other modules to use exposed helper functions to interact with the type, ensuring invariants are always maintained.
```elm
module Email exposing (Email, create)

-- Type is exported, but constructor `Email` is hidden
type Email = Email String

create : String -> Maybe Email
create str =
    if String.contains "@" str then
        Just (Email str)
    else
        Nothing
```

### Phantom Types
A phantom type is a type with a parameter that is not used in the right-hand side of its definition. It is a powerful tool to enforce state machines at compile-time.
```elm
type FormData state = FormData Data

type Draft = Draft
type Validated = Validated

validate : FormData Draft -> FormData Validated
validate (FormData data) =
    FormData data
```
Using this pattern, a function that requires `FormData Validated` can never accidentally be passed unvalidated data.

## Ecosystem & Tooling

Elm’s ecosystem is small but remarkably stable and well-integrated. The tight control over the language prevents ecosystem fragmentation.

### Official CLI (`elm`)
- `elm make`: Compiles Elm code to an HTML or JS file. Includes the legendary Elm compiler error messages.
- `elm repl`: An interactive shell to evaluate Elm expressions.
- `elm reactor`: A built-in local development server that supports time-travel debugging.
- `elm init`: Initializes an `elm.json` file.

### Package Manager
Elm has a centralized package registry (`package.elm-lang.org`). One of its standout features is **enforced semantic versioning**. The compiler analyzes package updates; if you remove a function or change its signature, the compiler forces a major version bump. It is impossible to publish a breaking change as a minor update.

### Tooling
- **elm-format**: The standard formatter for Elm code. Nearly the entire community uses it, completely eliminating arguments about code style.
- **elm-test**: A robust testing framework supporting unit tests and property-based (fuzz) testing.
- **elm-review**: An advanced static analysis tool (linter) that provides custom rules for codebase maintainability and correctness.
- **Elm Debugger**: Built into `elm reactor`, it allows you to see the sequence of `Msg`s that fired and step backward/forward in time (Time-Travel Debugging) because every state change is purely derived from `update`.

### Key Libraries
- `elm/core`: Built-in types (String, List, Maybe, Result) and functions.
- `elm/html`: Virtual DOM bindings to build user interfaces.
- `elm/browser`: Tools for routing and managing the browser environment.
- `elm/http`: For making REST requests.
- `elm/json`: For strictly decoding JSON into Elm types.
- `mdgriffith/elm-ui`: An extremely popular alternative layout system that entirely replaces CSS and HTML elements with strongly-typed UI blocks.
- `dillonkearns/elm-graphql`: Generates type-safe GraphQL queries in Elm.

## Code Examples

### 1. Hello World
A minimal Elm program displaying text on the screen.
```elm
module Main exposing (main)

import Html exposing (text)

main =
    text "Hello, World!"
```

### 2. Counter Application
The classic Elm Architecture example.
```elm
module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)

-- MODEL
type alias Model = Int

init : Model
init = 0

-- UPDATE
type Msg
    = Increment
    | Decrement

update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            model + 1

        Decrement ->
            model - 1

-- VIEW
view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Decrement ] [ text "-" ]
        , div [] [ text (String.fromInt model) ]
        , button [ onClick Increment ] [ text "+" ]
        ]

-- MAIN
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }
```

### 3. Fetching Data with HTTP (Commands)
Demonstrating how to handle side effects like fetching JSON from an API.
```elm
module Main exposing (main)

import Browser
import Html exposing (Html, div, text, button)
import Html.Events exposing (onClick)
import Http

type alias Model =
    { status : String }

type Msg
    = FetchData
    | GotData (Result Http.Error String)

init : () -> ( Model, Cmd Msg )
init _ =
    ( { status = "Ready" }, Cmd.none )

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        FetchData ->
            ( { model | status = "Fetching..." }
            , Http.get
                { url = "https://example.com/api/data"
                , expect = Http.expectString GotData
                }
            )

        GotData (Ok data) ->
            ( { model | status = "Success: " ++ data }, Cmd.none )

        GotData (Err _) ->
            ( { model | status = "Failed to load data" }, Cmd.none )

view : Model -> Html Msg
view model =
    div []
        [ button [ onClick FetchData ] [ text "Load Data" ]
        , div [] [ text model.status ]
        ]

main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = \_ -> Sub.none
        , view = view
        }
```

### 4. Decoding JSON
Because Elm is strictly typed, incoming JSON must be explicitly decoded. Decoders describe the shape of the data and run at runtime.
```elm
import Json.Decode as Decode exposing (Decoder, int, string, field, map2)

type alias User =
    { id : Int
    , name : String
    }

userDecoder : Decoder User
userDecoder =
    map2 User
        (field "id" int)
        (field "name" string)

-- Using the decoder:
-- result = Decode.decodeString userDecoder """{"id": 1, "name": "Alice"}"""
-- Output: Ok { id = 1, name = "Alice" }
```

### 5. Custom Types for Pattern Matching
Handling different shapes of data natively.
```elm
type Shape
    = Circle Float
    | Rectangle Float Float
    | Point

area : Shape -> Float
area shape =
    case shape of
        Circle radius ->
            pi * radius * radius

        Rectangle width height ->
            width * height

        Point ->
            0
```

### 6. Using Ports for JS Interop
Connecting Elm to JavaScript.
```elm
port module Main exposing (main)

-- Outgoing port: Elm sends a string to JS
port sendMessage : String -> Cmd msg

-- Incoming port: JS sends a string to Elm
port messageReceiver : (String -> msg) -> Sub msg

type Msg
    = Recv String
    | Send String

-- In update:
-- Send "Hello" -> ( model, sendMessage "Hello" )
-- In subscriptions:
-- subscriptions model = messageReceiver Recv
```
In JavaScript:
```javascript
var app = Elm.Main.init({ node: document.getElementById('app') });

// Listen to Elm
app.ports.sendMessage.subscribe(function(message) {
    console.log("Elm says:", message);
    // Send back to Elm
    app.ports.messageReceiver.send("JS acknowledges: " + message);
});
```

## Best Practices

### Make Impossible States Impossible
Instead of using primitives like `Bool` or `String` that can represent invalid combinations, use Custom Types to model the domain perfectly.
```elm
-- BAD: Can both be True? What does that mean?
type alias Model =
    { isLoading : Bool
    , error : Maybe String
    , data : Maybe String
    }

-- GOOD: Only one state can exist at a time
type Status
    = Loading
    | Error String
    | Success String

type alias Model =
    { status : Status }
```

### Keep `update` Functions Flat
As an Elm app grows, the `update` function can become huge. Avoid deep nesting in `case` statements. Use helper functions for complex state transformations to keep the main `update` function clean and readable. Never try to create multiple `update` functions for nested components; keep the architecture monolithic and rely on helper functions for specific branches.

### Avoid Premature Componentization
In React, componentizing early is standard. In Elm, views are just functions. Do not try to recreate isolated stateful "components" (like the React component pattern) unless strictly necessary. Pass state down as function arguments and rely on a single source of truth in the main Model. Using "The Elm Architecture" for nested components leads to deep boilerplate and is universally discouraged.

### Use Opaque Types to Enforce Validation
If a piece of data (like an Email or an Age) requires validation, define an opaque type module. Expose the type but not its constructor. Expose a function `fromString : String -> Maybe Email`. This guarantees that if a function asks for an `Email`, it will never receive an invalid string.

### Write JSON Decoders Carefully
JSON Decoders act as the strict boundary between the untyped outside world and your typed Elm application. Spend time making them robust. Map server errors to meaningful Elm types, and use `NoRedInk/elm-json-decode-pipeline` for handling large objects with many fields.

### Prefer Extensible Records for Shared View Logic
If multiple different models need to be passed to a shared view function, use extensible records instead of complex custom types or duplicate functions.
```elm
viewUserAvatar : { a | avatarUrl : String, name : String } -> Html msg
viewUserAvatar user =
    img [ src user.avatarUrl, alt user.name ] []
```
This function accepts *any* record that has at least `avatarUrl` and `name` fields, promoting high reusability of view functions without tightly coupling them to specific Models.

### Embrace the Compiler
Elm developers spend most of their time in a loop with the compiler. Let it guide you. When performing large refactors, don't worry about tracing every impact—just change the core types and let the compiler point out every single place that needs to be updated. It is highly reliable.
