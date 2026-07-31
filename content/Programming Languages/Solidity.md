---
tags: [programming-language, blockchain, web3, oop]
category: Niche
status: to-learn
---

# Solidity

**Definition:** Primary language for writing smart contracts on Ethereum and other EVM-compatible blockchains, compiled to EVM bytecode.

**Paradigm:** OOP | **Typing:** Static

## Pros
- Direct access to Ethereum’s tooling, token standards, and contract ecosystem.
- Large ecosystem around Hardhat, Truffle, Foundry, Remix, and OpenZeppelin.
- Strong demand in web3 development and protocol engineering.
- Declarative contract interfaces make composition with other smart contracts straightforward.

## Cons
- Security bugs can cause irreversible financial loss because deployed contracts are often immutable.
- The language and surrounding ecosystem continue to evolve quickly.
- The use case is narrow and tied to blockchain execution environments.
- Gas costs, reentrancy, and upgrade patterns add complexity beyond ordinary application code.

## Best For
- Writing blockchain smart contracts with on-chain execution constraints.
- Teams building token, DeFi, DAO, and NFT logic on EVM chains.

## Real Examples
- Uniswap and many other DeFi protocols use Solidity.
- ERC-20 and ERC-721 token contracts are common Solidity artifacts.
- NFT minting, DAO governance, and treasury contracts are common examples.

## Use Cases
- DeFi protocols, NFT contracts, and DAO governance.
- Tokenized assets, escrow logic, and on-chain coordination.
- Example:

```solidity
pragma solidity ^0.8.0;

contract Counter {
	uint256 public value;
}
```

## Extended Syntax & Features

### Basic Data Types
Solidity is a statically typed language, which means that the type of each variable (state and local) needs to be specified at compile time.

- **Booleans**: `bool` with logical operators `!`, `&&`, `||`, `==`, `!=`.
- **Integers**: Signed (`int`) and unsigned (`uint`) integers of various sizes ranging from `int8`/`uint8` to `int256`/`uint256` in steps of 8 bits.
- **Addresses**: 
  - `address`: Holds a 20-byte value (the size of an Ethereum address).
  - `address payable`: Similar to `address`, but includes methods like `.transfer()` and `.send()` to send Ether.
- **Fixed-size byte arrays**: `bytes1`, `bytes2`, `bytes3`, ..., up to `bytes32`.
- **Dynamically-sized byte arrays**: `bytes` (used for raw byte data) and `string` (used for UTF-8 encoded text).
- **Enums**: User-defined types to create custom sets of constants. `enum State { Created, Locked, Inactive }`.

### Reference Types
Complex types that do not always fit into 256 bits have to be handled carefully, as they are passed by reference.
- **Arrays**: Can be fixed-size or dynamic. E.g., `uint256[] dynamicArray; uint256[5] fixedArray;`.
- **Structs**: Custom types that can group several variables into a single construct.
- **Mappings**: Key-value stores acting essentially as hash tables. `mapping(address => uint256) public balances;`. Note that mappings do not have a length and cannot be iterated over natively.

### Special Functions: `receive` and `fallback`
Contracts can have special functions to handle direct Ether transfers and calls with unmatching signatures.
- `receive() external payable { ... }`: Triggered when Ether is sent to the contract with empty calldata.
- `fallback() external payable { ... }`: Triggered when a function is called but no matching function signature is found, or if `receive` does not exist.

### Functions and Modifiers
Functions in Solidity are expressive and highly customizable through visibility and mutability specifiers.
- **Visibility**: 
  - `public`: Accessible externally and internally.
  - `private`: Accessible only within the current contract.
  - `internal`: Accessible within the current contract and derived (inherited) contracts.
  - `external`: Accessible only from outside the contract (can save gas when parameters are large).
- **State Mutability**: 
  - `view`: Promises not to modify the state (reading state is allowed).
  - `pure`: Promises neither to read from nor modify the state (pure computation).
  - `payable`: Allows the function to receive Ether alongside the transaction.
