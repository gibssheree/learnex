---
tags: [term, system-design, distributed]
category: Consensus & Coordination
subcategory: Distributed Architecture
---

# Distributed Consensus

**Definition:** Protocols that allow a collection of independent nodes in a distributed system to agree on a single data value or sequence of state machine commands.

## How It Works
- Leader Election: cluster elects a leader node responsible for managing replicated logs
- Log Replication: leader accepts client writes, appends to log, replicates to follower quorum, and commits once majority ACK
- Algorithms: Raft (understandable leader-based consensus), Paxos / Multi-Paxos (foundational consensus protocol)

## Why It Matters
- Enables distributed coordination, leader selection, and fault-tolerant configuration management

## Common Pitfalls
- Split-Brain scenario: network partition leads to two sub-clusters electing separate leaders if quorum rules are violated

## Related Terms
- [[CAP Theorem]]
- [[Database Replication]]

## Example
etcd (used by Kubernetes) and Consul use the Raft consensus algorithm for cluster state management.
