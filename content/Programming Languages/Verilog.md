---
tags: [programming-language, hardware, chip-design]
category: Niche
status: to-learn
---

# Verilog

**Definition:** Hardware description language used to model, simulate, and synthesize digital circuits and chips. It allows designers to represent hardware logic mathematically and structurally before physical implementation.

**Paradigm:** Concurrent / Hardware Description | **Typing:** Static / Bit-level | **Execution:** Event-driven simulation

## Pros
- **Industry Standard**: Widely adopted for digital chip design, verification, and electronic design automation (EDA).
- **Precise Hardware Control**: Offers exact control over combinational logic, sequential logic behavior, timing, and delays.
- **Robust Tooling**: Supported by a massive ecosystem of strong simulation, synthesis, and place-and-route tooling across FPGA and ASIC workflows (e.g., Vivado, Quartus, ModelSim).
- **Concurrency Modeling**: Accurately models the inherently concurrent nature of hardware, where thousands of gates evaluate simultaneously, instead of pretending execution is sequential like software languages.
- **Abstraction Levels**: Supports modeling at the switch (transistor) level, gate level, dataflow (RTL - Register Transfer Level), and behavioral level.

## Cons
- **Steep Learning Curve**: Requires a very different mental model from sequential software programming; developers must think in terms of wires, registers, and clock edges rather than sequential instructions.
- **Timing Issues**: Debugging timing violations, setup/hold time errors, and race conditions can be incredibly difficult and non-intuitive.
- **Niche Domain**: Highly specialized language focused entirely on hardware engineering, offering little utility outside of that domain.
- **Synthesis Pitfalls**: Small syntax mistakes or poorly written behavioral code can simulate correctly but synthesize into completely different, highly inefficient, or non-functional hardware (e.g., unintended latches).
- **Verbosity**: Structural descriptions can become verbose, though SystemVerilog (its successor) mitigates some of this.

## Best For
- **Digital Circuit Design**: Developing standard and custom digital logic architectures.
- **FPGA Development**: Programming Field Programmable Gate Arrays (FPGAs) for rapid prototyping, signal processing, or specialized acceleration.
- **ASIC Design**: Designing Application-Specific Integrated Circuits for mass-market hardware (processors, microcontrollers).
- **Testbenches**: Creating verification-oriented hardware simulation environments to validate module behavior before synthesis.

## Real Examples
- **Processors and Microcontrollers**: Used to design the logic for CPUs, GPUs, and custom silicon at massive semiconductor companies like Intel, AMD, ARM, and NVIDIA.
- **Networking Hardware**: Switches and routers use custom silicon programmed in Verilog for high-speed packet routing and processing.
- **Signal Processing**: FPGAs used in radar, software-defined radio (SDR), and medical imaging devices run Verilog-based logic.
- **Open-Source Hardware**: Projects like the RISC-V instruction set architecture have many open-source processor implementations (like PicoRV32) written in Verilog.

## Use Cases
- Chip design (ASIC), FPGA programming, hardware emulation, and digital logic simulation.
- Creating Intellectual Property (IP) cores for resale or reuse across multiple hardware projects.

## Extended Syntax & Features

### Modules and Ports
The fundamental building block in Verilog is the `module`. A module encapsulates a specific piece of hardware logic and communicates with the outside world via ports (inputs, outputs, and inouts). Modules can be instantiated inside other modules to create a hierarchical design.

```verilog
module AndGate (
    input wire a,
    input wire b,
    output wire y
);
    // Logic goes here
    assign y = a & b;
endmodule
```

### Data Types: Nets and Variables
Verilog has two primary categories of data types:
1. **Nets (e.g., `wire`)**: Represent physical connections between hardware elements. They do not store values; their value is continuously driven by the output of a gate or continuous assignment. If no driver is connected, a net has a high-impedance value (`z`).
2. **Variables (e.g., `reg`, `integer`)**: Represent data storage elements. Unlike software variables, a `reg` does not necessarily map to a physical hardware register (flip-flop); it simply means it can hold its value procedurally over time. `integer` is commonly used as a loop counter in simulations.