- **Modifiers**: Used to change the behavior of functions in a reusable, declarative way.

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not the owner");
    _; // Execution of the actual function body is inserted here
}
```

## Advanced Concepts

### Memory Management and Data Location
Every reference type must define a data location, explicitly stating where the data is stored in the EVM context:
- `storage`: Persistent data stored permanently on the blockchain. Reading and writing `storage` is the most gas-intensive operation.
- `memory`: Temporary data whose lifetime is limited to a single function call. It is cleared after execution. Modifying `memory` is much cheaper.
- `calldata`: Non-modifiable, non-persistent memory area used to store function arguments. It is mandatory for parameters in `external` functions and highly gas-efficient.

### Low-Level Calls and `delegatecall`
Solidity allows low-level interaction between contracts. This is powerful but bypasses type checking, making it risky.
- `call`: Used to execute code in another contract, send Ether, or trigger a fallback function.
  ` (bool success, bytes memory data) = target.call{value: 1 ether}(abi.encodeWithSignature("foo()"));`
- `delegatecall`: Executes code in the target contract, but in the context of the calling contract. This means the `msg.sender`, `msg.value`, and `storage` of the calling contract remain intact. This mechanism powers proxy-based upgradability patterns.

### Exception Handling and Custom Errors
Solidity handles errors by reverting the entire transaction state, meaning any changes made during the transaction are undone.
- `require(condition, "Error message");`: Used for input validation or checking external conditions. If it fails, remaining gas is refunded.
- `assert(condition);`: Used to check for internal invariants and logical sanity checks. If an `assert` fails, it implies a bug in the code. In older versions, it consumed all gas, though 0.8+ changes this behavior.
- **Custom Errors**: Introduced in 0.8.4, they are significantly cheaper than using string messages in `require`.
  `error Unauthorized(address caller); revert Unauthorized(msg.sender);`.

### Inline Assembly (Yul)
Solidity allows writing inline assembly using a language called Yul. This is used for fine-grained control over EVM opcodes, performing tasks not possible in plain Solidity, or achieving extreme gas optimizations. It requires deep knowledge of the EVM memory layout and stack.

## Ecosystem & Tooling

The Ethereum ecosystem provides robust, rapidly evolving tooling for writing, testing, deploying, and securing smart contracts.

### Frameworks and Build Tools
- **Foundry**: A fast, portable, and modular toolkit for Ethereum application development written in Rust. It allows developers to write tests in Solidity instead of JavaScript, making it highly popular.
- **Hardhat**: A flexible JavaScript/TypeScript-based development environment. Popular for its extensibility, built-in local node network, and rich plugin ecosystem.
- **Truffle**: One of the earliest development frameworks. While largely superseded by Hardhat and Foundry in new projects, it is still prevalent in legacy codebases.
- **Remix IDE**: A powerful web-based IDE requiring zero setup. Excellent for rapid prototyping, education, and debugging simple contracts.

### Libraries and Standards
- **OpenZeppelin Contracts**: The industry standard for smart contract development. Provides secure, heavily audited implementations of token standards (ERC-20, ERC-721, ERC-1155) and security utilities (AccessControl, ReentrancyGuard, Pausable).
- **EIP/ERC Standards**: Ethereum Improvement Proposals (EIPs) and Ethereum Request for Comments (ERCs) dictate the protocol specifications and common contract APIs.

### Infrastructure and Middleware
- **Ethers.js / Web3.js**: Standard JavaScript libraries for interacting with the blockchain from frontend applications or Node.js backends.
- **Viem**: A highly optimized, modern TypeScript interface for Ethereum.
- **Oracles (Chainlink)**: Smart contracts cannot natively access real-world data (e.g., stock prices). Decentralized oracle networks like Chainlink bridge this gap securely.
- **The Graph**: An indexing protocol used to query blockchain data efficiently using GraphQL, bypassing the need to read raw logs from nodes.

### Security Tooling
- **Slither**: A static analysis framework that detects common vulnerabilities instantly.
- **Mythril**: A security analysis tool that uses symbolic execution to find edge-case vulnerabilities.
- **Echidna**: A smart contract fuzzer used to test code against random, unexpected inputs.

## Code Examples

### 1. Hello World and Basic State
A simple contract demonstrating state variables, a constructor, and basic reading/writing functions.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public greeting;

    // The constructor runs exactly once during contract deployment
    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    // External function to update the greeting
    function setGreeting(string calldata _newGreeting) external {
        greeting = _newGreeting;
    }

    // View function to retrieve the greeting without modifying state
    function getGreeting() external view returns (string memory) {
        return greeting;
    }
}
```

