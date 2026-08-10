# Business Logic Model - U02 Complete Commercial Request

## Purpose and Scope

U02 extends the U01 `/booking/new` draft-create, operation-journal, persistence, and reopen spine with the complete approved commercial request dictionary. It owns normalization, ranges, explicit nulls, role-aware option resolution, typed minimum reference snapshots, and ordered request-completeness reasons. Its live Definition of Done is a fully complete request whose required and optional values round-trip exactly. A valid partial draft may also persist, but an invalid supplied value or a supplied reference that Booking cannot verify never becomes canonical data.

This model consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`. It implements the U02 slice of US-02, US-04, US-05, US-10, and US-11, chiefly FR-001 through FR-007, AC-001 through AC-003, and NFR-002 through NFR-010. U03 retains the full schedule-state matrix, U04 owns post-save same-record correction and legacy migration, and U05 owns authoritative current-revision validation for lifecycle progression.

## Authority and Ownership

| Concern | Authority | U02 behavior |
| --- | --- | --- |
| Request values, completeness, draft revision, operation result | Booking | Normalizes, validates, persists, and reopens one typed aggregate |
| Party, commodity, package type, location, voyage, equipment type | Reference Data | Booking resolves committed ID/code/version against bounded live sets before save |
| Browser selection and labels | Presentation only | Retained through recoverable failure, never persisted as authority without server resolution |
| Authentication and create permission | Existing BFF and Booking service policy | Checked before protected lookup or provider work |
| Shell, primitives, tokens, responsive behavior | LinerCore and released `@erp/ui` | Reused without a local shell, palette, or primitive fork |
| Shared multiline input | W2-02 / UI Platform | Required dependency; U02 executable UI evidence is BLOCKED while it is absent |

Reference Data remains the master. Booking persists a small, typed, immutable-at-revision snapshot under each semantic field or role so a reopened draft can state what was accepted without copying provider records or introducing an `attributes` bag.

## Canonical Draft Command

The shell route, Booking BFF, and Booking service use this semantic JSON shape without renaming. A complete example is:

```json
{
  "bookingCustomerPartyId": "party-customer-id",
  "bookingCustomerPartyVersion": "17",
  "customerBookingReference": "ACME-PO-1042",
  "shipperPartyId": "party-shipper-id",
  "shipperPartyVersion": "8",
  "consigneePartyId": null,
  "consigneePartyVersion": null,
  "notifyPartyId": null,
  "notifyPartyVersion": null,
  "cargoDescription": "Machined steel components",
  "commodityId": "commodity-id",
  "commodityCode": "MACHINED_STEEL_COMPONENTS",
  "commodityVersion": "11",
  "packageCount": 120,
  "packageTypeId": "package-type-id",
  "packageTypeCode": "CT",
  "packageTypeVersion": "4",
  "grossWeight": { "value": "24500.125", "unit": "KGM" },
  "volume": { "value": "52.5", "unit": "MTQ" },
  "routing": [
    {
      "legSequence": 1,
      "portOfLoadingLocationId": "location-usnyc-id",
      "portOfLoadingUnLocode": "USNYC",
      "portOfLoadingVersion": "23",
      "portOfDischargeLocationId": "location-nlrtm-id",
      "portOfDischargeUnLocode": "NLRTM",
      "portOfDischargeVersion": "31"
    }
  ],
  "requestedDepartureDate": "2026-08-20",
  "selectedVoyage": {
    "voyageId": "voyage-id",
    "voyageVersion": "19"
  },
  "equipment": [
    {
      "equipmentTypeCode": "45G1",
      "equipmentTypeVersion": "7",
      "quantity": 3,
      "equipmentId": null
    }
  ],
  "currency": "USD",
  "cargoMode": "FCL_DRY",
  "reefer": false,
  "dangerousGoods": false
}
```

The current W3-04 scope contains exactly one ordered routing leg and one ordered equipment request. Initial physical `equipmentId` is always explicit null. Optional consignee, notify party, and volume keys are always present and explicit null when absent. A present party has both ID and version; a null party has both fields null. A present measure has both value and its fixed unit.

For a partial draft, any missing required property, omitted property, empty text after normalization, or null required property becomes the single business meaning `absent`; persistence writes explicit null and an ordered completeness reason. This tolerance does not apply to malformed supplied values. An optional empty string is canonicalized to null, never stored as a third meaning.

The transport parser accepts absence for draft-required values and canonicalizes it into one exact nullable candidate shape before fingerprinting. U02 therefore generalizes U01's complete PB-01 command invariants: the draft candidate always has one routing slot and one equipment slot, but their required facts may be null; `selectedVoyage` and `grossWeight` may also be null. Fixed scope facts and initial null physical assignment remain mandatory and non-null. A normative partial candidate is:

```json
{
  "bookingCustomerPartyId": null,
  "bookingCustomerPartyVersion": null,
  "customerBookingReference": null,
  "shipperPartyId": null,
  "shipperPartyVersion": null,
  "consigneePartyId": null,
  "consigneePartyVersion": null,
  "notifyPartyId": null,
  "notifyPartyVersion": null,
  "cargoDescription": null,
  "commodityId": null,
  "commodityCode": null,
  "commodityVersion": null,
  "packageCount": null,
  "packageTypeId": null,
  "packageTypeCode": null,
  "packageTypeVersion": null,
  "grossWeight": null,
  "volume": null,
  "routing": [{
    "legSequence": 1,
    "portOfLoadingLocationId": null,
    "portOfLoadingUnLocode": null,
    "portOfLoadingVersion": null,
    "portOfDischargeLocationId": null,
    "portOfDischargeUnLocode": null,
    "portOfDischargeVersion": null
  }],
  "requestedDepartureDate": null,
  "selectedVoyage": null,
  "equipment": [{
    "equipmentTypeCode": null,
    "equipmentTypeVersion": null,
    "quantity": null,
    "equipmentId": null
  }],
  "currency": "USD",
  "cargoMode": "FCL_DRY",
  "reefer": false,
  "dangerousGoods": false
}
```

Partially supplied reference tuples or measure objects are malformed, not absent. The candidate above fingerprints exactly as shown: sorted object keys, preserved one-element arrays, and every null included.

## Save Processing Sequence

1. The form preserves values as entered and commits only governed options returned by the live option route. Advisory blur/save checks reject obvious invalid shapes and focus the linked error summary.
2. The browser creates or retains the U01 operation identity. It serializes decimal measures as strings, counts as JSON integers, optional absence as explicit nulls, and the fixed scope fields exactly.
3. The shell forwarder and Booking BFF perform the existing same-origin, session, body-bound, correlation, idempotency, and 2.5-second command behavior. They do not rename fields or decide completeness.
4. The API converts transport absence and text to the exact nullable candidate. It applies Unicode/text, count, decimal, date, tuple, array, fixed-value, and cross-field shape rules before any journal or Booking write. A malformed supplied value is rejected before C1.
5. Canonicalize the shape and compute the client-intent fingerprint, including all explicit nulls, before C1. Booking then authorizes `create` before protected record/provider lookup.
6. Resolve or insert the U01 operation binding and claim in C1 using the already computed fingerprint. Replays, mismatches, active claims, and terminal results follow U01 without provider work.
7. The claim owner groups every supplied governed reference by subset and role, then resolves it through the bounded Reference Data port. Each returned record must match the submitted identity/code/version, expected set and role, and active status. Voyage resolution continues through the U01 bounded voyage seam; U03 later owns its complete schedule classification.
8. Every post-C1 branch completes through a fenced C2 journal result. Invalid/stale/inactive/role/version/mismatch results store `REJECTED` with safe field errors; explicit subset unavailability proven not accepted stores `NOT_ACCEPTED`; malformed provider output stores `REJECTED` with `INSPECT`; fence loss commits nothing from the stale owner. None of these branches writes a Booking.
9. When every supplied value is valid and every supplied reference is verified, build semantic typed snapshots and ordered completeness reasons. The successful U01 C2 transaction fences the claim, then atomically persists the Booking snapshot, projection, completeness reasons, safe activity, and `SUCCEEDED` operation result.
10. Return the privacy-shaped canonical request projection. Success navigates to canonical Overview, consumes the one-time safe flash, focuses `h1#booking-record-title`, and reopens every accepted value from Booking persistence.

