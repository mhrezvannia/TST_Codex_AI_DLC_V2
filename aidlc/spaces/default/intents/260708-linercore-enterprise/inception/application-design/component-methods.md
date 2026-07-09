# Component Methods - LinerCore Enterprise

## Source Context

This method design consumes `requirements.md`, `stories.md`, `architecture.md`, `component-inventory.md`, and `team-practices.md`. Method names are high-level public interface commitments for later Functional Design; detailed domain algorithms remain in Construction design.

## Method Conventions

- Commands return accepted business state or typed business errors.
- Queries are read-only and permission checked.
- Public methods accept `correlationId`, `subject`, and idempotency metadata where mutation or integration side effects are possible.
- Cross-service calls do not expose database models.
- All service methods must map to OpenAPI or AsyncAPI/Avro contracts before implementation readiness is claimed.

## Identity Service Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `authorizeAction` | Authorize user/service action | subject, module, resource, action, correlationId | allow/deny decision | unauthorized, forbidden |
| `assignRole` | Assign role to user/service | subject, targetSubject, role, scope | role assignment | forbidden, invalid role |
| `resolveEffectivePermissions` | Read capabilities for subject | subject, module/scope | capability set | unauthorized |
| `recordAuthorizationAudit` | Persist authorization decision | decision, resource, action, correlationId | audit ID | persistence failure |
| `listCapabilityCatalog` | Read module capabilities | subject, module | capabilities | forbidden |

## Reference Data Service Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `createReferenceRecord` | Create reference record | setCode, record draft, subject, correlationId | record version | validation, forbidden |
| `updateReferenceRecord` | Update reference record | record ID, mutation, subject, correlationId | record version | stale version, validation |
| `retireReferenceRecord` | Retire record | record ID, reason, subject | retired version | forbidden, dependent record |
| `getReferenceRecord` | Read record | setCode, record ID | record | not found |
| `listReferenceSet` | List records | setCode, filters | records page | forbidden |
| `publishReferenceChanges` | Publish outbox changes | batch size, worker ID | publish result | broker unavailable, schema incompatible |
| `validateReferenceUsage` | Validate value for a domain module | setCode, value, module | valid/invalid | set missing |

## Charge Service Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `createAgreement` | Create agreement draft | agreement command, subject, correlationId | agreement summary | validation, forbidden |
| `updateAgreement` | Update agreement | agreement ID, version, command | updated agreement | stale version, validation |
| `approveAgreement` | Approve agreement | agreement ID, subject, reason | approved agreement | forbidden, rule conflict |
| `findActiveAgreement` | Lookup active agreement | customer, lane, commodity, equipment, date | agreement candidate | not found |
| `maintainTariff` | Create/update tariff | tariff command | tariff version | validation |
| `priceBooking` | Execute `pricing.request` | pricing request, idempotency key, correlationId | pricing result | no price, timeout, manual required |
| `configureDndRule` | Create/update D&D rule | D&D rule command | rule version | conflict, validation |
| `calculateDnd` | Execute `pricing.dnd-request` | D&D request, idempotency key, correlationId | D&D result | no rule, conflict, manual required |
| `resolveManualPricing` | Resolve manual pricing exception | exception ID, price lines, approver, reason | pricing result | forbidden, invalid state |
| `resolveManualDnd` | Resolve D&D exception | exception ID, charge, approver, reason | D&D result | forbidden, invalid state |

## Booking Service Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `createBookingDraft` | Create booking draft | booking facts, subject, correlationId | booking draft | validation, forbidden |
| `updateBookingDraft` | Update draft | booking ID, version, mutation | updated draft | stale version, validation |
| `requestPricing` | Orchestrate Charge pricing | booking ID, idempotency key, subject | pricing state | charge unavailable, manual required |
| `storePricingResult` | Store returned pricing | booking ID, pricing result | booking pricing snapshot | stale revision, invalid result |
| `validateOperations` | Validate schedule/capacity | booking ID, adapter context | validation result | adapter unavailable |
| `approveOperationalOverride` | Approve validation override | booking ID, reason, approver | override record | forbidden, invalid state |
| `confirmBooking` | Confirm booking and enqueue event | booking ID, expected version, subject | confirmed booking | missing pricing, failed validation |
| `amendBooking` | Create amendment | booking ID, changes, subject | amendment draft | invalid state, validation |
| `reconfirmBooking` | Reconfirm amendment | amendment ID, subject | new bookingRevision | missing repricing, failed validation |
| `consumeMovementStatus` | Handle `containermovement.status` | event envelope | lifecycle update | duplicate, stale, invalid transition |
| `evaluateDndBoundary` | Decide D&D relevance | booking ID, movement status | trigger/no trigger | insufficient facts |
| `requestDndPricing` | Send D&D request to Charge | booking ID, boundary evidence | D&D request state | charge unavailable |
| `storeDndResult` | Store Charge D&D result | booking ID, D&D result | stored charge | stale revision, invalid result |
| `openException` | Create business exception | module, object ID, reason, correlationId | exception ID | duplicate |
| `resolveException` | Resolve exception | exception ID, action, reason, subject | resolved exception | forbidden, invalid state |

