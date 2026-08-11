# Deployment Architecture - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q1, this describes the **real** `linercore-wave-a` Compose topology plus U04's exact additions — not a cloud target.

**Consumed inputs.** `logical-components.md` supplies the component inventory and the 3.4 handoff list this artifact implements; `services.md` supplies the deployable and ownership map; `components.md` supplies the edge mount and shell composition rules; `security-design.md` supplies the edge header policy, the internal-service non-exposure rule, and the assertion key requirement; `performance-design.md` supplies the base-path, warm-up, and health-check-off-the-measured-path properties; `scalability-design.md` confirms one instance with no scaling surface; `reliability-design.md` supplies target-scoped failure expectations; and `business-logic-model.md` supplies the routes and capture path being served.

## U04's Infrastructure Delta

U04 is the **only** unit in W4-01 that changes infrastructure. Five additions, and nothing else:

| # | Addition | Detail | Current state (verified) |
| --- | --- | --- | --- |
| 1 | Nginx location `/container-movement*` | New public mount, carrying the shared header-policy include | No such location. **The include itself does not exist either** — current config clears no headers and sets four; introducing it is a platform delta U01 records |
| 2 | Compose service for the CMM **app** | New service running the new app image | Absent. Note the CMM **backend** service, its Postgres, and its Kafka wiring already exist in `compose.yaml` — only the frontend is new |
| 3 | CMM app container image | Next.js build; Node version pinned in the image and recorded from the running stack | Absent — `apps/container-movement` does not exist |
| 4 | Internal CMM service URL | Reachable by the CMM BFF; **never** exposed at the edge | Backend reachable internally today; no edge location routes to it, which is the state to preserve |
| 5 | Dedicated CMM assertion key | HMAC key material, distinct from the Charge assertion key | Absent. Provisioning mechanism is **not** open — see Secrets below |

**Not added:** database, schema, volume, Kafka topic, cache, secret store, network, load balancer, or AWS resource. The CMM backend and its database already exist; U04 adds the frontend and the v2 contract, not the service.

U04's new `basePath` must be set on the new app from the start — Charge already does this correctly, Reference does not (U01's delta #2), so the new app should follow Charge's pattern rather than Reference's current one.

## Compute Model

Containers on the single Docker Compose project. No serverless, orchestrator, VM fleet, multi-region, or environment ladder; one instance of each service.

## Network Topology

```
browser
  |
  v
[ Nginx edge ]
  |  /                      -> apps/shell            (hosts the Booking relationship adapter)
  |  /booking*              -> apps/shell
  |  /reference-data*       -> apps/reference-data
  |  /charge-agreements*    -> apps/charge-agreements
  |  /container-movement*   -> apps/container-movement   <-- NEW (U04)
  |
  v (internal network only)
[ container-movement-service ] -> [ CMM PostgreSQL ]      <-- NOT exposed at the edge
[ reference-data-service ]     -> [ Reference PostgreSQL ]
[ identity-service ]           -> [ Identity PostgreSQL ]
[ booking-service ]            -> [ Booking PostgreSQL ]
       |
       +-- existing Kafka topics (booking.confirmed, containermovement.status)
```

The non-exposure of `container-movement-service` is a security requirement (SEC-U04-11) with an infrastructure expression: there is **no** Nginx location routing to it, and the actor-shaped v1 contract is reachable only from inside the network. This is the single most important line in this artifact to get right, because an over-broad proxy rule would silently expose an internally-trusted contract.

## Edge Configuration for `/container-movement*`

| Property | Value |
| --- | --- |
| Location | `/container-movement*` (new) |
| Upstream | `apps/container-movement` |
| Next `basePath` | `/container-movement` — must match exactly |
| Assets | `/container-movement/_next/*`; no edge rewriting |
| Header policy | The shared include — inherited by construction, not re-authored |
| Cookie | Host-wide session, `Path=/` |
| Root response | 200 |
| Legacy routes | **None.** No compatibility redirect is created, because no prior CMM frontend existed. Any legacy-looking CMM path 404s |

## Storage

U04 provisions no storage. The CMM service owns its PostgreSQL database and volume; the BFF reaches it only over the v2 HTTP contract.

## Secrets

One new secret: the CMM assertion key. The provisioning mechanism is **not** an open question — `compose.yaml` already shows a uniform pattern for every credential in the stack, including the Charge assertion key, so U04 follows it rather than inventing one.

