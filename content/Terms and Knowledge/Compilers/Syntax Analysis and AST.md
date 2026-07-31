---
tags: [term, compilers, parser]
category: Compiler Architecture & Parsing
subcategory: Compiler Frontend
---

# Syntax Analysis and AST

**Definition:** Syntax Analysis (Parsing) validates that a token sequence conforms to a formal Context-Free Grammar and constructs an Abstract Syntax Tree (AST) representing that structure.

## How It Works
- Grammars are specified in BNF/EBNF; **precedence and associativity declarations** resolve ambiguities like whether `a - b - c` groups left (`(a-b)-c`, left-associative) or dangling-else ambiguity resolves to the nearest unmatched `if`
- **Recursive Descent (Top-Down):** one hand-written function per grammar rule, calling into each other recursively; requires the grammar to be free of left-recursion, and typically uses **Pratt parsing / precedence climbing** for expressions so operator precedence doesn't require one recursive function per precedence level
- **LL(1) Parsers:** top-down, table-driven, decide which production to use from one token of lookahead
- **LR(1)/LALR Parsers (bottom-up):** shift-reduce parsers built from parser generators like Yacc/Bison; can handle a strictly larger class of grammars than LL but the generated tables are harder to hand-debug; conflicts show up as "shift/reduce" or "reduce/reduce" errors in the generator output
- **AST construction:** the tree discards syntax that's only needed to disambiguate parsing (parentheses, semicolons, redundant grouping) and keeps only the semantically meaningful structure — a binary expression node with an operator and two children, not a parenthesis token
- **Semantic Analysis** then walks the AST to build a **Symbol Table** (mapping names to declarations, scopes, and types), perform **name resolution**, enforce **type checking**, and catch errors like using a variable before declaration or calling a function with the wrong argument types
- **Error recovery:** production parsers don't stop at the first syntax error — they use panic-mode recovery (skip tokens until a synchronizing token like `;` or `}`) or error-production rules so the IDE/compiler can report multiple errors in one pass

## Why It Matters
- Provides the structured tree data model that IDE code completion, linters, static analysis tools, refactoring tools, and code generators all build on top of
- Catching grammar and semantic errors here, before code generation, means the compiler can give precise, source-located error messages instead of failing mysteriously deep in the backend

## Common Pitfalls
- **Ambiguous grammars** (dangling-else, operator precedence not fully specified) cause parser ambiguity that must be resolved with explicit precedence rules or grammar rewrites
- **Left recursion** (`expr -> expr '+' term`) causes naive recursive-descent parsers to infinite-loop; it must be eliminated or handled with iterative/Pratt-style parsing instead
- Treating parsing and semantic analysis as fully separable: some constructs (e.g., resolving whether `T(x)` is a cast or a function call, or user-defined operator overloading) genuinely require type/symbol information mid-parse in some languages

## Related Terms
- [[Lexical Analysis]]
- [[Compiler Pipeline Architecture]]
- [[Context-Free Grammars and Pushdown Automata]]
- [[Chomsky Hierarchy]]

## Example
Parsing `3 + 5 * 2` with correct precedence creates an AST with root `+`, left child `3`, and right child a `*` sub-tree (`5`, `2`) — reflecting that multiplication binds tighter than addition even though `+` appears in the middle of the token stream:

```text
      +
     / \
    3   *
       / \
      5   2
```
