# Components - Charge & Customer Agreement

## Source Alignment

This design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`.

## Backend Components

| Component | Location | Owns |
| --- | --- | --- |
| Charge Agreement Domain | `services/charge-agreement-service/domain-core` | Agreement aggregate, charge terms, lifecycle states, validation rules, value objects. |
| Charge Agreement Application Service | `services/charge-agreement-service/application-service` | Use cases: create, update, approve, suspend, expire, search, active lookup. |
| Charge Agreement Ports | `application-service/port` | Repository, reference-data client, authorization client, id generator, clock, event publisher seam. |
| Charge Agreement Data Access | `services/charge-agreement-service/dataaccess` | Postgres persistence for agreements, terms, and status activity. |
| Charge Agreement Container/API | `services/charge-agreement-service/container` | Spring Boot app, REST controller, error mapping, health endpoint. |
| Charge Agreement Published Language | `services/charge-agreement-service/published-language` | API/event DTOs or agreement-changed facts where needed. |
| Charge Agreement Messaging | `services/charge-agreement-service/messaging` | Optional event publisher adapter; can be stubbed until Kafka is healthy. |

## Frontend Components

| Component | Location | Owns |
| --- | --- | --- |
| Charge Agreements App | `apps/charge-agreements` | Next.js App Router app shell and workbench page. |
| Charge Agreement Workbench | `apps/charge-agreements/app/ChargeAgreementWorkbench.tsx` | List, filters, detail, editor, status actions, active lookup preview. |
| Service Clients | `apps/charge-agreements/lib/service-clients.ts` | BFF calls to charge service, identity, and reference-data services. |
| Domain View Models | `apps/charge-agreements/lib/charge-agreements.ts` | UI-safe types, fixtures/fallbacks, descriptors. |
| API Route Handlers | `apps/charge-agreements/app/api/...` | BFF endpoints and error normalization. |

## External Components Consumed

| Component | Use |
| --- | --- |
| `identity-service` | Authorization and effective permissions. |
| `reference-data-service` | Customer, charge code, currency, location, commodity, and trade-lane reference data. |
| Postgres | Charge agreement persistence. |
| Local reverse proxy | Route `/charge-agreements/` to the new UI in host-runtime mode. |

## Component Boundaries

Charge Agreement owns agreement lifecycle and charge terms. It does not own Shared Platform reference records, Booking creation, Container Movement, invoice settlement, or carrier connectivity.