Text fallback: presentation values are retained locally; Booking first checks permission and shape, then re-resolves every supplied governed fact, then commits typed snapshots and completeness in the already approved fenced create transaction.

## Text Normalization

Text normalization is deterministic and shared by validation, persistence, response mapping, and fingerprinting:

1. Decode JSON as Unicode and reject invalid encoding.
2. Normalize to Unicode NFC.
3. Remove leading and trailing Unicode whitespace; preserve internal whitespace and letter case.
4. Reject any Unicode General Category `Cc` or `Cf` code point, including CR, LF, and tab. No client or service repairs a line separator into a space. The multiline control supports long soft-wrapped cargo text, but an authored hard line break is a linked validation error.
5. Measure length in Unicode code points after NFC and trimming, not UTF-16 code units or bytes.
6. `customerBookingReference` must contain 1 through 64 code points when present. `cargoDescription` must contain 1 through 500 code points when present.
7. Required text that normalizes to empty is absent and produces a completeness reason. Optional text is not part of U02's field dictionary.

The form may display a character count, but the server calculation is authoritative. No normalization changes internal case, transliterates characters, invents abbreviations, or hides provider identity.

## Exact Numeric Semantics

`grossWeight.value` and `volume.value` are JSON strings matching `^(?:0|[1-9][0-9]{0,17})(?:\.[0-9]{1,3})?$` before numeric precision enforcement. A leading plus sign, minus sign, exponent, thousands separator, leading decimal point, trailing decimal point, whitespace, `NaN`, and `Infinity` are invalid. After parsing as `BigDecimal`, precision must be at most 18, scale at most 3, and value greater than zero.

