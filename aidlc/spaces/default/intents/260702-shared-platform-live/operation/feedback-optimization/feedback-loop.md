# Feedback Loop

## Inputs

This feedback loop consumes `dashboards`, `alarms`, `slo-config`, `deployment-log`, `load-test-results`, and `incident-plan`.

## Operational Learning

The Shared Platform is no longer just view-only at the frontend/BFF level: the Reference Data workbench, BFF service clients, auth bypass guard, seed apply path, provider contract verifier, readiness runner, and CI quality gates have been implemented or hardened. The remaining blocker is runtime activation: prerequisites and services are not available locally, so live contracts, seed apply, BFF availability, latency, outbox freshness, and UI end-to-end behavior cannot be proven yet.

## Next Optimization Cycle

The next cycle should stay on Shared Platform local functionality until it is real functional.

| Step | Objective | Exit criteria |
| --- | --- | --- |
| 1 | Fix workstation/runtime prerequisites | Java 21, Maven 3.9+, Docker Desktop/Linux engine, and direct or Corepack Yarn path are ready |
| 2 | Build and start local runtime | Compose dependencies and `apps` profile run; Keycloak, Identity, Reference Data, nginx, Kafka, and Schema Registry listen on expected ports |
| 3 | Prove live integration | `readiness:local`, live provider contracts, live seed apply, smoke tests, and Reference Data UI mutation path pass |
| 4 | Re-run performance and observability checks | Load test results include real p95 latency, throughput, error rate, saturation, and outbox freshness |

## Product and Module Feedback

Do not start downstream modules until the Shared Platform passes the local functional exit criteria. After that, continue with the remembered four-step sequence:

1. Charge and Customer Agreement.
2. Customer Booking.
3. Container Movement.
4. M0-M4 integration milestones.

## Backlog Items

| Priority | Item | Reason |
| --- | --- | --- |
| P0 | Add or document a one-command local bootstrap | Removes repeated manual prerequisite/start/seed/verify toil |
| P0 | Make direct `yarn` or Corepack usage consistent | Prevents false readiness failures in shells without `yarn` on PATH |
| P0 | Run Maven backend tests after Maven install | Current quality evidence is blocked only by missing Maven |
| P0 | Run live seed apply after services start | Reference data defaults must exist before business modules use them |
| P1 | Add UI smoke for create/edit through BFF | Confirms the workbench is functional, not only rendered |
| P1 | Capture real BFF latency and outbox freshness | Converts blocked SLOs into measurable SLOs |
| P2 | Add optional hosted/cloud cost model | Useful only after local runtime is proven |

## Decision for Next Ideation

The next ideation input is not a new product feature yet. It is: "Make Shared Platform locally runnable end to end, then unlock downstream business modules."
