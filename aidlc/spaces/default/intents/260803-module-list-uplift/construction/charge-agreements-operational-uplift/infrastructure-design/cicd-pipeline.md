# CI/CD Pipeline (infrastructure-facing) - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q3, this artifact is scoped to **infrastructure-facing CI concerns**: which gates must block a merge, and what each needs from the environment. Pipeline authoring — stage wiring, job definitions, runner configuration, artifact management — belongs to **stage 3.7 CI Pipeline** and is handed over by name below rather than duplicated here.

**Consumed inputs.** `reliability-design.md` and `security-design.md` supply the behaviours the gates must verify; `performance-design.md` supplies the warmed-sample method a gate must run; `scalability-design.md` supplies the bounds under which it runs; `logical-components.md` supplies what must be built and health-checked; `services.md` supplies the Compose acceptance boundary; `components.md` supplies the architecture rules the gates enforce; and `business-logic-model.md` supplies the journeys under test.

## Required Blocking Gates

Each row is a gate that must return a blocking verdict before merge, with what it needs from the environment. Per NFR-007, a detector that only prints leads is not a passing gate.

| Gate | Verifies | Environment need |
| --- | --- | --- |
| Type check | Strict TypeScript across changed frontend code, including exhaustive switch over the Charge result union | Node toolchain; workspace resolution |
| Lint | Repository ESLint flat config | Node toolchain |
| Unit / component tests | Route, reducer, form, and state behaviour | Vitest at the resolved workspace version |
| Contract tests | Query allow-list rejection, status adaptation, paging conversion, capability separation, replay-key derivation, version propagation, result-to-HTTP mapping, bounded option port | Charge and Reference service contracts available |
| Architecture tests | No cross-app import, no second shell or theme, no shared-component fork, no cross-service DB access, no provider call after DENY | Source tree only |
| Changed-frontend coverage ≥ 80% | NFR-006 against an explicit changed-code set with a pinned tool | Coverage tool pinned; changed-code set computed, not assumed |
| Integrated Playwright journeys | Every read/command/recovery state at 375/390/768/1024/1440, both themes, keyboard, screen reader, reduced motion, zoom, no page overflow | Running Compose project with seeded Charge fixtures and real Identity |
| Route matrix | Four approved 308 redirects, 404 matrix, direct refresh, asset resolution under the prefix | Running edge |
| Warmed ten-user sample | NFR-001 p95 thresholds with recorded method | Warmed Compose stack; documented fixture |
| `u02-security` (or approved bounded equivalent) | NFR-008 against the W4 changed-code/dependency/container set | The W4-touched security path only |
| `aidlc-audit` and `erp-fidelity-audit` | NFR-007 / NFR-011 | Full artifact set and running stack |
| Manager-demo guard, before and after | NFR-012 acceptance boundary | Approved wrapper scripts |

## Environment Requirements

- **Isolated Compose project.** Live gates run only on the approved `linercore-wave-a` project through the approved wrapper — never against a shared or developer-mutable stack.
- **Seeded fixtures.** The Charge fixture set must cover every failure branch the reliability design names, not only the happy path. A gate that passes because its fixtures never trigger a branch has verified nothing.
- **Real Identity decisions.** No stubbed ALLOW; capability variants (Pricing Analyst, Charge Reader) must be real subjects.
- **Warm-up before measurement**, with the procedure recorded alongside the sample.
- **No new secret for U03.** The Charge and Reference service credentials already exist; U03 introduces none. (U04 does — its assertion key — and that is handled in U04's artifact.)

## Deployment Strategy

There is none to design. There is one environment and no promotion path, so blue-green, canary, rolling deployment, traffic shifting, and feature flags have nothing to operate on. "Deployment" in this project means bringing the Compose project up through the approved wrapper, guarded by the manager-demo check before and after.

Rollback is likewise `git revert` plus a stack restart — not an infrastructure procedure. Recording this prevents 3.7 from inheriting an assumption that a deployment strategy exists to be automated.

## Handoff to Stage 3.7 CI Pipeline

Stage 3.7 owns, and this artifact deliberately does not author: pipeline file and stage wiring, job definitions and runner configuration, caching and artifact management, the changed-code-set computation mechanism, gate ordering and parallelism, failure reporting, and how the blocking verdicts surface on a merge request.

What 3.7 should take from here without re-deriving: the twelve gates above, their environment needs, the absence of a deployment strategy, and the rule that a non-blocking detector does not count.

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Blue-green / canary / rolling | One environment; no traffic to shift | NFR-012 |
| Feature flags | No progressive rollout surface; blocked capabilities are absent, not flagged off | `requirements.md` Provider Capability Matrix |
| Environment promotion | No staging or production target in scope | NFR-012 |
| Secrets rotation policy | U03 introduces no secret | `tech-stack-decisions.md` |
| Artifact registry / image promotion | U03 builds no image | `logical-components.md` |
| Repository-wide security modernization | NFR-008 bounds the gate to the W4-touched path | NFR-008 |

## Verification

Each gate must be observed returning a blocking verdict — a gate that cannot fail has not been verified. Fixture completeness is verified by confirming each named failure branch is actually triggered. Per NFR-011, static scans, screenshots, or container startup are never live acceptance.