Canonical decimal serialization is `stripTrailingZeros().toPlainString()`, except that a whole value has no decimal point. Thus `052.500` is invalid because of its leading zero, while `52.500` is accepted and canonicalized to `52.5`. Fixed units are exactly `KGM` and `MTQ`; case variants are not silently repaired. Gross weight is required. Volume is either explicit null or one complete positive `MTQ` object.

`packageCount` and `equipment[0].quantity` are JSON integers, not strings or floating-point values. Package count is `1..999999`; equipment quantity is `1..9999`. JavaScript safe-integer checking occurs before transport, and the service parses exact integral types. No rounding or default is permitted.

## Reference Resolution and Snapshot Capture

| Semantic field | Expected subset/role | Command identity | Persisted minimum snapshot |
| --- | --- | --- | --- |
| Booking customer | `PARTY_CUSTOMER` | ID + version | `id`, provider code, display name, version, active status, source, role `BOOKING_CUSTOMER` |
| Shipper | `PARTY_SHIPPER` | ID + version | same typed party fields, role `SHIPPER` |
| Consignee | `PARTY_CONSIGNEE` | nullable ID + version | same typed party fields, role `CONSIGNEE`, or null |
| Notify party | `PARTY_NOTIFY` | nullable ID + version | same typed party fields, role `NOTIFY_PARTY`, or null |
| Commodity | `COMMODITY` | ID + code + version | typed commodity snapshot |
| Package type | `PACKAGE_TYPE` | ID + code + version | typed package-type snapshot |
| POL/POD | `LOCATION` | location ID + UN/LOCODE + version | typed location snapshot under POL or POD role |
| Voyage | bounded route-compatible voyage set | ID + version | U01 selected-voyage snapshot; derived schedule remains provider output |
| Equipment type | `EQUIPMENT_TYPE` | ISO type code + version | typed equipment-type snapshot; physical ID remains null |

The re-resolved provider record must agree with every supplied identity component. Booking stores no provider-specific open attributes, full record, credential, internal routing metadata, or master-data ownership. Display name is persisted only as accepted-revision evidence; subsequent selection-time reads still use Reference Data.

The exact browser-to-Booking-to-Reference Data mapping is:

| Browser `set` | Browser `role` | Booking internal set/role | Reference Data OHS `set` | OHS status in current executable | Booking semantic placement |
| --- | --- | --- | --- | --- | --- |
| `PARTY` | `BOOKING_CUSTOMER` | `PARTY_CUSTOMER` / `BOOKING_CUSTOMER` | `PARTY_CUSTOMER` | Existing | `bookingCustomer` |
| `PARTY` | `SHIPPER` | `PARTY_SHIPPER` / `SHIPPER` | `PARTY_SHIPPER` | Additive U02 Shared Platform contract | `shipper` |
| `PARTY` | `CONSIGNEE` | `PARTY_CONSIGNEE` / `CONSIGNEE` | `PARTY_CONSIGNEE` | Additive U02 Shared Platform contract | `consignee` |
| `PARTY` | `NOTIFY_PARTY` | `PARTY_NOTIFY` / `NOTIFY_PARTY` | `PARTY_NOTIFY` | Additive U02 Shared Platform contract | `notifyParty` |
| `COMMODITY` | null | `COMMODITY` | `COMMODITY` | Existing | `commodity` |
| `PACKAGE_TYPE` | null | `PACKAGE_TYPE` | `PACKAGE_TYPE` | Additive U02 Shared Platform contract | `packageType` |
| `LOCATION` | null | `LOCATION` | `LOCATION` | Existing | POL/POD role is supplied by the consuming field and stored only in Booking |
| `EQUIPMENT_TYPE` | null | `EQUIPMENT_TYPE` | `EQUIPMENT_TYPE` | Existing | `equipment[].equipmentType` |

