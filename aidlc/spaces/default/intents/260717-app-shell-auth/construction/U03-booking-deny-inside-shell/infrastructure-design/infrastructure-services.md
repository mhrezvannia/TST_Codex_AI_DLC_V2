# Infrastructure Services - U03 Booking Deny

## Source Context

This infrastructure service design consumes U03 `performance-design.md`, `security-design.md`, `scalability-design.md`, `reliability-design.md`, `logical-components.md`, application `components.md`, application `services.md`, and U03 `business-logic-model.md`. It lists the local services and fixture contracts for the deny path.

## Service Inventory

| Service | Existing/New | U03 responsibility | Change |
| --- | --- | --- | --- |
| Nginx | Existing | Edge route for `/booking` deny proof. | Reuse shell route. |
| `apps-shell` | Existing from U01 | Denied state presentation. | No new service. |
| `apps-auth`/Keycloak | Existing | Authenticate `local.reference.admin`. | Preserve auth behavior. |
| `apps-booking` | Existing | BFF denied-path adapter. | Map backend 403/deny to explicit denied state. |
| `booking-service` | Existing | Authorization boundary. | Call identity-service and block Booking data/mutation on deny. |
| `identity-service` | Existing | Deny decision. | Preserve deny fixture. |
| `seed-loader` | Existing | Local fixtures. | Verify `local.reference.admin` lacks Booking permissions. |

## Configuration Contract

| Configuration | Owner | Rule |
| --- | --- | --- |
| Deny user | identity catalog/seed | `local.reference.admin` exists and has no Booking permissions. |
| Authorization endpoint | `booking-service` | Use identity-service `/internal/identity/authorize` for resource `booking`, action `read` or requested action. |
| Timeout | `booking-service` | Bounded authorization timeout; timeout returns fail-closed denied/error. |
| Service headers | BFF/server-side code | Non-blank actor and correlation only; no `local-user`. |
| Denied UI | `apps-shell`/Booking adapter | One visible denied state with safe recovery actions. |

## Storage and Data Services

U03 adds no storage. Booking data remains in booking-service persistence and must not be disclosed or mutated for denied subjects. Identity catalog remains the source of permission truth.

## Service Discovery

Use existing Compose DNS names: `apps-shell:3000`, `apps-booking:3000`, `booking-service:8085`, and `identity-service:8082`. Browser proof uses Nginx host port `8088`.

## Security Services

No new authorization service, role-admin UI, cache, or global policy service is introduced. Compliance/audit evidence is minimal and QA-safe: subject, action/resource, deny reason/reference, status, timestamp, and correlation id.

## Shared Infrastructure Boundary

U03 consumes the U02 identity authorization and seed infrastructure. Its only unique shared-infrastructure requirement is preserving `local.reference.admin` as deny fixture and preventing deny evidence from being hidden as a shell navigation concern.

