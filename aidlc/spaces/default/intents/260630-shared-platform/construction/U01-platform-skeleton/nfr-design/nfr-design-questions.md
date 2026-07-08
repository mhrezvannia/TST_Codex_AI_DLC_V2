# NFR Design Questions - U01 Platform Skeleton

## Source Trace

This question record derives from `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`.

## Q1. Performance pattern

Which performance pattern belongs to U01?

A. Define measurement hooks, script seams, lightweight health endpoints, and bounded local Compose profiles; leave final API/outbox tuning to later units (recommended)
B. Implement caching and query tuning now
C. Defer all performance design
X. Other (please specify)

[Answer]: A. Skeleton measurement hooks (Recommended)

## Q2. Security pattern

Which security pattern should the skeleton encode?

A. BFF-only browser access, hexagonal domain isolation, Vault references, no public cloud, no custom auth, and no direct database coupling (recommended)
B. Public-cloud IAM pattern
C. UI-only access controls
X. Other (please specify)

[Answer]: A. Structural security controls (Recommended)

## Q3. Scalability pattern

How should U01 support future scaling?

A. Separate service/app/package/runtime boundaries, independent scripts, and Compose profiles without final autoscaling technology (recommended)
B. Kubernetes autoscaling descriptors now
C. One monolithic app
X. Other (please specify)

[Answer]: A. Separable boundaries and profiles (Recommended)

## Q4. Reliability pattern

What reliability design belongs to U01?

A. Liveness/readiness endpoint contracts, health-gated Compose dependencies, smoke hooks, correlation-ready error envelopes, and fail-fast startup diagnostics (recommended)
B. Final production HA/DR
C. Process-start checks only
X. Other (please specify)

[Answer]: A. Readiness and smoke design (Recommended)

## Ambiguity Analysis

- `tech-stack-decisions.md` makes the stack binding and prohibits AWS/public-cloud and Kubernetes assumptions for this MVP.
- `business-logic-model.md` scopes U01 to skeleton and convention design, so concrete caching/query/publisher tuning belongs to later units.
- No follow-up questions are needed for U01 NFR design.

