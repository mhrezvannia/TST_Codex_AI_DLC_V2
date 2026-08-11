# Logical Components - U01 Platform and Reference Route Foundation

## Source Alignment

Per Q4, this maps the components that **actually exist** in the approved topology, states blast radius from established evidence, and identifies genuine shared coupling. It consumes `business-logic-model.md`, all four U01 NFR requirements artifacts, and `tech-stack-decisions.md`, and bridges into Infrastructure Design (3.4).

U01 adds no component. Its contribution is that it is the first unit to **exercise** the shared topology end to end, so it is where each component's blast radius is first observed rather than assumed.

**Consumed inputs.** `business-logic-model.md` supplies the workflows each component carries; `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md` each supply the designed properties mapped onto components in the pattern table below; and `tech-stack-decisions.md` fixes which components are new versus inherited.

## Component Inventory

| # | Component | Owner | U01 responsibility | Failure domain |
| --- | --- | --- | --- | --- |
| C1 | Nginx `/reference-data*` location | Platform/operations | Prefix routing, URI and asset preservation, trust-header clear and replace | Per-location |
| C2 | `apps/reference-data` route layer | Reference (U01) | Canonical set/list/detail routes, safe-return validation, render | Per-app process |
| C3 | Reference BFF | Reference (U01) | Policy call, strict parsing, paging conversion, view models, exhaustive read mapping | Same process as C2 |
| C4 | Shared `PlatformShell` + route registry | W2-02 platform | Consumed at the Reference root, replacing the local shell composition | Shared across all apps |
| C5 | Host-wide session | Platform | Consumed; `Path=/` | Cross-cutting |
| C6 | Identity service | Identity | Current-request `reference-data:read` decisions | Cross-cutting |
| C7 | Reference Data service + database | Reference owner | Sets, records, history | Provider-owned |

U01 changes C1, C2, and C3 and consumes C4, C5, C6, and C7 as they are. It creates no deployable, database, cache, queue, or secret.

## Failure Domains and Blast Radius

| Failing component | Blast radius | Evidence basis |
| --- | --- | --- |
| C1 edge (Reference location) | `/reference-data*` only; other prefixes serve | Target-scoped edge failure — **first proven here** |
| C2/C3 app process | All U01 routes; no other module | Separate deployable per domain |
| C4 shared shell | **All four apps simultaneously** | Single shared package consumed by every canonical app |
| C5 session | Every prefix — one cookie serves the whole host | `Path=/` scope |
| C6 Identity | Every U01 route, fail-closed with zero provider calls | FR-020, SEC-U01-06 |
| C7 Reference service | U01 routes; degrades to stale truth only if source and time supplied | FR-019 |
| C7 history facet | The history panel only | Scoped facet behaviour |

Because U01 is the first integrated route, each of these is **observed** here rather than inferred — which is the walking skeleton's purpose. A later unit that finds a different radius has found a platform regression.

## Shared Resources and Coupling

Two couplings are established at U01 and inherited by everything after it:

1. **The shared `@erp/ui` shell package (C4).** U01 is the first consumer to replace a local shell composition with the shared one, which is precisely the risk the walking skeleton exists to retire early: if the shared contract cannot carry session, visible routes, active module, breadcrumbs, and children, U01 stays BLOCKED rather than shipping a compatibility shim. Once it works, all four apps depend on the same package — the largest correlated-failure surface in the intent, owned by W2-02, with a rollback path W4 cannot answer for.

2. **The host-wide session (C5).** `Path=/` means one session spans every prefix. A session-layer defect is cross-module by construction.

Not shared: no database, no cache, no queue, no BFF state. U01 shares no mutable resource with any other unit.

## Where Each NFR Pattern Lands

| Pattern | Component | Note |
| --- | --- | --- |
| Trust-header sanitation (11 clear / 5 set) | C1 | Shared include applied to every public location, so a new mount inherits it by construction |
| Base-path asset resolution | C1 + C2 | Exact match; no edge rewriting |
| Fail-closed policy ordering | C3 | Provider client reachable only past the policy branch |
| Strict input rejection | C3 | Reject, never strip |
| Safe-return allow-list grammar | C2 | Fallback to canonical list, never to a supplied target |
| Exhaustive `ReadResult` mapping | C3 | Compile-time exhaustiveness; the grammar other units extend |
| Scoped facet failure (history) | C2/C3 boundary | Panel-scoped, record intact |
| Architecture tests (no fork, no cross-app import, no provider call after DENY) | C2/C3 build | Preventive control against later regression |

## Infrastructure Design Handoff

For stage 3.4: the Reference Nginx location and the shared header-policy include (C1), and the existing Compose service definition and health check for C2/C3. U01 requires **no** new infrastructure component, network, volume, secret, or image.

One dependency is carried forward unresolved rather than designed: the W2-02 shared shell release (C4). If its API cannot carry the required contract, U01 remains BLOCKED — a local compatibility shell is prohibited, because it would be indistinguishable from a fork once merged.

## Verification

Component boundaries are verified by the architecture tests U01 installs — no domain-app React imports, no second shell or theme, no arbitrary return URLs, no browser actor authority, no provider call after DENY. Blast-radius claims are verified behaviourally on the Compose stack by failing one dependency at a time, including confirming that a Reference-location failure leaves other prefixes serving. Per NFR-011 an unverified blast-radius claim is BLOCKED evidence, not a pass.

