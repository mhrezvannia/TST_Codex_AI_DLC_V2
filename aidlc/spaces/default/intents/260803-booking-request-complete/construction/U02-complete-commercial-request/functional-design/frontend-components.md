# Frontend Components - U02 Complete Commercial Request

## Purpose and UI Authority

U02 extends the single Booking-owned `/booking/new` composition established by U01. It adds the complete five-group commercial dictionary, role-aware reference states, exact numeric/null handling, ordered completeness presentation, and full create/reopen evidence. It does not create a second form, edit the LinerCore master, write the proposed page override, modify `packages/ui`, or begin production construction.

This design consumes `unit-of-work.md`, `unit-of-work-story-map.md`, `requirements.md`, `components.md`, `component-methods.md`, and `services.md`, plus the approved Refined Mockups `mockups.md`, `interaction-spec.md`, `design-system-mapping.md`, and `accessibility-checklist.md`.

Authority is resolved in this order:

1. approved W3-04 requirements and scope;
2. security, privacy, accessibility, and technical standards;
3. LinerCore `MASTER.md` plus executable released `@erp/ui`;
4. an approved page override (none exists for W3-04; the proposal remains uncreated);
5. approved Refined Mockups interaction behavior;
6. advisory UI/UX Pro Max output.

The advisory search retained persistent labels, data-dense operational grouping, visible focus, linked errors, stable loading geometry, keyboard/reduced-motion support, responsive stacking, and server-first route loading. It rejected Enterprise Gateway/hero/sales framing, logo carousel, replacement palette or Fira typography, decorative charts/gradients, spinner-led blank loading, wizard conversion, and a dark-default theme. The design does not adopt generic Server Action advice where it would bypass the approved same-origin BFF/API/operation-status contracts.

## Current Shared-UI Findings

Codebase graph inspection of the current `packages/ui` index found no `TextArea` symbol or export. The executable styles cover `Input`, `Select`, Combobox, shared feedback, and `textarea` font inheritance, but that CSS mention is not a released primitive. U02 therefore remains BLOCKED for executable UI acceptance until W2-02 releases the approved multiline `TextArea` and count contract. Booking must not add a local `<textarea>` wrapper or substitute `Input`.

The executable `--erp-font-sans` currently names Inter/system UI, while approved W3-04 design artifacts describe IBM Plex Sans/system. Executable `@erp/ui` wins for a consumer: U02 uses the token and hardcodes neither family. This discrepancy is design-system drift for W2-02/UI Platform review; it is not repaired in W3-04.

## Component Composition

```text
BookingRequestPage (server, canonical /booking/new)
└── BookingRequestForm (focused client composition)
    ├── BookingErrors
    ├── ReferenceStatusRegion
    ├── BookingAndPartiesSection
    │   ├── ReferenceFieldState (booking customer)
    │   ├── CustomerBookingReferenceField
    │   ├── ReferenceFieldState (shipper)
    │   ├── ReferenceFieldState (optional consignee)
    │   └── ReferenceFieldState (optional notify party)
    ├── CargoSection
    │   ├── CargoDescriptionField (shared TextArea dependency)
    │   ├── ReferenceFieldState (commodity)
    │   ├── PackageCountField
    │   ├── ReferenceFieldState (package type)
    │   ├── GrossWeightField
    │   └── OptionalVolumeField
    ├── RouteAndScheduleSection (extends U01)
    │   ├── ReferenceFieldState (POL)
    │   ├── ReferenceFieldState (POD)
    │   ├── RequestedDepartureField
    │   ├── ReferenceFieldState (voyage)
    │   └── CarrierScheduleEvidence
    ├── EquipmentRequestSection (extends U01)
    │   ├── ReferenceFieldState (equipment type)
    │   ├── EquipmentQuantityField
    │   └── PhysicalAssignmentNotice
    └── BookingReviewAndSave
        ├── BookingCompletenessSummary
        ├── CommercialRequestReview
        ├── SaveStatusRegion / OperationStatusRefresh
        └── DirtyCancelControl / shared Dialog

BookingDetailPage (server, canonical Overview)
└── CompleteRequestSummary
    ├── CommercialPartiesSummary
    ├── CargoSummary
    ├── RouteAndScheduleSummary
    ├── EquipmentRequestSummary
    ├── BookingCompletenessSummary
    └── BookingNavigationNotice
```

