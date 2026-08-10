# Deployment Architecture — booking-design-system-closure

## Design Inputs

This preservation architecture maps `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, and `logical-components.md` to application `components.md`, runtime `services.md`, and the canonical journey in `business-logic-model.md`.

## Acceptance Topology

The only W2-02 deployment target is the existing local Docker Compose topology:

browser → nginx at `127.0.0.1:18088` → authenticated shell → shell Booking adapters → Booking BFF → Booking service → Reference Data/Charge Agreement supporting services, with each service retaining its owned PostgreSQL data and the Booking service retaining its existing Kafka/outbox behavior.

Key isolated host bindings come from `infrastructure/env/wave-a.env.example`:

| Capability | Host binding |
|---|---|
| nginx canonical edge | 18088 |
| Keycloak public URL | 18080 |
| PostgreSQL | 65432 |
| Kafka | 19092 |
| Schema Registry | 18081 |
| identity/reference/charge/booking/CMM services | 18082–18086 |
| shell app | 18104 |
| Booking app/BFF | 18101 |

The wrapper invokes Docker with the fixed project name `linercore-wave-a`, the Wave A env file, and selected profiles. Acceptance commands use the wrapper only.

## Environment Definition

There is one ephemeral/local acceptance environment. It uses existing images/build definitions, health behavior, volumes, networks, services, and ports. It is not staging or production and supplies no production parity, availability, data durability, scale, encryption, residency, cost, or rollback claim.

`WAVE_A_COMPOSE_PROFILES` may select existing profiles, defaulting to `app`; evidence records the actual value. No profile may change the project name or reuse manager-demo ports.

## Lifecycle

1. Record commit/environment; resolve and assert the effective demo-guard inputs are exactly `DEMO_COMPOSE_PROJECT=linercore-shared-platform`, `DEMO_EDGE_URL=http://127.0.0.1:8088`, and `DEMO_IMAGE_TAG=demo-20260721`; then run `npm run demo:guard` and retain those inputs with its result.
2. Inspect `npm run wave-a:config` and retain project/service/port metadata.
3. Start/build only through `node scripts/wave-a-compose.mjs …`.
4. Wait for existing health/readiness surfaces and run canonical UI acceptance.
5. Capture wrapper status/logs as needed.
6. Clean/stop only through wrapper commands scoped to `linercore-wave-a`.
7. Reassert and retain the same effective demo-guard project, URL, and image tag, then run final `npm run demo:guard`.
8. Run audits and close only on complete green evidence.

Any pre-guard failure prevents Wave A mutation. Any post-guard failure prevents closure.

## Infrastructure-as-Code and Sizing

No Terraform, CDK, CloudFormation, Kubernetes, VM, serverless, AWS account, region, staging, production, or new Compose resource is designed. Existing local container sizing and Compose definitions remain authoritative. A compatibility correction is allowed only if implementation traces it directly to the W2-02 canonical path and verifies no manager-demo impact.

## Deployment Failure Boundary

Wave A container/network/volume actions are isolated by project name and ports. The protected manager runtime `linercore-shared-platform` at port 8088 is never a deployment target. Raw or unscoped `docker compose down` is forbidden.

## Review

**Verdict: READY**

The mandatory second review confirmed that the service-call topology matches
executable configuration, both demo guards fail closed on effective target inputs,
and the CI handoff preserves historical W1 BLOCKED/waived truth.

**Mandatory corrections:** None.
