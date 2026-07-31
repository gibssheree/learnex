---
tags: [term, security, vulnerabilities]
category: Application Security & Vulnerabilities
subcategory: Application Security
---

# OWASP Top 10 Security Risks

**Definition:** A regularly updated awareness document representing the 10 most critical web application security risks.

## How It Works
- 1. Broken Access Control: failing to enforce access permissions
- 2. Cryptographic Failures: weak algorithms or exposed sensitive data
- 3. Injection (SQLi, Command Injection): untrusted input interpreted as code
- 4. Insecure Design: missing threat modeling during development
- 5. Security Misconfiguration: default credentials, open S3 buckets
- 6. Vulnerable Components: outdated libraries with CVE vulnerabilities
- 7. Identification & Auth Failures: weak session/passwords
- 8. Software Integrity Failures: untrusted CI-CD pipelines
- 9. Security Logging Failures: missing audit logs
- 10. SSRF (Server-Side Request Forgery): server tricked into making requests to internal network

## Why It Matters
- Serves as standard baseline checklist for web application security hardening

## Common Pitfalls
- Trusting user input without strict server-side sanitization and parameterization

## Related Terms
- [[Threat Modeling (STRIDE)]]
- [[Buffer Overflow and Memory Safety]]

## Example
Using parameterized SQL prepared statements `SELECT * FROM users WHERE id = ?` to prevent SQL Injection.