Text fallback: the server page supplies authenticated shell context and bounded initial options; one focused client form owns transient input; the canonical detail page renders only authoritative persisted projections.

## `BookingRequestForm` Contract

| Aspect | Contract |
| --- | --- |
| Responsibility | Own transient create values, committed options, dirty state, advisory checks, U01 operation identity/recovery, and deterministic focus |
| Props | `mode: "create"`; `permissions`; fixed scope facts; bounded per-subset initial option states; optional validated `returnTo`; no correction revision in U02 |
| Field state | Exact strings for text/decimal controls, integer-entry strings until checked, committed governed option objects or null, explicit optional-null intent |
| Async state | Per-field discriminated reference state below, submit state from U01, server errors, completeness preview, safe correlation |
| Invariants | At most one submit; uncertain payload retains operation identity; changed deterministic payload rotates identity; unmatched search text never enters payload |
| Shared primitives | `Field`, `Input`, `Combobox`, `Button`, `Stack`, `Inline`, `Card`, `DefinitionList`, `StatusStrip`, `Skeleton`, `FailureState`, `Dialog`; released `TextArea` required |

The page remains a Server Component by default. Only the form controller, searchable reference interaction, dirty guard, operation refresh/retry controls, focus restoration, and one-time navigation notice require client state. Route-level loading uses the established App Router boundary and dimension-reserving Skeletons. Mutations continue through the approved same-origin Booking BFF because it owns session forwarding, stable errors, correlation, timeout, and operation recovery.

## Form Model and Serialization

| Visible field | Client state | Canonical payload path | Control and behavior |
| --- | --- | --- | --- |
| Booking customer | committed option/null | `bookingCustomerPartyId`, `bookingCustomerPartyVersion` | Shared Combobox; required role `PARTY_CUSTOMER` |
| Customer booking reference | string | `customerBookingReference` | Shared Input; NFC/trim; 1..64 code points |
| Shipper | committed option/null | `shipperPartyId`, `shipperPartyVersion` | Shared Combobox; required role `PARTY_SHIPPER` |
| Consignee optional | committed option/null | `consigneePartyId`, `consigneePartyVersion` | Shared Combobox; Clear serializes both null |
| Notify party optional | committed option/null | `notifyPartyId`, `notifyPartyVersion` | Shared Combobox; Clear serializes both null |
| Cargo description | string | `cargoDescription` | Released shared TextArea/count; 1..500 code points |
| Commodity | committed option/null | `commodityId`, `commodityCode`, `commodityVersion` | Shared Combobox; no free-text commit |
| Package count | string until checked | `packageCount` | Input with numeric input mode; serialize JSON integer only |
| Package type | committed option/null | `packageTypeId`, `packageTypeCode`, `packageTypeVersion` | Shared Combobox |
| Gross weight | decimal string | `grossWeight.value`, `.unit` | Input with decimal input mode; fixed visible KGM suffix |
| Volume optional | decimal string/empty | `volume` or `.value/.unit` | Empty serializes null; present uses fixed MTQ |
| POL | committed option/null | routing POL ID/UNLOCODE/version fields | Shared Combobox |
| POD | committed option/null | routing POD ID/UNLOCODE/version fields | Shared Combobox; must differ from POL |
| Requested departure | ISO local-date string | `requestedDepartureDate` | Input `type=date`; visible POL-local help |
| Voyage | committed option/null | `selectedVoyage.voyageId/.voyageVersion` | Shared Combobox; re-resolved by server |
| Equipment type | committed option/null | equipment type code/version | Shared Combobox |
| Quantity | string until checked | `equipment[0].quantity` | Integer input mode; serialize JSON integer only |
| Physical assignment | no control | `equipment[0].equipmentId` | Always null; truthful notice |

