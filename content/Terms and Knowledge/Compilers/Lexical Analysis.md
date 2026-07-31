---
tags: [term, compilers, lexer]
category: Compiler Architecture & Parsing
subcategory: Compiler Frontend
---

# Lexical Analysis

**Definition:** The first phase of a compiler (Lexer/Scanner) that converts a raw stream of source code characters into a sequence of meaningful Tokens.

## How It Works
- Lexer specifications are written as Regular Expressions per token class, then compiled into an NFA (Thompson's Construction) and determinized into a DFA (subset construction) so recognition runs in O(n) time with no backtracking
- Reads the character stream and groups it into lexemes; **Maximal Munch** (longest-match) resolves ambiguity by always consuming the longest string that matches a valid token (e.g., `<=` lexes as one `LE` token, not `<` followed by `=`)
- Outputs Tokens containing token type, value/lexeme, line number, and column position (e.g., `KEYWORD_IF`, `IDENTIFIER_x`, `OPERATOR_ASSIGN`) for downstream error messages
- Strips out comments and insignificant whitespace, but must still track newlines for line-numbered diagnostics and for whitespace-sensitive languages (Python, Haskell) where indentation itself becomes a token
- Keyword recognition is usually just identifier lexing followed by a reserved-word hash table lookup, rather than a separate grammar rule, since `if`/`while`/`for` are lexically identical to identifiers
- Lexer generator tools (Lex/Flex, ANTLR, re2c) take the regex table as input and emit the DFA-driven scanning code automatically

## Why It Matters
- Simplifies parser implementation by turning an arbitrary raw character stream into a structured, finite token sequence the parser can reason about with lookahead
- Runs in a single linear pass, so pushing work into the lexer (rather than the parser) keeps overall compile time closer to O(n) for that phase

## Common Pitfalls
- Greedy/maximal-munch errors (e.g., lexing `>>` in C++ template code like `vector<vector<int>>` as a single right-shift operator instead of two closing angle brackets — this genuinely broke C++03 and required a parser-side fix in C++11)
- Context-sensitive lexing: C's grammar requires the lexer to know whether an identifier was previously `typedef`'d to disambiguate `(A)(B)` as a cast versus a function call, meaning the "pure" lexer/parser separation leaks
- Off-by-one line/column tracking when lexemes span multiple lines (multi-line string literals, block comments)
- Mishandling Unicode: treating source as raw bytes instead of decoded code points breaks identifiers or string literals containing multi-byte UTF-8 sequences

## Related Terms
- [[Compiler Pipeline Architecture]]
- [[Syntax Analysis and AST]]
- [[Finite Automata (DFA and NFA)]]
- [[Regular Expressions and Grammars]]

## Example
Lexing `int x = 5;` produces tokens `[TYPE:int, IDENT:x, ASSIGN:=, INT:5, SEMICOLON:;]`.

```text
input:  int  x  =  5 ;
DFA:    i-n-t -> matches TYPE (keyword table hit)
        x     -> matches IDENTIFIER
        =     -> matches ASSIGN (not `==`, since next char isn't `=`)
        5     -> matches INT_LITERAL
        ;     -> matches SEMICOLON
```
