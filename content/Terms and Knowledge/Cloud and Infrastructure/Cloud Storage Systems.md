---
tags: [term, cloud, storage]
category: Microservices & Architecture
subcategory: Cloud Computing
---

# Cloud Storage Systems

**Definition:** The three fundamental storage abstractions in cloud architecture — Object Storage, Block Storage, and File Storage — each with distinct access patterns, durability guarantees, and cost profiles.

## How It Works
- **Object Storage** (AWS S3, GCS, Azure Blob, [[Cloudflare]] R2): a flat key-value store accessed over HTTP/REST rather than a filesystem API; each object is immutable (you replace it, not patch it in place), carries its own metadata, and scales to effectively unlimited capacity across storage classes tuned for access frequency (S3 Standard, Infrequent Access, Glacier for cold archival). Ideal for unstructured data like images, backups, and log archives.
- **Block Storage** (AWS EBS, GCP Persistent Disk): raw, low-latency disk volumes attached to a single VM over a virtual SAN, formatted with a normal filesystem (ext4, NTFS); supports random-access reads/writes, making it the right choice for database data files and boot volumes. Performance is typically provisioned in IOPS and throughput tiers independent of raw capacity.
- **File Storage** (AWS EFS, Azure Files): a managed network file system (NFS/SMB) that can be mounted concurrently by many VMs at once, giving POSIX-like shared file access that block storage (single-attach) can't provide.
- **Durability vs. availability** are distinct guarantees: S3 advertises 11 nines of durability (near-zero chance of losing the underlying bytes via redundant storage across facilities) but only ~4 nines of availability (chance a request succeeds at any given moment) — a common source of confusion when reasoning about SLAs.
- Consistency model matters for correctness: S3 offers strong read-after-write consistency for new objects; some object stores are only eventually consistent, which can surprise code that writes then immediately reads.

## Why It Matters
- Selecting the right storage abstraction balances cost, throughput, latency, and access pattern — using the wrong one is a common source of both performance problems and unnecessary spend.
- Object storage's near-infinite scale and low per-GB cost make it the default backbone for data lakes, static asset hosting, and backup retention across virtually every cloud architecture.

## Common Pitfalls
- Using expensive, single-attach Block Storage for static user-uploaded media instead of cheap, natively-scalable Object Storage — this both costs more and doesn't scale past one instance.
- Forgetting that object storage is not a general-purpose filesystem: no partial in-place writes, no native file locking, and (for many providers) eventual consistency on overwrites/deletes of existing keys, which breaks assumptions ported over from local disk code.
- Leaving storage buckets/containers with public read access misconfigured, one of the most common real-world causes of large-scale data leaks (unencrypted S3 buckets exposing customer PII).
- Not setting lifecycle policies to transition old objects to cheaper cold-storage tiers, quietly paying Standard-tier prices for rarely-accessed archival data for years.

## Related Terms
- [[Cloud Service Models]]
- [[Content Delivery Network (CDN) and Edge Computing]]
- [[High Availability (HA) and Disaster Recovery (DR)]]

## Example
An app stores user profile pictures in S3 object storage served through a [[Content Delivery Network (CDN) and Edge Computing|CDN]], keeps its Postgres database's data files on an EBS block volume for low-latency random I/O, and mounts an EFS file share so multiple worker VMs can read/write a shared set of uploaded documents concurrently.