Text and decimal values remain strings in client state. The client never calls `Number`/`parseFloat` for measure authority. On submit it normalizes advisory text, rejects invalid count/decimal syntax, writes explicit optional nulls, preserves ordered arrays, and sends fixed scope facts. The service repeats every rule authoritatively.

## Section Contracts

### `BookingAndPartiesSection`

- Uses a semantic `fieldset`/`legend` or equivalent logical group heading.
- Booking customer and shipper are required for completeness; consignee and notify party are visibly marked optional.
- Each party call declares its exact role. An option valid for one role is not automatically selectable in another.
- Clear on an optional role removes both committed ID and version and serializes null/null.
- Provider failure disables only affected role controls and preserves committed/unrelated state.

### `CargoSection`

- `CargoDescriptionField` composes shared `Field` plus the released W2-02 `TextArea`/counter. Count guidance is visible and is not announced on every keystroke. Hard CR/LF/tab and every other `Cc`/`Cf` character are rejected without repair; the control supports long soft-wrapped text.
- Commodity and package type commit ID/code/version together.
- Package count is integer `1..999999`.
- Gross weight is a positive canonical decimal string with fixed KGM.
- Volume is optional; an empty control produces `volume:null`; a present value produces one value/MTQ object.
- Invalid entries remain visible after a failed action and are linked from the summary.

### `RouteAndScheduleSection`

U02 reuses the U01 component. POL/POD committed options now carry typed location ID/code/version. Changing POL/POD invalidates only dependent voyage state, not parties/cargo/equipment. Requested departure remains separate from read-only derived schedule. U03 later owns complete schedule degradation and provenance classification.

### `EquipmentRequestSection`

The section reuses U01 structure and adds the equipment-type provider version. It accepts one type and quantity `1..9999`, shows fixed USD/FCL dry/non-reefer/non-DG evidence, and never renders an equipment-ID input or placeholder container row.

### `BookingReviewAndSave`

The review follows the same semantic order as the form and distinguishes missing, supplied, and optional-null facts. It says "Not yet saved" until the authoritative response. Save draft is the sole primary create action; Cancel is secondary. At wide usable widths Review may occupy the approved rail; its DOM/focus position remains after the four input groups.

## `ReferenceFieldState` Contract

| Prop | Type | Meaning |
| --- | --- | --- |
| `set` | governed set enum | Party role, commodity, package type, location, voyage, or equipment type |
| `role` | semantic role/null | Required for party and location fields |
| `value` | committed option/null | Canonical ID/code/version only; query text is separate |
| `query` | string | Local search text; never canonical until commit |
| `state` | discriminated union below | One field's authority/selection state |
| `options` | bounded governed options | `id`, `code`, `displayName`, `version`, `status`; no open attributes used by Booking |
| `errorId` / `hintId` | stable IDs | Active `aria-describedby` targets |
| `onRetry` | explicit action | Re-requests only the affected subset |

Loading uses dimension-reserving Skeleton and Booking-owned `#reference-status`. No-match uses the shared Combobox `emptyLabel`. Long labels wrap within full Field width and the executable 240px vertical list cap. Booking retains at least 256px of document space below the last reference field. No automatic collision/flip or custom option-count announcement is claimed.

If save-time verification reports subset unavailable, the component retains the committed UI option visibly but marks it unverified and prevents optimistic navigation. It does not submit a second automatic save. The operator may refresh the subset, while the create command remains bound to its original identity and follows status/signed Retry recovery.

The exact state union is:

