---
tags: [programming-language, systems, compiled, scientific, numerical-computing]
category: Systems
status: to-learn
---

# Fortran

**Definition:** One of the oldest high-level languages, purpose-built for numerical, array-heavy, and scientific computing, with modern revisions adding modules, derived types, and parallel features.

**Paradigm:** Procedural (modern Fortran adds OOP and generic programming) | **Typing:** Static

## Pros
- Array syntax and intrinsic math functions let compilers vectorize aggressively.
- Alias rules are simpler than C, which helps optimization in numerical kernels.
- BLAS, LAPACK, and many linear algebra backends were built in Fortran and remain performance anchors.
- Multidimensional arrays and column-major order are first-class, which fits scientific workloads.
- Coarrays and MPI/OpenMP integration make it practical for HPC workloads.
- Excellent backward compatibility; code written in Fortran 77 can often still compile.
- Strong support for floating-point arithmetic standards.
- Advanced memory handling with automatic arrays and allocatable components in derived types.

## Cons
- Legacy fixed-form code can be hard to read and maintain.
- The community is small and concentrated in HPC and academia.
- 1-based indexing and implicit typing are easy sources of mistakes in old code.
- General-purpose ecosystem support is thin outside numerics (e.g., networking, web, GUI).
- Tooling has improved, but is still narrower than mainstream languages like Python, Rust, or C++.
- The learning curve for modern object-oriented features can be steep due to non-standard syntax compared to other OOP languages.
- Parsing strings and performing complex string manipulations can be tedious compared to more modern languages.

## Best For
- Numerical simulations and large-scale linear algebra.
- Legacy scientific and engineering codebases with validated numerical routines.
- HPC workloads that run across clusters with MPI, OpenMP, or coarrays.
- Code optimization targeting parallel vector processing.
- Core math libraries meant to be bound into high-level dynamic languages.

## Real Examples
- Global weather prediction models used by meteorological and research institutions (e.g., GFS, WRF).
- Physics and climate simulations run on supercomputers (e.g., POP, CICE).
- LAPACK and BLAS, which underpin many scientific tools (NumPy, MATLAB, R).
- Legacy aerospace and structural analysis systems that are still maintained (e.g., Nastran).
- Quantum chemistry software (e.g., Gaussian, NWChem).

## Use Cases
- Climate and weather modeling.
- Computational physics, CFD (Computational Fluid Dynamics), and numerical solvers.
- Aerospace and structural engineering code.
- Scientific libraries called from Python, R, or Julia via FFI (Foreign Function Interface) or `iso_c_binding`.
- Plasma physics and molecular dynamics simulations.

---

## Extended Syntax & Features

Fortran has undergone significant evolution. While older iterations (Fortran 77 and earlier) used a fixed-column format, modern Fortran (90, 95, 2003, 2008, 2018) uses free-form source code and introduces many modern programming paradigms.

### Basic Data Types
Modern Fortran has five intrinsic data types:
1. `integer`: Whole numbers.
2. `real`: Floating-point numbers.
3. `complex`: Complex numbers (pairs of reals).
4. `logical`: Boolean values (`.true.` or `.false.`).
5. `character`: Strings and characters.

Additionally, Fortran supports "kind parameters" to explicitly specify precision (e.g., double precision).

### Variables and Implicit Typing
Historically, Fortran used implicit typing based on the first letter of a variable name (`i` through `n` were integers). Modern practice dictates disabling this with `implicit none`.

### Control Flow
Fortran supports standard control flow mechanisms:
- `if` / `else if` / `else` / `end if`
- `select case` / `case` / `end select`
- `do` loops (which replace the need for `while` or `for` loops in other languages). Fortran's `do` loops are highly optimized for array processing.
- `exit` and `cycle` statements provide control within loops, analogous to `break` and `continue`.

### Modules and Procedures
- **Modules**: The modern way to group related variables, derived types, and procedures. They provide namespaces and allow for information hiding (`public` and `private` visibility).
- **Subroutines vs. Functions**: 
  - `subroutine`: Used for procedures that perform actions or return multiple values via arguments (often `intent(out)` or `intent(inout)`).
  - `function`: Used for procedures that compute and return a single value.

