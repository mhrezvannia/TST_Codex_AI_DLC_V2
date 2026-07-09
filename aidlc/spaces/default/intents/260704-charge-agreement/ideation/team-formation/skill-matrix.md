# Skill Matrix - Charge & Customer Agreement

## Required Skill Coverage

| Skill | Needed for | Current coverage | Gap |
| --- | --- | --- | --- |
| Java 21 / Spring Boot | Backend service/API/container | Covered by existing repo patterns and local toolchain | Low |
| Maven multi-module design | New service integration | Covered by existing services | Low |
| Domain modeling | Agreement lifecycle and charge terms | Covered by AI-DLC architecture stages | Medium |
| Postgres persistence | Agreement storage | Existing local DB and dataaccess patterns | Medium |
| Next.js App Router | UI workspace and BFF routes | Existing apps provide patterns | Low |
| TypeScript/React testing | UI quality | Existing Vitest setup | Low |
| Shared Platform integration | Reference data and identity | Existing services and local runtime | Medium |
| Logistics pricing domain | Agreement/charge semantics | Partially inferred from project context | Medium |
| Compliance/security | Auth bypass, auditability | Captured by rules and later NFR stages | Medium |
| Docker/Compose operations | Full environment parity | Currently blocked by local Docker | High |

## Gap Remediation

| Gap | Remediation |
| --- | --- |
| Pricing-domain specifics | Keep MVP terms generic: agreement header, charge lines, validity, status, lookup dimensions. |
| Shared Platform coupling | Use stable reference IDs and add tests around lookup/request shapes. |
| Docker/Compose blocker | Do not block code construction; track as Operation/platform work. |
| Business acceptance | Keep artifacts readable and approval gates explicit. |

## Definition of Sufficient Coverage

The module has sufficient skill coverage when:

1. Backend domain/API tests pass locally.
2. Frontend UI tests pass locally.
3. Host-runtime smoke checks prove the module can run with Shared Platform.
4. Active-agreement lookup contract is documented for Booking.
5. Docker limitations are documented rather than hidden.