| `kind` | Required data | Selectability / action | Focus and announcement |
| --- | --- | --- | --- |
| `idle` | optional committed snapshot | Control available when query prerequisites hold | No announcement |
| `loading` | committed snapshot retained, request subset | Control truthfully busy/disabled | Passive `#reference-status`; no focus move |
| `available` | live options plus committed selectable option/null | Search and commit active matching option | Native Combobox semantics; no custom count announcement |
| `noMatch` | query, empty live result | No free-text commit; edit query | Visible `emptyLabel`; no focus move |
| `stale` | prior committed snapshot, current provider version/status | Prior evidence read-only; choose replacement or Refresh | Field described by status; invoked result focuses status |
| `inactive` | prior committed snapshot | Prior evidence read-only; choose active replacement | Same as stale |
| `unverified` | committed UI option, subset, safe correlation | Not canonical and save cannot succeed; Retry subset or command status as applicable | `#reference-status`; no passive focus theft |
| `roleInvalid` | committed option and expected role | Cannot save; replace option | Linked field error; failed save focuses summary |
| `versionInvalid` | committed option and current version evidence | Cannot save; refresh/replace | Linked field error/status |
| `unavailable` | subset and safe correlation, optional prior snapshot | Only affected control disabled; explicit option Retry | Passive message; invoked result focuses status |

Transitions preserve the committed accepted snapshot separately from the current searchable option. `loading -> available|noMatch|unavailable`; provider evidence may move a prior selection to `stale|inactive`; save verification may move a UI selection to `unverified|roleInvalid|versionInvalid`; a newly committed live option returns to `available`. No transition clears unrelated fields.

There are two distinct retries. **Option Retry** is a read-only re-fetch of one reference subset and carries no create operation identity. **Command Retry** follows a save whose server operation is stored/effectively `NOT_ACCEPTED`: the form retains the original create identity and exact canonical payload, obtains `expectedClaimVersion` and the signed retry grant from U01 status, and calls the dedicated retry route. It does not allocate a new operation identity. Only a deterministic rejection followed by a corrected payload rotates identity.

## Completeness and Error Presentation

`BookingCompletenessSummary` renders server-provided ordered reasons using safe labels and links. On the create form, an advisory preview may mirror the same order but is never presented as server authority. On canonical Overview, only persisted server completeness is shown.

`BookingErrors` has heading `#booking-errors` and `tabIndex=-1`. A failed save moves focus there. Each item links to the exact control ID. Server field paths are mapped explicitly; unknown paths fall into one safe form-level error and never expose raw JSON/provider data. Correcting a field removes only its obsolete client error; server errors clear on relevant edit/resubmit.

Missing required facts may appear as completeness after a successful partial save. Invalid supplied facts, reference mismatches, and unavailable supplied reference subsets are failed saves and remain errors/statuses on the form.

## Async, Save, and Cancel Behavior

| Event | Visible status | Focus |
| --- | --- | --- |
| Passive reference load/failure | `#reference-status`, exact affected subset | No focus theft |
| Explicit reference Retry result | Exact success/failure status | Focus `#reference-status` |
| Client/server field failure | Linked error summary plus inline errors | Focus `#booking-errors` |
| Save pending | Busy/disabled primary, polite "Saving draft" | Remain on primary |
| Outcome unknown/not accepted result | U01 `#save-status` and exact Refresh/Retry | Focus status after invoked result |
| Save success/replay | Canonical Overview, one-time safe notice | Focus `h1#booking-record-title` |
| Dirty Cancel | Shared discard Dialog | Dialog container on open; Cancel on safe close |

The form itself is never live. Repeated unchanged status is not re-announced. Duplicate click, Enter, and touch submit are disabled during pending. Refresh is read-only and preserves the operation identity. Retry is displayed only from the U01 signed, version-bound server result.

## API Integration