### Array Syntax
Fortran treats arrays as first-class citizens. You can perform operations on whole arrays or array sections without explicit loops. This array syntax is highly parallelizable and vectorizable by compilers. Arrays in Fortran are stored in **column-major order**, a critical distinction from C/C++ row-major order.

---

## Advanced Concepts

### Memory Management and Allocatables
Modern Fortran uses the `allocatable` attribute for dynamic memory management. Unlike raw pointers in C/C++, `allocatable` arrays automatically deallocate when they go out of scope, preventing memory leaks.
- Allocation is done via the `allocate` statement.
- Deallocation is done via `deallocate` (or automatically at scope exit).
- Reallocation on assignment: Since Fortran 2003, assigning to an unallocated allocatable variable automatically allocates it with the correct shape and bounds.

### Object-Oriented Programming (OOP)
Fortran 2003 introduced full OOP capabilities:
- **Derived Types**: Similar to `struct` in C, but can have type-bound procedures (methods).
- **Type Extension (Inheritance)**: You can extend existing derived types.
- **Polymorphism**: Achieved using the `class` keyword and `select type` constructs.
- **Data Hiding**: Controlling access with `public` and `private`.

### Interoperability with C
Fortran 2003 introduced the intrinsic module `iso_c_binding`, which standardizes interoperability with C. It allows Fortran to define variables with C-compatible types and call C functions directly (and vice versa) without compiler-specific tricks.

### Concurrency and Parallelism
Fortran excels in high-performance computing, offering multiple ways to parallelize code:
- **Coarrays (Fortran 2008/2018)**: A native language feature for SPMD (Single Program, Multiple Data) parallel programming. It extends array syntax to distribute data across multiple "images" (processes).
- **OpenMP**: Standard pragmas (`!$omp`) for shared-memory multithreading.
- **MPI (Message Passing Interface)**: Standard libraries for distributed-memory parallelism on supercomputing clusters.
- **`do concurrent`**: A built-in construct indicating to the compiler that loop iterations have no inter-dependencies and can be executed safely in parallel.

### Pointers
Fortran pointers are not memory addresses like in C. They are "aliases" to existing targets. A variable must have the `target` attribute to be pointed to. This strict aliasing enables better compiler optimization because the compiler can safely assume non-pointer variables do not alias.

---

## Ecosystem & Tooling

While Fortran's ecosystem isn't as expansive for general-purpose programming as Python's or JavaScript's, its tooling for numerical and scientific work is robust.

### Compilers
- **GNU Fortran (`gfortran`)**: Part of GCC, highly standard-compliant, free, and widely used across all platforms.
- **Intel Fortran (`ifort` / `ifx`)**: Industry standard for x86/HPC performance, offering excellent optimization and OpenMP support.
- **NVIDIA HPC SDK (`nvfortran`)**: Focuses on GPU offloading (OpenACC, CUDA Fortran).
- **LLVM Flang (`flang`)**: The emerging LLVM-based Fortran compiler, rapidly gaining modern feature support.

### Build Systems and Package Managers
- **Fortran Package Manager (`fpm`)**: Inspired by Rust's Cargo, `fpm` is the modern, community-driven package manager and build system for Fortran. It simplifies dependency management, testing, and building.
- **CMake**: The traditional standard for building complex Fortran projects, often mixed with C/C++.
- **Make**: Still heavily used in legacy projects.

### Libraries and Frameworks
- **BLAS / LAPACK**: The absolute standard for linear algebra.
- **stdlib (Fortran Standard Library)**: A community-driven project aiming to provide standard, general-purpose utilities (string manipulation, OS interactions, file I/O, sorting) that are missing from the core language standard.
- **HDF5 / NetCDF**: Standard libraries for massive scientific data I/O.
- **PETSc**: Framework for solving partial differential equations.

---

## Code Examples

### 1. The Basics: Hello World and Variables
Demonstrates basic structure, `implicit none`, and I/O.

```fortran-free-form
program hello_world
    ! Always use this to prevent accidental variable creation due to typos
    implicit none
    
    ! Variable declarations
    character(len=20) :: name
    integer :: age
    real :: height
    
    name = "Fortran Developer"
    age = 65
    height = 1.85
    
    ! Basic output
    print *, "Hello, World!"
    print *, "Name: ", trim(name)
    print *, "Age: ", age
    print *, "Height: ", height
    
end program hello_world
```

