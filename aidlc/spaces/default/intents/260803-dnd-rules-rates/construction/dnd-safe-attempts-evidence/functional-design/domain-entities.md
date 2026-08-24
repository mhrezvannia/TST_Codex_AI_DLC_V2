# Domain Entities - dnd-safe-attempts-evidence

## Ubiquitous Language

This model refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`.

- **Attempt:** one observable invocation/disposition, whether or not terms or a result were resolved.
- **Disposition:** stable outcome category/code/status for success, replay, rejection, conflict, in-progress or unavailable.
- **Owner fence:** namespace/key/owner-token/state comparison preventing stale completion/release.
- **No disclosure:** authorization outcome that reveals neither existence, count nor identity.
- **Fallback audit log:** bounded high-severity evidence used only when a security filter must retain its required response and durable audit is unavailable.

## Entities & Aggregates

| Entity/aggregate | Identity | Composition |
| --- | --- | --- |
| `DndEvaluationEvidence` | `AttemptId` | Outcome/code/status, correlation, fingerprint/replay, bounded request identity, nullable terms/source/calculation facts, timestamp |
| `DndPricingReceipt` | `(OperationNamespace, DndIdempotencyKey)` | Request fingerprint, state, owner token/lease, immutable terminal response/result id |
| `DndPricingClaim` | namespace/key/owner token | Fingerprint, lease-until using database time |
| `DndEvaluationEvidenceView` | `AttemptId` | Authorised disposition-specific projection; never raw payload/token |
| `DndEvidenceSearchQuery` | value | Bounded optional filters, page/size/sort |
| `DndEvidencePage` | value | Discriminated items, one-based page, size, totals and stable sort |

## Field-Level Schema (canonical names)

| Field | Type / Value object | Canonical name (source) | Standard | Notes |
| --- | --- | --- | --- | --- |
| Attempt identity | bounded id | `attemptId` | W3 evidence API | Always present |
| Result identity | optional id | `dndPricingRequestId` | `pricing.dnd-result` | Success/replay only |
| Outcome | closed enum | `outcome` | W3 evidence | Bounded telemetry label |
| Public code | closed string | `code` | FR-06/provider contract | Exact stable code |
| HTTP status | integer | `status` | HTTP | Exact disposition status |
| Correlation | optional bounded id | `correlationId` | LinerCore | Present when validated/available |
| Fingerprint | SHA-256 value | `requestFingerprint` | W3 idempotency | No raw body substitute |
| Replay flag | boolean | `replay` | W3 evidence | True only for immutable replay |
| Booking/equipment/closing id | optional typed ids | `bookingRef`, `equipmentId`, `closingMovementEventId` | W3 bilateral | Present only after parsing |
| Terms identity | optional typed id | `dndTermsId`, `dndTermsVersionId` | W3 terms | Nullable before resolution |
| Basis fields | optional discriminated evidence | `pricingBasis`, `pricingRef`, `pricingBasisVersionId`, `pricingEffectiveDate` | W2/W3 | Echoed/resolved as applicable |
| Calculation fields | optional typed values | `elapsedDays`, `chargeableDays`, `amount`, `calculatedAt` | W3 result | Success/replay only |
| Receipt namespace | enum | `operationNamespace` | Charge persistence | `DND_PRICING` vs `STANDARD_PRICING` |
| Claim owner/lease | token + database instant | internal owner token, `leaseUntil` | W2 receipt pattern | Never exposed to browser |
| Evidence kind | closed enum | `kind` | General audit response | SUCCESS, REPLAY, NO_RATE, VALIDATION, MALFORMED, AUTHENTICATION, FORBIDDEN, CONFLICT, IN_PROGRESS, UNAVAILABLE |
| Search range | optional inclusive instants/dates | `occurredFrom`, `occurredTo` | Audit query contract | Both required together; maximum 31 days |
| Page contract | one-based ints and enum | `page`, `size`, `sort`, `totalElements`, `totalPages` | Audit query contract | size 25/50; stable attempt-id tie-breaker |

## Contract Fidelity Check

- Missing provider/evidence fields: none.
- Renamed fields: none at API boundary.
- Nullable shape is intentional and required: malformed/auth/conflict/no-rate attempts may not have terms/source/calculation ids.
- Result shape remains the signed U01 contract; U04 adds evidence/query projections, not fields to the immutable result.
- Secrets/raw payload and internal owner token are deliberately absent from public evidence.

## Invariants & Validation

- `AttemptId` is unique and queryable independently of terms id.
- Outcome controls allowed optional fields; a no-rate/conflict row cannot fabricate a calculation.
- Success completion and success evidence share one transaction.
- Receipt completion/release requires exact namespace/key/owner/state.
- Search filters/page size/date range are bounded before repository execution.
- Authorization is evaluated before query and denial executes no count/data read.
- `releaseAndAppendOwnedFailure` is atomic in the Charge database. A lost fence writes neither release nor attempt; winner classification precedes the one final evidence append.
- Primary audit-store failure cannot persist its own primary row; the explicit invariant exception is one bounded structured fallback log and a `503`, with no recursive audit attempt.

## Lifecycle / State

Attempt evidence is append-only after its final external disposition is known. Receipt lifecycle is absent -> in-progress -> completed, or atomic owned handled-release-plus-evidence -> absent; database-time takeover replaces an expired owner. Completed response is immutable. A stale owner has no valid state transition and cannot pre-write a disposition.

## Open Questions

1. Any field where the canonical/DCSA name is unknown or disputed?
   - A. All canonical names confirmed from contracts/DCSA (recommended)
   - B. Some names need a domain-expert decision (list them)
   - X. Other
   - `[Answer]: A - signed provider schemas and approved Application Design define every U04 evidence field.`
