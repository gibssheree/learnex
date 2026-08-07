---
tags: [term, fullstack, devops]
category: DevOps & Delivery
---

# Docker (Containerization)

**Definition:** Packaging an app with everything it needs, dependencies, runtime, OS libraries, into a portable, isolated unit.

## How It Works
- A `Dockerfile` defines the environment: a base image, files to copy in, commands to run, and the process to start
- Building it produces an image, running the image produces a container that behaves the same anywhere
- Images are built in layers — each `Dockerfile` instruction (`RUN`, `COPY`, `ADD`) creates a new, immutable layer stacked on the previous one via a union filesystem (OverlayFS on Linux)
- Layers are content-addressed and cached: if a layer's inputs haven't changed, Docker reuses the cached layer instead of rebuilding it, which is why instruction *order* in a Dockerfile matters for build speed
- A running container gets a thin writable layer on top of the read-only image layers; anything written there is lost when the container is removed unless it's in a mounted volume
- Containers share the host's kernel (unlike VMs, which virtualize hardware and run a full guest OS) — isolation comes from Linux namespaces (PID, network, mount, UTS, IPC, user) and resource limits from cgroups
- `docker-compose.yml` (or the newer `compose.yml`) declares multiple services, networks, and volumes together so `docker compose up` can start an entire multi-container stack (app + database + cache) with one command

## Why It Matters
- Solves "works on my machine" — the same container runs identically in dev, staging, and production
- Decouples the app from the host OS: a container built on Debian can run unmodified on a host running Ubuntu, Amazon Linux, or Windows (via WSL2 or Hyper-V)
- Makes horizontal scaling mechanical — orchestrators like Kubernetes or ECS just run more copies of the same image behind a [[Load Balancer]]
- Massively simplifies onboarding: `docker compose up` replaces pages of "install Postgres, install Redis, set these 12 env vars" setup docs
- Enables reproducible CI pipelines — tests run inside the exact same image that eventually ships to production, eliminating a whole class of environment-drift bugs
- Isolates dependency versions per service, so two microservices needing different, conflicting library versions can coexist on the same host without a fight

## Common Pitfalls
- Bloated images from not cleaning up build layers
- Accidentally baking secrets into an image layer, still recoverable from image history even after "removing" them in a later layer
- Running processes as root inside the container by default, which widens the blast radius if the app is compromised — use `USER` in the Dockerfile to drop privileges
- Not pinning base image versions (`FROM node:latest` instead of `FROM node:20.11-alpine`), so builds silently change behavior weeks later when upstream ships a new "latest"
- Treating a container's filesystem as durable storage — data written inside a container without a volume mount vanishes on `docker rm`
- Putting `COPY . .` before `RUN npm install` in a Dockerfile, invalidating the dependency-install cache layer on every single code change instead of only on `package.json` changes
- Running a full OS image (`ubuntu`) as a base when a minimal one (`alpine`, `distroless`) would do, inflating image size and attack surface for no benefit
- Forgetting `EXPOSE` and port-publishing are different things — `EXPOSE` is documentation, `-p host:container` is what actually opens the port to the host

## Under the Hood
- The Docker daemon (`dockerd`) exposes an API that the `docker` CLI talks to; container execution itself is delegated to `containerd`, which in turn uses `runc` to actually create namespaces/cgroups and start the process — Docker is a UX layer over a chain of lower-level tools defined by the OCI (Open Container Initiative) spec
- Namespaces provide the *isolation* illusion: a PID namespace makes a container's process 1 appear to have no siblings; a network namespace gives it its own virtual interface, routing table, and loopback
- Cgroups (control groups) provide the *resource limiting*: `--memory`, `--cpus` flags translate directly into cgroup limits enforced by the kernel, not by Docker itself
- Image layers are stored content-addressably by SHA256 digest; two images sharing a base (e.g., both `FROM node:20-alpine`) share that layer on disk, so pulling a second image with a common base is fast
- Multi-stage builds let a Dockerfile use one stage (with a full compiler toolchain) to build an artifact, then `COPY --from=builder` that artifact into a slim final stage, so the compiler/toolchain never ships in the production image
- Docker Desktop on Mac/Windows actually runs a lightweight Linux VM under the hood, since containers fundamentally need a Linux kernel — "native" container support only exists on Linux hosts

