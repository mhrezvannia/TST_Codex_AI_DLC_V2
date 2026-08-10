# Business Rules - U02 Complete Commercial Request

## Rule Scope

These rules consume `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. They extend, and do not replace, U01 create authorization, operation identity, fingerprint, C1 claim, C2 fenced commit, status Refresh, and retry-grant rules. U03, U04, and U05 retain schedule classification, post-save correction/migration, and current-revision validation respectively.

## Command and Draft Rules

| ID | Rule | Failure / persisted result |
| --- | --- | --- |
| BR-U02-001 | The canonical create payload uses the explicit field names in `business-logic-model.md`; legacy aliases and generic attributes are not accepted by the W3 endpoint. | `CONTRACT_SHAPE_INVALID`; no mutation |
| BR-U02-002 | Exactly one routing leg with `legSequence=1` and exactly one equipment line are allowed in W3-04. | Linked array field error; no mutation |
| BR-U02-003 | `currency=USD`, `cargoMode=FCL_DRY`, `reefer=false`, and `dangerousGoods=false` are fixed scope facts. | `FIXED_SCOPE_VALUE_INVALID`; no default/repair |
| BR-U02-004 | Initial `equipmentId` is explicit null and has no editable UI control. | `PHYSICAL_EQUIPMENT_NOT_ALLOWED`; no mutation |
| BR-U02-005 | Required absence may persist only as explicit null plus an ordered completeness reason. Invalid supplied content never persists. | Incomplete draft or linked error |
| BR-U02-006 | Optional consignee, notify party, and volume are explicit null when absent. Omitted/blank optional input is normalized to null and is not a distinct business state. | Canonical null |
| BR-U02-007 | A present optional party requires both ID and version; a present volume requires both value and fixed unit. Partial pairs are invalid. | Linked field error; no mutation |
| BR-U02-008 | A fully complete U02 acceptance record has no U02 missing reasons, but it is not thereby current-reference validated for lifecycle progression. | `COMPLETE` request state only; U05 evidence still absent |

## Normalization Rules

| ID | Field | Canonical rule |
| --- | --- | --- |
| BR-U02-010 | All operator text | Unicode NFC, trim outer Unicode whitespace, preserve remaining internal content/case exactly, then measure Unicode code points |
| BR-U02-011 | Controls | Reject every `Cc` or `Cf` code point, including CR/LF/tab; perform no repair or line-separator mapping and never log rejected raw content |
| BR-U02-012 | `customerBookingReference` | Required when complete; `1..64` code points after normalization |
| BR-U02-013 | `cargoDescription` | Required when complete; `1..500` code points after normalization; shared multiline `TextArea` only |
| BR-U02-014 | Required normalized empty text | Treat as absent and emit one missing reason; do not persist empty string |
| BR-U02-015 | Governed IDs/codes/versions | Never trim/repair into a different reference. Transport whitespace or malformed shape is invalid; authoritative provider comparison is exact after contract-defined code canonicalization |

The UI character counter is advisory. The Booking service is authoritative for normalization and length. No field is silently uppercased except provider-standard code parsing such as exact UN/LOCODE/equipment code validation already defined by its value object; a changed canonical code must still match the live provider record.

## Numeric and Unit Rules

| ID | Field | Rule | Error code |
| --- | --- | --- | --- |
| BR-U02-020 | `packageCount` | JSON integer `1..999999` | `PACKAGE_COUNT_OUT_OF_RANGE` |
| BR-U02-021 | `equipment[0].quantity` | JSON integer `1..9999` | `EQUIPMENT_QUANTITY_OUT_OF_RANGE` |
| BR-U02-022 | `grossWeight.value` | Plain positive decimal string, precision <=18, scale <=3 | `GROSS_WEIGHT_INVALID` |
| BR-U02-023 | `grossWeight.unit` | Exactly `KGM` | `GROSS_WEIGHT_UNIT_INVALID` |
| BR-U02-024 | `volume` | Null or complete positive decimal measure | `VOLUME_INVALID` |
| BR-U02-025 | `volume.unit` | Exactly `MTQ` when volume is present | `VOLUME_UNIT_INVALID` |
| BR-U02-026 | Decimal syntax | No sign, exponent, thousands separator, surrounding whitespace, leading/trailing decimal point, non-finite token, or excess leading zero | Field-specific invalid code |
| BR-U02-027 | Decimal canonicalization | `BigDecimal.stripTrailingZeros().toPlainString()`; no floating-point conversion or rounding | Canonical response/fingerprint |
| BR-U02-028 | Counts | No string, fraction, exponent, boolean, null-as-zero, or rounding | Field-specific count error |

Zero and negative measures are invalid. Missing required gross weight is a completeness reason only when the whole required measure is absent; a supplied partial/invalid measure blocks save.

## Governed Reference Rules

| ID | Rule | Result |
| --- | --- | --- |
| BR-U02-030 | Only a committed option may enter the payload. Search text is never canonical. | Client advisory block; service shape/lookup block |
| BR-U02-031 | Booking authorizes create before every Reference Data call. | Denial causes zero provider work |
| BR-U02-032 | Every supplied reference is re-resolved against its exact subset/role during save. | No browser snapshot is trusted |
| BR-U02-033 | Resolved ID, code where supplied, version, role/set, and `ACTIVE` status must match. | Stable field-specific mismatch code; no Booking mutation; fenced `REJECTED` journal result after C1 |
| BR-U02-034 | Booking persists only `id`, `code`, `displayName`, `version`, `status`, `source`, and semantic role where applicable. | No full provider record or attributes map |
| BR-U02-035 | A missing required reference may persist as null plus a completeness reason. | Valid incomplete draft |
| BR-U02-036 | A supplied reference whose subset is unavailable is not silently dropped, downgraded, or persisted. | Public `REFERENCE_UNAVAILABLE` with typed subset detail; form retained; same-identity command recovery |
| BR-U02-037 | Failure of one subset does not clear unrelated form or option state. Only dependent controls are disabled. | Recoverable subset status |
| BR-U02-038 | Display labels are revision evidence, not lookup keys or master authority. | Reopen may show accepted snapshot; new selection uses live provider |
| BR-U02-039 | U02 selection-time verification does not create U05 lifecycle validation evidence. | Validate/price/confirm remain blocked until U05 |

Party subsets are role-specific: booking customer, shipper, consignee, and notify party cannot be interchanged merely because they point to the same provider entity. Commodity and package type require ID/code/version agreement. POL and POD use typed location identity plus UN/LOCODE/version. Voyage extends the U01 re-resolution seam. Equipment type uses code/version and never implies a physical container.

## Completeness Rules

Completeness reasons are recalculated from the canonical candidate before commit and persisted with the revision. Their order is deterministic:

| Order | Field path | Missing code |
| --- | --- | --- |
| 1 | `bookingCustomerPartyId` | `REQUIRED_REFERENCE_MISSING` |
| 2 | `customerBookingReference` | `REQUIRED_VALUE_MISSING` |
| 3 | `shipperPartyId` | `REQUIRED_REFERENCE_MISSING` |
| 4 | `cargoDescription` | `REQUIRED_VALUE_MISSING` |
| 5 | `commodityId` | `REQUIRED_REFERENCE_MISSING` |
| 6 | `packageCount` | `REQUIRED_VALUE_MISSING` |
| 7 | `packageTypeId` | `REQUIRED_REFERENCE_MISSING` |
| 8 | `grossWeight` | `REQUIRED_VALUE_MISSING` |
| 9 | `routing[0].portOfLoadingLocationId` | `REQUIRED_REFERENCE_MISSING` |
| 10 | `routing[0].portOfDischargeLocationId` | `REQUIRED_REFERENCE_MISSING` |
| 11 | `requestedDepartureDate` | `REQUIRED_VALUE_MISSING` |
| 12 | `selectedVoyage.voyageId` | `REQUIRED_REFERENCE_MISSING` |
| 13 | `equipment[0].equipmentTypeCode` | `REQUIRED_REFERENCE_MISSING` |
| 14 | `equipment[0].quantity` | `REQUIRED_VALUE_MISSING` |

Consignee, notify party, volume, and physical equipment assignment do not generate missing reasons. Fixed scope facts are always explicit and are shape errors when changed. U03 may add schedule-authority reasons after the voyage position without reordering U02 facts.

Persisted reasons contain stable code, canonical field path, group key, and presentation message key. They contain no submitted value or provider payload. Invalid supplied values are returned as command field errors, not mixed into the persisted missing list.

## Idempotency and Atomicity Rules

| ID | Rule |
| --- | --- |
| BR-U02-050 | U02 uses the U01 global operation identity and actor/tenant/type/fingerprint binding. |
| BR-U02-051 | Parse/normalize/shape-validate the exact nullable candidate and compute the fingerprint before C1; C1 persists that immutable fingerprint. |
| BR-U02-052 | The fingerprint includes normalized text, every governed identity/version/code, integers, canonical decimal strings/units, explicit nulls, array order, and fixed facts. |
| BR-U02-053 | Provider-derived labels/status/source/schedule are excluded from client-intent fingerprinting. |
| BR-U02-054 | A duplicate operation with the same fingerprint returns the recorded result and creates no second draft, projection, activity, or completeness record. |
| BR-U02-055 | A duplicate identity with changed normalized content returns `IDEMPOTENCY_CONFLICT`. |
| BR-U02-056 | Reference resolution occurs between C1 and a fenced result transaction; every owned post-C1 outcome records a fenced journal disposition even when no Booking is written. |
| BR-U02-057 | Snapshot, projection, completeness reasons, revision, activity, and `SUCCEEDED` result commit atomically in successful C2. |
| BR-U02-058 | Refresh is read-only; only a signed, version-bound U01 retry grant may reclaim proven non-acceptance. |

### Post-C1 operation dispositions

| Branch | Stored journal result | Booking mutation | Recovery |
| --- | --- | --- | --- |
| Verified candidate | `SUCCEEDED` in successful fenced C2 | One draft/projection/reasons/activity | Inspect canonical result |
| Invalid/stale/inactive/role/version mismatch | `REJECTED` in fenced journal-only C2 | None | Correct linked field; changed payload uses new identity |
| Explicit Reference Data unavailable and not accepted | `NOT_ACCEPTED` in fenced journal-only C2 | None | Read-only status returns expected version/signed grant; retry same identity |
| Malformed provider contract | `REJECTED` with `INSPECT` | None | Inspect safe correlation; no blind retry |
| Fence lost | No stale-owner write | None | Refresh authoritative operation state |
| Persistence rollback before terminal commit | Claim remains nonterminal | None | U01 lease/effective-state/status recovery |

"None" above means no Booking aggregate mutation. It does not permit an owned post-C1 deterministic branch to abandon an `IN_PROGRESS` journal row.

## UI Behavior Rules

| ID | Rule |
| --- | --- |
| BR-U02-060 | There is one Booking-owned create composition with five groups; U02 adds fields to U01 and does not add another route/form. |
| BR-U02-061 | Every input has a persistent visible label. Optional consignee, notify party, and volume are visibly marked optional. |
| BR-U02-062 | Cargo description uses the released shared `TextArea` and count support. If unavailable, U02 remains BLOCKED; no local textarea or single-line substitute is allowed. |
| BR-U02-063 | Client validation is delayed until blur/save and never replaces server validation. Untouched fields show no error noise. |
| BR-U02-064 | Failed save focuses `#booking-errors`; summary links focus exact controls; correcting one value removes only its obsolete error. |
| BR-U02-065 | A passive subset load/failure does not steal focus. Explicit Retry results may focus `#reference-status`. |
| BR-U02-066 | Decimal fields remain strings in client state. The client does not use JavaScript floating-point arithmetic for canonical values. |
| BR-U02-067 | Dirty Cancel uses shared `Dialog`; Keep editing/close restores focus to Cancel. |
| BR-U02-068 | A successful create navigates to canonical Overview and announces once through the U01 safe same-tab flash. |
| BR-U02-069 | Status uses text plus semantic tokens/icons, never color alone; the form itself is not an `aria-live` region. |
| BR-U02-070 | Required evidence covers 375, 390, 768, 1024, 1440 px, 200% zoom, keyboard, reduced motion, forced colors, light/dark themes, and no page-level overflow. |