### 2. Array Syntax and Vectorization
Fortran's superpower. Array operations are concise and compiler-optimized.

```fortran-free-form
program array_features
    implicit none
    
    ! Allocatable 1D and 2D arrays
    real, allocatable :: vec_a(:), vec_b(:), vec_c(:)
    real, allocatable :: matrix(:, :)
    integer :: i
    
    ! Allocate arrays
    allocate(vec_a(100), vec_b(100), vec_c(100))
    allocate(matrix(10, 10))
    
    ! Initialize using implicit loops or random numbers
    call random_number(vec_a)
    call random_number(vec_b)
    
    ! Vectorized addition - no loop required!
    ! The compiler can heavily optimize this
    vec_c = vec_a + vec_b
    
    ! Array sections / Slicing
    ! Assign first 5 elements of vec_c to 1.0
    vec_c(1:5) = 1.0
    
    ! Initialize a matrix
    matrix = 0.0
    ! Assign 1.0 to the diagonal
    do i = 1, 10
        matrix(i, i) = 1.0
    end do
    
    print *, "Matrix trace: ", sum([(matrix(i,i), i=1,10)])
    
    ! Automatic deallocation happens at the end of scope
end program array_features
```

### 3. Modules and Derived Types (Structs)
Modern grouping of data and functions.

```fortran-free-form
module geometry_mod
    implicit none
    private ! Hide everything by default
    
    ! Expose specific types and functions
    public :: point, calculate_distance
    
    ! Define a derived type (similar to a struct)
    type :: point
        real :: x = 0.0
        real :: y = 0.0
    end type point

contains

    ! Module procedure
    real function calculate_distance(p1, p2)
        ! intent(in) ensures p1 and p2 cannot be modified
        type(point), intent(in) :: p1, p2
        calculate_distance = sqrt((p2%x - p1%x)**2 + (p2%y - p1%y)**2)
    end function calculate_distance

end module geometry_mod

program test_geometry
    use geometry_mod
    implicit none
    
    type(point) :: a, b
    
    a%x = 0.0; a%y = 0.0
    b%x = 3.0; b%y = 4.0
    
    print *, "Distance: ", calculate_distance(a, b)
end program test_geometry
```

### 4. Object-Oriented Programming
Fortran 2003 OOP with type-bound procedures and polymorphism.

```fortran-free-form
module shape_mod
    implicit none
    
    ! Abstract base class
    type, abstract :: shape
    contains
        ! Deferred binding (pure virtual function)
        procedure(calc_area), deferred, pass :: area
    end type shape
    
    ! Interface for the deferred procedure
    abstract interface
        real function calc_area(this)
            import :: shape
            class(shape), intent(in) :: this
        end function calc_area
    end interface

    ! Concrete derived class
    type, extends(shape) :: circle
        real :: radius
    contains
        ! Implementation of the deferred procedure
        procedure, pass :: area => circle_area
    end type circle

contains

    real function circle_area(this)
        class(circle), intent(in) :: this
        real, parameter :: pi = 3.14159265359
        circle_area = pi * this%radius**2
    end function circle_area

end module shape_mod

program test_oop
    use shape_mod
    implicit none
    
    ! Polymorphic pointer (class)
    class(shape), allocatable :: my_shape
    
    ! Allocate as a specific concrete type
    allocate(circle :: my_shape)
    
    select type(my_shape)
    type is (circle)
        my_shape%radius = 5.0
    end select
    
    ! Dynamic dispatch calls circle_area
    print *, "Area of shape: ", my_shape%area()
    
end program test_oop
```

### 5. C Interoperability
Calling a standard C math function from Fortran.

```fortran-free-form
program c_interop
    ! Use the intrinsic module for C bindings
    use iso_c_binding, only: c_double
    implicit none
    
    ! Define interface to C library function 'sin'
    interface
        function c_sin(x) bind(c, name="sin")
            import :: c_double
            real(c_double), value :: x
            real(c_double) :: c_sin
        end function c_sin
    end interface
    
    real(c_double) :: angle, result
    
    angle = 3.14159265359_c_double / 2.0_c_double
    result = c_sin(angle)
    
    print *, "sin(pi/2) via C interop = ", result
    
end program c_interop
```

### 6. Parallel Programming: Coarrays
A simple example of Fortran's native parallel capability (requires compiler flags like `-fcoarray=single` or `-fcoarray=lib` for OpenCoarrays).

