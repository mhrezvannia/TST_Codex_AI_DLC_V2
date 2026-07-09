# Requirements - Charge & Customer Agreement

## Intent Analysis

The user wants the application completed beyond Shared Platform by implementing the next business module in the approved roadmap. The approved ideation artifacts define Charge & Customer Agreement as the first module after Shared Platform and before Customer Booking.

This requirements document consumes:

| Input | Requirement source |
| --- | --- |
| `intent-statement.md` | Business goal, target customers, success metrics, and roadmap trigger. |
| `scope-document.md` | In/out boundaries, MVP completion criteria, and value stream. |
| `business-overview.md` | Current Shared Platform capability baseline. |
| `architecture.md` | Current monorepo architecture and integration patterns. |
| `code-structure.md` | Existing backend/frontend/test organization. |
| `team-practices.md` | Walking skeleton, testing, deployment, and code-style expectations. |

## Functional Requirements

### FR-1 Agreement Lifecycle

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-1.1 | The system shall allow a pricing user to create a customer agreement in Draft status. | Creating an agreement through API/UI persists a Draft agreement with customer, validity, owner, and version metadata. |
| FR-1.2 | The system shall allow updating Draft agreement header fields and charge terms. | Updating a Draft agreement changes persisted values and increments version. |
| FR-1.3 | The system shall allow approving a valid Draft agreement. | Approval changes status to Approved and records approvedBy and approvedAt. |
| FR-1.4 | The system shall prevent approving an agreement with no valid charge terms. | API/UI returns a validation error and status remains Draft. |
| FR-1.5 | The system shall allow suspending an Approved agreement. | Suspension changes status to Suspended and removes it from active lookup. |
| FR-1.6 | The system shall expire agreements whose validity end date has passed or that are explicitly expired. | Expired agreements are not returned by active lookup. |

### FR-2 Charge Terms

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-2.1 | The system shall support one or more charge terms per agreement. | Agreement detail returns a non-empty terms collection after terms are added. |
| FR-2.2 | Each charge term shall include charge code, basis, currency, amount, validity dates, and optional notes. | API validation rejects missing required fields. |
| FR-2.3 | Charge amounts shall be positive decimal values. | Zero or negative amount is rejected with a validation error. |
| FR-2.4 | Charge-term validity shall stay within agreement validity. | Term dates outside agreement date range are rejected. |
| FR-2.5 | Charge terms shall reference Shared Platform IDs for charge code and currency. | Create/update validates or records stable reference IDs without duplicating reference records. |

### FR-3 Search, Detail, and UI Workflows

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-3.1 | The UI shall show a searchable/filterable agreement list. | User can filter by customer, status, trade lane, and validity date. |
| FR-3.2 | The UI shall show agreement detail with header, terms, status, and activity metadata. | Opening an agreement displays persisted terms and lifecycle metadata. |
| FR-3.3 | The UI shall support create/edit flows without direct file edits or raw API calls. | User can save a draft from the browser. |
| FR-3.4 | The UI shall expose approval/status actions where permitted. | Approve/Suspend/Expire actions are visible and disabled when invalid. |
| FR-3.5 | The UI shall show validation errors without losing form input. | Failed save preserves entered values and focuses/announces validation summary. |

### FR-4 Active Agreement Lookup

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-4.1 | The backend shall expose an active lookup endpoint for Booking. | API returns approved active terms for matching customer, lane/location, commodity, and date. |
| FR-4.2 | Active lookup shall ignore Draft, Suspended, and Expired agreements. | Tests prove non-approved/non-active statuses are excluded. |
| FR-4.3 | Active lookup shall return a no-match response when no agreement applies. | API returns a deterministic empty/no-match payload, not a server error. |
| FR-4.4 | The UI shall include an active lookup preview for local validation. | User can submit lookup inputs and inspect matched agreement terms. |