### Continuous Assignments
Used to model combinational logic (dataflow modeling). The assignment happens continuously; any change on the right-hand side immediately updates the left-hand side.
```verilog
wire sum;
wire carry;
assign {carry, sum} = a + b; // Concatenation and continuous assignment
```

### Procedural Blocks: `always` and `initial`
Verilog uses procedural blocks to model both sequential and complex combinational logic (behavioral modeling).
- **`initial` block**: Executes only once at the beginning of a simulation (time 0). Primarily used in testbenches for initialization and stimulus generation. It is **not synthesizable** into actual hardware.
- **`always` block**: Executes continuously in a loop. It uses a sensitivity list to dictate when the block should evaluate.
  - Combinational `always`: Evaluates when any input changes (`always @*` or `always @(a or b)`).
  - Sequential `always`: Evaluates on specific clock edges (`always @(posedge clk)` or `always @(negedge clk)`).

### Blocking vs. Non-Blocking Assignments
Understanding the difference is critical in Verilog:
- **Blocking (`=`)**: Evaluates and assigns sequentially within the block. Used for combinational logic inside an `always` block.
- **Non-Blocking (`<=`)**: Evaluates all right-hand sides simultaneously and assigns them to the left-hand sides at the end of the time step. Crucial for modeling sequential logic (flip-flops) to prevent race conditions.

### Control Flow
Verilog supports standard control flow mechanisms within procedural blocks, though they dictate how hardware multiplexers or logic gates are generated.
- `if-else` statements
- `case` statements (often synthesizes to a multiplexer)
- Loops (`for`, `while`, `repeat`, `forever`) – mostly used in testbenches. Synthesizing loops requires unrolling, so the bounds must be static and known at compile time.

## Advanced Concepts

### Synthesis vs. Simulation
A core concept in Verilog is the distinction between code that can be simulated and code that can be synthesized into physical gates.
- **Simulation**: Everything in Verilog can be simulated to verify logical correctness and timing. You can use delays (`#10`), file I/O (`$fopen`, `$display`), and `initial` blocks.
- **Synthesis**: The EDA tool translates RTL (Register Transfer Level) Verilog into a netlist of actual logic gates (AND, OR, Flip-flops). Delays and initial blocks are ignored or rejected. The code must adhere strictly to synthesizable subsets of the language.

### Timing and Delays
In simulation, time is a first-class concept. Delays are specified using the `#` operator.
```verilog
assign #5 y = a & b; // y will update 5 time units after a or b changes
```
While useful for testbenches, delays are not synthesizable. In real hardware, delays are determined by physical properties (wire capacitance, gate characteristics), which are analyzed post-synthesis using Static Timing Analysis (STA).

### Inferred Latches vs. Flip-Flops
When designing combinational logic using `always` blocks, if not all possible conditions of a variable are covered (e.g., an incomplete `if` statement without an `else`), the synthesis tool assumes the variable must hold its previous state. This infers a memory element known as a latch. Unintended latches can cause severe timing and functionality issues. Flip-flops, conversely, are intentionally inferred using edge-triggered `always` blocks.

### Parameterization (Generics)
Verilog modules can be parameterized to allow for scalable and reusable code, akin to templates or generics in software languages. Parameters define constants that can be overridden when the module is instantiated.

```verilog
module Adder #(parameter WIDTH = 8) (
    input wire [WIDTH-1:0] a,
    input wire [WIDTH-1:0] b,
    output wire [WIDTH:0] sum
);
    assign sum = a + b;
endmodule
```

### Finite State Machines (FSMs)
Verilog is heavily used to implement FSMs for control logic. FSMs are typically designed using a two-block or three-block approach:
1. One block for the state memory (sequential logic, clock edge triggered).
2. One block for next-state logic (combinational).
3. One block for output logic (combinational or sequential).

### Verilog vs SystemVerilog
Verilog-2001 is the classic standard, but SystemVerilog (IEEE 1800) is its successor. While SystemVerilog encompasses all of Verilog, it brings significant enhancements:
- **`logic` data type**: Replaces the confusing need to choose between `wire` and `reg` for most RTL design tasks. A `logic` variable can be driven by continuous assignments or procedural blocks.
- **Interfaces**: Bundles related signals together (like an AXI bus), significantly reducing port list clutter and simplifying module connections.
- **Object-Oriented Programming (OOP)**: Introduces classes, inheritance, and polymorphism, exclusively for verification environments.
- **Constrained Randomization**: Allows automated generation of complex test vectors in testbenches.
- **Assertions (SVA)**: Allows designers to embed formal properties directly into the RTL to specify intended behavior and automatically flag violations during simulation.

