---
tags: [term, shell, linux, sysadmin, cli]
category: Server Administration & CLI
---

# Linux Server Commands

**Definition:** The core set of shell and Linux command-line tools used to operate, inspect, and maintain a server: managing files, processes, permissions, services, networking, and logs, mostly from an SSH session with no GUI.

## File & Directory Management
- `ls -la`, `cd`, `pwd` — list, navigate, locate
- `cp`, `mv`, `rm -rf`, `mkdir -p` — copy, move, delete, create nested dirs
- `find /path -name "*.log" -mtime +7` — locate files by name, age, size, type
- `du -sh *` / `df -h` — disk usage per item / free space per filesystem

## Permissions & Ownership
- `chmod 750 file` — set read/write/execute bits for owner/group/others
- `chown user:group file` — change file owner and group
- `umask` — default permission mask applied to newly created files

## Process Management
- `ps aux` / `top` / `htop` — list running processes / live resource usage
- `kill -9 PID`, `killall name` — terminate a process by PID or name
- `nohup cmd &`, `disown` — keep a process running after the shell session ends
- `jobs`, `fg`, `bg` — manage jobs backgrounded/foregrounded in the current shell
- `systemctl start|stop|restart|status svc` — control services managed by systemd

## Networking
- `ssh user@host`, `scp file user@host:path`, `rsync -avz src/ dest/` — remote login, copy, and efficient sync
- `curl -I url`, `wget url` — fetch headers/content over HTTP(S)
- `ss -tulpn` / `netstat -tulpn` — list listening ports and the process bound to each
- `ping host`, `traceroute host` — reachability and hop-by-hop path checks
- `iptables` / `ufw` — firewall rule management (raw netfilter vs. Ubuntu's friendlier front end)

## Package Management
- `apt update && apt upgrade` (Debian/Ubuntu), `dnf upgrade` (Fedora/RHEL) — refresh and apply package updates
- `apt install pkg` / `dnf install pkg` — install software from the distro's repositories

## Logs & Monitoring
- `journalctl -u svc -f` — follow logs for a systemd-managed service
- `tail -f /var/log/syslog` — stream a log file as new lines arrive
- `dmesg` — kernel ring buffer, first place to check after a crash or OOM kill
- `free -h`, `uptime` — memory headroom, load average, and time since boot

## Text Processing
- `grep -rn "pattern" .` — search file contents recursively, with line numbers
- `sed 's/foo/bar/g' file` — stream-edit text (e.g. find-and-replace)
- `awk '{print $1}' file` — extract and transform columnar text
- `cut`, `sort`, `uniq -c`, `wc -l` — slice fields, order, count duplicates, count lines

## Archiving & Compression
- `tar -czvf out.tar.gz dir/` / `tar -xzvf out.tar.gz` — bundle+compress a directory / extract it

## User & Group Management
- `useradd -m name`, `passwd name`, `usermod -aG group name` — create a user with a home dir, set a password, add to a group

## Scheduling
- `crontab -e` — edit the current user's scheduled jobs (`* * * * * cmd`)
- `at "16:00"` — run a one-off command at a specific time

## Why It Matters
- Nearly every production server is administered headless over SSH; these commands are the baseline vocabulary for deploying code, diagnosing an outage, and keeping a box healthy without a GUI.

## Common Pitfalls
- `rm -rf` with an unquoted or wrong path deletes irreversibly, no trash bin
- Editing a config and forgetting to `systemctl restart` the service that reads it
- Piping `sudo` commands where only the first command in the pipe gets elevated privileges

## Related Terms
- [[Bash]]
- [[System Call]]
- [[Process and Thread]]
- [[File Systems]]

## Example
A typical incident-response sequence: `ssh` into the box, `journalctl -u app -f` to watch live logs, `top` to check for a runaway process, `df -h` to rule out a full disk, then `systemctl restart app` once the cause is fixed.