## Variants
- **VMs vs. containers** — a VM virtualizes hardware and boots a full kernel per instance (heavier, stronger isolation); a container shares the host kernel (lighter, faster startup, weaker isolation boundary)
- **Podman** — a daemonless, rootless alternative to Docker with a largely compatible CLI, popular where running a root daemon is a security concern
- **containerd / CRI-O** — lower-level container runtimes that Kubernetes talks to directly via the Container Runtime Interface, without needing the full Docker daemon
- **Distroless images** — Google's minimal base images that contain only the app and its runtime dependencies, no shell, no package manager, shrinking attack surface

## Comparison

| Aspect | Docker Container | Virtual Machine |
|---|---|---|
| Boot time | Milliseconds–seconds | Tens of seconds–minutes |
| Isolation | Process-level (namespaces/cgroups) | Full hardware virtualization |
| Kernel | Shared with host | Own kernel per VM |
| Typical image size | MBs | GBs |
| Density per host | Dozens–hundreds | Single digits–tens |

## Best Practices
- Use multi-stage builds to keep production images small and free of build-time tooling
- Pin exact base image tags (or digests) rather than `latest`
- Add a `.dockerignore` to keep `node_modules`, `.git`, and build artifacts out of the build context
- Run as a non-root `USER` in the final image
- Combine related `RUN` commands with `&&` to minimize layer count, and clean up package manager caches in the same layer they were created (`apt-get install && rm -rf /var/lib/apt/lists/*`)
- Add a `HEALTHCHECK` so orchestrators can detect a container that's running but not actually serving traffic
- Scan images for known CVEs (`docker scout`, Trivy, Snyk) as part of CI, not as an afterthought
- Pass secrets at runtime via [[Environment Variables]] or a mounted secret, never via `ARG`/`ENV` baked into the image

## FAQ
**Do I need Docker if I already use a VM for deployment?**
Often yes — a VM gives you a host; Docker gives you reproducible, isolated processes *on* that host, plus easy horizontal scaling and dependency isolation between multiple apps sharing the VM.

**Why is my image so much bigger than expected?**
Usually leftover build tooling, unpinned `latest` base images that pull in more than needed, or not using multi-stage builds — check with `docker history <image>` to see per-layer size contribution.

**Can two containers share a volume?**
Yes — named volumes can be mounted into multiple containers simultaneously, which is how, e.g., a web server and a log-shipping sidecar container both read the same log directory.

**Why does `docker build` sometimes ignore my changes?**
Layer caching — if an earlier layer (like `COPY package.json` + `npm install`) hasn't changed, Docker reuses the cached result, so a change buried in a later `COPY . .` step won't retrigger earlier steps but will invalidate everything after it.

**Why did my container exit immediately after starting?**
A container's lifecycle is tied to its main process (PID 1) — the moment that process exits, the container stops, regardless of other background processes it may have spawned. This trips up people trying to run a container with no long-lived foreground process keeping it alive.

**Is it safe to run a database in a container in production?**
Technically yes with a properly configured persistent volume, but many teams prefer a managed database service in production and reserve containerized databases for local dev/CI — orchestrators can reschedule a container onto a different node, and stateful workloads need extra care (persistent volume claims, StatefulSets) that stateless app containers don't.

## History
- Containers predate Docker by decades — FreeBSD jails (2000) and Linux VServer/OpenVZ offered process isolation years earlier, but each required deep OS-specific expertise to use
- Linux cgroups, contributed by Google engineers starting in 2006, and namespaces, developed across the 2000s, are the actual kernel primitives that make containers possible — Docker (released 2013) didn't invent isolation, it packaged existing kernel features behind a usable CLI and a shareable image format
- Docker's image format and distribution model (layers, registries, `docker push`/`pull`) is what actually drove adoption — LXC (Linux Containers) had offered similar isolation before Docker but with a much rougher developer experience
- The rapid rise of Kubernetes (2014, originating from Google's internal Borg system) shifted the ecosystem from "run containers" to "orchestrate thousands of containers across a fleet," which in turn pushed the OCI (2015) to standardize image and runtime formats so the ecosystem wasn't locked to Docker's implementation specifically

## Real-World Example
A typical local development stack for a web app wires together several containers with Compose instead of installing Postgres, Redis, and Node directly on the host:

```yaml
# compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/app
    depends_on:
      - db
      - redis
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```
`docker compose up` builds the app image, starts Postgres and Redis, and wires them together on a private network where `app` can reach `db` and `redis` by service name — no manual IP configuration, and `docker compose down -v` tears the whole stack back down to nothing.

## Related Terms
- [[CI-CD|CI/CD]]
- [[Microservices vs Monolith]]
- [[Environment Variables]]
- [[Serverless]]

## Example
A Node app plus its exact Node version and dependencies, packaged so it runs the same on your laptop and on a cloud server.

## Code Example
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```
