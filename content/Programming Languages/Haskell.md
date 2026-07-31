---
tags: [programming-language, functional, academic]
category: Functional
status: to-learn
---

# Haskell

**Definition:** Purely functional language with strong static types, lazy evaluation, and side effects isolated through the type system.

**Paradigm:** Pure functional | **Typing:** Static, strong

## Pros
- Referential transparency makes reasoning about code and testing behavior easier.
- The type system can encode invariants, state transitions, and domain constraints very precisely.
- Lazy evaluation can avoid unnecessary work and supports elegant composition patterns.
- Algebraic data types and pattern matching are excellent for domain modeling.
- Strong support for formal reasoning, compiler work, and code generation.

## Cons
- Laziness, monads, and type-level abstractions are unfamiliar to many imperative programmers.
- Tooling and package ecosystem are solid but narrower than mainstream enterprise languages.
- Debugging can feel unfamiliar when evaluation is deferred until values are demanded.
- Team adoption can stall if functional patterns are new to the organization.

## Best For
- Research, compilers, and correctness-critical systems.
- Formal modeling, parsing, and heavy domain logic.

## Real Examples
- Pandoc is one of the most visible Haskell applications.
- Fintech and research teams sometimes use it where type guarantees are valuable.
- The language is widely cited in compiler and PL research communities.

## Use Cases
- Parser combinators, compilers, static analysis, and domain-heavy backend logic.
- Formal verification experiments and theorem-proving-adjacent work.

---

## Extended Syntax & Features

Haskell's syntax is heavily inspired by mathematics, emphasizing expressions over statements, immutability, and declarative programming. 

### Basic Data Types
Haskell possesses a strong, static type system with type inference. Essential types include:
- `Int`: Bounded integer, generally 64-bit on modern machines.
- `Integer`: Unbounded integer, can hold arbitrarily large numbers.
- `Float` / `Double`: Single and double precision floating-point numbers.
- `Bool`: Boolean values `True` and `False`.
- `Char`: Unicode characters enclosed in single quotes, e.g., `'a'`.
- `String`: A list of characters `[Char]`, though historically inefficient for large texts compared to `Text` or `ByteString`.

### Functions and Type Signatures
Functions are first-class citizens. They are typically defined with a type signature on the preceding line. Haskell functions are curried by default.
```haskell
addThreeNumbers :: Int -> Int -> Int -> Int
addThreeNumbers x y z = x + y + z

-- Partial application:
-- addTwoTo :: Int -> Int -> Int
-- addTwoTo = addThreeNumbers 2
```

### Pattern Matching & Guards
Pattern matching is a cornerstone of Haskell, used to deconstruct data types cleanly. Guards provide an alternative to complex `if-else` trees by testing conditions in sequence.
```haskell
-- Pattern matching on lists
sumList :: [Int] -> Int
sumList [] = 0
sumList (x:xs) = x + sumList xs

-- Guards for conditional logic
describeNumber :: Int -> String
describeNumber n
    | n < 0     = "Negative"
    | n == 0    = "Zero"
    | otherwise = "Positive"
```

### Algebraic Data Types (ADTs)
ADTs allow you to define custom structures by combining types using sum (alternatives) and product (groupings).
```haskell
-- Sum type
data TrafficLight = Red | Yellow | Green

-- Product type
data Point = Point Double Double

-- Sum and Product combined
data Shape = Circle Point Double | Rectangle Point Point
```

### Type Classes
Type classes define a set of functions that can have different implementations depending on the type of data they are given. They are akin to interfaces in object-oriented languages, but more powerful. Standard type classes include `Eq`, `Ord`, `Show`, `Read`, `Functor`, `Applicative`, and `Monad`.
```haskell
class Describable a where
    describe :: a -> String

instance Describable TrafficLight where
    describe Red = "Stop!"
    describe Yellow = "Caution!"
    describe Green = "Go!"
```

---

## Advanced Concepts

### Lazy Evaluation
Haskell is lazy by default, meaning expressions are not evaluated until their results are strictly necessary. This allows for the creation of infinite data structures and can optimize performance by avoiding unused computations.
```haskell
-- An infinite list of all Fibonacci numbers
fibs :: [Integer]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- Because of laziness, we can just take what we need
firstTenFibs :: [Integer]
firstTenFibs = take 10 fibs
```

### Monads and IO
Since Haskell is pure, functions cannot have side effects (like printing to a screen or modifying a global variable). The `IO` monad is used to encapsulate side effects, ensuring they are executed in a controlled and predictable sequence. The `do` notation provides syntactic sugar for chaining monadic operations.
```haskell
main :: IO ()
main = do
    putStrLn "What is your name?"
    name <- getLine
    putStrLn ("Hello, " ++ name ++ "!")
```
Monads are also used for handling failure (`Maybe`, `Either`), managing state (`State`), reading configuration (`Reader`), and logging (`Writer`).

### Concurrency and Parallelism
Haskell provides excellent primitives for concurrency and parallelism. The Glasgow Haskell Compiler (GHC) features a lightweight thread system where threads are cheap to create (often in the millions).
- **Software Transactional Memory (STM)**: STM provides a composable way to share memory safely between threads without traditional locking mechanisms.
- **Sparks**: Parallelism can be hinted to the runtime system using `par` and `pseq`, allowing pure code to run simultaneously across CPU cores.