| Browser call | U02 behavior |
| --- | --- |
| `GET /api/booking/reference-options?set={set}&role={role?}&query={query}&limit={1..50}` | Same-origin, no-store, create-authorized bounded live options; BFF maps `query` to provider `search`, enum values explicitly, and versions to canonical strings; no copied masters |
| `GET /api/booking/voyage-options` | Reuses U01 route/date bounded voyage seam |
| `POST /api/booking/bookings/drafts` | Sends exact complete/partial canonical body and stable idempotency key; maps field/subset/policy/operation outcomes |
| `GET /api/booking/operations/{operationId}` | U01 non-mutating status Refresh |
| `POST /api/booking/operations/{operationId}/retry` | U01 signed/versioned proven-not-accepted retry with exact original canonical request |
| `GET /api/booking/bookings/{bookingId}` | Authorized server read of exact typed request/snapshots/completeness |

The browser contract uses `set`, optional `role`, `query`, and `limit`. Allowed sets are `PARTY`, `COMMODITY`, `PACKAGE_TYPE`, `LOCATION`, and `EQUIPMENT_TYPE`; party roles are `BOOKING_CUSTOMER`, `SHIPPER`, `CONSIGNEE`, and `NOTIFY_PARTY`. `query` is outer-trimmed, `0..100` code points, and is search-only; `limit` is integer `1..50`, default `25`. The BFF maps browser `query` to the current provider OHS parameter `search`, maps set/role enums explicitly, and forwards no unknown values. Provider numeric versions are range-checked and converted once to canonical base-10 JSON strings; opaque string versions remain unchanged.

| Browser tuple | Reference Data OHS set | Availability / role rule |
| --- | --- | --- |
| `PARTY + BOOKING_CUSTOMER` | `PARTY_CUSTOMER` | Existing; Booking stores booking-customer role |
| `PARTY + SHIPPER` | `PARTY_SHIPPER` | Additive Shared Platform set; cannot reuse customer set |
| `PARTY + CONSIGNEE` | `PARTY_CONSIGNEE` | Additive Shared Platform set |
| `PARTY + NOTIFY_PARTY` | `PARTY_NOTIFY` | Additive Shared Platform set |
| `COMMODITY + null` | `COMMODITY` | Existing |
| `PACKAGE_TYPE + null` | `PACKAGE_TYPE` | Additive Shared Platform set |
| `LOCATION + null` | `LOCATION` | Existing; POL/POD semantic role belongs to the consuming Booking field, not OHS |
| `EQUIPMENT_TYPE + null` | `EQUIPMENT_TYPE` | Existing |

The Booking facade calls the current OHS shape `GET /api/reference-options?set={ohsSet}&search={query}`. It validates the provider-list maximum, active status, and required version, preserves provider order, truncates to the browser `limit`, then wraps the list as `items`. The current OHS has no `role` or `limit` parameter, so neither is forwarded: role is resolved by the set mapping and limit is enforced in Booking. The additive set enums/data must be released by Shared Platform; their absence keeps the affected U02 path BLOCKED rather than falling back to attributes or another set.

The successful option envelope is `{ "items": [{ "id": "...", "code": "...", "displayName": "...", "version": "17", "status": "ACTIVE" }] }`. The browser receives no generic `attributes`. The public failure envelope is `{ "code": "REFERENCE_UNAVAILABLE", "subset": "PARTY", "role": "SHIPPER", "recovery": "RETRY", "correlationId": "..." }`; `role` is null for non-party sets. OHS `401/403` maps to safe `ACCESS_DENIED`; timeout/`5xx` or unavailable additive set maps to `REFERENCE_UNAVAILABLE`; malformed, over-bound, or missing-version output maps to `REFERENCE_CONTRACT_ERROR/INSPECT`; no-match is successful `items:[]`.

All server error mapping preserves stable code, canonical field path, recovery, and safe correlation while suppressing protected existence and raw payloads.

## Accessibility Contract

