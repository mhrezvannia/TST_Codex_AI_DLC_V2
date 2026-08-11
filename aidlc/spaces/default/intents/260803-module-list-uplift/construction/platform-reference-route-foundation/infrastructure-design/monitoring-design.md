# Monitoring Design - U01 Platform and Reference Route Foundation

## Source Alignment

Per the answered Q2, this designs what NFR-010 requires and the verified stack can carry — not an observability platform the project lacks.

**Consumed inputs.** `reliability-design.md` supplies the read-result set that must stay distinguishable; `security-design.md` bounds what may be logged; `performance-design.md` supplies the p95 evidence obligations and the platform baseline; `scalability-design.md` confirms there is no capacity signal to alarm on; `logical-components.md` supplies the components a signal originates from; `services.md` and `components.md` supply the correlation and evidence contracts; and `business-logic-model.md` supplies the outcomes observed.

## Correlation Design

U01 establishes the correlation chain the other units inherit.

```
edge:      X-Correlation-Id = $request_id   (inbound value cleared first)
  -> app:  read from request context, never from a browser-supplied field
  -> BFF:  forward as trusted correlation on the provider call
  -> UI:   surface as a safe reference on failure states
  -> logs: present on every boundary event for the request
```

One identifier spans edge to provider and appears in both the user-visible reference and the log record, so a reported failure reference maps to an exact request without exposing anything sensitive.

## Outcome Distinction in Logs

| Logged | Not logged |
| --- | --- |
| Read-result discriminator (`ok`, `invalid-query`, `not-found`, `denied`, `stale`, `unavailable`) | Request or response payload bodies |
| Correlation ID and provider reference where supplied | Reference record attribute values |
| Stable `setCode` and `recordId` where relevant | Session tokens or service credentials |
| Which input class was rejected (duplicate, unknown, malformed, overlong, traversal, encoded separator, out-of-prefix) | Capability names in denial records |
| Timing for the p95 sample | Full stack traces in user-reachable output |

The rejected-input-class field is U01-specific and useful: it distinguishes a client bug from a probe attempt without logging the offending value itself.

## Evidence Artifacts

| Evidence | Produced by | Consumed by |
| --- | --- | --- |
| Warmed ten-user route and BFF sample, with the platform baseline segments recorded separately | Build and Test | NFR-001 |
| Per-state live journey records at five widths, two themes | Playwright | NFR-002, NFR-003 |
| Failure-fixture observations per dependency, including target-scoped edge failure | Live Compose runs | NFR-005, FR-019 |
| `aidlc-audit` and `erp-fidelity-audit` output | Audit gates | NFR-007, NFR-011 |
| Manager-demo guard before and after | Wrapper scripts | NFR-012 |

The first row carries U01's extra obligation: recording the shell render, edge overhead, and Identity decision segments separately so later units can distinguish a platform regression from a domain one.

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Metrics backend, log aggregation, distributed tracing, dashboards | No such component in the verified stack; correlation carries the cross-boundary link | `technology-stack.md`, NFR-012 |
| SLI / SLO / error budgets | NFR-001 targets are local acceptance thresholds, explicitly not SLOs | NFR-001, NFR-012 |
| Alerting / on-call routing | No alert manager, no production runtime, no on-call surface | NFR-012 |
| Capacity or saturation alarms | No scaling surface to alarm on | `scalability-design.md` |
| APM / RUM | No agent in the stack; would send data off-host | `technology-stack.md`, NFR-012 |
| Uptime / synthetic monitoring | No hosted endpoint to probe | NFR-012 |

Stage 4.4 Observability Setup owns any future platform; this artifact does not pre-empt it with a design the current stack cannot run.

## Verification

Correlation propagation is verified end to end by asserting the same identifier at the edge, in the provider call, and in the user-facing reference. Outcome distinction is verified by triggering each fixture and asserting distinct discriminators. Payload-leak prohibition is verified by asserting absent fields in log output. Per NFR-011, evidence must be produced live rather than inferred.