The browser calls the Booking BFF with `set`, optional `role`, `query`, and `limit`. The BFF validates the tuple and forwards it without semantic renaming to the Booking facade. The facade converts the table row to the current Reference Data OHS call `GET /api/reference-options?set={ohsSet}&search={query}`; Reference Data does not receive POL/POD as a role because both are the same `LOCATION` master. The Booking field/controller applies `PORT_OF_LOADING` or `PORT_OF_DISCHARGE` only when storing the resolved snapshot.

Current OHS responses are a JSON list. The Booking adapter validates a configured maximum response bound, filters to active records, retains provider order, caps the list to the already validated browser `limit` (`1..50`, default `25`), converts each numeric provider version to a base-10 string, and wraps the result as `{items:[...]}`. An opaque string version is unchanged. A missing/invalid required version or malformed record makes the subset a contract failure; it is never synthesized. Search yielding no record is a successful empty `items` list.

The three party-role sets and `PACKAGE_TYPE` are explicit additive Reference Data/OHS enum and dataset changes owned by Shared Platform; U02 cannot simulate them from `PARTY_CUSTOMER`, a relationship attribute, or a copied list. Until released, their live U02 seam is BLOCKED. OHS `401/403` maps to existence-safe `ACCESS_DENIED`; timeout/`5xx` and an unavailable additive set map to public `REFERENCE_UNAVAILABLE` with subset/role and `RETRY`; malformed/list-over-bound/missing-version responses map to `REFERENCE_CONTRACT_ERROR` with `INSPECT`; successful empty results map to no-match. Raw provider errors are not forwarded.

Reference subset failure is atomic for the save attempt. A valid partial draft may omit an entire required reference and persist a missing reason. It may not supply an unverifiable selection and have Booking silently drop that selection or commit the rest as if save succeeded.

## Completeness Calculation

Completeness is calculated only after normalization and supplied-value validation. Reasons are stable, field-addressable, and ordered by the five approved form groups, then by field order within each group:

1. Booking and parties: booking customer, customer booking reference, shipper.
2. Cargo: cargo description, commodity, package count, package type, gross weight.
3. Route and schedule: POL, POD, requested departure, selected voyage. U03 may append schedule-authority reasons after the selected voyage.
4. Equipment request: equipment type, quantity. Physical assignment is not required.
5. Review and save contains no additional request facts.

Each reason is `{code, fieldPath, group, messageKey}`. U02 codes are `REQUIRED_VALUE_MISSING` and `REQUIRED_REFERENCE_MISSING`; invalid supplied values are command errors and do not become persisted completeness reasons. A complete request has an empty reason array and `requestCompleteness = COMPLETE`; otherwise it is `INCOMPLETE` and remains a readable draft. U05 re-evaluates current authoritative validity before any later lifecycle action.

## Canonical Fingerprint Extension

U02 extends the U01 request fingerprint rather than creating a second idempotency scheme. The collision-resistant digest covers a deterministic UTF-8 canonical serialization of:

- schema version and all U01 fields;
- normalized customer reference and cargo description;
- every party ID/version, including explicit null optional pairs;
- commodity and package-type ID/code/version;
- exact package count;
- canonical gross-weight decimal plus `KGM`;
- explicit null volume or canonical volume decimal plus `MTQ`;
- location IDs/codes/versions, voyage ID/version, and equipment type code/version;
- ordered arrays, explicit null initial `equipmentId`, and fixed USD/FCL-dry/false/false values.

Object keys are sorted, arrays preserve order, integers use base-10 form, decimals use the canonical plain-string rule, and text uses normalized values. Provider display labels, statuses, sources, derived schedule facts, correlation, operation identity, actor/tenant scope, and transport headers are excluded. Operation type and actor/tenant remain immutable journal bindings checked separately. A payload edit after a deterministic rejection creates a new operation identity; a pending or uncertain attempt retains its identity and original fingerprint.