### Generics and Metaprogramming
- **Template Haskell**: Allows for compile-time metaprogramming, generating Haskell code dynamically during compilation. Useful for reducing boilerplate (e.g., generating JSON parsers).
- **GHC Generics**: Provides a way to automatically derive boilerplate instances for custom data types (like `ToJSON` and `FromJSON` in the `aeson` library).

---

## Ecosystem & Tooling

The Haskell ecosystem is robust and heavily relies on its package manager and build tools.

### Build Tools
- **Cabal**: The Common Architecture for Building Applications and Libraries. It is the core package infrastructure for Haskell.
- **Stack**: A cross-platform program for developing Haskell projects, built on top of Cabal. It emphasizes reproducible builds by using snapshots of compatible package versions from Stackage.
- **HLS (Haskell Language Server)**: The standard IDE experience for Haskell, providing autocomplete, linting, type information on hover, and refactoring support in editors like VS Code, Neovim, and Emacs.

### Package Manager
- **Hackage**: The central repository for open-source Haskell packages.
- **Stackage**: A curated repository of Hackage packages that are guaranteed to compile together, preventing "cabal hell" (dependency conflicts).

### Prominent Frameworks & Libraries
- **Web Frameworks**: `Yesod`, `Servant`, `Scotty`. `Servant` is particularly notable for defining APIs as types, guaranteeing client-server consistency at compile time.
- **Parsing**: `megaparsec` and `attoparsec` for robust and highly performant parser combinators.
- **Data Serialization**: `aeson` for JSON encoding/decoding.
- **Text Processing**: `text` and `bytestring` libraries are essential for performant string manipulation and I/O.
- **Concurrency**: `async`, `stm`.

---

## Code Examples

### 1. Hello World & Basic I/O
A simple entry point demonstrating standard console interaction.
```haskell
-- File: Main.hs
module Main where

import System.IO (hFlush, stdout)

main :: IO ()
main = do
    putStr "Enter your favorite programming language: "
    hFlush stdout -- Ensure prompt is printed before input is read
    language <- getLine
    if language == "Haskell"
        then putStrLn "Excellent choice!"
        else putStrLn $ language ++ " is cool too, but have you tried Haskell?"
```

### 2. Basic Data Structures and Mapping
Demonstrating lists, higher-order functions, and lambda expressions.
```haskell
-- Filter even numbers and square them
processNumbers :: [Int] -> [Int]
processNumbers xs = map (\x -> x * x) (filter even xs)

-- Using list comprehension (equivalent to above)
processNumbers' :: [Int] -> [Int]
processNumbers' xs = [ x * x | x <- xs, even x ]

-- Example usage: processNumbers [1..10] == [4, 16, 36, 64, 100]
```

### 3. Algebraic Data Types and Maybe Monad
Using `Maybe` to safely handle missing data without null pointers.
```haskell
data User = User 
    { userId :: Int
    , username :: String 
    } deriving (Show, Eq)

-- A simulated database lookup
findUser :: Int -> [User] -> Maybe User
findUser _ [] = Nothing
findUser id (u:us)
    | userId u == id = Just u
    | otherwise      = findUser id us

-- Using the Maybe monad to chain operations safely
getUserNameSafely :: Int -> [User] -> String
getUserNameSafely id db = case findUser id db of
    Just user -> "Found user: " ++ username user
    Nothing   -> "User not found."
```

### 4. Advanced Concurrency (STM)
Using Software Transactional Memory for safe, lock-free concurrent updates.
```haskell
import Control.Concurrent (forkIO, threadDelay)
import Control.Concurrent.STM
import Control.Monad (replicateM_)

type Account = TVar Int

transfer :: Int -> Account -> Account -> STM ()
transfer amount from to = do
    balance <- readTVar from
    if balance >= amount
        then do
            writeTVar from (balance - amount)
            modifyTVar to (+ amount)
        else retry -- Blocks transaction until balance changes

main :: IO ()
main = do
    -- Create accounts with initial balances
    alice <- newTVarIO 1000
    bob   <- newTVarIO 0
    
    -- Fork a background thread to transfer money
    forkIO $ atomically $ transfer 500 alice bob
    
    -- Wait a bit for the thread to finish
    threadDelay 100000
    
    -- Check balances
    aliceBal <- readTVarIO alice
    bobBal   <- readTVarIO bob
    
    putStrLn $ "Alice: " ++ show aliceBal
    putStrLn $ "Bob:   " ++ show bobBal
```

