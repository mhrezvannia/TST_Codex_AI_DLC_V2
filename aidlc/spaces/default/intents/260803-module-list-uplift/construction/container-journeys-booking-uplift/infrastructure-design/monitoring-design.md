# Monitoring Design - U04 Container Journeys and Booking Relationship Uplift

## Source Alignment

Per the answered Q2, this designs what NFR-010 requires and the verified stack can carry — not an observability platform the project lacks.

**Consumed inputs.** `reliability-design.md` supplies the ten-disposition outcome set and the four separate event truths that must stay distinguishable; `security-design.md` bounds what may be logged and forbids exposing signed material; `performance-design.md` supplies the p95 evidence obligations; `scalability-design.md` confirms there is no capacity signal to alarm on; `logical-components.md` supplies the components a signal originates from; `services.md` and `components.md` supply the correlation and evidence contracts; and `business-logic-model.md` supplies the outcomes observed.

## Correlation Design

```
edge:      X-Correlation-Id = $request_id   (inbound value cleared first)
  -> app:  read from request context, never from a browser field
  -> BFF:  bound INTO the subject assertion, and sent as X-Correlation-Id on the v2 call
  -> CMM:  verified as part of the assertion, recorded against the movement
  -> UI:   surfaced as a safe reference on failure states
```

U04's correlation is stronger than the other units': it is not merely forwarded but **cryptographically bound into the assertion**, so a provider-side record can be tied to the exact authorized request that produced it. That property is a security control that doubles as the observability backbone.

## Outcome Distinction in Logs

| Logged | Not logged |
| --- | --- |
| Disposition discriminator (`accepted-confirmed`, `accepted-unconfirmed`, `validation`, `duplicate`, `out-of-sequence`, `denied`, `not-found`, `unavailable-known`, `unavailable-unknown`, `unexpected`) | Request or response payload bodies |
| Correlation ID, event ID, journey ID | **The assertion, the attempt token, the idempotency key, or the origin token** — signed material never appears in logs or UI |
| Which capture gate closed (capability/`captureEnabled` vs location-validation) | Session tokens or service credentials |
| Boundary discriminator on `unexpected` (`BFF` vs `PROVIDER_PROTOCOL`) | Full stack traces in user-reachable output |
| Timing for the p95 sample | Container identity beyond what the record already exposes |

Two U04-specific requirements: `duplicate` and `out-of-sequence` must remain distinguishable **in logs as well as in the UI**, because they indicate different operational situations; and the two capture-disable reasons must be separately identifiable, or an operator cannot tell a permission problem from a Reference outage.

## Observing the Four Event Truths

The four truths — Journey persisted, published to outbox, delivered by broker, applied to Booking projection — each have their own evidence and are never combined into a derived status. The monitoring consequence:

| Truth | Where evidence lives | May the UI show it? |
| --- | --- | --- |
| Journey persisted | CMM aggregate, via authoritative re-read | Yes — the only truth an accepted capture establishes |
| Published to outbox | CMM outbox record disposition | Not without an approved public contract |
| Delivered by broker | Kafka | Never claimed |
| Applied to Booking projection | Booking's own authorized read | Only from Booking's read |

With no replay contract in place, an inferred "applied" could be indefinitely wrong — so the absence of a roll-up indicator is a monitoring design decision, not a missing feature.

**The poison/replay gap has no monitoring mitigation.** There is no dead-letter queue to inspect, no poison ledger to alert on, and no replay tooling to operate. Adding a dashboard would create the appearance of observability over a control that does not exist. The gap stays visible as a BLOCKED exit rather than being made to look managed.

## Evidence Artifacts

| Evidence | Produced by | Consumed by |
| --- | --- | --- |
| Warmed ten-user route and BFF sample (CMM routes **and** the changed `/booking/[bookingId]` page) | Build and Test | NFR-001 |
| Per-state live journey records at five widths, two themes | Playwright | NFR-002, NFR-003 |
| Failure-fixture observations per dependency, including a blocked-partition scenario | Live Compose runs | NFR-005, FR-019, NFR-011 |
| Assertion and token spoof/expiry rejection records | Contract and live runs | NFR-004 |
| `aidlc-audit` and `erp-fidelity-audit` output | Audit gates | NFR-007, NFR-011 |
| Manager-demo guard before and after | Wrapper scripts | NFR-012 |

## Not Designed

| Catalogue item | Why | Forecloses it |
| --- | --- | --- |
| Metrics backend, log aggregation, distributed tracing, dashboards | No such component in the verified stack; correlation binding carries the cross-boundary link | `technology-stack.md`, NFR-012 |
| SLI / SLO / error budgets | NFR-001 targets are local acceptance thresholds, explicitly not SLOs | NFR-001, NFR-012 |
| Alerting / on-call routing | No alert manager, no production runtime, no on-call surface | NFR-012 |
| Consumer-lag or queue-depth monitoring | Would imply operational control over an event path whose failure handling is unowned | `services.md`, the recorded BLOCKED exit |
| DLQ inspection tooling | There is no DLQ | `services.md` |
| APM / RUM | No agent; would also send data off-host | `technology-stack.md`, NFR-012 |

Stage 4.4 Observability Setup owns any future platform; this artifact does not pre-empt it.

## Verification

Correlation binding is verified by asserting the same identifier at the edge, inside the assertion, on the provider call, and in the user-facing reference. Signed-material exclusion is verified by asserting the assertion, attempt token, idempotency key, and origin token appear in **no** log record or DOM. Disposition distinction is verified by triggering each fixture and asserting distinct discriminators, including `duplicate` versus `out-of-sequence` and the two capture-disable reasons. Per NFR-011, evidence must be produced live rather than inferred.
