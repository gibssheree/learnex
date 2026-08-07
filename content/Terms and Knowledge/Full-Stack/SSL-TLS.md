---
tags: [term, fullstack, security, infrastructure]
category: DevOps & Delivery
---

# SSL/TLS (HTTPS)

**Definition:** The encryption protocol that secures data traveling between browser and server, the "S" in HTTPS.

## How It Works
- A certificate proves the server's identity
- A handshake establishes an encrypted channel before any data is sent
- The handshake starts with the client and server agreeing on a TLS version and cipher suite (`ClientHello` / `ServerHello`), then the server presents its certificate, then both sides derive a shared symmetric key
- Certificates are issued and digitally signed by a Certificate Authority (CA) — DigiCert, Let's Encrypt, Google Trust Services — and the browser trusts the certificate because it trusts the CA (via a preinstalled root certificate store)
- Certificates bind a public key to a domain name and an expiry date; the private key that matches it never leaves the server, and losing control of that private key means an attacker can impersonate the site until the certificate is revoked
- Actual data transfer uses fast symmetric encryption (AES-GCM or ChaCha20-Poly1305); the slower asymmetric cryptography (RSA/ECDHE) is only used during the handshake to safely agree on that symmetric key
- TLS also provides integrity, not just confidentiality — a MAC (message authentication code) on every record detects tampering in transit, so an attacker can't silently flip bits even if they can't read the content
- Session resumption avoids repeating the full handshake on every connection: TLS 1.2 used session IDs or session tickets, TLS 1.3 uses pre-shared keys derived from a prior handshake, letting a returning client skip straight to encrypted data with minimal round trips

## Why It Matters
- Protects passwords, tokens, and personal data from being read or tampered with in transit; also an SEO and trust requirement now
- Without TLS, anyone on the network path — a coffee shop Wi-Fi router, an ISP, a compromised network hop — can read every request and response in plaintext, including auth cookies and API keys
- Browsers actively penalize plaintext HTTP: Chrome marks it "Not Secure" in the address bar, and several powerful browser APIs (geolocation, service workers, clipboard access) are simply unavailable outside a "secure context" (HTTPS or localhost)
- Google has confirmed HTTPS as a (minor) ranking signal since 2014, and most modern CDNs, HTTP/2, and HTTP/3 effectively require TLS to function at all
- It underwrites trust in a way users can partially verify themselves — clicking the padlock icon shows who issued the certificate and to which domain, which matters for anti-phishing awareness even though most users never check
- Compliance regimes make it non-optional in practice: PCI-DSS (payment card handling), HIPAA (health data), and most SOC 2 audits explicitly require encryption in transit, and auditors will flag plaintext HTTP or outdated TLS versions as findings

## Common Pitfalls
- Letting a certificate expire, which breaks the site with scary browser warnings until renewed
- Mixed content: loading an HTTPS page that pulls in an HTTP image, script, or stylesheet — browsers block or warn on this, and it silently reintroduces a plaintext attack surface
- Misconfigured intermediate certificate chains — the leaf certificate is valid, but the server doesn't send the intermediate CA certificate, so some clients (especially older ones) fail to build a trust path even though the cert "looks fine" in a browser that already cached the intermediate
- Using self-signed certificates in production instead of internal/dev environments — browsers and most HTTP clients will reject them outright without an explicit trust override
- Terminating TLS at a load balancer and then assuming the rest of the internal network is automatically safe — internal traffic between services often still needs its own TLS (mTLS) in a zero-trust setup
- Ignoring certificate/key file permissions on disk — a world-readable private key file undermines every guarantee TLS provides, regardless of how strong the cipher suite is
- Weak or outdated configuration: still allowing TLS 1.0/1.1 or deprecated cipher suites, which fail modern compliance scans (PCI-DSS) and are vulnerable to known downgrade attacks
- Forgetting that a wildcard cert only covers one level of subdomain — `*.example.com` covers `api.example.com` but not `api.staging.example.com`, a surprisingly common source of "why won't this cert work" tickets
- Hardcoding certificate paths or expiry-sensitive logic in application code instead of letting the reverse proxy / load balancer own TLS termination, which usually has better tooling for rotation

