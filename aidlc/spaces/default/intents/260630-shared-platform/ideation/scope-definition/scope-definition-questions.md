# Scope Definition Questions - Shared Platform

> Stage: Scope Definition & Prioritization
> Intent record: `260630-shared-platform`
> Source context: `intent-statement.md`, `feasibility-assessment.md`, `constraint-register.md`, and authoritative program/module documents.

## Q1. Minimum viable scope

What is the minimum viable Shared Platform scope that delivers value?

A. Reference-data service, identity service, Kafka event integration, and both owned frontend apps (recommended)
B. Backend services and Kafka integration only; defer `apps/reference-data` and `apps/auth`
C. Contracts and schemas only; defer runtime implementation
X. Other (please specify)

[Answer]: A. Full Shared Platform MVP (Recommended)

## Q2. Must-have capability boundary

Which capability set should be Must Have for the MVP backlog?

A. Nine reference sets, internal SSO/authorization, reference-change events, provider APIs, and frontend admin/auth flows (recommended)
B. Reference data only; identity and event bus can be Should Have
C. Identity only; reference data and event bus can be Should Have
X. Other (please specify)

[Answer]: A. Full Must Have set (Recommended)

## Q3. Dependency sequencing

What sequencing preference should guide the intent backlog?

A. Dependency-first: platform skeleton, identity/OIDC validation, reference APIs, events, then frontend flows (recommended)
B. Risk-first: OIDC, residency, freshness SLA, then service implementation
C. Value-first: reference admin UI first, then backend/event integration
X. Other (please specify)

[Answer]: A. Dependency-first (Recommended)

## Q4. Scope exclusions

Which exclusion statement should be explicit in the scope document?

A. Do not build Charge, Booking, Container Movement, customer-facing identity, external feeds, multi-entity, or multi-currency now (recommended)
B. Allow lightweight downstream consumer stubs in this workflow
C. Allow customer-facing identity if `apps/auth` is already being built
X. Other (please specify)

[Answer]: A. Strict exclusions (Recommended)

## Q5. Deadline posture

Are there hard deadlines tied to specific capabilities?

A. No hard calendar deadline in the provided docs; prioritize the contract-freeze readiness milestone (recommended)
B. Treat Shared Platform live as a fixed deadline before any downstream Inception starts
C. Treat `apps/reference-data` and `apps/auth` as deferrable if backend contracts are ready
X. Other (please specify)

[Answer]: A. No hard calendar deadline (Recommended)