The review rail is conditional at usable 1024/1440 widths and inline at 375/390/768. The form reserves block-end scroll space for the shared Combobox. No fixed mobile action bar, wizard, marketing header, local palette, or alternate shell is permitted.

## Security, Privacy, and Observability Rules

- Create and read permissions are enforced server-side and independently; hiding a UI action is not security.
- Denial precedes protected lookup and returns no record/reference existence hints.
- Correlation spans browser/BFF/Booking/Reference Data, but safe telemetry records only operation type/state, subset, duration, stable code, and opaque references required by policy.
- Raw customer references, party/customer names, cargo descriptions, provider records, credentials, and request bodies are excluded from logs, traces, audit descriptions, screenshots, and error announcements.
- Existing BFF body limits, origin checks, no-store behavior, service identity, encryption expectations, and stable error envelope remain in force.
- A provider or browser prerequisite that is unavailable is recorded BLOCKED, never converted into PASS through a stub or design assertion.

## Ownership and Deferral Rules

- U03 owns complete/stale/partial/incompatible/temporal voyage-schedule behavior; U02 only retains the U01 identity seam and selected reference.
- U04 alone proves persisted post-save correction, clearing, revision conflict, and brownfield migration. U02 may clear optional values before its first save.
- U05 owns authoritative current-reference validation and the lifecycle validation fingerprint.
- W2-02 owns shared `TextArea`/counter and cross-domain `@erp/ui` behavior. W3-04 may not edit `packages/ui` or create a page override in this stage.
- U08 owns final canonical route convergence and complete operational action precedence.

## Verification Rules

The live U02 run must demonstrate exact full-field create/reopen, optional present/null behavior, boundary text/count/decimal handling, no floating-point loss, no fabricated defaults, role masking, stale/inactive/mismatched/unavailable reference outcomes, partial-draft reason order, input preservation, one operation effect, safe evidence, and the released shared multiline primitive. Unit/component/contract/browser tests accompany the change and provide at least 80% changed executable-line coverage per touched module. `aidlc-audit` and `erp-fidelity-audit` remain intent-exit obligations.

## Upstream Traceability

- `unit-of-work.md`: U02 scope, create-only boundary, shared TextArea dependency, and observed DoD.
- `unit-of-work-story-map.md`: US-02 primary closure and cross-cutting security/evidence contributions.
- `requirements.md`: field dictionary, reference authority, normalization, exact round-trip, accessibility, privacy, and evidence requirements.
- `components.md`: typed Booking aggregate, shared form, bounded reference ports, and ownership map.
- `component-methods.md`: form, create, status, reference-option, and reopen contracts.
- `services.md`: BFF/service transaction, authorization, provider, degradation, and deployment boundaries.
