# Intent Statement — W4-02 Operations & Observability

## Intent

The platform becomes operable: end-to-end tracing (correlation id across UI→services→events), dashboards, alerts, SLOs, and runbooks over the live stack — the operation-phase debt every mvp/feature-scoped intent deliberately deferred, paid once, program-wide. **Driver: Platform/DevOps team.**

## Context Pack (read before starting)

1. `docs/enterprise-technical-environment.md` §observability (OTel + W3C Trace Context → Jaeger; ELK; Prometheus/Grafana — the mandated stack)
2. `docs/quality-gates.md` + `scripts/local-readiness.mjs` (existing readiness machinery to build on)
3. `infrastructure/observability/` (existing descriptors)
4. Event contracts' §9 Observability rows (outbox publish lag, consume lag, dedupe counts — the mandated metrics)

## Vertical Slice Definition

One journey observed end-to-end: drive the W1-01 spine flow → a single trace spans UI request → booking-service → charge call → outbox publish → CMM consume → status return; dashboards show the contract-mandated metrics; one alert fires on a forced failure; the runbook resolves it.

- **Thinnest viable form:** tracing + one dashboard per service + the event-lag metrics + 3 alerts (service down, outbox lag, consumer lag) + runbooks for those 3.
- **Deferred:** load/performance validation at scale, anomaly detection, on-call rotation tooling.

## In Scope / Out of Scope

- **In:** OTel instrumentation (HTTP + Kafka propagation), Jaeger wiring in Compose, structured logs with correlation id, Grafana dashboards, alert rules, runbooks, SLO definitions for the spine flow.
- **Out:** production infrastructure provisioning (still on-prem-Compose scoped), chaos testing.

## Actors & Journey

Operator sees a booking's full trace by correlation id; an outbox stall pages within the alert window; the runbook's steps observably recover it.

## Cross-Module Seams (must be real)

Trace context propagates across **every** seam — sync HTTP and Kafka headers — per Enterprise §5/§observability; verified on the real stack.

## Standards Alignment

OpenTelemetry + W3C Trace Context (mandated); metrics named per the event contracts' observability sections.

## Definition of Done (observed, not "tests pass")

On live Compose: (1) one correlation id yields a complete multi-service trace in Jaeger for the spine flow including the async hops; (2) dashboards render live outbox-lag/consume-lag/dedupe metrics; (3) stop the CMM consumer → lag alert fires; follow the runbook → recovery observed; (4) kill Kafka → outbox retryable behavior visible on the dashboard (ties back to W0-01's guarantees).

## Dependencies

W1-01 (a spine worth observing); benefits from W2-04/W3-02 being live but doesn't block on them.

## Suggested Scope & Sizing

`feature` (this intent *is* operation-phase work; alternatively run as promotion of closed intents to full-arc scope). ~3 vertical units: (U01) tracing end-to-end incl. Kafka propagation; (U02) metrics + dashboards; (U03) alerts + runbooks + failure drills.

## Open Questions

1. Log pipeline for MVP-scale ops?
   - A. Structured JSON logs + Grafana Loki (lighter than ELK for Compose) — deviation from the mandated ELK, needs enterprise sign-off
   - B. ELK as mandated (heavier but conformant) (recommended if resources allow)
   - X. Other
   - `[Answer]:` B — ELK as mandated by the Enterprise Tech-Env (conformant). Revisit Loki only if Compose resource pressure forces it, with enterprise sign-off.
