---
tags: [programming-language, systems, low-level, cpu-architecture, reverse-engineering]
category: Systems
status: to-learn
---

# Assembly (x86 / x86-64)

**Definition:** Human-readable mnemonic form of CPU machine code, specific to one instruction set architecture and assembled directly into executable instructions.

**Paradigm:** Imperative, low level, no abstraction layer | **Typing:** None (raw bytes in registers/memory — the assembler tracks operand size, not type)

## Pros
- Maximum control over registers, flags, addressing modes, and calling conventions.
- No runtime means no GC pauses, JIT warm-up, or hidden allocation behavior.
- Architecture-specific instructions let you use SIMD, syscalls, and privileged operations directly.
- Useful for understanding compiler output and optimizing hot paths that C/C++ abstractions obscure.
- Deterministic behavior is valuable in firmware, kernels, and reverse-engineering work.

## Cons
- Extremely verbose for almost any nontrivial task.
- Not portable across ISAs or even across syntax conventions within the same ISA.
- No type system, no bounds checks, and no automatic register preservation.
- Stack alignment, calling convention rules, and callee-saved registers must be tracked manually.
- Refactoring is fragile because every instruction may depend on exact offsets and register lifetimes.

## Best For
- Bootloaders and tiny embedded systems with no room for a runtime.
- Reverse engineering, malware analysis, and binary patching.
- Hot loops or kernels where the compiler cannot emit the exact sequence required.
- Startup code, interrupt handlers, syscall stubs, and context switches.

## Real Examples
- BIOS and UEFI initialization paths.
- Linux kernel entry code and low-level runtime start-up routines.
- Hand-tuned libc routines for memcpy, strlen, and similar primitives.
- Game console homebrew, ROM hacking, and exploit research.
- CTF reversing and exploit-development challenges.

## Use Cases
- Reverse engineering and security research.
- Compiler and OS bootstrapping code.
- Debugging optimized binaries when source-level stepping is misleading.
- Firmware for microcontrollers and other byte-constrained environments.

## Extended Syntax & Features

### Registers
Registers are small, ultra-fast storage locations directly within the CPU. In the x86-64 architecture, the most important ones include:
- **General Purpose Registers (GPRs)**: `RAX`, `RBX`, `RCX`, `RDX`, `RSI`, `RDI`, `RBP`, `RSP`, and `R8` through `R15`.
- **Register Sub-parts**: You can access smaller chunks of a 64-bit register. For example, `RAX` is 64-bit; `EAX` is the lower 32 bits; `AX` is the lower 16 bits; `AL` is the lowest 8 bits.
- **Instruction Pointer (`RIP`)**: Contains the memory address of the next instruction to be executed by the CPU.
- **Flags Register (`RFLAGS`)**: A collection of boolean status flags updated automatically by arithmetic and logical operations. Key flags include the Zero Flag (ZF), Carry Flag (CF), Overflow Flag (OF), and Sign Flag (SF).
- **Vector / SIMD Registers**: `XMM0`-`XMM15` (128-bit), `YMM0`-`YMM15` (256-bit), `ZMM0`-`ZMM31` (512-bit) used for vectorized mathematical and cryptographic operations.

