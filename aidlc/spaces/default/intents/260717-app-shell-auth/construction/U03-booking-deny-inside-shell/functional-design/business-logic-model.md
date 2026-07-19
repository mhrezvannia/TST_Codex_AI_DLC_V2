# Business Logic Model - U03 Booking Deny

## Source Context

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. U03 proves a signed-in user without Booking access receives an in-shell access-denied state and auditable deny evidence tied to the real subject.

## Workflow

| Step | Component | Processing | Output |
| --- | --- | --- | --- |
| 1 | Shell route guard | Authenticate `local.reference.admin` through the existing auth/Keycloak path. | Safe session summary with real subject. |
| 2 | Shell `/booking` navigation | Render shell frame and attempt Booking access with actor/correlation context. | Booking BFF request context. |
| 3 | Booking BFF | Pass `local.reference.admin` actor and correlation id to booking-service. | Protected read/action request. |
| 4 | booking-service authorization adapter | Call identity-service `/internal/identity/authorize` for resource `booking`, action `read` or requested action. | Authorization decision. |
| 5 | identity-service | Evaluate subject without Booking permissions. | Deny decision and reason/reference. |
| 6 | booking-service/BFF | Map deny to 403/denied result without mutation or `local-user` retry. | Denied response with correlation id. |
| 7 | Shell denied UI | Render access denied inside shell with request-access/back actions. | Accessible denied state. |
| 8 | Evidence capture | Capture subject, action, deny reason/reference, correlation id. | U03 deny evidence. |

## Decision Tree

```text
------------------------------+
| Authenticated shell session |
+---------------+--------------+
                |
                v
       Booking permission?
          /          \
        yes           no
        |             |
        v             v
 Later allow      identity deny
 path             evidence
                    |
                    v
             Shell access denied
```

Text fallback: U03 starts after authentication succeeds. If identity-service denies the Booking action for `local.reference.admin`, the system records deny evidence and renders access denied inside the shell.

## Data Transformations

| Source | Transformation | Target |
| --- | --- | --- |
| `local.reference.admin` session | Normalize to actor subject and preserve roles/permission hints. | Booking BFF request. |
| Booking action request | Map to identity resource/action/scope. | Authorization request. |
| Deny decision | Convert to BFF/shell denied state with correlation id. | Access denied UI and evidence. |
| Decision reference/correlation | Render or capture as QA-safe evidence. | Evidence package. |

## Failure Paths

| Failure | Behavior |
| --- | --- |
| Anonymous user | Redirect to auth; this is U01 behavior, not U03 denied proof. |
| Missing actor subject | Fail closed before booking-service or at booking-service; do not classify as role denial. |
| identity-service unavailable | Fail closed as authorization error; no Booking data or mutation. |
| Booking BFF converts deny to empty list | U03 fails; must render access denied, not empty success. |
| `local.reference.admin` accidentally granted Booking access | U03 fails; seed/permission setup must preserve deny fixture. |

## Traceability

| Requirement/story | U03 behavior |
| --- | --- |
| FR-06, FR-07, FR-12 | Real-subject deny through identity-service for the deterministic deny user. |
| US-02, US-03 | Session subject reaches Booking and denied state renders inside shell. |
| NFR-02, NFR-04, NFR-09 | Fail-closed behavior, correlation evidence, accessible/responsive denied state. |
| NFR-07 | No prohibited frontend libraries in denied-path UI. |