- One page `h1`; five logical groups; native form/fieldset/legend semantics where appropriate.
- Persistent labels and visible optional markers; placeholders are never labels.
- `aria-describedby` references only active hint/error IDs.
- Count guidance is visible but not a per-keystroke live announcement.
- Numeric inputs expose suitable input modes without relying on browser spinner controls.
- KGM/MTQ are part of accessible labels/help, not visual position alone.
- Shared Combobox keyboard/listbox contract is reused; unmatched text is not committed.
- Status uses text plus token/icon and remains understandable in forced colors.
- Focus uses the shared token behavior and is not clipped by rail/sticky containers.
- Dirty Dialog is named, trapped, safely dismissible, and restores focus.
- Mobile visual order equals DOM order; no positive `tabIndex` or fixed action overlay.

## Responsive Contract

| Width | Behavior |
| --- | --- |
| 375/390 | One column, 16px gutter, >=44px targets, inline Review, full-width in-flow actions, no page-level overflow |
| 768 | One column; two-up controls only if each remains >=260px; Review inline |
| 1024 | Main/rail only when main remains >=640px; otherwise stack; focus ring remains visible |
| 1440 | Approximately 760px form plus 280-340px review rail inside about 1180px content |
| 200% zoom | All labels, errors, reference lists, units, review, and actions reflow without loss |

Light/dark/forced-color/reduced-motion behavior comes from shared tokens and primitives. U02 introduces no local breakpoints, font, hardcoded colors, or motion system.

## UI Governance Conformance

The table reports current executable evidence, not design intention:

| Gate | Status | Evidence / blocker |
| --- | --- | --- |
| Canonical shell and `/booking/new` composition | BLOCKED | Functional design is specified; running U02 route evidence is not yet captured |
| Shared primitive reuse and no local fork | BLOCKED | `TextArea`/counter is absent from current `@erp/ui`; W2-02 release required |
| LinerCore token-only styling | BLOCKED | Must be observed in construction; executable font-token drift is recorded for UI Platform review |
| Reference authority and no copied masters | BLOCKED | Contract is specified; live role/subset evidence is not yet captured |
| Keyboard, focus, announcements, Dialog restore | BLOCKED | Requires browser/assistive evidence on running route |
| 375/390/768/1024/1440, zoom, themes, forced colors | BLOCKED | Required live screenshot/behavior matrix remains unexecuted |
| W3-04 master/page override edit | NOT APPLICABLE | No master or page override is authorized or created in this stage |
| Booking-local shared primitive | NOT APPLICABLE | Explicitly prohibited; no local substitute is designed |

## Verification Matrix

Construction must observe: keyboard-only full-field entry; shared multiline count behavior; present/cleared optional parties and volume; exact max-length, integer, decimal, unit, and null serialization; per-role options; subset loading/no-match/unavailable/retry; linked server errors; partial-draft completeness order; fully complete save/reopen; duplicate/uncertain operation recovery; dirty Cancel focus; privacy-safe status; 375/390/768/1024/1440; 200% zoom; light/dark/forced colors; reduced motion; no horizontal overflow; and one canonical route/BFF/service result on live Compose. A mock, stub, design checkbox, or screenshot without executable behavior is not PASS.

## Upstream Traceability

- `unit-of-work.md`: one shared create form, W2-02 TextArea gate, reference seam, and live U02 DoD.
- `unit-of-work-story-map.md`: US-02 primary plus U02 security and evidence contributions.
- `requirements.md`: FR-001 through FR-007, FR-024 through FR-030, AC-001 through AC-003, and NFR accessibility/privacy/testability.
- `components.md`: Booking server pages, focused client form, domain compositions, `@erp/ui` ownership, and outbound ports.
- `component-methods.md`: route rendering, form controller, reference options, create/status/reopen, focus, and error contracts.
- `services.md`: server/client split, same-origin BFF, service authorization, degradation, and live Compose evidence.
