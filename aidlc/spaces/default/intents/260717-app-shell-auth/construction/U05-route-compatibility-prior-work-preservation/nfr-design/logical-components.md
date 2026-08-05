# Logical Components - U05 Route Compatibility and Preservation

## Source Context

This component map consumes `performance-requirements.md`, `security-requirements.md`, `scalability-requirements.md`, `reliability-requirements.md`, `tech-stack-decisions.md`, and `business-logic-model.md`. It bridges U05 NFR design to later infrastructure design for legacy route compatibility and preservation evidence.

## Component Inventory

| Logical component | Boundary | NFR responsibility | Failure domain |
| --- | --- | --- | --- |
| Nginx edge | Browser edge in local Compose | Route legacy and canonical Booking URLs through accepted proof path. | Edge routing failure blocks compatibility proof. |
| Compatibility route map | Shell-owned Next.js routing boundary | Fixed `/bookings*` to `/booking*` redirect mapping with no backend prefetch. | Bad mapping breaks old links or bypasses shell. |
| Route validation rules | Shell compatibility route boundary | Enforce `/bookings/new` precedence, trailing slash normalization, one-segment id handling, shell 404 malformed-id handling, decode/re-encode rules, and query allowlist/drop rules. | Ambiguous route parsing can bypass or misroute Booking access. |
| Canonical shell route guard | `apps/shell` server boundary | Reuse auth/session/actor behavior after compatibility resolution. | Guard bypass fails U05. |
| Booking mounted UI/BFF | `apps/booking`/Booking BFF boundary | Preserve list/detail/create behavior and avoid duplicate loads. | Duplicate or standalone load fails compatibility proof. |
| booking-service | Java/Spring booking-service | Preserve existing W1 behavior after canonical route reaches backend. | Domain regression fails preservation proof. |
| Preservation diff review | Evidence/build-time boundary | Classify W0-01/W0-02/W1-01/W2-02 touches and required tests. | Missing reason/test blocks U05. |
| Evidence capture | Artifact package | Record source/target route, status, subject/correlation, preservation outcome. | Evidence gap blocks acceptance. |

## Blast Radius Mapping

| Failure | Blast radius | Containment |
| --- | --- | --- |
| Legacy route bypasses shell | Auth/session/actor proof is invalid. | Fixed mapping must land in canonical shell route context. |
| Open redirect bug | User can be redirected outside trusted routes. | Static one-to-one mapping only. |
| `/bookings/new` parsed as id | Create route compatibility breaks or bypasses intended path. | Match `/bookings/new` before dynamic id route. |
| Encoded slash or traversal accepted | Legacy detail path can escape canonical route semantics. | Return shell 404 for malformed ids, invalid percent encoding, encoded slash, traversal, empty id, and extra segments before redirect or backend call. |
| Duplicate data load | Backend load and behavior diverge from canonical route. | Canonical route owns data load after resolution. |
| Prior-work touch without reason | W0/W1/W2 preservation cannot be trusted. | Evidence blocks until reason and targeted verification exist. |
| W1 waiver rewritten as PASS | Program evidence becomes false. | Waiver check is explicit U05 acceptance condition. |

## Isolation Strategy

- Compatibility map owns only `/bookings*` to `/booking*` routing.
- Query allowlist, decode/re-encode behavior, duplicate-key handling, and malformed-route handling are part of the compatibility map, not Booking domain logic.
- `apps/shell` owns protected canonical route behavior.
- `apps/booking`/booking-service remain Booking owners.
- Preservation diff/evidence is not runtime behavior.
- U05 does not own W4-01 module migration, reference-data migration, charge agreement migration, or container movement migration.
- W0-01 platform/eventing, W0-02 reference-data, W1-01 Booking, and W2-02 design-system foundation remain protected prior-work boundaries; U05 consumes them through stable interfaces only and does not rewrite them for NFR convenience.

## Infrastructure Handoff

Later Infrastructure Design should consume this map to add or verify:

- Nginx forwarding of `/bookings*` to shell and shell-owned Next.js redirect handling for `/bookings`, `/bookings/new`, and `/bookings/[id]`.
- Canonical `/booking`, `/booking/new`, and `/booking/[id]` protected route behavior.
- No backend calls before compatibility redirect.
- Edge-case evidence for route precedence, trailing slash, shell 404 malformed id, encoded path/query values, invalid percent encoding, duplicate keys, and unknown query dropping.
- Preservation evidence generation under `artifacts/w2-01-live/app-shell-auth/`.
- No AWS/cloud resources for W2-01 unless a later approved scope change says otherwise.
