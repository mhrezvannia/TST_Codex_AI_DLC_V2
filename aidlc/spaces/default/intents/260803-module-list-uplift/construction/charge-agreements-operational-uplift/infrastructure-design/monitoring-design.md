# Monitoring Design - U03 Charge Agreements Operational Uplift

## Source Alignment

Per the answered Q2, this designs what NFR-010 actually requires and the verified stack can carry — not an observability platform the project does not have.

**Consumed inputs.** `reliability-design.md` supplies the typed outcome set that must remain distinguishable; `security-design.md` supplies the data-exposure rules that bound what may be logged; `performance-design.md` supplies the p95 evidence obligations; `scalability-design.md` confirms there is no capacity signal to alarm on; `logical-components.md` supplies the components a signal could come from; `services.md` and `components.md` supply the correlation and evidence contracts; and `business-logic-model.md` supplies the outcomes being observed.

## What Exists to Observe With

The verified stack contains no metrics backend, log aggregator, tracing collector, dashboard tool, or alert manager. What it does contain is a correlation identifier issued at the edge and typed outcomes at every boundary. The design therefore makes those two carry the full NFR-010 obligation.

## Correlation Design

```
edge:      X-Correlation-Id = $request_id   (inbound value cleared first)
  -> app:  read from request context; never from a browser-supplied field
  -> BFF:  forward as trusted correlation header on every provider call
  -> UI:   surface as a safe reference on failure states
  -> logs: present on every boundary event for the request
```

One identifier spans a request from edge to provider and appears in both the user-facing reference and the log record — so a user reporting a failure reference can be matched to the exact request without exposing anything sensitive.

## Outcome Distinction in Logs

NFR-010 requires that outcomes remain distinguishable without leaking payloads. U03's boundary events log the discriminator, never the content:

| Logged | Not logged |
| --- | --- |
| Outcome discriminator (`denied`, `invalid-query`, `not-found`, `validation`, `conflict`, `unavailable-known`, `unavailable-unknown`, `stale`, `unexpected`) | Request or response payload bodies |
| Correlation ID and provider reference where supplied | Agreement commercial terms, rates, amounts |
| Stable Agreement ID and version where relevant to the outcome | Session tokens, service credentials, replay keys |
| Boundary that produced it (`BFF` vs `PROVIDER_PROTOCOL` for `unexpected`) | Capability names in denial records |
| Timing for the p95 sample | Full stack traces in user-reachable output |

The `unexpected` boundary discriminator matters operationally: it separates "our BFF broke an invariant" from "the provider returned something unmapped", which are different owners.

## Evidence Artifacts

These are the observable outputs the acceptance gates actually consume, and they are the concrete deliverable of this design:

| Evidence | Produced by | Consumed by |
| --- | --- | --- |
| Warmed ten-user route and BFF sample with host, fixture, warm-up, concurrency, sample count, failures, and percentile method | Build and Test | NFR-001 |
| Per-state live journey records across five widths and two themes | Playwright runs | NFR-002, NFR-003 |
| Failure-fixture observations per dependency | Live Compose runs | NFR-005, FR-019 |
| `aidlc-audit` and `erp-fidelity-audit` output | Audit gates | NFR-007, NFR-011 |
| Manager-demo guard before and after | Wrapper scripts | NFR-012 |

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Metrics backend (Prometheus etc.) | No such component in the verified stack; adding one is a platform decision outside W4 | `technology-stack.md`, NFR-012 |
| Log aggregation | Container logs on one host; no aggregator exists | `technology-stack.md` |
| Distributed tracing | No collector or instrumentation library in the stack; correlation ID carries the cross-boundary link instead | `technology-stack.md` |
| Dashboards | No dashboard tool; evidence artifacts are files reviewed at gates | NFR-011 |
| SLI / SLO / error budgets | NFR-001 targets are local acceptance thresholds, explicitly not SLOs | NFR-001, NFR-012 |
| Alerting rules / on-call routing | No alert manager, no production runtime, no on-call surface | NFR-012 |
| Capacity or saturation alarms | No scaling surface to alarm on | `scalability-design.md` |
| APM / RUM | No agent in the stack; would also require sending data off-host | `technology-stack.md`, NFR-012 |

Stage 4.4 Observability Setup owns any future observability platform. This artifact deliberately does not pre-empt it with a design the current stack cannot run.

## Verification

Correlation propagation is verified end to end by asserting the same identifier at the edge, in the provider call, and in the user-facing reference. Outcome distinction is verified by triggering each fixture and asserting the log discriminator differs. Payload-leak prohibition is verified by asserting absent fields in log output for a failure carrying sensitive terms. Per NFR-011, a detector that only prints leads is not a passing gate, and evidence must be produced live rather than inferred.
