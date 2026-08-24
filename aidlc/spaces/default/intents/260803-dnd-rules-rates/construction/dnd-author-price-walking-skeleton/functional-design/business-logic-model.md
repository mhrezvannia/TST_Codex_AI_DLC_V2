# Business Logic Model - dnd-author-price-walking-skeleton

## Source authority and outcome

This design refines approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, Application Design `components.md`, `component-methods.md`, and `services.md`. It implements U01 without changing W2-03 pricing authority, the signed additive contract boundary, or the later responsibilities of U02-U04.

The Bolt proves one representative `IMPORT_DEMURRAGE` journey live while its owned schema, value types and `pricing.v1` contract are generic for all three fixed D&D rule types.

U01 also owns the minimum fresh Standard-pricing enrichment/persistence path required to create the representative immutable booking-time snapshot on the running stack: exact basis-version/effective-date/original-request evidence plus the representative structured trigger item are rendered and completed with the existing Standard result. U02 consumes this proved path and completes all-type/successor, duplicate-authority, handled-release and replay-governance breadth. This removes any U01 -> U02 runtime dependency while preserving U01 -> U02 topology.

## Workflow A - create and approve representative terms

1. The authenticated Charge BFF obtains the server session and correlation id; the browser receives no service credential.
2. The form accepts rule type, exact pricing basis/reference/version, port, trade lane, equipment type, free days, flat daily rate, currency, charge code, inclusive effective window and reason.
3. `DndMovementBounds.forRuleType` derives the immutable move pair and POL/POD side. User input cannot override them.
4. `DndReferenceValidationPort` validates canonical reference identifiers. The selected active LOCATION must expose a valid IANA `timeZoneId` before approval.
5. `DndTerms.firstDraft` creates aggregate/version/activity identities and persists them atomically.
6. Approval authorizes `charge-rates:approve`, locks the canonical applicability key, checks inclusive window overlap, changes only the Draft version to Approved and appends activity in the same transaction.
7. Detail reads the stable aggregate and exact selected version. A normal Charge restart must return the same immutable facts.

Decision outcomes:

| Condition | Outcome | Persisted effect |
| --- | --- | --- |
| Valid Draft create | Detail with Draft status | Aggregate, version and activity atomically created |
| Invalid field/reference | `422` field errors | No aggregate/version change |
| Missing timezone at approval | `422 DND_PORT_TIME_ZONE_REQUIRED` | Draft retained unchanged |
| Overlap | `422 DND_TERMS_OVERLAP` | Draft retained; conflict evidence returned when authorised |
| Version race | `409 DND_TERMS_VERSION_CONFLICT` | No stale mutation |
| Valid approval | Immutable Approved detail | Version and activity atomically committed |

## Workflow B - exact zero/non-zero provider evaluation

1. `PricingServiceIdentityFilter` rejects spoofing, invalid service identity or invalid correlation before controller parsing.
2. The controller validates media type, exact length-prefixed `Idempotency-Key`, and `DndPricingRequest` shape.
3. Application authorization checks `charge-agreement:price`.
4. The command derives the bilateral key from `bookingRef + equipmentId + endMovement.movementEventId` and fingerprints every required business field canonically.
5. `DndPricingReceiptRepository` operates only in `DND_PRICING`:
   - identical terminal fingerprint -> exact immutable replay;
   - different fingerprint -> `409 IDEMPOTENCY_CONFLICT`;
   - live owner -> `409 PRICING_IN_PROGRESS`;
   - otherwise -> own or take over the claim using database time and an owner token.
6. `DndPricingBasisEvidencePort` validates the exact immutable W3-era `STANDARD_PRICING` receipt. It compares the requested `dndRuleType` and its derived fixed bounds to one exact structured item in the stored `applicableDndRuleTypes`; absence or mismatch is `404 NO_RATE`. It never calls the current-authority selector.
7. `DndTermsRepository.findExactApproved` matches every echoed applicability dimension and effective date.
8. Before any Reference Data call, movement validation requires the exact derived pair, qualifiers and nondecreasing instants; a failure is `422 PRICING_VALIDATION` even when Reference Data is unavailable.
9. `PortTimeZoneProvider` reads the real active Reference Data LOCATION timezone; no direct database, UTC default or cache guess is allowed.
10. The pure calculator converts both already-validated instants to port-local dates and applies:
    - `elapsedDays = max(0, endLocalEpochDay - startLocalEpochDay)`;
    - `chargeableDays = max(0, elapsedDays - freeDays)`;
    - `amount = flatDailyRate * chargeableDays`.
11. Completion atomically stores the immutable terminal response and success evidence under the owner fence. A stale owner classifies the winning receipt and never publishes stale work.

Zero charge is a successful one-line result with `chargeableDays=0` and `amount=0.00`; it is never empty or `NO_RATE`.

## Data transformations

| Input | Transformation | Output |
| --- | --- | --- |
| Rule type | Closed lookup | Fixed start/end DCSA codes, EMPTY/LADEN qualifiers and side |
| Form money | Scale-two non-negative value with ISO currency | Immutable flat daily rate |
| Effective dates | Inclusive ordered range | Approval overlap key/range |
| Pricing request body | Version-tagged UTF-8 length-prefix encoding | SHA-256 request fingerprint |
| UTC/RFC3339 instants + IANA ZoneId | Port-local `LocalDate` conversion | Epoch-day difference |
| Approved terms + movements | Pure deterministic calculation | Exactly one immutable charge line |