## Under the Hood: The Handshake
1. **ClientHello** — client sends supported TLS versions, cipher suites, and a random value
2. **ServerHello** — server picks a TLS version and cipher suite, sends its own random value and its certificate (chain)
3. **Key exchange** — with modern TLS 1.3, both sides use Diffie-Hellman (ECDHE) to derive a shared secret; earlier RSA-based key exchange (no longer recommended) had the client encrypt a secret with the server's public key instead
4. **Certificate verification** — the client validates the certificate chain up to a trusted root, checks the domain name matches, and checks it isn't expired or revoked
5. **Finished** — both sides confirm the handshake wasn't tampered with, then switch to encrypted communication using the derived symmetric session key
- TLS 1.3 (2018) cut this to effectively one round trip (versus two for TLS 1.2), and supports "0-RTT" resumption for repeat connections, trading a small replay-attack risk for latency
- Perfect Forward Secrecy (PFS), which ECDHE provides and static RSA key exchange doesn't, means that even if the server's private key is later stolen, past recorded traffic can't be decrypted — each session's key is ephemeral

## History
- SSL 1.0 (Netscape, 1994) was never publicly released due to serious security flaws
- SSL 2.0 (1995) shipped but had known weaknesses within a year; SSL 3.0 (1996) fixed most of them and became widely deployed
- TLS 1.0 (1999) was essentially SSL 3.0 standardized and renamed by the IETF — Netscape's protocol became an open standard, partly to keep it out of any one company's control
- TLS 1.1 (2006) and 1.2 (2008) incrementally hardened the protocol against newly discovered attacks (BEAST, CRIME, POODLE all targeted earlier versions)
- TLS 1.3 (2018) was a larger redesign: it removed support for known-weak ciphers entirely (no more RC4, no more static RSA key exchange), cut the handshake to one round trip, and made forward secrecy mandatory rather than optional
- POODLE (2014) is the attack that finally killed SSL 3.0 in practice — it exploited a padding oracle in CBC-mode ciphers to let an attacker decrypt small amounts of traffic; it's the textbook example of why deprecated protocol versions need to be actively disabled, not just superseded

