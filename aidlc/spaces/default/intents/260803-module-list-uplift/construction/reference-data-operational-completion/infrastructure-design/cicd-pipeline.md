# CI/CD Pipeline (infrastructure-facing) - U02 Reference Data Operational Completion

## Source Alignment

Per the answered Q3, this is scoped to **infrastructure-facing CI concerns** — which gates block a merge and what each needs from the environment. Pipeline authoring belongs to **stage 3.7 CI Pipeline** and is handed over by name below.

**Consumed inputs.** `reliability-design.md` and `security-design.md` supply the behaviours gates must verify; `performance-design.md` supplies the warmed-sample method; `scalability-design.md` supplies the bounds; `logical-components.md` supplies the build-time components and the CI coupling they create; `services.md` supplies the Compose acceptance boundary; `components.md` supplies the architecture rules; and `business-logic-model.md` supplies the journeys under test.

U02's distinctive CI contribution is the **catalog fixture** — a gate that couples two build pipelines.

## Required Blocking Gates

| Gate | Verifies | Environment need |
| --- | --- | --- |
| Type check | Strict TypeScript incl. exhaustive switch over the nine-disposition union | Node toolchain; workspace resolution |
| Lint | Repository ESLint flat config | Node toolchain |
| Unit / component tests | Draft retention, dirty protection, duplicate prevention, focus, conflict reconciliation | Vitest at resolved workspace version |
| **Catalog fixture parity** | `ReferenceFormCatalogV1` (BFF) and `ReferenceFieldCatalogV1` (provider) are equivalent — exact set, key, requiredness, format, discriminator, option source | **Must run in the blocking gate of BOTH the frontend and the Reference service**, or drift ships undetected |
| Contract tests | Per-command policy, unknown-key rejection at both boundaries, exact-version propagation (explicitly asserting the hard-coded `version=1` is gone), stable-ID create through PUT-by-ID `version=0`, every result-to-HTTP mapping, post-acceptance re-read | Reference service contract available |
| Concurrency tests | A stale version cannot overwrite; a create retry cannot duplicate | Provider with optimistic concurrency active |
| Architecture tests | No cross-app import, no second shell or theme, no shared-component fork, no cross-service DB access, no provider call after DENY | Source tree only |
| Changed-frontend coverage >= 80% | NFR-006 against an explicit changed-code set with a pinned tool | Coverage tool pinned; changed-code set computed |
| Integrated Playwright journeys | Every read/mutation/recovery state at 375/390/768/1024/1440, both themes, keyboard, screen reader, reduced motion, zoom, no overflow | Running Compose with seeded Reference fixtures and real Identity |
| Route matrix | Direct refresh incl. the new child routes, asset resolution, denied deep links, safe-return matrix | Running edge |
| Warmed ten-user sample | NFR-001 p95 with recorded method | Warmed Compose stack |
| `u02-security` (or approved bounded equivalent) | NFR-008 against the W4 changed-code/dependency/container set | W4-touched path only |
| `aidlc-audit` and `erp-fidelity-audit` | NFR-007 / NFR-011 | Full artifact set and running stack |
| Manager-demo guard, before and after | NFR-012 | Approved wrapper scripts |

## Environment Requirements

- **Cross-pipeline fixture execution.** The catalog fixture is the one gate here that is not satisfied by running in a single repository's pipeline. If only the frontend runs it, a provider-side catalog change ships unchecked, and vice versa. This is the single most important environment requirement U02 contributes.
- **Isolated Compose project** through the approved wrapper.
- **Seeded Reference fixtures** covering every failure branch — with particular attention to the three create-recovery branches (same-ID matching content, same-ID differing content, terminal absence). A gate whose fixtures never trigger those has not verified recovery.
- **Provider with optimistic concurrency active**, so the conflict tests exercise real version enforcement rather than a stub.
- **Real Identity decisions** with read-only, create-capable, and update-capable subjects as real subjects.
- **No new secret.** U02 introduces none.

## Deployment Strategy

None to design: one environment, no promotion path. Bringing the Compose project up through the approved wrapper is what deployment means, guarded by the manager-demo check before and after. Rollback is `git revert` plus a stack restart.

One U02-specific rollback note: because the catalogs are build-time and versioned as V1, a revert of the frontend without the provider (or vice versa) reintroduces drift. The fixture catches it — provided it runs in both pipelines.

## Handoff to Stage 3.7 CI Pipeline

3.7 owns and this artifact does not author: pipeline file and stage wiring, job definitions, runner configuration, caching, artifact management, changed-code-set computation, gate ordering and parallelism, and merge-request reporting.

What 3.7 must take from here without re-deriving: the fourteen gates above; **the catalog fixture's dual-pipeline requirement**; the fixture-completeness requirement for the create-recovery branches; the absence of a deployment strategy; and the rule that a non-blocking detector does not count.

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Blue-green / canary / rolling | One environment; no traffic to shift | NFR-012 |
| Feature flags | Blocked lifecycle actions are absent, not flagged off | `requirements.md` Provider Capability Matrix |
| Environment promotion | No staging or production target | NFR-012 |
| Database migration pipeline | U02 adds no schema change; the provider's attribute shape is retained | `tech-stack-decisions.md` |
| Secrets rotation policy | U02 introduces no secret | `tech-stack-decisions.md` |
| Artifact registry / image promotion | U02 builds no image | `logical-components.md` |
| Repository-wide security modernization | NFR-008 bounds the gate to the W4-touched path | NFR-008 |

## Verification

Each gate must be observed returning a blocking verdict. Two U02-specific checks matter most: that a deliberate catalog divergence fails **both** pipelines, and that the create-recovery fixtures are genuinely triggered rather than merely present. Per NFR-011, static scans, screenshots, or container startup are never live acceptance.
