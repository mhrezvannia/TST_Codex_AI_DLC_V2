# Code Structure

## Repository layout

| Area | Classification | Purpose |
|---|---|---|
| `services/` | Maven reactor, Java 21 | Domain services and platform messaging |
| `services/charge-agreement-service/` | layered service | Charge agreement, rate and pricing authority |
| `services/booking-service/` | layered service | Booking lifecycle and pricing consumer |
| `services/container-movement-service/` | layered service | Container/movement status ownership |
| `apps/charge-agreements/` | Next.js 15 app | Charge operational BFF and workbench |
| `packages/ui/` | TypeScript package | shared LinerCore UI primitives |
| `contracts/openapi/` | contract source | versioned OpenAPI schemas, including `pricing.v1.yaml` |
| `contracts/pact/` | contract fixtures | Booking/Charge compatibility fixtures |
| `infrastructure/`, `compose.yaml` | runtime configuration | local Compose, Nginx, observability and seed setup |

## Charge and D&D-adjacent code paths

- Charge HTTP controllers live in `services/charge-agreement-service/container/.../api/`; `PricingApiController`, `RateApiController`, `W2AgreementApiController`, and `ChargeAgreementApiController` expose the current provider surface.
- Pricing authority lives in `application-service/.../pricing/`, notably `PricingApplicationService`, `PricingAuthorityResolver`, canonicalization, telemetry and terminal rendering; versioned domain models live under `domain-core`.
- Charge persistence and migrations live in `dataaccess` and `container/src/main/resources/db/migration`; W2-03 migrations record versioned rate/agreement authority.
- The Charge app uses route handlers and `lib/bff` policies/types to proxy authenticated requests. Its package supplies Next.js commands and TypeScript checking.
- Booking's `DndPricingPort`, `ChargeDndPricingPortAdapter`, request/response records and `BookingApplicationService.requestDndPricing` are an existing consumer-side seam. W3-01 must not make that code the business authority.