## Certificate Types
- **Domain Validated (DV)** — CA only verifies you control the domain (via DNS record or file upload); fast, often free (Let's Encrypt), good enough for most sites
- **Organization Validated (OV)** — CA verifies the requesting organization is real; slower, costs money, mostly cosmetic trust benefit today
- **Extended Validation (EV)** — rigorous legal/business verification; browsers used to show the company name in the address bar, but most stopped highlighting this distinction around 2019 because users didn't notice or understand it
- **Wildcard certificates** (`*.example.com`) — cover all first-level subdomains with one certificate, convenient but a single compromised key exposes every subdomain
- **Multi-domain (SAN) certificates** — one certificate covering several unrelated domain names via the Subject Alternative Name extension
- **Self-signed certificates** — signed by their own private key instead of a CA; fine for local development or internal-only tooling, but browsers and HTTP clients reject them by default because there's no chain of trust to verify

## Certificate Chain of Trust
A browser doesn't trust your server's certificate directly — it trusts a small set of root CA certificates baked into the OS or browser. Your server presents a chain: leaf certificate (yours) → one or more intermediate CA certificates → a root CA certificate the client already trusts. Root CAs keep their private keys offline and heavily protected precisely because a compromised root would let an attacker mint trusted certificates for any domain on earth; intermediates exist so the root's signing key is used as rarely as possible.

## Variants
- **mTLS (mutual TLS)** — both client and server present certificates, so the server authenticates the client too, not just the reverse; common for service-to-service traffic in microservices and zero-trust networks (service meshes like Istio enable this by default)
- **DTLS (Datagram TLS)** — TLS adapted for UDP instead of TCP, used where connection-oriented TLS doesn't fit (WebRTC media streams, some VPNs); has to handle packet loss and reordering that TLS-over-TCP doesn't worry about
- **SNI (Server Name Indication)** — an extension sent in the ClientHello so a server can present the right certificate when multiple HTTPS sites share one IP address; without it, TLS termination couldn't distinguish which of several hosted domains a request is for before the handshake completes
- **ECH (Encrypted Client Hello)** — a newer extension that encrypts the SNI field itself, closing a long-standing privacy gap where the domain name was visible in plaintext even over an otherwise encrypted connection
- **QUIC / HTTP/3** — bundles TLS 1.3 directly into the transport layer (built on UDP instead of TCP), removing the separate TCP handshake plus TLS handshake round trips that HTTP/2 needed

## Comparison: SSL vs TLS

| | SSL | TLS |
|---|---|---|
| Status | Deprecated, insecure | Current standard |
| Versions | SSL 2.0, 3.0 | TLS 1.0 through 1.3 |
| Still used? | No — disabled everywhere | Yes, TLS 1.2/1.3 in production |
| Common usage | The term persists colloquially ("SSL certificate") | The actual protocol in use today |

"SSL" is the term everyone still says out of habit — the protocol itself has been TLS since 1999. TLS 1.0/1.1 are themselves now deprecated (officially by browsers and PCI-DSS since 2020/2021); TLS 1.2 and 1.3 are what production systems should run.
Most CDN and cloud provider dashboards (Cloudflare, AWS ACM) still label the settings page "SSL/TLS" for user familiarity even though every option underneath configures TLS behavior.

## Code Example
```bash
# Check what TLS version and cipher a server negotiates
openssl s_client -connect example.com:443 -tls1_3

# Inspect a certificate's issuer, validity dates, and SANs
openssl s_client -connect example.com:443 -servername example.com \
  </dev/null 2>/dev/null | openssl x509 -noout -issuer -dates -ext subjectAltName
```

```nginx
# Minimal modern TLS termination config (nginx)
server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
}
```

## Cipher Suites Explained
A TLS 1.2 cipher suite name like `TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256` encodes four decisions in one string:
- `ECDHE` — the key exchange algorithm (elliptic-curve Diffie-Hellman, ephemeral — provides forward secrecy)
- `RSA` — the authentication algorithm (the server proves identity using its RSA certificate key)
- `AES_128_GCM` — the bulk encryption cipher and mode (AES with 128-bit keys, in GCM mode, which gives both encryption and built-in integrity)
- `SHA256` — the hash function used for the handshake's message authentication
TLS 1.3 simplified this dramatically — it dropped the key exchange and authentication algorithm from the cipher suite name entirely (those are negotiated separately) and cut the list of allowed suites from dozens down to five, all using AEAD ciphers (AES-GCM or ChaCha20-Poly1305), removing an entire category of historical misconfiguration.

## Best Practices
- Automate renewal — Let's Encrypt certificates last 90 days by design specifically to force automation (via `certbot` or ACME clients) instead of relying on someone remembering to renew a 1-year cert
- Disable TLS 1.0 and 1.1 entirely; support only TLS 1.2 and 1.3
- Set `Strict-Transport-Security` (HSTS) headers so browsers refuse to ever connect over plain HTTP again for that domain, closing the window for downgrade attacks
- Monitor certificate expiry with uptime/monitoring tools, don't rely on manual tracking — an expired cert is one of the most common self-inflicted outages
- Use OCSP stapling so the server proactively supplies revocation status, avoiding a slow client-side revocation check on every connection
- Pin your CDN or reverse proxy's TLS config to a known-good baseline (Mozilla's SSL Configuration Generator is a common reference) rather than hand-picking cipher suites from memory
- Redirect all HTTP traffic to HTTPS at the edge (a 301 redirect plus HSTS), rather than relying on the application layer to enforce it consistently across every route