## Integration and transaction boundaries

- Reference Data and Identity calls occur outside database locks; their unavailability fails closed.
- Draft creation and approval each use one Charge transaction for version plus activity.
- Successful receipt, exact rendered response and success attempt evidence commit in one Charge transaction.
- U01 exclusively owns the ordered migration chain, generated provider/consumer fixtures and bilateral signoff. Later Units consume these artifacts unchanged.
- U01's minimum Standard enrichment is a real generic code path exercised with one representative trigger. U02 extends its lifecycle/failure breadth; it does not supply a prerequisite for U01.
- The live DoD requires UI -> BFF -> Charge API/domain/database and direct provider -> Reference Data -> calculator -> receipt behavior on the guarded stack; mocks cannot satisfy it.

## Scenario coverage

| Scenario | Expected evidence |
| --- | --- |
| Authorised representative create/approve | Stable URL, version id, fixed pair, timezone, audit actor/time |
| Restart | Same Approved facts and response receipt remain readable |
| Same local date | `elapsedDays=0`, zero line |
| Beyond free time | Exact non-zero line and source ids |
| Exact replay | Byte-identical stored response |
| Platform dependency absent | UI integration evidence remains `BLOCKED`; no local fork |

## Review History - Iteration 1 (superseded)

**Verdict: NOT-READY**

1. **BLOCKER - the walking skeleton has a circular runtime dependency on U02.** Workflow B requires `DndPricingBasisEvidencePort` to validate an exact W3-era `STANDARD_PRICING` receipt containing the additive basis-version/effective-date and immutable original-request evidence. This Unit owns only the schema/contract foundation, while U02 exclusively owns fresh `/pricing-requests` enrichment and completion of those facts. Therefore U01 cannot produce its required live direct D&D zero/non-zero proof through a real Standard-pricing path before its declared dependent U02 exists. Move the minimum fresh Standard-pricing enrichment/persistence needed by the representative path into U01, with U02 completing breadth/failure governance, or change the Unit boundary and DAG/DoD explicitly; a seeded or fixture-only receipt does not satisfy the stated live vertical DoD.
2. **BLOCKER - the workflow violates the declared error precedence.** Workflow B resolves `PortTimeZoneProvider` before validating the fixed movement pair, qualifiers and end-before-start condition. During a Reference Data outage, a semantically invalid request would therefore return `503 PRICING_UNAVAILABLE`, although `business-rules.md` and `component-methods.md` require `422 PRICING_VALIDATION` before dependency unavailability. Validate all timezone-independent movement semantics before the timezone call; then perform local-date conversion and calculation.
3. **BLOCKER - exact booking-time snapshot validation omits trigger membership.** The workflow validates basis/reference/version/date and applicability, but never requires the requested `dndRuleType` and its fixed bounds to exist in the stored Standard receipt's `applicableDndRuleTypes`. FR-04 requires the echoed rule type to be validated against the immutable booking-time snapshot. State the exact membership/bounds comparison and map absence/mismatch to `404 NO_RATE`; otherwise a type not advertised at booking time can be evaluated against a later-found terms version.
4. **BLOCKER - the binding `domain-entities.md` contract-fidelity template is not implementable as written.** U01 owns the published request/result contract, yet its field table omits required canonical fields/shapes including `pricingRequestId`, `bookingRef`, both structured movements (`movementEventId` and `eventDateTime`), `dndPricingRequestId`, closing movement identity, discriminated source-version evidence and `calculatedAt`, while claiming no missing fields. Expand the field-level schema and explicit contract diff so every request/result field and array/object shape is accounted for before provider/consumer generation.

The answered questions are unambiguous, required sections/upstream coverage passed, and the shared-shell/Dialog ownership and `BLOCKED` evidence language conform to the UI governance contract. Linter/type-check path filtering is not applicable to these Markdown artifacts and is not a finding.

## Review

**Verdict: NOT-READY**

1. **BLOCKER - the cycle is removed only inside Functional Design, not in its required `unit-of-work.md` authority.** The corrected U01 artifacts assign the minimum real fresh Standard snapshot/representative-trigger enrichment to U01, but the approved Unit definition still assigns `DndTriggerMetadataResolver`, typed Standard evidence completion and runtime enrichment to U02 and says U02 owns runtime behavior only after U01. Code Generation and Delivery Planning therefore receive contradictory ownership for the prerequisite that makes U01's live DoD possible. Update the Unit definition/story map/ownership boundary to name U01's minimum producer path and U02's breadth extension, or the original U01 -> U02 behavioral cycle remains unresolved across stages.
2. **BLOCKER - the U01-owned request/result field schema is still incomplete despite claiming exhaustive fidelity.** Against `component-methods.md`, the table still omits required request fields `equipmentType` and `tradeLane`; result fields `dndTermsId`, `dndTermsVersionId` and predecessor evidence; and the canonical `charges[]` item fields `chargeCode`, `elapsedDays` and `chargeableDays` (including their array placement/requiredness). Add every published request/result field and exact object/array shape before provider/consumer generation.

The movement-semantic-before-timezone order, exact stored-trigger membership check, representative real Standard snapshot path, and UI ownership/evidence posture are otherwise corrected. Required-sections and upstream-coverage passed; linter/type-check remain not applicable.