**Established pattern** (verified in `compose.yaml`): a Compose environment variable with a local development default, `${VAR:-local_default}`. The Charge assertion key uses exactly this, as three variables:

```
CHARGE_BFF_ASSERTION_SECRET: ${CHARGE_BFF_ASSERTION_SECRET:-linercore-local-assertion-secret-change-me}
CHARGE_BFF_ASSERTION_KID:    ${CHARGE_BFF_ASSERTION_KID:-w2-03-local-v1}
CHARGE_BFF_ASSERTION_REPLAY_CAPACITY: ${CHARGE_BFF_ASSERTION_REPLAY_CAPACITY:-4096}
```

**U04 follows it** with its own distinctly-named triple — secret, key ID, and replay capacity — provisioned to both the CMM app service and the CMM backend service so issuer and verifier share it.

| Property | Requirement |
| --- | --- |
| Distinctness | A separate variable set from the Charge key, so a compromise in one domain does not authorize the other. Distinct **names**, not a shared variable reused |
| Local default | A clearly-marked local-only default in the same style, so the stack starts without external setup while the value is obviously not a real secret |
| Location | Compose environment for the CMM app and CMM backend services; never committed as a literal |
| Rotation | No rotation policy designed; no rotation surface exists in this topology |

**Already provisioned and reusable**: `REFERENCE_DATA_CMM_TOKEN` exists in `compose.yaml` today. U04's `CmmReferenceLocationsPort` uses that existing credential for its Reference calls rather than requesting a new one — one less secret to introduce.

## Health and Readiness

The CMM app exposes a base-path-aware internal `/api/health` for the container health check. It authorizes nothing, and per `performance-design.md` it stays off the measured path and is not a readiness proxy for domain routes.

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
| Service mesh / sidecar | Compose DNS and direct HTTP suffice; a mesh would add a trust layer the assertion design already covers | `services.md` |
| New Kafka topic or broker change | W4 adds no topic; the poison/replay gap is not closed by infrastructure U04 may add | `services.md`, the recorded BLOCKED exit |

## Verification

Direct load and refresh of both canonical CMM routes, asset resolution under `/container-movement/_next/*`, absence of any CMM legacy redirect (404 for legacy-looking paths), **direct external request to the CMM service failing to route**, v1 unreachable from a browser route, header spoof rejection, target-scoped failure across prefixes, container health check behaviour, and assertion-key presence without it appearing in any committed file or log. All observed on the running Compose project; per NFR-011, container startup alone is not acceptance.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- Read all 20 artifacts across the four units (`platform-reference-route-foundation`, `reference-data-operational-completion`, `charge-agreements-operational-uplift`, `container-journeys-booking-uplift`) plus each unit's `infrastructure-design-questions.md`.
- Verified against the real repository: `compose.yaml` (root), `infrastructure/nginx/default.conf`, `apps/*/next.config.mjs`, `apps/*/app/**` route trees, `apps/charge-agreements/app/api/health/route.ts`, `apps/reference-data/app/api/health/route.ts`, `apps/charge-agreements/lib/bff/subject-assertion.ts`, and `package.json` / `turbo.json` scripts.
- Confirmed `apps/container-movement` is genuinely absent (only `auth`, `booking`, `charge-agreements`, `reference-data`, `shell` exist) — the U04 delta claim of a wholly new app is accurate.
- Confirmed the `container-movement-service` Spring backend (with its Postgres schema, Kafka wiring, and `REFERENCE_DATA_CMM_TOKEN`) already exists in `compose.yaml` — consistent with the artifact only claiming the *frontend* Compose service as new.
- Confirmed `u02-security`, `aidlc-audit`, `erp-fidelity-audit`, and the Playwright/turbo toolchain named in `cicd-pipeline.md` are real and runnable (`scripts/run-u02-security-gates.mjs`, `package.json` scripts, `.claude/skills/aidlc-audit/`, `.claude/skills/erp-fidelity-audit/`).
- Confirmed the poison/replay gap is preserved as a hard BLOCKED completion condition consistently in every unit's `shared-infrastructure.md` and `monitoring-design.md` — not softened by any infrastructure workaround.
- Confirmed the catalogue-treatment-question skip (Q1 of NFR Design, 3.3) is a legitimate reuse: that decision governs *how to present inapplicable catalogue items* (list with reason vs. invent vs. omit), a documentation convention, not a per-item technical judgment — and each unit's "Deliberately Not Designed" table still supplies a specific reason and foreclosing artifact per item, so the substance of a catalogue-treatment question is satisfied regardless.