## FAQ
- **Is SSL the same as TLS?** No, TLS is the successor to SSL — SSL 2.0/3.0 are broken and disabled everywhere, but "SSL certificate" remains the common (technically inaccurate) name for a TLS certificate.
- **Does HTTPS encrypt the URL path and query string?** Yes, the entire request (path, query string, headers, body) is encrypted — only the destination IP and the domain name (via SNI, unless ECH/encrypted SNI is used) are visible to network observers.
- **Do I need HTTPS on a purely internal API?** Increasingly yes — zero-trust architectures assume the internal network can be compromised too, so mutual TLS (mTLS) between services is now common practice, not just at the edge.
- **What's the difference between encryption and authentication here?** TLS gives you both: encryption (nobody can read the traffic) and authentication (the certificate proves you're actually talking to the domain you think you are) — losing either one defeats the purpose.
- **What happens if a certificate is compromised before it expires?** The CA can revoke it; clients check revocation via CRLs (certificate revocation lists) or the faster OCSP protocol, though revocation checking is historically unreliable, which is part of why short-lived certificates (Let's Encrypt's 90-day default) are now favored over revocation as the primary defense.

## Real-World Example
Certificate Transparency (CT) logs are a good example of the ecosystem hardening itself after a real incident: after CA compromises (notably DigiNotar in 2011, which let attackers issue fraudulent certificates for `google.com` used to spy on Iranian users) the industry built public, append-only logs of every certificate any trusted CA issues. Chrome now requires new certificates to appear in CT logs or it won't trust them — anyone, including the real domain owner, can monitor the logs and notice if a rogue certificate for their domain gets issued without their knowledge.

## Common Interview Questions
- **Why is asymmetric encryption only used during the handshake, not for the whole session?** It's computationally far more expensive than symmetric encryption; TLS uses it just long enough to safely exchange a symmetric key, then switches to fast symmetric ciphers (AES-GCM) for the actual data.
- **What does "terminating TLS" at a load balancer mean?** The load balancer decrypts incoming HTTPS traffic and forwards it as plain HTTP to backend servers on a trusted internal network — simplifies certificate management (one place to renew) but means internal traffic is unencrypted unless you add mTLS.
- **What's a man-in-the-middle attack, and how does TLS prevent it?** An attacker intercepts and possibly alters traffic between two parties; TLS prevents it via certificate validation — the client checks the server's certificate is signed by a trusted CA and matches the domain, so an attacker without the real private key can't impersonate the server undetected.
- **Why does TLS 1.3 remove RSA key exchange?** RSA key exchange doesn't provide forward secrecy — if the server's private key is ever compromised, an attacker who recorded past traffic can decrypt it retroactively. ECDHE generates a fresh ephemeral key per session, so a later key compromise doesn't unlock old traffic.

## Related Terms
- [[DNS]]
- [[Reverse Proxy]]
- [[Load Balancer]]
- [[Environment Variables]]

## Example
Let's Encrypt providing free, auto-renewing SSL certificates for a website. In practice: a Node.js app behind an nginx reverse proxy that terminates TLS, so the app itself only ever speaks plain HTTP on `localhost`, while nginx handles the certificate, the handshake, and forces HTTP-to-HTTPS redirects for every external request.
A `certbot renew` cron job (or the ACME client baked into most modern hosting platforms) typically runs twice daily, well ahead of the 90-day Let's Encrypt expiry window, so renewal happens automatically long before anyone would notice a problem.
Static hosts like Vercel, Netlify, and Cloudflare Pages go a step further and manage the entire certificate lifecycle transparently — provisioning, renewal, and even ECH support — so most frontend-only projects never touch a certificate file directly.
