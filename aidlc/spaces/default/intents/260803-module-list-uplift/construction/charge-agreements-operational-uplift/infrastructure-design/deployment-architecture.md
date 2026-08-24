# Deployment Architecture - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q1, this describes the **real** `linercore-wave-a` Compose topology as U03's deployment architecture, not a cloud target.

**Consumed inputs.** `logical-components.md` supplies the component inventory this topology hosts; `services.md` supplies the deployable and ownership map; `components.md` supplies the edge mount and shell composition rules; `security-design.md` supplies the edge header policy and internal-call boundary; `performance-design.md` supplies the base-path and fail-fast properties the topology must preserve; `scalability-design.md` confirms one instance per app with no scaling surface; `reliability-design.md` supplies the target-scoped failure expectation; and `business-logic-model.md` supplies the routes being served.

## U03's Infrastructure Delta

U03 adds no container, image, service, network, volume, port, or secret. Two corrections to an earlier draft of this artifact, both verified against the repository rather than assumed from the approved design:

| Item | Current state (verified) | Required change | Owner |
| --- | --- | --- | --- |
| Edge header policy | `infrastructure/nginx/default.conf` sets four headers on the Charge locations and **clears none**; there is no shared include | Introduce the shared include (eleven cleared, five set) across every public location | Platform/operations — the same delta U01 records |
| Charge `basePath` | **Already correct** — `apps/charge-agreements/next.config.mjs` sets `basePath: "/charge-agreements"` | None | — |

The four legacy Charge routes are an **application** change, not infrastructure, and are also not yet in place: `apps/charge-agreements/app/agreements/[agreementId]/` and `.../new/` are live duplicate pages today, not 308 handlers. That correction is recorded below rather than left as an implied fact.

## Compute Model

Containers on a single Docker Compose project. No serverless, no orchestrator, no VM fleet, no multi-region, no environment ladder. One instance of each service; no replicas.

| Concern | This topology |
| --- | --- |
| Compute | Docker Compose services on one host |
| Environments | One — the isolated `linercore-wave-a` acceptance project |
| Scaling | None; one instance per service |
| IaC | Compose file plus the approved wrapper scripts; no Terraform/CDK/CloudFormation |
| Promotion | None; there is no staging or production target in scope |

## Network Topology

```
browser
  |
  v
[ Nginx edge ] -- one host, one entry URL
  |  /                      -> apps/shell
  |  /booking*              -> apps/shell
  |  /reference-data*       -> apps/reference-data
  |  /charge-agreements*    -> apps/charge-agreements   <-- U03
  |  /container-movement*   -> apps/container-movement  (added by U04)
  |
  v (internal network only — never exposed at the edge)
[ charge-agreement-service ] -> [ Charge PostgreSQL ]
[ reference-data-service ]   -> [ Reference PostgreSQL ]
[ identity-service ]         -> [ Identity PostgreSQL ]
```

The Charge app's BFF reaches the Charge service and the Reference service over the internal Compose network. Those calls do not traverse the public edge and therefore do not receive the public header policy — they set their own trust headers, which is why the two paths cannot be confused.

## Edge Configuration for `/charge-agreements*`

| Property | Value |
| --- | --- |
| Location | `/charge-agreements*` |
| Upstream | `apps/charge-agreements` |
| Next `basePath` | `/charge-agreements` — **already set** in `next.config.mjs`; matches the prefix |
| Assets | `/charge-agreements/_next/*`; no edge rewriting — current behaviour |
| Header policy | **Target**: the shared include (eleven cleared, five set). **Current**: four set, none cleared, no include. Platform delta |
| Cookie | Host-wide session, `Path=/`, forwarded normally — current and unchanged |
| Root response | 200 — current config proxies `= /charge-agreements` and `^~ /charge-agreements/` |
| Legacy routes | **Target**: four approved 308 redirects; every other alleged legacy path 404s. **Current**: `app/agreements/[agreementId]/` and `app/agreements/new/` render live duplicate pages — the redirects are not built yet |

Once introduced, the shared include is what stops a new mount from omitting sanitation, because it applies by inclusion rather than by remembering. Today no location has it.

## Storage

U03 provisions no storage. The Charge service owns its PostgreSQL database and its volume; U03 reads and commands through the service's HTTP contract and never touches the database or its volume directly. No new volume, bucket, or file mount.

## Health and Readiness

The Charge app exposes a base-path-aware internal `/api/health` used by the container health check. It authorizes nothing and is not a readiness proxy for domain routes — a healthy container with a failing Identity or Charge service still serves correct failure states, which is the designed behaviour rather than a gap.

## Deliberately Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| AWS target architecture | W4 makes local acceptance claims only; AWS mapping is NOT APPLICABLE | `services.md`, NFR-012 |
| Serverless / managed compute | No cloud runtime; verified stack is containers on Compose | `technology-stack.md`, NFR-012 |
| Multi-region / multi-AZ | Single local host | NFR-012 |
| Dev/staging/prod ladder and promotion | One acceptance environment exists | NFR-012 |
| Auto-scaling / replica policy | One instance per service; no scaling surface | `scalability-design.md` |
| Terraform / CDK / CloudFormation | No cloud resource to declare; Compose plus wrapper scripts is the whole IaC surface | `services.md` |
| CDN / edge caching | No public hosting; caching forbidden | NFR-012; Application Design (no cache) |
| Load balancer / service mesh | One instance per service; Nginx is a prefix router, not a balancer | `services.md` |
| Blue-green / canary | No second environment to shift traffic between | NFR-012 |

## Verification

Direct load and refresh of every U03 canonical route under the prefix, asset resolution under `/charge-agreements/_next/*`, the four 308 redirects and the 404 matrix, header spoof rejection at the edge, target-scoped failure (a Charge-location failure leaves other prefixes serving), and container health check behaviour. All observed on the running Compose project; per NFR-011, container startup alone is not acceptance.