## Success Projection and Reopen

The create success body and subsequent authorized reopen use the same normative projection. Versions are decimal or opaque provider versions transported as JSON strings; provider absence is explicit null only where the provider contract permits it. The complete shape is:

```json
{
  "bookingId": "booking-id",
  "bookingReference": "BKG-reference",
  "revision": 1,
  "status": "DRAFT",
  "request": {
    "bookingCustomerPartyId": "party-customer-id",
    "bookingCustomerPartyVersion": "17",
    "customerBookingReference": "ACME-PO-1042",
    "shipperPartyId": "party-shipper-id",
    "shipperPartyVersion": "8",
    "consigneePartyId": null,
    "consigneePartyVersion": null,
    "notifyPartyId": null,
    "notifyPartyVersion": null,
    "cargoDescription": "Machined steel components",
    "commodityId": "commodity-id",
    "commodityCode": "MACHINED_STEEL_COMPONENTS",
    "commodityVersion": "11",
    "packageCount": 120,
    "packageTypeId": "package-type-id",
    "packageTypeCode": "CT",
    "packageTypeVersion": "4",
    "grossWeight": { "value": "24500.125", "unit": "KGM" },
    "volume": { "value": "52.5", "unit": "MTQ" },
    "routing": [{
      "legSequence": 1,
      "portOfLoadingLocationId": "location-usnyc-id",
      "portOfLoadingUnLocode": "USNYC",
      "portOfLoadingVersion": "23",
      "portOfDischargeLocationId": "location-nlrtm-id",
      "portOfDischargeUnLocode": "NLRTM",
      "portOfDischargeVersion": "31"
    }],
    "requestedDepartureDate": "2026-08-20",
    "selectedVoyageSnapshot": {
      "voyageId": "voyage-id",
      "voyageVersion": "19",
      "voyageSource": "reference-data",
      "carrierVoyageNumber": "LC1042",
      "estimatedDepartureAt": "2026-08-23T14:00:00Z",
      "estimatedArrivalAt": "2026-09-04T07:00:00Z",
      "cargoCutoffAt": "2026-08-22T04:00:00Z",
      "documentationDeadlineAt": "2026-08-21T12:00:00Z"
    },
    "equipment": [{
      "equipmentTypeCode": "45G1",
      "equipmentTypeVersion": "7",
      "quantity": 3,
      "equipmentId": null
    }],
    "currency": "USD",
    "cargoMode": "FCL_DRY",
    "reefer": false,
    "dangerousGoods": false
  },
  "referenceSnapshots": {
    "bookingCustomer": { "id": "party-customer-id", "code": "ACME", "displayName": "ACME Ltd", "version": "17", "status": "ACTIVE", "source": "reference-data", "role": "BOOKING_CUSTOMER" },
    "shipper": { "id": "party-shipper-id", "code": "ACME-SHIP", "displayName": "ACME Shipping", "version": "8", "status": "ACTIVE", "source": "reference-data", "role": "SHIPPER" },
    "consignee": null,
    "notifyParty": null,
    "commodity": { "id": "commodity-id", "code": "MACHINED_STEEL_COMPONENTS", "displayName": "Machined steel components", "version": "11", "status": "ACTIVE", "source": "reference-data" },
    "packageType": { "id": "package-type-id", "code": "CT", "displayName": "Carton", "version": "4", "status": "ACTIVE", "source": "reference-data" },
    "routing": [{
      "legSequence": 1,
      "portOfLoading": { "id": "location-usnyc-id", "code": "USNYC", "displayName": "New York", "version": "23", "status": "ACTIVE", "source": "reference-data", "role": "PORT_OF_LOADING" },
      "portOfDischarge": { "id": "location-nlrtm-id", "code": "NLRTM", "displayName": "Rotterdam", "version": "31", "status": "ACTIVE", "source": "reference-data", "role": "PORT_OF_DISCHARGE" }
    }],
    "equipment": [{
      "lineSequence": 1,
      "equipmentType": { "id": "equipment-type-45g1-id", "code": "45G1", "displayName": "45 ft high cube dry", "version": "7", "status": "ACTIVE", "source": "reference-data" }
    }]
  },
  "requestCompleteness": "COMPLETE",
  "completenessReasons": [],
  "operation": { "operationId": "operation-uuid", "state": "SUCCEEDED", "recovery": "INSPECT", "correlationId": "safe-correlation-id" }
}
```

