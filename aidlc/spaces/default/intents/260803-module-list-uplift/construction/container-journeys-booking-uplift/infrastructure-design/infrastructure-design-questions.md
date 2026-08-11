# Infrastructure Design Questions - W4-01 (stage group: all four units)

## Source and Authority Alignment

This set consumes each unit's `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md` from NFR Design, plus `components.md`, `services.md`, and each unit's `business-logic-model.md`.

**On why one set covers four units.** A conductor judgment call, not a protocol entitlement — the same correction recorded at NFR Requirements applies. Infrastructure decisions here are topology-wide by nature: one Compose project, one edge, one shared shell, one session. Per-unit differences are expressed in the artifacts, and each unit's directory records the same answered file.

The catalogue-treatment question is **not** re-asked: recording non-applicable patterns with their reason is already the established practice from NFR Design and is now a persisted project correction. It applies here to the AWS/cloud catalogue (serverless, multi-region, CDN, auto-scaling, blue-green and canary deployment, feature flags, vault, replication) without needing a fresh decision.

## What Is Actually Being Built

Across all four units the real infrastructure delta is small and known from the `logical-components.md` handoffs:

- **U01, U02, U03**: no new infrastructure at all — existing Nginx locations, existing Compose services and health checks.
- **U04**: one new Nginx location, one new Compose service and app image, one internal service URL not exposed at the edge, and one dedicated assertion key distinct from the Charge key.
- **No** new database, volume, topic, cache, secret store, network, or AWS resource anywhere.

## Questions

### Q1. What is the deployment architecture artifact actually describing?

A. Describe the real `linercore-wave-a` Compose topology as the deployment architecture — services, the Nginx prefix map, base paths and asset resolution, internal service URLs, health checks, and the manager-demo guard — plus the exact U04 additions, and state that no cloud, orchestration, multi-region, environment-promotion, or IaC target exists because NFR-012 confines acceptance to this local project and `technology-stack.md` forbids inferring a production runtime (recommended)
B. Design an AWS target architecture for a future deployment
C. Describe a dev/staging/prod environment ladder
D. Defer deployment architecture to the Operation phase
X. Other (please specify)

[Answer]: A - Describe the real linercore-wave-a Compose topology plus U04 additions; no cloud, orchestration, or IaC target claimed (Recommended) - 2026-08-11T08:58:55Z - **Mode:** guided - User response: `A. The real Compose topology (Rec)`

### Q2. What does monitoring design cover with no observability platform in the stack?

A. Design what NFR-010 actually requires and the stack can carry: correlation-ID propagation from the edge through BFF to provider, typed outcome distinction in logs (denied, validation, conflict, unavailable, stale, not-found, unexpected) without leaking payloads, safe UI-facing reference evidence, and the evidence artifacts the acceptance gates consume (the warmed p95 sample, audit and demo-guard output) — and record that metrics backends, log aggregation, distributed tracing, dashboards, SLI/SLO tracking, and alerting are absent because no such component exists in the verified stack and NFR-012 forbids claiming one (recommended)
B. Design a metrics, tracing, and dashboard stack to be added
C. Define SLIs, SLOs, and alert thresholds
D. Defer all monitoring to Observability Setup (4.4)
X. Other (please specify)

[Answer]: A - Design what NFR-010 requires and the stack can carry; record absent observability components explicitly (Recommended) - 2026-08-11T08:58:55Z - **Mode:** guided - User response: `A. What NFR-010 requires (Rec)`

### Q3. Where is the boundary between this stage's `cicd-pipeline.md` and stage 3.7 CI Pipeline?

A. Scope this artifact to the infrastructure-facing CI concerns only — which gates must block a merge and what they need from the environment (the isolated Compose project, seeded fixtures, the manager-demo guard before and after, image build for the new CMM app, and secret handling for the assertion key in CI) — and explicitly hand pipeline authoring, stage wiring, job definitions, and artifact management to stage 3.7, naming the required gates so 3.7 implements rather than rediscovers them (recommended)
B. Author the full pipeline definition here and treat 3.7 as review
C. Defer everything CI-related to 3.7 and leave this artifact minimal
D. Design a blue-green or canary deployment strategy
X. Other (please specify)

[Answer]: A - Infrastructure-facing CI gates and their environment needs; pipeline authoring handed to stage 3.7 by name (Recommended) - 2026-08-11T08:58:55Z - **Mode:** guided - User response: `A. Infra-facing gates only (Rec)`

### Q4. What belongs in `shared-infrastructure.md`?

A. The artifact is conditional on units sharing infrastructure, and they genuinely do — so record the real shared resources with their ownership and access boundaries: the one Compose project and its network, the single Nginx edge and its shared header-policy include, the host-wide session cookie, the shared `@erp/ui` shell package, the Reference service serving both U03 and U04, and the existing Kafka topics with their unowned poison/replay gap; state for each who owns it, which units depend on it, and what its failure does to the others (recommended)
B. Omit the artifact because W4 adds no shared infrastructure
C. Propose new shared infrastructure to be provisioned
D. List only the Compose services without ownership or coupling
X. Other (please specify)

[Answer]: A - Record the genuine shared resources with ownership, dependent units, and cross-unit failure effect (Recommended) - 2026-08-11T08:58:55Z - **Mode:** guided - User response: `A. Real shared resources + ownership (Rec)`

## Ambiguity Analysis Placeholder

After answers are recorded, they will be checked against each unit's NFR Design artifacts, `services.md`'s topology and known event-control gap, NFR-011's evidence-integrity rule, and NFR-012's deployment boundary. An answer that implies a cloud runtime, a new persistent component, or an operational surface that does not exist must be resolved before generating the five per-unit artifacts.
