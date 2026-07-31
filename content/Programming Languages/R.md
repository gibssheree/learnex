---
tags: [programming-language, data, statistics, academia]
category: Scripting/Dynamic
status: to-learn
---

# R

**Definition:** Language built specifically for statistics, data analysis, and visualization, with a package ecosystem centered on modeling and reporting. Originally created by Ross Ihaka and Robert Gentleman at the University of Auckland, New Zealand, and currently developed by the R Development Core Team.

**Paradigm:** Multi-paradigm (Functional, Procedural, Object-Oriented, Array) | **Typing:** Dynamic, Duck Typing

## Pros
- Unmatched statistical and modeling libraries for applied research.
- ggplot2 and related packages make publication-quality visualization accessible.
- Built around data frames, formulas, and statistical workflows as first-class citizens.
- Excellent for reproducible analysis notebooks and reports (via R Markdown and Quarto).
- Massive ecosystem of packages hosted on CRAN and Bioconductor.
- Strong functional programming roots inherited from Scheme.
- Highly expressive syntax for data manipulation (especially with the tidyverse).
- Interoperability with C, C++, and Fortran for high-performance extensions.

## Cons
- Syntax is idiosyncratic and can feel inconsistent to newcomers, inheriting some oddities from S.
- Performance is not the main goal for general-purpose software; naive loops can be very slow.
- Memory management is often inefficient, relying heavily on "copy-on-modify" semantics, which can lead to high memory consumption on large datasets.
- Package ecosystems vary in maintenance quality; multiple ways to do the same thing exist (e.g., base R vs tidyverse vs data.table).
- Outside data science, statistics, and academic research, adoption in generic software engineering is much smaller.
- Multiple Object-Oriented systems (S3, S4, R6, Reference Classes) can cause confusion and steep learning curves.

## Best For
- Statistical analysis, academic research, and rigorous hypothesis testing.
- Exploratory data analysis (EDA) and robust data wrangling workflows.
- Publication-quality data visualization and scientific reporting.
- Bioinformatics, computational biology, and genomics.
- Developing interactive dashboards (via Shiny) for non-technical stakeholders.

## Real Examples
- Academic research, biostatistics, and epidemiology (e.g., tracking disease outbreaks).
- Pharma clinical trials and heavily regulated analysis workflows (R is widely accepted by the FDA).
- Financial risk modeling, quantitative finance, and actuarial work.
- Data journalism (e.g., FiveThirtyEight, BBC News, The Economist).
- E-commerce analytics and customer behavior modeling.

## Use Cases
- Statistical research, A/B testing, and biostatistics.
- Visualization-heavy reporting and interactive dashboards.
- Genomics and DNA sequence analysis.
- Natural Language Processing (text mining) and Sentiment Analysis.
- Time series forecasting and econometrics.
- Machine Learning (using tidymodels, caret, mlr, or h2o).

---

## Extended Syntax & Features

R has a unique syntax that reflects its heritage from the S language and Scheme. Its design revolves around data analysis, making certain operations incredibly concise.