```fortran-free-form
program hello_coarrays
    implicit none
    
    ! A coarray variable, denoted by [*]
    integer :: my_value[*]
    
    ! Get the index of the current image (process)
    integer :: me, total_images
    
    me = this_image()
    total_images = num_images()
    
    ! Assign a local value on each image
    my_value = me * 10
    
    ! Ensure all images have completed assignment
    sync all
    
    ! Image 1 reads values from all other images
    if (me == 1) then
        print *, "Total images running: ", total_images
        print *, "Value on image 1 is: ", my_value
        if (total_images > 1) then
            print *, "Value on image 2 is: ", my_value[2]
        end if
    end if
    
end program hello_coarrays
```

### 7. File I/O and Formatting
Demonstrates reading from and writing to files using formatted I/O.

```fortran-free-form
program file_io
    implicit none
    
    integer :: unit_num, i
    integer :: io_status
    real :: data_val
    character(len=100) :: io_msg
    
    ! 1. Writing to a file
    open(newunit=unit_num, file="data.txt", status="replace", action="write")
    
    ! Write a header
    write(unit_num, '(A)') "Index, Value"
    
    ! Write formatted data
    do i = 1, 5
        write(unit_num, '(I4, A, F8.3)') i, ", ", real(i)*1.5
    end do
    
    close(unit_num)
    print *, "Data written to data.txt"
    
    ! 2. Reading from a file
    open(newunit=unit_num, file="data.txt", status="old", action="read")
    
    ! Skip the header line
    read(unit_num, *) 
    
    print *, "Reading data back:"
    do
        ! Read format matches the write format
        read(unit_num, *, iostat=io_status, iomsg=io_msg) i, data_val
        
        ! Check for End Of File (EOF) or errors
        if (io_status < 0) exit ! EOF
        if (io_status > 0) then
            print *, "Error reading file: ", trim(io_msg)
            exit
        end if
        
        print *, "Read: i = ", i, " val = ", data_val
    end do
    
    close(unit_num)
    
end program file_io
```

---

## Best Practices

### Always Use `implicit none`
Legacy Fortran implicitly typed variables starting with I, J, K, L, M, N as integers, and everything else as reals. This is the source of legendary bugs. Start every program, module, and interface with `implicit none`.

### Use Modules Instead of Common Blocks
Avoid `common` blocks, which are remnants of Fortran 77. They are error-prone and circumvent type checking. Use `module` constructs for sharing data globally or passing shared state between subroutines.

### Modern Precision Control
Instead of using non-standard `real*8` or assuming `double precision` does what you want across architectures, use `iso_fortran_env` to guarantee precision.

```fortran-free-form
use iso_fortran_env, only: dp => real64
real(dp) :: accurate_variable
```

### Prefer Allocatable Arrays Over Pointers
In Fortran, pointers are for aliasing existing memory, not for dynamic memory allocation. Always use `allocatable` for dynamically sized arrays. The compiler manages the memory for you, preventing memory leaks, and `allocatable` variables don't inhibit compiler optimizations like pointers do (due to potential aliasing).

### Explicit Intents for Arguments
Always declare `intent(in)`, `intent(out)`, or `intent(inout)` for dummy arguments in subroutines and functions. This acts as documentation, prevents accidental modification of input variables, and allows the compiler to optimize data movement.

### Free-Form Source
Never write new code in fixed-form (the 72-column punch-card format ending in `.f` or `.F`). Always use free-form source (files ending in `.f90`, `.f03`, `.f08`, `.f18`). The compiler uses the extension to determine formatting rules.

### Array Syntax for Performance
Use array operations and intrinsic functions (like `sum`, `dot_product`, `matmul`) instead of manual `do` loops where possible. The compiler often optimizes these to highly efficient, vectorized machine code or links them to heavily optimized backend libraries like BLAS.

### Pass by Reference vs Value
Remember that Fortran passes arguments by reference by default (unlike C). When interoperating with C, you must often use the `value` attribute for arguments that C expects by value.

### Use `fpm` for New Projects
Avoid writing raw Makefiles or CMake for small to medium pure-Fortran projects. The Fortran Package Manager (`fpm`) is the modern standard, making dependency handling, testing, and building drastically simpler for the modern era.
