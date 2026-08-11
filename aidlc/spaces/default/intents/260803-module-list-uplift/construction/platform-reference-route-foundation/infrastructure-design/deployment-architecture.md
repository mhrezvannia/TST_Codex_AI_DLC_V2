# Deployment Architecture - U01 Platform and Reference Route Foundation

## Source Alignment

Per the answered Q1, this describes the **real** `linercore-wave-a` Compose topology as U01's deployment architecture, not a cloud target.

**Consumed inputs.** `logical-components.md` supplies the component inventory this topology hosts and the 3.4 handoff; `services.md` supplies the deployable and ownership map; `components.md` supplies the edge mount and shell composition rules; `security-design.md` supplies the edge header policy and the internal-call boundary; `performance-design.md` supplies the base-path and platform-baseline properties; `scalability-design.md` confirms one instance with no scaling surface; `reliability-design.md` supplies the target-scoped failure expectation; and `business-logic-model.md` supplies the routes served.

## U01's Infrastructure Delta

U01 adds no container, image, service, network, volume, port, or secret. It does, however, require **three changes to existing infrastructure** — verified against the current `infrastructure/nginx/default.conf`, `apps/reference-data/next.config.mjs`, and `compose.yaml` rather than assumed from the approved design.

| # | Current state (verified) | Required change | Owner |
| --- | --- | --- | --- |
| 1 | The edge sets four headers (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) and **clears none**. There is no shared include and no `X-Forwarded-For`. | Introduce the platform-owned shared include: clear the exact eleven inbound trust headers, then set the five trusted values. Apply it to every public location. | Platform/operations |
| 2 | `apps/reference-data/next.config.mjs` sets **no `basePath`**. The prefix is stripped at the edge by a trailing-slash `proxy_pass` (`proxy_pass http://apps-reference-data:3000/`). | Set `basePath: "/reference-data"` and change the proxy target to preserve the prefix, per `components.md`. Charge already does this; Reference does not. | Reference (U01) + platform |
| 3 | The `apps-reference-data` Compose service has **no `healthcheck:` block**, unlike shell, booking, and charge-agreements. | Add a base-path-aware `/api/health` check consistent with the other apps. | Platform/operations |

Recording these as deltas rather than as description is the point: an earlier draft of this artifact described the approved design as though it already existed, which would have told Code Generation there was nothing to do.

U01 is also where the topology is **first exercised end to end**, so this artifact is the reference description the other three units inherit rather than restate.

## Compute Model

Containers on a single Docker Compose project. No serverless, orchestrator, VM fleet, multi-region, or environment ladder. One instance of each service; no replicas.

| Concern | This topology |
| --- | --- |
| Compute | Docker Compose services on one host |
| Environments | One — the isolated `linercore-wave-a` acceptance project |
| Scaling | None; one instance per service |
| IaC | Compose file plus approved wrapper scripts; no Terraform/CDK/CloudFormation |
| Promotion | None; no staging or production target in scope |

## Network Topology

```
browser
  |
  v
[ Nginx edge ] -- one host, one entry URL
  |  /                    -> apps/shell
  |  /booking*            -> apps/shell
  |  /reference-data*     -> apps/reference-data      <-- U01
  |  /charge-agreements*  -> apps/charge-agreements
  |  (/container-movement* added by U04)
  |
  v (internal network only)
[ reference-data-service ] -> [ Reference PostgreSQL ]
[ identity-service ]       -> [ Identity PostgreSQL ]
```

BFF-to-service calls traverse the internal network, bypass the public edge, and set their own trust headers — which is why the public header policy and internal trust material cannot be confused.

## Edge Configuration for `/reference-data*`

| Property | Value |
| --- | --- |
| Location | `/reference-data*` |
| Upstream | `apps/reference-data` |
| Next `basePath` | **Target**: `/reference-data`, matching the prefix. **Current**: unset — the edge strips the prefix via trailing-slash `proxy_pass`. This is delta #2 |
| Assets | **Target**: `/reference-data/_next/*` with no edge rewriting. **Current**: resolved through the stripping proxy |
| Header policy | **Target**: the shared include — eleven headers cleared, five set. **Current**: four headers set, none cleared. This is delta #1 |
| Cookie | Host-wide session, `Path=/` — current and unchanged |
| Root response | 200. Current config returns 308 from `= /reference-data` to `/reference-data/`, which the target proxy change should preserve or make unnecessary |
| Legacy routes | No Reference redirect; invalid query is canonicalized by dropping unknown values, never redirected to a guessed record |

Once introduced, the shared include is what makes sanitation inheritable — U04's later mount would get it by inclusion rather than by remembering. That property is a reason to build it now, not evidence that it exists.

## Storage

U01 provisions no storage. The Reference service owns its PostgreSQL database and volume; U01 reads through the service's HTTP contract only.

## Health and Readiness

The Reference app exposes an internal `/api/health` route (it exists in source at `apps/reference-data/app/api/health/route.ts`). It authorizes nothing and is not a readiness proxy for domain routes.

**Current gap**: the `apps-reference-data` Compose service declares no `healthcheck:` block, so that route is not actually wired to a container health check the way shell, booking, and charge-agreements are. Delta #3 closes it. The route existing and the check being configured are two different facts, and only the first is true today.

## Deliberately Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| AWS target architecture | Local acceptance claims only; AWS mapping is NOT APPLICABLE | `services.md`, NFR-012 |
| Serverless / managed compute | Verified stack is containers on Compose | `technology-stack.md` |
| Multi-region / multi-AZ | Single local host | NFR-012 |
| Environment ladder and promotion | One acceptance environment | NFR-012 |
| Auto-scaling / replicas | One instance; no scaling surface | `scalability-design.md` |
| Terraform / CDK / CloudFormation | No cloud resource to declare | `services.md` |
| CDN / edge caching | No public hosting; caching forbidden | NFR-012; Application Design |
| Load balancer / service mesh | One instance per service; Nginx is a prefix router | `services.md` |
| Blue-green / canary | No second environment | NFR-012 |

## Verification

Direct load and refresh of all three U01 routes under the prefix, asset resolution under `/reference-data/_next/*`, header spoof rejection, denied deep links without data flash, target-scoped failure (a Reference-location failure leaves other prefixes serving), and container health behaviour — all observed on the running Compose project. Because U01 is the first integrated route, these observations establish the topology facts the other units rely on. Per NFR-011, container startup alone is not acceptance.