## Review - Iteration 1

**Verdict: NOT-READY**

### Validation evidence

- **Q&A framing (Q1–Q4, all "A")**: confirmed as recorded identically in all four units' `nfr-design-questions.md`. The central decision — design only applicable patterns, record every excluded catalogue pattern with reason and citation — is the right call for a local-Compose, no-cache, no-new-persistence brownfield uplift, and it was executed with real discipline rather than as cover for omission.
- **Spot-verified claims against live source, all confirmed accurate**:
  - U02 security-design.md's claim that "the current source's hard-coded `version=1` … is precisely the defect" is literal fact: `apps/reference-data/lib/service-clients.ts:226` reads `const version = method === "PUT" ? "?version=1" : "";`.
  - U04's claim that both Kafka listener factories run at `concurrency(3)` with no configured error handler, bounded retry, DLQ, or replay contract is confirmed in both `ContainerMovementMessagingConfiguration.java` and `BookingMessagingConfiguration.java` — neither registers a `CommonErrorHandler`/`DefaultErrorHandler`, matching `services.md`'s "Verified Event Controls and Known Gap" section almost verbatim. U04's reliability-design.md and scalability-design.md correctly refuse to design Kafka retry/DLQ/replay controls it does not own, and correctly preserve the hard poison/replay completion condition as a blocker on U04 and the intent.
  - `apps/container-movement` does not exist yet (confirmed via `apps/` listing) and `ReferenceFormCatalogV1`/`ReferenceFieldCatalogV1` appear only in design artifacts, not in `apps/`/`services/` — both correctly described as new, not retrofitted onto something already built.
  - All cited business-rule IDs (BR2-001/002/031/034/036/042/046, BR3-001/005/037/045, BR4-001/030/031/049/053/073) resolve to matching rules in each unit's `business-rules.md`; none is invented.
- **Cross-unit coherence**: U01's recovery grammar (exhaustive `ReadResult`, outage-vs-denial distinction, trustworthy-stale rule, scoped user-triggered retry) is inherited unchanged by U02/U03/U04, which correctly *extend* it with mutation-outcome dispositions (9, 9, 10) rather than redefining the read grammar U01 fixes. The Reference-service double-consumer coupling (U03 labels / U04 capture validation) and the shared-shell/session couplings are stated consistently across all four `logical-components.md` files and match `components.md`/`services.md`.
- **"Deliberately Not Used" tables**: sampled across all 20 artifacts. Every excluded catalogue pattern (circuit breaker, automatic retry with backoff, bulkhead, fallback-to-cache, health-check failover, replication/backup, CDN, autoscaling, sharding, etc.) cites a real, traceable artifact and reason, consistent with the approved no-cache/no-new-persistence/local-Compose boundary. No exclusion reads as a convenient dismissal of something that should have been designed.
- **Sensors fired directly** (`bun .codex/tools/aidlc-sensor.ts fire <id> --stage nfr-design --output-path <file>`) against all 20 artifacts:
  - `required-sections`: **PASS on all 20/20.**
  - `upstream-coverage`: **PASS on 4/20, FAIL on 16/20.** Only the four `performance-design.md` files (one per unit) literally name all six declared consumed artifacts (`performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`, `tech-stack-decisions`, `business-logic-model`) in their Source Alignment prose. Every `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md` (all four units) fails on at least one declared consume — most commonly `performance-requirements`, which none of the non-performance artifact types ever names. All four `logical-components.md` files (this stage's primary artifact, including this one) fail hardest, each missing four of six consumes (`performance-requirements`, `security-requirements`, `scalability-requirements`, `reliability-requirements`), because their Source Alignment paragraph says only "all four U0X NFR requirements artifacts" collectively rather than naming each.

### Blocking findings

1. **The upstream-coverage sensor gap flagged at stage 3.2 (4/20 failures, one artifact type) has recurred here at roughly four times the scope (16/20 failures, four artifact types, every unit) and was not corrected before this stage's artifacts were presented for review.** This is confirmed by direct sensor re-fire, not inference: `required-sections` passes cleanly (20/20) but `upstream-coverage` fails on every `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md`, in all four units, because each Source Alignment section cites only the artifacts it treats as its own primary upstream (its matching NFR-category requirements doc, `tech-stack-decisions.md`, `business-logic-model.md`) and never names the other requirements categories it consumes per the stage's declared `consumes:` list — most consistently omitting `performance-requirements`. The four `logical-components.md` files fail worst (4 of 6 consumes unreferenced each) because they cite the four NFR-requirements artifacts only collectively ("all four U0X NFR requirements artifacts") rather than by name. This is a narrow, mechanically precise, and easily-remediable defect — the underlying design content is not dishonest or unsound (every spot-checked factual claim held up against live source, and the exclusion tables are traceable and non-rationalizing) — but it is the exact class of gap this review was directed to check for, it touches this stage's primary artifact in all four units, and it was not fixed the second time it occurred. Before READY: add an explicit, literal reference to each of the six declared consumed artifacts (or an explicit one-line statement of non-relevance where a category genuinely has no bearing, e.g. "this design has no performance-budget interaction beyond the pipeline ordering already covered in `performance-design.md`") to the Source Alignment section of every `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md`, in all four units, and re-fire `upstream-coverage` to confirm 20/20.
