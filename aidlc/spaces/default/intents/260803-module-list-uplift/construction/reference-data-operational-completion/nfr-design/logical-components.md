# Logical Components - U02 Reference Data Operational Completion

## Source Alignment

Per Q4, this maps the components that **actually exist** in the approved topology, states blast radius from established evidence, and identifies genuine shared coupling. It consumes `business-logic-model.md`, all four U02 NFR requirements artifacts, and `tech-stack-decisions.md`, and bridges into Infrastructure Design (3.4).

U02 adds no component. It extends U01's components with mutation depth and adds one build-time artifact pair — the V1 catalogs — which is a component in the design sense even though it ships as code rather than as a running service.

**Consumed inputs.** `business-logic-model.md` supplies the workflows each component carries; `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, and `reliability-requirements.md` each supply the designed properties mapped onto components in the pattern table below; and `tech-stack-decisions.md` fixes which components are new versus inherited.

## Component Inventory

| # | Component | Owner | U02 responsibility | Failure domain |
| --- | --- | --- | --- | --- |
| C1 | Nginx `/reference-data*` location | Platform/operations | Unchanged from U01 | Per-location |
| C2 | `apps/reference-data` route layer | Reference (U02) | Adds `new` and `edit` child routes, draft and dialog state, focus management | Per-app process |
| C3 | Reference BFF | Reference (U02) | Adds per-command authorization, catalog-derived form definition, create attempt-ID allocation, outcome mapping, authoritative re-read | Same process as C2 |
| C4 | `ReferenceFormCatalogV1` (BFF) | Reference (U02) | Build-time allow-list and form derivation | **Build-time** — failure blocks release, not runtime |
| C5 | `ReferenceFieldCatalogV1` (provider) | Reference service owner | Build-time allow-list before domain validation | **Build-time** |
| C6 | Catalog producer/consumer fixture | Reference (U02) + service owner | Proves C4 and C5 equivalent | **Build-time** |
| C7 | Shared `PlatformShell` + registry | W2-02 platform | Consumed; adds Field/Input/Select/Combobox/Dialog usage | Shared across all apps |
| C8 | Identity service | Identity | Read, create, and update decisions | Cross-cutting |
| C9 | Reference Data service + database | Reference owner | Records, versions, validation, history, outbox | Provider-owned |

## The Build-Time Failure Domain

C4, C5, and C6 are the notable structural feature of this unit. The V1 catalogs are two implementations in two languages, and their equivalence is enforced by an executable fixture rather than by a type system or a shared runtime component.

This is a deliberate placement of a failure domain: catalog drift fails the **build**, not a user request. The alternative designs — a runtime schema endpoint, or a single shared implementation — would have moved that failure into production traffic or created a cross-language shared dependency. Moving a failure from runtime to build time is the strongest containment available, and it is worth naming as a component-level decision rather than leaving it as a validation detail.

## Failure Domains and Blast Radius

| Failing component | Blast radius | Evidence basis |
| --- | --- | --- |
| C1 edge | `/reference-data*` only | Target-scoped edge failure, established by U01 |
| C2/C3 app process | All U02 routes | Separate deployable per domain |
| C3 during a command | The command only — never the record or the session | Nine-disposition model; draft and context always retained |
| C4/C5/C6 catalog drift | **Release** — no runtime blast radius | Build-time fixture failure |
| C7 shared shell | **All four apps simultaneously** | Single shared package |
| C8 Identity | Every U02 route and command, fail-closed | FR-020 |
| C9 Reference service | U02 routes and commands; degrades to stale truth only with source and time | FR-019 |
| C9 history facet | The history panel only | Scoped facet behaviour |
| Network after dispatch | The command's **certainty**, not its outcome | Unknown-outcome disposition |

The last row is the one U02 introduces to the intent: a failure domain that affects what the system *knows* rather than what it *did*. Recovery is a re-read, not a repair.

## Shared Resources and Coupling

1. **The shared `@erp/ui` shell package (C7).** Same coupling U01 established; U02 additionally depends on the shared form primitives (Field, Input, Select, Combobox, Dialog). A missing or defective form primitive is a W2-02 dependency that blocks U02's mutation surface specifically — a narrower but real escalation path.
2. **The host-wide session.** Unchanged from U01; spans every prefix.
3. **The catalog fixture (C6) couples two repositories' build gates.** The BFF and the Reference service must ship compatible catalog versions; the fixture is the coupling made explicit and testable rather than implicit and discovered in production.

Not shared: no database, no cache, no queue, no BFF state. The create attempt ID is a provider record identity, not a stored idempotency record, so U02 introduces no persistent state of its own.

## Where Each NFR Pattern Lands

| Pattern | Component |
| --- | --- |
| Trust-header sanitation | C1 (inherited) |
| Fail-closed policy ordering, per command | C3 |
| Strict body and query allow-lists (reject, not strip) | C3 with C4 |
| Two-sided unknown-key rejection | C4 and C5, proven by C6 |
| Exact-version propagation | C3 |
| Pre-dispatch attempt-ID allocation | C3 |
| Exhaustive outcome reduction | C3 |
| Authoritative post-acceptance re-read | C3 |
| Explicit reconciliation (no silent merge) | C2 with C3 |
| Scoped history failure | C2/C3 boundary |

## Infrastructure Design Handoff

For stage 3.4: the Reference Nginx location and shared header-policy include (C1, unchanged), and the existing Compose service definitions and health checks for C2/C3 and C9. U02 requires **no** new infrastructure component, network, volume, secret, or image.

One item is a **build-pipeline** rather than infrastructure concern and is flagged so it is not lost between stages: the catalog fixture (C6) must run in the blocking gate for both the frontend and the Reference service, or drift ships undetected. That belongs to CI Pipeline (3.7) rather than to 3.4, but it originates here.

## Verification

Component boundaries are verified by the architecture tests U01 installed — no cross-app React imports, no second shell, no shared-component fork, no cross-service database access — plus U02's own contract tests for catalog parity and per-command policy. Blast-radius claims are verified behaviourally on the Compose stack by failing one dependency at a time, including a deliberate catalog-drift fixture that must fail the build rather than a request. Per NFR-011 an unverified blast-radius claim is BLOCKED evidence, not a pass.