### Basic Data Types and Sizes
Assembly does not have high-level types like `int`, `float`, or `string`. Instead, data is categorized purely by size:
- **BYTE**: 8 bits (equivalent to C's `char`)
- **WORD**: 16 bits (equivalent to C's `short`)
- **DWORD** (Double Word): 32 bits (equivalent to C's `int` or `float`)
- **QWORD** (Quad Word): 64 bits (equivalent to C's `long long`, `double`, or a memory pointer)
- **OWORD / YWORD**: 128 / 256 bits, used extensively in SIMD operations.

### Addressing Modes
You can manipulate data using different addressing strategies:
- **Register Addressing**: `mov rax, rbx` (Copy the contents of `rbx` into `rax`).
- **Immediate Addressing**: `mov rax, 10` (Load the constant value 10 into `rax`).
- **Direct Memory Addressing**: `mov rax, [0x400000]` (Read the QWORD at memory address `0x400000`).
- **Register Indirect Addressing**: `mov rax, [rbx]` (Read memory at the address currently held in `rbx`).
- **Complex Addressing (Base + Index * Scale + Displacement)**: `mov rax, [rbx + rcx*4 + 0x10]` (Very useful for arrays, where `rbx` is the array base pointer, `rcx` is the index, `4` is the size of an element, and `0x10` is an offset).

### Control Flow
Instead of structural loops (`for`, `while`) or conditionals (`if`), assembly uses comparisons and jumps:
- **Comparisons**: `CMP` compares two values by subtracting them silently. `TEST` performs a silent bitwise AND. Both instructions update the `RFLAGS` register.
- **Conditional Jumps**: `JE` (Jump if Equal), `JNE` (Jump if Not Equal), `JG` (Jump if Greater), `JL` (Jump if Less). These inspect `RFLAGS` and modify `RIP` if the condition is met.
- **Unconditional Jumps**: `JMP` transfers control flow to a target address unconditionally.
- **Calls and Returns**: `CALL` pushes the address of the next instruction onto the stack and jumps to a function. `RET` pops the address from the stack and jumps back.

### Stack Manipulation
The stack is a memory region that grows downwards (from higher memory addresses to lower ones) in x86 architectures.
- **PUSH**: Decrements the Stack Pointer (`RSP`) and stores a value at the new memory location.
- **POP**: Loads the value from the current `RSP` location into a register and increments `RSP`.

## Advanced Concepts

### Memory Management and Paging
At the most fundamental hardware level, memory management is performed by the CPU's Memory Management Unit (MMU) using page tables. The Operating System configures these tables to give each process an isolated virtual address space. 
In ring 3 (user space) assembly, you are simply presented with a flat 64-bit virtual memory layout. If you attempt to access an address that hasn't been mapped in the page tables, the MMU triggers a hardware exception (a page fault). The OS catches this and typically terminates the process with a Segmentation Fault (SIGSEGV). Allocating new memory requires invoking an OS system call, such as `mmap` or `brk` on Linux.

### Concurrency & Synchronization
Writing thread-safe code in assembly involves interacting with hardware-level memory guarantees and atomic instructions:
- **The `LOCK` Prefix**: Placing `LOCK` before an instruction like `ADD` or `XADD` guarantees atomicity across multiple CPU cores. It temporarily locks the memory bus (or the cache line), ensuring exclusive access to the memory address.
- **Compare and Exchange**: Instructions like `XCHG` and `CMPXCHG` are the foundational building blocks for implementing higher-level concurrency primitives, such as mutexes, spinlocks, and lock-free data structures.
- **Memory Barriers**: Modern CPUs execute instructions out of order to optimize speed. Instructions like `MFENCE`, `LFENCE`, and `SFENCE` force the CPU to synchronize memory reads and writes, preventing race conditions in multithreaded environments.

### Calling Conventions
To interact with libraries or modularize your own code, you must strictly follow a "Calling Convention." This is an agreed-upon set of rules defining how arguments are passed to functions and how return values are received.
- **System V AMD64 ABI (Linux, macOS, BSD)**: 
  - Arguments 1-6 are passed in `RDI`, `RSI`, `RDX`, `RCX`, `R8`, and `R9`.
  - Additional arguments are pushed onto the stack in reverse order.
  - Return values are placed in `RAX`.
  - The called function (callee) must preserve the state of registers `RBX`, `RBP`, and `R12` through `R15`.
- **Microsoft x64 Calling Convention (Windows)**:
  - Arguments 1-4 are passed in `RCX`, `RDX`, `R8`, and `R9`.
  - The caller must allocate 32 bytes of "shadow space" on the stack before making the call.

### Metaprogramming (Macros)
While assembly itself is extremely low-level, modern assemblers like NASM provide powerful Turing-complete macro preprocessors. Metaprogramming in assembly allows you to write conditional compilation blocks, unroll loops automatically at assemble-time, and define custom pseudo-instructions to abstract away repetitive tasks like setting up function stack frames.

## Ecosystem & Tooling

### Assemblers
- **NASM (Netwide Assembler)**: One of the most popular assemblers. It is open-source, uses Intel syntax, and features an excellent, highly flexible macro system.
- **MASM (Microsoft Macro Assembler)**: The standard assembler on Windows. It uses Intel syntax and is tightly integrated with Visual Studio and the Microsoft toolchain.
- **GAS (GNU Assembler)**: The default assembler in the GCC toolchain. Historically, it forced developers to use AT&T syntax (e.g., `mov %ebx, %eax`), though modern versions support directives for Intel syntax.
- **FASM (Flat Assembler)**: Highly respected for its blazing fast compilation speeds, clean syntax, and self-hosting capability.

### Linkers
- **ld (GNU Linker)**: The standard tool on Unix-like systems used to combine raw object files (`.o`) into executable binaries.
- **link.exe (Microsoft Linker)**: Used on Windows to link `.obj` files into `.exe` or `.dll` files.
- **lld (LLVM Linker)**: A modern, much faster alternative to `ld` provided by the LLVM project.

### Debuggers and Reverse Engineering Tools
- **GDB / LLDB**: Standard command-line debuggers. They are indispensable for inspecting registers, stepping through instructions, and dumping memory segments.
- **x64dbg**: A Windows GUI debugger that is considered the industry standard for malware analysis and binary cracking.
- **Ghidra / IDA Pro / Binary Ninja**: Advanced disassemblers and decompilers. They take compiled binary executables, parse the raw machine code back into assembly, and can often lift the assembly back into readable C-like pseudocode.

### System Interfaces
- **Direct Syscalls**: In pure assembly, you interact with the OS by setting up registers and invoking the `syscall` instruction (on x64) or `int 0x80` (on 32-bit x86).
- **libc / WinAPI**: Because raw syscalls are OS-dependent and sometimes unstable across versions, most assembly programs prefer to link dynamically against the C standard library (`libc`) or Windows API (`kernel32.dll`) to perform File I/O and process management.

## Code Examples

*Note: All examples below are written using NASM/Intel syntax targeting 64-bit Linux.*

### 1. Hello World (Direct Syscalls)
The classic Hello World program, executed using direct Linux kernel system calls instead of relying on the C standard library.

```asm
; hello.asm
; To compile and link on Linux:
; nasm -f elf64 hello.asm
; ld -o hello hello.o

section .data
    msg db 'Hello, World!', 0xA  ; The string, appended with a newline character (0xA)
    msg_len equ $ - msg          ; Calculate length (current address '$' minus start of msg)

section .text
    global _start                ; Expose entry point to the linker

_start:
    ; syscall: sys_write(fd=1, buf=msg, count=msg_len)
    mov rax, 1                   ; syscall number for sys_write (1)
    mov rdi, 1                   ; file descriptor 1 is stdout
    mov rsi, msg                 ; pointer to our string buffer
    mov rdx, msg_len             ; length of the string
    syscall                      ; invoke the OS kernel

    ; syscall: sys_exit(error_code=0)
    mov rax, 60                  ; syscall number for sys_exit (60)
    xor rdi, rdi                 ; exit code 0 (using XOR is faster and smaller than mov rdi, 0)
    syscall
```

### 2. Basic Data Structures (Arrays and Structs)
Because assembly lacks high-level struct definitions, you build them by mentally mapping out memory offsets.

```asm
section .data
    ; Define an array of five 64-bit integers (QWORDs)
    my_array dq 10, 20, 30, 40, 50
    array_len equ 5

    ; Simulate a Point Struct { x: int64, y: int64 }
    point_data:
        dq 100                   ; Point.x located at offset 0
        dq 200                   ; Point.y located at offset 8

section .text
    global _start
_start:
    ; --- Array Traversal ---
    mov rcx, array_len           ; Loop counter (RCX is idiomatic for counters)
    xor rsi, rsi                 ; Set index to 0
    xor rax, rax                 ; Set sum to 0

.sum_loop:
    ; Access memory: base_address + (index * size_of_element)
    add rax, qword [my_array + rsi * 8]
    inc rsi                      ; Increment index
    dec rcx                      ; Decrement loop counter
    jnz .sum_loop                ; Jump to .sum_loop if RCX is Not Zero

    ; --- Struct Access ---
    mov rbx, point_data          ; Load the base address of the struct into RBX
    mov rdx, [rbx + 0]           ; Read Point.x (offset 0)
    mov r8,  [rbx + 8]           ; Read Point.y (offset 8)

    ; Clean Exit
    mov rax, 60
    xor rdi, rdi
    syscall
```

### 3. Functions and System V ABI Calling Convention
Demonstrating how to properly pass arguments, build a stack frame, and return a value.

```asm
section .text
    global _start

; Function: Add three numbers
; C signature: long add_three(long a, long b, long c)
; ABI mapping: rdi (a), rsi (b), rdx (c). Return in rax.
add_three:
    ; Function Prologue (set up stack frame)
    push rbp
    mov rbp, rsp

    ; Function Body
    mov rax, rdi                 ; rax = a
    add rax, rsi                 ; rax = rax + b
    add rax, rdx                 ; rax = rax + c

    ; Function Epilogue (tear down stack frame)
    mov rsp, rbp
    pop rbp
    ret                          ; Pop return address and jump to caller

_start:
    ; Set up arguments for add_three(10, 20, 30)
    mov rdi, 10
    mov rsi, 20
    mov rdx, 30
    call add_three               ; Execute function. Result will be in RAX (60).

    ; Clean Exit
    mov rdi, rax                 ; Pass result as exit code for fun
    mov rax, 60
    syscall
```

### 4. Advanced: Concurrency (Implementing a Spinlock)
Using atomic hardware instructions to synchronize access across multiple CPU threads.

```asm
section .bss
    lock_var resd 1              ; Reserve a 32-bit variable. 0 = unlocked, 1 = locked

section .text
    global acquire_lock
    global release_lock

acquire_lock:
.try:
    mov eax, 1                   ; We want to write '1' to indicate locked state
    ; XCHG automatically asserts a hardware lock to swap EAX with memory atomically
    xchg eax, dword [lock_var]
    test eax, eax                ; Check what value we got out of memory
    jnz .spin                    ; If it wasn't 0, someone else had the lock. Go spin.
    ret                          ; We got a 0, meaning we acquired the lock. Return.

.spin:
    pause                        ; Hint to CPU that we are spinning (saves power, prevents pipeline starvation)
    cmp dword [lock_var], 0      ; Read memory without locking the bus (cache-friendly)
    je .try                      ; If it looks unlocked, try the atomic XCHG again
    jmp .spin                    ; Otherwise, keep spinning

release_lock:
    ; Releasing is just writing 0. x86 guarantees standard writes are globally visible.
    mov dword [lock_var], 0      
    ret
```

### 5. Advanced: OOP Patterns (VTable Simulation)
You can simulate polymorphism and inheritance in assembly by building Virtual Method Tables (VTables) manually.

```asm
section .data
    str_bark db "Woof!", 0xA
    len_bark equ $ - str_bark

    str_meow db "Meow!", 0xA
    len_meow equ $ - str_meow

    ; --- VTables (Arrays of Function Pointers) ---
    dog_vtable dq dog_speak
    cat_vtable dq cat_speak

    ; --- Object Instances ---
    ; Struct Animal { void** vtable_ptr }
    my_dog dq dog_vtable
    my_cat dq cat_vtable

section .text
    global _start

dog_speak:
    mov rax, 1
    mov rdi, 1
    mov rsi, str_bark
    mov rdx, len_bark
    syscall
    ret

cat_speak:
    mov rax, 1
    mov rdi, 1
    mov rsi, str_meow
    mov rdx, len_meow
    syscall
    ret

; Generic caller function
; Arg: RDI = pointer to an Animal object instance
make_animal_speak:
    mov rax, [rdi]               ; Read the vtable pointer from the object
    mov rax, [rax]               ; Read the first function pointer from the vtable
    jmp rax                      ; Tail-call jump into the method

_start:
    mov rdi, my_dog
    call make_animal_speak       ; Dynamically routes to dog_speak

    mov rdi, my_cat
    call make_animal_speak       ; Dynamically routes to cat_speak

    mov rax, 60
    xor rdi, rdi
    syscall
```

### 6. Network Requests via Syscalls (TCP Socket & Connect)
A rudimentary TCP client that opens a socket, connects to localhost port 80, and immediately exits.

```asm
section .data
    ; Representing C struct sockaddr_in
    sockaddr_in:
        dw 2                     ; sin_family = AF_INET (2)
        dw 0x5000                ; sin_port = 80 (0x5000 in network byte order)
        dd 0x0100007F            ; sin_addr = 127.0.0.1 (in network byte order)
        dq 0                     ; padding to reach 16 bytes

section .text
    global _start

_start:
    ; 1. socket(AF_INET, SOCK_STREAM, 0)
    mov rax, 41                  ; syscall for sys_socket
    mov rdi, 2                   ; AF_INET
    mov rsi, 1                   ; SOCK_STREAM
    mov rdx, 0                   ; Protocol (0 = default for TCP)
    syscall
    mov rdi, rax                 ; Save the returned socket File Descriptor for the next call

    ; 2. connect(sockfd, &sockaddr_in, sizeof(sockaddr_in))
    mov rax, 42                  ; syscall for sys_connect
    ; RDI already contains sockfd from the previous step
    mov rsi, sockaddr_in         ; Pointer to our struct
    mov rdx, 16                  ; Size of sockaddr_in structure
    syscall

    ; 3. Exit gracefully
    mov rax, 60
    xor rdi, rdi
    syscall
```

## Best Practices

1. **Comment Aggressively:** In higher-level languages, good code is mostly self-documenting. In Assembly, the intent is almost entirely hidden. You must comment heavily, describing *why* you are doing something, not just *what* the instruction does. Write `; Check if counter reached 0` rather than `; Compare RCX to 0`.
2. **Strict Adherence to Calling Conventions:** If you write a modular function, always clean up the stack and preserve callee-saved registers. Failing to restore a register like `RBX` or `RBP` will cause obscure, impossible-to-debug crashes when your assembly is called from C/C++ code.
3. **Use the Idiomatic Register for the Job:** While general-purpose registers can technically hold anything, x86 has idiomatic uses. Use `RCX` for loop counters, `RSI` and `RDI` for string sources and destinations, and `RAX` for function return values and math accumulators.
4. **Prefer Local Labels:** Most assemblers support local labels (e.g., prefixing with a dot like `.loop` in NASM), which are scoped to the nearest global label. This prevents namespace pollution and makes your jump targets visually explicit.
5. **Optimize Judiciously:** Do not write entire applications in assembly under the assumption it will be faster. Modern C/C++ compilers possess a profound understanding of instruction scheduling and superscalar architectures. Use assembly only for SIMD operations the compiler misses, or for bare-metal OS constraints.
6. **Zero Registers Efficiently:** Always use `XOR reg, reg` instead of `MOV reg, 0`. `XOR` generates shorter machine code (saving space in the instruction cache) and breaks register dependency chains, allowing the CPU to execute the instruction out-of-order more efficiently.
7. **Respect CPU Pipelining:** Avoid instructions that cause pipeline stalls. Be cautious with complex unconditional jumps in tight loops, and structure your code so that conditional branches fall through on the most common execution path to assist the CPU's branch predictor.
8. **Leverage Macros for Boilerplate:** Do not manually write out the same function prologue/epilogue fifty times. Define macros in your assembler. It minimizes human error, makes refactoring easier, and dramatically improves code readability.
