# Feedback Loop - W2-01 App Shell and Auth

## Inputs And Evidence Classes

This loop consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`. Evidence is classified before it enters future planning:

| Class | Available evidence | Allowed use |
| --- | --- | --- |
| Functional proof | Four live scenarios, real OIDC actors, detector/audits PASS | Close W2 functional acceptance and protect regressions |
| Local performance | Ten sequential warm journeys and per-seam p95 | Validate existing local limits only |
| Operational readiness | Runbooks, role-based escalation, local observability base | Prepare proof-run response and identify gaps |
| Production telemetry | Not available | No SLO, capacity, cost, or user-behavior inference |
| Customer feedback | Not available; actors are synthetic | No feature demand or UX redesign inference |

## Prioritized Improvement Queue

| Priority | Finding | Proposed next action | Acceptance signal |
| --- | --- | --- | --- |
| P1 | Application metrics, traces, and logs are not ingested | Create a focused telemetry-enablement intent, not a W2 shell redesign | All required targets up; one sanitized request linked across metrics/trace/logs |
| P1 | Clean full-profile build times out transferring contexts | Create a focused build-context/reproducibility task | Clean full build completes within an agreed runner timeout |
| P1 separate gate | W1 live waiver remains BLOCKED despite official images being available | Rerun W1 acceptance after build-context/runtime prerequisites are fixed | W1's own manifest passes; never infer from W2 |
| P2 | Telemetry readiness currently requires manual inspection | Add deterministic preflight checks for metrics payloads, actuator endpoints, spans, and log indices | Preflight distinguishes base-stack health from app telemetry readiness |
| P2 | Repeated performance proof is manual | Retain `w2-01-performance-validation.mjs` as manual/scheduled evidence with regression tests | Ten-sample summary remains reproducible and semantically PASS |
| P3 | Repeated evidence creates local artifact growth | Define retention for noncanonical warm-up/run screenshots | Required manifests/audits retained; disposable copies bounded |

## Closed Findings

- W2 live acceptance is PASS with runtime, all scenarios, detector 6d, ERP fidelity audit, and AI-DLC audit green.
- Git Bash resolution and stale blocker cleanup are deterministic and regression-tested.
- Identity Booking lifecycle permissions, BFF actor propagation, seed idempotency, Charge restart safety, official Elastic images, and OTel Collector startup are verified.
- Local p95 targets pass with substantial margin. No local performance optimization is justified ahead of telemetry/build work.

## Product Feedback Boundary

Synthetic `local.booking.user` and `local.reference.admin` journeys prove workflow correctness but do not represent user preference, adoption, conversion, or unmet feature demand. W2-01 is a vertical shell/auth integration intent. The findings do not authorize an umbrella shell redesign, module migration, or design-system replacement, and they preserve W0-01, W0-02, W1-01, and W2-02.

## Operating Cadence

1. On every W2 release proof, run focused tests, live acceptance, strict package validation, and review drift.
2. Run the ten-sample performance suite on material shell/auth/Booking-path changes or scheduled proof runs, not every edit.
3. After any P1/P2, follow `incident-plan`, complete a blameless review, and feed assigned corrective actions into the program backlog.
4. Once production telemetry exists, review SLO compliance and burn weekly; until then report NOT MEASURABLE.
5. Re-rank only from new evidence. A production ideation cycle starts through a new intent and backlog dependency review, never implicitly from this closeout.

## Completion Criteria

W2-01 may complete because its vertical functional and local performance acceptance is green and remaining items are explicitly bounded follow-ups. Completion does not close production observability, production capacity, cloud cost, real-user feedback, or the separate W1 live-proof gate.
