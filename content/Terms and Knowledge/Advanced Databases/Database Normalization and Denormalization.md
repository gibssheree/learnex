---
tags: [term, databases, modeling]
category: Database Design
---

# Database Normalization and Denormalization

**Definition:** Normalization structures relational database schemas to eliminate data redundancy and anomalies (1NF, 2NF, 3NF, BCNF); Denormalization intentionally adds redundancy to boost read performance.

## How It Works
- 1NF: atomic column values, no repeating groups
- 2NF: satisfies 1NF and removes partial dependencies on composite primary key
- 3NF: satisfies 2NF and removes transitive non-key dependencies
- Denormalization: pre-calculates aggregates or duplicate fields to avoid expensive multi-table JOIN operations

## Why It Matters
- Prevents insertion, update, and deletion anomalies while maintaining data integrity

## Common Pitfalls
- Over-normalizing leads to 10+ table JOINs per web request, degrading write/read throughput

## Related Terms
- [[Database Indexing Internals]]
- [[Transaction Isolation Levels]]

## Example
Storing `customer_name` directly inside `orders` table (denormalization) to avoid joining `customers` table during fast order history reads.