## Ecosystem & Tooling

The Verilog ecosystem is divided between proprietary commercial tools (often very expensive) and a growing movement of open-source tools.

### Synthesis and Implementation Tools
- **Xilinx Vivado / ISE**: Industry-standard suite for synthesizing Verilog onto AMD/Xilinx FPGAs.
- **Intel Quartus Prime**: Primary toolchain for Altera/Intel FPGAs.
- **Yosys**: A prominent open-source framework for Verilog RTL synthesis, heavily used in open-source ASIC and FPGA workflows.

### Simulation and Verification
- **ModelSim / Questa**: Widely used commercial simulators from Mentor Graphics/Siemens.
- **VCS**: High-performance simulator by Synopsys.
- **Icarus Verilog (iverilog)**: A free compiler that translates Verilog into executable simulations. Great for learning and small projects.
- **Verilator**: A high-performance open-source compiler that converts Verilog to C++ or SystemC for ultra-fast cycle-accurate simulation.

### Viewers and Linters
- **GTKWave**: The standard open-source waveform viewer for analyzing `.vcd` (Value Change Dump) simulation output files.
- **Verible**: A suite of Verilog/SystemVerilog developer tools from Google, including a linter, formatter, and language server.

## Code Examples

### 1. Basic Combinational Logic (Half Adder)
A purely dataflow representation using continuous assignment.
```verilog
module HalfAdder(
    input wire a,
    input wire b,
    output wire sum,
    output wire carry
);
    // Continuous assignment evaluating combinational logic
    assign sum = a ^ b;   // XOR for sum
    assign carry = a & b; // AND for carry
endmodule
```

### 2. Sequential Logic (D Flip-Flop)
Demonstrates the use of an edge-triggered `always` block and non-blocking assignments.
```verilog
module DFlipFlop(
    input wire clk,
    input wire reset,
    input wire d,
    output reg q
);
    // Triggered on the rising edge of the clock or reset
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            q <= 1'b0; // Asynchronous active-high reset
        end else begin
            q <= d;    // Non-blocking assignment for sequential state
        end
    end
endmodule
```

### 3. Multiplexer using Behavioral Modeling
Using an `always` block for combinational logic. Note the blocking assignments (`=`).
```verilog
module Mux4to1 (
    input wire [3:0] in,
    input wire [1:0] sel,
    output reg out
);
    // Sensitivity list with wildcard '*' evaluates on any input change
    always @(*) begin
        case (sel)
            2'b00: out = in[0];
            2'b01: out = in[1];
            2'b10: out = in[2];
            2'b11: out = in[3];
            default: out = 1'b0; // Prevents inferred latches
        endcase
    end
endmodule
```

### 4. Simple Counter with Parameterization
A parameterized counter demonstrating instantiation flexibility.
```verilog
module Counter #(parameter BITS = 4) (
    input wire clk,
    input wire rst_n, // Active low reset
    input wire enable,
    output reg [BITS-1:0] count
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            count <= 0; // Set all bits to 0
        end else if (enable) begin
            count <= count + 1'b1;
        end
    end
endmodule
```