## Container Movement Service Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `consumeBookingConfirmed` | Consume `booking.confirmed` | event envelope | journey created/reconciled | duplicate, stale revision |
| `createJourney` | Create journey | booking facts, revision | journey | validation |
| `reconcileJourneyRevision` | Reconcile changed booking | journey ID, new bookingRevision | reconciliation result | conflict |
| `deriveExpectedMovements` | Generate expected plan | journey route/equipment | expected movements | missing route |
| `captureMovement` | Capture manual/API event | movement command, subject | movement event | validation |
| `validateMovement` | Validate DCSA-aligned facts | movement command | validation result | invalid event |
| `deriveStatus` | Derive movement status | journey ID, event history | status snapshot | inconsistent history |
| `publishMovementStatus` | Publish status event | status snapshot, correlationId | publish result | broker unavailable, schema incompatible |
| `queryJourney` | Read journey | journey ID | journey detail | not found, forbidden |
| `queryMovementHistory` | Read movement timeline | journey ID, filters | movement history | forbidden |

## Enterprise Web App Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `loadShellContext` | Load current user, capabilities, health summary | session | shell state | unauthenticated |
| `searchEnterpriseObjects` | Global search | query, filters, subject | search results | forbidden |
| `loadWorkQueue` | Load assigned exceptions/work | subject, filters | work items | service degraded |
| `submitBookingForm` | Submit booking mutation | form state | API result | validation, forbidden |
| `runPricingAction` | Trigger pricing from UI | booking ID, idempotency key | pricing state | timeout, manual required |
| `captureMovementForm` | Submit movement event | form state | movement state | validation |
| `resolveExceptionAction` | Resolve exception | exception ID, action | resolved state | forbidden |
| `loadOperationsDashboard` | Load runtime evidence | environment | health/evidence | partial data |

## Contract Platform Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `validateContractCatalog` | Validate catalog completeness | catalog path | validation report | missing contract |
| `verifyOpenApiContracts` | Verify HTTP contracts | provider/consumer config | pact report | incompatible |
| `verifyMessageContracts` | Verify message contracts | schema subjects, fixtures | compatibility report | incompatible |
| `registerSchema` | Register schema | subject, schema, compatibility | schema version | compatibility failure |
| `reportContractHealth` | Expose status to UI/CI | contract set | health summary | unavailable |

## Runtime Platform Methods

| Method | Purpose | Input | Output | Errors |
|---|---|---|---|---|
| `startProfile` | Start compose profile | profile name | container state | dependency failure |
| `runMigrations` | Run per-service migrations | service list | migration report | migration failure |
| `seedEnterpriseData` | Seed deterministic data | seed profile | seed report | validation failure |
| `checkHealth` | Check runtime health | profile/environment | health report | service unavailable |
| `runE2EFlowSuite` | Run Flow 1-5 validation | profile | flow report | test failure |
| `collectLocalEvidence` | Gather logs/traces/contract/test evidence | run ID | evidence bundle | partial evidence |

## Traceability

| Source | Method design coverage |
|---|---|
| `requirements.md` | Public methods cover FR-SP, FR-CHG, FR-BKG, FR-CMM, FR-UI, FR-RUN, NFR-COMP, NFR-OBS, NFR-REL |
| `stories.md` | Methods support walking skeleton and workflow-level stories |
| `architecture.md` | Methods follow existing application-service/port/controller pattern |
| `component-inventory.md` | Existing services and missing enterprise services are represented explicitly |
| `team-practices.md` | Methods support testable vertical slice and no cross-database access |

