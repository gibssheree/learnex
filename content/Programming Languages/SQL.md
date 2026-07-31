---
tags: [programming-language, data, database, declarative]
category: Data/Scientific
status: to-learn
---

# SQL

**Definition:** Declarative language for querying and manipulating relational data, with semantics built around sets, joins, predicates, and transactionally managed tables.

**Paradigm:** Declarative | **Typing:** Static (schema-based)

## Pros
- Works across essentially every relational engine, even though each vendor has its own dialect.
- Declarative queries let the optimizer choose indexes, join order, and access paths.
- Mature transactional semantics, indexing, and constraint systems make it the backbone of most persistent applications.
- Excellent for reporting, ad hoc analysis, operational dashboards, and data transformations.
- The language is compact but expressive enough to model filtering, grouping, windowing, and recursive traversal.

## Cons
- Dialect differences are real: PostgreSQL, MySQL, SQL Server, SQLite, and Oracle all diverge on functions, syntax, and optimizer behavior.
- Complex joins, nested CTEs, and window functions can become difficult to reason about without disciplined formatting.
- NULL semantics are subtle and often surprise people with three-valued logic.
- Performance depends heavily on schema design, indexes, statistics, and the query planner.
- It is not a general-purpose control-flow language, so application logic still belongs elsewhere.

## Best For
- Any application that stores structured data and needs transactions, constraints, and durable indexing.
- Reporting systems, analytics queries, and operational admin tasks.
- Data modeling where relationships and set operations matter more than imperative control flow.

## Real Examples
- PostgreSQL, MySQL, SQL Server, Oracle Database, and SQLite all center around SQL.
- Banking, ERP, CRM, and inventory systems frequently use SQL as the primary persistence interface.
- Data warehouses such as Snowflake, BigQuery, and Redshift extend SQL for large-scale analytics.

## Use Cases
- CRUD queries, migrations, report generation, ETL staging, and analytical aggregations.
- Join-heavy data access paths that benefit from indexes and optimizer statistics.
- Window functions, `GROUP BY`, and CTEs for ranking, deduplication, and cohort analysis.

---

## Extended Syntax & Features

SQL (Structured Query Language) is divided into several sub-languages, each serving a distinct purpose within the database ecosystem. These sub-languages allow developers and administrators to manage data structures, manipulate data, control access, and manage transactions.

