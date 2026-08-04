---
tags: [term, shell, linux, sysadmin, cli]
category: Server Administration & CLI
---

# Linux Server Commands

**Definition:** The core set of shell and Linux command-line tools used to operate, inspect, and maintain a server: managing files, processes, permissions, services, networking, and logs, mostly from an SSH session with no GUI.

## File & Directory Management
- `ls -la`, `cd`, `pwd` — list, navigate, locate
- `cp`, `mv`, `rm -rf`, `mkdir -p` — copy, move, delete, create nested dirs
- `ln -s target link` — create a symbolic link (a pointer to another path); `ln target link` without `-s` makes a hard link instead, which shares the same inode and survives the original being deleted
- `find /path -name "*.log" -mtime +7` — locate files by name, age, size, type
- `du -sh *` / `df -h` — disk usage per item / free space per filesystem

## Permissions & Ownership
- `chmod 750 file` — set read/write/execute bits for owner/group/others
- `chown user:group file` — change file owner and group
- `umask` — default permission mask applied to newly created files

## Privilege Escalation (sudo & su)
The single most important thing to get right on a server: almost nothing runs as root directly, and getting this wrong is the fastest way to either lock yourself out or hand out root by accident.
- `sudo cmd` — run one command with root privileges. Prompts for *your own* account password, not root's, and only if your user is listed (directly or via group) in `/etc/sudoers`. Every invocation is logged to `/var/log/auth.log` (Debian/Ubuntu) or via `journalctl _COMM=sudo` (systemd distros), which is the standard audit trail for "who did what as root."
- `sudo -i` or `sudo su -` — open a full root login shell with root's own environment and `$HOME`. Use for extended admin work; drop out of it as soon as you're done rather than leaving a root shell open.
- `sudo -u otheruser cmd` — run a single command as a specific non-root user, not root (e.g. `sudo -u postgres psql`, `sudo -u www-data php script.php`) — the standard way to act as a service account without knowing its password.
- `sudo -l` — list exactly which commands your account is permitted to run via sudo, and under what conditions. Always check this on an unfamiliar box before assuming you have full access.
- `sudo !!` — re-run the previous command with `sudo` prepended; fixes a "permission denied" from forgetting `sudo` without retyping the whole line.
- `visudo` — the *only* safe way to edit `/etc/sudoers`. It edits a temporary copy and validates the syntax before saving, so a typo can't leave the file broken and lock out every sudo-capable user on the box. Never `vim /etc/sudoers` directly.
- `/etc/sudoers.d/` — drop-in directory for one rule file per app/team/user instead of editing the monolithic sudoers file directly (e.g. `/etc/sudoers.d/deploy`). This is the pattern provisioning tools like Ansible use, and it keeps custom rules from being clobbered by a package update to the base `sudoers` file.
- `su - username` — switch user entirely, not just borrow a privilege. Requires the *target* user's password (or root's), and `-` loads that user's full login environment (`$HOME`, `$PATH`, shell rc files) as if they'd logged in directly. This is the key difference from `sudo -u user cmd`, which runs one command with the target user's privileges but keeps your own shell environment — a script that behaves differently under `su - appuser` vs `sudo -u appuser` is almost always an environment/`$PATH` difference, not a permissions one.

## Process Management
- `ps aux` / `top` / `htop` — list running processes / live resource usage
- `kill -9 PID`, `killall name`, `pkill -f pattern` — terminate a process by PID, by exact name, or by matching its full command line
- `nohup cmd &`, `disown` — keep a process running after the shell session ends
- `jobs`, `fg`, `bg` — manage jobs backgrounded/foregrounded in the current shell
- `renice -n 10 -p PID` — lower (or raise, as root) a running process's CPU scheduling priority without killing it
- `systemctl start|stop|restart|status svc` — control services managed by systemd

## System Info & Session
- `whoami` / `id` — the current username, and their full UID/GID plus every group they belong to (important for debugging "permission denied" — group membership is a common surprise)
- `uname -a` — kernel version, architecture, and hostname in one line; the first thing to check when a binary or kernel module might not match the running system
- `hostname` / `hostnamectl set-hostname name` — show, or persistently set, the machine's name
- `history`, `!542`, `!!` — list past commands and re-run one by its history number or the last one, without retyping it
- `alias ll='ls -la'` — define a shell shortcut for the current session only, unless added to `~/.bashrc` to persist
- `env`, `export VAR=value` — list the current environment, or set a variable so it's inherited by every child process spawned from this shell (services started via `systemctl` do *not* inherit your shell's exported variables — they read `Environment=` in the unit file instead)
- `which cmd` / `type cmd` — show exactly which binary on `$PATH` a command name resolves to; essential when a tool "works in my shell but not in cron" (cron runs with a much smaller `$PATH`)
- `man cmd` — the built-in manual for almost every CLI tool; faster and more authoritative than searching the web for flag syntax

