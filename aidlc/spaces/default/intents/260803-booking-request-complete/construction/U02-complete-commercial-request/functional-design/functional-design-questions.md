# U02 Complete Commercial Request - Functional Design Questions

## Context and Authority

These questions apply only to `U02-complete-commercial-request`. They consume the approved `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, `services.md`, U01 Functional Design, and the binding Refined Mockups artifacts.

U02 extends the one canonical `/booking/new` form and U01 draft/status/persistence spine. It owns the approved commercial field dictionary, normalization/range/null semantics, role-aware reference options, create-path save/reopen round-trip, and owned/request completeness reasons. U03 still owns the complete voyage schedule matrix, U04 owns post-save correction and brownfield migration, and U05 owns the current-revision validation fingerprint. U02 must consume the released W2-02 shared `TextArea`/counter; if unavailable, executable U02 evidence remains BLOCKED and no Booking-local substitute is permitted.

UI authority remains approved W3-04 requirements and security/accessibility standards, LinerCore `MASTER.md` and executable `@erp/ui`, approved Refined Mockups, then advisory UI/UX Pro Max output. Retained advice is the data-dense five-group form, persistent labels, visible focus, linked error summary, stable async feedback, keyboard/reduced-motion behavior and responsive stacking. Marketing/hero framing, replacement font/palette, decorative effects, dark-default styling, spinner-led blank loading, a wizard, or a second form remain rejected.

Codebase graph evidence shows the current seam is substantially narrower than U02: shared `BookingDraftFields` contains `customerId`, route/voyage, equipment ID and commodity code; `validateBookingDraft` treats most strings as required and validates legacy UN/LOCODE/equipment-ID fields; current `ReferenceOption` exposes id/code/display/version plus open attributes. U02 must extend the typed U01 contract rather than grow this legacy attributes/free-text shape.

## Questions

### Q1. What is the canonical U02 command shape for governed references and persisted snapshots?

- A. Keep the approved field names explicit in the create command: party fields carry committed ID/version, commodity and package type carry approved ID/code/version, locations/voyage/equipment extend the U01 shapes; Booking re-resolves them at save and persists a typed minimum `GovernedReferenceSnapshot` (`id`, `code`, `displayName`, `version`, `status`, `source`) under each semantic field/role, with no generic attributes map (recommended)
- B. Send only display labels/codes from the browser and resolve IDs later
- C. Send the entire Reference Data provider record and persist it in Booking
- X. Other (please specify)

[Answer]: A - use explicit canonical command fields, re-resolve supplied governed selections at save, and persist only typed minimum reference snapshots under their semantic fields/roles; no provider-record copy or generic attributes map.

### Q2. If a required Reference Data subset is unavailable when a new or changed selection is saved, what may Booking persist?

- A. Preserve all form input and committed UI selection, return a stable subset-specific recoverable error, and do not persist the unverified selection as canonical; save can proceed only when every supplied canonical reference is re-resolved, while U05 later owns full current-revision validation (recommended)
- B. Persist the browser-supplied option snapshot as fully canonical without server re-resolution
- C. Persist typed free text as the canonical value and validate it later
- X. Other (please specify)

[Answer]: A - preserve the complete form and committed UI selection, return a stable subset-specific recoverable error, and do not persist an unverified selection as canonical; U05 retains full current-revision validation authority.

### Q3. How should optional consignee, notify party, and volume be represented in the canonical create contract and fingerprint?

- A. Require explicit keys: `consigneePartyId: null`, `notifyPartyId: null`, and `volume: null` when absent; when volume is present it is one `{ value, unit: "MTQ" }` object. Canonicalization never treats empty strings, omitted properties, and null as three different business values (recommended)
- B. Preserve omitted, empty string, and null as distinct persisted meanings
- C. Apply hidden default parties/zero volume when absent
- X. Other (please specify)

[Answer]: A - absent consignee, notify party, and volume are explicit nulls; present volume is one value/MTQ object, and empty strings or omitted properties do not create additional business meanings.

### Q4. What wire representation should preserve exact gross-weight and optional-volume precision across TypeScript, JSON, Java and PostgreSQL?

- A. Transport `grossWeight.value` and `volume.value` as canonical decimal strings, parse to `BigDecimal(18,3)` server-side, reject exponent notation/excess precision/non-positive values, and keep units fixed to `KGM`/`MTQ`; counts remain JSON integers (recommended)
- B. Transport measures as JavaScript numbers and round server-side
- C. Transport integer minor units using an invented scale
- X. Other (please specify)

[Answer]: A - transport measure values as canonical decimal strings, parse to BigDecimal with precision 18 and scale at most 3, reject exponent notation/excess precision/non-positive values, keep KGM/MTQ fixed, and keep counts as JSON integers.

### Q5. Which shape errors block a U02 draft save versus becoming completeness reasons?

- A. Reject any supplied invalid value or unverified supplied reference with linked field errors, but allow a valid partial draft whose missing required fields are explicit ordered completeness reasons; the U02 live DoD still proves a fully complete request round-trip (recommended)
- B. Reject every draft until all required U02 fields are present
- C. Persist invalid supplied values and defer all checking to U05
- X. Other (please specify)

[Answer]: A - invalid supplied values and unverified supplied references block save with linked errors; valid partial drafts may persist with ordered missing-field completeness reasons, while U02 live acceptance proves a fully complete round-trip.

## Ambiguity Check

All five `[Answer]:` tags are complete and the user approved the consolidated decisions. Artifact generation proceeded from that approval. No answer copies Reference Data masters, hides canonical facts in attributes, invents defaults, loses decimal precision, forks the shared form/TextArea, or pulls U04/U05 authority into U02.
