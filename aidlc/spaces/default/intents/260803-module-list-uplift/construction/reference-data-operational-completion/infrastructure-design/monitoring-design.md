# Monitoring Design - U02 Reference Data Operational Completion

## Source Alignment

Per the answered Q2, this designs what NFR-010 requires and the verified stack can carry — not an observability platform the project lacks.

**Consumed inputs.** `reliability-design.md` supplies the nine-disposition set and the build-time failure domain; `security-design.md` bounds what may be logged; `performance-design.md` supplies the p95 evidence obligations; `scalability-design.md` confirms there is no capacity signal to alarm on; `logical-components.md` supplies the components a signal originates from; `services.md` and `components.md` supply the correlation and evidence contracts; and `business-logic-model.md` supplies the outcomes observed.

## Correlation Design

U02 inherits U01's correlation chain unchanged — edge-issued identifier, forwarded as trusted correlation on provider calls, surfaced as a safe reference on failures, present on every boundary event.

What U02 adds is that a **command** produces two correlated provider interactions: the write and the authoritative re-read. Both carry the same correlation ID, so a support investigation can distinguish "the write never arrived" from "the write arrived but the confirmation read failed" — which is exactly the distinction the `accepted-unconfirmed` disposition exists to represent.

## Outcome Distinction in Logs

| Logged | Not logged |
| --- | --- |
| Disposition discriminator (`accepted-confirmed`, `accepted-unconfirmed`, `validation`, `conflict`, `denied`, `not-found`, `unavailable-known`, `unavailable-unknown`, `unexpected`) | Request or response payload bodies |
| Correlation ID and provider reference | Reference record attribute values, including drafted ones |
| Stable `setCode`, `recordId` / attempt ID, expected and current version | Session tokens or service credentials |
| Rejected-input class (unknown attribute key, invalid discriminator, bad format) — the class, never the value | Capability names in denial records |
| Boundary discriminator on `unexpected` (`BFF` vs `PROVIDER_PROTOCOL`) | Full stack traces in user-reachable output |
| Timing for the p95 sample | |

Two U02-specific requirements. First, `accepted-unconfirmed` must be independently identifiable in logs, because it is the one disposition where the system's knowledge and the provider's state can legitimately diverge. Second, a version conflict must log both the expected and current version — a conflict without both numbers cannot be diagnosed after the fact.

## Observing the Build-Time Failure Domain

Catalog drift is a **build** signal, not a runtime one. Its observability requirement is correspondingly different: the fixture must fail loudly in CI with a message naming which key diverged on which side. A drift that fails with a generic assertion error satisfies the gate but wastes the containment — the whole value of moving the failure to build time is that it is diagnosable before it can affect a request.

## Evidence Artifacts

| Evidence | Produced by | Consumed by |
| --- | --- | --- |
| Warmed ten-user route and BFF sample (list, detail, and create/edit route renders) | Build and Test | NFR-001 |
| Per-state live journey records at five widths, two themes | Playwright | NFR-002, NFR-003 |
| Failure-fixture observations per dependency, including all three create-recovery branches | Live Compose runs | NFR-005, FR-019, NFR-011 |
| Catalog fixture parity result | Build gate | NFR-007 |
| `aidlc-audit` and `erp-fidelity-audit` output | Audit gates | NFR-007, NFR-011 |
| Manager-demo guard before and after | Wrapper scripts | NFR-012 |

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Metrics backend, log aggregation, distributed tracing, dashboards | No such component in the verified stack | `technology-stack.md`, NFR-012 |
| SLI / SLO / error budgets | NFR-001 targets are local acceptance thresholds, not SLOs | NFR-001, NFR-012 |
| Alerting / on-call routing | No alert manager, no production runtime, no on-call surface | NFR-012 |
| Write-rate or contention metrics | No write-capacity target exists; concurrency is a correctness property here | `scalability-design.md` |
| Audit-log platform | The Reference provider owns change history and outbox evidence | U02 non-responsibilities |
| APM / RUM | No agent; would send data off-host | `technology-stack.md`, NFR-012 |

Stage 4.4 Observability Setup owns any future platform.

## Verification

Correlation is verified across both provider interactions of a command by asserting one identifier spans the write and the re-read. Disposition distinction is verified by triggering each fixture and asserting distinct discriminators, with `accepted-unconfirmed` specifically checked. Conflict logging is verified to include both versions. Payload-leak prohibition is verified by asserting draft values are absent from log output. Catalog-drift diagnosability is verified by introducing a deliberate divergence and confirming the failure names the diverging key. Per NFR-011, evidence must be produced live rather than inferred.