## Networking
- `ssh user@host`, `scp file user@host:path`, `rsync -avz src/ dest/` — remote login, copy, and efficient sync
- `curl -I url`, `wget url` — fetch headers/content over HTTP(S)
- `ss -tulpn` / `netstat -tulpn` — list listening ports and the process bound to each
- `ip a` — show network interfaces and their addresses; the modern replacement for the deprecated `ifconfig`
- `ping host`, `traceroute host` — reachability and hop-by-hop path checks
- `dig domain` / `nslookup domain` — query DNS directly, bypassing whatever the application layer thinks it resolved to
- `iptables` / `ufw` — firewall rule management (raw netfilter vs. Ubuntu's friendlier front end)

## Package Management
- `apt update && sudo apt upgrade` (Debian/Ubuntu), `sudo dnf upgrade` (Fedora/RHEL) — refresh and apply package updates; installing/upgrading system packages always needs root, so these are almost always run with `sudo`
- `sudo apt install pkg` / `sudo dnf install pkg` — install software from the distro's repositories
- `dpkg -l` / `rpm -qa` — list every package currently installed on the system, useful for auditing what's actually on a box
- `apt search term` / `dnf search term` — find a package by name or description before installing it

## Logs & Monitoring
- `journalctl -u svc -f` — follow logs for a systemd-managed service
- `tail -f /var/log/syslog` — stream a log file as new lines arrive
- `dmesg` — kernel ring buffer, first place to check after a crash or OOM kill
- `free -h`, `uptime` — memory headroom, load average, and time since boot

## Diagnostics
- `lsof -i :PORT` — see exactly which process is holding a port (or a file) open; the standard first move for "address already in use"
- `mount`, `umount`, `lsblk` — list mounted filesystems, unmount one, and list block devices/partitions
- `watch -n 2 cmd` — re-run a command every N seconds, refreshing in place, for watching a value change live without a monitoring tool
- `strace -p PID` — trace every syscall a running process makes; a last resort when logs don't explain why something is hanging, requires root or ownership of the target process

## Text Processing
- `grep -rn "pattern" .` — search file contents recursively, with line numbers
- `sed 's/foo/bar/g' file` — stream-edit text (e.g. find-and-replace)
- `awk '{print $1}' file` — extract and transform columnar text
- `cut`, `sort`, `uniq -c`, `wc -l` — slice fields, order, count duplicates, count lines
- `cmd1 | xargs -I{} cmd2 {}` — pipe a list of items (e.g. filenames from `find`) into another command as arguments, one invocation per item

## Archiving & Compression
- `tar -czvf out.tar.gz dir/` / `tar -xzvf out.tar.gz` — bundle+compress a directory / extract it

## User & Group Management
- `sudo useradd -m name`, `sudo passwd name`, `sudo usermod -aG group name` — create a user with a home dir, set a password, add to a group (all require root, hence `sudo`)
- `sudo usermod -aG sudo name` (Debian/Ubuntu) or `sudo usermod -aG wheel name` (RHEL/Fedora) — the standard way to grant a new user sudo access, by adding them to the group `/etc/sudoers` already trusts, instead of editing sudoers per-user

## Scheduling
- `crontab -e` — edit the current user's scheduled jobs (`* * * * * cmd`)
- `sudo crontab -e -u otheruser` — edit another user's crontab (root only)
- `at "16:00"` — run a one-off command at a specific time

## Why It Matters
- Nearly every production server is administered headless over SSH; these commands are the baseline vocabulary for deploying code, diagnosing an outage, and keeping a box healthy without a GUI.

## Common Pitfalls
- `rm -rf` with an unquoted or wrong path deletes irreversibly, no trash bin
- Editing a config and forgetting to `systemctl restart` the service that reads it
- Piping `sudo` commands where only the first command in the pipe gets elevated privileges — `sudo cmd1 | cmd2` runs `cmd2` as your normal user, not root; if the whole pipeline needs root, wrap it in `sudo sh -c '...'` instead
- Adding `NOPASSWD:` entries to `/etc/sudoers.d/` for convenience is functionally equivalent to giving that account root with no audit trail of a password prompt — scope it to the exact command needed, never to `ALL`
- Confusing `su - user` (loads the target's full environment) with `sudo -u user cmd` (keeps your own environment) — a command that reads `$PATH` or other env vars can behave differently under each, which looks like a permissions bug but isn't

## Related Terms
- [[Bash]]
- [[System Call]]
- [[Process and Thread]]
- [[File Systems]]

## Example
A typical incident-response sequence: `ssh` into the box, `sudo journalctl -u app -f` to watch live logs, `top` to check for a runaway process, `df -h` to rule out a full disk, `sudo lsof -i :443` if the wrong process is holding the port, then `sudo systemctl restart app` once the cause is fixed.
