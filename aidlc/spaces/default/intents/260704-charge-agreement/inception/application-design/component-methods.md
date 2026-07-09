# Component Methods - Charge & Customer Agreement

## Domain Public Methods

| Component | Method | Purpose |
| --- | --- | --- |
| `CustomerAgreement` | `create(command, id, actor, now)` | Create Draft aggregate with header. |
| `CustomerAgreement` | `updateHeader(command, actor, now)` | Update Draft header values. |
| `CustomerAgreement` | `replaceTerms(terms, actor, now)` | Replace charge terms after validation. |
| `CustomerAgreement` | `approve(actor, now)` | Transition Draft to Approved if valid. |
| `CustomerAgreement` | `suspend(actor, reason, now)` | Transition Approved to Suspended. |
| `CustomerAgreement` | `expire(actor, reason, now)` | Mark agreement Expired. |
| `CustomerAgreement` | `isActiveFor(queryDate)` | True only for Approved status and validity range. |
| `ChargeTerm` | `validateWithin(agreementValidity)` | Enforce amount and date rules. |

## Application Service Methods

| Method | Input | Output | Errors |
| --- | --- | --- | --- |
| `createAgreement(CreateAgreementCommand)` | Header fields, actor, correlationId | Agreement detail | 400 validation, 403 auth |
| `updateAgreement(id, expectedVersion, UpdateAgreementCommand)` | Header/terms, version | Agreement detail | 400 validation, 403 auth, 404, 409 |
| `approveAgreement(id, ApproveAgreementCommand)` | Actor/reason/correlationId | Agreement detail | 400 invalid state, 403, 404 |
| `suspendAgreement(id, StatusCommand)` | Actor/reason/correlationId | Agreement detail | 400 invalid state, 403, 404 |
| `expireAgreement(id, StatusCommand)` | Actor/reason/correlationId | Agreement detail | 400 invalid state, 403, 404 |
| `searchAgreements(AgreementSearchQuery)` | customer/status/lane/date/page/size | Agreement page | 400 invalid query |
| `detail(id)` | agreement id | Agreement detail | 404 |
| `activeLookup(ActiveAgreementQuery)` | customer/lane or origin-destination/commodity/date | Active terms result | 200 no-match or result |

## Repository Port Methods

| Method | Purpose |
| --- | --- |
| `save(CustomerAgreement)` | Persist aggregate and terms. |
| `findById(AgreementId)` | Detail lookup. |
| `search(AgreementSearchQuery)` | Filtered page. |
| `findActiveCandidates(ActiveAgreementQuery)` | Candidate set for active lookup. |

## BFF/Frontend Client Methods

| Method | Purpose |
| --- | --- |
| `listAgreements(filters, request, correlationId)` | Call backend search and normalize page. |
| `getAgreement(id, correlationId)` | Fetch detail. |
| `saveAgreement(draft, correlationId)` | POST/PUT agreement. |
| `approveAgreement(id, correlationId)` | Status action. |
| `lookupActiveTerms(query, correlationId)` | Booking-oriented preview. |
| `listReferenceRecords(set, correlationId)` | Load Shared Platform selections. |

## Error Handling

REST controllers should map domain/application exceptions to:

| Exception category | HTTP |
| --- | --- |
| Validation / illegal argument | 400 |
| Authorization denied | 403 |
| Missing agreement | 404 |
| Stale version | 409 |
| Upstream unavailable | 503 |
