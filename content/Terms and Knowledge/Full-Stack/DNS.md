---
tags: [term, fullstack, devops, infrastructure]
category: DevOps & Delivery
---

# DNS

**Definition:** The system that translates human-readable domain names, like google.com, into IP addresses computers use to find each other.

## How It Works
- Your browser asks a DNS resolver
- The resolver checks a hierarchy of servers until it finds the IP address tied to that domain name
- Resolution is a chain of delegated lookups, not one database: recursive resolver -> root nameserver -> TLD nameserver -> authoritative nameserver
- The recursive resolver (often your ISP's, or a public one like `1.1.1.1`/`8.8.8.8`) does the legwork on your behalf and caches the answer for next time
- Root servers (13 logical root server addresses, anycast to hundreds of physical locations) don't know the IP for `example.com` — they know which server handles `.com`
- The `.com` TLD server doesn't know the IP either — it knows which nameserver is authoritative for `example.com`
- The authoritative nameserver (configured by whoever owns the domain, usually the registrar or a DNS host like Cloudflare/Route 53) holds the actual records and returns the final answer
- Every answer comes back with a TTL (time-to-live, in seconds) telling resolvers how long they're allowed to cache it before asking again
- Operating systems and browsers add their own caching layers on top of the resolver's cache, which is why flushing a local DNS cache (`ipconfig /flushdns`, `dscacheutil -flushcache`) sometimes fixes a "stale site" problem the resolver's TTL alone doesn't explain
- Negative responses (a name that doesn't exist) are cached too, governed by the zone's `SOA` record's negative-caching TTL — this is why a freshly-created subdomain can seem "not found" for a while even after its record is live

## Why It Matters
- Every deployment involves pointing a domain at your server; misconfigured DNS is a classic "why isn't my site live yet" problem
- DNS resolution happens before the browser can even open a TCP connection, so a slow or broken DNS lookup delays everything downstream, including [[SSL-TLS|SSL/TLS (HTTPS)]] negotiation
- DNS is also how email deliverability, domain verification, and CDN routing work under the hood — not just "does the website load"
- Geo-aware and latency-based DNS routing (used by CDNs and multi-region deployments) means the "same" domain name can resolve to different IPs for different users, which is invisible until you're debugging a region-specific incident

## Common Pitfalls
- Not understanding DNS propagation delay — changes can take minutes to hours to take effect everywhere
- Setting a TTL too high before a planned change, meaning old records stay cached at resolvers around the world long after you've updated them
- Setting a TTL too low permanently, generating unnecessary lookup traffic and dependency on your DNS provider's uptime
- Confusing an A record (points to an IPv4 address) with a CNAME (points to another domain name) and trying to use a CNAME at the zone apex (`example.com` with no subdomain), which most DNS specs prohibit because it can't coexist with required records like the zone's `SOA` and `NS`
- Forgetting that DNS changes at the registrar (nameserver delegation) versus DNS changes at the DNS host (individual records) are different layers, and mixing them up leads to "I changed it but nothing happened"
- Not setting up both an apex record and a `www` record, so `example.com` works but `www.example.com` doesn't, or vice versa
- Missing or misconfigured `MX` records silently breaking inbound email for the domain, with no visible symptom until someone reports "I never got your email"
- Deleting or changing a record without checking what still depends on it — a decommissioned CNAME target left dangling (pointing at a de-provisioned cloud resource) is a known "subdomain takeover" vulnerability, where an attacker claims the abandoned resource and effectively hijacks your subdomain
- Assuming `dig`/`nslookup` from your own machine reflects what the rest of the world sees — your local resolver may have cached an answer nobody else has, so cross-checking with a tool that queries authoritative servers directly (or `dig +trace`) avoids a false read

## Related Terms
- [[Reverse Proxy]]
- [[SSL-TLS|SSL/TLS (HTTPS)]]
- [[Load Balancer]]
- [[CDN (Content Delivery Network)]]

## Types
Common DNS record types and what they're for:

| Record | Purpose |
|---|---|
| `A` | Maps a name to an IPv4 address |
| `AAAA` | Maps a name to an IPv6 address |
| `CNAME` | Aliases a name to another domain name (can't coexist with other records on the same name) |
| `MX` | Specifies mail servers for the domain, with a priority value |
| `TXT` | Arbitrary text — used for domain ownership verification, [[SPF/DKIM|Email Authentication]], SPF/DKIM/DMARC policies |
| `NS` | Delegates a subdomain (or the whole zone) to a set of nameservers |
| `SOA` | Start of Authority — holds the zone's admin contact, serial number, and caching/refresh timers |
| `PTR` | Reverse lookup — maps an IP address back to a domain name |
| `CAA` | Restricts which Certificate Authorities are allowed to issue TLS certs for the domain |
| `SRV` | Points to a host and port for a specific service (used by protocols like SIP, XMPP) |

## Under the Hood
A full resolution for `app.example.com` from a cold cache looks like:
1. Client asks the recursive resolver for `app.example.com`
2. Resolver has nothing cached, asks a root server, gets referred to the `.com` TLD servers
3. Resolver asks a `.com` TLD server, gets referred to `example.com`'s authoritative nameservers (found via the domain's `NS` records)
4. Resolver asks the authoritative nameserver directly for `app.example.com`, gets back an `A` record with an IP and a TTL
5. Resolver caches the answer for the TTL duration and returns it to the client
6. Every subsequent request for that name, from any client using that resolver, is served from cache until the TTL expires

This is why a DNS change doesn't take effect everywhere instantly — every resolver that cached the old answer keeps serving it until its own copy of the TTL runs out, independent of when you made the change.

## Code Example
```bash
# Query the A record for a domain
dig example.com A +short

# Query all record types, showing the full response including TTL
dig example.com ANY

# Trace the full resolution chain, root to authoritative
dig +trace example.com

# Windows equivalent
nslookup example.com
```

```
; Example zone file excerpt
$TTL 3600
example.com.       IN  SOA   ns1.example.com. admin.example.com. (2024010101 3600 900 604800 3600)
example.com.       IN  NS    ns1.example.com.
example.com.       IN  NS    ns2.example.com.
example.com.       IN  A     203.0.113.10
www.example.com.   IN  CNAME example.com.
example.com.       IN  MX    10 mail.example.com.
```

## Best Practices
- Lower the TTL on records you're about to change well ahead of the change (e.g. drop it to 300s a day before a migration), then raise it back afterward
- Use `CNAME`/`ALIAS`/`ANAME` records (provider-dependent) for pointing subdomains at services like CDNs or hosting platforms, since their IPs can change without notice
- Set `CAA` records to restrict which certificate authorities can issue certs for your domain, closing off a class of TLS mis-issuance attacks
- Keep registrar-level nameserver delegation and DNS-host-level record management mentally separate when debugging — check which layer you actually changed
- Monitor DNS resolution as part of uptime checks — a broken DNS record takes the whole app down even if the server itself is healthy

## FAQ
**Why does a DNS change sometimes work for me but not for a colleague?** You're likely hitting different recursive resolvers with different cached TTLs, or one of you has a stale entry in a local OS-level DNS cache.

**Is DNS resolution part of every single HTTP request?** No — once a client resolves a name, it caches the answer locally (respecting the TTL) and reuses it for the connection's lifetime and often for subsequent requests, so it's not repeated on every request.

**What's the difference between a domain registrar and a DNS host?** The registrar (e.g. Namecheap, GoDaddy) reserves the domain name and points its nameservers at whoever will answer DNS queries for it; the DNS host (e.g. Cloudflare, Route 53) is the service that actually answers those queries — often the same company, but not required to be.

**Why do some sites use so many nameservers?** Redundancy — a domain typically lists at least two independent authoritative nameservers so resolution survives one being unreachable, and large providers anycast each nameserver IP to dozens of physical locations for both speed and DDoS resilience.

**Does DNS use TCP or UDP?** Both — queries default to UDP for speed (single packet, no handshake), but fall back to TCP when the response is too large for one UDP packet (e.g. `DNSSEC` responses or zone transfers), which is one reason old firewalls that blocked TCP/53 caused mysterious partial DNS failures.

## Real-World Example
A classic production incident: a team migrates a site to a new host and updates the `A` record, but the old TTL was set to 86400 (24 hours) rather than being lowered ahead of time. Some users see the new site immediately (resolvers with no cached entry), others keep hitting the decommissioned old server for up to a full day (resolvers that cached the old answer near the start of that window) — support tickets say "it's broken" from some users and "works fine" from others, and the difference is purely which resolver cached what, when. The preventive fix is dropping the TTL to something like 300 seconds a day or two before any planned cutover, then raising it back once the change is confirmed stable.

## History
DNS was designed in 1983 by Paul Mockapetris, replacing a single flat `HOSTS.TXT` file that Stanford Research Institute manually maintained and every machine on the early ARPANET downloaded — a model that was already breaking down as the network grew past a few hundred hosts. The hierarchical, delegated design (root -> TLD -> authoritative) was the key innovation: no single server needs to know every name on the internet, only which server to ask next. `DNSSEC`, adding cryptographic signing to prevent response spoofing, was specified in the late 1990s/early 2000s but is still not universally deployed today — a reminder that internet-scale infrastructure changes slowly even when the security case is well understood.

## Common Interview Questions
- **What's the difference between recursive and authoritative DNS servers?** A recursive resolver does the work of chasing an answer through the hierarchy on the client's behalf and caches the result; an authoritative server holds the actual records for a zone and is the ultimate source of truth for it
- **Why can't a CNAME coexist with other records on the same name?** Because a CNAME says "this name is an alias for another name" — if other records also existed there, resolvers wouldn't know whether to follow the alias or answer directly, so the spec forbids the ambiguity
- **What does a low TTL cost you?** More frequent queries hitting your authoritative nameservers (and your resolver's cache being less effective), trading a little infrastructure load for faster propagation of future changes
- **How does a CDN use DNS to route users to the nearest server?** Many use `CNAME`s pointing at the CDN's own domain, which the CDN's own authoritative nameservers then resolve differently per requester, often using the resolver's location (or EDNS Client Subnet data) as a proxy for the user's location
- **What is a "glue record"?** An `A`/`AAAA` record for a nameserver that's itself inside the domain it serves (e.g. `ns1.example.com` for `example.com`) — provided directly by the parent zone to avoid a circular lookup where resolving the nameserver's address requires already knowing the nameserver's address

## Real-World Scenario: Subdomain Takeover
A team points `promo.example.com` at a third-party landing-page host via CNAME, runs a campaign, then later cancels the third-party service without removing the DNS record. The CNAME now points at a hostname the team no longer controls. If that hosting platform allows new customers to claim arbitrary subdomains (many do, by design, for their legitimate customers), an attacker can register the exact same hostname on that platform and have `promo.example.com` start serving their content — phishing, malware, or just defacement — with a domain that still shows the company's real, trusted name. The fix is boring but essential: remove DNS records the moment the resource they point to is decommissioned, and periodically audit for CNAMEs pointing at unclaimed targets.

## DNS in the Deployment Pipeline
- Domain verification for services like email providers (SPF/DKIM), TLS certificate issuance (`CAA`, and ACME's `DNS-01` challenge), and third-party integrations (Slack, Google Workspace) is almost always done via a `TXT` record proving control of the domain
- Blue-green or canary deployments sometimes use DNS-level traffic shifting (weighted routing) instead of, or alongside, load balancer configuration — but DNS caching makes this a blunt instrument for fast rollback compared to a load balancer's instant switch
- Health-check-aware DNS (Route 53 health checks, Cloudflare load balancing) can automatically stop resolving to an unhealthy endpoint, acting as a coarse-grained failover mechanism at the DNS layer itself
- Split-horizon DNS — returning different answers for the same name depending on whether the query comes from inside or outside a private network — is common in corporate and Kubernetes-adjacent infrastructure, and a frequent source of "works on the VPN, not off it" confusion

## Common DNS Tools
| Tool | Purpose |
|---|---|
| `dig` | Detailed query and troubleshooting (Linux/macOS, available on Windows via installable packages) |
| `nslookup` | Simpler cross-platform query tool, built into Windows |
| `whois` | Looks up domain registration details — registrar, expiry, nameservers |
| `dnschecker.org` / similar | Checks a record's propagation across resolvers worldwide from a browser |
| `dig +trace` | Manually walks the resolution chain from root to authoritative, useful for diagnosing delegation problems |

## Common Interview Questions (continued)
- **What's the difference between an A record and a CNAME in terms of resolution cost?** An A record answers directly with an IP in one lookup; a CNAME requires the resolver to follow the chain to whatever it points at, potentially several more lookups if CNAMEs are chained, adding latency
- **Why do some providers say "don't CNAME your apex domain"?** Because the DNS spec requires the zone apex to carry `SOA` and `NS` records, which can't coexist with a `CNAME` on the same name — providers instead offer proprietary `ALIAS`/`ANAME` records that behave like a CNAME but are resolved server-side into a plain `A` record at query time
- **What does it mean for a resolver to be "authoritative" vs "non-authoritative"?** An authoritative answer comes directly from the nameserver responsible for that zone; a non-authoritative answer comes from a resolver's cache — functionally the same data, but the distinction matters when debugging whether a change has actually propagated to the source of truth yet

## Example
Pointing `yourapp.com`'s A record at your server's IP address, or a CNAME at your hosting provider. A typical deploy: `yourapp.com` -> A record -> `203.0.113.10`, and `www.yourapp.com` -> CNAME -> `yourapp.com`, both managed at Cloudflare while the domain itself stays registered at Namecheap.
