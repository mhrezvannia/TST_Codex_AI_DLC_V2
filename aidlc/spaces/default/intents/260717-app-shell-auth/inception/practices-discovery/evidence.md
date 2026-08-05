# Practices Discovery Evidence

## Source Context

Evidence scanned:

- `aidlc/spaces/default/codekb/TST_Codex_integ/code-structure.md`
- `aidlc/spaces/default/codekb/TST_Codex_integ/technology-stack.md`
- `aidlc/spaces/default/codekb/TST_Codex_integ/dependencies.md`
- `aidlc/spaces/default/codekb/TST_Codex_integ/code-quality-assessment.md`
- `aidlc/spaces/default/codekb/TST_Codex_integ/architecture.md`
- `aidlc/spaces/default/codekb/TST_Codex_integ/business-overview.md`
- approved W2-01 ideation artifacts
- project/team memory rules

## Pipeline and Deployment Findings

- Root scripts provide `build`, `lint`, `typecheck`, `test`, `backend:build`, `backend:test`, `local:runtime`, `readiness:local`, `quality:gates`, `contracts:*`, and smoke/evidence scripts.
- Runtime acceptance is local Compose/Nginx, not AWS or public cloud.
- Existing project practices already require short-lived branches and evidence-based gates.

## Quality Findings

- Existing tests cover Booking local identity filter, local authorization, API header/idempotency behavior, identity authorization, and auth/session helpers.
- W2-01 still needs targeted tests and live proof for session-derived subject propagation.
- Detector 6d remains the explicit hardcoded-auth gate.

## Developer Findings

- Frontend structure is Next.js apps under `apps/*` and shared packages under `packages/*`.
- Backend services preserve bounded-context ownership under `services/*`.
- W2-01 code seams are `apps/auth`, `apps/booking/lib/bookings.ts`, `services/identity-service`, and `services/booking-service`.
- Current Booking BFF/backend static actor behavior is the main code-quality risk.

## DevSecOps Findings

- Enterprise baseline mandates Keycloak/OIDC, BFF, HttpOnly cookies, protected route behavior, identity-service authorization, and local-only bypass containment.
- W2-01 must not expose browser tokens or treat local bypass as production-like identity.
- Denied decisions and subject auditability are security evidence, not optional UI details.

## Questions Asked or Inferred

- Walking skeleton: inferred risk-first shell/login/subject-propagation path.
- Scope: inferred W2-01 boundary from approved ideation artifacts.
- Deployment: inferred local Compose/Nginx from enterprise technical environment and codekb.
- Staffing: role-based only; named availability remains unconfirmed.
