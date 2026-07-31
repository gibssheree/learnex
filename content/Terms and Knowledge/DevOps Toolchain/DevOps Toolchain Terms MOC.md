---
tags: [moc, platform, devops]
---

# DevOps Toolchain MOC

11 concrete tools across 5 categories, same comparison template as [[Cloud Platforms Terms MOC|Cloud Platforms]]. Where [[Cloud and Infrastructure Terms MOC|Cloud and Infrastructure]] explains the *idea* of IaC, CI/CD, and observability, this folder covers the actual tools you'd install and run.

## IaC & Config Management
- [[Terraform]]
- [[Ansible]]

## CI/CD Tools
- [[GitHub Actions]]
- [[GitLab CI-CD|GitLab CI/CD]]
- [[Jenkins]]

## Monitoring & Observability
- [[Prometheus]]
- [[Grafana]]
- [[Datadog]]

## Container Tooling
- [[Docker Compose]]
- [[Helm]]

## Server Administration & CLI
- [[Linux Server Commands]]

---

## How to use this
Pair this with [[Cloud Platforms Terms MOC|Cloud Platforms]] — that folder is *where* your infrastructure runs, this one is *how* you provision, deploy, and watch it.

## Suggested order if starting from zero
1. **Docker Compose** — the first real DevOps tool most developers touch, run a whole stack locally
2. **GitHub Actions** — easiest CI/CD entry point if your code is already on GitHub
3. **Terraform** — once you're provisioning real cloud infrastructure by hand more than twice, automate it
4. **Prometheus + Grafana** — the open-source standard pairing for metrics and dashboards
5. **Ansible, Helm, Jenkins, GitLab CI/CD, Datadog** — as the specific project or job calls for them
