# CI/CD Pipeline (infrastructure-facing) - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q3, this is scoped to **infrastructure-facing CI concerns** — which gates block a merge and what they need from the environment. Pipeline authoring belongs to **stage 3.7 CI Pipeline** and is handed over by name below.

**Consumed inputs.** `reliability-design.md` and `security-design.md` supply the behaviours gates must verify; `performance-design.md` supplies the warmed-sample method including the new app's warm-up requirement; `scalability-design.md` supplies the bounds; `logical-components.md` supplies what must be built, keyed, and health-checked; `services.md` supplies the Compose acceptance boundary; `components.md` supplies the architecture rules; and `business-logic-model.md` supplies the journeys under test.

U04 is the only unit that adds to CI's **infrastructure** surface: a new image to build, a new app in the workspace graph, and a new secret to handle.

## Required Blocking Gates

| Gate | Verifies | Environment need |
| --- | --- | --- |
| Type check | Strict TypeScript incl. exhaustive switch over the ten-disposition union | Node toolchain; **new app must be in the workspace graph** |
| Lint | Repository ESLint flat config extended to the new app | Node toolchain |
| Unit / component tests | Routes, reducer, capture form, two disable gates, focus | Vitest at resolved workspace version |
| Contract tests | v2 media negotiation with additive v1 compatibility; assertion issuance/verification incl. spoof, expiry, wrong-operation; attempt-token binding, replacement, retention; `Idempotency-Key` forwarding; `limit` allow-list and actor-field rejection; bounded location port; exact-`bookingId` lookup; origin-token issue/verify/expiry/fallback both directions | CMM and Reference contracts; assertion key available to CI |
| Provider tests | Timeline ordering, all-history retention, repeated legacy evidence, missing expected evidence; idempotency receipts; sequence rules | CMM service build |
| Architecture tests | No cross-app import, no second shell/theme, no shared-component fork, no cross-service DB access, **no external route to the internal CMM service** | Source tree + edge config |
| Changed-frontend coverage ≥ 80% | NFR-006 — **the new app must be in the changed-code set**, or coverage is overstated by omission | Pinned tool; changed-code set computed |
| Integrated Playwright journeys | Every read/capture/recovery state at 375/390/768/1024/1440, both themes, keyboard, screen reader, reduced motion, zoom, no overflow — CMM routes **and** the changed `/booking/[bookingId]` page | Running Compose with seeded CMM/Booking fixtures and real Identity |
| Route matrix | Direct refresh, asset resolution under the new prefix, **no CMM legacy redirect** (404s), internal service not externally routable | Running edge with the new mount |
| Warmed ten-user sample | NFR-001 p95 with recorded method; warm-up must precede measurement on the brand-new app | Warmed Compose stack |
| `u02-security` (or approved bounded equivalent) | NFR-008 against the W4 changed-code/dependency/**container** set — U04 adds a container, so the image is in scope | W4-touched path only |
| `aidlc-audit` and `erp-fidelity-audit` | NFR-007 / NFR-011 | Full artifact set and running stack |
| Manager-demo guard, before and after | NFR-012 | Approved wrapper scripts |

## Environment Requirements

- **New image build** for `apps/container-movement`, with its Node version pinned in the image and recorded from the running stack rather than assumed.
- **New app registered** in the Yarn workspace and Turbo task graph. If it is missing from either, lint, type-check, and coverage silently skip it — a false green, and the most likely CI failure mode for a newly added app.
- **Assertion key available to CI** for contract tests. The mechanism is settled, not open: `compose.yaml` provisions every credential as `${VAR:-local_default}` Compose environment variables, and the Charge assertion key uses exactly that shape (`CHARGE_BFF_ASSERTION_SECRET`, `_KID`, `_REPLAY_CAPACITY`). U04 adds a distinctly-named triple in the same style, with a clearly-marked local default so CI and a developer stack start without external setup while the value is obviously not a real secret. No new secret store is required, and `REFERENCE_DATA_CMM_TOKEN` already exists for the location port.
- **Isolated Compose project** with the new service and mount, seeded CMM and Booking fixtures covering every failure branch — including duplicate, out-of-sequence, unknown-outcome, and a blocked-partition scenario.
- **Real Identity decisions** with both `container-movement:read` and `container-movement:capture` registered. Until Identity registers them, U04's gates cannot pass — that is correct fail-closed behaviour, not a CI defect to work around.

## Deployment Strategy

None to design: one environment, no promotion path. Bringing the Compose project up through the approved wrapper is what "deployment" means here, guarded by the manager-demo check before and after. Rollback is `git revert` plus a stack restart.

Adding a new service does not change that — it adds a service to the same single-environment bring-up, not a deployment pipeline.

## Handoff to Stage 3.7 CI Pipeline

3.7 owns and this artifact does not author: pipeline file and stage wiring, job definitions, runner configuration, caching, artifact and image registry management, changed-code-set computation, gate ordering and parallelism, and merge-request reporting.

What 3.7 must take from here without re-deriving: the thirteen gates above; the new app's registration in the workspace and coverage set; the image build; assertion-key handling; the fixture completeness requirement; the absence of a deployment strategy; and the rule that a non-blocking detector does not count.

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Blue-green / canary / rolling | One environment; no traffic to shift | NFR-012 |
| Feature flags | Blocked capabilities are absent, not flagged off | `requirements.md` |
| Environment promotion | No staging or production target | NFR-012 |
| Secrets rotation policy | No rotation surface in the acceptance topology | `deployment-architecture.md` |
| Image promotion across registries | One environment; the image is built and run locally | NFR-012 |
| Repository-wide security modernization | NFR-008 bounds the gate to the W4-touched path | NFR-008 |

## Verification

Each gate must be observed returning a blocking verdict. Two U04-specific checks matter most: that the new app genuinely participates in lint, type-check, and coverage (a silent skip is a false green), and that a deliberately over-broad edge rule is caught by the architecture test asserting the internal service is not externally routable. Per NFR-011, static scans, screenshots, or container startup are never live acceptance — and the poison/replay exit keeps U04 and the intent not done regardless of gate results.
