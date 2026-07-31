---
tags: [term, os, storage]
category: Kernel & I-O Subsystems
subcategory: Storage Systems
---

# File Systems

**Definition:** An OS abstraction that organizes, stores, retrieves, and manages files on physical storage devices, translating human-facing paths and files into raw block-level reads and writes.

## How It Works
- Inodes: metadata structures storing file size, permissions, owner, timestamps, and pointers to the actual data blocks on disk — the filename itself is *not* stored in the inode, only in a directory entry that maps a name to an inode number
- Directory Tables: map human-readable filenames to inode numbers, which is why hard links (multiple names pointing to the same inode) are possible, but why renaming a file doesn't change its inode or its actual data location
- Journaling: logs pending file system metadata changes to a write-ahead log before committing them to their final location, so a crash mid-write can be replayed or rolled back on reboot instead of leaving the file system in a corrupted, unmountable state
- Allocation strategies determine how a file's data blocks are laid out on disk: contiguous allocation (fast sequential read, suffers external fragmentation), linked allocation (no fragmentation, poor random access), and indexed allocation via inode block pointers (used by ext-family filesystems, balances both)
- Copy-on-Write filesystems (ZFS, Btrfs, APFS) never overwrite data in place — a modified block is written to a new location and metadata pointers are atomically updated, which is what enables instantaneous snapshots and eliminates a whole class of "torn write" corruption

## Why It Matters
- Guarantees data integrity, fast retrieval, access security (via permission bits/ACLs), and crash safety on physical SSD/HDD media
- The filesystem layer is what every [[System Call]] like `open()`, `read()`, and `write()` ultimately routes through via the kernel's Virtual File System (VFS) abstraction, which is why the same syscalls work uniformly across ext4, NTFS, and network filesystems
- SSD-aware filesystems must account for wear leveling and the fact that SSDs can't overwrite in place at the byte level (they erase in large blocks) — ignoring this leads to write amplification and premature drive wear

## Common Pitfalls
- Running out of inodes (allocating millions of tiny files) blocks new file creation even when disk space in bytes remains — a fixed inode count set at filesystem creation time is a common cause of confusing "disk full" errors on filesystems with lots of free space (`df` shows space free, `df -i` reveals the real inode exhaustion)
- Assuming `write()` returning success means data is durably on disk — without an explicit `fsync()`/`fdatasync()` call, data can sit in OS page cache and be lost on a power failure or kernel panic
- Deleting a large open file doesn't actually free its disk space until every process holding it open closes its file descriptor — a classic cause of "df shows disk full but I deleted the log files" incidents
- Ignoring filesystem-specific limits (max path length, max file size, case sensitivity differences between ext4 and NTFS/APFS) causes bugs that only appear when code is ported across operating systems

## Related Terms
- [[System Call]]
- [[Memory Allocation]]
- [[Virtual Memory and Paging]]
- [[Write-Ahead Logging (WAL)]]

## Example
Linux ext4, APFS, NTFS, and ZFS are production file systems.
```
$ echo "data" > file.txt
1. VFS routes open()/write() syscalls to the ext4 driver
2. ext4 allocates a data block, writes "data" into it
3. ext4 journal logs the metadata change (new inode, updated directory entry)
4. On commit, the journal entry is marked complete
```
If power is lost between steps 2 and 4, ext4's journal replay on next mount can recover a consistent state instead of leaving a half-written, corrupted filesystem structure.