### Core Sub-Languages
- **DDL (Data Definition Language):** Used to define or alter the database structure or schema. Keywords include `CREATE`, `ALTER`, `DROP`, `TRUNCATE`.
- **DML (Data Manipulation Language):** Used for managing data within schema objects. Keywords include `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
- **DCL (Data Control Language):** Used to control access to data in the database. Keywords include `GRANT`, `REVOKE`.
- **TCL (Transaction Control Language):** Used to manage transactions in the database. Keywords include `COMMIT`, `ROLLBACK`, `SAVEPOINT`.

### Basic Data Types
While different SQL dialects have variations, common data types include:
- **Numeric:** `INT`, `SMALLINT`, `BIGINT`, `DECIMAL(p,s)`, `NUMERIC`, `FLOAT`, `REAL`.
- **Character/String:** `CHAR(n)`, `VARCHAR(n)`, `TEXT` (or `CLOB`).
- **Date/Time:** `DATE`, `TIME`, `DATETIME`, `TIMESTAMP` (often with time zone support).
- **Boolean:** `BOOLEAN` (or `BIT` in some dialects like SQL Server).
- **Binary:** `BLOB`, `VARBINARY`.
- **Complex/Specialized:** `JSON`, `XML`, `UUID`, Arrays, and Geometric/Spatial types (especially in PostgreSQL).

### Control Flow
Standard SQL is declarative, but it supports conditional expressions using `CASE`. For procedural control flow (loops, variables, if-else), developers use dialect-specific procedural languages (e.g., PL/pgSQL in PostgreSQL, T-SQL in SQL Server, PL/SQL in Oracle).

### Constraints
Constraints are rules applied to columns or tables to enforce data integrity.
- **PRIMARY KEY:** Uniquely identifies each record in a table.
- **FOREIGN KEY:** Ensures referential integrity between two tables.
- **UNIQUE:** Ensures all values in a column are distinct.
- **NOT NULL:** Ensures a column cannot have a NULL value.
- **CHECK:** Ensures that values in a column satisfy a specific condition.

---

## Advanced Concepts

### Query Execution & Optimization
Unlike imperative languages where you define *how* to execute a process, in SQL you define *what* you want. The Relational Engine's **Query Optimizer** generates an execution plan. It evaluates multiple ways to execute the query (e.g., full table scan vs. index seek, nested loop join vs. hash join) and chooses the one with the lowest estimated cost based on database statistics.

### Concurrency and Transactions (ACID)
SQL databases provide ACID properties:
- **Atomicity:** All parts of a transaction succeed, or none do.
- **Consistency:** Transactions transition the database from one valid state to another.
- **Isolation:** Concurrent transactions do not interfere with each other. SQL defines isolation levels:
  - *Read Uncommitted:* Transactions can see uncommitted data (Dirty Reads).
  - *Read Committed:* Transactions can only see committed data.
  - *Repeatable Read:* Ensures that if a row is read twice in the same transaction, the values will be identical.
  - *Serializable:* The highest level; concurrent transactions behave as if executed sequentially.
- **Durability:** Committed transactions are permanent, even in the event of a crash.

### Window Functions
Window functions perform calculations across a set of table rows that are somehow related to the current row. Unlike aggregate functions, window functions do not cause rows to become grouped into a single output row. Examples include `ROW_NUMBER()`, `RANK()`, `LEAD()`, `LAG()`, and cumulative sums using `OVER(PARTITION BY ... ORDER BY ...)`.

### Common Table Expressions (CTEs)
CTEs provide a way to write auxiliary statements for use in a larger query. They are defined using the `WITH` clause. Recursive CTEs are particularly powerful for querying hierarchical data, such as organizational charts or directory structures.

---

## Ecosystem & Tooling

Because SQL is a standardized language implemented by various vendors, the ecosystem is vast and fragmented by dialect.

### Prominent Dialects and Engines
- **PostgreSQL:** Open-source, highly standards-compliant, extensible (PostGIS, custom types).
- **MySQL/MariaDB:** Open-source, widely used in web development (LAMP stack).
- **SQL Server (T-SQL):** Microsoft's enterprise database, strong tooling (SSMS).
- **Oracle (PL/SQL):** Enterprise heavyweight, highly scalable.
- **SQLite:** Embedded database, serverless, single file, standard on mobile and desktop apps.

### Database Migration Tools
To version-control DDL scripts and apply schema changes systematically:
- **Flyway:** SQL-based migration tool that tracks schema versions.
- **Liquibase:** Supports XML, YAML, JSON, and SQL for defining migrations.
- **Alembic:** Associated with SQLAlchemy (Python).
- **ActiveRecord Migrations:** Built into Ruby on Rails.

### Object-Relational Mappers (ORMs)
ORMs bridge the gap between object-oriented code and relational databases, generating SQL under the hood:
- **Hibernate / JPA (Java)**
- **Entity Framework Core (C#/.NET)**
- **SQLAlchemy (Python)**
- **Prisma / TypeORM (Node.js/TypeScript)**
- **GORM (Go)**

### Administration and Development Tools
- **DBeaver:** Universal cross-platform database tool.
- **DataGrip:** JetBrains IDE for databases.
- **pgAdmin:** Popular web-based GUI for PostgreSQL.
- **SQL Server Management Studio (SSMS):** Specialized IDE for SQL Server.

---

## Code Examples

### 1. Basic CRUD Operations
This example demonstrates table creation and basic Data Manipulation Language (DML) commands.

```sql
-- DDL: Create a table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY, -- PostgreSQL syntax for auto-increment
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department_id INT,
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL(10, 2)
);

-- DML: Insert data
INSERT INTO employees (first_name, last_name, department_id, salary)
VALUES 
    ('Alice', 'Smith', 1, 75000.00),
    ('Bob', 'Jones', 2, 60000.00),
    ('Charlie', 'Brown', 1, 82000.00);

-- DML: Update data
UPDATE employees
SET salary = salary * 1.05
WHERE department_id = 1;

-- DML: Delete data
DELETE FROM employees
WHERE last_name = 'Jones';
```

### 2. Joins and Aggregations
A core feature of SQL is combining data from multiple tables using `JOIN` and summarizing data using `GROUP BY`.

```sql
-- Assume a 'departments' table exists (id, name)
SELECT 
    d.name AS department_name,
    COUNT(e.id) AS employee_count,
    AVG(e.salary) AS average_salary
FROM 
    departments d
LEFT JOIN 
    employees e ON d.id = e.department_id
WHERE 
    e.hire_date >= '2020-01-01'
GROUP BY 
    d.name
HAVING 
    COUNT(e.id) > 10
ORDER BY 
    average_salary DESC;
```

### 3. Window Functions
Window functions allow for advanced analytics without grouping rows.

```sql
-- Calculate rank and running total of salaries within each department
SELECT 
    department_id,
    first_name,
    last_name,
    salary,
    -- Rank employees by salary within their department
    RANK() OVER (
        PARTITION BY department_id 
        ORDER BY salary DESC
    ) AS salary_rank,
    -- Calculate a running total of salaries within the department
    SUM(salary) OVER (
        PARTITION BY department_id 
        ORDER BY hire_date ASC
    ) AS running_total_salary
FROM 
    employees;