### 2. Data Structures: Mappings, Structs, and Enums
Managing a ledger of users with different statuses and balances.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Bank {
    enum Status { Inactive, Active, Frozen }

    // Struct to bundle related user data
    struct User {
        string name;
        uint256 balance;
        Status status;
    }

    // Mapping from Ethereum address to a User struct
    mapping(address => User) public users;

    // Event emitted when a deposit occurs (useful for off-chain tracking)
    event Deposit(address indexed account, uint256 amount);

    function registerUser(string calldata _name) external {
        require(users[msg.sender].status == Status.Inactive, "User already registered");
        
        users[msg.sender] = User({
            name: _name,
            balance: 0,
            status: Status.Active
        });
    }

    // 'payable' allows the function to accept Ether
    function deposit() external payable {
        require(users[msg.sender].status == Status.Active, "User not active");
        require(msg.value > 0, "Deposit must be > 0");

        users[msg.sender].balance += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
```

### 3. Reentrancy Guard (Advanced Security Pattern)
Demonstrating how to protect against reentrancy attacks, a notorious vulnerability where a contract is called repeatedly before state is finalized.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    // Status flag for the reentrancy guard
    bool private locked;

    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    // Secure withdrawal using the Checks-Effects-Interactions pattern
    // combined with a reentrancy guard modifier
    function withdraw() external noReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "Insufficient balance");

        // 1. Checks (done by require)
        
        // 2. Effects (update state *before* calling external contract)
        balances[msg.sender] = 0;

        // 3. Interactions (call external contract)
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
    }
}
```

### 4. Basic ERC20 Token Implementation
Implementing a minimal version of a fungible token (excluding allowances for brevity).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
}

contract SimpleToken is IERC20 {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    // Custom errors for gas efficiency
    error InsufficientBalance(uint256 requested, uint256 available);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }

    function transfer(address recipient, uint256 amount) external returns (bool) {
        uint256 senderBalance = balanceOf[msg.sender];
        
        if (senderBalance < amount) {
            revert InsufficientBalance(amount, senderBalance);
        }
        
        balanceOf[msg.sender] = senderBalance - amount;
        balanceOf[recipient] += amount;
        
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }
}
```

### 5. Factory Pattern (Deploying Contracts Programmatically)
Demonstrating how a smart contract can deploy other smart contracts dynamically.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    address public owner;
    
    constructor(address _owner) {
        owner = _owner;
    }
}

contract VaultFactory {
    // Array to track all deployed vault addresses
    Vault[] public vaults;

    event VaultCreated(address indexed vaultAddress, address indexed owner);

    function createVault() external {
        // Deploy a new Vault contract instances
        Vault newVault = new Vault(msg.sender);
        
        vaults.push(newVault);
        emit VaultCreated(address(newVault), msg.sender);
    }
    
    function getVaultCount() external view returns (uint256) {
        return vaults.length;
    }
}
```

### 6. Time and Block Limits
Using global variables related to the blockchain environment.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TimeLockedWallet {
    address public owner;
    uint256 public unlockTime;

    constructor(uint256 _lockDurationSeconds) payable {
        owner = msg.sender;
        // block.timestamp returns current block's Unix timestamp
        unlockTime = block.timestamp + _lockDurationSeconds;
    }

    function withdraw() external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(block.timestamp >= unlockTime, "Wallet is still locked");

        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Transfer failed");
    }
}
```

## Best Practices

Due to the immutable nature of blockchains and the financial value secured by smart contracts, prioritizing security, gas efficiency, and rigorous testing is paramount.

### Security First
- **Checks-Effects-Interactions (CEI) Pattern**: Always update internal state (effects) before calling external contracts (interactions) to prevent reentrancy attacks.
- **Use Established Libraries**: Never write your own cryptography, token standards, or complex security modules if an audited, established alternative exists (like OpenZeppelin).
- **Beware of Integer Overflow/Underflow**: While Solidity 0.8+ handles this natively by reverting on overflows, older versions (0.7 and below) required manual checks using the `SafeMath` library.
- **Do Not Trust User Input or External Contracts**: Treat all external calls as potentially malicious. Use `require` aggressively to validate inputs, state, and permissions.

### Gas Optimization
- **Variable Packing**: The EVM handles data in 256-bit slots. Group state variables of the same type sequentially, and use smaller types (e.g., `uint128`, `uint96`) inside `structs` so they can be packed into a single storage slot, saving significant gas.
- **Memory vs. Storage**: Minimize writing to `storage` as it is the most expensive EVM operation. Use `memory` or `calldata` for temporary variables and function arguments.
- **Use Custom Errors**: Custom errors (`error NotOwner();`) are significantly cheaper to revert than traditional string messages (`require(false, "Not Owner")`).
- **Caching State Variables**: If reading a state variable multiple times within a function, cache it in a local `memory` variable first to avoid repeated `SLOAD` operations.

### Upgradability and Architecture
- **Proxy Patterns**: Since code cannot be changed once deployed, use proxy architectures (e.g., UUPS or Transparent Proxy) if the business logic requires future updates. Be acutely aware of storage collision risks when upgrading logic contracts.
- **Keep Contracts Small**: Contracts have a strict size limit mandated by EIP-170 (max 24.576 KB). Modularize code and use libraries if hitting size limits.
- **Event Logging**: Emit events for all critical state changes. Events are not accessible to smart contracts themselves, but they are crucial for off-chain applications (frontends, DApps, indexers) to track what happened efficiently and cheaply.
- **Self-Destruct (Deprecated)**: Avoid using `selfdestruct`. While previously used for contract deletion and gas refunds, EIP-6780 has deprecated it and severely limited its functionality in the current Ethereum roadmap.