### FR-5 Shared Platform Integration

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-5.1 | The module shall consume Shared Platform reference data for customers, charge codes, currencies, locations, commodities, and trade lanes. | UI/API can populate or validate those fields from `reference-data-service` or stable seed IDs. |
| FR-5.2 | The module shall use identity/local auth bypass conventions consistent with existing apps. | Local bypass works in host-runtime mode and is guarded from non-local unsafe use. |
| FR-5.3 | The module shall not duplicate Shared Platform reference-data administration. | No create/update flows for reference records are added inside Charge Agreement UI. |

### FR-6 Local Runtime and Evidence

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| FR-6.1 | The module shall run locally alongside existing Shared Platform host-runtime services. | Health/UI/API endpoints respond on documented non-conflicting ports. |
| FR-6.2 | The module shall include local seed or demo data sufficient for smoke testing. | Seed/smoke command creates or verifies at least one agreement with charge terms. |
| FR-6.3 | The module shall extend readiness/smoke evidence once endpoints exist. | Readiness/smoke artifacts include Charge Agreement checks. |

## Non-Functional Requirements

| ID | Requirement | Pass/fail criterion |
| --- | --- | --- |
| NFR-1 | Backend domain-core shall remain framework-free. | Dependency tests or Maven checks fail if Spring/persistence dependencies enter domain-core. |
| NFR-2 | API responses shall include correlation IDs where errors or upstream calls are involved. | Service/BFF tests verify correlation propagation. |
| NFR-3 | List/search endpoints shall return within 500 ms for 1,000 local records on a developer machine. | Local performance test or bounded unit/integration test documents timing. |
| NFR-4 | UI workflows shall be keyboard accessible and use semantic headings/landmarks. | UI tests or manual checklist cover focus order, labels, and status text. |
| NFR-5 | Agreement status changes shall be auditable. | Approval/suspension/expiration records include actor, timestamp, reason/comment where available. |
| NFR-6 | Docker/Compose limitations shall be reported honestly. | Readiness evidence distinguishes host-runtime pass from optional Docker/Kafka/Keycloak blockers. |

## Constraints

| ID | Constraint |
| --- | --- |
| C-1 | Build Charge & Customer Agreement after Shared Platform and before Booking. |
| C-2 | Use existing Java/Spring Maven and Next.js/Yarn workspace patterns. |
| C-3 | Keep first slice out of full RMS, invoicing, payment, public tariff, spot-rate, index-linked, and carrier-connectivity scope. |
| C-4 | Consume Shared Platform reference data by stable IDs. |
| C-5 | Host-runtime is allowed for construction while Docker recovery remains separate. |

## Assumptions

| ID | Assumption | Rationale |
| --- | --- | --- |
| A-1 | Pricing users are internal users. | Intent and scope identify internal commercial/pricing users. |
| A-2 | Shared Platform seed data contains enough customer/reference records for initial smoke tests. | Existing seed includes customers, charge codes, currencies, locations, commodities, and trade lanes. |
| A-3 | A separate backend service remains the likely boundary. | Feasibility recommends `charge-agreement-service`; application design will confirm. |
| A-4 | Booking consumes active terms later through API rather than direct DB reads. | Keeps bounded contexts independent. |

## Out of Scope

1. Customer Booking implementation.
2. Container Movement Management.
3. Invoice settlement, payment collection, and revenue accounting.
4. Public tariff database.
5. Spot-rate marketplace.
6. Index-linked pricing.
7. Carrier direct connectivity.
8. Production deployment.

## Open Questions

| ID | Question | Target stage |
| --- | --- | --- |
| OQ-1 | Exact backend service boundary: `charge-agreement-service` versus broader commercial service. | Application Design |
| OQ-2 | Exact role names and permission resource/action strings. | Application Design / NFR Requirements |
| OQ-3 | Whether approval requires a reason/comment in the first implementation. | User Stories / Refined Mockups |

## Review

Verdict: READY

Inline product-lead review completed because the configured reviewer subagent model is unavailable in this account. Findings: requirements trace to the approved intent, scope, codekb, and team practices; each functional and non-functional requirement has a pass/fail criterion; out-of-scope boundaries protect against full RMS creep; UI requirements explicitly prevent a view-only completion claim. No required fixes before the stage gate.
