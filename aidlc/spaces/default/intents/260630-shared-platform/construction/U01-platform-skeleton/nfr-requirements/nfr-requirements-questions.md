# NFR Requirements Questions - U01 Platform Skeleton

## Source Trace

This question record derives from `business-logic-model.md`, `business-rules.md`, and `requirements.md`.

## Q1. Performance targets

Which U01 performance behavior should be fixed at skeleton level?

A. Define build, health, smoke, and request-path hooks that allow later units to validate p95 <= 300 ms reference reads and p95 <= 60 second event freshness (recommended)
B. Set final production throughput for all services now
C. Defer all performance concerns to implementation
X. Other (please specify)

[Answer]: A. Skeleton-level validation hooks (Recommended)

Rationale: `requirements.md` fixes NFR-001 and NFR-002 targets, while `business-logic-model.md` and `business-rules.md` show U01 only creates skeletons and conventions.

## Q2. Security baseline

What security baseline belongs to U01?

A. Enforce BFF-only browser access, Keycloak/Vault placeholders, no public cloud, no direct service/database shortcuts, secure dependency boundaries, and no secret values in repo descriptors (recommended)
B. Implement full authorization and audit policy in U01
C. Defer security to U02 and later units
X. Other (please specify)

[Answer]: A. Structural security baseline (Recommended)

Rationale: U01 owns workspace/runtime conventions; U02 owns detailed authorization and role behavior.

## Q3. Scalability posture

How should U01 handle scalability?

A. Define separable service/app/container boundaries, independent build modules, and Compose profiles so later services can scale and test capacity independently (recommended)
B. Design production autoscaling now
C. Ignore scalability until deployment
X. Other (please specify)

[Answer]: A. Scalable boundaries and profiles (Recommended)

Rationale: U01 is an on-prem Docker Compose skeleton, not a production autoscaling implementation.

## Q4. Reliability baseline

Which reliability requirements belong to U01?

A. Consistent health endpoints, dependency readiness, fail-fast local startup, stable CI scripts, smoke-check placeholders, and durable runtime service definitions for later promotion gates (recommended)
B. Full HA/DR design
C. Only process-start checks
X. Other (please specify)

[Answer]: A. Readiness and smoke baseline (Recommended)

Rationale: NFR-005 and NFR-017 require health/smoke/local reproducibility; final HA/DR is still an open requirement.

## Q5. Technology stack

Should U01 use the mandated Enterprise Technical Environment stack?

A. Yes: Java 21, Spring Boot 3.3, PostgreSQL 15+, Kafka, Confluent Schema Registry, Avro 1.11, OpenAPI, Pact/message-pact, Keycloak 24, Next.js App Router, React, TypeScript strict mode, Turborepo, Yarn, Tailwind, RHF, Zod, Zustand, TanStack Query, Axios through `@erp/api-core`, Docker Compose, Nginx, Vault references, GitHub Actions self-hosted runners, ELK, Prometheus/Grafana, and Jaeger (recommended)
B. Pick lighter defaults and revisit later
C. Use AWS-managed alternatives
X. Other (please specify)

[Answer]: A. Mandated stack (Recommended)

Rationale: C-001 through C-006 are binding and no waiver is approved.

## Ambiguity Analysis

- The NFR-001 p95 <= 300 ms and NFR-002 p95 <= 60 second targets are quantified in `requirements.md`.
- U01 cannot validate final load because it does not implement the actual reference API or outbox behavior; it must create hooks and conventions for later validation.
- Production HA/DR and final load profile remain open in `requirements.md`, so U01 must keep descriptors configurable instead of hard-coding capacity assumptions.
- No follow-up questions are needed for U01 because the skeleton technology stack and constraints are already binding.

