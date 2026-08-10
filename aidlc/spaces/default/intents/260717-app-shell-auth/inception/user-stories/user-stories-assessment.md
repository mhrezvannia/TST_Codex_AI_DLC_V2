# User Stories Assessment - W2-01 App Shell and Auth

## Source Context

This assessment consumes `requirements.md`, `business-overview.md`, `component-inventory.md`, and `team-practices.md`.

## Execute Decision

User stories are needed for W2-01. The work is user-facing, crosses auth, shell UX, Booking BFF, booking-service, identity-service, Nginx/Compose, and live evidence, and has at least two business-facing personas with different outcomes: a Booking-authorized user and an authenticated user without Booking access.

## Rationale

- `requirements.md` contains a complete end-to-end journey with live acceptance criteria that must remain testable through implementation.
- `business-overview.md` states the business value as identity integrity and one authenticated operating shell, so stories need to preserve user value rather than becoming layer-only tasks.
- `component-inventory.md` shows multiple owned seams: `apps/auth`, `apps/booking`, `packages/auth`, identity-service, and booking-service.
- `team-practices.md` requires vertical, risk-first construction and live Compose proof through Nginx and Keycloak.

## Story Plan

| Journey step | Story | Primary requirement coverage |
| --- | --- | --- |
| Protected entry | US-01 | FR-01, FR-02, FR-03, NFR-01, NFR-02 |
| Booking subject propagation | US-02 | FR-05, FR-06, FR-10, FR-12, NFR-03, NFR-04 |
| Shell navigation, denied path, sign-out | US-03 | FR-07, FR-08, FR-09, NFR-05, NFR-09 |
| Mounted Booking proof and preservation | US-04 | FR-04, FR-11, NFR-06, NFR-08, NFR-10 |

## MVP Boundary

Above the MVP line:

- US-01 through US-04, because each is needed for the live W2-01 Definition of Done.
- Deterministic live-proof identities, detector 6d, `aidlc-audit`, and explicit W1 waiver handling.

Below the MVP line:

- Broad module migration to reference-data, charge agreements, and container movement.
- Full role-admin UX and complete role-based navigation policy editing.
- W2-02 design-system foundation work beyond consuming existing primitives.
- Booking domain/DCSA expansion unrelated to authenticated shell flow.

## INVEST Assessment

The stories are mostly independent by journey step, negotiable in implementation details, valuable to business users or delivery evidence, estimable from current component seams, small enough to sequence into Construction units, and testable through live acceptance criteria. US-02 and US-04 have the highest integration risk and should be sequenced early enough to expose `local-user`, identity-service, and Compose blockers before shell polish.