### Blocking findings

1. **The "shared header-policy include" (eleven-header clear list, five trusted set values) described as existing and "inherited by construction, not re-authored" in all four units' `deployment-architecture.md` and `shared-infrastructure.md` does not exist anywhere in the repository.** `infrastructure/nginx/default.conf` has no `include`, no `proxy_hide_header`, no header-clearing logic of any kind, and sets only four headers per location (`Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, `X-Correlation-Id`) — not the claimed five (`X-Forwarded-For` is absent). A repo-wide search for `header-policy`, `eleven-header`, or `trusted set` returns matches only inside the `aidlc/` design tree, never inside `infrastructure/`, `apps/`, or any config file. This artifact's own Q1 mandate was to describe the *real* topology, not an aspirational one; treating a non-existent security control as already built and merely "inherited" by U04's new mount is invented infrastructure, and it is the single most consequential inaccuracy in this stage because U04's own security model (SEC-U04-11, the assertion design) is framed as resting on it.
2. **The CMM assertion-key provisioning mechanism is recorded as "Open" when the repository already shows, unambiguously and uniformly, how every comparable credential in this stack is provisioned.** `compose.yaml` sets `CHARGE_BFF_ASSERTION_SECRET`, `CHARGE_BFF_ASSERTION_KID`, `REFERENCE_DATA_CMM_TOKEN`, `REFERENCE_DATA_BFF_TOKEN`, `BOOKING_SERVICE_TOKEN`, and every other inter-service credential the same way: a plain Compose environment variable with a `${VAR:-local-default}` fallback, injected into both producer and consumer services, never a vault, never rotated. This is the Charge assertion key's actual mechanism, not a matter of "however existing service credentials are provisioned" left for someone else to look up — the answer is sitting in the same file this artifact already reads. Leaving it open (and repeating "Open" in `cicd-pipeline.md`'s environment requirements) hands stage 3.7 and Code Generation an unresolved question that should have been closed here.
3. **The `/reference-data*` edge configuration claim is wrong about the actual mechanism.** U01 and U02's `deployment-architecture.md` state "Next `basePath` | `/reference-data` — must match exactly," but `apps/reference-data/next.config.mjs` sets no `basePath` at all. The real mechanism is nginx-side prefix stripping (`location /reference-data/ { proxy_pass http://apps-reference-data:3000/; }`, note the trailing slash), which is mutually exclusive with a Next.js `basePath` (combining both would double-strip the prefix and break asset/routing resolution). A developer implementing per this doc would misconfigure the one app it explicitly covers in the most detail.
4. **The Reference app's `/api/health` route is not wired to any container health check.** `compose.yaml`'s `apps-reference-data` service has no `healthcheck:` block at all (unlike `apps-shell`, `apps-booking`, and `apps-charge-agreements`, which all probe `/api/health` or `/<base>/api/health`). The route exists in code (`apps/reference-data/app/api/health/route.ts`), but the claim that it is "exposed... for the container health check" overstates what is actually configured.
5. **U03's claim of "Four approved 308 redirects" for legacy Charge paths, presented under "Infrastructure Delta: None,"  is not what the repository currently serves.** The legacy paths (`apps/charge-agreements/app/[agreementId]/page.tsx`, `.../[agreementId]/edit/page.tsx`, `.../[agreementId]/successor/page.tsx`, `.../new/page.tsx`) are live duplicate pages that render the same components as their `/agreements/...`-prefixed counterparts directly — they are not redirect handlers, and nothing 308s. If this is meant as a target for Code Generation rather than a present fact, the artifact needed to say so explicitly instead of pairing it with "Infrastructure Delta: None" and "not a change request," which reads as a claim about current behaviour.

Findings 1, 3, 4, and 5 are cross-cutting (they recur identically or near-identically across U01/U02/U03's copies of `deployment-architecture.md` and `shared-infrastructure.md`), so fixing them in U04 alone is insufficient — all four units' artifacts need the correction.