The create command continues to carry `selectedVoyage` identity/version as client intent. The response deliberately retains U01's additive `request.selectedVoyageSnapshot` property and exact U01 field names/null semantics; it is the accepted provider-resolved result used to rehydrate the voyage control and schedule evidence. U02 does not rename or move that property. `referenceSnapshots` adds only the other semantic reference families.

A minimal partial-draft projection uses the same complete envelope, exact nullable request, null snapshots, and all ordered missing reasons:

```json
{
  "bookingId": "booking-id",
  "bookingReference": "BKG-reference",
  "revision": 1,
  "status": "DRAFT",
  "request": {
    "bookingCustomerPartyId": null,
    "bookingCustomerPartyVersion": null,
    "customerBookingReference": null,
    "shipperPartyId": null,
    "shipperPartyVersion": null,
    "consigneePartyId": null,
    "consigneePartyVersion": null,
    "notifyPartyId": null,
    "notifyPartyVersion": null,
    "cargoDescription": null,
    "commodityId": null,
    "commodityCode": null,
    "commodityVersion": null,
    "packageCount": null,
    "packageTypeId": null,
    "packageTypeCode": null,
    "packageTypeVersion": null,
    "grossWeight": null,
    "volume": null,
    "routing": [{
      "legSequence": 1,
      "portOfLoadingLocationId": null,
      "portOfLoadingUnLocode": null,
      "portOfLoadingVersion": null,
      "portOfDischargeLocationId": null,
      "portOfDischargeUnLocode": null,
      "portOfDischargeVersion": null
    }],
    "requestedDepartureDate": null,
    "selectedVoyageSnapshot": null,
    "equipment": [{ "equipmentTypeCode": null, "equipmentTypeVersion": null, "quantity": null, "equipmentId": null }],
    "currency": "USD",
    "cargoMode": "FCL_DRY",
    "reefer": false,
    "dangerousGoods": false
  },
  "requestCompleteness": "INCOMPLETE",
  "completenessReasons": [
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "bookingCustomerPartyId", "group": "BOOKING_AND_PARTIES", "messageKey": "booking.customer.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "customerBookingReference", "group": "BOOKING_AND_PARTIES", "messageKey": "booking.customerReference.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "shipperPartyId", "group": "BOOKING_AND_PARTIES", "messageKey": "booking.shipper.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "cargoDescription", "group": "CARGO", "messageKey": "booking.cargoDescription.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "commodityId", "group": "CARGO", "messageKey": "booking.commodity.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "packageCount", "group": "CARGO", "messageKey": "booking.packageCount.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "packageTypeId", "group": "CARGO", "messageKey": "booking.packageType.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "grossWeight", "group": "CARGO", "messageKey": "booking.grossWeight.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "routing[0].portOfLoadingLocationId", "group": "ROUTE_AND_SCHEDULE", "messageKey": "booking.portOfLoading.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "routing[0].portOfDischargeLocationId", "group": "ROUTE_AND_SCHEDULE", "messageKey": "booking.portOfDischarge.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "requestedDepartureDate", "group": "ROUTE_AND_SCHEDULE", "messageKey": "booking.requestedDeparture.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "selectedVoyage.voyageId", "group": "ROUTE_AND_SCHEDULE", "messageKey": "booking.selectedVoyage.required" },
    { "code": "REQUIRED_REFERENCE_MISSING", "fieldPath": "equipment[0].equipmentTypeCode", "group": "EQUIPMENT_REQUEST", "messageKey": "booking.equipmentType.required" },
    { "code": "REQUIRED_VALUE_MISSING", "fieldPath": "equipment[0].quantity", "group": "EQUIPMENT_REQUEST", "messageKey": "booking.equipmentQuantity.required" }
  ],
  "referenceSnapshots": {
    "bookingCustomer": null,
    "shipper": null,
    "consignee": null,
    "notifyParty": null,
    "commodity": null,
    "packageType": null,
    "routing": [{ "legSequence": 1, "portOfLoading": null, "portOfDischarge": null }],
    "equipment": [{ "lineSequence": 1, "equipmentType": null }]
  },
  "operation": { "operationId": "operation-uuid", "state": "SUCCEEDED", "recovery": "INSPECT", "correlationId": "safe-correlation-id" }
}
```

Neither response reconstructs values from generic attributes.

