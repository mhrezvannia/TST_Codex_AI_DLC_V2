# CI/CD Pipeline (infrastructure-facing) - U01 Platform and Reference Route Foundation

## Source Alignment

Per the answered Q3, this is scoped to **infrastructure-facing CI concerns** — which gates block a merge and what each needs from the environment. Pipeline authoring belongs to **stage 3.7 CI Pipeline** and is handed over by name below.

**Consumed inputs.** `reliability-design.md` and `security-design.md` supply the behaviours gates must verify; `performance-design.md` supplies the warmed-sample method and the baseline recording obligation; `scalability-design.md` supplies the bounds; `logical-components.md` supplies what must be built and health-checked; `services.md` supplies the Compose acceptance boundary; `components.md` supplies the architecture rules the gates enforce; and `business-logic-model.md` supplies the journeys under test.

## Required Blocking Gates

Per NFR-007, a detector that only prints leads is not a passing gate.

| Gate | Verifies | Environment need |
| --- | --- | --- |
| Type check | Strict TypeScript incl. exhaustive `ReadResult` switch | Node toolchain; workspace resolution |
| Lint | Repository ESLint flat config | Node toolchain |
| Unit / component tests | Route state mapping, context and focus preservation, safe-return fallback | Vitest at resolved workspace version |
| Contract tests | Policy evaluation, provider-call prohibition on DENY and outage, every invalid-input rejection class, safe-return grammar incl. the malicious-target matrix, paging conversion | Reference service contract available |
| Architecture tests | No cross-app React import, no second shell or theme, no arbitrary return URLs, no browser actor authority, no provider call after DENY | Source tree only |
| Changed-frontend coverage >= 80% | NFR-006 against an explicit changed-code set with a pinned tool | Coverage tool pinned; changed-code set computed |
| Integrated Playwright journeys | Every read state at 375/390/768/1024/1440, both themes, keyboard, screen reader, reduced motion, zoom, no page overflow | Running Compose with seeded Reference fixtures and real Identity |
| Route matrix | Direct load and refresh, asset resolution under the prefix, denied deep links, target-scoped failure across prefixes | Running edge |
| Warmed ten-user sample | NFR-001 p95 with recorded method **and the platform baseline segments recorded separately** | Warmed Compose stack; documented fixture |
| `u02-security` (or approved bounded equivalent) | NFR-008 against the W4 changed-code/dependency/container set | W4-touched path only |
| `aidlc-audit` and `erp-fidelity-audit` | NFR-007 / NFR-011 | Full artifact set and running stack |
| Manager-demo guard, before and after | NFR-012 acceptance boundary | Approved wrapper scripts |

## Environment Requirements

- **Isolated Compose project**, through the approved wrapper — never a shared or developer-mutable stack.
- **Seeded Reference fixtures** covering every failure branch the reliability design names, including true empty, partial history, and provider outage both with and without trustworthy persisted truth.
- **Real Identity decisions** with read-capable and denied subjects as real subjects, not stubs.
- **The W2-02 shared shell release available.** U01's gates cannot pass without it, and a local compatibility shell is prohibited — so an absent shell release is a genuine BLOCKED state, not a CI problem to route around.
- **Warm-up before measurement**, with the procedure recorded alongside the sample.
- **No new secret.** U01 introduces none.

## Deployment Strategy

None to design. One environment, no promotion path: blue-green, canary, rolling deployment, traffic shifting, and feature flags have nothing to operate on. "Deployment" means bringing the Compose project up through the approved wrapper, guarded by the manager-demo check before and after. Rollback is `git revert` plus a stack restart.

## Handoff to Stage 3.7 CI Pipeline

3.7 owns and this artifact does not author: pipeline file and stage wiring, job definitions, runner configuration, caching, artifact management, changed-code-set computation, gate ordering and parallelism, and merge-request reporting.

What 3.7 should take from here without re-deriving: the twelve gates above, their environment needs, the shell-release dependency, the absence of a deployment strategy, and the rule that a non-blocking detector does not count.

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Blue-green / canary / rolling | One environment; no traffic to shift | NFR-012 |
| Feature flags | Blocked capabilities are absent, not flagged off | `requirements.md` Provider Capability Matrix |
| Environment promotion | No staging or production target | NFR-012 |
| Secrets rotation policy | U01 introduces no secret | `tech-stack-decisions.md` |
| Artifact registry / image promotion | U01 builds no image | `logical-components.md` |
| Repository-wide security modernization | NFR-008 bounds the gate to the W4-touched path | NFR-008 |

## Verification

Each gate must be observed returning a blocking verdict — a gate that cannot fail has not been verified. Fixture completeness is verified by confirming each named failure branch is actually triggered. Per NFR-011, static scans, screenshots, or container startup are never live acceptance.