### 5. Web API with Servant (Type-level Routing)
Servant defines the API as a type, allowing the compiler to generate handlers, clients, and documentation automatically.
```haskell
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
{-# LANGUAGE DeriveGeneric #-}

import Servant
import Data.Aeson (ToJSON)
import GHC.Generics (Generic)
import Network.Wai.Handler.Warp (run)

-- Define the response data structure
data Message = Message 
    { id :: Int
    , text :: String 
    } deriving (Eq, Show, Generic)

instance ToJSON Message

-- Define the API at the type level
-- GET /hello -> returns JSON Message
type MyAPI = "hello" :> Get '[JSON] Message

-- Implement the server logic
server :: Server MyAPI
server = return (Message 1 "Hello from Servant!")

-- Expose the API
myAPI :: Proxy MyAPI
myAPI = Proxy

-- Run the web server on port 8080
main :: IO ()
main = do
    putStrLn "Starting server on port 8080..."
    run 8080 (serve myAPI server)
```

### 6. QuickCheck for Property-Based Testing
Haskell pioneered property-based testing. Instead of writing individual test cases, you specify properties that must always hold true.
```haskell
import Test.QuickCheck
import Data.List (sort)

-- Property: Sorting a list twice is the same as sorting it once (Idempotence)
prop_sortIdempotent :: [Int] -> Bool
prop_sortIdempotent xs = sort (sort xs) == sort xs

-- Property: Reversing a list twice returns the original list
prop_reverseTwice :: [Int] -> Bool
prop_reverseTwice xs = reverse (reverse xs) == xs

-- Run the tests in ghci:
-- > quickCheck prop_sortIdempotent
-- > quickCheck prop_reverseTwice
```

### 7. Functional Patterns: The State Monad
Managing state cleanly without mutable variables using the State Monad.
```haskell
import Control.Monad.State

-- A simple stack structure
type Stack = [Int]

-- Pop an item off the stack
pop :: State Stack Int
pop = do
    (x:xs) <- get
    put xs
    return x

-- Push an item onto the stack
push :: Int -> State Stack ()
push a = do
    xs <- get
    put (a:xs)

-- A sequence of stateful operations
stackManip :: State Stack Int
stackManip = do
    push 3
    push 4
    push 5
    pop
    pop

-- Run the state machine with an initial stack
-- runState stackManip [1, 2] 
-- Result: (4, [3, 1, 2])
```

---

## Best Practices

### 1. Embrace Purity and Immuteability
Keep your core logic pure. Push side effects (IO) to the boundaries of your application. This pattern, often called "functional core, imperative shell", drastically simplifies testing and reasoning about complex domain logic.

### 2. Leverage the Type System
Don't use generic types like `String` or `Int` for everything. Create distinct types (`newtype`) for different concepts even if their underlying representation is the same. This prevents accidental mixing of variables (e.g., passing a User ID to a function expecting a Product ID).
```haskell
newtype UserId = UserId Int
newtype ProductId = ProductId Int

-- The compiler will catch if you pass a ProductId here!
getUser :: UserId -> IO User
```

### 3. Prefer `Text` and `ByteString` over `String`
The default `String` type in Haskell is an alias for `[Char]`, which is implemented as a linked list. This is highly inefficient in terms of memory and performance. Always use `Data.Text` for human-readable text and `Data.ByteString` for binary data or highly optimized I/O.

### 4. Handle Errors Safely
Avoid using partial functions like `head` or `tail` that throw runtime exceptions on empty lists. Instead, use total functions that return `Maybe` or `Either`, forcing the caller to handle the failure cases explicitly.
```haskell
-- Bad: Crashes on empty list
badFirstItem :: [a] -> a
badFirstItem = head

-- Good: Safe, forces handling of Nothing
safeFirstItem :: [a] -> Maybe a
safeFirstItem [] = Nothing
safeFirstItem (x:_) = Just x
```

### 5. Control Space Leaks with Strictness
Laziness is powerful but can lead to memory leaks if unevaluated thunks build up (space leaks). 
- Use the `BangPatterns` extension to force evaluation where laziness is not needed.
- Prefer strict data fields in your algebraic data types.
- Use strict variants of fold functions like `foldl'` instead of `foldl`.

### 6. Write Small, Composable Functions
Instead of writing massive functions that do many things, write small, focused functions and chain them together using composition `(.)` or the pipe operator. This encourages reuse and makes individual parts trivial to test.

### 7. Documentation and Haddock
Always comment your exported functions and complex data structures using Haddock syntax. Because type signatures express so much intent, standardizing on clear, concise Haddock comments clarifies the *why* of the code.

```haskell
-- | Computes the factorial of a non-negative integer.
-- Returns 'Nothing' if the input is negative.
factorial :: Integer -> Maybe Integer
factorial n
    | n < 0     = Nothing
    | n == 0    = Just 1
    | otherwise = Just $ product [1..n]
```

### 8. Manage Dependencies Carefully
Haskell projects can suffer from long compile times and complex dependency resolution. Keep your dependencies lean. Use Stackage (via Stack or Cabal's v2-build mechanism) to ensure that your dependencies are mutually compatible.

### 9. Use HLint
`hlint` is the standard linting tool for Haskell. It suggests idiomatic rewrites, points out redundant code, and helps enforce standard community styling. Integrate it into your CI pipeline and editor.

### 10. Stay Grounded
Haskell allows for extremely abstract code (monad transformers, advanced type families, lenses). While powerful, excessive abstraction can alienate team members and make code unreadable. Aim for the lowest level of abstraction that accurately models your problem. Keep it simple and readable first.