```

### 4. Common Table Expressions (CTEs)
CTEs improve readability and can be used to break complex queries into modular parts.

```sql
-- Find departments where the average salary is above the company-wide average
WITH CompanyAverage AS (
    SELECT AVG(salary) AS avg_salary
    FROM employees
),
DepartmentAverages AS (
    SELECT 
        department_id, 
        AVG(salary) AS dept_avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT 
    da.department_id,
    da.dept_avg_salary,
    ca.avg_salary AS company_avg
FROM 
    DepartmentAverages da
CROSS JOIN 
    CompanyAverage ca
WHERE 
    da.dept_avg_salary > ca.avg_salary;
```

### 5. Recursive CTEs
Recursive CTEs are used to traverse hierarchical data, such as a manager-employee relationship.

```sql
-- Assume an 'org_chart' table (employee_id, manager_id, name)
WITH RECURSIVE subordinates AS (
    -- Base case: find the top-level manager (CEO)
    SELECT 
        employee_id, 
        manager_id, 
        name, 
        0 AS level
    FROM 
        org_chart
    WHERE 
        manager_id IS NULL
    
    UNION ALL
    
    -- Recursive step: find employees managed by those in the previous level
    SELECT 
        e.employee_id, 
        e.manager_id, 
        e.name, 
        s.level + 1
    FROM 
        org_chart e
    INNER JOIN 
        subordinates s ON s.employee_id = e.manager_id
)
SELECT * FROM subordinates ORDER BY level, name;
```

### 6. Transactions and Error Handling
Transactions ensure data integrity when multiple operations must succeed or fail as a unit.

```sql
-- Transferring money between two accounts
BEGIN; -- Start transaction (syntax varies by dialect, e.g., BEGIN TRANSACTION)

-- Deduct from Account A
UPDATE accounts 
SET balance = balance - 500 
WHERE account_id = 101 AND balance >= 500;

-- Ensure the first update actually happened (logic usually handled in application code)
-- Add to Account B
UPDATE accounts 
SET balance = balance + 500 
WHERE account_id = 202;

-- If everything is successful, commit
COMMIT;
-- If there was an error, we would use ROLLBACK;
```

### 7. Conditional Logic with CASE
The `CASE` statement acts like an `if-else` construct within queries.

```sql
SELECT 
    order_id,
    amount,
    CASE 
        WHEN amount < 50 THEN 'Small'
        WHEN amount BETWEEN 50 AND 200 THEN 'Medium'
        WHEN amount > 200 THEN 'Large'
        ELSE 'Unknown'
    END AS order_size
FROM 
    orders;
```

### 8. JSON Data Manipulation (PostgreSQL specific example)
Modern SQL engines often provide robust support for unstructured JSON data.

```sql
-- Querying a JSONB column named 'metadata'
SELECT 
    id,
    metadata->>'browser' AS browser_type,
    CAST(metadata->>'load_time_ms' AS INTEGER) AS load_time
FROM 
    user_sessions
WHERE 
    metadata->>'os' = 'Linux'
    AND CAST(metadata->>'load_time_ms' AS INTEGER) > 1000;
```

---

## Best Practices

### 1. Formatting and Readability
- SQL queries can become massive. Use consistent formatting.
- Capitalize keywords (`SELECT`, `FROM`, `WHERE`) and use lowercase for identifiers (table and column names).
- Use indentation for subqueries, `JOIN` conditions, and `CASE` statements.
- Use aliases (e.g., `FROM employees e`) to reduce verbosity, but keep them meaningful.

### 2. Performance and Optimization
- **Avoid `SELECT *`:** Only query the columns you actually need. This reduces network I/O, memory usage, and allows the optimizer to use covering indexes.
- **Index Strategically:** Create indexes on columns used in `WHERE`, `JOIN`, and `ORDER BY` clauses. However, avoid over-indexing, as it slows down `INSERT`/`UPDATE`/`DELETE` operations.
- **Sargable Predicates:** Write `WHERE` clauses that can utilize indexes (SARGable - Search Argument Able). 
  - *Bad:* `WHERE YEAR(created_at) = 2023` (applies a function to the column, invalidating the index).
  - *Good:* `WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01'`.
- **Use `EXPLAIN`:** Always use `EXPLAIN` or `EXPLAIN ANALYZE` to inspect the execution plan of slow queries.

### 3. Schema Design
- **Normalize by Default:** Aim for Third Normal Form (3NF) to reduce data redundancy and anomalies. Denormalize only when strictly necessary for read performance.
- **Use Appropriate Data Types:** Use the smallest data type that safely contains the data (e.g., `SMALLINT` instead of `INT`). Don't use `VARCHAR(255)` out of habit.
- **Enforce Integrity at the Database Level:** Use foreign keys, unique constraints, and check constraints. Don't rely solely on the application code to prevent bad data.

### 4. Security and Injection
- **Never Concatenate Strings for Queries:** SQL injection is a critical vulnerability. Always use parameterized queries or prepared statements in your application code.
- **Principle of Least Privilege:** Grant users and applications only the permissions they need (e.g., a reporting user only needs `SELECT`, not `DROP` or `UPDATE`).

### 5. Handling NULLs
- Remember that `NULL` means "unknown." `NULL = NULL` evaluates to `NULL`, not `TRUE`.
- Use `IS NULL` or `IS NOT NULL` to check for null values.
- Be careful with `NOT IN` when the subquery can return `NULL`; it will often cause the entire condition to fail unexpectedly. Use `NOT EXISTS` instead.
- Use functions like `COALESCE(column, default_value)` to handle nulls safely.

```sql
-- Safe handling of potentially NULL values
SELECT 
    first_name, 
    last_name, 
    COALESCE(bonus, 0) AS safe_bonus 
FROM employees;
```