### Basic Data Types and Data Structures
R's fundamental data types are atomic vectors. There are no true "scalars" in R; a single number is just a vector of length 1.
- **Logical:** `TRUE`, `FALSE`, `T`, `F`, `NA` (R's handling of missing values natively is a massive advantage).
- **Integer:** Whole numbers, denoted by an `L` suffix (e.g., `1L`, `42L`).
- **Double/Numeric:** Floating-point numbers (e.g., `3.14`, `1`).
- **Character:** Strings (e.g., `"hello"`, `'world'`).
- **Complex:** Complex numbers (e.g., `3 + 2i`).
- **Raw:** Raw bytes.

R provides several compound data structures:
- **Vectors:** 1-dimensional arrays of the same type. Created with `c()`.
- **Matrices:** 2-dimensional arrays of the same type. Created with `matrix()`.
- **Arrays:** N-dimensional arrays of the same type. Created with `array()`.
- **Lists:** 1-dimensional collections that can hold elements of different types (including other lists, making them recursive). Created with `list()`.
- **Data Frames:** 2-dimensional tabular data where each column can be a different type, but all columns must have the same length. Essentially a list of equal-length vectors. Created with `data.frame()`.
- **Factors:** Used to represent categorical data. Can be ordered or unordered. Created with `factor()`. Important for statistical modeling.

### Control Flow
R supports standard control flow structures, though vectorization is usually preferred over loops.
- **if / else:** Standard conditional execution.
- **ifelse():** A vectorized version of if-else, excellent for transforming vectors based on a condition without writing a loop.
- **for loops:** Iterate over elements in a vector or list.
- **while loops:** Execute as long as a condition is TRUE.
- **repeat loops:** Execute indefinitely until a `break` statement is encountered.

### Functions and Lexical Scoping
Functions in R are first-class objects. They are created using the `function` keyword.
R uses lexical scoping, meaning that free variables within a function are resolved in the environment where the function was defined, not where it was called. This is a powerful feature inherited from Scheme.
Functions support default arguments, lazy evaluation (arguments are only evaluated if they are actually used), and the `...` (ellipsis) argument to capture any number of additional arguments and pass them to other functions.

### The Pipe Operator
A transformative feature in modern R is the pipe operator, which makes code read logically from left to right.
- **`%>%` (magrittr pipe):** Popularized by the tidyverse. It passes the result of the left-hand side as the first argument to the function on the right-hand side. `x %>% f(y)` is equivalent to `f(x, y)`.
- **`|>` (base R pipe):** Introduced in R 4.1.0, it works similarly to the magrittr pipe but is built into the language itself, offering slight performance improvements and requiring fewer dependencies.

### Object-Oriented Systems
R has multiple object-oriented systems, which can be daunting for beginners:
- **S3:** The simplest and most common system. It relies on generic functions and method dispatch based on an object's `class` attribute. It is informal; you can simply assign a class attribute to any object (e.g., `class(obj) <- "my_class"`).
- **S4:** A more formal and rigorous system with formal class definitions, slots, and multiple dispatch (methods can depend on the classes of multiple arguments). Used heavily in Bioconductor.
- **R6:** An encapsulated OOP system similar to classes in Python or Java. It features mutable objects and reference semantics, unlike S3 and S4 which typically use copy-on-modify.

---

## Advanced Concepts

### Environments and the Search Path
An environment in R is a data structure that binds names to values. It consists of a frame (a dictionary of name-value pairs) and an enclosure (a pointer to a parent environment).
When you type a variable name, R looks for it in the current environment. If it doesn't find it, it looks in the parent environment, and so on, until it reaches the empty environment. This sequence of environments is called the search path.
The `search()` function shows the current search path, which typically starts with the global environment (`.GlobalEnv`), followed by loaded packages, and ends with the base package.

### Non-Standard Evaluation (NSE) / Metaprogramming
R is highly homoiconic. Code can be represented as abstract syntax trees (ASTs) using "calls" and "expressions."
Non-standard evaluation allows functions to evaluate code in specific environments or to capture the expression the user typed rather than its value. This is how packages like `dplyr` allow you to use bare column names (e.g., `select(df, column_name)`) without quotes.
Key functions for NSE include `quote()`, `substitute()`, `eval()`, and tools provided by the modern `rlang` package (like `enquo()` and `!!` the unquote operator).

### Memory Management: Copy-on-Modify
R generally uses "copy-on-modify" semantics. When you assign an object to a new name, R doesn't immediately copy the data in memory; it points the new name to the existing data. However, if you modify one of the objects, R will create a copy before making the modification.
This can lead to performance bottlenecks in `for` loops if you are constantly modifying an object (e.g., growing a vector or a data frame row-by-row), as R will repeatedly copy the entire object in memory.

### Functional Programming and Vectorization
Instead of writing explicit `for` loops, R programmers rely heavily on functional programming constructs.
- **Base R `apply` family:** `lapply()` (list apply), `sapply()` (simplified apply), `vapply()`, `apply()` (for matrices/arrays), and `tapply()` (ragged arrays).
- **The `purrr` package:** Provides a more consistent and robust set of functional programming tools (`map()`, `map_lgl()`, `map_df()`, etc.) that are type-stable compared to base R's `sapply`.

Vectorization means writing operations that apply to whole vectors at once. Since the core of R is implemented in C, vectorized operations push the loop down into compiled C code, making it orders of magnitude faster than equivalent R-level loops.

### Extending R with C/C++
Because R is interpreted and can be slow for iterative algorithms or complex simulations, performance-critical code is often written in C, C++, or Fortran. The `Rcpp` package has made it incredibly easy to integrate C++ code into R. It handles the mapping between R data types and C++ data types, allowing you to write a C++ function and seamlessly call it from an R script.

---

## Ecosystem & Tooling

R's power lies in its vast, specialized, and academically rigorous ecosystem of packages.

### Repositories
- **CRAN (Comprehensive R Archive Network):** The primary repository for R packages. It has strict checks for package submission, ensuring a baseline of quality, documentation, and cross-platform compatibility. It hosts over 19,000 packages covering almost every statistical technique imaginable.
- **Bioconductor:** A repository specifically for bioinformatics and computational biology packages. It has a stricter review process than CRAN and enforces specific data structures (like `SummarizedExperiment`) to ensure interoperability between packages.

### The Tidyverse
The tidyverse is an opinionated collection of R packages designed for data science. All packages share an underlying design philosophy, grammar, and data structures. It has largely revolutionized how R is taught and used.
- **dplyr:** A grammar of data manipulation (select, filter, mutate, summarize, arrange).
- **ggplot2:** A grammar of graphics for declarative data visualization.
- **tidyr:** Tools for creating "tidy" data (pivoting, unnesting).
- **readr:** Fast and friendly ways to read rectangular data (CSV, TSV).
- **purrr:** Functional programming toolkit.
- **tibble:** A modern, stricter reimagining of the data frame.
- **stringr:** String manipulation built on top of stringi.
- **forcats:** Tools for dealing with categorical variables (factors).

### data.table
An alternative to dplyr, `data.table` provides a high-performance version of base R's data.frame. It is incredibly fast for reading, aggregating, and joining massive datasets (often in the tens of gigabytes), using a concise, albeit slightly cryptic, syntax. Crucially, it can modify data by reference, which makes it exceptionally memory efficient.

### Environments and Reporting
- **RStudio / Posit:** The absolute dominant IDE for R. It provides an incredible developer experience with built-in tools for debugging, package development, Git integration, profiling, and document rendering. Posit (formerly RStudio) is the company driving much of the modern R ecosystem.
- **R Markdown & Quarto:** Tools for literate programming. They allow you to weave narrative text, code chunks, and output (plots, tables) into a single document, which can be rendered to HTML, PDF, Word, or interactive presentations. Quarto is the next-generation, language-agnostic evolution of R Markdown.
- **Shiny:** A reactive web application framework for R. It allows you to build sophisticated, interactive web apps directly from R code without needing to know HTML, CSS, or JavaScript.

### Tooling for Package Development
- **devtools:** A suite of tools that automate common tasks in package development.
- **roxygen2:** Inline documentation generator (similar to Doxygen), which parses specially formatted comments to create `.Rd` documentation files and the `NAMESPACE` file automatically.
- **testthat:** The standard framework for unit testing in R.
- **renv:** A dependency management tool for R, creating isolated, project-specific environments to ensure reproducibility (analogous to virtual environments in Python).

---

## Code Examples

### 1. Basics, Vectors, and Vectorization
```r
# Assignment and basic arithmetic
x <- 10
y <- 5
z <- x + y

# Vectors are the fundamental unit in R
vec <- c(1, 2, 3, 4, 5)

# Vectorized operations (no explicit loops needed!)
# This squares every element in the vector instantly
squared_vec <- vec^2
# [1]  1  4  9 16 25

# Filtering with logical vectors (Boolean indexing)
even_numbers <- vec[vec %% 2 == 0]
# [1] 2 4

# Missing value handling
vec_with_na <- c(1, 2, NA, 4)
mean(vec_with_na)          # Returns NA
mean(vec_with_na, na.rm = TRUE) # Returns 2.333333
```

### 2. Working with Data Frames
```r
# Creating a data frame manually
df <- data.frame(
  id = 1:3,
  name = c("Alice", "Bob", "Charlie"),
  score = c(85, 92, 78),
  stringsAsFactors = FALSE # Modern R defaults this to FALSE
)

# Accessing columns
df$name           # Using the $ operator (returns a vector)
df[["score"]]     # Using double bracket subsetting (returns a vector)
df["score"]       # Single bracket (returns a 1-column data frame)

# Subsetting rows and columns (Row, Column)
df[1:2, c("name", "score")]

# Adding a new derived column
df$passed <- df$score >= 80

print(df)
```

### 3. Data Manipulation with dplyr and The Pipe
```r
library(dplyr)

# Using the built-in mtcars dataset
# We use the pipe %>% to pass the data through a series of transformations
mtcars_summary <- mtcars %>%
  filter(cyl %in% c(4, 6)) %>%
  mutate(weight_kg = wt * 453.592) %>% # Create a new column
  group_by(cyl) %>%                    # Group by number of cylinders
  summarize(
    avg_mpg = mean(mpg),
    avg_weight = mean(weight_kg),
    count = n()                        # Number of observations per group
  ) %>%
  arrange(desc(avg_mpg))               # Sort descending by avg_mpg

print(mtcars_summary)
```

### 4. Data Visualization with ggplot2
```r
library(ggplot2)

# ggplot uses a grammar of graphics: data + aesthetics + geometries
plot <- ggplot(mtcars, aes(x = wt, y = mpg, color = factor(cyl))) +
  geom_point(size = 3, alpha = 0.8) +
  geom_smooth(method = "lm", se = FALSE, color = "black", linetype = "dashed") +
  labs(
    title = "Car Weight vs. Fuel Efficiency",
    subtitle = "Analysis of the mtcars dataset",
    x = "Weight (1000 lbs)",
    y = "Miles/(US) gallon",
    color = "Cylinders"
  ) +
  theme_minimal() + 
  theme(legend.position = "bottom")

# print(plot) # This renders the plot in the RStudio viewer or saves it
# ggsave("my_plot.png", plot, width = 8, height = 6)
```

### 5. Functional Programming with purrr
```r
library(purrr)

# A list of datasets (or vectors, models, etc.)
datasets <- list(
  a = c(1, 2, 3),
  b = c(4, 5, 6, NA),
  c = c(7, 8, 9)
)

# Calculate the mean of each element, removing NAs
# map_dbl ensures the output is a strict numeric vector, not a list
means <- map_dbl(datasets, mean, na.rm = TRUE)
print(means)
#        a        b        c 
# 2.000000 5.000000 8.000000

# Iterating over multiple arguments with map2 or pmap
x_vals <- list(1, 2, 3)
y_vals <- list(10, 20, 30)
map2_dbl(x_vals, y_vals, ~ .x + .y) # Anonymous function using ~
# [1] 11 22 33
```

### 6. Linear Modeling and Statistical Tests
```r
# R's formula interface (y ~ x) is incredibly powerful
# Fit a multiple linear regression model
model <- lm(mpg ~ wt + hp + factor(cyl), data = mtcars)

# View a detailed statistical summary (p-values, R-squared, etc.)
summary(model)

# Perform an Analysis of Variance (ANOVA)
anova(model)

# Extract specific components
coef(model)       # Model coefficients
head(resid(model)) # Residuals
head(fitted(model)) # Fitted values

# Predict on new data
new_data <- data.frame(wt = 3.0, hp = 150, cyl = 4)
predict(model, newdata = new_data, interval = "confidence")
```

### 7. Creating Functions and Lazy Evaluation
```r
# A custom function with default arguments
calculate_ci <- function(data, conf_level = 0.95) {
  n <- length(data)
  mean_val <- mean(data, na.rm = TRUE)
  se <- sd(data, na.rm = TRUE) / sqrt(n)
  
  # Quantile for t-distribution
  alpha <- 1 - conf_level
  t_score <- qt(1 - alpha/2, df = n - 1)
  
  margin_error <- t_score * se
  return(c(lower = mean_val - margin_error, mean = mean_val, upper = mean_val + margin_error))
}

# Usage
set.seed(123)
sample_data <- rnorm(100, mean = 50, sd = 10)
calculate_ci(sample_data)
```

### 8. Metaprogramming (Non-Standard Evaluation)
```r
library(rlang)
library(dplyr)

# A custom wrapper around dplyr functions using NSE
# We use {{ }} (embrace) to interpolate the unquoted argument
custom_summary <- function(df, group_var, summary_var) {
  df %>%
    group_by({{ group_var }}) %>%
    summarize(
      mean_val = mean({{ summary_var }}, na.rm = TRUE),
      count = n()
    )
}

# We can pass the column names unquoted!
custom_summary(mtcars, cyl, mpg)
```

### 9. Object-Oriented Programming (S3 System)
```r
# Create an S3 object (just a list with a class attribute)
create_person <- function(name, age) {
  obj <- list(name = name, age = age)
  class(obj) <- "person"
  return(obj)
}

# Define an S3 generic function
greet <- function(x) {
  UseMethod("greet")
}

# Define a method for the 'person' class
greet.person <- function(x) {
  cat("Hello, my name is", x$name, "and I am", x$age, "years old.\n")
}

# Define a default fallback method
greet.default <- function(x) {
  cat("I don't know how to greet this object.\n")
}

p <- create_person("Alice", 30)
greet(p)
# Output: Hello, my name is Alice and I am 30 years old.

# R's built-in print() is just an S3 generic!
```

### 10. High-Performance computing with Rcpp
```cpp
// This C++ code would be saved in a file e.g., sum_rcpp.cpp
// and compiled dynamically into R via Rcpp::sourceCpp("sum_rcpp.cpp")

#include <Rcpp.h>
using namespace Rcpp;

// [[Rcpp::export]]
double fast_sum(NumericVector x) {
  int n = x.size();
  double total = 0;
  for(int i = 0; i < n; ++i) {
    if (!NumericVector::is_na(x[i])) { // Handle R's NA values
      total += x[i];
    }
  }
  return total;
}
```

---

## Best Practices

1. **Maximize Vectorization:** Avoid explicit `for` loops when iterating over elements of vectors or matrices. Rely on vectorized operations (e.g., `x * y`) or the `apply` family / `purrr` package. This pushes execution down to optimized C code, significantly improving performance.
2. **Pre-allocate Memory:** If you *must* use a `for` loop to build a vector or list sequentially, pre-allocate it to its full expected size before the loop begins. Growing an object iteratively (e.g., `res <- c(res, new_val)`) forces R to copy the entire object on every single iteration, leading to exponential slowdowns.
3. **Follow a Consistent Style Guide:** Adopt a consistent coding style to ensure readability. The [tidyverse style guide](https://style.tidyverse.org/) is the de facto standard in modern R programming. Use the `styler` package to format your code automatically and `lintr` to catch style issues.
4. **Use Projects and `here` for Paths:** Never use absolute paths like `setwd("C:/Users/.../Data")`. This makes your code break on any other machine. Use RStudio Projects or the `here` package to construct robust, relative file paths.
5. **Manage Dependencies with `renv`:** R package updates can sometimes break older code. Use the `renv` package to create isolated, reproducible environments that track exactly which package versions were used for a specific project.
6. **Embrace Literate Programming (R Markdown/Quarto):** For any analysis, reporting, or EDA, weave your code, results, and narrative into a single reproducible document. This makes it trivial to re-run your entire analysis when underlying data changes or you need to share results with colleagues.
7. **Prefer "Tidy" Data Principles:** Organize your data frames such that each variable is a column, each observation is a row, and each type of observational unit is a table. This format perfectly aligns with the logic of `dplyr` and `ggplot2`, drastically reducing the friction in your analysis workflow.
8. **Document Code Thoroughly:** When writing reusable scripts or packages, use `roxygen2` tags to document function inputs, outputs, and side effects. Even for personal scripts, clear comments explaining *why* a decision was made are invaluable.
9. **Set Random Seeds for Reproducibility:** For any operation involving random number generation (e.g., sampling, partitioning data for machine learning, Monte Carlo simulations), always use `set.seed()` at the start of your script to guarantee that the results can be exactly replicated.
10. **Fail Gracefully with Error Handling:** Use `tryCatch()` to handle potential errors in long-running batch processes or loops, preventing an entire pipeline from crashing due to a single unexpected, corrupted data point. Leverage `stop()`, `warning()`, and `message()` appropriately to communicate state to the user.