### 5. Finite State Machine (FSM) - Traffic Light Controller
A 3-block FSM design pattern separating state memory, next state logic, and output logic.
```verilog
module TrafficLight (
    input wire clk,
    input wire reset_n,
    output reg [1:0] light // 2'b00: Red, 2'b01: Yellow, 2'b10: Green
);

    // State Encoding (Parameterization for readability)
    localparam STATE_RED    = 2'b00;
    localparam STATE_YELLOW = 2'b01;
    localparam STATE_GREEN  = 2'b10;

    reg [1:0] current_state, next_state;
    reg [3:0] timer; // Simple timer for state duration

    // 1. Sequential Logic: State Memory & Timer
    always @(posedge clk or negedge reset_n) begin
        if (!reset_n) begin
            current_state <= STATE_RED;
            timer <= 4'd0;
        end else begin
            if (timer == 4'd10) begin // Transition condition met
                current_state <= next_state;
                timer <= 4'd0;
            end else begin
                timer <= timer + 1'b1;
            end
        end
    end

    // 2. Combinational Logic: Next State Logic
    always @(*) begin
        // Default assignment to prevent latch
        next_state = current_state; 
        
        case (current_state)
            STATE_RED:    next_state = STATE_GREEN;
            STATE_GREEN:  next_state = STATE_YELLOW;
            STATE_YELLOW: next_state = STATE_RED;
            default:      next_state = STATE_RED;
        endcase
    end

    // 3. Combinational Logic: Output Logic
    always @(*) begin
        case (current_state)
            STATE_RED:    light = 2'b00;
            STATE_YELLOW: light = 2'b01;
            STATE_GREEN:  light = 2'b10;
            default:      light = 2'b00;
        endcase
    end
endmodule
```

### 6. Testbench Example
A module that generates stimulus to test the `HalfAdder`. It has no ports and uses non-synthesizable constructs like `initial` and delays.
```verilog
`timescale 1ns / 1ps // 1ns time unit, 1ps precision

module tb_HalfAdder();
    // Testbench variables
    reg test_a;
    reg test_b;
    wire test_sum;
    wire test_carry;

    // Instantiate the Device Under Test (DUT)
    HalfAdder dut (
        .a(test_a),
        .b(test_b),
        .sum(test_sum),
        .carry(test_carry)
    );

    // Initial block for stimulus generation
    initial begin
        // Dump waves for GTKWave
        $dumpfile("half_adder_waves.vcd");
        $dumpvars(0, tb_HalfAdder);

        // Apply test vectors with delays
        test_a = 0; test_b = 0;
        #10; // Wait 10 time units
        
        test_a = 0; test_b = 1;
        #10;
        
        test_a = 1; test_b = 0;
        #10;
        
        test_a = 1; test_b = 1;
        #10;

        $display("Simulation complete.");
        $finish; // End simulation
    end
endmodule
```

## Best Practices

### 1. Non-Blocking vs. Blocking Assignments
- **Always** use non-blocking assignments (`<=`) in sequential logic (edge-triggered `always @(posedge clk)`).
- **Always** use blocking assignments (`=`) in combinational logic (`always @*`).
- **Never** mix both types of assignments in the same `always` block. Mixing them causes race conditions and simulation-synthesis mismatches.

### 2. Avoid Inferred Latches
When writing combinational `always` blocks, ensure every variable assigned in the block has a defined value for every possible execution path. Always provide `default` cases in `case` statements and `else` branches in `if` statements. Unintended latches ruin circuit timing and functionality.

### 3. Use Synchronous Design Practices
Design systems based on a single global clock wherever possible. Avoid using logic gates to generate clock signals (clock gating) or deriving clocks using counters (ripple counters) unless done through dedicated FPGA clocking primitives (like PLLs or MMCMs). Logic-derived clocks suffer from skew and cause timing failures.

### 4. Separate Combinational and Sequential Logic
While it's possible to mix state updates and complex combinational calculations in a single sequential block, it's generally cleaner and less error-prone to separate them. Write state machines with dedicated blocks for state registers and next-state logic.

### 5. Explicit Port Mapping
When instantiating modules, use named port mapping (e.g., `.port_name(wire_name)`) rather than positional mapping. This drastically reduces errors when module definitions change and improves code readability.

### 6. Active-Low Resets and Synchronous Resets
Consider using synchronous resets (evaluated on the clock edge rather than asynchronously) to prevent metastable states from reset de-assertion near a clock edge. If asynchronous resets are used, ensure they are synchronized to the clock domain before use.

### 7. Parameterize Widths
Avoid hardcoding bus widths. Use `parameter` to define bus sizes, allowing modules to be highly reusable across different parts of the architecture. Use macros (`define`) sparingly and prefer parameters.

### 8. Use Linters and Simulators Early
Hardware is slow to compile (synthesize/route). Rely heavily on linters (like Verilator's linting) and fast simulators to catch logic and syntax errors before attempting to push a design through a full FPGA or ASIC toolchain.