## Failure and Recovery Model

| Condition | Mutation | Stable outcome |
| --- | --- | --- |
| Create denied | None, no provider call | Existence-safe `ACCESS_DENIED` |
| Missing required value | Valid partial may persist | Ordered completeness reason |
| Invalid supplied text/count/measure/fixed value | None | Linked `INVALID_*` field error |
| Reference identity/code/version/role/status mismatch after C1 | No Booking; fenced journal `REJECTED` | Linked `REFERENCE_INVALID`, `REFERENCE_STALE`, `REFERENCE_INACTIVE`, or `REFERENCE_ROLE_MISMATCH` |
| Required reference subset unavailable after C1 | No Booking; fenced journal `NOT_ACCEPTED` | Public `REFERENCE_UNAVAILABLE` with subset and safe correlation; U01 same-identity Retry grant |
| Same operation/same fingerprint | No duplicate | Recorded U01 result/recovery |
| Same operation/different fingerprint | None | `IDEMPOTENCY_CONFLICT` |
| Boundary outcome unknown | Unknown; never resubmit | U01 same-identity Refresh |
| Persistence failure before C2 | Rollback | U01 proven-not-accepted recovery when eligible |
| Success | One atomic draft result | Canonical Overview and exact reopen |

All errors expose a stable code, canonical field path when safe, recovery class, and correlation reference. Logs, traces, activity, and operation metadata must not contain raw customer references, party names/IDs beyond approved safe identifiers, or cargo descriptions.

## Transactions and Concurrency

U02 does not alter U01's two-transaction claim/fence protocol. Shape validation and fingerprinting occur before C1; provider reads occur after C1 and before a fenced result transaction. Successful C2 atomically writes the typed snapshot, query projection, completeness reasons, revision `1`, activity, and terminal operation result. Deterministic provider rejection uses a fenced journal-only C2 to store `REJECTED`; explicit unavailability proven not accepted uses it to store `NOT_ACCEPTED`; malformed provider output stores `REJECTED/INSPECT`. A lost fence lets the stale owner write neither Booking nor journal result. Persistence rollback leaves the owned claim nonterminal and follows U01 lease/status recovery. "No mutation" in failure tables means no Booking aggregate mutation; an owned post-C1 branch still records its required fenced journal result.

Reference snapshots represent one accepted revision. They are not updated by passive option refresh. U04 later performs same-record replacement under expected revision. U05 later persists validation evidence bound to the exact current revision and its own validation fingerprint.

## Verification Obligations

Construction must observe on the live Compose create/reopen path: every required field, populated and cleared optional parties, populated and null volume, maximum valid lengths/counts/precision, exact decimal strings and units, quantity `3`, null equipment ID, active role-specific references, stable snapshots, ordered partial-draft reasons, invalid-value atomic rejection, subset-unavailable preservation, one operation effect, privacy-safe correlation, and exact persistence/projection round-trip. The released W2-02 shared `TextArea`/counter is mandatory; its absence leaves the UI path and U02 DoD BLOCKED.

## Independent Review Resolution

The required architecture reviewer ran the configured maximum of two iterations. Iteration 1 identified pre-C1 fingerprint ordering, nullable partial-draft representation, same-identity retry, post-C1 journal disposition, response-contract, reference-state, text-normalization, and public reference-contract gaps; all were corrected before iteration 2. Iteration 2 confirmed those fixes and identified two remaining cross-artifact mismatches. The builder then resolved them without a prohibited third review iteration by retaining U01's exact `request.selectedVoyageSnapshot` response property and adding the normative browser/Booking/OHS mapping table, additive set ownership, limit/list mapping, location-role treatment, version conversion, and failure mapping. No open implementability finding is knowingly carried forward.

## Upstream Traceability

- `unit-of-work.md`: U02 complete commercial request vertical slice, shared-primitive dependency, and live round-trip DoD.
- `unit-of-work-story-map.md`: US-02 primary and U02 contributions to US-04, US-05, US-10, and US-11.
- `requirements.md`: FR-001 through FR-007, AC-001 through AC-003, and NFR-002 through NFR-010.
- `components.md`: one shared Booking form, typed aggregate, bounded reference ports, service-owned persistence, and UI ownership.
- `component-methods.md`: canonical route/form/create/status/reopen method contracts and focus behavior.
- `services.md`: server/client split, same-origin security boundary, provider degradation, transaction ownership, and Compose evidence.
