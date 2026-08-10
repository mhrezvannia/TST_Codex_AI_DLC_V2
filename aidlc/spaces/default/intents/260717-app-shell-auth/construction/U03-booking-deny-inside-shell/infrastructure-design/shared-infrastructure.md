# Shared Infrastructure - U03 Booking Deny

## Source Context

This shared infrastructure design consumes U03 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U03 `business-logic-model.md`. It identifies shared local resources used by the denied path.

## Shared Resource Inventory

| Shared resource | Existing owner | U03 use | Boundary |
| --- | --- | --- | --- |
| Nginx shell edge | W2-01 shell infrastructure | Enter `/booking` through accepted edge. | Reuse only. |
| `apps-shell` | W2-01 shell | Denied UI and protected route frame. | Does not decide authorization alone. |
| `apps-booking`/booking-service | W1 Booking | Protected read/action request and deny mapping. | Preserve Booking behavior and no data leak. |
| identity-service catalog | Identity service | Deny decision for `local.reference.admin`. | Preserve fixture without Booking permissions. |
| W0-01 platform/eventing | Platform foundation | Existing correlations/dependencies. | No redesign. |
| W2-02 primitives | Design-system foundation | Denied UI may consume existing patterns. | No broad foundation work. |

## Access Boundaries

- Browser reaches shell through Nginx.
- Shell/BFF derives actor from session and propagates correlation.
- booking-service calls identity-service for authorization.
- Denied UI renders the backend authorization result; it is not the authorization authority.
- Evidence stores QA-safe fields only.

## Cross-Unit Ownership

U03 depends on U02 preserving both allow and deny fixtures. It provides deny evidence later used by U06. It must not change U02 allow setup by granting Booking permissions to `local.reference.admin`.

## Preservation Controls

| Prior work | Control |
| --- | --- |
| W0-01 platform/eventing | Reuse correlation/eventing dependencies without redesign. |
| W0-02 reference-data | Preserve reference admin semantics and reference-data surfaces. |
| W1-01 Booking | Preserve Booking read/action behavior; map deny explicitly. |
| W2-02 design-system foundation | Consume existing patterns only. |

## Failure Isolation

If deny infrastructure fails, U03 blocks independently. It does not invalidate U02 allow unless the seed/catalog diff shows `local.reference.admin` or Booking permissions drifted. W1 waiver remains distinct and BLOCKED at `compose-start`.

